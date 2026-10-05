import { elakeNetto } from '../engine/elake';
import { T, eur, num, kuntaOptiot, kuntaIndeksi, kuntaNimi, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Eläkkeen verot ja netto', 'Pension tax and net amount'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'e', label: T(l, 'Eläke kuukaudessa (brutto)', 'Pension per month (gross)'), def: 2000, unit: '€', max: 50000 }, { id: 'k', label: T(l, 'Kotikunta', 'Municipality'), def: kuntaIndeksi('Helsinki'), options: kuntaOptiot() }],
  run: ({ e, k }: Record<string, number>) => { const n = elakeNetto(e, kuntaNimi(k));
    return { head: [T(l, 'Nettoeläke kuukaudessa', 'Net pension per month'), eur(n.kkNetto, l)], rows: [[T(l, 'Veroprosentti', 'Withholding rate'), `${num(n.veroprosentti, l, 1)} %`], [T(l, 'Eläketulovähennys vuodessa', 'Pension income deduction per year'), eur(n.elaketulovahennys, l)], [T(l, 'Verot kuukaudessa', 'Tax per month'), eur(n.kkVerot, l)]] as Rows }; },
});
