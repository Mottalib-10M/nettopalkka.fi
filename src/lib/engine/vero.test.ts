import { describe, expect, it } from 'vitest';
import { laskeVerot, valtionAsteikko, tyotulovahennys, kuukausiNetto, lisaprosentti } from './vero';
import { P, KUNNAT } from './params';

const E = P.vero_esimerkit;

describe('Vero 2026 : exemples officiels de vero.fi (Helsinki, ev.lut.)', () => {
  for (const [tulo, vero] of E.palkka) {
    it(`palkka ${tulo} € → ${vero} €`, () => {
      expect(Math.abs(laskeVerot({ tulo, kunta: 'Helsinki', kirkko: 'evl' }).verot - vero)).toBeLessThanOrEqual(0.02);
    });
  }
  for (const [tulo, vero] of E.etuus) {
    it(`etuus ${tulo} € → ${vero} €`, () => {
      expect(Math.abs(laskeVerot({ tulo, tulolaji: 'etuus', kunta: 'Helsinki', kirkko: 'evl' }).verot - vero)).toBeLessThanOrEqual(0.02);
    });
  }
  for (const [tulo, vero] of E.elake) {
    it(`eläke ${tulo} € → ${vero} €`, () => {
      expect(Math.abs(laskeVerot({ tulo, tulolaji: 'elake', kunta: 'Helsinki', kirkko: 'evl', ika: 70 }).verot - vero)).toBeLessThanOrEqual(0.02);
    });
  }
  for (const [tulo, pros] of E.palkka_prosentti) {
    it(`veroprosentti ${tulo} € → ${pros} %`, () => {
      expect(laskeVerot({ tulo, kunta: 'Helsinki', kirkko: 'evl' }).veroprosentti).toBe(pros);
    });
  }
});

describe('barème et déductions', () => {
  it('valtion asteikko : vero alarajalla = taulukon arvo', () => {
    for (const r of P.vero.valtion_asteikko) expect(valtionAsteikko(r.alaraja)).toBeCloseTo(r.vero_alarajalla, 2);
  });
  it('työtulovähennys : enimmäismäärä, pieneneminen 35 000–50 550 €', () => {
    expect(tyotulovahennys(30000, 29250)).toBe(3430);
    expect(tyotulovahennys(60000, 59250)).toBeCloseTo(3430 - 0.02 * 15550, 6);
    expect(tyotulovahennys(10000, 9250)).toBeCloseTo(1800, 6);
    expect(tyotulovahennys(30000, 29250, { lapset: 2 })).toBe(3640);
    expect(tyotulovahennys(30000, 29250, { lapset: 1, ainoaHuoltaja: true })).toBe(3640);
  });
  it('kunta change le net, Åland a son propre régime', () => {
    const hki = laskeVerot({ tulo: 45000, kunta: 'Helsinki' });
    const kaskinen = KUNNAT.reduce((a, b) => (b.kunta > a.kunta && !b.ahvenanmaa ? b : a));
    const k = laskeVerot({ tulo: 45000, kunta: kaskinen.nimi });
    expect(k.netto).toBeLessThan(hki.netto);
    const m = laskeVerot({ tulo: 45000, kunta: 'Maarianhamina' });
    expect(m.ahvenanmaa).toBe(true);
    expect(m.yle).toBe(P.vero.ahvenanmaa_mediamaksu.maara);
  });
  it('bornes : 0 €, très bas, très haut, âge', () => {
    expect(laskeVerot({ tulo: 0 }).verot).toBe(0);
    expect(laskeVerot({ tulo: 5000 }).verot).toBe(0);
    const h = laskeVerot({ tulo: 500000 });
    expect(h.netto).toBeGreaterThan(0);
    expect(laskeVerot({ tulo: 30000, ika: 70 }).tyoelakemaksu).toBe(0);
    expect(laskeVerot({ tulo: 30000, ika: 66 }).tyottomyysvakuutusmaksu).toBe(0);
    expect(laskeVerot({ tulo: 30000, ika: 16 }).yle).toBe(0);
  });
  it('kuukausinetto et lisäprosentti cohérents', () => {
    const k = kuukausiNetto(3500, { kunta: 'Tampere', kirkko: 'evl' });
    expect(k.kkNetto).toBeGreaterThan(2400); expect(k.kkNetto).toBeLessThan(3000);
    expect(lisaprosentti(k, 'evl')).toBeGreaterThanOrEqual(k.veroprosentti + 2);
  });
});
