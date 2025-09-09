import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserController } from './controllers/user.controller';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule {}
