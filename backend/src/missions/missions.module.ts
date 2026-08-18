import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MissionsController } from './controllers/missions.controller';
import { MissionsService } from './services/missions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { ClientInvoicesModule } from '../client-invoices/client-invoices.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ClientInvoicesModule,
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
  providers: [MissionsService, PermissionGuard],
  controllers: [MissionsController],
  exports: [MissionsService],
})
export class MissionsModule {}
