"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedGames = seedGames;
const gamesData = [
    {
        name: 'Virtual Racing Championship',
        price: 25.99,
        playTime: 30,
        age: 10,
        gameTypeId: 1,
        machineTypeId: 1,
    },
    {
        name: 'Space Exploration VR',
        price: 29.99,
        playTime: 45,
        age: 7,
        gameTypeId: 2,
        machineTypeId: 2,
    },
    {
        name: 'Combat Arena',
        price: 19.99,
        playTime: 20,
        age: 16,
        gameTypeId: 1,
        machineTypeId: 3,
    },
    {
        name: 'Mystery Island Detective',
        price: 22.5,
        playTime: 35,
        age: 10,
        gameTypeId: 3,
        machineTypeId: 2,
    },
    {
        name: 'Formula One Simulator',
        price: 35.0,
        playTime: 25,
        age: 12,
        gameTypeId: 4,
        machineTypeId: 1,
    },
    {
        name: 'Zombie Apocalypse Survival',
        price: 27.99,
        playTime: 40,
        age: 18,
        gameTypeId: 1,
        machineTypeId: 3,
    },
    {
        name: 'Ancient Temple Explorer',
        price: 24.99,
        playTime: 50,
        age: 8,
        gameTypeId: 2,
        machineTypeId: 2,
    },
    {
        name: 'Mind Bender Puzzles',
        price: 18.99,
        playTime: 30,
        age: 6,
        gameTypeId: 3,
        machineTypeId: 4,
    },
    {
        name: 'Flight Simulator Pro',
        price: 32.5,
        playTime: 35,
        age: 12,
        gameTypeId: 4,
        machineTypeId: 5,
    },
    {
        name: 'Underwater Adventure',
        price: 26.99,
        playTime: 45,
        age: 7,
        gameTypeId: 2,
        machineTypeId: 2,
    },
    {
        name: 'Medieval Knight Tournament',
        price: 21.99,
        playTime: 25,
        age: 13,
        gameTypeId: 1,
        machineTypeId: 3,
    },
    {
        name: 'Escape Room Challenge',
        price: 23.99,
        playTime: 60,
        age: 10,
        gameTypeId: 3,
        machineTypeId: 4,
    },
    {
        name: 'Galactic War Commander',
        price: 28.99,
        playTime: 40,
        age: 12,
        gameTypeId: 5,
        machineTypeId: 6,
    },
    {
        name: 'Mountain Climbing Adventure',
        price: 25.5,
        playTime: 35,
        age: 8,
        gameTypeId: 2,
        machineTypeId: 2,
    },
    {
        name: 'City Builder VR',
        price: 30.99,
        playTime: 55,
        age: 10,
        gameTypeId: 5,
        machineTypeId: 6,
    },
    {
        name: 'Horror House Experience',
        price: 24.99,
        playTime: 25,
        age: 18,
        gameTypeId: 6,
        machineTypeId: 7,
    },
    {
        name: 'Dance Revolution VR',
        price: 19.99,
        playTime: 20,
        age: 3,
        gameTypeId: 7,
        machineTypeId: 8,
    },
    {
        name: 'Professional Chef Simulator',
        price: 26.99,
        playTime: 40,
        age: 8,
        gameTypeId: 4,
        machineTypeId: 9,
    },
    {
        name: 'Pirate Ship Adventure',
        price: 27.5,
        playTime: 45,
        age: 10,
        gameTypeId: 2,
        machineTypeId: 2,
    },
    {
        name: 'Sports Championship',
        price: 22.99,
        playTime: 30,
        age: 7,
        gameTypeId: 8,
        machineTypeId: 10,
    },
];
async function seedGames(prisma) {
    console.log('Seeding games...');
    try {
        const existingGames = await prisma.games.count();
        if (existingGames > 0) {
            console.log('Games already seeded, skipping...');
            return;
        }
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
        const validGamesData = gamesData.filter((game) => (!game.gameTypeId || gameTypeIds.includes(game.gameTypeId)) &&
            (!game.machineTypeId || machineTypeIds.includes(game.machineTypeId)));
        for (const gameData of validGamesData) {
            await prisma.games.create({
                data: gameData,
            });
        }
        console.log(`Successfully seeded ${validGamesData.length} games`);
    }
    catch (error) {
        console.error('Error seeding games:', error);
        throw error;
    }
}
//# sourceMappingURL=seedGames.js.map