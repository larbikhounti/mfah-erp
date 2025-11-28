import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Get existing roles and DOMs
  const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });
  const managerRole = await prisma.roles.findUnique({
    where: { name: 'MANAGER' },
  });
  // Get existing roles and DOMs
  const backOfficeRole = await prisma.roles.findUnique({
    where: { name: 'back office' },
  });
  const frontOfficeRole = await prisma.roles.findUnique({
    where: { name: 'front office' },
  });

  const users = [
    // Admin
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role_id: adminRole?.id || 1,
      dom_id: null,
    },
    {
      email: 'frontoffice@example.com',
      name: 'Front Office',
      password: hashedPassword,
      role_id: frontOfficeRole.id,
      dom_id: process.env.DOM_ID ? parseInt(process.env.DOM_ID) : null,
    },
    {
      email: 'backoffice@example.com',
      name: 'Back Office',
      password: hashedPassword,
      role_id: backOfficeRole.id,
      dom_id: process.env.DOM_ID ? parseInt(process.env.DOM_ID) : null,
    },
  ];

  // Upsert all users
  for (const user of users) {
    const createdUser = await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: hashedPassword,
        role_id: user.role_id,
        dom_id: user.dom_id,
        accessToken: null,
      },
    });
    console.log(`User created: ${createdUser.email}`);
  }

  console.log('Users seeded successfully!');
}
