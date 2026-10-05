/** Minilaskurien yhteiset apurit (rekisteri ohittaa: etuliite « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
import { KUNNAT } from '../engine/params';
export type L = 'fi' | 'en';
export const T = <A>(l: L, fi: A, en: A) => (l === 'en' ? en : fi);
export const eur = (x: number, l: L, d = 0) => formatMoney(x, d, l);
/** Prosentti osuudesta (0,125 → 12,5 %). */
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
/** Prosenttiluku sellaisenaan (7,3 → 7,30 %). */
export const pp = (x: number, l: L, d = 2) => formatPercent(x / 100, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const kylla = (l: L) => [{ value: '0', label: T(l, 'Ei', 'No') }, { value: '1', label: T(l, 'Kyllä', 'Yes') }];
/** Kunnat valintalistaan; arvo on indeksi KUNNAT-taulukossa (minilaskurin arvot ovat numeroita). */
export const kuntaOptiot = () => KUNNAT.map((k, i) => ({ value: String(i), label: k.nimi }));
export const kuntaIndeksi = (nimi: string) => Math.max(0, KUNNAT.findIndex((k) => k.nimi === nimi));
export const kuntaNimi = (i: number) => (KUNNAT[Math.round(i)] ?? KUNNAT[0]).nimi;
export const kirkkoOptiot = (l: L) => [{ value: '0', label: T(l, 'Ei kirkkoa', 'No church') }, { value: '1', label: T(l, 'Ev.lut.', 'Lutheran') }, { value: '2', label: T(l, 'Ortodoksi', 'Orthodox') }];
export const kirkko = (i: number) => (['ei', 'evl', 'ort'] as const)[Math.round(i)] ?? 'ei';
export type Rows = [string, string][];
