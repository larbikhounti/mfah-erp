import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { TrucksModule } from './trucks/trucks.module';
import { DriversModule } from './drivers/drivers.module';
import { ClientsModule } from './clients/clients.module';
import { SubcontractorsModule } from './subcontractors/subcontractors.module';
import { ContractorTrucksModule } from './contractor-trucks/contractor-trucks.module';
import { MissionsModule } from './missions/missions.module';
import { ClientInvoicesModule } from './client-invoices/client-invoices.module';
import { ClientInvoicePdfModule } from './client-invoice-pdf/client-invoice-pdf.module';
import { SubcontractorBillsModule } from './subcontractor-bills/subcontractor-bills.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { DriverAuthModule } from './driver-auth/driver-auth.module';
import { FuelEntriesModule } from './fuel-entries/fuel-entries.module';
import { DriverPortalModule } from './driver-portal/driver-portal.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // App-wide domain event bus (e.g. mission events → push notifications).
    EventEmitterModule.forRoot(),
    PrismaModule,
    UsersModule,
    RolesModule,
    AuthModule,
    PermissionsModule,
    AttachmentsModule,
    TrucksModule,
    DriversModule,
    ClientsModule,
    SubcontractorsModule,
    ContractorTrucksModule,
    ClientInvoicesModule,
    ClientInvoicePdfModule,
    SubcontractorBillsModule,
    MissionsModule,
    DashboardModule,
    ReportsModule,
    ActivityLogModule,
    DriverAuthModule,
    FuelEntriesModule,
    DriverPortalModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
