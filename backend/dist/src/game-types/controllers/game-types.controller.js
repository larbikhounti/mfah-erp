"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTypesController = void 0;
const common_1 = require("@nestjs/common");
const create_game_type_dto_1 = require("../dtos/create-game-type.dto");
const update_game_type_dto_1 = require("../dtos/update-game-type.dto");
const bulk_delete_game_types_dto_1 = require("../dtos/bulk-delete-game-types.dto");
const filter_game_types_dto_1 = require("../dtos/filter/filter-game-types.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const game_types_service_1 = require("../services/game-types.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let GameTypesController = class GameTypesController {
    constructor(gameTypesService) {
        this.gameTypesService = gameTypesService;
    }
    getAllGameTypes(filterParams) {
        return this.gameTypesService.findAll(filterParams);
    }
    getGameTypeById(id) {
        return this.gameTypesService.getGameTypeById(id);
    }
    getAllGameTypesAdmin(filterParams) {
        return this.gameTypesService.findAll(filterParams);
    }
    createGameTypeByAdmin(createGameTypeDto) {
        return this.gameTypesService.createGameTypeByAdmin(createGameTypeDto);
    }
    getGameTypeByIdAdmin(id) {
        return this.gameTypesService.getGameTypeById(id);
    }
    updateGameTypeByAdmin(id, updateGameTypeDto) {
        return this.gameTypesService.updateGameTypeByAdmin(id, updateGameTypeDto);
    }
    deleteGameTypeByAdmin(id) {
        return this.gameTypesService.deleteGameTypeByAdmin(id);
    }
    bulkDeleteGameTypesByAdmin(bulkDeleteDto) {
        return this.gameTypesService.bulkDeleteGameTypesByAdmin(bulkDeleteDto);
    }
};
exports.GameTypesController = GameTypesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all game types with filtering (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of game types retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_game_types_dto_1.FilterGameTypesDto]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "getAllGameTypes", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get game type by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game type retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "getGameTypeById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all game types with admin privileges (Admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of game types retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_game_types_dto_1.FilterGameTypesDto]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "getAllGameTypesAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new game type (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Game type created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Game type with name already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_game_type_dto_1.CreateGameTypeDto]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "createGameTypeByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get game type by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game type retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "getGameTypeByIdAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update game type by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game type updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game type not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Name already taken by another game type',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_game_type_dto_1.UpdateGameTypeDto]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "updateGameTypeByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete game type by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game type deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Game type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "deleteGameTypeByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete game types by IDs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game types deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deletedCount: { type: 'number' },
                notFound: { type: 'array', items: { type: 'number' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_game_types_dto_1.BulkDeleteGameTypesDto]),
    __metadata("design:returntype", void 0)
], GameTypesController.prototype, "bulkDeleteGameTypesByAdmin", null);
exports.GameTypesController = GameTypesController = __decorate([
    (0, swagger_1.ApiTags)('game-types'),
    (0, common_1.Controller)({
        path: 'game-types',
        version: '1',
    }),
    __metadata("design:paramtypes", [game_types_service_1.GameTypesService])
], GameTypesController);
//# sourceMappingURL=game-types.controller.js.map