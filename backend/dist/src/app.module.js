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
const doms_module_1 = require("./doms/doms.module");
const roles_module_1 = require("./roles/roles.module");
const machine_types_module_1 = require("./machine-types/machine-types.module");
const machines_module_1 = require("./machines/machines.module");
const game_types_module_1 = require("./game-types/game-types.module");
const games_module_1 = require("./games/games.module");
const experiences_module_1 = require("./experiences/experiences.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            doms_module_1.DomsModule,
            roles_module_1.RolesModule,
            machine_types_module_1.MachineTypesModule,
            machines_module_1.MachinesModule,
            game_types_module_1.GameTypesModule,
            games_module_1.GamesModule,
            experiences_module_1.ExperiencesModule,
            auth_module_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map