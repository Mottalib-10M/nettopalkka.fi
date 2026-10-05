import { elinaikakerroin } from '../engine/elake';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Elinaikakertoimen vaikutus eläkkeeseesi', 'Effect of the life expectancy coefficient'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'e', label: T(l, 'Kertynyt eläke ennen kerrointa', 'Accrued pension before the coefficient'), def: 2000, unit: '€/kk', max: 50000 }, { id: 'v', label: T(l, 'Syntymävuosi', 'Year of birth'), def: 1964, options: Array.from({ length: 1964 - 1955 + 1 }, (_, i) => ({ value: String(1955 + i), label: String(1955 + i) })) }],
  run: ({ e, v }: Record<string, number>) => { const k = elinaikakerroin(v);
    return { head: [T(l, 'Eläke kertoimen jälkeen', 'Pension after the coefficient'), eur(e * k.arvo, l, 2)], rows: [[T(l, 'Elinaikakerroin', 'Coefficient'), num(k.arvo, l, 5)], [T(l, 'Pienennys kuukaudessa', 'Reduction per month'), eur(e * (1 - k.arvo), l, 2)], [T(l, 'Pienennys prosentteina', 'Reduction in percent'), `${num((1 - k.arvo) * 100, l, 1)} %`]] as Rows }; },
});
