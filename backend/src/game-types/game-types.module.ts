import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameTypesService } from './services/game-types.service';
import { GameTypesController } from './controllers/game-types.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

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
  providers: [GameTypesService, AdminRoleGuard],
  controllers: [GameTypesController],
  exports: [GameTypesService],
})
export class GameTypesModule {}
