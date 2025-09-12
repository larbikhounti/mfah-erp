import { Module } from '@nestjs/common';
import { ExperiencesController } from './controllers/experiences.controller';
import { ExperiencesService } from './services/experiences.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
