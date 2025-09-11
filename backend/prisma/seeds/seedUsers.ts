import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('Seeding users...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Get existing roles and DOMs
  const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });
  const userRole = await prisma.roles.findUnique({ where: { name: 'USER' } });
  const managerRole = await prisma.roles.findUnique({
    where: { name: 'MANAGER' },
  });

  const vrCenter = await prisma.doms.findUnique({
    where: { name: 'VR Experience Center' },
  });
  const gamingHub = await prisma.doms.findUnique({
    where: { name: 'Gaming Hub' },
  });
  const entertainmentComplex = await prisma.doms.findUnique({
    where: { name: 'Entertainment Complex' },
  });

  const users = [
    // Admin
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role_id: adminRole?.id || 1,
      dom_id: vrCenter?.id || null,
    },

    // Managers
    {
      email: 'manager1@example.com',
      name: 'VR Manager',
      role_id: managerRole?.id || 3,
      dom_id: vrCenter?.id || null,
    },
    {
      email: 'manager2@example.com',
      name: 'Gaming Manager',
      role_id: managerRole?.id || 3,
      dom_id: gamingHub?.id || null,
    },
    {
      email: 'manager3@example.com',
      name: 'Entertainment Manager',
      role_id: managerRole?.id || 3,
      dom_id: entertainmentComplex?.id || null,
    },
  ];

  // Generate 16 regular users across the 3 DOMs
  for (let i = 1; i <= 16; i++) {
    const doms = [vrCenter?.id, gamingHub?.id, entertainmentComplex?.id];
    const dom_id = doms[i % doms.length] || null;

    users.push({
      email: `user${i}@example.com`,
      name: `User ${i}`,
      role_id: userRole?.id || 2,
      dom_id,
    });
  }

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
