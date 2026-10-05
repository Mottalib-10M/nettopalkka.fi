import { describe, expect, it } from 'vitest';
import { asumistuki, kuntaryhma, enimmaisasumismenot, tuloraja } from './asumistuki';
import { ansiopaivaraha, vanhempainraha, enimmaiskesto, yleistukiKk } from './paivaraha';
import { kotitalousvahennys, kotitalousvahennysEsitys } from './kotitalous';
import { lomapaivat, lomaraha, lomakorvaus } from './loma';
import { P } from './params';

describe('asumistuki 2026 : exemples Kela', () => {
  for (const e of P.asumistuki.esimerkit) {
    it(`${e.nimi} → ${e.tuki} €`, () => { expect(asumistuki({ kunta: e.kunta, aikuiset: e.aikuiset, lapset: e.lapset, tulot: e.tulot, vuokra: e.menot }).tuki).toBeCloseTo(e.tuki, 2); });
  }
  it('kuntaryhmät', () => { expect(kuntaryhma('Vantaa')).toBe('I'); expect(kuntaryhma('Tampere')).toBe('II'); expect(kuntaryhma('Akaa')).toBe('III'); expect(kuntaryhma('Maarianhamina')).toBe('Ahvenanmaa'); });
  it('enimmäismäärä 6 henkeä ryhmä I = 1 188 + 2 × 148', () => { expect(enimmaisasumismenot('I', 6)).toBe(1188 + 296); });
  it('tuloraja ryhmä I, 1 aikuinen ≈ 1 844 € (Kela)', () => { expect(Math.abs(tuloraja('Helsinki', 1, 0) - 1844)).toBeLessThanOrEqual(1); });
  it('tuloraja ryhmä II, 2 aikuista ≈ 2 116 € (Kela)', () => { expect(Math.abs(tuloraja('Turku', 2, 0) - 2116)).toBeLessThanOrEqual(1); });
  it('varallisuus ≥ 50 000 € → ei tukea', () => { expect(asumistuki({ kunta: 'Turku', aikuiset: 1, lapset: 0, tulot: 500, vuokra: 600, varallisuus: 60000 }).tuki).toBe(0); });
});

describe('ansiopäiväraha 2026 : tableau TYJ', () => {
  for (const [palkka, taysi, p1, p2] of P.tyottomyys.tyj_taulukko) {
    it(`${palkka} €/kk → ${taysi} / ${p1} / ${p2}`, () => {
      const a = ansiopaivaraha(palkka);
      expect(Math.abs(a.taysiKk - taysi)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.porras1Kk - p1)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.porras2Kk - p2)).toBeLessThanOrEqual(1);
    });
  }
  it('kesto', () => { expect(enimmaiskesto(2, 30)).toBe(300); expect(enimmaiskesto(10, 40)).toBe(400); expect(enimmaiskesto(30, 59)).toBe(500); });
  it('yleistuki 800,02 €/kk', () => { expect(yleistukiKk()).toBeCloseTo(800.02, 2); });
});

describe('vanhempainraha 2026', () => {
  it('rajat : 45 744 → 106,74 €/pv ; minimum 31,99', () => {
    expect(vanhempainraha(45744 / (1 - 0.0907)).pv).toBeCloseTo(106.74, 2);
    expect(vanhempainraha(5000).pv).toBe(31.99);
  });
  it('exemple Kela (vuositulo 31 125 € → noin 66 €/pv)', () => { expect(Math.round(vanhempainraha(31125).pv)).toBe(66); });
  it('korotettu 90 % > tavallinen', () => { const v = vanhempainraha(40000); expect(v.korotettuPv).toBeGreaterThan(v.pv); });
});

describe('kotitalousvähennys', () => {
  for (const [kulu, vah] of P.kotitalousvahennys.esimerkit) it(`${kulu} € työtä → ${vah} €`, () => { expect(kotitalousvahennys({ tyoYritys: kulu }).vahennys).toBe(vah); });
  it('vero.fi : 8 000 € → 1 050 € dépassent (le conjoint en déduit 900 € après sa franchise)', () => { expect(kotitalousvahennys({ tyoYritys: 8000 }).yliJaa).toBe(1050); });
  it('esitys : 40 % ja 2 100 €', () => { expect(kotitalousvahennysEsitys({ tyoYritys: 10000 }).vahennys).toBe(2100); });
  it('kaksi henkilöä : kaksi omavastuuta ja kaksi kattoa', () => { expect(kotitalousvahennys({ tyoYritys: 10000, henkiloita: 2 }).vahennys).toBe(3200); });
});

describe('vuosiloma', () => {
  it('12 kk → 30 pv ; alle vuosi 7 kk → 14 pv', () => { expect(lomapaivat(12)).toBe(30); expect(lomapaivat(7, true)).toBe(14); expect(lomapaivat(5)).toBe(13); });
  it('lomaraha 50 % : 3 000 €, 24 pv → 1 440 €', () => { expect(lomaraha(3000, 24).lomaraha).toBe(1440); });
  it('lomakorvaus 3 000 €, 10 pv → 1 200 €', () => { expect(lomakorvaus(3000, 10)).toBe(1200); });
});
