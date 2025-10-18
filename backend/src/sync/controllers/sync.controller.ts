// src/sync/sync.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SyncService } from '../services/sync.service';
import { SyncRequestDto } from '../dtos/SyncRequest.dto';
import { SyncResponseDto } from '../dtos/sync-response.dto';
import { UploadDataDto } from '../dtos/upload-data.dto';
import { Public } from '@app/decorator/public.decorator';
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Public()
  @Post()
  async sync(@Body() syncRequest: SyncRequestDto): Promise<SyncResponseDto> {
    try {
      return await this.syncService.getUpdatedDataForDome(syncRequest);
    } catch (error) {
      throw new HttpException(
        `Sync failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('upload')
  async upload(@Body() uploadData: UploadDataDto) {
    try {
      return await this.syncService.uploadData(uploadData);
    } catch (error) {
      throw new HttpException(
        `Upload failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // @Public()
  // @Get('history')
  // async getSyncHistory(
  //   @Query('domeId') domeId: number,
  //   @Query('limit') limit: number = 10,
  // ) {
  //   if (!domeId) {
  //     throw new HttpException('domeId is required', HttpStatus.BAD_REQUEST);
  //   }

  //   return this.syncService.getSyncHistory(Number(domeId), Number(limit));
  // }
}
