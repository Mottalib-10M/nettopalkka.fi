import { laskeVerot } from '../engine/vero';
import { P } from '../engine/params';
import { T, eur, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Työmatkavähennys ja veron muutos', 'Commuting deduction and tax effect'),
  cta: T(l, 'Verolaskuri', 'Tax refund calculator'),
  inputs: [{ id: 'km', label: T(l, 'Työmatka yhteen suuntaan', 'One-way commute'), def: 25, unit: 'km', max: 500 }, { id: 'pv', label: T(l, 'Työpäiviä vuodessa', 'Working days per year'), def: 220, max: 366 }, { id: 'v', label: T(l, 'Palkka vuodessa', 'Salary per year'), def: 42000, unit: '€', max: 2000000 }],
  run: ({ km, pv, v }: Record<string, number>) => { const M = P.vero.matkakulut; const kulut = km * 2 * pv * M.oma_auto_euroa_km;
    const ilman = laskeVerot({ tulo: v }), kanssa = laskeVerot({ tulo: v, matkakulut: kulut });
    return { head: [T(l, 'Vero pienenee', 'Tax saved'), eur(ilman.verot - kanssa.verot, l)], rows: [[T(l, `Kulut omalla autolla (${eur(M.oma_auto_euroa_km, l, 2)}/km)`, `Costs by own car (${eur(M.oma_auto_euroa_km, l, 2)}/km)`), eur(kulut, l)], [T(l, 'Vähennys omavastuun jälkeen', 'Deduction after own share'), eur(Math.min(M.enimmaismaara, Math.max(0, kulut - M.omavastuu)), l)], [T(l, 'Omavastuu', 'Own share'), eur(M.omavastuu, l)]] as Rows }; },
});
