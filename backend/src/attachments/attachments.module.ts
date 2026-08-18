import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AttachmentsController } from './controllers/attachments.controller';
import { AttachmentsService } from './services/attachments.service';
import { LocalFileStorageService } from './services/local-file-storage.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
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
  controllers: [AttachmentsController],
  providers: [AttachmentsService, LocalFileStorageService],
  exports: [AttachmentsService, LocalFileStorageService],
})
export class AttachmentsModule {}
