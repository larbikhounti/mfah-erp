"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTickets = seedTickets;
async function seedTickets(prisma) {
    var _a, _b, _c, _d, _e;
    console.log('Seeding tickets...');
    try {
        const users = await prisma.users.findMany({
            take: 15,
        });
        const experiences = await prisma.experiences.findMany({
            where: { deletedAt: null },
            include: {
                machines: {
                    include: {
                        machineChairs: {
                            where: { deletedAt: null },
                        },
                    },
                },
                games: {
                    select: {
                        name: true,
                        price: true,
                        playTime: true,
                        gameTypes: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                doms: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: 20,
        });
        const machineTicketCounters = new Map();
        const generateTicketAlias = async (machineId, machineAlias) => {
            let currentTicketNumber = machineTicketCounters.get(machineId);
            if (currentTicketNumber === undefined) {
                const machine = await prisma.machines.findUnique({
                    where: { id: machineId },
                    select: { ticketNumber: true },
                });
                currentTicketNumber = (machine === null || machine === void 0 ? void 0 : machine.ticketNumber) || 0;
                machineTicketCounters.set(machineId, currentTicketNumber);
            }
            const nextTicketNumber = currentTicketNumber + 1;
            machineTicketCounters.set(machineId, nextTicketNumber);
            return `${machineAlias}${nextTicketNumber}`;
        };
        const doms = await prisma.doms.findMany({
            where: { deletedAt: null },
        });
        if (users.length === 0 || experiences.length === 0 || doms.length === 0) {
            console.log('Not enough users, experiences, or doms to create tickets. Skipping tickets seeding.');
            return;
        }
        const existingTickets = await prisma.tickets.findMany({
            where: { deletedAt: null },
        });
        if (existingTickets.length > 0) {
            console.log('✅ Tickets already exist, skipping seeding');
            return;
        }
        const ticketsToCreate = [];
        const vrExperiences = experiences.filter((exp) => {
            var _a, _b, _c, _d;
            return ((_b = (_a = exp.games) === null || _a === void 0 ? void 0 : _a.gameTypes) === null || _b === void 0 ? void 0 : _b.name) === 'VR Experience' ||
                ((_d = (_c = exp.games) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes('vr'));
        });
        for (const vrExp of vrExperiences.slice(0, 3)) {
            const ticketCount = Math.floor(Math.random() * 5) + 8;
            for (let i = 0; i < ticketCount; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const availableChairs = vrExp.machines.machineChairs || [];
                const chair = availableChairs.length > 0
                    ? availableChairs[i % availableChairs.length]
                    : null;
                const isPaid = Math.random() > 0.05;
                const randomHoursAgo = Math.floor(Math.random() * (7 * 24));
                const createdAt = new Date();
                createdAt.setHours(createdAt.getHours() - randomHoursAgo);
                const ticketAlias = await generateTicketAlias(vrExp.machines.id, vrExp.machines.alias);
                ticketsToCreate.push({
                    userId: user.id,
                    experienceId: vrExp.id,
                    alias: ticketAlias,
                    isPaid,
                    chairId: (chair === null || chair === void 0 ? void 0 : chair.id) || null,
                    domeId: ((_a = vrExp.doms) === null || _a === void 0 ? void 0 : _a.id) || doms[0].id,
                    createdAt,
                    updatedAt: createdAt,
                });
            }
        }
        const racingExperiences = experiences.filter((exp) => {
            var _a, _b, _c, _d;
            return ((_b = (_a = exp.games) === null || _a === void 0 ? void 0 : _a.gameTypes) === null || _b === void 0 ? void 0 : _b.name) === 'Racing' ||
                ((_d = (_c = exp.games) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes('racing'));
        });
        for (const raceExp of racingExperiences.slice(0, 2)) {
            const ticketCount = Math.floor(Math.random() * 4) + 4;
            for (let i = 0; i < ticketCount; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const availableChairs = raceExp.machines.machineChairs || [];
                const chair = availableChairs.length > 0
                    ? availableChairs[i % availableChairs.length]
                    : null;
                const isPaid = Math.random() > 0.1;
                const randomHoursAgo = Math.floor(Math.random() * (14 * 24));
                const createdAt = new Date();
                createdAt.setHours(createdAt.getHours() - randomHoursAgo);
                const ticketAlias = await generateTicketAlias(raceExp.machines.id, raceExp.machines.alias);
                ticketsToCreate.push({
                    userId: user.id,
                    experienceId: raceExp.id,
                    alias: ticketAlias,
                    isPaid,
                    chairId: (chair === null || chair === void 0 ? void 0 : chair.id) || null,
                    domeId: ((_b = raceExp.doms) === null || _b === void 0 ? void 0 : _b.id) || doms[0].id,
                    createdAt,
                    updatedAt: createdAt,
                });
            }
        }
        const premiumExperiences = experiences.filter((exp) => { var _a; return ((_a = exp.games) === null || _a === void 0 ? void 0 : _a.price) && exp.games.price > 25; });
        for (const premExp of premiumExperiences.slice(0, 3)) {
            const ticketCount = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < ticketCount; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const availableChairs = premExp.machines.machineChairs || [];
                const chair = availableChairs.length > 0
                    ? availableChairs[Math.floor(Math.random() * availableChairs.length)]
                    : null;
                const isPaid = Math.random() > 0.05;
                const randomHoursAgo = Math.floor(Math.random() * (5 * 24));
                const createdAt = new Date();
                createdAt.setHours(createdAt.getHours() - randomHoursAgo);
                const ticketAlias = await generateTicketAlias(premExp.machines.id, premExp.machines.alias);
                ticketsToCreate.push({
                    userId: user.id,
                    experienceId: premExp.id,
                    alias: ticketAlias,
                    isPaid,
                    chairId: (chair === null || chair === void 0 ? void 0 : chair.id) || null,
                    domeId: ((_c = premExp.doms) === null || _c === void 0 ? void 0 : _c.id) || doms[0].id,
                    createdAt,
                    updatedAt: createdAt,
                });
            }
        }
        const arcadeExperiences = experiences.filter((exp) => {
            var _a, _b, _c, _d, _e;
            return ((_b = (_a = exp.games) === null || _a === void 0 ? void 0 : _a.gameTypes) === null || _b === void 0 ? void 0 : _b.name) === 'Action' ||
                ((_d = (_c = exp.games) === null || _c === void 0 ? void 0 : _c.name) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes('arcade')) ||
                (((_e = exp.games) === null || _e === void 0 ? void 0 : _e.price) && exp.games.price <= 15);
        });
        for (const arcadeExp of arcadeExperiences.slice(0, 4)) {
            const ticketCount = Math.floor(Math.random() * 6) + 5;
            for (let i = 0; i < ticketCount; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const availableChairs = arcadeExp.machines.machineChairs || [];
                const chair = availableChairs.length > 0 && Math.random() > 0.3
                    ? availableChairs[Math.floor(Math.random() * availableChairs.length)]
                    : null;
                const isPaid = Math.random() > 0.2;
                const randomHoursAgo = Math.floor(Math.random() * (21 * 24));
                const createdAt = new Date();
                createdAt.setHours(createdAt.getHours() - randomHoursAgo);
                const ticketAlias = await generateTicketAlias(arcadeExp.machines.id, arcadeExp.machines.alias);
                ticketsToCreate.push({
                    userId: user.id,
                    experienceId: arcadeExp.id,
                    alias: ticketAlias,
                    isPaid,
                    chairId: (chair === null || chair === void 0 ? void 0 : chair.id) || null,
                    domeId: ((_d = arcadeExp.doms) === null || _d === void 0 ? void 0 : _d.id) || doms[0].id,
                    createdAt,
                    updatedAt: createdAt,
                });
            }
        }
        const remainingExperiences = experiences.filter((exp) => !vrExperiences.includes(exp) &&
            !racingExperiences.includes(exp) &&
            !premiumExperiences.includes(exp) &&
            !arcadeExperiences.includes(exp));
        for (const exp of remainingExperiences) {
            const ticketCount = Math.floor(Math.random() * 4) + 1;
            for (let i = 0; i < ticketCount; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const availableChairs = exp.machines.machineChairs || [];
                const chair = availableChairs.length > 0 && Math.random() > 0.5
                    ? availableChairs[Math.floor(Math.random() * availableChairs.length)]
                    : null;
                const isPaid = Math.random() > 0.15;
                const randomHoursAgo = Math.floor(Math.random() * (30 * 24));
                const createdAt = new Date();
                createdAt.setHours(createdAt.getHours() - randomHoursAgo);
                const ticketAlias = await generateTicketAlias(exp.machines.id, exp.machines.alias);
                ticketsToCreate.push({
                    userId: user.id,
                    experienceId: exp.id,
                    alias: ticketAlias,
                    isPaid,
                    chairId: (chair === null || chair === void 0 ? void 0 : chair.id) || null,
                    domeId: ((_e = exp.doms) === null || _e === void 0 ? void 0 : _e.id) || doms[0].id,
                    createdAt,
                    updatedAt: createdAt,
                });
            }
        }
        const uniqueTickets = [];
        const seen = new Set();
        for (const ticket of ticketsToCreate) {
            const key = `${ticket.alias}-${ticket.createdAt.toDateString()}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueTickets.push(ticket);
            }
        }
        await prisma.tickets.createMany({
            data: uniqueTickets,
            skipDuplicates: true,
        });
        for (const [machineId, ticketNumber] of machineTicketCounters.entries()) {
            await prisma.machines.update({
                where: { id: machineId },
                data: { ticketNumber },
            });
        }
        console.log(`✅ Created ${uniqueTickets.length} tickets with realistic scenarios`);
        console.log(`✅ Updated ticket numbers for ${machineTicketCounters.size} machines`);
        const totalTickets = await prisma.tickets.count({
            where: { deletedAt: null },
        });
        const paidTickets = await prisma.tickets.count({
            where: { deletedAt: null, isPaid: true },
        });
        const unpaidTickets = await prisma.tickets.count({
            where: { deletedAt: null, isPaid: false },
        });
        const ticketsWithChairs = await prisma.tickets.count({
            where: { deletedAt: null, chairId: { not: null } },
        });
        const ticketsWithPricing = await prisma.tickets.findMany({
            where: { deletedAt: null, isPaid: true },
            include: {
                experiences: {
                    include: {
                        games: {
                            select: {
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        const totalRevenue = ticketsWithPricing.reduce((sum, ticket) => {
            var _a;
            return sum + (((_a = ticket.experiences.games) === null || _a === void 0 ? void 0 : _a.price) || 0);
        }, 0);
        console.log(`📊 Enhanced Ticket Statistics:`);
        console.log(`   Total Tickets: ${totalTickets}`);
        console.log(`   Paid: ${paidTickets} (${((paidTickets / totalTickets) * 100).toFixed(1)}%)`);
        console.log(`   Unpaid: ${unpaidTickets} (${((unpaidTickets / totalTickets) * 100).toFixed(1)}%)`);
        console.log(`   With chairs assigned: ${ticketsWithChairs}`);
        console.log(`   Total Revenue (paid): $${totalRevenue.toFixed(2)}`);
        console.log(`   Average ticket price: $${(totalRevenue / paidTickets).toFixed(2)}`);
    }
    catch (error) {
        console.error('❌ Error seeding tickets:', error);
        throw error;
    }
}
//# sourceMappingURL=seedTickets.js.map