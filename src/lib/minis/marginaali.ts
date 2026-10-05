import { laskeVerot } from '../engine/vero';
import { T, eur, pct, num, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
/** Palkankorotuksesta käteen: marginaaliveroprosentti. */
export default (l: L) => ({
  title: T(l, 'Paljonko palkankorotuksesta jää käteen', 'How much of a pay rise you keep'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 'p', label: T(l, 'Nykyinen palkka kuukaudessa', 'Current monthly salary'), def: 3500, unit: '€', max: 200000 }, { id: 'k', label: T(l, 'Korotus kuukaudessa', 'Rise per month'), def: 200, unit: '€', max: 100000 }, { id: 'ku', label: T(l, 'Kotikunta', 'Municipality'), def: kuntaIndeksi('Helsinki'), options: kuntaOptiot() }],
  run: ({ p, k, ku }: Record<string, number>) => { const n = kuntaNimi(ku); const a = laskeVerot({ tulo: p * 12, kunta: n }), b = laskeVerot({ tulo: (p + k) * 12, kunta: n });
    const lisa = (b.netto - a.netto) / 12; const marg = k > 0 ? 1 - lisa / k : 0;
    return { head: [T(l, 'Käteen lisää kuukaudessa', 'Extra take-home per month'), eur(lisa, l)], rows: [[T(l, 'Marginaaliveroprosentti', 'Marginal tax rate'), pct(marg, l)], [T(l, 'Veroprosentti ennen / jälkeen', 'Withholding before / after'), `${num(a.veroprosentti, l, 1)} → ${num(b.veroprosentti, l, 1)} %`], [T(l, 'Vuodessa lisää', 'Extra per year'), eur(lisa * 12, l)]] as Rows }; },
});
