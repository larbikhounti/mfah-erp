import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContractorTruckDto } from '../dtos/create-contractor-truck.dto';
import { UpdateContractorTruckDto } from '../dtos/update-contractor-truck.dto';
import { BulkDeleteContractorTrucksDto } from '../dtos/bulk-delete-contractor-trucks.dto';
import { FilterContractorTrucksDto } from '../dtos/filter-contractor-trucks.dto';
import { ContractorTruckResponse } from '../types/contractor-truck-response.type';

@Injectable()
export class ContractorTrucksService {
  private readonly logger = new Logger(ContractorTrucksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateContractorTruckDto,
  ): Promise<ContractorTruckResponse> {
    try {
      const subcontractor = await this.prisma.subcontractor.findUnique({
        where: { id: data.subcontractorId },
      });
      if (!subcontractor) {
        throw new HttpException(
          'Subcontractor not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existing = await this.prisma.contractorTruck.findUnique({
        where: { plateNumber: data.plateNumber },
      });
      if (existing) {
        throw new HttpException(
          'Contractor truck with this plate number already exists',
          HttpStatus.CONFLICT,
        );
      }

      return await this.prisma.contractorTruck.create({ data });
    } catch (error) {
      this.logger.error('Error creating contractor truck:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating contractor truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterContractorTrucksDto,
  ): Promise<{ data: ContractorTruckResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        subcontractorId,
        showArchived,
      } = filterParams;

      const where: any = {
        deletedAt: showArchived ? { not: null } : null,
      };

      if (search) {
        where.plateNumber = { contains: search, mode: 'insensitive' };
      }

      if (subcontractorId) {
        where.subcontractorId = subcontractorId;
      }

      const [contractorTrucks, total] = await Promise.all([
        this.prisma.contractorTruck.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.contractorTruck.count({ where }),
      ]);

      return { data: contractorTrucks, total };
    } catch (error) {
      this.logger.error('Error fetching contractor trucks:', error);
      throw new HttpException(
        'Error fetching contractor trucks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<ContractorTruckResponse> {
    const contractorTruck = await this.prisma.contractorTruck.findUnique({
      where: { id },
    });

    if (!contractorTruck) {
      throw new HttpException(
        'Contractor truck not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return contractorTruck;
  }

  async update(
    id: number,
    data: UpdateContractorTruckDto,
  ): Promise<ContractorTruckResponse> {
    try {
      const existing = await this.prisma.contractorTruck.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new HttpException(
          'Contractor truck not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (data.subcontractorId) {
        const subcontractor = await this.prisma.subcontractor.findUnique({
          where: { id: data.subcontractorId },
        });
        if (!subcontractor) {
          throw new HttpException(
            'Subcontractor not found',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      if (data.plateNumber && data.plateNumber !== existing.plateNumber) {
        const conflict = await this.prisma.contractorTruck.findUnique({
          where: { plateNumber: data.plateNumber },
        });

        if (conflict) {
          throw new HttpException(
            'Plate number already taken by another contractor truck',
            HttpStatus.CONFLICT,
          );
        }
      }

      return await this.prisma.contractorTruck.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(
        `Error updating contractor truck with id ${id}:`,
        error,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating contractor truck',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const contractorTruck = await this.prisma.contractorTruck.findUnique({
      where: { id },
    });

    if (!contractorTruck) {
      throw new HttpException(
        'Contractor truck not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (contractorTruck.deletedAt) {
      throw new HttpException(
        'Contractor truck is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.contractorTruck.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Contractor truck deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteContractorTrucksDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { contractorTruckIds } = dto;

    const existing = await this.prisma.contractorTruck.findMany({
      where: { id: { in: contractorTruckIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((t) => t.id);
    const notFoundIds = contractorTruckIds.filter(
      (id) => !existingIds.includes(id),
    );

    const alreadyDeletedIds = existing
      .filter((t) => t.deletedAt !== null)
      .map((t) => t.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.contractorTruck.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} contractor trucks deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const contractorTruck = await this.prisma.contractorTruck.findUnique({
      where: { id },
    });

    if (!contractorTruck) {
      throw new HttpException(
        'Contractor truck not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!contractorTruck.deletedAt) {
      throw new HttpException(
        'Contractor truck is not deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.contractorTruck.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Contractor truck restored successfully' };
  }

  async bulkRestore(contractorTruckIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.contractorTruck.findMany({
      where: { id: { in: contractorTruckIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((t) => t.id);
    const notFoundIds = contractorTruckIds.filter(
      (id) => !existingIds.includes(id),
    );

    const notDeletedIds = existing
      .filter((t) => t.deletedAt === null)
      .map((t) => t.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.contractorTruck.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} contractor trucks restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }
}
