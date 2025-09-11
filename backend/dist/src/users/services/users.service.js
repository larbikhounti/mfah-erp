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
                    { email: { contains: search, mode: 'insensitive' } }
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
                        domId: true,
                        roleId: true,
                        dom: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                            },
                        },
                        role: {
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
            const formattedData = users.map(user => {
                var _a, _b;
                return ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: ((_a = user.role) === null || _a === void 0 ? void 0 : _a.name) || null,
                    dom: ((_b = user.dom) === null || _b === void 0 ? void 0 : _b.name) || null,
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map