"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineChairsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../prisma/prisma.module");
const admin_role_guard_1 = require("../auth/guards/admin-role.guard");
const machine_chairs_service_1 = require("./services/machine-chairs.service");
const machine_chairs_controller_1 = require("./controllers/machine-chairs.controller");
let MachineChairsModule = class MachineChairsModule {
};
exports.MachineChairsModule = MachineChairsModule;
exports.MachineChairsModule = MachineChairsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_ACCESS_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_EXPIRATION_TIME'),
                    },
                }),
            }),
        ],
        providers: [machine_chairs_service_1.MachineChairsService, admin_role_guard_1.AdminRoleGuard],
        controllers: [machine_chairs_controller_1.MachineChairsController],
        exports: [machine_chairs_service_1.MachineChairsService],
    })
], MachineChairsModule);
//# sourceMappingURL=machine-chairs.module.js.map