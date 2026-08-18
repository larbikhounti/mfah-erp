import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from '../dtos/create-driver.dto';
import { UpdateDriverDto } from '../dtos/update-driver.dto';
import { BulkDeleteDriversDto } from '../dtos/bulk-delete-drivers.dto';
import { FilterDriversDto } from '../dtos/filter-drivers.dto';
import { DriverResponse } from '../types/driver-response.type';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDriverDto): Promise<DriverResponse> {
    try {
      const existing = await this.prisma.driver.findUnique({
        where: { cin: data.cin },
      });

      if (existing) {
        throw new HttpException(
          'Driver with this CIN already exists',
          HttpStatus.CONFLICT,
        );
      }

      return await this.prisma.driver.create({ data });
    } catch (error) {
      this.logger.error('Error creating driver:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating driver',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterDriversDto,
  ): Promise<{ data: DriverResponse[]; total: number }> {
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
          { fullName: { contains: search, mode: 'insensitive' } },
          { cin: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [drivers, total] = await Promise.all([
        this.prisma.driver.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.driver.count({ where }),
      ]);

      return { data: drivers, total };
    } catch (error) {
      this.logger.error('Error fetching drivers:', error);
      throw new HttpException(
        'Error fetching drivers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<DriverResponse> {
    const driver = await this.prisma.driver.findUnique({ where: { id } });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    return driver;
  }

  async update(id: number, data: UpdateDriverDto): Promise<DriverResponse> {
    try {
      const existing = await this.prisma.driver.findUnique({ where: { id } });

      if (!existing) {
        throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
      }

      if (data.cin && data.cin !== existing.cin) {
        const conflict = await this.prisma.driver.findUnique({
          where: { cin: data.cin },
        });

        if (conflict) {
          throw new HttpException(
            'CIN already taken by another driver',
            HttpStatus.CONFLICT,
          );
        }
      }

      return await this.prisma.driver.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Error updating driver with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating driver',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const driver = await this.prisma.driver.findUnique({ where: { id } });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    if (driver.deletedAt) {
      throw new HttpException(
        'Driver is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Driver deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteDriversDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { driverIds } = dto;

    const existing = await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((d) => d.id);
    const notFoundIds = driverIds.filter((id) => !existingIds.includes(id));

    const alreadyDeletedIds = existing
      .filter((d) => d.deletedAt !== null)
      .map((d) => d.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.driver.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} drivers deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const driver = await this.prisma.driver.findUnique({ where: { id } });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    if (!driver.deletedAt) {
      throw new HttpException('Driver is not deleted', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.driver.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Driver restored successfully' };
  }

  async bulkRestore(driverIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((d) => d.id);
    const notFoundIds = driverIds.filter((id) => !existingIds.includes(id));

    const notDeletedIds = existing
      .filter((d) => d.deletedAt === null)
      .map((d) => d.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.driver.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} drivers restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }
}
