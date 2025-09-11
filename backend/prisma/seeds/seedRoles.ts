import { PrismaClient } from "@prisma/client";


export async function seedRoles(prisma: PrismaClient) {
  console.log('Seeding roles...');

  const roles = [
    {
      name: 'ADMIN',
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.roles.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Role created: ${JSON.stringify(createdRole)}`);
  }

  console.log('Roles seeded successfully!');
}
