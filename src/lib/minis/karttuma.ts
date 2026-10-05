import { P } from '../engine/params';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Paljonko eläkettä karttuu vuodessa', 'How much pension one year earns'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'p', label: T(l, 'Bruttopalkka kuukaudessa', 'Gross salary per month'), def: 3500, unit: '€', max: 200000 }, { id: 'v', label: T(l, 'Työvuosia', 'Years of work'), def: 40, max: 53 }],
  run: ({ p, v }: Record<string, number>) => { const k = P.elake.karttumaprosentti / 100; const vuosi = p * 12 * k / 12;
    return { head: [T(l, 'Eläkettä yhdestä vuodesta', 'Pension from one year'), `${eur(vuosi, l, 2)}/${T(l, 'kk', 'mo')}`], rows: [[T(l, `${num(v, l)} vuodesta`, `From ${num(v, l)} years`), `${eur(vuosi * v, l)}/${T(l, 'kk', 'mo')}`], [T(l, 'Osuus palkasta', 'Share of salary'), `${num(Math.min(100, k * v * 100), l, 0)} %`], [T(l, 'Karttumaprosentti', 'Accrual rate'), `${num(P.elake.karttumaprosentti, l, 1)} %`]] as Rows }; },
});
