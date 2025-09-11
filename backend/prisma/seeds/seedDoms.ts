import { PrismaClient } from '@prisma/client';

export async function seedDoms(prisma: PrismaClient) {
  console.log('Seeding DOMs...');

  const doms = [
    {
      name: 'VR Experience Center',
      address: '123 Tech Street, Downtown, City 12345',
    },
    {
      name: 'Gaming Hub',
      address: '456 Entertainment Ave, Midtown, City 54321',
    },
    {
      name: 'Entertainment Complex',
      address: '789 Fun Boulevard, Uptown, City 98765',
    },
  ];

  for (const dom of doms) {
    const createdDom = await prisma.doms.upsert({
      where: { name: dom.name },
      update: {},
      create: {
        name: dom.name,
        address: dom.address,
      },
    });
    console.log(`DOM created: ${JSON.stringify(createdDom)}`);
  }

  console.log('DOMs seeded successfully!');
}
