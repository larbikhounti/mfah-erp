"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedExperiences = seedExperiences;
async function seedExperiences(prisma) {
    console.log('Seeding experiences...');
    try {
        const machines = await prisma.machines.findMany({
            where: { deletedAt: null },
            take: 10,
        });
        const games = await prisma.games.findMany({
            where: { deletedAt: null },
            take: 10,
        });
        const doms = await prisma.doms.findMany({
            where: { deletedAt: null },
            take: 5,
        });
        if (machines.length === 0 || games.length === 0 || doms.length === 0) {
            console.log('Not enough machines, games, or doms to create experiences. Skipping experiences seeding.');
            return;
        }
        const experiencesToCreate = [];
        const createdCount = Math.min(20, machines.length * games.length);
        for (let i = 0; i < createdCount; i++) {
            const machine = machines[i % machines.length];
            const game = games[i % games.length];
            const dom = doms[i % doms.length];
            experiencesToCreate.push({
                machineId: machine.id,
                gameId: game.id,
                domeId: dom.id,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });
        }
        const existingExperiences = await prisma.experiences.findMany({
            where: { deletedAt: null },
        });
        if (existingExperiences.length === 0) {
            await prisma.experiences.createMany({
                data: experiencesToCreate,
                skipDuplicates: true,
            });
            console.log(`✅ Created ${experiencesToCreate.length} experiences`);
        }
        else {
            console.log('✅ Experiences already exist, skipping seeding');
        }
    }
    catch (error) {
        console.error('❌ Error seeding experiences:', error);
        throw error;
    }
}
//# sourceMappingURL=seedExperiences.js.map