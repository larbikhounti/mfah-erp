import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { PermissionModule } from '@prisma/client';
import { CreateMissionDto } from '../dtos/create-mission.dto';
import { UpdateMissionDto } from '../dtos/update-mission.dto';
import { UpdateMissionStatusDto } from '../dtos/update-mission-status.dto';
import { BulkDeleteMissionsDto } from '../dtos/bulk-delete-missions.dto';
import { FilterMissionsDto } from '../dtos/filter-missions.dto';
import { MissionsService } from '../services/missions.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';

@ApiTags('missions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'missions',
  version: '1',
})
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Get()
  @RequirePermission(PermissionModule.MISSIONS, 'read')
  @ApiOperation({ summary: 'Get all missions with filtering' })
  getAllMissions(@Query() filterParams: FilterMissionsDto) {
    return this.missionsService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.MISSIONS, 'read')
  @ApiOperation({ summary: 'Get mission by ID' })
  @ApiResponse({ status: 404, description: 'Mission not found' })
  getMissionById(@Param('id', ParseIntPipe) id: number) {
    return this.missionsService.findOne(id);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new mission' })
  @ApiResponse({
    status: 400,
    description:
      'Invalid combination of executionMode and truck/driver/subcontractor fields, or referenced entity not found',
  })
  createMission(@Body() dto: CreateMissionDto) {
    return this.missionsService.create(dto);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update mission by ID' })
  updateMission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMissionDto,
  ) {
    return this.missionsService.update(id, dto);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'update')
  @Patch('admin/:id/status')
  @ApiOperation({
    summary:
      "Transition a mission's status. For IN_HOUSE missions, entering IN_PROGRESS marks the " +
      'assigned truck/driver as EN_MISSION; leaving IN_PROGRESS (to FINISHED/CANCELLED) restores them.',
  })
  updateMissionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMissionStatusDto,
  ) {
    return this.missionsService.updateStatus(id, dto);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete missions by IDs' })
  bulkDeleteMissions(@Body() dto: BulkDeleteMissionsDto) {
    return this.missionsService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete mission by ID' })
  deleteMission(@Param('id', ParseIntPipe) id: number) {
    return this.missionsService.remove(id);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted mission' })
  restoreMission(@Param('id', ParseIntPipe) id: number) {
    return this.missionsService.restore(id);
  }

  @RequirePermission(PermissionModule.MISSIONS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple missions' })
  bulkRestoreMissions(@Body() body: { missionIds: number[] }) {
    return this.missionsService.bulkRestore(body.missionIds);
  }
}
