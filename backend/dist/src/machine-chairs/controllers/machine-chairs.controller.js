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
exports.MachineChairsController = void 0;
const common_1 = require("@nestjs/common");
const create_machine_chair_dto_1 = require("../dtos/create-machine-chair.dto");
const update_machine_chair_dto_1 = require("../dtos/update-machine-chair.dto");
const bulk_delete_machine_chairs_dto_1 = require("../dtos/bulk-delete-machine-chairs.dto");
const machine_chairs_service_1 = require("../services/machine-chairs.service");
const filter_params_dto_1 = require("../dtos/filter/filter-params.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let MachineChairsController = class MachineChairsController {
    constructor(machineChairsService) {
        this.machineChairsService = machineChairsService;
    }
    async findAll(filterParams) {
        return this.machineChairsService.findAll(filterParams);
    }
    async findOne(id) {
        return this.machineChairsService.findOne(id);
    }
    async create(createMachineChairDto) {
        return this.machineChairsService.create(createMachineChairDto);
    }
    async update(id, updateMachineChairDto) {
        return this.machineChairsService.update(id, updateMachineChairDto);
    }
    async bulkDelete(bulkDeleteMachineChairsDto) {
        return this.machineChairsService.bulkDelete(bulkDeleteMachineChairsDto);
    }
    async remove(id) {
        return this.machineChairsService.remove(id);
    }
    async findByMachineId(machineId) {
        return this.machineChairsService.findByMachineId(machineId);
    }
    restoreMachineChair(id) {
        return this.machineChairsService.restore(id);
    }
    bulkRestoreMachineChairs(body) {
        return this.machineChairsService.bulkRestore(body.ids);
    }
};
exports.MachineChairsController = MachineChairsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all machine chairs with admin privileges (Admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of machine chairs retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_params_dto_1.FilterParamsDto]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get machine chair by ID with admin privileges (Admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine chair retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Machine chair not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new machine chair (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Machine chair created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_machine_chair_dto_1.CreateMachineChairDto]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/update/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update machine chair by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine chair updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Machine chair not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_machine_chair_dto_1.UpdateMachineChairDto]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete machine chairs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Machine chairs deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid input data',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_machine_chairs_dto_1.BulkDeleteMachineChairsDto]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "bulkDelete", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/delete/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete machine chair by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Machine chair deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Machine chair not found',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('machine/:machineId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get machine chairs by machine ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine chairs retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    __param(0, (0, common_1.Param)('machineId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MachineChairsController.prototype, "findByMachineId", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Patch)('admin/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted machine chair (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine chair restored successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine chair not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachineChairsController.prototype, "restoreMachineChair", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/bulk-restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore multiple machine chairs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk restore completed',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MachineChairsController.prototype, "bulkRestoreMachineChairs", null);
exports.MachineChairsController = MachineChairsController = __decorate([
    (0, swagger_1.ApiTags)('machine-chairs'),
    (0, common_1.Controller)({
        path: 'machine-chairs',
        version: '1',
    }),
    __metadata("design:paramtypes", [machine_chairs_service_1.MachineChairsService])
], MachineChairsController);
//# sourceMappingURL=machine-chairs.controller.js.map