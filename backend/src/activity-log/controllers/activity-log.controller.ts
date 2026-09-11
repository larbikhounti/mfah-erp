import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';
import { ActivityLogService } from '../services/activity-log.service';
import { FilterActivityLogDto } from '../dtos/filter-activity-log.dto';

// Who-did-what audit trail. Admin-only (AdminRoleGuard, same binary check
// used by roles/users) — this is not a per-module Permission, it's a
// superuser-only page by design (see the user's own request: "only admin
// can access that page").
@ApiTags('activity-log')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, AdminRoleGuard)
@Controller({
  path: 'activity-logs',
  version: '1',
})
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('admin/latest')
  @ApiOperation({
    summary: 'Get the latest activity log entries, newest first',
  })
  getLatest(@Query() filter: FilterActivityLogDto) {
    return this.activityLogService.getLatest(filter.limit ?? 100);
  }

  @Get('admin/download')
  @ApiOperation({ summary: 'Download the full raw activity log file' })
  download(): StreamableFile {
    return new StreamableFile(
      createReadStream(this.activityLogService.getFilePath()),
      {
        type: 'text/plain',
        disposition: 'attachment; filename="activity-log.txt"',
      },
    );
  }

  @Delete('admin/clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear the activity log file (the clear action itself is logged)',
  })
  async clear(@Req() request: any) {
    await this.activityLogService.clear(request.user.email, request.user.sub);
    return { message: 'Activity log cleared' };
  }
}
