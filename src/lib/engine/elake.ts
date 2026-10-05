/**
 * Eläke 2026: eläkeikä syntymävuoden mukaan, työeläkkeen karttuminen (TyEL 1,5 %), elinaikakerroin,
 * lykkäyskorotus ja varhennusvähennys (0,4 %/kk), Kelan kansaneläke ja takuueläke, eläkkeen verotus.
 * Lähteet: tyoelake.fi, etk.fi, Finlex TyEL 395/2006, Kela Eläketaulukot 1.1.2026.
 */
import { P, r2 } from './params';
import { laskeVerot, type Kirkko } from './vero';

const E = P.elake;
export type IkaKk = [number, number];
export interface ElakeIat { alin: IkaKk; tavoite: IkaKk | null; ylin: number; ove: IkaKk; vahvistettu: boolean }

const VAHV = E.elakeika_vahvistettu as Record<string, { alin: IkaKk; tavoite: IkaKk; ylin: number; ove: IkaKk }>;
const ENN = E.elakeika_ennuste as Record<string, { alin: IkaKk; tavoite: IkaKk | null; ove: IkaKk }>;
export const ikaKuukausina = (i: IkaKk) => i[0] * 12 + i[1];
export const kuukausistaIka = (m: number): IkaKk => [Math.floor(m / 12), Math.round(m % 12)];

/** Eläkeiät. 1956–1964 vahvistettu; 1965 jälkeen tyoelake.fi:n ennuste, väliin jäävät vuodet interpoloidaan ennusteen pisteistä. */
export function elakeIat(syntymavuosi: number): ElakeIat {
  const y = Math.round(syntymavuosi);
  if (y <= 1956) return { ...VAHV['1956'], vahvistettu: true };
  if (VAHV[String(y)]) return { ...VAHV[String(y)], vahvistettu: true };
  const vuodet = Object.keys(ENN).map(Number).sort((a, b) => a - b);
  const ylin = E.ylin_elakeika_1962_jalkeen;
  if (ENN[String(y)]) return { ...ENN[String(y)], ylin, vahvistettu: false };
  const viim = vuodet[vuodet.length - 1];
  if (y >= viim) return { ...ENN[String(viim)], ylin, vahvistettu: false };
  const lo = vuodet.filter((v) => v < y).pop()!, hi = vuodet.find((v) => v > y)!;
  const t = (y - lo) / (hi - lo);
  const ip = (a: IkaKk, b: IkaKk) => kuukausistaIka(Math.round(ikaKuukausina(a) + t * (ikaKuukausina(b) - ikaKuukausina(a))));
  const A = ENN[String(lo)], B = ENN[String(hi)];
  return { alin: ip(A.alin, B.alin), tavoite: A.tavoite && B.tavoite ? ip(A.tavoite, B.tavoite) : null, ove: ip(A.ove, B.ove), ylin, vahvistettu: false };
}

/** Elinaikakerroin: vahvistettu arvo 1955–1964; myöhemmille viimeisin vahvistettu (1964) arviona. */
export function elinaikakerroin(syntymavuosi: number): { arvo: number; vahvistettu: boolean } {
  const k = (E.elinaikakerroin as Record<string, number>)[String(Math.round(syntymavuosi))];
  if (k) return { arvo: k, vahvistettu: true };
  if (syntymavuosi < 1955) return { arvo: 1, vahvistettu: false };
  return { arvo: E.elinaikakerroin_viimeisin.arvo, vahvistettu: false };
}

export interface TyoelakeInput {
  syntymavuosi: number;
  /** Nykyinen bruttopalkka €/kk. */
  kkPalkka: number;
  /** Jo kertynyt eläke €/kk (työeläkeotteesta). Jos 0, arvioidaan aloitusiästä alkaen samalla palkalla. */
  kertynyt?: number;
  /** Ikä, jolloin työnteko alkoi (käytetään vain jos kertynyt = 0). */
  aloitusIka?: number;
  /** Eläkkeen alkamisikä kuukausina; oletus alin vanhuuseläkeikä. */
  alkamisKk?: number;
  /** Vuosiansiot kuukausipalkasta: 12 kk + lomaraha (oletus 12,5). */
  kuukausiaVuodessa?: number;
  /** Laskentavuosi (ikä nyt = vuosi − syntymävuosi). */
  vuosi?: number;
}

export interface TyoelakeTulos {
  iat: ElakeIat; kerroin: { arvo: number; vahvistettu: boolean };
  ikaNyt: number; vuosiaJaljella: number; kertynytNyt: number; karttumaVuodessa: number;
  ennenKerrointa: number; lykkays: number; varhennusKk: number; kkElake: number; alkamisKk: number;
}

