import { tyotulovahennys } from '../engine/vero';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Työtulovähennyksesi 2026', 'Your earned income tax credit 2026'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 'v', label: T(l, 'Palkka vuodessa', 'Salary per year'), def: 42000, unit: '€', max: 2000000 }, { id: 'lapset', label: T(l, 'Alaikäiset lapset', 'Children under 18'), def: 0, max: 12 }],
  run: ({ v, lapset }: Record<string, number>) => { const puhdas = Math.max(0, v - P.vero.tulonhankkimisvahennys); const t = tyotulovahennys(v, puhdas, { lapset: Math.round(lapset) });
    const yla = P.vero.tyotulovahennys.enimmaismaara + Math.round(lapset) * P.vero.tyotulovahennys.lapsikorotus;
    return { head: [T(l, 'Työtulovähennys', 'Earned income credit'), eur(t, l)], rows: [[T(l, 'Enimmäismäärä sinulle', 'Your maximum'), eur(yla, l)], [T(l, 'Pieneneminen', 'Reduction'), eur(Math.max(0, Math.min(yla, v * P.vero.tyotulovahennys.prosentti / 100) - t), l)], [T(l, 'Kuukaudessa', 'Per month'), eur(t / 12, l)]] as Rows }; },
});
