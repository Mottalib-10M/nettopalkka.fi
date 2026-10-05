import { laskeVerot } from '../engine/vero';
import { T, eur, pp, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
import { kunta } from '../engine/params';
export default (l: L) => ({
  title: T(l, 'Kirkollisvero kunnassasi', 'Church tax in your municipality'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 'v', label: T(l, 'Palkka vuodessa', 'Salary per year'), def: 40000, unit: '€', max: 2000000 }, { id: 'k', label: T(l, 'Kotikunta', 'Municipality'), def: kuntaIndeksi('Tampere'), options: kuntaOptiot() }],
  run: ({ v, k }: Record<string, number>) => { const n = kuntaNimi(k); const e = laskeVerot({ tulo: v, kunta: n, kirkko: 'evl' }), o = laskeVerot({ tulo: v, kunta: n, kirkko: 'ort' }); const kk = kunta(n);
    return { head: [T(l, 'Ev.lut. kirkollisvero vuodessa', 'Lutheran church tax per year'), eur(e.kirkollisvero, l)], rows: [[T(l, 'Ev.lut. prosentti', 'Lutheran rate'), pp(kk.evl, l)], [T(l, 'Ortodoksinen vero', 'Orthodox tax'), `${eur(o.kirkollisvero, l)} (${pp(kk.ort, l)})`], [T(l, 'Kuukaudessa (ev.lut.)', 'Per month (Lutheran)'), eur(e.kirkollisvero / 12, l)]] as Rows }; },
});
