import { laskeVerot } from '../engine/vero';
import { T, eur, num, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Verokortin veroprosentti vuositulosta', 'Tax card rate from annual income'),
  cta: T(l, 'Veroprosenttilaskuri', 'Tax rate calculator'),
  inputs: [{ id: 'v', label: T(l, 'Arvioitu vuositulo 2026', 'Estimated 2026 income'), def: 40000, unit: '€', max: 2000000 }, { id: 'k', label: T(l, 'Kotikunta', 'Municipality'), def: kuntaIndeksi('Helsinki'), options: kuntaOptiot() }],
  run: ({ v, k }: Record<string, number>) => { const r = laskeVerot({ tulo: v, kunta: kuntaNimi(k) });
    return { head: [T(l, 'Veroprosentti', 'Withholding rate'), `${num(r.veroprosentti, l, 1)} %`], rows: [[T(l, 'Tuloraja', 'Income limit'), eur(v, l)], [T(l, 'Verot vuodessa', 'Tax per year'), eur(r.verot, l)], [T(l, 'Tarkka veroaste', 'Exact tax rate'), `${num(r.veroaste * 100, l, 2)} %`]] as Rows }; },
});
