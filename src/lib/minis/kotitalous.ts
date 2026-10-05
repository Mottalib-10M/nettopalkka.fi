import { kotitalousvahennys, kotitalousvahennysEsitys } from '../engine/kotitalous';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Kotitalousvähennys remontista tai siivouksesta', 'Household credit on renovation or cleaning'),
  cta: T(l, 'Kotitalousvähennyslaskuri', 'Household tax credit calculator'),
  inputs: [{ id: 't', label: T(l, 'Työn osuus laskusta', 'Labour share of the invoice'), def: 2500, unit: '€', max: 1000000 }],
  run: ({ t }: Record<string, number>) => { const v = kotitalousvahennys({ tyoYritys: t }), e = kotitalousvahennysEsitys({ tyoYritys: t });
    return { head: [T(l, 'Vähennys veroista', 'Tax credit'), eur(v.vahennys, l)], rows: [[T(l, 'Hallituksen esityksen mukaan', 'Under the government proposal'), eur(e.vahennys, l)], [T(l, 'Työn hinnaksi jää', 'Net labour cost'), eur(t - v.vahennys, l)]] as Rows }; },
});
