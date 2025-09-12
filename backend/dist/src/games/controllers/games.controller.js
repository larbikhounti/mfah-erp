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
exports.GamesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const games_service_1 = require("../services/games.service");
const dtos_1 = require("../dtos");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
const public_decorator_1 = require("../../auth/decorator/public.decorator");
let GamesController = class GamesController {
    constructor(gamesService) {
        this.gamesService = gamesService;
    }
    async create(createGameDto) {
        return this.gamesService.create(createGameDto);
    }
    async findAll(filterDto) {
        return this.gamesService.findAll(filterDto);
    }
    async findOne(id) {
        return this.gamesService.findOne(id);
    }
    async update(id, updateGameDto) {
        return this.gamesService.update(id, updateGameDto);
    }
    async bulkDelete(bulkDeleteDto) {
        return this.gamesService.bulkDelete(bulkDeleteDto);
    }
    async remove(id) {
        return this.gamesService.remove(id);
    }
};
exports.GamesController = GamesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new game' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Game created successfully',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game type or machine type not found',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all games with optional filtering' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Games retrieved successfully',
        type: Object,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'name',
        required: false,
        description: 'Filter by game name',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'gameTypeId',
        required: false,
        description: 'Filter by game type ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'machineTypeId',
        required: false,
        description: 'Filter by machine type ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minPrice',
        required: false,
        description: 'Filter by minimum price',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'maxPrice',
        required: false,
        description: 'Filter by maximum price',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'minPlayTime',
        required: false,
        description: 'Filter by minimum play time',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'maxPlayTime',
        required: false,
        description: 'Filter by maximum play time',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.FilterGamesDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get a game by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game retrieved successfully',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a game' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game updated successfully',
        type: Object,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game, game type, or machine type not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dtos_1.UpdateGameDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('/admin/bulk'),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete games (soft delete)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Games deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deletedCount: { type: 'number' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'One or more games not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'One or more games have active experiences and cannot be deleted',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dtos_1.BulkDeleteGamesDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(admin_role_guard_1.AdminRoleGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a game (soft delete)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Game ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Game deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Game not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Game has active experiences and cannot be deleted',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "remove", null);
exports.GamesController = GamesController = __decorate([
    (0, swagger_1.ApiTags)('games'),
    (0, common_1.Controller)({
        path: 'games',
        version: '1',
    }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [games_service_1.GamesService])
], GamesController);
//# sourceMappingURL=games.controller.js.map