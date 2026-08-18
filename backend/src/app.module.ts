import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { TrucksModule } from './trucks/trucks.module';
import { DriversModule } from './drivers/drivers.module';
import { ClientsModule } from './clients/clients.module';
import { SubcontractorsModule } from './subcontractors/subcontractors.module';
import { MissionsModule } from './missions/missions.module';
import { ClientInvoicesModule } from './client-invoices/client-invoices.module';
import { SubcontractorBillsModule } from './subcontractor-bills/subcontractor-bills.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ClientInvoicesModule,
    SubcontractorBillsModule,
    MissionsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
