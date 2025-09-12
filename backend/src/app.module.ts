import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { DomsModule } from './doms/doms.module';
import { RolesModule } from './roles/roles.module';
import { MachineTypesModule } from './machine-types/machine-types.module';
import { MachinesModule } from './machines/machines.module';
import { GameTypesModule } from './game-types/game-types.module';
import { GamesModule } from './games/games.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    DomsModule,
    RolesModule,
    MachineTypesModule,
    MachinesModule,
    GameTypesModule,
    GamesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
