import { PrismaClient } from '@prisma/client';

export async function seedMachines(prisma: PrismaClient) {
  console.log('Seeding machines...');

  // Get existing machine types and DOMs
  const vrHeadset = await prisma.machineTypes.findUnique({
    where: { name: 'VR Headset' },
  });
  const gamingConsole = await prisma.machineTypes.findUnique({
    where: { name: 'Gaming Console' },
  });
  const racingSimulator = await prisma.machineTypes.findUnique({
    where: { name: 'Racing Simulator' },
  });
  const motionPlatform = await prisma.machineTypes.findUnique({
    where: { name: 'Motion Platform' },
  });
  const arcadeCabinet = await prisma.machineTypes.findUnique({
    where: { name: 'Arcade Cabinet' },
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

  const machines = [
    {
      name: 'Alpha',
      machineTypeId: vrHeadset.id,
      domeId: vrCenter.id,
      alias: 'A',
      chairsNumber: 1, // VR stations typically have 1 chair
    },
    {
      name: 'Beta',
      machineTypeId: vrHeadset.id,
      domeId: vrCenter.id,
      alias: 'B',
      chairsNumber: 1,
    },
    {
      name: 'Pro 1',
      machineTypeId: gamingConsole.id,
      domeId: gamingHub?.id,
      alias: 'C',
      chairsNumber: 4, // Gaming consoles can have multiple players
    },
    {
      name: 'Pro 2',
      machineTypeId: gamingConsole.id,
      domeId: gamingHub?.id,
      alias: 'D',
      chairsNumber: 4,
    },
    {
      name: 'Elite',
      machineTypeId: racingSimulator.id,
      domeId: gamingHub.id,
      alias: 'E',
      chairsNumber: 2, // Racing simulators usually have 1-2 seats
    },
    {
      name: 'X1',
      machineTypeId: motionPlatform.id,
      domeId: entertainmentComplex.id,
      alias: 'F',
      chairsNumber: 6, // Motion platforms can have multiple seats
    },
    {
      name: 'Fighter 1',
      machineTypeId: arcadeCabinet.id,
      domeId: entertainmentComplex.id,
      alias: 'G',
      chairsNumber: 2, // Fighting games typically have 2 players
    },
    {
      name: 'Fighter 2',
      machineTypeId: arcadeCabinet.id,
      domeId: entertainmentComplex.id,
      alias: 'H',
      chairsNumber: 2,
    },
    {
      name: 'Gamma',
      machineTypeId: vrHeadset.id,
      domeId: entertainmentComplex.id,
      alias: 'I',
      chairsNumber: 1,
    },
    {
      name: 'Standard',
      machineTypeId: racingSimulator.id,
      domeId: vrCenter.id,
      alias: 'J',
      chairsNumber: 1,
    },
  ];

  for (const machine of machines) {
    const upsertedMachine = await prisma.machines.upsert({
      where: { alias: machine.alias },
      update: {
        name: machine.name,
        machineTypeId: machine.machineTypeId,
        domeId: machine.domeId,
      },
      create: {
        name: machine.name,
        machineTypeId: machine.machineTypeId,
        domeId: machine.domeId,
        alias: machine.alias,
      },
    });
    console.log(`Machine upserted: ${upsertedMachine.name}`);

    // Delete existing chairs and recreate them
    await prisma.machineChairs.deleteMany({
      where: { machineId: upsertedMachine.id },
    });

    // Create chairs for the machine
    if (machine.chairsNumber && machine.chairsNumber > 0) {
      const chairsToCreate = [];
      for (let i = 1; i <= machine.chairsNumber; i++) {
        chairsToCreate.push({
          name: `${upsertedMachine.name} - Chair ${i}`,
          status: 0, // 0 = available, 1 = occupied, 2 = maintenance
          machineId: upsertedMachine.id,
        });
      }

      await prisma.machineChairs.createMany({
        data: chairsToCreate,
      });
      console.log(
        `Created ${machine.chairsNumber} chairs for ${upsertedMachine.name}`,
      );
    }
  }

  console.log('Machines seeded successfully!');
}
