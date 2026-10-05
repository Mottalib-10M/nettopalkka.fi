import { P } from '../engine/params';
import { T, eur, num, type L, type Rows } from './_kit';
/** Työssäoloehdon kuukaudet: täysi kuukausi ≥ 930 €, puolikas 465–930 €. */
export default (l: L) => ({
  title: T(l, 'Täyttyykö työssäoloehto?', 'Do you meet the employment condition?'),
  cta: T(l, 'Ansiopäivärahalaskuri', 'Unemployment allowance calculator'),
  inputs: [{ id: 't', label: T(l, 'Kuukausia, joina palkka vähintään raja', 'Months with pay at least the limit'), def: 9, max: 28 }, { id: 'pu', label: T(l, 'Kuukausia puolikkaalla palkalla', 'Months with half-month pay'), def: 4, max: 28 }],
  run: ({ t, pu }: Record<string, number>) => { const E = P.tyottomyys; const kertyma = Math.round(t) + Math.round(pu) / 2; const puuttuu = Math.max(0, E.tyossaoloehto_kk - kertyma);
    return { head: [T(l, 'Kertynyt työssäoloehtoa', 'Condition accrued'), T(l, `${num(kertyma, l, 1)} / ${E.tyossaoloehto_kk} kk`, `${num(kertyma, l, 1)} / ${E.tyossaoloehto_kk} months`)], rows: [[T(l, 'Täysi kuukausi', 'Full month'), `≥ ${eur(E.tyossaoloehto_palkka_kk, l)}`], [T(l, 'Puolikas kuukausi', 'Half month'), `${eur(E.tyossaoloehto_puolikas_kk, l)}–${eur(E.tyossaoloehto_palkka_kk, l)}`], [T(l, 'Puuttuu', 'Still missing'), puuttuu > 0 ? T(l, `${num(puuttuu, l, 1)} kk`, `${num(puuttuu, l, 1)} months`) : T(l, 'ehto täyttyy', 'condition met')]] as Rows }; },
});
