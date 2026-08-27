import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ExecutionMode, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { computeInvoiceStatus } from '../../helpers/helper.helpers';
import { CreateSubcontractorBillDto } from '../dtos/create-subcontractor-bill.dto';
import { UpdateSubcontractorBillDto } from '../dtos/update-subcontractor-bill.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { BulkDeleteSubcontractorBillsDto } from '../dtos/bulk-delete-subcontractor-bills.dto';
import { FilterSubcontractorBillsDto } from '../dtos/filter-subcontractor-bills.dto';
import { SubcontractorBillResponse } from '../types/subcontractor-bill-response.type';

const MAX_NUMBER_ATTEMPTS = 5;

@Injectable()
export class SubcontractorBillsService {
  private readonly logger = new Logger(SubcontractorBillsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateSubcontractorBillDto,
  ): Promise<SubcontractorBillResponse> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
      include: { subcontractorBill: true },
    });

    if (!mission) {
      throw new HttpException('Mission not found', HttpStatus.BAD_REQUEST);
    }

    if (
      mission.executionMode !== ExecutionMode.SUBCONTRACTED ||
      !mission.subcontractorId
    ) {
      throw new HttpException(
        'A subcontractor bill can only be created for a SUBCONTRACTED mission',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (mission.subcontractorBill) {
      throw new HttpException(
        'This mission already has a subcontractor bill',
        HttpStatus.CONFLICT,
      );
    }

    for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt++) {
      const billNumber = await this.generateBillNumber();

      try {
        return await this.prisma.subcontractorBill.create({
          data: {
            missionId: mission.id,
            subcontractorId: mission.subcontractorId,
            billNumber,
            amount: mission.subcontractorCost,
            currency: mission.currency,
            issueDate: dto.issueDate,
            dueDate: dto.dueDate ?? null,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          attempt < MAX_NUMBER_ATTEMPTS - 1
        ) {
          continue;
        }
        this.logger.error('Error creating subcontractor bill:', error);
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error creating subcontractor bill',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      'Could not generate a unique bill number, please retry',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async findAll(
    filterParams: FilterSubcontractorBillsDto,
  ): Promise<{ data: SubcontractorBillResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        currency,
        subcontractorId,
        missionId,
        showArchived,
      } = filterParams;

      const where: any = {
        deletedAt: showArchived ? { not: null } : null,
      };

      if (search) {
        where.billNumber = { contains: search, mode: 'insensitive' };
      }
      if (status) where.status = status;
      if (currency) where.currency = currency;
      if (subcontractorId) where.subcontractorId = subcontractorId;
      if (missionId) where.missionId = missionId;

      const [bills, total] = await Promise.all([
        this.prisma.subcontractorBill.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.subcontractorBill.count({ where }),
      ]);

      return { data: bills, total };
    } catch (error) {
      this.logger.error('Error fetching subcontractor bills:', error);
      throw new HttpException(
        'Error fetching subcontractor bills',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<SubcontractorBillResponse> {
    const bill = await this.prisma.subcontractorBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new HttpException(
        'Subcontractor bill not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return bill;
  }

  async update(
    id: number,
    data: UpdateSubcontractorBillDto,
  ): Promise<SubcontractorBillResponse> {
    const existing = await this.prisma.subcontractorBill.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HttpException(
        'Subcontractor bill not found',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      return await this.prisma.subcontractorBill.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.logger.error(
        `Error updating subcontractor bill with id ${id}:`,
        error,
      );
      throw new HttpException(
        'Error updating subcontractor bill',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePayment(
    id: number,
    dto: UpdatePaymentDto,
  ): Promise<SubcontractorBillResponse> {
    const bill = await this.prisma.subcontractorBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new HttpException(
        'Subcontractor bill not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const amount = Number(bill.amount);
    const amountPaid = dto.amountPaid;
    const { status, paidAt } = computeInvoiceStatus(amount, amountPaid);

    return this.prisma.subcontractorBill.update({
      where: { id },
      data: {
        amountPaid: new Prisma.Decimal(amountPaid),
        status,
        paidAt,
      },
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const bill = await this.prisma.subcontractorBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new HttpException(
        'Subcontractor bill not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (bill.deletedAt) {
      throw new HttpException(
        'Subcontractor bill is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.subcontractorBill.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Subcontractor bill deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteSubcontractorBillsDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { subcontractorBillIds } = dto;

    const existing = await this.prisma.subcontractorBill.findMany({
      where: { id: { in: subcontractorBillIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((b) => b.id);
    const notFoundIds = subcontractorBillIds.filter(
      (id) => !existingIds.includes(id),
    );

    const alreadyDeletedIds = existing
      .filter((b) => b.deletedAt !== null)
      .map((b) => b.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.subcontractorBill.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} subcontractor bills deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const bill = await this.prisma.subcontractorBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new HttpException(
        'Subcontractor bill not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!bill.deletedAt) {
      throw new HttpException(
        'Subcontractor bill is not deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.subcontractorBill.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Subcontractor bill restored successfully' };
  }

  async bulkRestore(subcontractorBillIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.subcontractorBill.findMany({
      where: { id: { in: subcontractorBillIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((b) => b.id);
    const notFoundIds = subcontractorBillIds.filter(
      (id) => !existingIds.includes(id),
    );

    const notDeletedIds = existing
      .filter((b) => b.deletedAt === null)
      .map((b) => b.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.subcontractorBill.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} subcontractor bills restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }

  private async generateBillNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `BILL-${year}-`;

    const count = await this.prisma.subcontractorBill.count({
      where: { billNumber: { startsWith: prefix } },
    });

    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
}
