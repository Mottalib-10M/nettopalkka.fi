/**
 * Palkan, etuuden ja eläkkeen verot vuonna 2026 (Verohallinnon ennakonpidätyspäätös 2026, TVL).
 * Järjestys: puhdas ansiotulo → vähennykset puhtaasta ansiotulosta (työeläke- ja työttömyysvakuutusmaksu,
 * päivärahamaksu, perusvähennys) → valtion asteikko + kunnallisvero + kirkollisvero + sairaanhoitomaksu
 * → työtulovähennys ensin valtionverosta, ylijäämä muista veroista niiden suhteessa → Yle-vero.
 * Tarkistus: vero.fi:n 24 esimerkkiä 2026 (palkka, etuus, eläke) sentin tarkkuudella, ks. vero.test.ts.
 */
import { P, r2, kunta as haeKunta, type Kunta } from './params';

const V = P.vero;
export type Tulolaji = 'palkka' | 'etuus' | 'elake';
export type Kirkko = 'ei' | 'evl' | 'ort';

export interface VeroInput {
  /** Vuositulo euroina (brutto). */
  tulo: number;
  tulolaji?: Tulolaji;
  /** Kotikunta (Verohallinnon nimi) tai suoraan prosentit. */
  kunta?: string | Kunta;
  kirkko?: Kirkko;
  /** Ikä vuoden 2026 lopussa. */
  ika?: number;
  /** Alaikäiset lapset, joiden huoltaja (työtulovähennyksen korotus). */
  lapset?: number;
  /** Ainoa huoltaja: lapsikorotus kaksinkertainen. */
  ainoaHuoltaja?: boolean;
  /** Asunnon ja työpaikan väliset matkakulut vuodessa (ennen 900 euron omavastuuta). */
  matkakulut?: number;
  /** Ammattiliiton ja työttömyyskassan jäsenmaksut vuodessa (vähennetään verotuksessa, ei ennakonpidätyksessä). */
  jasenmaksut?: number;
}

export interface VeroTulos {
  tulo: number;
  puhdasAnsiotulo: number;
  tyoelakemaksu: number;
  tyottomyysvakuutusmaksu: number;
  paivarahamaksu: number;
  perusvahennys: number;
  elaketulovahennys: number;
  verotettava: number;
  valtionveroEnnen: number;
  tyotulovahennys: number;
  valtionvero: number;
  kunnallisvero: number;
  kirkollisvero: number;
  sairaanhoitomaksu: number;
  yle: number;
  elaketulonLisavero: number;
  /** Verot ja maksut, jotka Verohallinto laskee veroprosenttiin (ilman työeläke- ja työttömyysvakuutusmaksua). */
  verot: number;
  /** Kaikki palkasta pidätettävä: verot + työeläke- ja työttömyysvakuutusmaksu. */
  pidatykset: number;
  netto: number;
  /** Veroprosentti (verot / tulo), tarkka. */
  veroaste: number;
  /** Verokortin ennakonpidätysprosentti: pyöristetään ylöspäin puolen prosenttiyksikön tarkkuudella. */
  veroprosentti: number;
  ahvenanmaa: boolean;
  kunta: Kunta;
}

/** Valtion ansiotuloveroasteikko 2026 (Ahvenanmaalla prosentit −12,64 %-yks.). */
export function valtionAsteikko(verotettava: number, ahvenanmaa = false): number {
  const alennus = ahvenanmaa ? V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa : 0;
  let vero = 0;
  const a = V.valtion_asteikko;
  for (let i = 0; i < a.length; i++) {
    const lo = a[i].alaraja, hi = i + 1 < a.length ? a[i + 1].alaraja : Infinity;
    if (verotettava > lo) vero += (Math.min(verotettava, hi) - lo) * Math.max(0, a[i].prosentti - alennus) / 100;
  }
  return vero;
}

/** Perusvähennys: 4 265 € pienennettynä 18 %:lla ylittävästä tulosta (Ahvenanmaan kunnallisverotuksessa 3 925 € ja 8,4 %). */
export function perusvahennys(tulo: number, ahvenanmaa = false): number {
  const p = ahvenanmaa ? V.ahvenanmaa_perusvahennys : V.perusvahennys;
  if (tulo <= 0) return 0;
  const v = Math.max(0, p.enimmaismaara - (p.pienenemisprosentti / 100) * Math.max(0, tulo - p.enimmaismaara));
  return Math.min(v, tulo);
}

/** Työtulovähennys 2026 (TVL 125 §): 18 %, enintään 3 430 €, pienenee 2 % puhtaan ansiotulon 35 000 ja 50 550 euron välillä. */
export function tyotulovahennys(tyotulo: number, puhdas: number, opts: { lapset?: number; ainoaHuoltaja?: boolean; ika?: number } = {}): number {
  const t = V.tyotulovahennys;
  if (tyotulo <= 0) return 0;
  let enim = t.enimmaismaara + (opts.lapset ?? 0) * t.lapsikorotus * (opts.ainoaHuoltaja ? 2 : 1);
  if ((opts.ika ?? 40) >= 66) enim += t.yli65_korotus;
  const perus = Math.min((t.prosentti / 100) * tyotulo, enim);
  const pien = (t.pienenemisprosentti / 100) * Math.max(0, Math.min(puhdas, t.pienenemisen_ylaraja) - t.pienenemisraja);
  return Math.max(0, perus - pien);
}

