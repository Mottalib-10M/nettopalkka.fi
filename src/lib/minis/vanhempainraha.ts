import { vanhempainraha } from '../engine/paivaraha';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Vanhempainraha palkastasi', 'Parental allowance from your pay'),
  cta: T(l, 'Vanhempainrahalaskuri', 'Parental allowance calculator'),
  inputs: [{ id: 'v', label: T(l, 'Vuositulot', 'Annual income'), def: 40000, unit: '€', max: 2000000 }],
  run: ({ v }: Record<string, number>) => { const r = vanhempainraha(v);
    return { head: [T(l, 'Päiväraha arkipäivältä', 'Allowance per working day'), eur(r.pv, l, 2)], rows: [[T(l, '16 ensimmäistä päivää', 'First 16 days'), eur(r.korotettuPv, l, 2)], [T(l, 'Kuukaudessa noin', 'Per month about'), eur(r.kk, l)], [T(l, 'Vuositulo vähennyksen jälkeen', 'Annual income after deduction'), eur(r.vuositulo, l)]] as Rows }; },
});
