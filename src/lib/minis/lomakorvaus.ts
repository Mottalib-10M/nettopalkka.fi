import { lomakorvaus, prosenttilomapalkka } from '../engine/loma';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Lomakorvaus työsuhteen päättyessä', 'Holiday compensation when a job ends'),
  cta: T(l, 'Lomarahalaskuri', 'Holiday bonus calculator'),
  inputs: [{ id: 'p', label: T(l, 'Kuukausipalkka', 'Monthly salary'), def: 3000, unit: '€', max: 200000 }, { id: 'pv', label: T(l, 'Pitämättömät lomapäivät', 'Unused holiday days'), def: 12, max: 60 }],
  run: ({ p, pv }: Record<string, number>) => { const k = lomakorvaus(p, pv);
    return { head: [T(l, 'Lomakorvaus', 'Holiday compensation'), eur(k, l)], rows: [[T(l, `Päivän palkka (÷ ${P.vuosiloma.lomakorvaus_jakaja_kk})`, `Day’s pay (÷ ${P.vuosiloma.lomakorvaus_jakaja_kk})`), eur(p / P.vuosiloma.lomakorvaus_jakaja_kk, l, 2)], [T(l, `Prosenttisääntö ${P.vuosiloma.prosenttiperuste[1]} % vuoden palkoista`, `Percentage rule ${P.vuosiloma.prosenttiperuste[1]}% of a year’s pay`), eur(prosenttilomapalkka(p * 12, true), l)], [T(l, 'Vanhenee', 'Expires after'), T(l, `${P.vuosiloma.vanhentuminen_v} vuodessa`, `${P.vuosiloma.vanhentuminen_v} years`)]] as Rows }; },
});
