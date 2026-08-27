import { InvoiceStatus } from '@prisma/client';
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function computeInvoiceStatus(amount: number, amountPaid: number): {
    status: InvoiceStatus;
    paidAt: Date | null;
};
export declare function TransformToISODate(): PropertyDecorator;
