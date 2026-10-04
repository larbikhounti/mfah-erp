import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverEndpoint } from '../../driver-auth/decorators/driver-endpoint.decorator';
import { CurrentDriver } from '../../driver-auth/decorators/current-driver.decorator';
import { DriverSession } from '../../driver-auth/types/driver-session.type';
import { CreateFuelEntryDto } from '../../fuel-entries/dtos/create-fuel-entry.dto';
import { DriverMissionsService } from '../services/driver-missions.service';
import { DriverFuelService } from '../services/driver-fuel.service';
import { FilterDriverMissionsDto } from '../dtos/filter-driver-missions.dto';
import { CompleteMissionDto } from '../dtos/complete-mission.dto';
import { UploadClosureFileDto } from '../dtos/upload-closure-file.dto';
import {
  DriverUploadPipe,
  driverUploadMulterOptions,
} from '../pipes/driver-upload.pipe';

@ApiTags('driver-portal')
@DriverEndpoint()
@Controller({ path: 'driver/missions', version: '1' })
export class DriverMissionsController {
  constructor(
    private readonly missions: DriverMissionsService,
    private readonly fuel: DriverFuelService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Home screen: counters + active/upcoming/recent missions',
  })
  overview(@CurrentDriver() driver: DriverSession) {
    return this.missions.overview(driver.id);
  }

  @Get()
  @ApiOperation({
    summary: "The driver's missions, by tab (active/upcoming/completed)",
  })
  list(
    @CurrentDriver() driver: DriverSession,
    @Query() filter: FilterDriverMissionsDto,
  ) {
    return this.missions.list(driver.id, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mission details, closure files and fuel totals' })
  detail(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.missions.detail(driver.id, id);
  }

  @Patch(':id/confirm-loading')
  @ApiOperation({ summary: 'Confirm loading: the mission goes IN_PROGRESS' })
  confirmLoading(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.missions.confirmLoading(driver.id, id);
  }

  @Post(':id/fuel-entries')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: memoryStorage(),
      ...driverUploadMulterOptions,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add a fuel entry (receipt photo optional)' })
  addFuelEntry(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateFuelEntryDto,
    @UploadedFile(new DriverUploadPipe({ required: false }))
    receipt?: Express.Multer.File,
  ) {
    return this.fuel.add(driver.id, id, dto, receipt);
  }

  @Post(':id/closure-files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      ...driverUploadMulterOptions,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload the signed CMR or the odometer photo' })
  uploadClosureFile(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UploadClosureFileDto,
    @UploadedFile(new DriverUploadPipe({ required: true }))
    file: Express.Multer.File,
  ) {
    return this.missions.uploadClosureFile(driver.id, id, dto.category, file);
  }

  @Delete(':id/closure-files/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an uploaded closure file' })
  deleteClosureFile(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
  ) {
    return this.missions.deleteClosureFile(driver.id, id, attachmentId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Complete the mission: it goes PENDING_REVIEW for the ops team (CMR required)',
  })
  complete(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteMissionDto,
  ) {
    return this.missions.complete(driver.id, id, dto.comment);
  }
}
