import { lomaraha } from '../engine/loma';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Lomarahasi', 'Your holiday bonus'),
  cta: T(l, 'Lomarahalaskuri', 'Holiday bonus calculator'),
  inputs: [{ id: 'p', label: T(l, 'Kuukausipalkka', 'Monthly salary'), def: 3200, unit: '€', max: 200000 }, { id: 'pv', label: T(l, 'Lomapäivät', 'Holiday days'), def: 24, max: 60 }],
  run: ({ p, pv }: Record<string, number>) => { const r = lomaraha(p, pv);
    return { head: [T(l, `Lomaraha ${P.vuosiloma.lomaraha_esimerkki_prosentti} %`, `Holiday bonus ${P.vuosiloma.lomaraha_esimerkki_prosentti}%`), eur(r.lomaraha, l)], rows: [[T(l, 'Lomapalkka', 'Holiday pay'), eur(r.lomapalkka, l)], [T(l, 'Päivän lomapalkka', 'Daily holiday pay'), eur(r.paivapalkka, l, 2)]] as Rows }; },
});
