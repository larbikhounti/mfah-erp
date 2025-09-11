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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const register_dto_1 = require("../dtos/register.dto");
const create_user_admin_dto_1 = require("../dtos/create-user-admin.dto");
const update_user_dto_1 = require("../dtos/update-user.dto");
const bulk_delete_users_dto_1 = require("../dtos/bulk-delete-users.dto");
const public_decorator_1 = require("../../decorator/public.decorator");
const users_service_1 = require("../services/users.service");
const filter_params_dto_1 = require("../dtos/filter/filter-params.dto");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const admin_role_guard_1 = require("../../auth/guards/admin-role.guard");
let UserController = class UserController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getAllUsersAdmin(filterParams) {
        return this.usersService.findAll(filterParams);
    }
    registerUser(registerUserDto) {
        return this.usersService.create(registerUserDto);
    }
    createUserByAdmin(createUserDto) {
        return this.usersService.createUserByAdmin(createUserDto);
    }
    getUserById(id) {
        return this.usersService.getUserById(id);
    }
    updateUserByAdmin(id, updateUserDto) {
        return this.usersService.updateUserByAdmin(id, updateUserDto);
    }
    deleteUserByAdmin(id) {
        return this.usersService.deleteUserByAdmin(id);
    }
    bulkDeleteUsersByAdmin(bulkDeleteDto) {
        return this.usersService.bulkDeleteUsersByAdmin(bulkDeleteDto);
    }
};
exports.UserController = UserController;
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/list/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with admin privileges (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of users retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_params_dto_1.FilterParamsDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAllUsersAdmin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "registerUser", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Post)('admin/create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User with email already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_admin_dto_1.CreateUserByAdminDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createUserByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Get)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Email already taken by another user',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateUserByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "deleteUserByAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, admin_role_guard_1.AdminRoleGuard),
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete users by IDs (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Users deleted successfully',
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
    __metadata("design:paramtypes", [bulk_delete_users_dto_1.BulkDeleteUsersDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "bulkDeleteUsersByAdmin", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)({
        path: 'users',
        version: '1',
    }),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UserController);
//# sourceMappingURL=user.controller.js.map