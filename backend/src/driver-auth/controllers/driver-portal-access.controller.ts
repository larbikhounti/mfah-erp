import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionModule } from '@prisma/client';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';
import { DriverCredentialsService } from '../services/driver-credentials.service';
import { SetDriverPinDto } from '../dtos/set-driver-pin.dto';

/** Staff manage a driver's portal login from the Drivers page. */
@ApiTags('drivers')
@ApiBearerAuth('access-token')
@UseGuards(PermissionGuard)
@Controller({ path: 'drivers', version: '1' })
export class DriverPortalAccessController {
  constructor(private readonly credentials: DriverCredentialsService) {}

  @RequirePermission(PermissionModule.DRIVERS, 'read')
  @Get('admin/:id/portal-access')
  @ApiOperation({ summary: "A driver's portal access status" })
  getAccess(@Param('id', ParseIntPipe) id: number) {
    return this.credentials.getAccess(id);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Put('admin/:id/portal-access')
  @ApiOperation({
    summary:
      'Give a driver portal access, or reset their PIN (signs out all their devices)',
  })
  setPin(@Param('id', ParseIntPipe) id: number, @Body() dto: SetDriverPinDto) {
    return this.credentials.setPin(id, dto.pin);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Delete('admin/:id/portal-access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke a driver's portal access" })
  revoke(@Param('id', ParseIntPipe) id: number) {
    return this.credentials.revoke(id);
  }
}
