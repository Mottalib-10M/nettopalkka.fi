/**
 * Yksi sivu = YKSI tiedosto `src/content/pages/<id>.ts`. Tiedosto sisältää molemmat kielet (fi, en), tekstin,
 * UKK:n, lähteet, minilaskurin ja linkitykset. Ydin (reitit, valikot, alatunniste, sivukartta, hreflang, skeemat)
 * lukee sen itse. Ohje: CONTRIBUTING-SIVUT.md.
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'fi' | 'en';
/** Valikkoryhmä: laskurit, verotus, palkka summittain, kunnat, eläke, Kelan tuet ja työttömyys. */
export type Group = 'laskurit' | 'vero' | 'palkka' | 'kunnat' | 'elake' | 'tuet';
export interface FAQ { q: string; a: string }

export interface Helpers {
  lang: Lang;
  /** Sisäinen linkki sivun tunnisteella. */
  a: (id: string, text: string) => string;
  /** Euromäärä kielen muodossa (ilman senttejä, ellei toisin pyydetä). */
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  /** Prosentti osuudesta (0,1264 → « 12,6 % »). */
  pct: (x: number, decimals?: number) => string;
  /** ISO-päivämäärä kirjoitettuna. */
  date: (iso: string) => string;
  /** Sanomalehtityylinen taulukko. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Linkki viralliseen lähteeseen (params-2026.json > sources). */
  src: (key: SourceKey, text?: string) => string;
  /** Vuoden 2026 arvot: jokainen luku tulee täältä, ei koskaan käsin tekstiin. */
  P: Params;
}

export interface PageText {
  /** URL-osa ilman vinoviivaa ja vuosilukua. */
  slug: string;
  nav: string;
  card: string;
  /** 50–60 merkkiä, hakusana ensin, vuosi 2026 mukana (RECETTE §11). */
  title: string;
  /** 150–160 merkkiä, vuosi 2026 mukana. */
  description: string;
  h1: string;
  /** Yksi lause H1:n alla. */
  intro: string;
  /** Lainattava kappale, vähintään 120 sanaa, luvut mukana (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  /** HTML-runko. `<!--mini:kind-->` lisää toisen minilaskurin. */
  body: (h: Helpers) => string;
}

export type Tool = 'netto' | 'brutto' | 'veroprosentti' | 'verolaskuri' | 'kunnat' | 'elake' | 'kansanelake' | 'asumistuki' | 'kotitalous' | 'ansiopaivaraha' | 'vanhempainpaivaraha' | 'lomaraha';

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Minilaskuri lainattavan kappaleen jälkeen (`src/lib/minis/<kind>.ts`). Ei käytetä, jos sivulla on `tool`. */
  mini?: string;
  /** Minilaskurin alkuarvot tällä sivulla (esim. palkkasivun summa). */
  miniDefaults?: Record<string, number>;
  /** Minilaskurin painikkeen kohde (oletus: etusivu). */
  miniHref?: string;
  /** Sivun täysi laskuri (vain laskurisivut). */
  tool?: Tool;
  /** Laskurin alkuarvot, esim. kunta. */
  toolPreset?: Record<string, number | string | boolean>;
  related: string[];
  sources: SourceKey[];
  fi: PageText;
  en: PageText;
}

export const definePage = (g: PageDef): PageDef => g;
