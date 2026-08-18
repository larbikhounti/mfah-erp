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
var ExperiencesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperiencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ExperiencesService = ExperiencesService_1 = class ExperiencesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ExperiencesService_1.name);
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 25, search, experienceId, machineId, gameId, domeId, startDate, endDate, showArchived, } = filterParams;
            const where = {};
            if (!showArchived) {
                where.deletedAt = null;
            }
            else {
                where.deletedAt = { not: null };
            }
            if (experienceId) {
                where.id = experienceId;
            }
            if (machineId) {
                where.machineId = machineId;
            }
            if (gameId) {
                where.gameId = gameId;
            }
            if (domeId) {
                where.domeId = domeId;
            }
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) {
                    where.createdAt.gte = new Date(startDate);
                }
                if (endDate) {
                    const endDateObj = new Date(endDate);
                    if (endDate.length === 10) {
                        endDateObj.setHours(23, 59, 59, 999);
                    }
                    where.createdAt.lte = endDateObj;
                }
            }
            if (search && search.trim()) {
                where.OR = [
                    {
                        machines: {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        games: {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        doms: {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ];
            }
            const [experiences, total] = await Promise.all([
                this.prisma.experiences.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    include: {
                        machines: {
                            include: {
                                machineTypes: true,
                                machineChairs: {
                                    include: {
                                        tickets: {
                                            where: {
                                                deletedAt: null,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        games: {
                            include: {
                                gameTypes: true,
                                gameMachineTypes: {
                                    include: {
                                        machineTypes: true,
                                    },
                                },
                            },
                        },
                        doms: true,
                        tickets: {
                            where: {
                                deletedAt: null,
                            },
                            include: {
                                coupons: true,
                                ticketComments: {
                                    include: {
                                        comments: true,
                                    },
                                },
                                machineChairs: true,
                                parentTicket: {
                                    include: {
                                        machineChairs: true,
                                        experiences: {
                                            include: {
                                                games: true,
                                                machines: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.experiences.count({ where }),
            ]);
            const formattedData = experiences.map((experience) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                const tickets = experience.tickets || [];
                const paidTickets = tickets.filter((t) => t.isPaid);
                const unpaidTickets = tickets.filter((t) => !t.isPaid);
                const gamePrice = ((_a = experience.games) === null || _a === void 0 ? void 0 : _a.price) || 0;
                const totalRevenue = paidTickets.length * gamePrice;
                const averagePrice = gamePrice;
                const recentTickets = tickets
                    .sort((a, b) => new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((ticket) => ({
                    id: ticket.id,
                    isPaid: ticket.isPaid,
                    chairId: ticket.chairId,
                    createdAt: ticket.createdAt.toISOString(),
                }));
                const ticketSummary = {
                    totalCount: tickets.length,
                    paidCount: paidTickets.length,
                    unpaidCount: unpaidTickets.length,
                    totalRevenue,
                    averagePrice,
                    recentTickets,
                };
                const couponsMap = new Map();
                tickets.forEach((ticket) => {
                    if (ticket.coupons) {
                        const couponId = ticket.coupons.id;
                        if (couponsMap.has(couponId)) {
                            couponsMap.get(couponId).usageCount++;
                        }
                        else {
                            couponsMap.set(couponId, {
                                id: ticket.coupons.id,
                                code: ticket.coupons.code,
                                discount: ticket.coupons.discount,
                                usageCount: 1,
                            });
                        }
                    }
                });
                const couponsUsed = Array.from(couponsMap.values());
                const commentsMap = new Map();
                tickets.forEach((ticket) => {
                    if (ticket.ticketComments && ticket.ticketComments.length > 0) {
                        ticket.ticketComments.forEach((tc) => {
                            if (tc.comments) {
                                const commentId = tc.comments.id;
                                if (commentsMap.has(commentId)) {
                                    commentsMap.get(commentId).usageCount++;
                                }
                                else {
                                    commentsMap.set(commentId, {
                                        id: tc.comments.id,
                                        content: tc.comments.content,
                                        createdAt: tc.comments.createdAt.toISOString(),
                                        usageCount: 1,
                                    });
                                }
                            }
                        });
                    }
                });
                const commentsUsed = Array.from(commentsMap.values());
                const detailedTickets = tickets.map((ticket) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    return ({
                        id: ticket.id,
                        alias: ticket.alias,
                        isPaid: ticket.isPaid,
                        paidWith: ticket.paidWith,
                        price: ticket.price,
                        notes: ticket.notes,
                        chairId: ticket.chairId,
                        chairName: ((_a = ticket.machineChairs) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                        createdAt: ticket.createdAt.toISOString(),
                        coupon: ticket.coupons
                            ? {
                                id: ticket.coupons.id,
                                code: ticket.coupons.code,
                                discount: ticket.coupons.discount,
                            }
                            : null,
                        comments: ((_b = ticket.ticketComments) === null || _b === void 0 ? void 0 : _b.map((tc) => ({
                            id: tc.comments.id,
                            content: tc.comments.content,
                        }))) || [],
                        parentTicket: ticket.parentTicket
                            ? {
                                id: ticket.parentTicket.id,
                                alias: ticket.parentTicket.alias,
                                chairName: ((_c = ticket.parentTicket.machineChairs) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown',
                                machineName: ((_e = (_d = ticket.parentTicket.experiences) === null || _d === void 0 ? void 0 : _d.machines) === null || _e === void 0 ? void 0 : _e.name) || 'Unknown',
                                machineAlias: ((_g = (_f = ticket.parentTicket.experiences) === null || _f === void 0 ? void 0 : _f.machines) === null || _g === void 0 ? void 0 : _g.alias) || 'Unknown',
                                gameName: ((_j = (_h = ticket.parentTicket.experiences) === null || _h === void 0 ? void 0 : _h.games) === null || _j === void 0 ? void 0 : _j.name) || 'Unknown',
                                gamePrice: ((_l = (_k = ticket.parentTicket.experiences) === null || _k === void 0 ? void 0 : _k.games) === null || _l === void 0 ? void 0 : _l.price) || 0,
                            }
                            : null,
                    });
                });
                return {
                    id: experience.id,
                    machineId: experience.machineId,
                    machine: ((_b = experience.machines) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Machine',
                    gameId: experience.gameId,
                    game: ((_c = experience.games) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown Game',
                    domeId: experience.domeId,
                    dome: ((_d = experience.doms) === null || _d === void 0 ? void 0 : _d.name) || 'Unknown DOM',
                    createdAt: experience.createdAt.toISOString(),
                    updatedAt: experience.updatedAt.toISOString(),
                    machineType: ((_f = (_e = experience.machines) === null || _e === void 0 ? void 0 : _e.machineTypes) === null || _f === void 0 ? void 0 : _f.name) || 'Unknown Type',
                    machineChairs: ((_h = (_g = experience.machines) === null || _g === void 0 ? void 0 : _g.machineChairs) === null || _h === void 0 ? void 0 : _h.map((chair) => {
                        var _a, _b;
                        return ({
                            id: chair.id,
                            name: chair.name,
                            status: chair.status,
                            ticketCount: ((_a = chair.tickets) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            tickets: ((_b = chair.tickets) === null || _b === void 0 ? void 0 : _b.map((ticket) => ({
                                id: ticket.id,
                                isPaid: ticket.isPaid,
                                chairId: chair.id,
                                createdAt: ticket.createdAt.toISOString(),
                            }))) || [],
                        });
                    })) || [],
                    gamePrice: ((_j = experience.games) === null || _j === void 0 ? void 0 : _j.price) || 0,
                    gamePlayTime: ((_k = experience.games) === null || _k === void 0 ? void 0 : _k.playTime) || 0,
                    gameType: ((_m = (_l = experience.games) === null || _l === void 0 ? void 0 : _l.gameTypes) === null || _m === void 0 ? void 0 : _m.name) || 'Unknown Game Type',
                    requiredMachineType: ((_r = (_q = (_p = (_o = experience.games) === null || _o === void 0 ? void 0 : _o.gameMachineTypes) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.machineTypes) === null || _r === void 0 ? void 0 : _r.name) || 'Unknown Required Type',
                    domeAddress: ((_s = experience.doms) === null || _s === void 0 ? void 0 : _s.address) || 'Unknown Address',
                    ticketCount: tickets.length,
                    ticketSummary,
                    couponsUsed,
                    commentsUsed,
                    startedAt: experience.startedAt
                        ? experience.startedAt.toISOString()
                        : null,
                    endedAt: experience.endedAt ? experience.endedAt.toISOString() : null,
                    isNext: experience.isNext,
                    isStarted: experience.isStarted,
                    isEnded: experience.isEnded,
                    isFractioned: experience.isFractioned,
                    tickets: detailedTickets,
                };
            });
            return {
                data: formattedData,
                total,
            };
        }
        catch (error) {
            this.logger.error('Error fetching experiences:', error);
            throw new common_1.HttpException('Error fetching experiences', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getExperienceById(id) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        try {
            const experience = await this.prisma.experiences.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                include: {
                    machines: {
                        include: {
                            machineTypes: true,
                            machineChairs: {
                                include: {
                                    tickets: {
                                        where: {
                                            deletedAt: null,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    games: {
                        include: {
                            gameTypes: true,
                            gameMachineTypes: {
                                include: {
                                    machineTypes: true,
                                },
                            },
                        },
                    },
                    doms: true,
                    tickets: {
                        where: {
                            deletedAt: null,
                        },
                        include: {
                            coupons: true,
                            ticketComments: {
                                include: {
                                    comments: true,
                                },
                            },
                            machineChairs: true,
                            parentTicket: {
                                include: {
                                    machineChairs: true,
                                    experiences: {
                                        include: {
                                            games: true,
                                            machines: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!experience) {
                throw new common_1.HttpException('Experience not found', common_1.HttpStatus.NOT_FOUND);
            }
            const tickets = experience.tickets || [];
            const paidTickets = tickets.filter((t) => t.isPaid);
            const unpaidTickets = tickets.filter((t) => !t.isPaid);
            const gamePrice = ((_a = experience.games) === null || _a === void 0 ? void 0 : _a.price) || 0;
            const totalRevenue = paidTickets.length * gamePrice;
            const averagePrice = gamePrice;
            const recentTickets = tickets
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((ticket) => ({
                id: ticket.id,
                isPaid: ticket.isPaid,
                chairId: ticket.chairId,
                createdAt: ticket.createdAt.toISOString(),
            }));
            const ticketSummary = {
                totalCount: tickets.length,
                paidCount: paidTickets.length,
                unpaidCount: unpaidTickets.length,
                totalRevenue,
                averagePrice,
                recentTickets,
            };
            const couponsMap = new Map();
            tickets.forEach((ticket) => {
                if (ticket.coupons) {
                    const couponId = ticket.coupons.id;
                    if (couponsMap.has(couponId)) {
                        couponsMap.get(couponId).usageCount++;
                    }
                    else {
                        couponsMap.set(couponId, {
                            id: ticket.coupons.id,
                            code: ticket.coupons.code,
                            discount: ticket.coupons.discount,
                            usageCount: 1,
                        });
                    }
                }
            });
            const couponsUsed = Array.from(couponsMap.values());
            const commentsMap = new Map();
            tickets.forEach((ticket) => {
                if (ticket.ticketComments && ticket.ticketComments.length > 0) {
                    ticket.ticketComments.forEach((tc) => {
                        if (tc.comments) {
                            const commentId = tc.comments.id;
                            if (commentsMap.has(commentId)) {
                                commentsMap.get(commentId).usageCount++;
                            }
                            else {
                                commentsMap.set(commentId, {
                                    id: tc.comments.id,
                                    content: tc.comments.content,
                                    createdAt: tc.comments.createdAt.toISOString(),
                                    usageCount: 1,
                                });
                            }
                        }
                    });
                }
            });
            const commentsUsed = Array.from(commentsMap.values());
            const detailedTickets = tickets.map((ticket) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                return ({
                    id: ticket.id,
                    alias: ticket.alias,
                    isPaid: ticket.isPaid,
                    paidWith: ticket.paidWith,
                    price: ticket.price,
                    notes: ticket.notes,
                    chairId: ticket.chairId,
                    chairName: ((_a = ticket.machineChairs) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                    createdAt: ticket.createdAt.toISOString(),
                    coupon: ticket.coupons
                        ? {
                            id: ticket.coupons.id,
                            code: ticket.coupons.code,
                            discount: ticket.coupons.discount,
                        }
                        : null,
                    comments: ((_b = ticket.ticketComments) === null || _b === void 0 ? void 0 : _b.map((tc) => ({
                        id: tc.comments.id,
                        content: tc.comments.content,
                    }))) || [],
                    parentTicket: ticket.parentTicket
                        ? {
                            id: ticket.parentTicket.id,
                            alias: ticket.parentTicket.alias,
                            chairName: ((_c = ticket.parentTicket.machineChairs) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown',
                            machineName: ((_e = (_d = ticket.parentTicket.experiences) === null || _d === void 0 ? void 0 : _d.machines) === null || _e === void 0 ? void 0 : _e.name) || 'Unknown',
                            machineAlias: ((_g = (_f = ticket.parentTicket.experiences) === null || _f === void 0 ? void 0 : _f.machines) === null || _g === void 0 ? void 0 : _g.alias) || 'Unknown',
                            gameName: ((_j = (_h = ticket.parentTicket.experiences) === null || _h === void 0 ? void 0 : _h.games) === null || _j === void 0 ? void 0 : _j.name) || 'Unknown',
                            gamePrice: ((_l = (_k = ticket.parentTicket.experiences) === null || _k === void 0 ? void 0 : _k.games) === null || _l === void 0 ? void 0 : _l.price) || 0,
                        }
                        : null,
                });
            });
            return {
                id: experience.id,
                machineId: experience.machineId,
                machine: ((_b = experience.machines) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Machine',
                gameId: experience.gameId,
                game: ((_c = experience.games) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown Game',
                domeId: experience.domeId,
                dome: ((_d = experience.doms) === null || _d === void 0 ? void 0 : _d.name) || 'Unknown DOM',
                createdAt: experience.createdAt.toISOString(),
                updatedAt: experience.updatedAt.toISOString(),
                machineType: ((_f = (_e = experience.machines) === null || _e === void 0 ? void 0 : _e.machineTypes) === null || _f === void 0 ? void 0 : _f.name) || 'Unknown Type',
                machineChairs: ((_h = (_g = experience.machines) === null || _g === void 0 ? void 0 : _g.machineChairs) === null || _h === void 0 ? void 0 : _h.map((chair) => {
                    var _a, _b;
                    return ({
                        id: chair.id,
                        name: chair.name,
                        status: chair.status,
                        ticketCount: ((_a = chair.tickets) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        tickets: ((_b = chair.tickets) === null || _b === void 0 ? void 0 : _b.map((ticket) => ({
                            id: ticket.id,
                            isPaid: ticket.isPaid,
                            chairId: chair.id,
                            createdAt: ticket.createdAt.toISOString(),
                        }))) || [],
                    });
                })) || [],
                gamePrice: ((_j = experience.games) === null || _j === void 0 ? void 0 : _j.price) || 0,
                gamePlayTime: ((_k = experience.games) === null || _k === void 0 ? void 0 : _k.playTime) || 0,
                gameType: ((_m = (_l = experience.games) === null || _l === void 0 ? void 0 : _l.gameTypes) === null || _m === void 0 ? void 0 : _m.name) || 'Unknown Game Type',
                requiredMachineType: ((_r = (_q = (_p = (_o = experience.games) === null || _o === void 0 ? void 0 : _o.gameMachineTypes) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.machineTypes) === null || _r === void 0 ? void 0 : _r.name) || 'Unknown Required Type',
                domeAddress: ((_s = experience.doms) === null || _s === void 0 ? void 0 : _s.address) || 'Unknown Address',
                ticketCount: tickets.length,
                ticketSummary,
                couponsUsed,
                commentsUsed,
                startedAt: experience.startedAt
                    ? experience.startedAt.toISOString()
                    : null,
                endedAt: experience.endedAt ? experience.endedAt.toISOString() : null,
                isNext: experience.isNext,
                isStarted: experience.isStarted,
                isEnded: experience.isEnded,
                isFractioned: experience.isFractioned,
                tickets: detailedTickets,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error fetching experience by ID:', error);
            throw new common_1.HttpException('Error fetching experience', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ExperiencesService = ExperiencesService;
exports.ExperiencesService = ExperiencesService = ExperiencesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExperiencesService);
//# sourceMappingURL=experiences.service.js.map