/** Eläketulovähennys 2026 (TVL 100 §): 11 080 €, pienenee 51 % puhtaan ansiotulon ylittävästä osasta ja 22 500 euron
 *  ylittävältä osalta 19,6 %. Sama vähennys valtion- ja kunnallisverotuksessa. Pyöristetään senteille. */
export function elaketulovahennys(elake: number, puhdas: number): number {
  const e = P.elake.elaketulovahennys;
  const taysi = Math.min(e.taysi, elake);
  const yli1 = Math.max(0, Math.min(puhdas, e.toinen_raja) - e.taysi);
  const yli2 = Math.max(0, puhdas - e.toinen_raja);
  return r2(Math.max(0, taysi - (e.pienenemis_prosentti / 100) * yli1 - (e.toinen_pienenemis_prosentti / 100) * yli2));
}

export function laskeVerot(inp: VeroInput): VeroTulos {
  const tulo = Math.max(0, inp.tulo || 0);
  const laji = inp.tulolaji ?? 'palkka';
  const k = typeof inp.kunta === 'object' ? inp.kunta : haeKunta(inp.kunta ?? 'Helsinki');
  const ah = k.ahvenanmaa;
  const ika = inp.ika ?? 40;
  const kirkkoPros = inp.kirkko === 'evl' ? k.evl : inp.kirkko === 'ort' ? k.ort : 0;
  const palkka = laji === 'palkka';

  // Puhdas ansiotulo: tulonhankkimisvähennys 750 € ja matkakulut (900 € omavastuu, enintään 7 000 €) palkkatulosta.
  const thv = palkka ? Math.min(V.tulonhankkimisvahennys, tulo) : 0;
  const matka = palkka ? Math.min(V.matkakulut.enimmaismaara, Math.max(0, (inp.matkakulut ?? 0) - V.matkakulut.omavastuu)) : 0;
  const jasen = palkka ? Math.max(0, inp.jasenmaksut ?? 0) : 0;
  const puhdas = Math.max(0, tulo - Math.max(thv, 0) - matka - jasen);

  // Työntekijän maksut (vähennetään puhtaasta ansiotulosta).
  const tyel = palkka && ika >= V.tyoelakemaksu_ika.alkaa && ika < V.tyoelakemaksu_ika.paattyy_1962_ja_myohemmin ? (V.tyoelakemaksu_prosentti / 100) * tulo : 0;
  const tvr = palkka && ika >= V.tyottomyysvakuutusmaksu_ika.alkaa && ika <= V.tyottomyysvakuutusmaksu_ika.paattyy ? (V.tyottomyysvakuutusmaksu_prosentti / 100) * tulo : 0;
  const pvm = palkka && ika >= 16 && ika <= 67 && tulo >= V.paivarahamaksu_tuloraja ? (V.paivarahamaksu_prosentti / 100) * tulo : 0;

  // Eläketulovähennys (valtion- ja kunnallisverotus) eläkkeelle.
  const etvKunta = laji === 'elake' ? elaketulovahennys(tulo, puhdas) : 0;
  const etvValtio = etvKunta;

  const ennenPerus = Math.max(0, puhdas - tyel - tvr - pvm);
  const kuntaPohja = Math.max(0, ennenPerus - etvKunta);
  const pv = r2(perusvahennys(kuntaPohja, ah));
  const verotettavaKunta = Math.max(0, kuntaPohja - pv);
  // Valtionverotuksessa perusvähennys tehdään samoin (Manner-Suomi); Ahvenanmaalla valtionverotuksessa käytetään Manner-Suomen perusvähennystä.
  const valtioPohja = Math.max(0, ennenPerus - etvValtio);
  const verotettavaValtio = Math.max(0, valtioPohja - r2(perusvahennys(valtioPohja, false)));

  const valtionveroEnnen = r2(valtionAsteikko(verotettavaValtio, ah));
  let kv = r2(verotettavaKunta * k.kunta / 100);
  let kirk = r2(verotettavaKunta * kirkkoPros / 100);
  const shmPros = palkka ? V.sairaanhoitomaksu_palkka_prosentti : V.sairaanhoitomaksu_muu_tulo_prosentti;
  let shm = r2(verotettavaKunta * shmPros / 100);

  const ttv = palkka ? r2(tyotulovahennys(tulo, puhdas, { lapset: inp.lapset, ainoaHuoltaja: inp.ainoaHuoltaja, ika })) : 0;
  let valtionvero = valtionveroEnnen;
  if (ttv > 0) {
    if (ttv <= valtionvero) valtionvero = r2(valtionvero - ttv);
    else {
      const yli = ttv - valtionvero;
      valtionvero = 0;
      const muut = kv + kirk + shm;
      if (muut > 0) {
        const f = Math.max(0, 1 - yli / muut);
        kv = r2(kv * f); kirk = r2(kirk * f); shm = r2(shm * f);
      }
    }
  }

  // Yle-vero (Ahvenanmaalla mediamaksu).
  const yle = ika >= 18
    ? ah ? (puhdas > V.ahvenanmaa_mediamaksu.tuloraja ? V.ahvenanmaa_mediamaksu.maara : 0)
         : r2(Math.min(V.yle.enimmaismaara, Math.max(0, (V.yle.prosentti / 100) * (puhdas - V.yle.tuloraja))))
    : 0;
  const lisavero = laji === 'elake' ? r2(Math.max(0, tulo - etvValtio - V.elaketulon_lisavero.raja) * V.elaketulon_lisavero.prosentti / 100) : 0;

  const pvmR = r2(pvm);
  const verot = r2(valtionvero + kv + kirk + shm + yle + pvmR + lisavero);
  const tyelR = r2(tyel), tvrR = r2(tvr);
  const pidatykset = r2(verot + tyelR + tvrR);
  const veroaste = tulo > 0 ? verot / tulo : 0;
  const veroprosentti = Math.min(V.ennakonpidatys_enimmais_prosentti, Math.ceil(Math.round(veroaste * 100 * 1e6) / 1e6 * 2) / 2);
  return {
    tulo, puhdasAnsiotulo: r2(puhdas), tyoelakemaksu: tyelR, tyottomyysvakuutusmaksu: tvrR, paivarahamaksu: pvmR,
    perusvahennys: r2(pv), elaketulovahennys: r2(etvKunta), verotettava: r2(verotettavaKunta), valtionveroEnnen, tyotulovahennys: ttv,
    valtionvero, kunnallisvero: kv, kirkollisvero: kirk, sairaanhoitomaksu: shm, yle, elaketulonLisavero: lisavero,
    verot, pidatykset, netto: r2(tulo - pidatykset), veroaste, veroprosentti, ahvenanmaa: ah, kunta: k,
  };
}

