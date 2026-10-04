import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { DriverAuthController } from './controllers/driver-auth.controller';
import { DriverPortalAccessController } from './controllers/driver-portal-access.controller';
import { DriverAuthService } from './services/driver-auth.service';
import { DriverCredentialsService } from './services/driver-credentials.service';
import { DriverSessionGuard } from './guards/driver-session.guard';
import { DriverPhoneChangedListener } from './listeners/driver-phone-changed.listener';

/**
 * Everything about *who* a driver is on the portal: PIN login, the session
 * guard every driver route relies on, and staff-side PIN management.
 * Other driver-facing modules import this one and use `@DriverEndpoint()`.
 */
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [DriverAuthController, DriverPortalAccessController],
  providers: [
    DriverAuthService,
    DriverCredentialsService,
    DriverSessionGuard,
    DriverPhoneChangedListener,
    PermissionGuard,
  ],
  exports: [DriverSessionGuard],
})
export class DriverAuthModule {}
