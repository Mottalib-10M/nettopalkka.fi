import { describe, expect, it } from 'vitest';
import { elakeIat, elinaikakerroin, tyoelakeArvio, kansanelake, osittainenElake, elakeNetto } from './elake';
import { P } from './params';

describe('Kela 2026 : exemples officiels kansaneläke + takuueläke', () => {
  for (const [ty, ke, te] of P.elake.takuuelake_esimerkit.yksin) {
    it(`yksin, työeläke ${ty} → ${ke} + ${te}`, () => { const r = kansanelake(ty); expect(r.kansanelake).toBeCloseTo(ke, 2); expect(r.takuuelake).toBeCloseTo(te, 2); });
  }
  for (const [ty, ke, te] of P.elake.takuuelake_esimerkit.pari) {
    it(`pari, työeläke ${ty} → ${ke} + ${te}`, () => { const r = kansanelake(ty, { parisuhde: true }); expect(r.kansanelake).toBeCloseTo(ke, 2); expect(r.takuuelake).toBeCloseTo(te, 2); });
  }
  it('pas de kansaneläke au-delà de 1 624,63 €/kk (yksin)', () => {
    expect(kansanelake(1624.0).kansanelake).toBeGreaterThan(0);
    expect(kansanelake(1625.5).kansanelake).toBe(0);
  });
  it('asumisaika : moins de 3 ans → rien ; 20 ans → proratisé', () => {
    expect(kansanelake(0, { asumisvuodet: 2 }).kansanelake).toBe(0);
    expect(kansanelake(0, { asumisvuodet: 20 }).kansanelake).toBeLessThan(787.07);
  });
});

describe('âges et coefficient', () => {
  it('1962–1964 : 65 ans ; 1960 : 64 a 6 kk', () => {
    expect(elakeIat(1963).alin).toEqual([65, 0]); expect(elakeIat(1960).alin).toEqual([64, 6]); expect(elakeIat(1963).vahvistettu).toBe(true);
    expect(elakeIat(1985).vahvistettu).toBe(false);
  });
  it('elinaikakerroin 1964 = 0,94643 ; exemple ETK 2 000 € → 1 892,86 €', () => {
    expect(elinaikakerroin(1964).arvo).toBe(0.94643);
    expect(2000 * elinaikakerroin(1964).arvo).toBeCloseTo(1892.86, 2);
  });
});

describe('työeläke', () => {
  it('exemple tyoelake.fi : 40 000 €/v × 1,5 % / 12 = 50 €/kk par année', () => {
    const a = tyoelakeArvio({ syntymavuosi: 1990, kkPalkka: 40000 / 12, kuukausiaVuodessa: 12, kertynyt: 0.0001, vuosi: 2026 });
    expect(a.karttumaVuodessa / 12).toBeCloseTo(50, 2);
  });
  it('report : +0,4 %/kk', () => {
    const a = tyoelakeArvio({ syntymavuosi: 1964, kkPalkka: 3000, aloitusIka: 25 });
    const b = tyoelakeArvio({ syntymavuosi: 1964, kkPalkka: 3000, aloitusIka: 25, alkamisKk: 65 * 12 + 12 });
    expect(b.kkElake).toBeGreaterThan(a.kkElake);
    expect(b.lykkays).toBeGreaterThan(0);
  });
  it('OVE exemple tyoelake.fi : 2 000 €, 50 %, 36 kk avant → −144 €', () => {
    expect(osittainenElake(2000, 50, 36).pysyvaMenetys).toBeCloseTo(144, 2);
  });
  it('pension nette Helsinki ev.lut. 2 500 €/kk = vero.fi 30 000 € → 5 699,42 €', () => {
    expect(elakeNetto(2500, 'Helsinki', 'evl').verot).toBeCloseTo(5699.42, 1);
  });
});