/** Kuukausipalkasta: vuositulo = 12 × kuukausipalkka (+ lomaraha, jos annettu). */
export function kuukausiNetto(kuukausipalkka: number, opts: Omit<VeroInput, 'tulo'> & { lomaraha?: number } = {}) {
  const vuosi = kuukausipalkka * 12 + (opts.lomaraha ?? 0);
  const v = laskeVerot({ ...opts, tulo: vuosi });
  // Kuukausierä verokortin prosentilla: näin työnantaja pidättää (vuoden lopussa verotus tasaa).
  const kkVero = r2(kuukausipalkka * v.veroprosentti / 100);
  const kkMaksut = vuosi > 0 ? r2((v.tyoelakemaksu + v.tyottomyysvakuutusmaksu) * kuukausipalkka / vuosi) : 0;
  return { ...v, kuukausipalkka, kkVero, kkMaksut, kkNetto: r2(kuukausipalkka - kkVero - kkMaksut), kkNettoTodellinen: r2(v.netto / (vuosi > 0 ? vuosi / kuukausipalkka : 12)) };
}

/** Lisäprosentti (verokortti): asteikon prosentti + kunta + kirkko + sairaanhoitomaksu + päivärahamaksu, ≥ veroprosentti + 2. */
export function lisaprosentti(v: VeroTulos, kirkko: Kirkko = 'ei'): number {
  const a = P.vero.lisaprosenttiasteikko;
  let base = a[0].prosentti;
  for (const r of a) if (v.verotettava > r.alaraja) base = r.prosentti;
  if (v.ahvenanmaa) base -= V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa;
  const kirk = kirkko === 'evl' ? v.kunta.evl : kirkko === 'ort' ? v.kunta.ort : 0;
  const lp = base + v.kunta.kunta + kirk + V.sairaanhoitomaksu_palkka_prosentti + (v.paivarahamaksu > 0 ? V.paivarahamaksu_prosentti : 0);
  const pyor = Math.ceil(lp * 2) / 2;
  return Math.min(V.ennakonpidatys_enimmais_prosentti, Math.max(pyor, v.veroprosentti + 2));
}

/** Käänteinen laskenta: bruttokuukausipalkka, jolla vuoden todellinen nettotulo / 12 vastaa tavoitetta (puolitushaku). */
export function bruttoNetosta(tavoiteKkNetto: number, opts: Omit<VeroInput, 'tulo'> = {}): number {
  if (tavoiteKkNetto <= 0) return 0;
  let lo = 0, hi = Math.max(1000, tavoiteKkNetto * 4);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (laskeVerot({ ...opts, tulo: mid * 12 }).netto / 12 < tavoiteKkNetto) lo = mid; else hi = mid;
  }
  return r2(hi);
}
