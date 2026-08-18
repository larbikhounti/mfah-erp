"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const bcrypt = require("bcrypt");
async function seedUsers(prisma) {
    var _a, _b, _c;
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });
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
            role_id: (_a = adminRole === null || adminRole === void 0 ? void 0 : adminRole.id) !== null && _a !== void 0 ? _a : null,
        },
        {
            email: 'frontoffice@example.com',
            name: 'Front Office',
            role_id: (_b = frontOfficeRole === null || frontOfficeRole === void 0 ? void 0 : frontOfficeRole.id) !== null && _b !== void 0 ? _b : null,
        },
        {
            email: 'backoffice@example.com',
            name: 'Back Office',
            role_id: (_c = backOfficeRole === null || backOfficeRole === void 0 ? void 0 : backOfficeRole.id) !== null && _c !== void 0 ? _c : null,
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
                accessToken: null,
            },
        });
        console.log(`User created: ${createdUser.email}`);
    }
    console.log('Users seeded successfully!');
}
//# sourceMappingURL=seedUsers.js.map