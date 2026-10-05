import { ansiopaivaraha, yleistukiKk } from '../engine/paivaraha';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Yleistuki vai ansiopäiväraha?', 'Yleistuki or earnings-related allowance?'),
  cta: T(l, 'Ansiopäivärahalaskuri', 'Unemployment allowance calculator'),
  inputs: [{ id: 'p', label: T(l, 'Bruttopalkka ennen työttömyyttä', 'Gross salary before unemployment'), def: 2800, unit: '€/kk', max: 100000 }],
  run: ({ p }: Record<string, number>) => { const a = ansiopaivaraha(p); const y = yleistukiKk();
    return { head: [T(l, 'Kassan jäsenenä saisit enemmän', 'As a fund member you would get more'), eur(a.taysiKk - y, l)], rows: [[T(l, 'Yleistuki (Kela)', 'Yleistuki (Kela)'), `${eur(y, l)} (${eur(P.tyottomyys.yleistuki_pv, l, 2)}/${T(l, 'pv', 'day')})`], [T(l, 'Ansiopäiväraha alussa', 'Earnings-related at first'), eur(a.taysiKk, l)], [T(l, 'Ansiopäiväraha 170 päivän jälkeen', 'Earnings-related after 170 days'), eur(a.porras2Kk, l)]] as Rows }; },
});
