"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const permissions_module_1 = require("./permissions/permissions.module");
const attachments_module_1 = require("./attachments/attachments.module");
const trucks_module_1 = require("./trucks/trucks.module");
const drivers_module_1 = require("./drivers/drivers.module");
const clients_module_1 = require("./clients/clients.module");
const subcontractors_module_1 = require("./subcontractors/subcontractors.module");
const missions_module_1 = require("./missions/missions.module");
const client_invoices_module_1 = require("./client-invoices/client-invoices.module");
const subcontractor_bills_module_1 = require("./subcontractor-bills/subcontractor-bills.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            auth_module_1.AuthModule,
            permissions_module_1.PermissionsModule,
            attachments_module_1.AttachmentsModule,
            trucks_module_1.TrucksModule,
            drivers_module_1.DriversModule,
            clients_module_1.ClientsModule,
            subcontractors_module_1.SubcontractorsModule,
            client_invoices_module_1.ClientInvoicesModule,
            subcontractor_bills_module_1.SubcontractorBillsModule,
            missions_module_1.MissionsModule,
            dashboard_module_1.DashboardModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map