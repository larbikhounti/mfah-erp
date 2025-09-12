import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { MachineChairsService } from './services/machine-chairs.service';
import { MachineChairsController } from './controllers/machine-chairs.controller';

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
  providers: [MachineChairsService, AdminRoleGuard],
  controllers: [MachineChairsController],
  exports: [MachineChairsService],
})
export class MachineChairsModule {}
