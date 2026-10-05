import { elakeIat, ikaKuukausina } from '../engine/elake';
import { T, type L, type Rows } from './_kit';
const ika = (m: number, l: L) => { const y = Math.floor(m / 12), k = m % 12; return l === 'fi' ? `${y} v${k ? ` ${k} kk` : ''}` : `${y} y${k ? ` ${k} m` : ''}`; };
export default (l: L) => ({
  title: T(l, 'Eläkeikäsi syntymävuoden mukaan', 'Your retirement age by year of birth'),
  cta: T(l, 'Eläkelaskuri', 'Pension calculator'),
  inputs: [{ id: 'v', label: T(l, 'Syntymävuosi', 'Year of birth'), def: 1975, options: Array.from({ length: 2008 - 1956 + 1 }, (_, i) => ({ value: String(1956 + i), label: String(1956 + i) })) }],
  run: ({ v }: Record<string, number>) => { const i = elakeIat(v); const alin = ikaKuukausina(i.alin);
    const vuosi = v + Math.floor((alin + 1) / 12);
    return { head: [T(l, 'Alin vanhuuseläkeikä', 'Earliest retirement age'), ika(alin, l)], rows: [[T(l, 'Tavoite-eläkeikä', 'Target retirement age'), i.tavoite ? ika(ikaKuukausina(i.tavoite), l) : T(l, 'ei lasketa', 'not computed')], [T(l, 'Osittainen varhennettu aikaisintaan', 'Partial early pension from'), ika(ikaKuukausina(i.ove), l)], [T(l, 'Eläke alkaa aikaisintaan vuonna', 'Pension starts at the earliest in'), String(vuosi)], [T(l, 'Tila', 'Status'), i.vahvistettu ? T(l, 'vahvistettu', 'confirmed') : T(l, 'ennuste (tyoelake.fi)', 'forecast (tyoelake.fi)')]] as Rows }; },
});
