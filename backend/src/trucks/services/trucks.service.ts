import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTruckDto } from '../dtos/create-truck.dto';
import { UpdateTruckDto } from '../dtos/update-truck.dto';
import { BulkDeleteTrucksDto } from '../dtos/bulk-delete-trucks.dto';
import { FilterTrucksDto } from '../dtos/filter-trucks.dto';
import { TruckResponse } from '../types/truck-response.type';

@Injectable()
export class TrucksService {
  private readonly logger = new Logger(TrucksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTruckDto): Promise<TruckResponse> {
    try {
      const existing = await this.prisma.truck.findUnique({
        where: { plateNumber: data.plateNumber },
      });

      if (existing) {
        throw new HttpException(
          'Truck with this plate number already exists',
          HttpStatus.CONFLICT,
        );
      }

      return await this.prisma.truck.create({ data });
    } catch (error) {
      this.logger.error('Error creating truck:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterTrucksDto,
  ): Promise<{ data: TruckResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        showArchived,
      } = filterParams;

      const where: any = {
        deletedAt: showArchived ? { not: null } : null,
      };

      if (search) {
        where.OR = [
          { plateNumber: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [trucks, total] = await Promise.all([
        this.prisma.truck.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.truck.count({ where }),
      ]);

      return { data: trucks, total };
    } catch (error) {
      this.logger.error('Error fetching trucks:', error);
      throw new HttpException(
        'Error fetching trucks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<TruckResponse> {
    const truck = await this.prisma.truck.findUnique({ where: { id } });

    if (!truck) {
      throw new HttpException('Truck not found', HttpStatus.NOT_FOUND);
    }

    return truck;
  }

  async update(id: number, data: UpdateTruckDto): Promise<TruckResponse> {
    try {
      const existing = await this.prisma.truck.findUnique({ where: { id } });

      if (!existing) {
        throw new HttpException('Truck not found', HttpStatus.NOT_FOUND);
      }

      if (data.plateNumber && data.plateNumber !== existing.plateNumber) {
        const conflict = await this.prisma.truck.findUnique({
          where: { plateNumber: data.plateNumber },
        });

        if (conflict) {
          throw new HttpException(
            'Plate number already taken by another truck',
            HttpStatus.CONFLICT,
          );
        }
      }

      return await this.prisma.truck.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Error updating truck with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const truck = await this.prisma.truck.findUnique({ where: { id } });

    if (!truck) {
      throw new HttpException('Truck not found', HttpStatus.NOT_FOUND);
    }

    if (truck.deletedAt) {
      throw new HttpException(
        'Truck is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.truck.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Truck deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteTrucksDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { truckIds } = dto;

    const existing = await this.prisma.truck.findMany({
      where: { id: { in: truckIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((t) => t.id);
    const notFoundIds = truckIds.filter((id) => !existingIds.includes(id));

    const alreadyDeletedIds = existing
      .filter((t) => t.deletedAt !== null)
      .map((t) => t.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.truck.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} trucks deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const truck = await this.prisma.truck.findUnique({ where: { id } });

    if (!truck) {
      throw new HttpException('Truck not found', HttpStatus.NOT_FOUND);
    }

    if (!truck.deletedAt) {
      throw new HttpException('Truck is not deleted', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.truck.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Truck restored successfully' };
  }

  async bulkRestore(truckIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.truck.findMany({
      where: { id: { in: truckIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((t) => t.id);
    const notFoundIds = truckIds.filter((id) => !existingIds.includes(id));

    const notDeletedIds = existing
      .filter((t) => t.deletedAt === null)
      .map((t) => t.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.truck.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} trucks restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }
}
