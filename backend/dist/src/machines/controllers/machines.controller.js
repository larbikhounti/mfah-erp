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
exports.MachinesController = void 0;
const common_1 = require("@nestjs/common");
const create_machine_dto_1 = require("../dtos/create-machine.dto");
const update_machine_dto_1 = require("../dtos/update-machine.dto");
const bulk_delete_machines_dto_1 = require("../dtos/bulk-delete-machines.dto");
const filter_machines_dto_1 = require("../dtos/filter/filter-machines.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const machines_service_1 = require("../services/machines.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let MachinesController = class MachinesController {
    constructor(machinesService) {
        this.machinesService = machinesService;
    }
    getAllMachines(filterParams) {
        return this.machinesService.findAll(filterParams);
    }
    getMachineById(id) {
        return this.machinesService.getMachineById(id);
    }
    getAllMachinesAdmin(filterParams) {
        return this.machinesService.findAll(filterParams);
    }
    createMachineByAdmin(createMachineDto) {
        return this.machinesService.createMachineByAdmin(createMachineDto);
    }
    getMachineByIdAdmin(id) {
        return this.machinesService.getMachineById(id);
    }
    updateMachineByAdmin(id, updateMachineDto) {
        return this.machinesService.updateMachineByAdmin(id, updateMachineDto);
    }
    deleteMachineByAdmin(id) {
        return this.machinesService.deleteMachineByAdmin(id);
    }
    bulkDeleteMachinesByAdmin(bulkDeleteDto) {
        return this.machinesService.bulkDeleteMachinesByAdmin(bulkDeleteDto);
    }
};
exports.MachinesController = MachinesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all machines with filtering (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of machines retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_machines_dto_1.FilterMachinesDto]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "getAllMachines", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get machine by ID (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "getMachineById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all machines with admin privileges (Admin only)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of machines retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_machines_dto_1.FilterMachinesDto]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "getAllMachinesAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new machine (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Machine created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Machine with name already exists',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid machine type or DOM ID',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_machine_dto_1.CreateMachineDto]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "createMachineByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get machine by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "getMachineByIdAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update machine by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Name already taken by another machine',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid machine type or DOM ID',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_machine_dto_1.UpdateMachineDto]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "updateMachineByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete machine by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machine deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Machine not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "deleteMachineByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete machines by IDs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Machines deleted successfully',
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
    __metadata("design:paramtypes", [bulk_delete_machines_dto_1.BulkDeleteMachinesDto]),
    __metadata("design:returntype", void 0)
], MachinesController.prototype, "bulkDeleteMachinesByAdmin", null);
exports.MachinesController = MachinesController = __decorate([
    (0, swagger_1.ApiTags)('machines'),
    (0, common_1.Controller)({
        path: 'machines',
        version: '1',
    }),
    __metadata("design:paramtypes", [machines_service_1.MachinesService])
], MachinesController);
//# sourceMappingURL=machines.controller.js.map