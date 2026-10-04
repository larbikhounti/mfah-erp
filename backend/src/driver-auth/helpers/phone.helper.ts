/** Country code assumed for local numbers written without one (0612…). */
const DEFAULT_COUNTRY_CODE = '212';

/**
 * Reduces a phone number to a canonical digits-only form so the same number
 * typed differently ("06 12 34 56 78", "+212612345678", "00212612345678")
 * always matches the same driver at login.
 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 10) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  }

  return digits;
}

export function isPlausiblePhone(normalized: string): boolean {
  return normalized.length >= 9 && normalized.length <= 15;
}
