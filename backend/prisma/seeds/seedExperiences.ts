import { PrismaClient } from '@prisma/client';

export async function seedExperiences(prisma: PrismaClient) {
  console.log('Seeding experiences...');

  try {
    // Get all machines, games, and doms to create experiences
    const machines = await prisma.machines.findMany({
      where: { deletedAt: null },
      take: 10, // Limit to first 10 machines
    });

    const games = await prisma.games.findMany({
      where: { deletedAt: null },
      take: 10, // Limit to first 10 games
    });

    const doms = await prisma.doms.findMany({
      where: { deletedAt: null },
      take: 5, // Limit to first 5 doms
    });

    if (machines.length === 0 || games.length === 0 || doms.length === 0) {
      console.log(
        'Not enough machines, games, or doms to create experiences. Skipping experiences seeding.',
      );
      return;
    }

    // Create sample experiences by combining machines, games, and doms
    const experiencesToCreate = [];
    const createdCount = Math.min(20, machines.length * games.length); // Create up to 20 experiences

    for (let i = 0; i < createdCount; i++) {
      const machine = machines[i % machines.length];
      const game = games[i % games.length];
      const dom = doms[i % doms.length];

      experiencesToCreate.push({
        machineId: machine.id,
        gameId: game.id,
        domeId: dom.id,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ), // Random date within last 30 days
      });
    }

    // Check if experiences already exist to avoid duplicates
    const existingExperiences = await prisma.experiences.findMany({
      where: { deletedAt: null },
    });

    if (existingExperiences.length === 0) {
      await prisma.experiences.createMany({
        data: experiencesToCreate,
        skipDuplicates: true,
      });

      console.log(`✅ Created ${experiencesToCreate.length} experiences`);
    } else {
      console.log('✅ Experiences already exist, skipping seeding');
    }
  } catch (error) {
    console.error('❌ Error seeding experiences:', error);
    throw error;
  }
}
