"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const bcrypt = require("bcrypt");
async function seedUsers(prisma) {
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });
    const managerRole = await prisma.roles.findUnique({
        where: { name: 'MANAGER' },
    });
    const backOfficeRole = await prisma.roles.findUnique({
        where: { name: 'back office' },
    });
    const frontOfficeRole = await prisma.roles.findUnique({
        where: { name: 'front office' },
    });
    const users = [
        {
            email: 'admin@example.com',
            name: 'Admin User',
            role_id: (adminRole === null || adminRole === void 0 ? void 0 : adminRole.id) || 1,
            dom_id: null,
        },
        {
            email: 'frontoffice@example.com',
            name: 'Front Office',
            password: hashedPassword,
            role_id: frontOfficeRole.id,
            dom_id: process.env.DOM_ID ? parseInt(process.env.DOM_ID) : null,
        },
        {
            email: 'backoffice@example.com',
            name: 'Back Office',
            password: hashedPassword,
            role_id: backOfficeRole.id,
            dom_id: process.env.DOM_ID ? parseInt(process.env.DOM_ID) : null,
        },
    ];
    for (const user of users) {
        const createdUser = await prisma.users.upsert({
            where: { email: user.email },
            update: {},
            create: {
                email: user.email,
                name: user.name,
                password: hashedPassword,
                role_id: user.role_id,
                dom_id: user.dom_id,
                accessToken: null,
            },
        });
        console.log(`User created: ${createdUser.email}`);
    }
    console.log('Users seeded successfully!');
}
//# sourceMappingURL=seedUsers.js.map