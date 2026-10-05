/** Accès typé aux paramètres 2026 : toute valeur légale du site vit dans params-2026.json, jamais dans le code ni les pages. */
import raw from '../../data/params-2026.json';
import kunnatRaw from '../../data/kunnat-2026.json';

export type SourceKey = keyof typeof raw.sources;
export type Params = typeof raw;
export const P: Params = raw;

export interface Kunta { nimi: string; kunta: number; evl: number; ort: number; ahvenanmaa: boolean }
export const KUNNAT: Kunta[] = kunnatRaw.kunnat;
export const KUNNAT_META = { annettu: kunnatRaw.annettu, diaari: kunnatRaw.diaari, lahde: kunnatRaw.lahde, haettu: kunnatRaw.haettu };
export const kunta = (nimi: string): Kunta => {
  const k = KUNNAT.find((x) => x.nimi === nimi);
  if (!k) throw new Error(`Tuntematon kunta: ${nimi}`);
  return k;
};
/** Kuntien painottamaton keskiarvo (Manner-Suomi ja Ahvenanmaa). */
export const KUNTA_KESKIARVO = KUNNAT.reduce((s, k) => s + k.kunta, 0) / KUNNAT.length;

/** Pyöristys senteille (verot lasketaan sentin tarkkuudella). */
export const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
