// Converts a DH amount to the French "amount in words" line printed at the
// bottom of the invoice template, e.g. amountToFrenchWords(8000) ->
// "Huit mille dirhams et 00 centimes." Centimes are kept as digits (not
// spelled out), matching how this line is actually written on real invoices.

const ONES = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const TENS_WORD: Record<number, string> = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
  8: 'quatre-vingt',
};

function twoDigitsToWords(n: number): string {
  if (n < 20) return ONES[n];

  const tens = Math.floor(n / 10);
  const unit = n % 10;

  // 70-79 and 90-99 are built on "soixante" (60) and "quatre-vingt" (80) plus
  // 10-19, not a genuine tens word of their own.
  if (tens === 7 || tens === 9) {
    const base = tens === 7 ? 'soixante' : 'quatre-vingt';
    if (unit === 0) return `${base}-dix`;
    if (unit === 1 && tens === 7) return 'soixante-et-onze';
    return `${base}-${ONES[10 + unit]}`;
  }

  const tensWord = TENS_WORD[tens];
  if (unit === 0) {
    // "quatre-vingts" takes an -s only when it's an exact multiple of 20
    // with nothing following; every other tens word never does.
    return tens === 8 ? 'quatre-vingts' : tensWord;
  }
  if (unit === 1 && tens !== 8) {
    return `${tensWord}-et-un`;
  }
  return `${tensWord}-${ONES[unit]}`;
}

function threeDigitsToWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let words = '';

  if (hundreds > 0) {
    words += hundreds === 1 ? 'cent' : `${ONES[hundreds]} cent`;
    // "deux cents" only takes the -s when it's an exact multiple of 100.
    if (hundreds > 1 && rest === 0) words += 's';
    if (rest > 0) words += ' ';
  }
  if (rest > 0) {
    words += twoDigitsToWords(rest);
  }

  return words;
}

function integerToFrenchWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'zéro';

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const remainder = n % 1000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(billions === 1 ? 'un milliard' : `${threeDigitsToWords(billions)} milliards`);
  }
  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${threeDigitsToWords(millions)} millions`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mille' : `${threeDigitsToWords(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(threeDigitsToWords(remainder));
  }

  return parts.join(' ');
}

export function amountToFrenchWords(
  amount: number,
  currency: 'MAD' | 'EUR' = 'MAD',
): string {
  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(rounded);
  const centimes = Math.round((rounded - integerPart) * 100);

  const words = integerToFrenchWords(integerPart);
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  const currencyWord = currency === 'EUR' ? 'euros' : 'dirhams';

  return `${capitalized} ${currencyWord} et ${String(centimes).padStart(2, '0')} centimes.`;
}
