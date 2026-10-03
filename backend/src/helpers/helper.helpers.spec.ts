import { InvoiceStatus } from '@prisma/client';
import {
  comparePassword,
  computeInvoiceStatus,
  hashPassword,
} from './helper.helpers';

describe('computeInvoiceStatus', () => {
  it('is UNPAID with nothing paid', () => {
    expect(computeInvoiceStatus(1000, 0)).toEqual({
      status: InvoiceStatus.UNPAID,
      paidAt: null,
    });
  });

  it('is PARTIALLY_PAID with some paid', () => {
    expect(computeInvoiceStatus(1000, 999.99)).toEqual({
      status: InvoiceStatus.PARTIALLY_PAID,
      paidAt: null,
    });
  });

  it('is PAID, with a paidAt date, once fully paid', () => {
    const result = computeInvoiceStatus(1000, 1000);
    expect(result.status).toBe(InvoiceStatus.PAID);
    expect(result.paidAt).toBeInstanceOf(Date);
  });

  it('treats an overpayment as PAID', () => {
    expect(computeInvoiceStatus(1000, 1200).status).toBe(InvoiceStatus.PAID);
  });
});

describe('hashPassword / comparePassword', () => {
  it('accepts the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('s3cret');
    expect(hash).not.toBe('s3cret');
    await expect(comparePassword('s3cret', hash)).resolves.toBe(true);
    await expect(comparePassword('wrong', hash)).resolves.toBe(false);
  });
});
