import { kansanelake } from '../engine/elake';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Kansaneläke ja takuueläke työeläkkeestä', 'National and guarantee pension from your work pension'),
  cta: T(l, 'Takuueläkelaskuri', 'Guarantee pension calculator'),
  inputs: [{ id: 't', label: T(l, 'Työeläke kuukaudessa', 'Work pension per month'), def: 400, unit: '€', max: 50000 }, { id: 'p', label: T(l, 'Parisuhteessa', 'In a couple'), def: 0, options: [{ value: '0', label: T(l, 'Ei', 'No') }, { value: '1', label: T(l, 'Kyllä', 'Yes') }] }],
  run: ({ t, p }: Record<string, number>) => { const k = kansanelake(t, { parisuhde: p === 1 });
    return { head: [T(l, 'Eläkkeet yhteensä', 'Total pensions'), eur(k.yhteensa, l, 2)], rows: [[T(l, 'Kansaneläke', 'National pension'), eur(k.kansanelake, l, 2)], [T(l, 'Takuueläke', 'Guarantee pension'), eur(k.takuuelake, l, 2)], [T(l, 'Kelan osuus', 'Paid by Kela'), eur(k.kansanelake + k.takuuelake, l, 2)]] as Rows }; },
});
