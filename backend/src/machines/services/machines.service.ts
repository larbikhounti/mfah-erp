import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from '../dtos/create-machine.dto';
import { UpdateMachineDto } from '../dtos/update-machine.dto';
import { BulkDeleteMachinesDto } from '../dtos/bulk-delete-machines.dto';
import { FilterMachinesDto } from '../dtos/filter/filter-machines.dto';
import { MachineResponse } from '../types/machine-response.type';

@Injectable()
export class MachinesService {
  private readonly logger = new Logger(MachinesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filterParams: FilterMachinesDto,
  ): Promise<{ data: MachineResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        machineId,
        machineTypeId,
        domeId,
        showArchived,
      } = filterParams;

      // Build the where clause based on filter parameters
            const where: any = {
        
      };

      if (!showArchived) {
        where.deletedAt = null;
      }else {
        where.deletedAt = { not: null };
      }

      if (search) {
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
      }

      if (machineId) {
        where.id = machineId;
      }

      if (machineTypeId) {
        where.machineTypeId = machineTypeId;
      }

      if (domeId) {
        where.domeId = domeId;
      }

      if (status) {
        where.status = status;
      }

      // Execute queries in parallel
      const [machines, total] = await Promise.all([
        this.prisma.machines.findMany({
          where,
          skip: offset,
          take: limit,
          select: {
            id: true,
            name: true,
            alias: true,
            status: true,
            machineTypeId: true,
            domeId: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            machineTypes: {
              select: {
                id: true,
                name: true,
              },
            },
            doms: {
              select: {
                id: true,
                name: true,
              },
            },
            machineChairs: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                name: true,
                status: true,
              },
              orderBy: {
                id: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.machines.count({ where }),
      ]);

      // Transform the data to match the required format
      const formattedData: MachineResponse[] = machines.map((machine) => ({
        id: machine.id,
        name: machine.name,
        alias: machine.alias,
        status: machine.status,
        machineTypeId: machine.machineTypeId,
        machineType: machine.machineTypes?.name || null,
        domeId: machine.domeId,
        dome: machine.doms?.name || null,
        chairsCount: machine.machineChairs.length,
        chairs: machine.machineChairs,
        createdAt: machine.createdAt.toISOString(),
        updatedAt: machine.updatedAt.toISOString(),
        deletedAt: machine.deletedAt?.toISOString() || null,
      }));

      return {
        data: formattedData,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching machines:', error);
      throw new HttpException(
        'Error fetching machines',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createMachineByAdmin(data: CreateMachineDto): Promise<MachineResponse> {
    try {
      // Check if machine with this name already exists
      const existingMachine = await this.prisma.machines.findFirst({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (existingMachine) {
        throw new HttpException(
          'Machine with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      // Check if machine with this alias already exists
      const existingAlias = await this.prisma.machines.findFirst({
        where: {
          alias: data.alias,
          deletedAt: null,
        },
      });

      if (existingAlias) {
        throw new HttpException(
          'Machine with this alias already exists',
          HttpStatus.CONFLICT,
        );
      }

      // Validate machineTypeId if provided
      if (data.machineTypeId) {
        const machineType = await this.prisma.machineTypes.findFirst({
          where: {
            id: data.machineTypeId,
            deletedAt: null,
          },
        });

        if (!machineType) {
          throw new HttpException(
            'Machine type not found',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validate domeId if provided
      if (data.domeId) {
        const dome = await this.prisma.doms.findFirst({
          where: {
            id: data.domeId,
            deletedAt: null,
          },
        });

        if (!dome) {
          throw new HttpException('DOM not found', HttpStatus.BAD_REQUEST);
        }
      }

      const machine = await this.prisma.machines.create({
        data: {
          name: data.name,
          alias: data.alias,
          status: data.status || 'active',
          machineTypeId: data.machineTypeId,
          domeId: data.domeId || null,
        },
        include: {
          machineTypes: {
            select: {
              id: true,
              name: true,
            },
          },
          doms: {
            select: {
              id: true,
              name: true,
            },
          },
          machineChairs: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

      // Create chairs if chairsNumber is provided
      if (data.chairsNumber && data.chairsNumber > 0) {
        const chairsToCreate = [];
        for (let i = 1; i <= data.chairsNumber; i++) {
          chairsToCreate.push({
            name: `${machine.name} - Chair ${i}`,
            status: 0, // 0 = available, 1 = maintenance
            machineId: machine.id,
          });
        }

        await this.prisma.machineChairs.createMany({
          data: chairsToCreate,
        });

        // Fetch the created chairs to include in response
        const createdChairs = await this.prisma.machineChairs.findMany({
          where: {
            machineId: machine.id,
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            status: true,
          },
          orderBy: {
            id: 'asc',
          },
        });

        return {
          id: machine.id,
          name: machine.name,
          alias: machine.alias,
          status: machine.status,
          machineTypeId: machine.machineTypeId,
          machineType: machine.machineTypes?.name || null,
          domeId: machine.domeId,
          dome: machine.doms?.name || null,
          chairsCount: createdChairs.length,
          chairs: createdChairs,
          createdAt: machine.createdAt.toISOString(),
          updatedAt: machine.updatedAt.toISOString(),
        };
      }

      return {
        id: machine.id,
        name: machine.name,
        alias: machine.alias,
        status: machine.status,
        machineTypeId: machine.machineTypeId,
        machineType: machine.machineTypes?.name || null,
        domeId: machine.domeId,
        dome: machine.doms?.name || null,
        chairsCount: machine.machineChairs.length,
        chairs: machine.machineChairs,
        createdAt: machine.createdAt.toISOString(),
        updatedAt: machine.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error creating machine:', error);
      throw new HttpException(
        'Error creating machine',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMachineById(id: number): Promise<MachineResponse> {
    try {
      const machine = await this.prisma.machines.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          machineTypes: {
            select: {
              id: true,
              name: true,
            },
          },
          doms: {
            select: {
              id: true,
              name: true,
            },
          },
          machineChairs: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

      if (!machine) {
        throw new HttpException('Machine not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: machine.id,
        name: machine.name,
        alias: machine.alias,
        status: machine.status,
        machineTypeId: machine.machineTypeId,
        machineType: machine.machineTypes?.name || null,
        domeId: machine.domeId,
        dome: machine.doms?.name || null,
        chairsCount: machine.machineChairs.length,
        chairs: machine.machineChairs,
        createdAt: machine.createdAt.toISOString(),
        updatedAt: machine.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error fetching machine:', error);
      throw new HttpException(
        'Error fetching machine',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateMachineByAdmin(
    id: number,
    data: UpdateMachineDto,
  ): Promise<MachineResponse> {
    try {
      // Check if machine exists
      const existingMachine = await this.prisma.machines.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingMachine) {
        throw new HttpException('Machine not found', HttpStatus.NOT_FOUND);
      }

      // Check if name is being updated and if it conflicts with existing machine
      if (data.name && data.name !== existingMachine.name) {
        const nameConflict = await this.prisma.machines.findFirst({
          where: {
            name: data.name,
            deletedAt: null,
            NOT: {
              id: id,
            },
          },
        });

        if (nameConflict) {
          throw new HttpException(
            'Machine name already taken by another machine',
            HttpStatus.CONFLICT,
          );
        }
      }

      // Check if alias is being updated and if it conflicts with existing machine
      if (data.alias && data.alias !== existingMachine.alias) {
        const aliasConflict = await this.prisma.machines.findFirst({
          where: {
            alias: data.alias,
            deletedAt: null,
            NOT: {
              id: id,
            },
          },
        });

        if (aliasConflict) {
          throw new HttpException(
            'Machine alias already taken by another machine',
            HttpStatus.CONFLICT,
          );
        }
      }

      // Validate machineTypeId if provided
      if (data.machineTypeId) {
        const machineType = await this.prisma.machineTypes.findFirst({
          where: {
            id: data.machineTypeId,
            deletedAt: null,
          },
        });

        if (!machineType) {
          throw new HttpException(
            'Machine type not found',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validate domeId if provided
      if (data.domeId) {
        const dome = await this.prisma.doms.findFirst({
          where: {
            id: data.domeId,
            deletedAt: null,
          },
        });

        if (!dome) {
          throw new HttpException('DOM not found', HttpStatus.BAD_REQUEST);
        }
      }

      const machine = await this.prisma.machines.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.alias && { alias: data.alias }),
          ...(data.status && { status: data.status }),
          ...(data.machineTypeId !== undefined && {
            machineTypeId: data.machineTypeId,
          }),
          ...(data.domeId !== undefined && { domeId: data.domeId }),
        },
        include: {
          machineTypes: {
            select: {
              id: true,
              name: true,
            },
          },
          doms: {
            select: {
              id: true,
              name: true,
            },
          },
          machineChairs: {
            where: {
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              status: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
        },
      });

      return {
        id: machine.id,
        name: machine.name,
        alias: machine.alias,
        status: machine.status,
        machineTypeId: machine.machineTypeId,
        machineType: machine.machineTypes?.name || null,
        domeId: machine.domeId,
        dome: machine.doms?.name || null,
        chairsCount: machine.machineChairs.length,
        chairs: machine.machineChairs,
        createdAt: machine.createdAt.toISOString(),
        updatedAt: machine.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error updating machine:', error);
      throw new HttpException(
        'Error updating machine',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMachineByAdmin(id: number): Promise<{ message: string }> {
    try {
      const machine = await this.prisma.machines.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!machine) {
        throw new HttpException('Machine not found', HttpStatus.NOT_FOUND);
      }

      // Soft delete the machine
      await this.prisma.machines.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return { message: 'Machine deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error deleting machine:', error);
      throw new HttpException(
        'Error deleting machine',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDeleteMachinesByAdmin(data: BulkDeleteMachinesDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
  }> {
    try {
      const { machineIds } = data;

      // Find existing machines
      const existingMachines = await this.prisma.machines.findMany({
        where: {
          id: {
            in: machineIds,
          },
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      const existingIds = existingMachines.map((machine) => machine.id);
      const notFound = machineIds.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        throw new HttpException(
          'No machines found with the provided IDs',
          HttpStatus.NOT_FOUND,
        );
      }

      // Soft delete existing machines
      await this.prisma.machines.updateMany({
        where: {
          id: {
            in: existingIds,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        message: `${existingIds.length} machine(s) deleted successfully`,
        deletedCount: existingIds.length,
        notFound,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error bulk deleting machines:', error);
      throw new HttpException(
        'Error bulk deleting machines',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const machine = await this.prisma.machines.findUnique({
        where: { id },
      });

      if (!machine) {
        throw new HttpException('Machine not found', HttpStatus.NOT_FOUND);
      }

      if (!machine.deletedAt) {
        throw new HttpException(
          'Machine is not deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.machines.update({
        where: { id },
        data: { deletedAt: null },
      });

      return { message: 'Machine restored successfully' };
    } catch (error) {
      this.logger.error(`Error restoring machine with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error restoring machine',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkRestore(machineIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    try {
      const existingMachines = await this.prisma.machines.findMany({
        where: { id: { in: machineIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingMachineIds = existingMachines.map((machine) => machine.id);
      const notFoundIds = machineIds.filter(
        (id) => !existingMachineIds.includes(id),
      );

      const notDeletedMachines = existingMachines.filter(
        (machine) => machine.deletedAt === null,
      );
      const notDeletedIds = notDeletedMachines.map((machine) => machine.id);

      const restorableIds = existingMachineIds.filter(
        (id) => !notDeletedIds.includes(id),
      );

      const restoreResult = await this.prisma.machines.updateMany({
        where: { id: { in: restorableIds } },
        data: { deletedAt: null },
      });

      return {
        message: `Bulk restore completed. ${restoreResult.count} machines restored successfully.`,
        restoredCount: restoreResult.count,
        notFound: notFoundIds,
        notDeleted: notDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error bulk restoring machines:', error);
      throw new HttpException(
        'Error bulk restoring machines',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
