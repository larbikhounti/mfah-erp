import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineTypeDto } from '../dtos/create-machine-type.dto';
import { UpdateMachineTypeDto } from '../dtos/update-machine-type.dto';
import { BulkDeleteMachineTypesDto } from '../dtos/bulk-delete-machine-types.dto';
import { FilterMachineTypesDto } from '../dtos/filter/filter-machine-types.dto';
import { machineTypes } from '@prisma/client';
import { MachineTypeResponse } from '../types/machine-type-response.type';

@Injectable()
export class MachineTypesService {
  private readonly logger = new Logger(MachineTypesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filterParams: FilterMachineTypesDto,
  ): Promise<{ data: MachineTypeResponse[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, machineTypeId } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {
        deletedAt: null, // Only get non-deleted machine types
      };

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      if (machineTypeId) {
        where.id = machineTypeId;
      }

      // Execute queries in parallel
      const [machineTypes, total] = await Promise.all([
        this.prisma.machineTypes.findMany({
          where,
          skip: offset,
          take: limit,
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                machines: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.machineTypes.count({ where }),
      ]);

      // Transform the data to match the required format
      const formattedData: MachineTypeResponse[] = machineTypes.map(
        (machineType) => ({
          id: machineType.id,
          name: machineType.name,
          machinesCount: machineType._count.machines,
          createdAt: machineType.createdAt.toISOString(),
          updatedAt: machineType.updatedAt.toISOString(),
        }),
      );

      return {
        data: formattedData,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching machine types:', error);
      throw new HttpException(
        'Error fetching machine types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createMachineTypeByAdmin(
    createMachineTypeDto: CreateMachineTypeDto,
  ): Promise<MachineTypeResponse> {
    try {
      // Check if machine type with this name already exists
      const existingMachineType = await this.prisma.machineTypes.findUnique({
        where: { name: createMachineTypeDto.name },
      });

      if (existingMachineType && !existingMachineType.deletedAt) {
        throw new HttpException(
          'Machine type with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      // If the machine type exists but is soft deleted, restore it
      if (existingMachineType && existingMachineType.deletedAt) {
        const updatedMachineType = await this.prisma.machineTypes.update({
          where: { id: existingMachineType.id },
          data: {
            deletedAt: null,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                machines: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        });

        return {
          id: updatedMachineType.id,
          name: updatedMachineType.name,
          machinesCount: updatedMachineType._count.machines,
          createdAt: updatedMachineType.createdAt.toISOString(),
          updatedAt: updatedMachineType.updatedAt.toISOString(),
        };
      }

      // Create new machine type
      const machineType = await this.prisma.machineTypes.create({
        data: {
          name: createMachineTypeDto.name,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              machines: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        id: machineType.id,
        name: machineType.name,
        machinesCount: machineType._count.machines,
        createdAt: machineType.createdAt.toISOString(),
        updatedAt: machineType.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error creating machine type:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating machine type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMachineTypeById(id: number): Promise<MachineTypeResponse> {
    try {
      const machineType = await this.prisma.machineTypes.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              machines: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!machineType) {
        throw new HttpException('Machine type not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: machineType.id,
        name: machineType.name,
        machinesCount: machineType._count.machines,
        createdAt: machineType.createdAt.toISOString(),
        updatedAt: machineType.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching machine type by ID:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching machine type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMachineTypeByAdmin(
    id: number,
    updateMachineTypeDto: UpdateMachineTypeDto,
  ): Promise<MachineTypeResponse> {
    try {
      // Check if machine type exists
      const existingMachineType = await this.prisma.machineTypes.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingMachineType) {
        throw new HttpException('Machine type not found', HttpStatus.NOT_FOUND);
      }

      // Check if another machine type with the same name exists
      if (updateMachineTypeDto.name) {
        const duplicateCheck = await this.prisma.machineTypes.findFirst({
          where: {
            name: updateMachineTypeDto.name,
            id: { not: id },
            deletedAt: null,
          },
        });

        if (duplicateCheck) {
          throw new HttpException(
            'Machine type with this name already exists',
            HttpStatus.CONFLICT,
          );
        }
      }

      // Update machine type
      const updatedMachineType = await this.prisma.machineTypes.update({
        where: { id },
        data: {
          ...updateMachineTypeDto,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              machines: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        id: updatedMachineType.id,
        name: updatedMachineType.name,
        machinesCount: updatedMachineType._count.machines,
        createdAt: updatedMachineType.createdAt.toISOString(),
        updatedAt: updatedMachineType.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error('Error updating machine type:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating machine type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMachineTypeByAdmin(id: number): Promise<{ message: string }> {
    try {
      // Check if machine type exists
      const existingMachineType = await this.prisma.machineTypes.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingMachineType) {
        throw new HttpException('Machine type not found', HttpStatus.NOT_FOUND);
      }

      // Soft delete the machine type
      await this.prisma.machineTypes.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return { message: 'Machine type deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting machine type:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting machine type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDeleteMachineTypesByAdmin(
    bulkDeleteDto: BulkDeleteMachineTypesDto,
  ): Promise<{ message: string; deletedCount: number; notFound: number[] }> {
    try {
      const { machineTypeIds } = bulkDeleteDto;

      // Find existing machine types
      const existingMachineTypes = await this.prisma.machineTypes.findMany({
        where: {
          id: { in: machineTypeIds },
          deletedAt: null,
        },
        select: { id: true },
      });

      const existingIds = existingMachineTypes.map((mt) => mt.id);
      const notFound = machineTypeIds.filter((id) => !existingIds.includes(id));

      // Soft delete existing machine types
      if (existingIds.length > 0) {
        await this.prisma.machineTypes.updateMany({
          where: {
            id: { in: existingIds },
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      return {
        message: `${existingIds.length} machine types deleted successfully`,
        deletedCount: existingIds.length,
        notFound,
      };
    } catch (error) {
      this.logger.error('Error bulk deleting machine types:', error);
      throw new HttpException(
        'Error bulk deleting machine types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
