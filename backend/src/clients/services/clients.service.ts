import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { BulkDeleteClientsDto } from '../dtos/bulk-delete-clients.dto';
import { FilterClientsDto } from '../dtos/filter-clients.dto';
import { ClientResponse } from '../types/client-response.type';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClientDto): Promise<ClientResponse> {
    try {
      const existing = await this.prisma.client.findUnique({
        where: { ice: data.ice },
      });

      if (existing) {
        throw new HttpException(
          'Client with this ICE already exists',
          HttpStatus.CONFLICT,
        );
      }

      return await this.prisma.client.create({ data });
    } catch (error) {
      this.logger.error('Error creating client:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterClientsDto,
  ): Promise<{ data: ClientResponse[]; total: number }> {
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

      const [clients, total] = await Promise.all([
        this.prisma.client.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.client.count({ where }),
      ]);

      return { data: clients, total };
    } catch (error) {
      this.logger.error('Error fetching clients:', error);
      throw new HttpException(
        'Error fetching clients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<ClientResponse> {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }

    return client;
  }

  async update(id: number, data: UpdateClientDto): Promise<ClientResponse> {
    try {
      const existing = await this.prisma.client.findUnique({ where: { id } });

      if (!existing) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }

      if (data.ice && data.ice !== existing.ice) {
        const conflict = await this.prisma.client.findUnique({
          where: { ice: data.ice },
        });

        if (conflict) {
          throw new HttpException(
            'ICE already taken by another client',
            HttpStatus.CONFLICT,
          );
        }
      }

      return await this.prisma.client.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Error updating client with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }

    if (client.deletedAt) {
      throw new HttpException(
        'Client is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Client deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteClientsDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { clientIds } = dto;

    const existing = await this.prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((c) => c.id);
    const notFoundIds = clientIds.filter((id) => !existingIds.includes(id));

    const alreadyDeletedIds = existing
      .filter((c) => c.deletedAt !== null)
      .map((c) => c.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.client.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} clients deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }

    if (!client.deletedAt) {
      throw new HttpException('Client is not deleted', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.client.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Client restored successfully' };
  }

  async bulkRestore(clientIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((c) => c.id);
    const notFoundIds = clientIds.filter((id) => !existingIds.includes(id));

    const notDeletedIds = existing
      .filter((c) => c.deletedAt === null)
      .map((c) => c.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.client.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} clients restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }
}
