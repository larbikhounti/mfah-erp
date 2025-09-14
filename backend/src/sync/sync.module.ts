import { Module } from '@nestjs/common';
import { SyncService } from './services/sync.service';
import { SyncController } from './controllers/sync.controller';

@Module({
  providers: [SyncService],
  controllers: [SyncController],
})
export class SyncModule {}
