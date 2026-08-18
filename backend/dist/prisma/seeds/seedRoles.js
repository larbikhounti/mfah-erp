"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRoles = seedRoles;
async function seedRoles(prisma) {
    console.log('Seeding roles...');
    const roles = [
        {
            name: 'ADMIN',
        },
        {
            name: 'front office',
        },
        {
            name: 'back office',
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
//# sourceMappingURL=seedRoles.js.map