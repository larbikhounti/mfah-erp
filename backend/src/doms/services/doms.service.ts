import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomDto } from '../dtos/create-dom.dto';
import { UpdateDomDto } from '../dtos/update-dom.dto';
import { BulkDeleteDomsDto } from '../dtos/bulk-delete-doms.dto';
import { FilterDomsDto } from '../dtos/filter-doms.dto';
import { DomResponse } from '../types/dom-response.type';

@Injectable()
export class DomsService {
  private readonly logger = new Logger(DomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDomDto): Promise<DomResponse> {
    try {
      // Check if DOM with this name already exists
      const existingDom = await this.prisma.doms.findUnique({
        where: { name: data.name },
      });

      if (existingDom) {
        throw new HttpException(
          'DOM with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      const dom = await this.prisma.doms.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              Users: true,
              experiences: true,
              machines: true,
              tickets: true,
            },
          },
        },
      });

      return dom;
    } catch (error) {
      this.logger.error('Error creating DOM:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating DOM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterDomsDto,
  ): Promise<{ data: DomResponse[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, domId } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (domId) {
        where.id = domId;
      }

      // Execute queries in parallel
      const [doms, total] = await Promise.all([
        this.prisma.doms.findMany({
          where,
          skip: offset,
          take: limit,
          include: {
            _count: {
              select: {
                Users: true,
                experiences: true,
                machines: true,
                tickets: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.doms.count({ where }),
      ]);

      return { data: doms, total };
    } catch (error) {
      this.logger.error('Error finding DOMs:', error);
      throw new HttpException(
        'Error retrieving DOMs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<DomResponse> {
    try {
      const dom = await this.prisma.doms.findUnique({
        where: { id },
        include: {
          Users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          experiences: {
            select: {
              id: true,
              machineId: true,
              gameId: true,
            },
          },
          machines: {
            select: {
              id: true,
              name: true,
              machineTypeId: true,
            },
          },
          _count: {
            select: {
              Users: true,
              experiences: true,
              machines: true,
              tickets: true,
            },
          },
        },
      });

      if (!dom) {
        throw new HttpException('DOM not found', HttpStatus.NOT_FOUND);
      }

      return dom;
    } catch (error) {
      this.logger.error('Error finding DOM by id:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error retrieving DOM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, data: UpdateDomDto): Promise<DomResponse> {
    try {
      // Check if DOM exists
      const existingDom = await this.prisma.doms.findUnique({
        where: { id },
      });

      if (!existingDom) {
        throw new HttpException('DOM not found', HttpStatus.NOT_FOUND);
      }

      // If name is being updated, check if it's already taken by another DOM
      if (data.name && data.name !== existingDom.name) {
        const nameExists = await this.prisma.doms.findUnique({
          where: { name: data.name },
        });

        if (nameExists) {
          throw new HttpException(
            'DOM with this name already exists',
            HttpStatus.CONFLICT,
          );
        }
      }

      const dom = await this.prisma.doms.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              Users: true,
              experiences: true,
              machines: true,
              tickets: true,
            },
          },
        },
      });

      return dom;
    } catch (error) {
      this.logger.error('Error updating DOM:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating DOM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      // Check if DOM exists
      const existingDom = await this.prisma.doms.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              Users: true,
              experiences: true,
              machines: true,
              tickets: true,
            },
          },
        },
      });

      if (!existingDom) {
        throw new HttpException('DOM not found', HttpStatus.NOT_FOUND);
      }

      // Check if DOM has related records
      const hasRelatedRecords =
        existingDom._count.Users > 0 ||
        existingDom._count.experiences > 0 ||
        existingDom._count.machines > 0 ||
        existingDom._count.tickets > 0;

      if (hasRelatedRecords) {
        throw new HttpException(
          'Cannot delete DOM. It has related users, experiences, machines, or tickets.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.doms.delete({
        where: { id },
      });

      return { message: 'DOM deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting DOM:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting DOM',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDelete(
    bulkDeleteDto: BulkDeleteDomsDto,
  ): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    hasRelatedRecords: number[];
  }> {
    try {
      const { domIds } = bulkDeleteDto;

      // Check which DOMs exist and their related records
      const existingDoms = await this.prisma.doms.findMany({
        where: { id: { in: domIds } },
        select: {
          id: true,
          _count: {
            select: {
              Users: true,
              experiences: true,
              machines: true,
              tickets: true,
            },
          },
        },
      });

      const existingDomIds = existingDoms.map((dom) => dom.id);
      const notFoundIds = domIds.filter((id) => !existingDomIds.includes(id));

      // Filter out DOMs that have related records
      const domsWithRelatedRecords = existingDoms.filter(
        (dom) =>
          dom._count.Users > 0 ||
          dom._count.experiences > 0 ||
          dom._count.machines > 0 ||
          dom._count.tickets > 0,
      );

      const domIdsWithRelatedRecords = domsWithRelatedRecords.map(
        (dom) => dom.id,
      );
      const deletableIds = existingDomIds.filter(
        (id) => !domIdsWithRelatedRecords.includes(id),
      );

      // Delete DOMs that don't have related records
      const deleteResult = await this.prisma.doms.deleteMany({
        where: { id: { in: deletableIds } },
      });

      return {
        message: `Bulk delete completed. ${deleteResult.count} DOMs deleted successfully.`,
        deletedCount: deleteResult.count,
        notFound: notFoundIds,
        hasRelatedRecords: domIdsWithRelatedRecords,
      };
    } catch (error) {
      this.logger.error('Error bulk deleting DOMs:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error bulk deleting DOMs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
