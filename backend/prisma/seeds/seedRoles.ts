import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  console.log('Seeding roles...');

  const roles = [
    {
      name: 'ADMIN',
    },
    {
      name: 'USER',
    },
    {
      name: 'MANAGER',
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.roles.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
      },
    });
    console.log(`Role created: ${JSON.stringify(createdRole)}`);
  }

  console.log('Roles seeded successfully!');
}
