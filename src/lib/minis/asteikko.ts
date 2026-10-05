import { valtionAsteikko } from '../engine/vero';
import { P } from '../engine/params';
import { T, eur, pp, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Valtion tulovero verotettavasta tulosta', 'State income tax on taxable income'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 't', label: T(l, 'Verotettava ansiotulo', 'Taxable earned income'), def: 45000, unit: '€', max: 2000000 }],
  run: ({ t }: Record<string, number>) => { const a = P.vero.valtion_asteikko; let raja = a[0]; for (const r of a) if (t > r.alaraja) raja = r;
    const v = valtionAsteikko(t);
    return { head: [T(l, 'Valtion vero ennen vähennyksiä', 'State tax before credits'), eur(v, l)], rows: [[T(l, 'Marginaaliprosentti', 'Marginal rate'), pp(raja.prosentti, l)], [T(l, 'Vero alarajalla', 'Tax at bracket floor'), eur(raja.vero_alarajalla, l)], [T(l, 'Keskimääräinen', 'Average rate'), pp(t > 0 ? v / t * 100 : 0, l)]] as Rows }; },
});
