import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { computeInvoiceStatus } from '../../helpers/helper.helpers';
import { CreateClientInvoiceDto } from '../dtos/create-client-invoice.dto';
import { UpdateClientInvoiceDto } from '../dtos/update-client-invoice.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { BulkDeleteClientInvoicesDto } from '../dtos/bulk-delete-client-invoices.dto';
import { FilterClientInvoicesDto } from '../dtos/filter-client-invoices.dto';
import { ClientInvoiceResponse } from '../types/client-invoice-response.type';

const MAX_NUMBER_ATTEMPTS = 5;

@Injectable()
export class ClientInvoicesService {
  private readonly logger = new Logger(ClientInvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientInvoiceDto): Promise<ClientInvoiceResponse> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
      include: { clientInvoice: true },
    });

    if (!mission) {
      throw new HttpException('Mission not found', HttpStatus.BAD_REQUEST);
    }

    if (mission.clientInvoice) {
      throw new HttpException(
        'This mission already has a client invoice',
        HttpStatus.CONFLICT,
      );
    }

    return this.createForMission(
      mission.id,
      dto.issueDate,
      dto.dueDate ?? null,
    );
  }

  /**
   * Creates the invoice straight from the mission's own client/amount/
   * currency — used both by the admin-facing create() above and by
   * MissionsService when `autoInvoice` is checked at mission creation.
   */
  async createForMission(
    missionId: number,
    issueDate: Date,
    dueDate: Date | null,
  ): Promise<ClientInvoiceResponse> {
    const mission = await this.prisma.mission.findUniqueOrThrow({
      where: { id: missionId },
    });

    for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt++) {
      const invoiceNumber = await this.generateInvoiceNumber();

      try {
        return await this.prisma.clientInvoice.create({
          data: {
            missionId: mission.id,
            clientId: mission.clientId,
            invoiceNumber,
            amount: mission.clientPrice,
            currency: mission.currency,
            issueDate,
            dueDate,
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
        this.logger.error('Error creating client invoice:', error);
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error creating client invoice',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      'Could not generate a unique invoice number, please retry',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async findAll(
    filterParams: FilterClientInvoicesDto,
  ): Promise<{ data: ClientInvoiceResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        currency,
        clientId,
        missionId,
        showArchived,
      } = filterParams;

      const where: any = {
        deletedAt: showArchived ? { not: null } : null,
      };

      if (search) {
        where.invoiceNumber = { contains: search, mode: 'insensitive' };
      }
      if (status) where.status = status;
      if (currency) where.currency = currency;
      if (clientId) where.clientId = clientId;
      if (missionId) where.missionId = missionId;

      const [invoices, total] = await Promise.all([
        this.prisma.clientInvoice.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.clientInvoice.count({ where }),
      ]);

      return { data: invoices, total };
    } catch (error) {
      this.logger.error('Error fetching client invoices:', error);
      throw new HttpException(
        'Error fetching client invoices',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<ClientInvoiceResponse> {
    const invoice = await this.prisma.clientInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new HttpException('Client invoice not found', HttpStatus.NOT_FOUND);
    }

    return invoice;
  }

  async update(
    id: number,
    data: UpdateClientInvoiceDto,
  ): Promise<ClientInvoiceResponse> {
    const existing = await this.prisma.clientInvoice.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new HttpException('Client invoice not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.prisma.clientInvoice.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Error updating client invoice with id ${id}:`, error);
      throw new HttpException(
        'Error updating client invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePayment(
    id: number,
    dto: UpdatePaymentDto,
  ): Promise<ClientInvoiceResponse> {
    const invoice = await this.prisma.clientInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new HttpException('Client invoice not found', HttpStatus.NOT_FOUND);
    }

    const amount = Number(invoice.amount);
    const amountPaid = dto.amountPaid;
    const { status, paidAt } = computeInvoiceStatus(amount, amountPaid);

    return this.prisma.clientInvoice.update({
      where: { id },
      data: {
        amountPaid: new Prisma.Decimal(amountPaid),
        status,
        paidAt,
      },
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const invoice = await this.prisma.clientInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new HttpException('Client invoice not found', HttpStatus.NOT_FOUND);
    }

    if (invoice.deletedAt) {
      throw new HttpException(
        'Client invoice is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.clientInvoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Client invoice deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteClientInvoicesDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { clientInvoiceIds } = dto;

    const existing = await this.prisma.clientInvoice.findMany({
      where: { id: { in: clientInvoiceIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((i) => i.id);
    const notFoundIds = clientInvoiceIds.filter(
      (id) => !existingIds.includes(id),
    );

    const alreadyDeletedIds = existing
      .filter((i) => i.deletedAt !== null)
      .map((i) => i.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.clientInvoice.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} client invoices deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const invoice = await this.prisma.clientInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new HttpException('Client invoice not found', HttpStatus.NOT_FOUND);
    }

    if (!invoice.deletedAt) {
      throw new HttpException(
        'Client invoice is not deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.clientInvoice.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Client invoice restored successfully' };
  }

  async bulkRestore(clientInvoiceIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.clientInvoice.findMany({
      where: { id: { in: clientInvoiceIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((i) => i.id);
    const notFoundIds = clientInvoiceIds.filter(
      (id) => !existingIds.includes(id),
    );

    const notDeletedIds = existing
      .filter((i) => i.deletedAt === null)
      .map((i) => i.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.clientInvoice.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} client invoices restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const count = await this.prisma.clientInvoice.count({
      where: { invoiceNumber: { startsWith: prefix } },
    });

    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
}
