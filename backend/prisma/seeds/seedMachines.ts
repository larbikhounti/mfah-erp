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
      name: 'VR Station Alpha',
      machineTypeId: vrHeadset?.id || null,
      domeId: vrCenter?.id || null,
      chairsNumber: 1, // VR stations typically have 1 chair
    },
    {
      name: 'VR Station Beta',
      machineTypeId: vrHeadset?.id || null,
      domeId: vrCenter?.id || null,
      chairsNumber: 1,
    },
    {
      name: 'Gaming Console Pro 1',
      machineTypeId: gamingConsole?.id || null,
      domeId: gamingHub?.id || null,
      chairsNumber: 4, // Gaming consoles can have multiple players
    },
    {
      name: 'Gaming Console Pro 2',
      machineTypeId: gamingConsole?.id || null,
      domeId: gamingHub?.id || null,
      chairsNumber: 4,
    },
    {
      name: 'Racing Simulator Elite',
      machineTypeId: racingSimulator?.id || null,
      domeId: gamingHub?.id || null,
      chairsNumber: 2, // Racing simulators usually have 1-2 seats
    },
    {
      name: 'Motion Platform X1',
      machineTypeId: motionPlatform?.id || null,
      domeId: entertainmentComplex?.id || null,
      chairsNumber: 6, // Motion platforms can have multiple seats
    },
    {
      name: 'Arcade Fighter 1',
      machineTypeId: arcadeCabinet?.id || null,
      domeId: entertainmentComplex?.id || null,
      chairsNumber: 2, // Fighting games typically have 2 players
    },
    {
      name: 'Arcade Fighter 2',
      machineTypeId: arcadeCabinet?.id || null,
      domeId: entertainmentComplex?.id || null,
      chairsNumber: 2,
    },
    {
      name: 'VR Station Gamma',
      machineTypeId: vrHeadset?.id || null,
      domeId: entertainmentComplex?.id || null,
      chairsNumber: 1,
    },
    {
      name: 'Racing Simulator Standard',
      machineTypeId: racingSimulator?.id || null,
      domeId: vrCenter?.id || null,
      chairsNumber: 1,
    },
  ];

  for (const machine of machines) {
    // Check if machine already exists
    const existingMachine = await prisma.machines.findFirst({
      where: {
        name: machine.name,
        deletedAt: null,
      },
    });

    if (!existingMachine) {
      const createdMachine = await prisma.machines.create({
        data: {
          name: machine.name,
          machineTypeId: machine.machineTypeId,
          domeId: machine.domeId,
        },
      });
      console.log(`Machine created: ${createdMachine.name}`);

      // Create chairs for the machine
      if (machine.chairsNumber && machine.chairsNumber > 0) {
        const chairsToCreate = [];
        for (let i = 1; i <= machine.chairsNumber; i++) {
          chairsToCreate.push({
            name: `${createdMachine.name} - Chair ${i}`,
            status: 0, // 0 = available, 1 = occupied, 2 = maintenance
            machineId: createdMachine.id,
          });
        }

        await prisma.machineChairs.createMany({
          data: chairsToCreate,
        });
        console.log(
          `Created ${machine.chairsNumber} chairs for ${createdMachine.name}`,
        );
      }
    } else {
      console.log(`Machine already exists: ${machine.name}`);
    }
  }

  console.log('Machines seeded successfully!');
}
