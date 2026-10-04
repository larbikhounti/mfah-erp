import { isPlausiblePhone, normalizePhone } from './phone.helper';

describe('normalizePhone', () => {
  it.each([
    ['06 12 34 56 78', '212612345678'],
    ['+212 612-345-678', '212612345678'],
    ['00212612345678', '212612345678'],
    ['212612345678', '212612345678'],
    ['+34 612 345 678', '34612345678'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it('rejects implausibly short numbers', () => {
    expect(isPlausiblePhone(normalizePhone('0612'))).toBe(false);
  });
});
