import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverEndpoint } from '../../driver-auth/decorators/driver-endpoint.decorator';
import { CurrentDriver } from '../../driver-auth/decorators/current-driver.decorator';
import { DriverSession } from '../../driver-auth/types/driver-session.type';
import { DriverFilesService } from '../services/driver-files.service';

@ApiTags('driver-portal')
@DriverEndpoint()
@Controller({ path: 'driver/files', version: '1' })
export class DriverFilesController {
  constructor(private readonly files: DriverFilesService) {}

  @Get(':id/download')
  @ApiOperation({ summary: 'Download one of your own files (CMR, receipt…)' })
  download(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.files.download(driver.id, id);
  }
}
