"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const bcrypt = require("bcrypt");
async function seedUsers(prisma) {
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });
    const userRole = await prisma.roles.findUnique({ where: { name: 'USER' } });
    const managerRole = await prisma.roles.findUnique({
        where: { name: 'MANAGER' },
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
    const users = [
        {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role_id: (adminRole === null || adminRole === void 0 ? void 0 : adminRole.id) || 1,
            dom_id: (vrCenter === null || vrCenter === void 0 ? void 0 : vrCenter.id) || null,
        },
        {
            email: 'manager1@example.com',
            name: 'VR Manager',
            password: hashedPassword,
            role_id: (managerRole === null || managerRole === void 0 ? void 0 : managerRole.id) || 3,
            dom_id: (vrCenter === null || vrCenter === void 0 ? void 0 : vrCenter.id) || null,
        },
        {
            email: 'manager2@example.com',
            name: 'Gaming Manager',
            password: hashedPassword,
            role_id: (managerRole === null || managerRole === void 0 ? void 0 : managerRole.id) || 3,
            dom_id: (gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id) || null,
        },
        {
            email: 'user1@example.com',
            name: 'John Doe',
            password: hashedPassword,
            role_id: (userRole === null || userRole === void 0 ? void 0 : userRole.id) || 2,
            dom_id: (vrCenter === null || vrCenter === void 0 ? void 0 : vrCenter.id) || null,
        },
        {
            email: 'user2@example.com',
            name: 'Jane Smith',
            password: hashedPassword,
            role_id: (userRole === null || userRole === void 0 ? void 0 : userRole.id) || 2,
            dom_id: (gamingHub === null || gamingHub === void 0 ? void 0 : gamingHub.id) || null,
        },
        {
            email: 'user3@example.com',
            name: 'Bob Wilson',
            password: hashedPassword,
            role_id: (userRole === null || userRole === void 0 ? void 0 : userRole.id) || 2,
            dom_id: (entertainmentComplex === null || entertainmentComplex === void 0 ? void 0 : entertainmentComplex.id) || null,
        },
    ];
    for (const user of users) {
        const createdUser = await prisma.users.upsert({
            where: { email: user.email },
            update: {},
            create: {
                email: user.email,
                name: user.name,
                password: user.password,
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