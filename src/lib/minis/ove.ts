import { osittainenElake } from '../engine/elake';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Osittainen varhennettu vanhuuseläke', 'Partial early old-age pension'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'e', label: T(l, 'Kertynyt työeläke', 'Accrued earnings-related pension'), def: 2000, unit: '€/kk', max: 50000 }, { id: 'o', label: T(l, 'Osuus', 'Share'), def: 50, options: [{ value: '25', label: '25 %' }, { value: '50', label: '50 %' }] }, { id: 'kk', label: T(l, 'Kuukautta ennen alinta eläkeikää', 'Months before earliest retirement age'), def: 36, max: 60 }],
  run: ({ e, o, kk }: Record<string, number>) => { const r = osittainenElake(e, o === 25 ? 25 : 50, kk);
    return { head: [T(l, 'Maksetaan kuukaudessa', 'Paid per month'), eur(r.maksu, l, 2)], rows: [[T(l, 'Varhennusvähennys', 'Early-take reduction'), `${num(r.vahennysProsentti, l, 1)} %`], [T(l, 'Pysyvä menetys kuukaudessa', 'Permanent loss per month'), eur(r.pysyvaMenetys, l, 2)], [T(l, 'Jäljelle jäävä osa', 'Remaining part'), eur(e * (1 - (o === 25 ? 0.25 : 0.5)), l)]] as Rows }; },
});
