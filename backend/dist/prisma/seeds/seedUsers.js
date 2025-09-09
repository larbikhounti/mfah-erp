"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const bcrypt = require("bcrypt");
async function seedUsers(prisma) {
    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('password', 10);
    const user = {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        accessToken: null,
    };
    await prisma.users.upsert({
        where: { email: user.email },
        update: {},
        create: user,
    });
    console.log('Users seeded successfully!');
}
//# sourceMappingURL=seedUsers.js.map