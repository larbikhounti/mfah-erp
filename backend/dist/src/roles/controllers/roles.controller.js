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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const create_role_dto_1 = require("../dtos/create-role.dto");
const update_role_dto_1 = require("../dtos/update-role.dto");
const bulk_delete_roles_dto_1 = require("../dtos/bulk-delete-roles.dto");
const filter_roles_dto_1 = require("../dtos/filter-roles.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const roles_service_1 = require("../services/roles.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let RolesController = class RolesController {
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    getAllRoles(filterParams) {
        return this.rolesService.findAll(filterParams);
    }
    getRoleById(id) {
        return this.rolesService.findOne(id);
    }
    createRole(createRoleDto) {
        return this.rolesService.create(createRoleDto);
    }
    getRoleByIdAdmin(id) {
        return this.rolesService.findOne(id);
    }
    updateRole(id, updateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }
    bulkDeleteRoles(bulkDeleteDto) {
        return this.rolesService.bulkDelete(bulkDeleteDto);
    }
    deleteRole(id) {
        return this.rolesService.remove(id);
    }
    getAllRolesAdmin(filterParams) {
        return this.rolesService.findAll(filterParams);
    }
    restoreRole(id) {
        return this.rolesService.restore(id);
    }
    bulkRestoreRoles(body) {
        return this.rolesService.bulkRestore(body.roleIds);
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles with filtering (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of roles retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_roles_dto_1.FilterRolesDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getAllRoles", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by ID (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getRoleById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Role created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Role with name already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_role_dto_1.CreateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "createRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by ID with admin details (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getRoleByIdAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update role by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Name already taken by another role',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "updateRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete roles by IDs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Roles deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deletedCount: { type: 'number' },
                notFound: { type: 'array', items: { type: 'number' } },
                hasRelatedRecords: { type: 'array', items: { type: 'number' } },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request body' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_roles_dto_1.BulkDeleteRolesDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "bulkDeleteRoles", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete role by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete role with related records',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "deleteRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles with admin privileges (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of roles retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_roles_dto_1.FilterRolesDto]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "getAllRolesAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Patch)('admin/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted role (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Role restored successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "restoreRole", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/bulk-restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore multiple roles (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk restore completed',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RolesController.prototype, "bulkRestoreRoles", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('roles'),
    (0, common_1.Controller)({
        path: 'roles',
        version: '1',
    }),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map