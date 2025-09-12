import { PrismaClient } from '@prisma/client';

const gamesData = [
  {
    name: 'Virtual Racing Championship',
    price: 25.99,
    playTime: 30,
    age: 10,
    gameTypeId: 1, // Action
    machineTypeId: 1, // VR Racing
  },
  {
    name: 'Space Exploration VR',
    price: 29.99,
    playTime: 45,
    age: 7,
    gameTypeId: 2, // Adventure
    machineTypeId: 2, // VR Exploration
  },
  {
    name: 'Combat Arena',
    price: 19.99,
    playTime: 20,
    age: 16,
    gameTypeId: 1, // Action
    machineTypeId: 3, // VR Combat
  },
  {
    name: 'Mystery Island Detective',
    price: 22.5,
    playTime: 35,
    age: 10,
    gameTypeId: 3, // Puzzle
    machineTypeId: 2, // VR Exploration
  },
  {
    name: 'Formula One Simulator',
    price: 35.0,
    playTime: 25,
    age: 12,
    gameTypeId: 4, // Simulation
    machineTypeId: 1, // VR Racing
  },
  {
    name: 'Zombie Apocalypse Survival',
    price: 27.99,
    playTime: 40,
    age: 18,
    gameTypeId: 1, // Action
    machineTypeId: 3, // VR Combat
  },
  {
    name: 'Ancient Temple Explorer',
    price: 24.99,
    playTime: 50,
    age: 8,
    gameTypeId: 2, // Adventure
    machineTypeId: 2, // VR Exploration
  },
  {
    name: 'Mind Bender Puzzles',
    price: 18.99,
    playTime: 30,
    age: 6,
    gameTypeId: 3, // Puzzle
    machineTypeId: 4, // VR Puzzle
  },
  {
    name: 'Flight Simulator Pro',
    price: 32.5,
    playTime: 35,
    age: 12,
    gameTypeId: 4, // Simulation
    machineTypeId: 5, // VR Flight
  },
  {
    name: 'Underwater Adventure',
    price: 26.99,
    playTime: 45,
    age: 7,
    gameTypeId: 2, // Adventure
    machineTypeId: 2, // VR Exploration
  },
  {
    name: 'Medieval Knight Tournament',
    price: 21.99,
    playTime: 25,
    age: 13,
    gameTypeId: 1, // Action
    machineTypeId: 3, // VR Combat
  },
  {
    name: 'Escape Room Challenge',
    price: 23.99,
    playTime: 60,
    age: 10,
    gameTypeId: 3, // Puzzle
    machineTypeId: 4, // VR Puzzle
  },
  {
    name: 'Galactic War Commander',
    price: 28.99,
    playTime: 40,
    age: 12,
    gameTypeId: 5, // Strategy
    machineTypeId: 6, // VR Strategy
  },
  {
    name: 'Mountain Climbing Adventure',
    price: 25.5,
    playTime: 35,
    age: 8,
    gameTypeId: 2, // Adventure
    machineTypeId: 2, // VR Exploration
  },
  {
    name: 'City Builder VR',
    price: 30.99,
    playTime: 55,
    age: 10,
    gameTypeId: 5, // Strategy
    machineTypeId: 6, // VR Strategy
  },
  {
    name: 'Horror House Experience',
    price: 24.99,
    playTime: 25,
    age: 18,
    gameTypeId: 6, // Horror
    machineTypeId: 7, // VR Horror
  },
  {
    name: 'Dance Revolution VR',
    price: 19.99,
    playTime: 20,
    age: 3,
    gameTypeId: 7, // Music
    machineTypeId: 8, // VR Music
  },
  {
    name: 'Professional Chef Simulator',
    price: 26.99,
    playTime: 40,
    age: 8,
    gameTypeId: 4, // Simulation
    machineTypeId: 9, // VR Cooking
  },
  {
    name: 'Pirate Ship Adventure',
    price: 27.5,
    playTime: 45,
    age: 10,
    gameTypeId: 2, // Adventure
    machineTypeId: 2, // VR Exploration
  },
  {
    name: 'Sports Championship',
    price: 22.99,
    playTime: 30,
    age: 7,
    gameTypeId: 8, // Sports
    machineTypeId: 10, // VR Sports
  },
];

export async function seedGames(prisma: PrismaClient) {
  console.log('Seeding games...');

  try {
    // Check if games already exist
    const existingGames = await prisma.games.count();
    if (existingGames > 0) {
      console.log('Games already seeded, skipping...');
      return;
    }

    // Get all game types and machine types to validate relationships
    const gameTypes = await prisma.gameTypes.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    const machineTypes = await prisma.machineTypes.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    const gameTypeIds = gameTypes.map((gt) => gt.id);
    const machineTypeIds = machineTypes.map((mt) => mt.id);

    // Filter games data to only include valid relationships
    const validGamesData = gamesData.filter(
      (game) =>
        (!game.gameTypeId || gameTypeIds.includes(game.gameTypeId)) &&
        (!game.machineTypeId || machineTypeIds.includes(game.machineTypeId)),
    );

    // Create games
    for (const gameData of validGamesData) {
      await prisma.games.create({
        data: gameData,
      });
    }

    console.log(`Successfully seeded ${validGamesData.length} games`);
  } catch (error) {
    console.error('Error seeding games:', error);
    throw error;
  }
}
