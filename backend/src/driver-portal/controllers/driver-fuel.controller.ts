import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverEndpoint } from '../../driver-auth/decorators/driver-endpoint.decorator';
import { CurrentDriver } from '../../driver-auth/decorators/current-driver.decorator';
import { DriverSession } from '../../driver-auth/types/driver-session.type';
import { DriverFuelService } from '../services/driver-fuel.service';
import { FilterDriverFuelDto } from '../dtos/filter-driver-fuel.dto';

@ApiTags('driver-portal')
@DriverEndpoint()
@Controller({ path: 'driver/fuel-entries', version: '1' })
export class DriverFuelController {
  constructor(private readonly fuel: DriverFuelService) {}

  @Get()
  @ApiOperation({
    summary:
      "The driver's fuel entries (optionally for one mission), with totals",
  })
  list(
    @CurrentDriver() driver: DriverSession,
    @Query() filter: FilterDriverFuelDto,
  ) {
    return this.fuel.list(driver.id, filter);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a fuel entry (only while the mission is in progress)',
  })
  remove(
    @CurrentDriver() driver: DriverSession,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.fuel.remove(driver.id, id);
  }
}
