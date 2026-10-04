import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { AttachmentCategory, AttachmentOwnerType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LocalFileStorageService } from './local-file-storage.service';
import { AttachmentResponse } from '../types/attachment-response.type';

export interface UploadedFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

/**
 * Backs the single, unified `Attachment` table shared by Trucks, Drivers,
 * Clients, Subcontractors, invoices/bills, Missions and FuelEntries. Every upload carries a `label` — a
 * human-chosen name the uploader is responsible for picking so the file is
 * recognizable later; there's no separate per-owner-type table for special
 * categories (e.g. contracts) — labeling is on the uploader, not the schema.
 */
@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalFileStorageService,
  ) {}

  uploadForTruck(truckId: number, label: string, file: UploadedFileInput) {
    return this.upload(
      AttachmentOwnerType.TRUCK,
      { truckId },
      label,
      file,
      'trucks',
    );
  }

  uploadForDriver(driverId: number, label: string, file: UploadedFileInput) {
    return this.upload(
      AttachmentOwnerType.DRIVER,
      { driverId },
      label,
      file,
      'drivers',
    );
  }

  uploadForClient(clientId: number, label: string, file: UploadedFileInput) {
    return this.upload(
      AttachmentOwnerType.CLIENT,
      { clientId },
      label,
      file,
      'clients',
    );
  }

  uploadForSubcontractor(
    subcontractorId: number,
    label: string,
    file: UploadedFileInput,
  ) {
    return this.upload(
      AttachmentOwnerType.SUBCONTRACTOR,
      { subcontractorId },
      label,
      file,
      'subcontractors',
    );
  }

  uploadForClientInvoice(
    clientInvoiceId: number,
    label: string,
    file: UploadedFileInput,
  ) {
    return this.upload(
      AttachmentOwnerType.CLIENT_INVOICE,
      { clientInvoiceId },
      label,
      file,
      'client-invoices',
    );
  }

  uploadForSubcontractorBill(
    subcontractorBillId: number,
    label: string,
    file: UploadedFileInput,
  ) {
    return this.upload(
      AttachmentOwnerType.SUBCONTRACTOR_BILL,
      { subcontractorBillId },
      label,
      file,
      'subcontractor-bills',
    );
  }

  /** `category` tags files the app has rules about (CMR, odometer photo). */
  uploadForMission(
    missionId: number,
    label: string,
    file: UploadedFileInput,
    category?: AttachmentCategory,
  ) {
    return this.upload(
      AttachmentOwnerType.MISSION,
      { missionId },
      label,
      file,
      'missions',
      category,
    );
  }

  uploadForFuelEntry(fuelEntryId: number, file: UploadedFileInput) {
    return this.upload(
      AttachmentOwnerType.FUEL_ENTRY,
      { fuelEntryId },
      'Fuel receipt',
      file,
      'fuel-receipts',
      AttachmentCategory.FUEL_RECEIPT,
    );
  }

  private async upload(
    ownerType: AttachmentOwnerType,
    owner: {
      truckId?: number;
      driverId?: number;
      clientId?: number;
      subcontractorId?: number;
      clientInvoiceId?: number;
      subcontractorBillId?: number;
      missionId?: number;
      fuelEntryId?: number;
    },
    label: string,
    file: UploadedFileInput,
    subdir: string,
    category?: AttachmentCategory,
  ): Promise<AttachmentResponse> {
    try {
      const stored = await this.storage.save(
        file.buffer,
        subdir,
        file.originalname,
        file.mimetype,
      );

      return await this.prisma.attachment.create({
        data: {
          ownerType,
          ...owner,
          category,
          label,
          fileName: stored.fileName,
          filePath: stored.filePath,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
        },
      });
    } catch (error) {
      this.logger.error('Error uploading attachment:', error);
      throw new HttpException(
        'Error uploading attachment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findForTruck(truckId: number): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { truckId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForDriver(driverId: number): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { driverId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForClient(clientId: number): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { clientId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForSubcontractor(subcontractorId: number): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { subcontractorId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForClientInvoice(clientInvoiceId: number): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { clientInvoiceId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForSubcontractorBill(
    subcontractorBillId: number,
  ): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { subcontractorBillId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForMission(missionId: number): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { missionId },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  findForFuelEntries(fuelEntryIds: number[]): Promise<AttachmentResponse[]> {
    return this.prisma.attachment.findMany({
      where: { fuelEntryId: { in: fuelEntryIds } },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<AttachmentResponse> {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new HttpException('Attachment not found', HttpStatus.NOT_FOUND);
    }

    return attachment;
  }

  /** Streams the stored file — callers must have checked access first. */
  toStreamableFile(attachment: AttachmentResponse): StreamableFile {
    const absolutePath = this.storage.resolveAbsolutePath(attachment.filePath);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return new StreamableFile(createReadStream(absolutePath), {
      type: attachment.mimeType ?? 'application/octet-stream',
      disposition: `attachment; filename="${attachment.fileName}"`,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const attachment = await this.findOne(id);

    await this.prisma.attachment.delete({ where: { id } });
    await this.storage.delete(attachment.filePath);

    return { message: 'Attachment deleted successfully' };
  }
}
