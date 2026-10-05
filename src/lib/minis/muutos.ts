import { laskeVerot } from '../engine/vero';
import { P } from '../engine/params';
import { T, eur, num, type L, type Rows } from './_kit';
/** Muutosverokortti: palkankorotus kesken vuoden. */
export default (l: L) => ({
  title: T(l, 'Palkka nousee kesken vuoden', 'A pay rise during the year'),
  cta: T(l, 'Veroprosenttilaskuri', 'Tax rate calculator'),
  inputs: [{ id: 'vanha', label: T(l, 'Palkka alkuvuonna', 'Salary early in the year'), def: 3000, unit: '€/kk', max: 200000 }, { id: 'uusi', label: T(l, 'Uusi palkka', 'New salary'), def: 3800, unit: '€/kk', max: 200000 }, { id: 'kk', label: T(l, 'Uusi palkka alkaen kuukaudesta', 'New salary from month'), def: 7, max: 12 }],
  run: ({ vanha, uusi, kk }: Record<string, number>) => {
    const m = Math.min(12, Math.max(1, Math.round(kk)));
    const ennen = vanha * (m - 1), jalkeen = uusi * (13 - m);
    const vanhaPros = laskeVerot({ tulo: vanha * 12 }).veroprosentti;
    const koko = laskeVerot({ tulo: ennen + jalkeen });
    const jaljella = koko.verot - ennen * vanhaPros / 100;
    const uusiPros = Math.min(P.vero.ennakonpidatys_enimmais_prosentti, Math.ceil(Math.max(0, jaljella / Math.max(1, jalkeen)) * 200) / 2);
    return { head: [T(l, 'Uusi veroprosentti loppuvuodelle', 'New rate for the rest of the year'), `${num(uusiPros, l, 1)} %`], rows: [[T(l, 'Vanha prosentti', 'Old rate'), `${num(vanhaPros, l, 1)} %`], [T(l, 'Uusi tuloraja (koko vuosi)', 'New income limit (full year)'), eur(ennen + jalkeen, l)], [T(l, 'Vero vanhalla prosentilla, vajaus', 'Shortfall with the old rate'), eur(Math.max(0, koko.verot - (ennen + jalkeen) * vanhaPros / 100), l)]] as Rows }; },
});
