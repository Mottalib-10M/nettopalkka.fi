import { ansiopaivaraha, enimmaiskesto } from '../engine/paivaraha';
import { P } from '../engine/params';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Päivärahan porrastus ja kesto', 'Step-down and duration'),
  cta: T(l, 'Ansiopäivärahalaskuri', 'Unemployment allowance calculator'),
  inputs: [{ id: 'p', label: T(l, 'Bruttopalkka', 'Gross salary'), def: 3200, unit: '€/kk', max: 100000 }, { id: 'tv', label: T(l, 'Työhistoria', 'Work history'), def: 6, unit: T(l, 'v', 'yrs'), max: 60 }],
  run: ({ p, tv }: Record<string, number>) => { const a = ansiopaivaraha(p); const k = enimmaiskesto(tv, 40); const T1 = P.tyottomyys.porrastus;
    const kertyma = a.taysiPv * T1[0].paivia + a.porras1Pv * (T1[1].paivia - T1[0].paivia) + a.porras2Pv * Math.max(0, k - T1[1].paivia);
    return { head: [T(l, 'Koko kauden päivärahat yhteensä', 'Total over the whole period'), eur(kertyma, l)], rows: [[T(l, `Päivät 1–${T1[0].paivia}`, `Days 1 to ${T1[0].paivia}`), eur(a.taysiKk, l)], [T(l, `Päivät ${T1[0].paivia + 1}–${T1[1].paivia}`, `Days ${T1[0].paivia + 1} to ${T1[1].paivia}`), eur(a.porras1Kk, l)], [T(l, `Päivät ${T1[1].paivia + 1}–${k}`, `Days ${T1[1].paivia + 1} to ${k}`), eur(a.porras2Kk, l)], [T(l, 'Enimmäiskesto', 'Maximum'), T(l, `${num(k, l)} päivää`, `${num(k, l)} days`)]] as Rows }; },
});
