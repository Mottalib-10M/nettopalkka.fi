import { P } from '../engine/params';
import { T, eur, pp, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Työeläkemaksu palkastasi', 'Pension contribution on your pay'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'p', label: T(l, 'Bruttopalkka kuukaudessa', 'Gross salary per month'), def: 3500, unit: '€', max: 200000 }],
  run: ({ p }: Record<string, number>) => { const M = P.elake.tyel_maksu_2026; const tt = p * M.tyontekija / 100, ta = p * M.tyonantaja_keskimaarin / 100;
    return { head: [T(l, 'Sinun maksusi kuukaudessa', 'Your contribution per month'), eur(tt, l, 2)], rows: [[T(l, 'Työnantajan maksu keskimäärin', 'Employer’s average share'), `${eur(ta, l, 2)} (${pp(M.tyonantaja_keskimaarin, l)})`], [T(l, 'Yhteensä eläkevakuutukseen', 'Total into pension insurance'), `${eur(tt + ta, l, 2)} (${pp(M.yhteensa, l)})`], [T(l, 'Eläkettä karttuu kuukaudessa', 'Pension accrued per month of work'), eur(p * P.elake.karttumaprosentti / 100 / 12, l, 2)]] as Rows }; },
});
