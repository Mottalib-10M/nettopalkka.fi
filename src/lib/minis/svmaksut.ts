import { laskeVerot } from '../engine/vero';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Sairausvakuutusmaksut palkasta', 'Health insurance contributions on pay'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 'v', label: T(l, 'Palkka vuodessa', 'Salary per year'), def: 36000, unit: '€', max: 2000000 }],
  run: ({ v }: Record<string, number>) => { const r = laskeVerot({ tulo: v });
    return { head: [T(l, 'Yhteensä vuodessa', 'Total per year'), eur(r.sairaanhoitomaksu + r.paivarahamaksu, l)], rows: [[T(l, 'Sairaanhoitomaksu (verotettavasta tulosta)', 'Health care contribution (on taxable income)'), eur(r.sairaanhoitomaksu, l)], [T(l, 'Päivärahamaksu (palkasta)', 'Daily allowance contribution (on pay)'), eur(r.paivarahamaksu, l)], [T(l, 'Päivärahamaksun tuloraja', 'Daily allowance threshold'), eur(P.vero.paivarahamaksu_tuloraja, l)]] as Rows }; },
});
