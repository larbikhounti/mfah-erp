import { PrismaClient } from '@prisma/client';

export async function seedGameTypes(prisma: PrismaClient) {
  console.log('Seeding game types...');

  const gameTypes = [
    {
      name: 'Action',
    },
    {
      name: 'Adventure',
    },
    {
      name: 'Racing',
    },
    {
      name: 'Simulation',
    },
    {
      name: 'VR Experience',
    },
    {
      name: 'Puzzle',
    },
    {
      name: 'Strategy',
    },
    {
      name: 'Sport',
    },
    {
      name: 'Horror',
    },
    {
      name: 'Educational',
    },
  ];

  for (const gameType of gameTypes) {
    const createdGameType = await prisma.gameTypes.upsert({
      where: { name: gameType.name },
      update: {},
      create: {
        name: gameType.name,
      },
    });
    console.log(`Game type created: ${JSON.stringify(createdGameType)}`);
  }

  console.log('Game types seeded successfully!');
}
