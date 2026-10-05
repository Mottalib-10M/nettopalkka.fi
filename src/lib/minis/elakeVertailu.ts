import { P } from '../engine/params';
import { T, eur, num, type L, type Rows } from './_kit';
export default (l: L) => ({
  title: T(l, 'Eläkkeesi verrattuna keskiarvoon', 'Your pension against the average'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'e', label: T(l, 'Kokonaiseläke kuukaudessa', 'Total pension per month'), def: 1800, unit: '€', max: 50000 }],
  run: ({ e }: Record<string, number>) => { const S = P.elake.tilastot_2025;
    return { head: [T(l, 'Ero vanhuuseläkeläisten keskiarvoon', 'Gap to the average old-age pensioner'), `${e >= S.vanhuuselakkeensaaja_kk ? '+' : '−'} ${eur(Math.abs(e - S.vanhuuselakkeensaaja_kk), l)}`], rows: [[T(l, 'Vanhuuseläkeläiset 2025', 'Old-age pensioners 2025'), eur(S.vanhuuselakkeensaaja_kk, l)], [T(l, 'Naiset / miehet', 'Women / men'), `${eur(S.naiset_kk, l)} / ${eur(S.miehet_kk, l)}`], [T(l, 'Osuus keskiarvosta', 'Share of the average'), `${num(e / S.vanhuuselakkeensaaja_kk * 100, l)} %`]] as Rows }; },
});
