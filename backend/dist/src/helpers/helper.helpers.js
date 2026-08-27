"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.computeInvoiceStatus = computeInvoiceStatus;
exports.TransformToISODate = TransformToISODate;
const client_1 = require("@prisma/client");
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
function computeInvoiceStatus(amount, amountPaid) {
    let status = client_1.InvoiceStatus.UNPAID;
    if (amountPaid >= amount) {
        status = client_1.InvoiceStatus.PAID;
    }
    else if (amountPaid > 0) {
        status = client_1.InvoiceStatus.PARTIALLY_PAID;
    }
    return { status, paidAt: status === client_1.InvoiceStatus.PAID ? new Date() : null };
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