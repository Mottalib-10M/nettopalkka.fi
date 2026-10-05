/** Esimerkkiluvut teksteihin: aina moottorista ja parametreista, ei koskaan käsin (RECETTE §17.4, kohta 7). */
import { KUNNAT, P, KUNTA_KESKIARVO } from './engine/params';
import { kuukausiNetto, laskeVerot } from './engine/vero';

export const MANNER = KUNNAT.filter((k) => !k.ahvenanmaa);
export const HALVIN = MANNER.reduce((a, b) => (b.kunta < a.kunta ? b : a));
export const KALLEIN = MANNER.reduce((a, b) => (b.kunta > a.kunta ? b : a));
export const jarjestetty = (suunta: 1 | -1) => [...MANNER].sort((a, b) => suunta * (a.kunta - b.kunta) || a.nimi.localeCompare(b.nimi, 'fi'));
export const MEDIAANI = (() => { const s = jarjestetty(1).map((k) => k.kunta); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; })();
export const KESKIARVO = KUNTA_KESKIARVO;
export const KUNTIA = KUNNAT.length;
export const AHVENANMAAN_KUNTIA = KUNNAT.filter((k) => k.ahvenanmaa).length;
/** Kuukausinetto (vuoden todellinen netto / 12) annetussa kunnassa. */
export const netto = (kk: number, kunta: string, kirkko: 'ei' | 'evl' | 'ort' = 'ei') => kuukausiNetto(kk, { kunta, kirkko });
export const vuosiverot = (vuosi: number, kunta = 'Helsinki') => laskeVerot({ tulo: vuosi, kunta });
/** Verohallinnon esimerkkien määrä, jotka moottori toistaa sentilleen. */
export const VERO_ESIMERKKEJA = P.vero_esimerkit.palkka.length + P.vero_esimerkit.etuus.length + P.vero_esimerkit.elake.length;
