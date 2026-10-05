/** Bruttopalkkalaskuri: mikä bruttopalkka tarvitaan tavoitenettoon (käänteinen laskenta, lib/engine/vero.ts). */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import { bruttoNetosta, laskeVerot } from '../../lib/engine/vero';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { PROFIILI0, profiiliUrlista, profiiliUrliin, KuntaKentta, KirkkoKentta, LisaKentat, type Profiili } from './Profiili';

export default function BruttoLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const [netto, setNetto] = useState(2500);
  const [p, setP] = useState<Profiili>(PROFIILI0);
  const set = (x: Partial<Profiili>) => setP((o) => ({ ...o, ...x }));
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setNetto(num(u, 'netto', 2500)); setP(profiiliUrlista(u, PROFIILI0)); }, []);
  useEffect(() => { updateURL({ netto, ...profiiliUrliin(p) }); }, [netto, p]);
  const opts = { kunta: p.kunta, kirkko: p.kirkko, ika: p.ika, lapset: p.lapset, ainoaHuoltaja: p.ainoa, matkakulut: p.matka };
  const brutto = useMemo(() => bruttoNetosta(netto, opts), [netto, JSON.stringify(opts)]);
  const v = laskeVerot({ ...opts, tulo: brutto * 12 });
  const rivit = [
    { label: tx(lang, 'Tavoiteltu nettotulo kuukaudessa', 'Target net income per month'), value: $(netto) },
    { label: tx(lang, 'Verot ja maksut kuukaudessa', 'Taxes and contributions per month'), value: $(v.pidatykset / 12), muted: true },
    { label: tx(lang, 'Tarvittava bruttopalkka', 'Gross salary needed'), value: $(brutto), strong: true, sep: true },
    { label: tx(lang, 'Bruttopalkka vuodessa', 'Gross salary per year'), value: $(brutto * 12), muted: true },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="b-netto" label={tx(lang, 'Haluttu nettopalkka kuukaudessa', 'Desired net pay per month')} value={netto} onChange={setNetto} unit="€" max={200000} lang={lang}
              help={tx(lang, 'Keskimäärin vuoden aikana, verojen ja maksujen jälkeen.', 'Average over the year, after taxes and contributions.')} />
            <KuntaKentta lang={lang} id="b-kunta" value={p.kunta} onChange={(x) => set({ kunta: x })} />
            <KirkkoKentta lang={lang} id="b-kirkko" value={p.kirkko} onChange={(x) => set({ kirkko: x })} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3"><summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Lisäasetukset', 'More options')}</summary><div className="mt-3"><LisaKentat lang={lang} p={p} set={set} prefix="b" /></div></details>
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Tarvittava bruttopalkka kuukaudessa', 'Gross monthly salary needed')} wert={$(brutto)} unter={tx(lang, `Veroprosentti ${formatNumber(v.veroprosentti, 1, lang)} % · ${p.kunta}`, `Withholding rate ${formatNumber(v.veroprosentti, 1, lang)}% · ${p.kunta}`)} />
          <Laskelma rows={rivit} />
          <Toiminnot lang={lang} text={() => tx(lang, `${$(netto)} netto vaatii ${$(brutto)} bruttona (${p.kunta})`, `${$(netto)} net needs ${$(brutto)} gross (${p.kunta})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600"><a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
