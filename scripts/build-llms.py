#!/usr/bin/env python3
"""Écrit public/llms.txt depuis le build (dist) : titre et description de chaque page indexable, par langue (RECETTE §21).
Usage : npm run build && python3 scripts/build-llms.py && npm run build"""
import html, re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
site = re.search(r"SITE_URL = \"([^\"]+)\"", (root / 'src/data/site-config.ts').read_text()).group(1)
def meta(p):
    s = p.read_text(encoding='utf-8')
    if re.search(r'name="robots" content="noindex', s): return None
    t = re.search(r'<title>(.*?)</title>', s, re.S); d = re.search(r'name="description" content="([^"]*)"', s)
    return html.unescape(t.group(1)).strip(), html.unescape(d.group(1)).strip() if d else ''
out = ['# Laskurit Suomi / Finland Money Calculators', '',
       '> Riippumaton sivusto (Radif Partners): nettopalkka, veroprosentti, eläke ja Kelan tuet Suomessa vuonna 2026, kaikkien 308 kunnan veroprosenteilla. Independent site: Finnish net pay, tax rate, pension and Kela benefits for 2026 with the tax rates of all 308 municipalities.', '',
       'Data: Verohallinnon päätökset 2026 (ennakonpidätys, kuntien ja seurakuntien tuloveroprosentit 18.11.2025), Finlex, Eläketurvakeskus, Kela, TYJ. Laskenta tapahtuu selaimessa.', '']
for lang, otsikko in (('fi', '## Suomeksi'), ('en', '## In English')):
    out.append(otsikko)
    for p in sorted((dist / lang).rglob('index.html')):
        m = meta(p)
        if not m: continue
        url = site + '/' + str(p.parent.relative_to(dist)).replace('\\', '/') + '/'
        out.append(f'- [{m[0]}]({url}): {m[1]}')
    out.append('')
(root / 'public/llms.txt').write_text('\n'.join(out), encoding='utf-8')
print(len(out), 'lignes')
