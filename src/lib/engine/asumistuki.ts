/**
 * Yleinen asumistuki 2026 (laki 938/2014, Kelan 2026 arvot): 70 % (Ahvenanmaa 80 %) hyväksyttävien, enintään
 * kuntaryhmän enimmäismäärän asumismenojen ja perusomavastuun erotuksesta. Tulot bruttona, €/kk.
 */
import { P, r2, kunta as haeKunta } from './params';

const A = P.asumistuki;
export type Kuntaryhma = 'I' | 'II' | 'III' | 'Ahvenanmaa';
export type Lammitysalue = 'perus' | 'itainen' | 'pohjoinen';

export function kuntaryhma(nimi: string): Kuntaryhma {
  if (A.kuntaryhma_I.includes(nimi)) return 'I';
  if (A.kuntaryhma_II.includes(nimi)) return 'II';
  try { if (haeKunta(nimi).ahvenanmaa) return 'Ahvenanmaa'; } catch { /* tuntematon kunta → III */ }
  return 'III';
}

export function enimmaisasumismenot(ryhma: Kuntaryhma, henkiloita: number): number {
  const t = A.enimmaisasumismenot[ryhma];
  const n = Math.max(1, Math.round(henkiloita));
  return n <= 4 ? t[n - 1] : t[3] + (n - 4) * t[4];
}

export interface AsumistukiInput {
  kunta: string; aikuiset: number; lapset: number;
  /** Ruokakunnan bruttotulot €/kk. */
  tulot: number;
  /** Vuokra tai käyttövastike €/kk (ilman sähköä). */
  vuokra: number;
  /** Vesi maksetaan erikseen (20 €/hlö/kk hyväksytään). */
  vesiErikseen?: boolean;
  /** Lämmitys maksetaan erikseen (normi alueen mukaan). */
  lammitysErikseen?: boolean;
  lammitysalue?: Lammitysalue;
  /** Varallisuus (talletukset ym.) velkojen jälkeen, €. */
  varallisuus?: number;
}

export interface AsumistukiTulos {
  ryhma: Kuntaryhma; henkiloita: number; menot: number; enimmais: number; hyvaksytyt: number;
  tulotHuomioitu: number; perusomavastuu: number; tukiprosentti: number; tuki: number; estynyt: string | null;
}

export function asumistuki(inp: AsumistukiInput): AsumistukiTulos {
  const ryhma = kuntaryhma(inp.kunta);
  const aikuiset = Math.max(1, Math.round(inp.aikuiset)), lapset = Math.max(0, Math.round(inp.lapset));
  const n = aikuiset + lapset;
  const lammitys = A.lammitys[inp.lammitysalue ?? 'perus'];
  const menot = Math.max(0, inp.vuokra) + (inp.vesiErikseen ? A.vesimaksu_henkilo * n : 0) + (inp.lammitysErikseen ? lammitys[0] + lammitys[1] * (n - 1) : 0);
  const enimmais = enimmaisasumismenot(ryhma, n);
  const hyvaksytyt = Math.min(menot, enimmais);
  // Varallisuus: 20 % rajan (10 000 / 20 000 €) ylittävästä osasta vuodessa tuloksi; ≥ 50 000 € ei tukea.
  const V = A.varallisuus;
  const varat = Math.max(0, (inp.varallisuus ?? 0) - V.kayttovara_henkilo * n);
  if (varat >= V.este) return { ryhma, henkiloita: n, menot, enimmais, hyvaksytyt, tulotHuomioitu: inp.tulot, perusomavastuu: 0, tukiprosentti: 0, tuki: 0, estynyt: 'varallisuus' };
  const raja = aikuiset > 1 ? V.raja_useampi : V.raja_yksi;
  const varatTulona = (V.osuus / 100) * Math.max(0, varat - raja) / 12;
  const tulot = Math.round(Math.max(0, inp.tulot) + varatTulona);
  const ah = ryhma === 'Ahvenanmaa';
  const O = ah ? A.ahvenanmaa_perusomavastuu : A.perusomavastuu;
  let pov = O.kerroin * (tulot - (O.perus + O.aikuinen * aikuiset + O.lapsi * lapset));
  pov = pov < A.perusomavastuu.huomiotta_alle ? 0 : r2(pov);
  const pros = ah ? A.ahvenanmaa_tukiprosentti : A.tukiprosentti;
  let tuki = r2((pros / 100) * Math.max(0, hyvaksytyt - pov));
  const alle = tuki < A.pienin_maksettava;
  if (alle) tuki = 0;
  return { ryhma, henkiloita: n, menot: r2(menot), enimmais, hyvaksytyt: r2(hyvaksytyt), tulotHuomioitu: tulot, perusomavastuu: pov, tukiprosentti: pros, tuki, estynyt: alle ? 'pieni' : null };
}

/** Tuloraja: suurin bruttotulo €/kk, jolla tukea vielä maksetaan (vähintään 15 €), kun asumismenot ovat enimmäismäärän suuruiset. */
export function tuloraja(kunta: string, aikuiset: number, lapset: number): number {
  const ryhma = kuntaryhma(kunta);
  const e = enimmaisasumismenot(ryhma, aikuiset + lapset);
  let t = 0;
  while (t < 20000 && asumistuki({ kunta, aikuiset, lapset, tulot: t + 1, vuokra: e }).tuki > 0) t += 1;
  return t;
}
