import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineChairDto } from '../dtos/create-machine-chair.dto';
import { UpdateMachineChairDto } from '../dtos/update-machine-chair.dto';
import { BulkDeleteMachineChairsDto } from '../dtos/bulk-delete-machine-chairs.dto';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { machineChairs } from '@prisma/client';

@Injectable()
export class MachineChairsService {
  private readonly logger = new Logger(MachineChairsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMachineChairDto): Promise<string | Error> {
    try {
      await this.prisma.machineChairs.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return `Machine chair created successfully`;
    } catch (error) {
      console.error('Error creating machine chair:', error);
      return new HttpException('Error creating machine chair', 500);
    }
  }

  async findAll(
    filterParams: FilterParamsDto,
  ): Promise<{ data: any[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        machineId,
      } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {};

      if (search) {
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
      }

      if (status !== undefined) {
        where.status = status;
      }

      if (machineId) {
        where.machineId = machineId;
      }

      // Add deletedAt filter to exclude soft-deleted records
      where.deletedAt = null;

      const [machineChairs, total] = await Promise.all([
        this.prisma.machineChairs.findMany({
          where,
          skip: Number(offset),
          take: Number(limit),
          include: {
            machines: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.machineChairs.count({ where }),
      ]);

      return { data: machineChairs, total };
    } catch (error) {
      console.error('Error fetching machine chairs:', error);
      throw new HttpException('Error fetching machine chairs', 500);
    }
  }

  async findOne(id: number): Promise<machineChairs | null> {
    try {
      return await this.prisma.machineChairs.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          machines: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching machine chair:', error);
      throw new HttpException('Error fetching machine chair', 500);
    }
  }

  async update(
    id: number,
    data: UpdateMachineChairDto,
  ): Promise<string | Error> {
    try {
      await this.prisma.machineChairs.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return `Machine chair updated successfully`;
    } catch (error) {
      console.error('Error updating machine chair:', error);
      return new HttpException('Error updating machine chair', 500);
    }
  }

  async remove(id: number): Promise<string | Error> {
    try {
      await this.prisma.machineChairs.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return `Machine chair deleted successfully`;
    } catch (error) {
      console.error('Error deleting machine chair:', error);
      return new HttpException('Error deleting machine chair', 500);
    }
  }

  async bulkDelete(data: BulkDeleteMachineChairsDto): Promise<string | Error> {
    try {
      await this.prisma.machineChairs.updateMany({
        where: {
          id: {
            in: data.ids,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return `Machine chairs deleted successfully`;
    } catch (error) {
      console.error('Error bulk deleting machine chairs:', error);
      return new HttpException('Error bulk deleting machine chairs', 500);
    }
  }

  async findByMachineId(machineId: number): Promise<machineChairs[]> {
    try {
      return await this.prisma.machineChairs.findMany({
        where: {
          machineId,
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Error fetching machine chairs by machine ID:', error);
      throw new HttpException(
        'Error fetching machine chairs by machine ID',
        500,
      );
    }
  }
}
