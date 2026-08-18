import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsController } from './controllers/clients.controller';
import { ClientsService } from './services/clients.service';
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
  providers: [ClientsService, PermissionGuard],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
