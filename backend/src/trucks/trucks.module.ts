import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrucksController } from './controllers/trucks.controller';
import { TrucksService } from './services/trucks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
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
  providers: [TrucksService, PermissionGuard],
  controllers: [TrucksController],
  exports: [TrucksService],
})
export class TrucksModule {}
