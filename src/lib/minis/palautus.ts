import { laskeVerot } from '../engine/vero';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Palautus vai jäännösvero?', 'Refund or residual tax?'),
  cta: T(l, 'Verolaskuri', 'Tax refund calculator'),
  inputs: [{ id: 'v', label: T(l, 'Toteutunut vuositulo', 'Actual annual income'), def: 44000, unit: '€', max: 2000000 }, { id: 'pros', label: T(l, 'Verokortin veroprosentti', 'Tax card rate'), def: 17, unit: '%', max: 60, decimals: 1 }],
  run: ({ v, pros }: Record<string, number>) => { const r = laskeVerot({ tulo: v }); const pid = v * pros / 100; const ero = pid - r.verot;
    return { head: [ero >= 0 ? T(l, 'Veronpalautus noin', 'Refund about') : T(l, 'Jäännösvero noin', 'Residual tax about'), eur(Math.abs(ero), l)], rows: [[T(l, 'Pidätetty', 'Withheld'), eur(pid, l)], [T(l, 'Lopullinen vero', 'Final tax'), eur(r.verot, l)], [T(l, 'Oikea prosentti olisi', 'Right rate would be'), `${num(r.veroprosentti, l, 1)} %`]] as Rows }; },
});
