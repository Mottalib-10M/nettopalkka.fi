/** Kotitalousvähennys 2026 (TVL 127 a–127 f): voimassa oleva laki ja hallituksen esitys (40 % / 15 % / 2 100 €, ei hyväksytty 5.10.2026). */
import { P, r2 } from './params';

const K = P.kotitalousvahennys;
export interface KotitalousInput { tyoYritys: number; palkka?: number; oljy?: number; henkiloita?: 1 | 2 }
export interface KotitalousTulos { brutto: number; vahennys: number; omavastuu: number; enimmais: number; henkiloa: number; yliJaa: number }

function laske(inp: KotitalousInput, p: { yritys_prosentti: number; palkka_prosentti: number; omavastuu: number; enimmaismaara: number }): KotitalousTulos {
  const n = inp.henkiloita ?? 1;
  const tavallinen = (p.yritys_prosentti / 100) * Math.max(0, inp.tyoYritys) + (p.palkka_prosentti / 100) * Math.max(0, inp.palkka ?? 0);
  const oljy = (K.oljylammitys.yritys_prosentti / 100) * Math.max(0, inp.oljy ?? 0);
  const brutto = tavallinen + oljy;
  // Kumpikin puoliso: oma 150 € omavastuu ja oma enimmäismäärä; kulut jaetaan tasan.
  let vahennys = 0, yli = 0;
  for (let i = 0; i < n; i++) {
    const tav = tavallinen / n, ol = oljy / n;
    const ennen = Math.max(0, tav + ol - p.omavastuu);
    const katto = ol > 0 ? K.oljylammitys.enimmaismaara : p.enimmaismaara;
    const tavRaja = Math.min(Math.max(0, tav - p.omavastuu), p.enimmaismaara);
    const v = Math.min(katto, ol > 0 ? Math.min(ennen, tavRaja + ol) : ennen);
    vahennys += v; yli += Math.max(0, ennen - v);
  }
  return { brutto: r2(brutto), vahennys: r2(vahennys), omavastuu: p.omavastuu * n, enimmais: p.enimmaismaara * n, henkiloa: n, yliJaa: r2(yli) };
}
export const kotitalousvahennys = (inp: KotitalousInput) => laske(inp, K.voimassa);
export const kotitalousvahennysEsitys = (inp: KotitalousInput) => laske(inp, K.esitys_2026_2027);
