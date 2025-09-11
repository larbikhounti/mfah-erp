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
            const { offset = 0, limit = 10, search, roleId } = filterParams;
            const where = {};
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
            if (role._count && role._count.Users > 0) {
                throw new common_1.HttpException('Cannot delete role with related users', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.roles.delete({
                where: { id },
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
            let deletedCount = 0;
            const notFound = [];
            const hasRelatedRecords = [];
            for (const roleId of roleIds) {
                try {
                    const role = await this.prisma.roles.findUnique({
                        where: { id: roleId },
                        include: {
                            _count: {
                                select: {
                                    Users: true,
                                },
                            },
                        },
                    });
                    if (!role) {
                        notFound.push(roleId);
                        continue;
                    }
                    if (role._count && role._count.Users > 0) {
                        hasRelatedRecords.push(roleId);
                        continue;
                    }
                    await this.prisma.roles.delete({
                        where: { id: roleId },
                    });
                    deletedCount++;
                }
                catch (error) {
                    this.logger.error(`Error deleting role ${roleId}:`, error);
                }
            }
            return {
                message: `Bulk delete completed. ${deletedCount} roles deleted.`,
                deletedCount,
                notFound,
                hasRelatedRecords,
            };
        }
        catch (error) {
            this.logger.error('Error in bulk delete roles:', error);
            throw new common_1.HttpException('Error in bulk delete operation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = RolesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map