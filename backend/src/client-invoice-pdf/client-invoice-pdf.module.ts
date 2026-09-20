import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientInvoicePdfController } from './controllers/client-invoice-pdf.controller';
import { InvoiceTemplateController } from './controllers/invoice-template.controller';
import { ClientInvoicePdfService } from './services/client-invoice-pdf.service';
import { InvoiceXlsxRendererService } from './services/invoice-xlsx-renderer.service';
import { InvoiceTemplateService } from './services/invoice-template.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { AttachmentsModule } from '../attachments/attachments.module';
import { ClientInvoicesModule } from '../client-invoices/client-invoices.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    AttachmentsModule,
    ClientInvoicesModule,
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
  providers: [
    ClientInvoicePdfService,
    InvoiceXlsxRendererService,
    InvoiceTemplateService,
    PermissionGuard,
    AdminRoleGuard,
  ],
  controllers: [ClientInvoicePdfController, InvoiceTemplateController],
})
export class ClientInvoicePdfModule {}
