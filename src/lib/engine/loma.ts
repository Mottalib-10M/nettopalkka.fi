/** Vuosiloma ja lomaraha (vuosilomalaki 162/2005; lomaraha TES:n mukaan, esim. 50 % lomapalkasta, tyosuojelu.fi). */
import { P, r2 } from './params';

const L = P.vuosiloma;
/** Lomapäivät (arkipäivää) täysistä lomanmääräytymiskuukausista; alle vuoden työsuhteessa 2 pv/kk. Päivän osa pyöristetään ylöspäin. */
export function lomapaivat(taydetKuukaudet: number, alleVuosi = false): number {
  const kk = Math.max(0, Math.min(12, Math.floor(taydetKuukaudet)));
  return Math.ceil(kk * (alleVuosi ? L.lomapaivat_kk_alle_vuosi : L.lomapaivat_kk) - 1e-9);
}
/** Lomaraha: TES-prosentti × lomapalkka, kun lomapäivän palkka = kuukausipalkka / 25 (sama jakaja kuin lomakorvauksessa, 17 §). */
export function lomaraha(kkPalkka: number, paivat: number, prosentti = L.lomaraha_esimerkki_prosentti) {
  const paivapalkka = Math.max(0, kkPalkka) / L.lomakorvaus_jakaja_kk;
  const lomapalkka = paivapalkka * Math.max(0, paivat);
  return { paivapalkka: r2(paivapalkka), lomapalkka: r2(lomapalkka), lomaraha: r2(lomapalkka * prosentti / 100) };
}
/** Lomakorvaus työsuhteen päättyessä: pitämättömät päivät × kuukausipalkka / 25. */
export const lomakorvaus = (kkPalkka: number, paivat: number) => r2(Math.max(0, kkPalkka) / L.lomakorvaus_jakaja_kk * Math.max(0, paivat));
/** Prosenttiperusteinen lomapalkka (9 % alle vuoden, 11,5 % vähintään vuoden työsuhteessa) tuntipalkkaiselle. */
export const prosenttilomapalkka = (vuodenPalkat: number, vahintaanVuosi: boolean) => r2(Math.max(0, vuodenPalkat) * (vahintaanVuosi ? L.prosenttiperuste[1] : L.prosenttiperuste[0]) / 100);
