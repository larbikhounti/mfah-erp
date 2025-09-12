"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMachineTypes = seedMachineTypes;
async function seedMachineTypes(prisma) {
    console.log('Seeding machine types...');
    const machineTypes = [
        {
            name: 'VR Headset',
        },
        {
            name: 'Gaming Console',
        },
        {
            name: 'Racing Simulator',
        },
        {
            name: 'Motion Platform',
        },
        {
            name: 'Arcade Cabinet',
        },
    ];
    for (const machineType of machineTypes) {
        const createdMachineType = await prisma.machineTypes.upsert({
            where: { name: machineType.name },
            update: {},
            create: {
                name: machineType.name,
            },
        });
        console.log(`Machine type created: ${JSON.stringify(createdMachineType)}`);
    }
    console.log('Machine types seeded successfully!');
}
//# sourceMappingURL=seedMachineTypes.js.map