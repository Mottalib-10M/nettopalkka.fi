import { lomapaivat } from '../engine/loma';
import { T, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Montako lomapäivää olet ansainnut', 'How many holiday days you have earned'),
  cta: T(l, 'Lomarahalaskuri', 'Holiday bonus calculator'),
  inputs: [{ id: 'kk', label: T(l, 'Täydet kuukaudet 1.4.–31.3.', 'Full months 1 April to 31 March'), def: 12, max: 12 }, { id: 'a', label: T(l, 'Työsuhde alle vuoden 31.3.', 'Employed under a year on 31 March'), def: 0, options: [{ value: '0', label: T(l, 'Ei', 'No') }, { value: '1', label: T(l, 'Kyllä', 'Yes') }] }],
  run: ({ kk, a }: Record<string, number>) => { const p = lomapaivat(kk, a === 1); const kesa = Math.min(p, 24);
    return { head: [T(l, 'Lomapäiviä', 'Holiday days'), T(l, `${num(p, l)} arkipäivää`, `${num(p, l)} working days`)], rows: [[T(l, 'Viikkoina (6 arkipäivää)', 'In weeks (6 working days)'), num(p / 6, l, 1)], [T(l, 'Kesälomaa enintään', 'Summer leave up to'), num(kesa, l)], [T(l, 'Talvilomaa', 'Winter leave'), num(p - kesa, l)]] as Rows }; },
});
