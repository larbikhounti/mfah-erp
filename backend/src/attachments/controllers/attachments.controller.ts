import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AttachmentsService } from '../services/attachments.service';
import { LocalFileStorageService } from '../services/local-file-storage.service';

// Files here (CIN scans, bank details, contracts, insurance docs, ...) are
// sensitive internal documents. Deliberately not served through a
// static/unauthenticated route — every download goes through AuthGuard.
@ApiTags('attachments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller({
  path: 'attachments',
  version: '1',
})
export class AttachmentsController {
  constructor(
    private attachmentsService: AttachmentsService,
    private storage: LocalFileStorageService,
  ) {}

  @Get(':id/download')
  @ApiOperation({ summary: 'Download an attachment (authenticated)' })
  async download(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const attachment = await this.attachmentsService.findOne(id);
    const absolutePath = this.storage.resolveAbsolutePath(attachment.filePath);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('File not found on disk');
    }

    return new StreamableFile(createReadStream(absolutePath), {
      type: attachment.mimeType ?? 'application/octet-stream',
      disposition: `attachment; filename="${attachment.fileName}"`,
    });
  }
}