/** Työeläkearvio tämän päivän rahassa: kertynyt + 1,5 % vuosiansioista eläkeikään asti, × elinaikakerroin, ± lykkäys. */
export function tyoelakeArvio(inp: TyoelakeInput): TyoelakeTulos {
  const vuosi = inp.vuosi ?? P.year;
  const iat = elakeIat(inp.syntymavuosi);
  const kerroin = elinaikakerroin(inp.syntymavuosi);
  const ikaNyt = vuosi - inp.syntymavuosi;
  const alin = ikaKuukausina(iat.alin);
  const alkamisKk = Math.min(iat.ylin * 12, Math.max(alin, inp.alkamisKk ?? alin));
  const kk = inp.kuukausiaVuodessa ?? 12.5;
  const vuosiansio = Math.max(0, inp.kkPalkka) * kk;
  const karttuma = (E.karttumaprosentti / 100) * vuosiansio / 12;
  const alku = Math.max(E.karttuma_ika.alkaa, inp.aloitusIka ?? 23);
  const kertynytNyt = inp.kertynyt && inp.kertynyt > 0 ? inp.kertynyt : karttuma * Math.max(0, Math.min(ikaNyt, E.karttuma_ika.paattyy + 1) - alku);
  const vuosiaJaljella = Math.max(0, Math.min(alkamisKk / 12, E.karttuma_ika.paattyy + 1) - Math.max(ikaNyt, alku));
  const ennenKerrointa = kertynytNyt + karttuma * vuosiaJaljella;
  // Lykkäyskorotus 0,4 %/kk alimman eläkeiän jälkeen (lasketaan alimmassa iässä kertyneestä eläkkeestä).
  const lykkKk = Math.max(0, alkamisKk - alin);
  const alimmassa = kertynytNyt + karttuma * Math.max(0, Math.min(alin / 12, E.karttuma_ika.paattyy + 1) - Math.max(ikaNyt, alku));
  const lykkays = alimmassa * kerroin.arvo * (E.lykkayskorotus_prosentti_kk / 100) * lykkKk;
  const kkElake = r2(ennenKerrointa * kerroin.arvo + lykkays);
  return { iat, kerroin, ikaNyt, vuosiaJaljella, kertynytNyt: r2(kertynytNyt), karttumaVuodessa: r2(karttuma * 12), ennenKerrointa: r2(ennenKerrointa), lykkays: r2(lykkays), varhennusKk: 0, kkElake, alkamisKk };
}

/** Osittainen varhennettu vanhuuseläke: 25 tai 50 % kertyneestä, −0,4 % jokaiselta varhennuskuukaudelta. */
export function osittainenElake(kertynytKk: number, osuus: 25 | 50, varhennusKk: number): { maksu: number; vahennysProsentti: number; pysyvaMenetys: number } {
  const vahennys = (E.varhennusvahennys_ove_prosentti_kk / 100) * Math.max(0, varhennusKk);
  const osa = kertynytKk * osuus / 100;
  return { maksu: r2(osa * (1 - vahennys)), vahennysProsentti: vahennys * 100, pysyvaMenetys: r2(osa * vahennys) };
}

export interface KansanelakeTulos { kansanelake: number; takuuelake: number; tyoelake: number; yhteensa: number; asumissuhde: number }

/** Kansaneläke ja takuueläke €/kk (Kela 2026). asumisvuodet = Suomessa asuttu aika 16 vuoden iän jälkeen. */
export function kansanelake(tyoelakeKk: number, opts: { parisuhde?: boolean; asumisvuodet?: number; muutElakkeet?: number } = {}): KansanelakeTulos {
  const K = E.kansanelake, T = E.takuuelake;
  const muut = Math.max(0, tyoelakeKk) + Math.max(0, opts.muutElakkeet ?? 0);
  const asumis = opts.asumisvuodet ?? 49;
  if (asumis < K.asumisaika_vahintaan_v) return { kansanelake: 0, takuuelake: 0, tyoelake: r2(tyoelakeKk), yhteensa: r2(muut), asumissuhde: 0 };
  // Täysi kansaneläke, jos asumisaikaa vähintään 80 % 16 vuoden iästä 65 vuoden ikään (49 v); muuten suhteutetaan.
  const asumissuhde = Math.min(1, asumis / (K.tayden_asumisaikasuhde * 49));
  const taysi = (opts.parisuhde ? K.parisuhde_kk : K.yksin_kk) * asumissuhde;
  // Kela laskee vuositasolla: täysi vuosimäärä − 50 % muiden eläkkeiden 798 euron ylittävästä osasta, kuukausierä senttiin alaspäin.
  const keVuosi = taysi * 12 - K.vahennys_osuus * Math.max(0, muut * 12 - K.vahentamaton_raja_v);
  let ke = Math.floor(Math.round(keVuosi / 12 * 1e6) / 1e4) / 100;
  ke = ke < K.pienin_maksettava_kk ? 0 : ke;
  let te = r2(T.taysi_kk - (muut + ke));
  te = te < T.pienin_maksettava_kk ? 0 : te;
  return { kansanelake: ke, takuuelake: te, tyoelake: r2(tyoelakeKk), yhteensa: r2(muut + ke + te), asumissuhde };
}

/** Eläkkeen nettomäärä €/kk: verot vuositasolla eläketulona (eläketulovähennys, sairaanhoitomaksu 1,49 %). */
export function elakeNetto(bruttoKk: number, kunta: string, kirkko: Kirkko = 'ei') {
  const v = laskeVerot({ tulo: bruttoKk * 12, tulolaji: 'elake', kunta, kirkko, ika: 70 });
  return { ...v, kkNetto: r2(v.netto / 12), kkVerot: r2(v.verot / 12) };
}
