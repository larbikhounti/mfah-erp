"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMachines = seedMachines;
async function seedMachines(prisma) {
    console.log('Seeding machines...');
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
            chairsNumber: 1,
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
            domeId: gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id,
            alias: 'C',
            chairsNumber: 4,
        },
        {
            name: 'Pro 2',
            machineTypeId: gamingConsole.id,
            domeId: gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id,
            alias: 'D',
            chairsNumber: 4,
        },
        {
            name: 'Elite',
            machineTypeId: racingSimulator.id,
            domeId: gamingHub.id,
            alias: 'E',
            chairsNumber: 2,
        },
        {
            name: 'X1',
            machineTypeId: motionPlatform.id,
            domeId: entertainmentComplex.id,
            alias: 'F',
            chairsNumber: 6,
        },
        {
            name: 'Fighter 1',
            machineTypeId: arcadeCabinet.id,
            domeId: entertainmentComplex.id,
            alias: 'G',
            chairsNumber: 2,
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
        await prisma.machineChairs.deleteMany({
            where: { machineId: upsertedMachine.id },
        });
        if (machine.chairsNumber && machine.chairsNumber > 0) {
            const chairsToCreate = [];
            for (let i = 1; i <= machine.chairsNumber; i++) {
                chairsToCreate.push({
                    name: `${upsertedMachine.name} - Chair ${i}`,
                    status: 0,
                    machineId: upsertedMachine.id,
                });
            }
            await prisma.machineChairs.createMany({
                data: chairsToCreate,
            });
            console.log(`Created ${machine.chairsNumber} chairs for ${upsertedMachine.name}`);
        }
    }
    console.log('Machines seeded successfully!');
}
//# sourceMappingURL=seedMachines.js.map