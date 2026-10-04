import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorator/public.decorator';
import { DriverRoute } from '../../auth/decorator/driver-route.decorator';
import { DriverEndpoint } from '../decorators/driver-endpoint.decorator';
import { CurrentDriver } from '../decorators/current-driver.decorator';
import { DriverAuthService } from '../services/driver-auth.service';
import { DriverLoginDto } from '../dtos/driver-login.dto';
import { DriverSession } from '../types/driver-session.type';

@ApiTags('driver-portal')
@DriverRoute()
@Controller({ path: 'driver/auth', version: '1' })
export class DriverAuthController {
  constructor(private readonly driverAuthService: DriverAuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Driver login with phone number + PIN' })
  login(@Body() dto: DriverLoginDto) {
    return this.driverAuthService.login(dto);
  }

  @DriverEndpoint()
  @Get('me')
  @ApiOperation({ summary: "The logged-in driver's profile" })
  me(@CurrentDriver() driver: DriverSession) {
    return this.driverAuthService.getProfile(driver.id);
  }
}
