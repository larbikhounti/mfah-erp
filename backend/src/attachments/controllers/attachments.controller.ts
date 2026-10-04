import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AttachmentsService } from '../services/attachments.service';

// Files here (CIN scans, bank details, contracts, insurance docs, ...) are
// sensitive internal documents. Deliberately not served through a
// static/unauthenticated route — every download goes through AuthGuard.
// Drivers download their own files through the driver portal instead.
@ApiTags('attachments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller({
  path: 'attachments',
  version: '1',
})
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get(':id/download')
  @ApiOperation({ summary: 'Download an attachment (authenticated)' })
  async download(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const attachment = await this.attachmentsService.findOne(id);
    return this.attachmentsService.toStreamableFile(attachment);
  }
}
