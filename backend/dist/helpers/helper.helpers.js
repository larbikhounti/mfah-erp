"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.TransformToISODate = TransformToISODate;
const bcrypt = require("bcrypt");
const class_transformer_1 = require("class-transformer");
async function hashPassword(password) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
}
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
function TransformToISODate() {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            const iso = new Date(value).toISOString();
            return iso;
        }
        return value;
    });
}
//# sourceMappingURL=helper.helpers.js.map