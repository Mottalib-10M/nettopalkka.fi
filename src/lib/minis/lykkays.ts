import { P } from '../engine/params';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Eläkkeen lykkääminen', 'Deferring your pension'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'e', label: T(l, 'Eläke alimmassa iässä', 'Pension at earliest age'), def: 1900, unit: '€/kk', max: 50000 }, { id: 'kk', label: T(l, 'Lykkäys', 'Deferral'), def: 12, unit: T(l, 'kk', 'mo'), max: 60 }, { id: 'p', label: T(l, 'Palkka lykkäyksen aikana', 'Salary while deferring'), def: 3000, unit: '€/kk', max: 200000 }],
  run: ({ e, kk, p }: Record<string, number>) => { const kor = e * P.elake.lykkayskorotus_prosentti_kk / 100 * kk; const uusi = p * kk * P.elake.karttumaprosentti / 100 / 12;
    return { head: [T(l, 'Eläke lykkäyksen jälkeen', 'Pension after deferral'), eur(e + kor + uusi, l)], rows: [[T(l, 'Lykkäyskorotus', 'Deferral increase'), `+ ${eur(kor, l)} (${num(P.elake.lykkayskorotus_prosentti_kk * kk, l, 1)} %)`], [T(l, 'Uutta karttumaa', 'New accrual'), `+ ${eur(uusi, l)}`], [T(l, 'Eläkettä jää saamatta lykkäyksen aikana', 'Pension forgone while deferring'), eur(e * kk, l)]] as Rows }; },
});
