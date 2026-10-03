import { amountToFrenchWords } from './amount-to-french-words';

describe('amountToFrenchWords', () => {
  it.each([
    [21, 'Vingt-et-un dirhams et 00 centimes.'],
    [71, 'Soixante-et-onze dirhams et 00 centimes.'],
    [80, 'Quatre-vingts dirhams et 00 centimes.'],
    [81, 'Quatre-vingt-un dirhams et 00 centimes.'],
    [91, 'Quatre-vingt-onze dirhams et 00 centimes.'],
    [100, 'Cent dirhams et 00 centimes.'],
    [200, 'Deux cents dirhams et 00 centimes.'],
    [2000, 'Deux mille dirhams et 00 centimes.'],
    [18000, 'Dix-huit mille dirhams et 00 centimes.'],
    [19800, 'Dix-neuf mille huit cents dirhams et 00 centimes.'],
  ])('%d MAD → %s', (amount, words) => {
    expect(amountToFrenchWords(amount, 'MAD')).toBe(words);
  });

  it('spells euros on EUR invoices', () => {
    expect(amountToFrenchWords(1000, 'EUR')).toBe(
      'Mille euros et 00 centimes.',
    );
  });

  it('spells millions and centimes', () => {
    expect(amountToFrenchWords(1234567.89, 'EUR')).toBe(
      'Un million deux cent trente-quatre mille cinq cent soixante-sept euros et 89 centimes.',
    );
  });

  it('rounds floating-point noise to the centime', () => {
    expect(amountToFrenchWords(10.5)).toBe('Dix dirhams et 50 centimes.');
    expect(amountToFrenchWords(0.1 + 0.2)).toBe('Zéro dirhams et 30 centimes.');
  });
});
