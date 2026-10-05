import { laskeVerot, lisaprosentti } from '../engine/vero';
import { T, eur, num, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
/** Paljonko pidätetään, kun tuloraja ylittyy: lisäprosentti ylitykselle. */
export default (l: L) => ({
  title: T(l, 'Tulorajan ylitys ja lisäprosentti', 'Going over the income limit'),
  cta: T(l, 'Veroprosenttilaskuri', 'Tax rate calculator'),
  inputs: [{ id: 'raja', label: T(l, 'Verokortin tuloraja', 'Income limit on tax card'), def: 36000, unit: '€', max: 2000000 }, { id: 'yli', label: T(l, 'Tulot tulorajan yli', 'Income above the limit'), def: 4000, unit: '€', max: 2000000 }, { id: 'k', label: T(l, 'Kotikunta', 'Municipality'), def: kuntaIndeksi('Tampere'), options: kuntaOptiot() }],
  run: ({ raja, yli, k }: Record<string, number>) => { const r = laskeVerot({ tulo: raja, kunta: kuntaNimi(k) }); const lp = lisaprosentti(r); const tod = laskeVerot({ tulo: raja + yli, kunta: kuntaNimi(k) });
    const pid = raja * r.veroprosentti / 100 + yli * lp / 100;
    return { head: [T(l, 'Lisäprosentti', 'Additional rate'), `${num(lp, l, 1)} %`], rows: [[T(l, 'Pidätys ylityksestä', 'Withheld on the excess'), eur(yli * lp / 100, l)], [T(l, 'Pidätys koko vuonna', 'Withheld over the year'), eur(pid, l)], [T(l, 'Lopullinen vero', 'Final tax'), eur(tod.verot, l)], [pid >= tod.verot ? T(l, 'Palautus noin', 'Refund about') : T(l, 'Jäännösvero noin', 'Residual tax about'), eur(Math.abs(pid - tod.verot), l)]] as Rows }; },
});
