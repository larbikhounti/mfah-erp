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
    {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role_id: adminRole?.id || 1,
      dom_id: vrCenter?.id || null,
    },
    {
      email: 'manager1@example.com',
      name: 'VR Manager',
      password: hashedPassword,
      role_id: managerRole?.id || 3,
      dom_id: vrCenter?.id || null,
    },
    {
      email: 'manager2@example.com',
      name: 'Gaming Manager',
      password: hashedPassword,
      role_id: managerRole?.id || 3,
      dom_id: gamingHub?.id || null,
    },
    {
      email: 'user1@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role_id: userRole?.id || 2,
      dom_id: vrCenter?.id || null,
    },
    {
      email: 'user2@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role_id: userRole?.id || 2,
      dom_id: gamingHub?.id || null,
    },
    {
      email: 'user3@example.com',
      name: 'Bob Wilson',
      password: hashedPassword,
      role_id: userRole?.id || 2,
      dom_id: entertainmentComplex?.id || null,
    },
  ];

  for (const user of users) {
    const createdUser = await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: user.password,
        role_id: user.role_id,
        dom_id: user.dom_id,
        accessToken: null,
      },
    });
    console.log(`User created: ${createdUser.email}`);
  }

  console.log('Users seeded successfully!');
}
