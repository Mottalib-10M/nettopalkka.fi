import { enimmaisasumismenot, kuntaryhma } from '../engine/asumistuki';
import { P } from '../engine/params';
import { T, eur, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Hyväksyttävät asumismenot kunnassasi', 'Accepted housing costs in your municipality'),
  cta: T(l, 'Asumistukilaskuri', 'Housing allowance calculator'),
  inputs: [{ id: 'k', label: T(l, 'Kunta', 'Municipality'), def: kuntaIndeksi('Jyväskylä'), options: kuntaOptiot() }, { id: 'h', label: T(l, 'Henkilöitä taloudessa', 'People in the household'), def: 2, max: 12 }, { id: 'v', label: T(l, 'Vuokra', 'Rent'), def: 800, unit: '€/kk', max: 20000 }],
  run: ({ k, h, v }: Record<string, number>) => { const n = kuntaNimi(k); const r = kuntaryhma(n); const e = enimmaisasumismenot(r, h);
    return { head: [T(l, 'Enimmäismäärä', 'Maximum accepted'), `${eur(e, l)}/${T(l, 'kk', 'mo')}`], rows: [[T(l, 'Kuntaryhmä', 'Municipality group'), r === 'Ahvenanmaa' ? T(l, 'Ahvenanmaa', 'Åland') : r], [T(l, 'Vuokrasta jää huomiotta', 'Rent not counted'), eur(Math.max(0, v - e), l)], [T(l, `Tuki enintään (${P.asumistuki.tukiprosentti} %, ilman omavastuuta)`, `Allowance at most (${P.asumistuki.tukiprosentti}%, no deductible)`), eur(Math.min(v, e) * P.asumistuki.tukiprosentti / 100, l)]] as Rows }; },
});
