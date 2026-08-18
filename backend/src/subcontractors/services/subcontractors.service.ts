import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubcontractorDto } from '../dtos/create-subcontractor.dto';
import { UpdateSubcontractorDto } from '../dtos/update-subcontractor.dto';
import { BulkDeleteSubcontractorsDto } from '../dtos/bulk-delete-subcontractors.dto';
import { FilterSubcontractorsDto } from '../dtos/filter-subcontractors.dto';
import { SubcontractorResponse } from '../types/subcontractor-response.type';

@Injectable()
export class SubcontractorsService {
  private readonly logger = new Logger(SubcontractorsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSubcontractorDto): Promise<SubcontractorResponse> {
    try {
      const existing = await this.prisma.subcontractor.findUnique({
        where: { ice: data.ice },
      });

      if (existing) {
        throw new HttpException(
          'Subcontractor with this ICE already exists',
          HttpStatus.CONFLICT,
        );
      }

      return await this.prisma.subcontractor.create({ data });
    } catch (error) {
      this.logger.error('Error creating subcontractor:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating subcontractor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterSubcontractorsDto,
  ): Promise<{ data: SubcontractorResponse[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, showArchived } = filterParams;

      const where: any = {
        deletedAt: showArchived ? { not: null } : null,
      };

      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { ice: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [subcontractors, total] = await Promise.all([
        this.prisma.subcontractor.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.subcontractor.count({ where }),
      ]);

      return { data: subcontractors, total };
    } catch (error) {
      this.logger.error('Error fetching subcontractors:', error);
      throw new HttpException(
        'Error fetching subcontractors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<SubcontractorResponse> {
    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id },
    });

    if (!subcontractor) {
      throw new HttpException('Subcontractor not found', HttpStatus.NOT_FOUND);
    }

    return subcontractor;
  }

  async update(
    id: number,
    data: UpdateSubcontractorDto,
  ): Promise<SubcontractorResponse> {
    try {
      const existing = await this.prisma.subcontractor.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new HttpException(
          'Subcontractor not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (data.ice && data.ice !== existing.ice) {
        const conflict = await this.prisma.subcontractor.findUnique({
          where: { ice: data.ice },
        });

        if (conflict) {
          throw new HttpException(
            'ICE already taken by another subcontractor',
            HttpStatus.CONFLICT,
          );
        }
      }

      return await this.prisma.subcontractor.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Error updating subcontractor with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating subcontractor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id },
    });

    if (!subcontractor) {
      throw new HttpException('Subcontractor not found', HttpStatus.NOT_FOUND);
    }

    if (subcontractor.deletedAt) {
      throw new HttpException(
        'Subcontractor is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.subcontractor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Subcontractor deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteSubcontractorsDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { subcontractorIds } = dto;

    const existing = await this.prisma.subcontractor.findMany({
      where: { id: { in: subcontractorIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((s) => s.id);
    const notFoundIds = subcontractorIds.filter(
      (id) => !existingIds.includes(id),
    );

    const alreadyDeletedIds = existing
      .filter((s) => s.deletedAt !== null)
      .map((s) => s.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.subcontractor.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} subcontractors deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id },
    });

    if (!subcontractor) {
      throw new HttpException('Subcontractor not found', HttpStatus.NOT_FOUND);
    }

    if (!subcontractor.deletedAt) {
      throw new HttpException(
        'Subcontractor is not deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.subcontractor.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Subcontractor restored successfully' };
  }

  async bulkRestore(subcontractorIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.subcontractor.findMany({
      where: { id: { in: subcontractorIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((s) => s.id);
    const notFoundIds = subcontractorIds.filter(
      (id) => !existingIds.includes(id),
    );

    const notDeletedIds = existing
      .filter((s) => s.deletedAt === null)
      .map((s) => s.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.subcontractor.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} subcontractors restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }
}
