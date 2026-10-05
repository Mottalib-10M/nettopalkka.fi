/** Kuntavertailu 2026: kaikki 308 kuntaa, kunnallis- ja kirkollisveroprosentti sekä nettopalkka valitulla palkalla. Haku ja järjestys. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { KUNNAT } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { rahmen, tx, type L } from './kit';

export default function KuntaVertailu({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number) => formatMoney(x, 0, lang);
  const f2 = (x: number) => formatNumber(x, 2, lang);
  const [palkka, setPalkka] = useState(3500);
  const [haku, setHaku] = useState('');
  const [jarjestys, setJarjestys] = useState('kunta');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setPalkka(num(u, 'palkka', 3500)); setJarjestys(u.get('j') ?? 'kunta'); }, []);
  useEffect(() => { updateURL({ palkka, j: jarjestys !== 'kunta' ? jarjestys : undefined }); }, [palkka, jarjestys]);
  const rivit = useMemo(() => KUNNAT.map((k) => ({ ...k, netto: laskeVerot({ tulo: palkka * 12, kunta: k }).netto / 12 })), [palkka]);
  const q = haku.trim().toLowerCase();
  const nak = rivit.filter((k) => !q || k.nimi.toLowerCase().includes(q)).sort((a, b) =>
    jarjestys === 'nimi' ? a.nimi.localeCompare(b.nimi, 'fi') : jarjestys === 'kunta-laskeva' ? b.kunta - a.kunta || a.nimi.localeCompare(b.nimi, 'fi') : a.kunta - b.kunta || a.nimi.localeCompare(b.nimi, 'fi'));
  const paras = Math.max(...rivit.map((r) => r.netto));
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="p-4 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
          <NumberField id="kv-palkka" label={tx(lang, 'Bruttopalkka kuukaudessa', 'Gross salary per month')} value={palkka} onChange={setPalkka} unit="€" max={200000} lang={lang} />
          <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0">
            <label htmlFor="kv-haku" className="mb-1 block text-sm font-medium text-navy-700">{tx(lang, 'Hae kuntaa', 'Find a municipality')}</label>
            <input id="kv-haku" type="search" value={haku} onChange={(e) => setHaku(e.target.value)} placeholder={tx(lang, 'esim. Tampere', 'e.g. Tampere')}
              className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
          </div>
          <SelectField id="kv-j" label={tx(lang, 'Järjestys', 'Sort by')} value={jarjestys} onChange={setJarjestys}
            options={[{ value: 'kunta', label: tx(lang, 'Matalin vero ensin', 'Lowest tax first') }, { value: 'kunta-laskeva', label: tx(lang, 'Korkein vero ensin', 'Highest tax first') }, { value: 'nimi', label: tx(lang, 'Aakkosjärjestys', 'Alphabetical') }]} />
        </form>
        <p className="mt-4 text-sm text-navy-700" aria-live="polite">{tx(lang, `${nak.length} kuntaa. Nettopalkka 17–64-vuotiaalle ilman kirkollisveroa.`, `${nak.length} municipalities. Net pay for ages 17 to 64, without church tax.`)}</p>
        <div className="mt-3 max-h-[32rem] overflow-y-auto rounded-lg border border-navy-200">
          <table className="w-full text-sm">
            <caption className="sr-only">{tx(lang, 'Kuntien tuloveroprosentit 2026', 'Municipal income tax rates 2026')}</caption>
            <thead className="sticky top-0 bg-navy-50"><tr>
              <th scope="col" className="px-3 py-2 text-left font-semibold text-navy-900">{tx(lang, 'Kunta', 'Municipality')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-navy-900">{tx(lang, 'Kunnallisvero', 'Municipal tax')}</th>
              <th scope="col" className="hidden px-3 py-2 text-right font-semibold text-navy-900 sm:table-cell">{tx(lang, 'Ev.lut.', 'Lutheran')}</th>
              <th scope="col" className="hidden px-3 py-2 text-right font-semibold text-navy-900 sm:table-cell">{tx(lang, 'Ortod.', 'Orthodox')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-navy-900">{tx(lang, 'Netto/kk', 'Net/month')}</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold text-navy-900">{tx(lang, 'Ero', 'Gap')}</th>
            </tr></thead>
            <tbody>
              {nak.map((k) => (
                <tr key={k.nimi} className="border-t border-navy-100">
                  <th scope="row" className="px-3 py-1.5 text-left font-normal text-navy-900">{k.nimi}{k.ahvenanmaa && <span className="ml-1 text-xs text-navy-600">({tx(lang, 'Ahvenanmaa', 'Åland')})</span>}</th>
                  <td className="tabular-nums px-3 py-1.5 text-right">{f2(k.kunta)} %</td>
                  <td className="tabular-nums hidden px-3 py-1.5 text-right sm:table-cell">{f2(k.evl)} %</td>
                  <td className="tabular-nums hidden px-3 py-1.5 text-right sm:table-cell">{f2(k.ort)} %</td>
                  <td className="tabular-nums px-3 py-1.5 text-right">{$(k.netto)}</td>
                  <td className="tabular-nums px-3 py-1.5 text-right text-navy-600">{k.netto >= paras - 0.5 ? '0' : `− ${$(paras - k.netto)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Lähde: Verohallinnon päätös 18.11.2025. Ahvenanmaalla valtion vero on matalampi, siksi korkea kunnallisvero ei näy nettopalkassa täysimääräisenä.', 'Source: Tax Administration decision of 18 Nov 2025. In Åland the state tax is lower, so the high municipal rate does not hit net pay in full.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
      </div>
    </div>
  );
}
