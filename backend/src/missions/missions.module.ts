import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MissionsController } from './controllers/missions.controller';
import { MissionsService } from './services/missions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ClientInvoicesModule } from '../client-invoices/client-invoices.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { MissionLifecycleService } from './services/mission-lifecycle.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ClientInvoicesModule,
    AttachmentsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  providers: [MissionsService, MissionLifecycleService, PermissionGuard],
  controllers: [MissionsController],
  exports: [MissionsService, MissionLifecycleService],
})
export class MissionsModule {}
