import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { FuelEntriesController } from './controllers/fuel-entries.controller';
import { FuelEntriesService } from './services/fuel-entries.service';

@Module({
  imports: [AttachmentsModule],
  controllers: [FuelEntriesController],
  providers: [FuelEntriesService, PermissionGuard],
  exports: [FuelEntriesService],
})
export class FuelEntriesModule {}
