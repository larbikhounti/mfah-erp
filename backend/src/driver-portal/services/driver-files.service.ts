import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttachmentsService } from '../../attachments/services/attachments.service';

/** Lets a driver download only files attached to their own missions/fuel. */
@Injectable()
export class DriverFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachments: AttachmentsService,
  ) {}

  async download(
    driverId: number,
    attachmentId: number,
  ): Promise<StreamableFile> {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        OR: [{ mission: { driverId } }, { fuelEntry: { driverId } }],
      },
    });
    if (!attachment) {
      throw new NotFoundException('File not found');
    }
    return this.attachments.toStreamableFile(attachment);
  }
}
