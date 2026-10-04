import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionModule } from '@prisma/client';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';
import { FuelEntriesService } from '../services/fuel-entries.service';
import { FilterFuelEntriesDto } from '../dtos/filter-fuel-entries.dto';

/** Staff read-only view of driver-reported fuel (e.g. during mission review). */
@ApiTags('fuel-entries')
@ApiBearerAuth('access-token')
@UseGuards(PermissionGuard)
@Controller({ path: 'fuel-entries', version: '1' })
export class FuelEntriesController {
  constructor(private readonly fuelEntriesService: FuelEntriesService) {}

  @Get()
  @RequirePermission(PermissionModule.MISSIONS, 'read')
  @ApiOperation({
    summary: 'List fuel entries (filter by mission or driver), with totals',
  })
  findAll(@Query() filter: FilterFuelEntriesDto) {
    return this.fuelEntriesService.findAll(filter);
  }
}
