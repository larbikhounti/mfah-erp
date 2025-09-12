"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seedRoles_1 = require("./seeds/seedRoles");
const seedDoms_1 = require("./seeds/seedDoms");
const seedMachineTypes_1 = require("./seeds/seedMachineTypes");
const seedGameTypes_1 = require("./seeds/seedGameTypes");
const seedMachines_1 = require("./seeds/seedMachines");
const seedGames_1 = require("./seeds/seedGames");
const seedUsers_1 = require("./seeds/seedUsers");
const seedExperiences_1 = require("./seeds/seedExperiences");
const seedTickets_1 = require("./seeds/seedTickets");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seeding...');
    try {
        await (0, seedRoles_1.seedRoles)(prisma);
        await (0, seedDoms_1.seedDoms)(prisma);
        await (0, seedMachineTypes_1.seedMachineTypes)(prisma);
        await (0, seedGameTypes_1.seedGameTypes)(prisma);
        await (0, seedMachines_1.seedMachines)(prisma);
        await (0, seedGames_1.seedGames)(prisma);
        await (0, seedUsers_1.seedUsers)(prisma);
        await (0, seedExperiences_1.seedExperiences)(prisma);
        await (0, seedTickets_1.seedTickets)(prisma);
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map