import { PrismaClient } from '../generated/prisma';
import { seedRoles } from './seeds/seedRoles';
import { seedUsers } from './seeds/seedUsers';

const prisma = new PrismaClient();
async function main() {
  console.log('Starting database seeding...');

  try {
    // Seed roles first (users depend on roles)
    await seedRoles(prisma);

    // Then seed users
    await seedUsers(prisma);

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
