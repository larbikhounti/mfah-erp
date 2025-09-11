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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const helper_helpers_1 = require("../../helpers/helper.helpers");
let UsersService = UsersService_1 = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(data) {
        try {
            const hashedPassword = await (0, helper_helpers_1.hashPassword)(data.password);
            await this.prisma.users.create({
                data: Object.assign(Object.assign({}, data), { password: hashedPassword, createdAt: new Date(), updatedAt: new Date() }),
            });
            return `User created successfully`;
        }
        catch (error) {
            console.error('Error creating user:', error);
            return new common_1.HttpException('Error creating user', 500);
        }
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, status, userId } = filterParams;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (userId) {
                where.id = userId;
            }
            const [users, total] = await Promise.all([
                this.prisma.users.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                        dom_id: true,
                        role_id: true,
                        doms: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                        roles: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.users.count({ where }),
            ]);
            const formattedData = users.map((user) => {
                var _a, _b;
                return ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.name) || null,
                    dom: ((_b = user.doms) === null || _b === void 0 ? void 0 : _b.name) || null,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                });
            });
            return { data: formattedData, total };
        }
        catch (error) {
            this.logger.error('Error finding users', error);
            throw new common_1.HttpException('Error retrieving users', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(email) {
        try {
            return await this.prisma.users.findUnique({
                where: { email },
            });
        }
        catch (error) {
            this.logger.error('Error finding user', error);
            throw new common_1.HttpException('email or password is incorrect', common_1.HttpStatus.NON_AUTHORITATIVE_INFORMATION);
        }
    }
    async createUserByAdmin(data) {
        try {
            const hashedPassword = await (0, helper_helpers_1.hashPassword)(data.password);
            const existingUser = await this.prisma.users.findUnique({
                where: { email: data.email },
            });
            if (existingUser) {
                throw new common_1.HttpException('User with this email already exists', common_1.HttpStatus.CONFLICT);
            }
            const user = await this.prisma.users.create({
                data: Object.assign(Object.assign({}, data), { password: hashedPassword, createdAt: new Date(), updatedAt: new Date() }),
                include: {
                    roles: true,
                    doms: true,
                },
            });
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        }
        catch (error) {
            this.logger.error('Error creating user by admin:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error creating user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateUserByAdmin(id, data) {
        try {
            const existingUser = await this.prisma.users.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (data.email && data.email !== existingUser.email) {
                const emailExists = await this.prisma.users.findUnique({
                    where: { email: data.email },
                });
                if (emailExists) {
                    throw new common_1.HttpException('User with this email already exists', common_1.HttpStatus.CONFLICT);
                }
            }
            const updateData = Object.assign({}, data);
            if (data.password) {
                updateData.password = await (0, helper_helpers_1.hashPassword)(data.password);
            }
            const user = await this.prisma.users.update({
                where: { id },
                data: Object.assign(Object.assign({}, updateData), { updatedAt: new Date() }),
                include: {
                    roles: true,
                    doms: true,
                },
            });
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        }
        catch (error) {
            this.logger.error('Error updating user by admin:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error updating user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUserByAdmin(id) {
        try {
            const existingUser = await this.prisma.users.findUnique({
                where: { id },
            });
            if (!existingUser) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.users.delete({
                where: { id },
            });
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            this.logger.error('Error deleting user by admin:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error deleting user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserById(id) {
        try {
            const user = await this.prisma.users.findUnique({
                where: { id },
                include: {
                    roles: true,
                    doms: true,
                },
            });
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        }
        catch (error) {
            this.logger.error('Error finding user by id:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error retrieving user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkDeleteUsersByAdmin(bulkDeleteDto) {
        try {
            const { userIds } = bulkDeleteDto;
            const existingUsers = await this.prisma.users.findMany({
                where: { id: { in: userIds } },
                select: { id: true },
            });
            const existingUserIds = existingUsers.map((user) => user.id);
            const notFoundIds = userIds.filter((id) => !existingUserIds.includes(id));
            const deleteResult = await this.prisma.users.deleteMany({
                where: { id: { in: existingUserIds } },
            });
            return {
                message: `Bulk delete completed. ${deleteResult.count} users deleted successfully.`,
                deletedCount: deleteResult.count,
                notFound: notFoundIds,
            };
        }
        catch (error) {
            this.logger.error('Error bulk deleting users by admin:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error bulk deleting users', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map