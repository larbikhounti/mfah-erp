import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });
  const backOfficeRole = await prisma.roles.findUnique({
    where: { name: 'back office' },
  });
  const frontOfficeRole = await prisma.roles.findUnique({
    where: { name: 'front office' },
  });

  const users = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role_id: adminRole?.id ?? null,
    },
    {
      email: 'frontoffice@example.com',
      name: 'Front Office',
      role_id: frontOfficeRole?.id ?? null,
    },
    {
      email: 'backoffice@example.com',
      name: 'Back Office',
      role_id: backOfficeRole?.id ?? null,
    },
  ];

  for (const user of users) {
    const createdUser = await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role_id: user.role_id,
        accessToken: null,
      },
    });
    console.log(`User created: ${createdUser.email}`);
  }

  console.log('Users seeded successfully!');
}
