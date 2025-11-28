import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seeds/seedRoles';
import { seedDoms } from './seeds/seedDoms';
import { seedMachineTypes } from './seeds/seedMachineTypes';
import { seedGameTypes } from './seeds/seedGameTypes';
import { seedMachines } from './seeds/seedMachines';
import { seedGames } from './seeds/seedGames';
import { seedUsers } from './seeds/seedUsers';
import { seedExperiences } from './seeds/seedExperiences';
import { seedTickets } from './seeds/seedTickets';

const prisma = new PrismaClient();
async function main() {
  console.log('Starting database seeding...');

  try {
    // // Seed roles first (users depend on roles)
    //  await seedRoles(prisma);

    // // // Seed DOMs (users can be assigned to DOMs)
    // await seedDoms(prisma);

    // // // Seed machine types
    // await seedMachineTypes(prisma);

    // // // Seed game types
    // await seedGameTypes(prisma);

    // // // Seed machines (depends on machine types and DOMs)
    // await seedMachines(prisma);

    // // // Seed games (depends on game types and machine types)
    // await seedGames(prisma);

    // // // Then seed users
    //await seedUsers(prisma);

    // // // Finally seed experiences (depends on machines, games, and doms)
    // await seedExperiences(prisma);

    // // // Seed tickets (depends on users, experiences, machine chairs, and doms)
    // await seedTickets(prisma);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
