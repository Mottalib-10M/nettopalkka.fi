/**
 * Ansiosidonnainen työttömyyspäiväraha, yleistuki ja vanhempainraha 2026.
 * Ansiopäiväraha: TYJ:n laskentatapa (perusosa 37,21 €, ansio-osa 45 % / 20 % taitekohdan yli, vähennys 3,83 %, 21,5 pv/kk),
 * tarkistettu TYJ:n ansiopäivärahataulukosta 2026. Vanhempainraha: Kelan 2026 kaavat (vakuutusmaksuvähennys 9,07 %).
 */
import { P, r2 } from './params';

const T = P.tyottomyys;

export interface AnsioTulos { paivapalkka: number; taysiPv: number; taysiKk: number; porras1Pv: number; porras1Kk: number; porras2Pv: number; porras2Kk: number; ylitaitekohdan: boolean; kattoKaytetty: boolean }

/** Täysi ansiopäiväraha ja porrastetut tasot kuukausipalkasta (brutto, ilman lomarahaa). */
export function ansiopaivaraha(kkPalkka: number): AnsioTulos {
  const d = Math.max(0, kkPalkka) * (1 - T.vahennettava_prosentti / 100) / T.tyopaivia_kuukaudessa;
  const perus = T.perusosa_pv;
  const taite = (T.taitekohta_kerroin * perus) / T.tyopaivia_kuukaudessa;
  let ansio = (T.ansio_osa_prosentti / 100) * Math.max(0, Math.min(d, taite) - perus) + (T.ansio_osa_yli_taitekohdan / 100) * Math.max(0, d - taite);
  let pv = perus + ansio;
  const katto = (T.enintaan_prosentti_paivapalkasta / 100) * d;
  const kattoKaytetty = pv > katto;
  if (kattoKaytetty) { pv = Math.max(perus, katto); ansio = pv - perus; }
  // Porrastus koskee koko päivärahaa (80 % / 75 % täydestä), mutta ei alita perusosaa.
  const p1 = Math.max(perus, pv * T.porrastus[0].prosentti / 100);
  const p2 = Math.max(perus, pv * T.porrastus[1].prosentti / 100);
  const kk = (x: number) => r2(x * T.tyopaivia_kuukaudessa);
  return { paivapalkka: r2(d), taysiPv: r2(pv), taysiKk: kk(pv), porras1Pv: r2(p1), porras1Kk: kk(p1), porras2Pv: r2(p2), porras2Kk: kk(p2), ylitaitekohdan: d > taite, kattoKaytetty };
}

/** Enimmäiskesto päivinä: 300 (työhistoria ≤ 3 v), 400 (> 3 v), 500 (ehto täyttynyt 58-vuotiaana, 5 v työtä 20 vuodessa). */
export function enimmaiskesto(tyovuodet: number, ika: number): number {
  const K = T.enimmaiskesto;
  if (ika >= K.ikaantynyt_ika && tyovuodet >= 5) return K.ikaantynyt;
  return tyovuodet > K.tyohistoria_raja_v ? K.pitka : K.lyhyt;
}

/** Yleistuki €/kk (37,21 €/pv × 21,5), täysimääräisenä. */
export const yleistukiKk = () => r2(T.yleistuki_pv * T.tyopaivia_kuukaudessa);

const V = P.vanhempainraha;
/** Vanhempainraha €/arkipäivä 2026 vuositulosta (brutto palkka; vakuutusmaksuvähennys 9,07 % tehdään tässä). */
export function vanhempainraha(bruttoVuositulo: number): { vuositulo: number; pv: number; korotettuPv: number; kk: number } {
  const y = Math.max(0, bruttoVuositulo) * (1 - V.vakuutusmaksuvahennys_prosentti / 100);
  const [r1, r2_, r3] = V.rajat;
  let pv: number;
  if (y <= r1) pv = V.vahimmais_pv;
  else if (y <= r2_) pv = (V.prosentit[0] / 100) * y / V.jakaja;
  else if (y <= r3) pv = (V.prosentit[0] / 100) * r2_ / V.jakaja + (V.prosentit[1] / 100) * (y - r2_) / V.jakaja;
  else pv = (V.prosentit[0] / 100) * r2_ / V.jakaja + (V.prosentit[1] / 100) * (r3 - r2_) / V.jakaja + (V.prosentit[2] / 100) * (y - r3) / V.jakaja;
  let k: number;
  if (y <= V.korotettu_raja_ala) k = V.vahimmais_pv;
  else if (y <= r3) k = (V.korotettu_prosentti / 100) * y / V.jakaja;
  else k = (V.korotettu_prosentti / 100) * r3 / V.jakaja + (V.korotettu_yli_prosentti / 100) * (y - r3) / V.jakaja;
  // Kuukausi ≈ 25 arkipäivää (ma–la, 6 päivää viikossa).
  return { vuositulo: r2(y), pv: r2(Math.max(V.vahimmais_pv, pv)), korotettuPv: r2(Math.max(V.vahimmais_pv, k)), kk: r2(Math.max(V.vahimmais_pv, pv) * 25) };
}
