import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionModule } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';
import { ReportsQueryDto } from '../dtos/reports-query.dto';
import { ReportsService } from '../services/reports.service';

// Pure read/aggregation over Mission + Driver/Truck/ClientInvoice — no
// writes, no models of its own.
@ApiTags('reports')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'reports',
  version: '1',
})
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('drivers')
  @RequirePermission(PermissionModule.REPORTS, 'read')
  @ApiOperation({
    summary:
      'Mission count per active driver for a date range (zero-filled for drivers with no missions).',
  })
  getDriverReport(@Query() query: ReportsQueryDto) {
    return this.reportsService.getDriverReport(query);
  }

  @Get('trucks')
  @RequirePermission(PermissionModule.REPORTS, 'read')
  @ApiOperation({
    summary:
      'Mission count + client-billed revenue (MAD/EUR) per active truck for a date range.',
  })
  getTruckReport(@Query() query: ReportsQueryDto) {
    return this.reportsService.getTruckReport(query);
  }
}
