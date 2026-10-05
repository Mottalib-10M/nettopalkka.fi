import { asumistuki, tuloraja } from '../engine/asumistuki';
import { T, eur, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Tulot ja asumistuki', 'Income and housing allowance'),
  cta: T(l, 'Asumistukilaskuri', 'Housing allowance calculator'),
  inputs: [{ id: 'tulot', label: T(l, 'Bruttotulot kuukaudessa', 'Gross income per month'), def: 1400, unit: '€', max: 100000 }, { id: 'k', label: T(l, 'Kunta', 'Municipality'), def: kuntaIndeksi('Oulu'), options: kuntaOptiot() }, { id: 'v', label: T(l, 'Vuokra', 'Rent'), def: 600, unit: '€/kk', max: 20000 }],
  run: ({ tulot, k, v }: Record<string, number>) => { const n = kuntaNimi(k); const r = asumistuki({ kunta: n, aikuiset: 1, lapset: 0, tulot, vuokra: v }); const raja = tuloraja(n, 1, 0);
    return { head: [T(l, 'Asumistuki yksin asuvalle', 'Allowance for a single person'), eur(r.tuki, l, 2)], rows: [[T(l, 'Perusomavastuu', 'Basic deductible'), eur(r.perusomavastuu, l, 2)], [T(l, 'Tuloraja', 'Income limit'), eur(raja, l)], [T(l, '100 € lisätuloa pienentää tukea', '€100 more income cuts the allowance by'), eur(Math.max(0, r.tuki - asumistuki({ kunta: n, aikuiset: 1, lapset: 0, tulot: tulot + 100, vuokra: v }).tuki), l, 2)]] as Rows }; },
});
