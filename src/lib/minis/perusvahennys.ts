import { perusvahennys } from '../engine/vero';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Perusvähennys tulosi mukaan', 'Basic deduction at your income'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 't', label: T(l, 'Tulo vähennysten jälkeen', 'Income after other deductions'), def: 15000, unit: '€', max: 2000000 }],
  run: ({ t }: Record<string, number>) => { const pv = perusvahennys(t); const loppuu = P.vero.perusvahennys.enimmaismaara + P.vero.perusvahennys.enimmaismaara / (P.vero.perusvahennys.pienenemisprosentti / 100);
    return { head: [T(l, 'Perusvähennys', 'Basic deduction'), eur(pv, l)], rows: [[T(l, 'Enimmäismäärä', 'Maximum'), eur(P.vero.perusvahennys.enimmaismaara, l)], [T(l, 'Vähennys loppuu tulolla', 'Ends at income'), eur(loppuu, l)], [T(l, 'Verotettavaksi jää', 'Left taxable'), eur(Math.max(0, t - pv), l)]] as Rows }; },
});
