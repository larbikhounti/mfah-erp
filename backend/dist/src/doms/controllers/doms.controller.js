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
exports.DomsController = void 0;
const common_1 = require("@nestjs/common");
const create_dom_dto_1 = require("../dtos/create-dom.dto");
const update_dom_dto_1 = require("../dtos/update-dom.dto");
const bulk_delete_doms_dto_1 = require("../dtos/bulk-delete-doms.dto");
const filter_doms_dto_1 = require("../dtos/filter-doms.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const doms_service_1 = require("../services/doms.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let DomsController = class DomsController {
    constructor(domsService) {
        this.domsService = domsService;
    }
    getAllDoms(filterParams) {
        return this.domsService.findAll(filterParams);
    }
    getDomById(id) {
        return this.domsService.findOne(id);
    }
    createDom(createDomDto) {
        return this.domsService.create(createDomDto);
    }
    getDomByIdAdmin(id) {
        return this.domsService.findOne(id);
    }
    updateDom(id, updateDomDto) {
        return this.domsService.update(id, updateDomDto);
    }
    bulkDeleteDoms(bulkDeleteDto) {
        return this.domsService.bulkDelete(bulkDeleteDto);
    }
    deleteDom(id) {
        return this.domsService.remove(id);
    }
    getAllDomsAdmin(filterParams) {
        return this.domsService.findAll(filterParams);
    }
    restoreDom(id) {
        return this.domsService.restore(id);
    }
    bulkRestoreDoms(body) {
        return this.domsService.bulkRestore(body.domIds);
    }
};
exports.DomsController = DomsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all DOMs with filtering (Public)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of DOMs retrieved successfully',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_doms_dto_1.FilterDomsDto]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "getAllDoms", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get DOM by ID (Public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'DOM retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'DOM not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "getDomById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new DOM (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'DOM created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'DOM with name already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dom_dto_1.CreateDomDto]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "createDom", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get DOM by ID with admin details (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'DOM retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'DOM not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "getDomByIdAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update DOM by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'DOM updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'DOM not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Name already taken by another DOM',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_dom_dto_1.UpdateDomDto]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "updateDom", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete DOMs by IDs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'DOMs deleted successfully',
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
    __metadata("design:paramtypes", [bulk_delete_doms_dto_1.BulkDeleteDomsDto]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "bulkDeleteDoms", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete DOM by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'DOM deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'DOM not found' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Cannot delete DOM with related records',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "deleteDom", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all DOMs with admin privileges (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of DOMs retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_doms_dto_1.FilterDomsDto]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "getAllDomsAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Patch)('admin/:id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore deleted DOM (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'DOM restored successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'DOM not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "restoreDom", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/bulk-restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Restore multiple DOMs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Bulk restore completed',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DomsController.prototype, "bulkRestoreDoms", null);
exports.DomsController = DomsController = __decorate([
    (0, swagger_1.ApiTags)('doms'),
    (0, common_1.Controller)({
        path: 'doms',
        version: '1',
    }),
    __metadata("design:paramtypes", [doms_service_1.DomsService])
], DomsController);
//# sourceMappingURL=doms.controller.js.map