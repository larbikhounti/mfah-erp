"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const seedRoles_1 = require("./seeds/seedRoles");
const seedUsers_1 = require("./seeds/seedUsers");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seeding...');
    try {
        await (0, seedRoles_1.seedRoles)(prisma);
        await (0, seedUsers_1.seedUsers)(prisma);
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