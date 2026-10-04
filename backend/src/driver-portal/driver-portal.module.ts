import { Module } from '@nestjs/common';
import { DriverAuthModule } from '../driver-auth/driver-auth.module';
import { MissionsModule } from '../missions/missions.module';
import { FuelEntriesModule } from '../fuel-entries/fuel-entries.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { DriverMissionsController } from './controllers/driver-missions.controller';
import { DriverFuelController } from './controllers/driver-fuel.controller';
import { DriverFilesController } from './controllers/driver-files.controller';
import { DriverMissionsService } from './services/driver-missions.service';
import { DriverFuelService } from './services/driver-fuel.service';
import { DriverFilesService } from './services/driver-files.service';

/**
 * What a logged-in driver can see and do (routes under /driver/*). Owns no
 * data of its own: it scopes everything to the current driver and delegates
 * to MissionLifecycleService, FuelEntriesService and AttachmentsService.
 */
@Module({
  imports: [
    DriverAuthModule,
    MissionsModule,
    FuelEntriesModule,
    AttachmentsModule,
  ],
  controllers: [
    DriverMissionsController,
    DriverFuelController,
    DriverFilesController,
  ],
  providers: [DriverMissionsService, DriverFuelService, DriverFilesService],
})
export class DriverPortalModule {}
