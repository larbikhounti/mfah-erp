import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PermissionModule } from '@prisma/client';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { BulkDeleteClientsDto } from '../dtos/bulk-delete-clients.dto';
import { FilterClientsDto } from '../dtos/filter-clients.dto';
import { ClientsService } from '../services/clients.service';
import { AttachmentsService } from '../../attachments/services/attachments.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';

@ApiTags('clients')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'clients',
  version: '1',
})
export class ClientsController {
  constructor(
    private clientsService: ClientsService,
    private attachmentsService: AttachmentsService,
  ) {}

  @Get()
  @RequirePermission(PermissionModule.CLIENTS, 'read')
  @ApiOperation({ summary: 'Get all clients with filtering' })
  getAllClients(@Query() filterParams: FilterClientsDto) {
    return this.clientsService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.CLIENTS, 'read')
  @ApiOperation({ summary: 'Get client by ID' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getClientById(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 409,
    description: 'Client with this ICE already exists',
  })
  createClient(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update client by ID' })
  updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete clients by IDs' })
  bulkDeleteClients(@Body() dto: BulkDeleteClientsDto) {
    return this.clientsService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete client by ID' })
  deleteClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted client' })
  restoreClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.restore(id);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple clients' })
  bulkRestoreClients(@Body() body: { clientIds: number[] }) {
    return this.clientsService.bulkRestore(body.clientIds);
  }

  // === Attachments (contracts, bank docs, ICE certificate, etc. — the
  // uploader names each one via `label` so it stays recognizable later) ===

  @RequirePermission(PermissionModule.CLIENTS, 'read')
  @Get(':id/attachments')
  @ApiOperation({ summary: "List a client's attachments" })
  listAttachments(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findForClient(id);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'update')
  @Post('admin/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment for a client' })
  async uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('label') label?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!label?.trim()) {
      throw new BadRequestException('label is required');
    }
    await this.clientsService.findOne(id);
    return this.attachmentsService.uploadForClient(id, label.trim(), file);
  }

  @RequirePermission(PermissionModule.CLIENTS, 'update')
  @Delete('admin/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a client attachment' })
  deleteAttachment(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.attachmentsService.remove(attachmentId);
  }
}
