/**
 * Lukujen muotoilu body(h):n ulkopuolisiin teksteihin (lainattava kappale, UKK, otsikot). Jokainen lakiin
 * perustuva luku tulee P:stä ja jokainen esimerkkitulos moottorista; kirjoitetaan vain näillä (RECETTE §4.1, §17.4).
 */
import { formatMoney, formatNumber, formatPercent } from './format';
export { P } from './engine/params';
const mk = (l: 'fi' | 'en') => ({
  eur: (n: number, d = 0) => formatMoney(n, d, l),
  num: (n: number, d = 0) => formatNumber(n, d, l),
  /** Prosentti osuudesta (0,3 → « 30 % »). */
  pct: (x: number, d = 0) => formatPercent(x, d, l),
  /** Prosenttiluku sellaisenaan (7.3 → « 7,30 % »), virallisten lukujen desimaaleilla. */
  p: (x: number, d = 2) => formatPercent(x / 100, d, l),
});
export const FI = mk('fi');
export const EN = mk('en');
