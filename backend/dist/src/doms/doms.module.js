"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const doms_service_1 = require("./services/doms.service");
const doms_controller_1 = require("./controllers/doms.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const admin_role_guard_1 = require("../auth/guards/admin-role.guard");
let DomsModule = class DomsModule {
};
exports.DomsModule = DomsModule;
exports.DomsModule = DomsModule = __decorate([
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
        providers: [doms_service_1.DomsService, admin_role_guard_1.AdminRoleGuard],
        controllers: [doms_controller_1.DomsController],
        exports: [doms_service_1.DomsService],
    })
], DomsModule);
//# sourceMappingURL=doms.module.js.map