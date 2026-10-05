import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Yle-vero tuloistasi', 'Your Yle tax'),
  cta: T(l, 'Nettopalkkalaskuri', 'Net salary calculator'),
  inputs: [{ id: 't', label: T(l, 'Puhtaat ansio- ja pääomatulot', 'Net earned and capital income'), def: 20000, unit: '€', max: 2000000 }],
  run: ({ t }: Record<string, number>) => { const Y = P.vero.yle; const v = Math.min(Y.enimmaismaara, Math.max(0, (Y.prosentti / 100) * (t - Y.tuloraja)));
    const katto = Y.tuloraja + Y.enimmaismaara / (Y.prosentti / 100);
    return { head: [T(l, 'Yle-vero vuodessa', 'Yle tax per year'), eur(v, l, 2)], rows: [[T(l, 'Verovapaa raja', 'Tax-free up to'), eur(Y.tuloraja, l)], [T(l, 'Enimmäismäärä tulosta', 'Maximum reached at'), eur(katto, l)], [T(l, 'Kuukaudessa', 'Per month'), eur(v / 12, l, 2)]] as Rows }; },
});
