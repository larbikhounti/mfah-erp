import { HttpException, Injectable } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Transform } from 'class-transformer';
//import { dateRangesEnum } from 'src/tasks/dto/filter-tasks.dto';

export async function hashPassword(password: string): Promise<string> {
  const saltOrRounds = 10;
  const hash = await bcrypt.hash(password, saltOrRounds);
  return hash;
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// export function getDateRange(dateRange: string): { from: Date; to: Date } {
//   const now = new Date();
//   const from = new Date();
//   const to = new Date();

//   switch (dateRange) {
//     case dateRangesEnum.today:
//       from.setHours(0, 0, 0, 0);
//       to.setHours(23, 59, 59, 999);
//       break;

//     case dateRangesEnum.yesterday:
//       from.setDate(now.getDate() - 1);
//       from.setHours(0, 0, 0, 0);
//       to.setDate(now.getDate() - 1);
//       to.setHours(23, 59, 59, 999);
//       break;

//     case dateRangesEnum.last7days:
//       from.setDate(now.getDate() - 6); // includes today
//       from.setHours(0, 0, 0, 0);
//       to.setHours(23, 59, 59, 999);
//       break;

//     case dateRangesEnum.last30days:
//       from.setDate(now.getDate() - 29); // includes today
//       from.setHours(0, 0, 0, 0);
//       to.setHours(23, 59, 59, 999);
//       break;

//     case dateRangesEnum.thisMonth:
//       from.setDate(1);
//       from.setHours(0, 0, 0, 0);
//       to.setMonth(now.getMonth() + 1, 0); // last day of this month
//       to.setHours(23, 59, 59, 999);
//       break;

//     case dateRangesEnum.lastMonth:
//       from.setMonth(now.getMonth() - 1, 1);
//       from.setHours(0, 0, 0, 0);
//       to.setMonth(now.getMonth(), 0); // last day of last month
//       to.setHours(23, 59, 59, 999);
//       break;

//     default:
//       throw new HttpException('Invalid date range', 400);
//   }

//   return { from, to };
// }

/**
 * Shared amount-vs-amountPaid → status/paidAt derivation for ClientInvoice
 * and SubcontractorBill (both use the same UNPAID/PARTIALLY_PAID/PAID
 * threshold logic). Used by both models' updatePayment() and by
 * MissionsService when a mission edit changes an already-billed amount.
 */
export function computeInvoiceStatus(
  amount: number,
  amountPaid: number,
): { status: InvoiceStatus; paidAt: Date | null } {
  let status: InvoiceStatus = InvoiceStatus.UNPAID;
  if (amountPaid >= amount) {
    status = InvoiceStatus.PAID;
  } else if (amountPaid > 0) {
    status = InvoiceStatus.PARTIALLY_PAID;
  }

  return { status, paidAt: status === InvoiceStatus.PAID ? new Date() : null };
}

export function TransformToISODate() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      const iso = new Date(value).toISOString();
      return iso;
    }
    return value;
  });
}
