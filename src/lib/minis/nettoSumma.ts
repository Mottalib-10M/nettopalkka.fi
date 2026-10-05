import { kuukausiNetto } from '../engine/vero';
import { T, eur, num, pct, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
/** Nettopalkka annetusta kuukausipalkasta ja kunnasta (palkkasivut, kuntasivut). */
export default (l: L) => ({
  title: T(l, 'Nettopalkka tällä palkalla', 'Net pay at this salary'),
  cta: T(l, 'Koko nettopalkkalaskuri', 'Full net salary calculator'),
  inputs: [{ id: 'p', label: T(l, 'Bruttopalkka kuukaudessa', 'Gross salary per month'), def: 3000, unit: '€', max: 200000 }, { id: 'k', label: T(l, 'Kotikunta', 'Municipality'), def: kuntaIndeksi('Helsinki'), options: kuntaOptiot() }],
  run: ({ p, k }: Record<string, number>) => { const r = kuukausiNetto(p, { kunta: kuntaNimi(k) });
    return { head: [T(l, 'Netto kuukaudessa', 'Net per month'), eur(r.netto / 12, l)], rows: [[T(l, 'Veroprosentti', 'Withholding rate'), `${num(r.veroprosentti, l, 1)} %`], [T(l, 'Verot vuodessa', 'Tax per year'), eur(r.verot, l)], [T(l, 'Työeläke- ja työttömyysmaksu', 'Pension and unemployment'), eur(r.tyoelakemaksu + r.tyottomyysvakuutusmaksu, l)], [T(l, 'Kaikki pidätykset palkasta', 'All deductions from pay'), pct(r.tulo ? r.pidatykset / r.tulo : 0, l)]] as Rows }; },
});
