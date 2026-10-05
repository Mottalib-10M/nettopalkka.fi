#!/usr/bin/env python3
"""Rejouable : relit chez Vero la décision « Kuntien ja seurakuntien tuloveroprosentit vuonna <année> »
et écrit src/data/kunnat-<année>.json.

Usage : python3 scripts/fi/build-kunnat.py [année]
Les URL changent chaque année (numéro de décision) : mettre à jour DECISIONS avant de relancer.
"""
import html, json, re, sys, urllib.request
from pathlib import Path

YEAR = int(sys.argv[1]) if len(sys.argv) > 1 else 2026
DECISIONS = {
    2026: {
        'fi': 'https://www.vero.fi/syventavat-vero-ohjeet/paatokset/47465/kuntien-ja-seurakuntien-tuloveroprosentit-vuonna-2026/',
        'annettu': '2025-11-18', 'diaari': 'VH/6585/00.01.00/2025',
    },
}
# Ahvenanmaan kunnat : verotus poikkeaa (valtion asteikko −12,64 %-yks., oma perusvähennys, mediamaksu).
AHVENANMAA = {'Brändö', 'Eckerö', 'Finström', 'Föglö', 'Geta', 'Hammarland', 'Jomala', 'Kumlinge', 'Kökar',
              'Lemland', 'Lumparland', 'Maarianhamina', 'Saltvik', 'Sottunga', 'Sund', 'Vårdö'}

def rows(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    s = urllib.request.urlopen(req, timeout=60).read().decode('utf-8')
    m = re.search(r':rows="([^"]*)"', s)
    data = json.loads(html.unescape(m.group(1)))
    return [[r.get(f'column_{i}', {}).get('text', '').strip() for i in range(4)] for r in data]

def num(s):
    return float(s.replace(',', '.')) if s else None

def main():
    d = DECISIONS[YEAR]
    out = []
    for a in rows(d['fi']):
        out.append({'nimi': a[0], 'kunta': num(a[1]), 'evl': num(a[2]), 'ort': num(a[3]),
                    'ahvenanmaa': a[0] in AHVENANMAA})
    assert sum(k['ahvenanmaa'] for k in out) == len(AHVENANMAA), 'kunnat d’Åland manquantes'
    doc = {'vuosi': YEAR, 'lahde': d['fi'], 'annettu': d['annettu'], 'diaari': d['diaari'],
           'haettu': __import__('datetime').date.today().isoformat(), 'kunnat': out}
    p = Path(__file__).resolve().parents[2] / 'src' / 'data' / f'kunnat-{YEAR}.json'
    p.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(out)} kuntaa → {p}')

if __name__ == '__main__':
    main()
