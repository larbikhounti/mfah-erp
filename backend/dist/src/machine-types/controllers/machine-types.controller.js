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
exports.MachineTypesController = void 0;
const common_1 = require("@nestjs/common");
const create_machine_type_dto_1 = require("../dtos/create-machine-type.dto");
const update_machine_type_dto_1 = require("../dtos/update-machine-type.dto");
const bulk_delete_machine_types_dto_1 = require("../dtos/bulk-delete-machine-types.dto");
const filter_machine_types_dto_1 = require("../dtos/filter/filter-machine-types.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const machine_types_service_1 = require("../services/machine-types.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let MachineTypesController = class MachineTypesController {
    constructor(machineTypesService) {
        this.machineTypesService = machineTypesService;
    }
    getAllMachineTypes(filterParams) {
        return this.machineTypesService.findAll(filterParams);
    }
    getMachineTypeById(id) {
        return this.machineTypesService.getMachineTypeById(id);
    }
    getAllMachineTypesAdmin(filterParams) {
        return this.machineTypesService.findAll(filterParams);
    }
    createMachineTypeByAdmin(createMachineTypeDto) {
        return this.machineTypesService.createMachineTypeByAdmin(createMachineTypeDto);
    }
    getMachineTypeByIdAdmin(id) {
        return this.machineTypesService.getMachineTypeById(id);
    }
    updateMachineTypeByAdmin(id, updateMachineTypeDto) {
        return this.machineTypesService.updateMachineTypeByAdmin(id, updateMachineTypeDto);
    }
    bulkDeleteMachineTypesByAdmin(bulkDeleteDto) {
        return this.machineTypesService.bulkDeleteMachineTypesByAdmin(bulkDeleteDto);
    }
    deleteMachineTypeByAdmin(id) {
        return this.machineTypesService.deleteMachineTypeByAdmin(id);
    }
    restoreMachineType(id) {
        return this.machineTypesService.restore(id);
    }
    bulkRestoreMachineTypes(body) {
        return this.machineTypesService.bulkRestore(body.machineTypeIds);
    }
};
exports.MachineTypesController = MachineTypesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all machine types with filtering (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of machine types retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_machine_types_dto_1.FilterMachineTypesDto]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "getAllMachineTypes", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get machine type by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine type retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "getMachineTypeById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all machine types with admin privileges (Admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of machine types retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_machine_types_dto_1.FilterMachineTypesDto]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "getAllMachineTypesAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new machine type (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Machine type created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Machine type with name already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_machine_type_dto_1.CreateMachineTypeDto]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "createMachineTypeByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get machine type by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine type retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "getMachineTypeByIdAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update machine type by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine type updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine type not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Name already taken by another machine type',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_machine_type_dto_1.UpdateMachineTypeDto]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "updateMachineTypeByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete machine types by IDs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine types deleted successfully',
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
    __metadata("design:paramtypes", [bulk_delete_machine_types_dto_1.BulkDeleteMachineTypesDto]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "bulkDeleteMachineTypesByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete machine type by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine type deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "deleteMachineTypeByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Patch)('admin/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted machine type (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine type restored successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine type not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "restoreMachineType", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/bulk-restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore multiple machine types (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk restore completed',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MachineTypesController.prototype, "bulkRestoreMachineTypes", null);
exports.MachineTypesController = MachineTypesController = __decorate([
    (0, swagger_1.ApiTags)('machine-types'),
    (0, common_1.Controller)({
        path: 'machine-types',
        version: '1',
    }),
    __metadata("design:paramtypes", [machine_types_service_1.MachineTypesService])
], MachineTypesController);
//# sourceMappingURL=machine-types.controller.js.map