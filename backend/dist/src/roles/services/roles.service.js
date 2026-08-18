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
var RolesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RolesService = RolesService_1 = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RolesService_1.name);
    }
    async create(data) {
        try {
            const existingRole = await this.prisma.roles.findUnique({
                where: { name: data.name },
            });
            if (existingRole) {
                throw new common_1.HttpException('Role with this name already exists', common_1.HttpStatus.CONFLICT);
            }
            const role = await this.prisma.roles.create({
                data: Object.assign(Object.assign({}, data), { createdAt: new Date(), updatedAt: new Date() }),
                include: {
                    _count: {
                        select: {
                            Users: true,
                        },
                    },
                },
            });
            return role;
        }
        catch (error) {
            this.logger.error('Error creating role:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error creating role', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, roleId, showArchived, } = filterParams;
            const where = {
                deletedAt: showArchived ? undefined : null,
            };
            if (search) {
                where.name = { contains: search, mode: 'insensitive' };
            }
            if (roleId) {
                where.id = roleId;
            }
            const [roles, total] = await Promise.all([
                this.prisma.roles.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    include: {
                        _count: {
                            select: {
                                Users: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.roles.count({ where }),
            ]);
            return {
                data: roles,
                total,
            };
        }
        catch (error) {
            this.logger.error('Error fetching roles:', error);
            throw new common_1.HttpException('Error fetching roles', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const role = await this.prisma.roles.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            Users: true,
                        },
                    },
                },
            });
            if (!role) {
                throw new common_1.HttpException('Role not found', common_1.HttpStatus.NOT_FOUND);
            }
            return role;
        }
        catch (error) {
            this.logger.error(`Error fetching role with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error fetching role', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, data) {
        try {
            const existingRole = await this.prisma.roles.findUnique({
                where: { id },
            });
            if (!existingRole) {
                throw new common_1.HttpException('Role not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (data.name && data.name !== existingRole.name) {
                const nameConflict = await this.prisma.roles.findUnique({
                    where: { name: data.name },
                });
                if (nameConflict) {
                    throw new common_1.HttpException('Name already taken by another role', common_1.HttpStatus.CONFLICT);
                }
            }
            const role = await this.prisma.roles.update({
                where: { id },
                data: Object.assign(Object.assign({}, data), { updatedAt: new Date() }),
                include: {
                    _count: {
                        select: {
                            Users: true,
                        },
                    },
                },
            });
            return role;
        }
        catch (error) {
            this.logger.error(`Error updating role with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error updating role', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const role = await this.prisma.roles.findUnique({
                where: { id },
            });
            if (!role) {
                throw new common_1.HttpException('Role not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (role.deletedAt) {
                throw new common_1.HttpException('Role is already deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.roles.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return { message: 'Role deleted successfully' };
        }
        catch (error) {
            this.logger.error(`Error deleting role with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error deleting role', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkDelete(bulkDeleteDto) {
        try {
            const { roleIds } = bulkDeleteDto;
            const existingRoles = await this.prisma.roles.findMany({
                where: { id: { in: roleIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingRoleIds = existingRoles.map((role) => role.id);
            const notFoundIds = roleIds.filter((id) => !existingRoleIds.includes(id));
            const alreadyDeletedRoles = existingRoles.filter((role) => role.deletedAt !== null);
            const alreadyDeletedIds = alreadyDeletedRoles.map((role) => role.id);
            const deletableIds = existingRoleIds.filter((id) => !alreadyDeletedIds.includes(id));
            const deleteResult = await this.prisma.roles.updateMany({
                where: { id: { in: deletableIds } },
                data: { deletedAt: new Date() },
            });
            return {
                message: `Bulk delete completed. ${deleteResult.count} roles deleted.`,
                deletedCount: deleteResult.count,
                notFound: notFoundIds,
                alreadyDeleted: alreadyDeletedIds,
            };
        }
        catch (error) {
            this.logger.error('Error in bulk delete roles:', error);
            throw new common_1.HttpException('Error in bulk delete operation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restore(id) {
        try {
            const role = await this.prisma.roles.findUnique({
                where: { id },
            });
            if (!role) {
                throw new common_1.HttpException('Role not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!role.deletedAt) {
                throw new common_1.HttpException('Role is not deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.roles.update({
                where: { id },
                data: { deletedAt: null },
            });
            return { message: 'Role restored successfully' };
        }
        catch (error) {
            this.logger.error(`Error restoring role with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error restoring role', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkRestore(roleIds) {
        try {
            const existingRoles = await this.prisma.roles.findMany({
                where: { id: { in: roleIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingRoleIds = existingRoles.map((role) => role.id);
            const notFoundIds = roleIds.filter((id) => !existingRoleIds.includes(id));
            const notDeletedRoles = existingRoles.filter((role) => role.deletedAt === null);
            const notDeletedIds = notDeletedRoles.map((role) => role.id);
            const restorableIds = existingRoleIds.filter((id) => !notDeletedIds.includes(id));
            const restoreResult = await this.prisma.roles.updateMany({
                where: { id: { in: restorableIds } },
                data: { deletedAt: null },
            });
            return {
                message: `Bulk restore completed. ${restoreResult.count} roles restored successfully.`,
                restoredCount: restoreResult.count,
                notFound: notFoundIds,
                notDeleted: notDeletedIds,
            };
        }
        catch (error) {
            this.logger.error('Error bulk restoring roles:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error bulk restoring roles', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = RolesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map