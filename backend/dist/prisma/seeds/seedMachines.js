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
            name: 'VR Station Alpha',
            machineTypeId: (vrHeadset === null || vrHeadset === void 0 ? void 0 : vrHeadset.id) || null,
            domeId: (vrCenter === null || vrCenter === void 0 ? void 0 : vrCenter.id) || null,
            chairsNumber: 1,
        },
        {
            name: 'VR Station Beta',
            machineTypeId: (vrHeadset === null || vrHeadset === void 0 ? void 0 : vrHeadset.id) || null,
            domeId: (vrCenter === null || vrCenter === void 0 ? void 0 : vrCenter.id) || null,
            chairsNumber: 1,
        },
        {
            name: 'Gaming Console Pro 1',
            machineTypeId: (gamingConsole === null || gamingConsole === void 0 ? void 0 : gamingConsole.id) || null,
            domeId: (gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id) || null,
            chairsNumber: 4,
        },
        {
            name: 'Gaming Console Pro 2',
            machineTypeId: (gamingConsole === null || gamingConsole === void 0 ? void 0 : gamingConsole.id) || null,
            domeId: (gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id) || null,
            chairsNumber: 4,
        },
        {
            name: 'Racing Simulator Elite',
            machineTypeId: (racingSimulator === null || racingSimulator === void 0 ? void 0 : racingSimulator.id) || null,
            domeId: (gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id) || null,
            chairsNumber: 2,
        },
        {
            name: 'Motion Platform X1',
            machineTypeId: (motionPlatform === null || motionPlatform === void 0 ? void 0 : motionPlatform.id) || null,
            domeId: (entertainmentComplex === null || entertainmentComplex === void 0 ? void 0 : entertainmentComplex.id) || null,
            chairsNumber: 6,
        },
        {
            name: 'Arcade Fighter 1',
            machineTypeId: (arcadeCabinet === null || arcadeCabinet === void 0 ? void 0 : arcadeCabinet.id) || null,
            domeId: (entertainmentComplex === null || entertainmentComplex === void 0 ? void 0 : entertainmentComplex.id) || null,
            chairsNumber: 2,
        },
        {
            name: 'Arcade Fighter 2',
            machineTypeId: (arcadeCabinet === null || arcadeCabinet === void 0 ? void 0 : arcadeCabinet.id) || null,
            domeId: (entertainmentComplex === null || entertainmentComplex === void 0 ? void 0 : entertainmentComplex.id) || null,
            chairsNumber: 2,
        },
        {
            name: 'VR Station Gamma',
            machineTypeId: (vrHeadset === null || vrHeadset === void 0 ? void 0 : vrHeadset.id) || null,
            domeId: (entertainmentComplex === null || entertainmentComplex === void 0 ? void 0 : entertainmentComplex.id) || null,
            chairsNumber: 1,
        },
        {
            name: 'Racing Simulator Standard',
            machineTypeId: (racingSimulator === null || racingSimulator === void 0 ? void 0 : racingSimulator.id) || null,
            domeId: (vrCenter === null || vrCenter === void 0 ? void 0 : vrCenter.id) || null,
            chairsNumber: 1,
        },
    ];
    for (const machine of machines) {
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
            if (machine.chairsNumber && machine.chairsNumber > 0) {
                const chairsToCreate = [];
                for (let i = 1; i <= machine.chairsNumber; i++) {
                    chairsToCreate.push({
                        name: `${createdMachine.name} - Chair ${i}`,
                        status: 0,
                        machineId: createdMachine.id,
                    });
                }
                await prisma.machineChairs.createMany({
                    data: chairsToCreate,
                });
                console.log(`Created ${machine.chairsNumber} chairs for ${createdMachine.name}`);
            }
        }
        else {
            console.log(`Machine already exists: ${machine.name}`);
        }
    }
    console.log('Machines seeded successfully!');
}
//# sourceMappingURL=seedMachines.js.map