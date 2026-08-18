import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PermissionModule } from '@prisma/client';
import { DashboardSummaryQueryDto } from '../dtos/dashboard-summary-query.dto';
import { DashboardService } from '../services/dashboard.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';

// Pure read/aggregation over Mission + ClientInvoice + SubcontractorBill —
// no writes, no models of its own.
@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'dashboard',
  version: '1',
})
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermission(PermissionModule.DASHBOARD, 'read')
  @ApiOperation({
    summary:
      'Mission/revenue KPIs for a date range: mission counts by status, client revenue + ' +
      'outstanding and subcontractor spend + outstanding (both MAD/EUR), live fleet/driver ' +
      'status breakdown, overdue invoice/bill counts, and a paginated missions table.',
  })
  getSummary(@Query() query: DashboardSummaryQueryDto) {
    return this.dashboardService.getSummary(query);
  }
}
