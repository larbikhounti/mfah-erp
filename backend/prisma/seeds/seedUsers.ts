import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../../generated/prisma';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  const user = {
    email: 'admin@example.com',
    name: 'Admin User',
    password: hashedPassword,
    roleId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    accessToken: null,
  };

  await prisma.users.upsert({
    where: { email: user.email },
    update: {},
    create: user,
  });

  console.log('Users seeded successfully!');
}
