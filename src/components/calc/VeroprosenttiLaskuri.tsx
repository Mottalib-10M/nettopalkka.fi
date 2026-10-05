/** Veroprosenttilaskuri 2026: verokortin ennakonpidätysprosentti, lisäprosentti ja tuloraja vuositulosta (palkka + etuudet). */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { PROFIILI0, profiiliUrlista, profiiliUrliin, KuntaKentta, KirkkoKentta, LisaKentat, type Profiili } from './Profiili';

export default function VeroprosenttiLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const f1 = (x: number) => formatNumber(x, 1, lang);
  const [palkka, setPalkka] = useState(42000);
  const [jo, setJo] = useState(0);
  const [p, setP] = useState<Profiili>(PROFIILI0);
  const set = (x: Partial<Profiili>) => setP((o) => ({ ...o, ...x }));
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setPalkka(num(u, 'tulo', 42000)); setJo(num(u, 'jo', 0)); setP(profiiliUrlista(u, PROFIILI0)); }, []);
  useEffect(() => { updateURL({ tulo: palkka, jo: jo || undefined, ...profiiliUrliin(p) }); }, [palkka, jo, p]);
  const opts = { kunta: p.kunta, kirkko: p.kirkko, ika: p.ika, lapset: p.lapset, ainoaHuoltaja: p.ainoa, matkakulut: p.matka };
  const v = useMemo(() => laskeVerot({ ...opts, tulo: palkka }), [palkka, JSON.stringify(opts)]);
  const lp = lisaprosentti(v, p.kirkko);
  // Muutosverokortti kesken vuoden: jäljellä oleville tuloille prosentti, joka kattaa koko vuoden verot.
  const jaljella = Math.max(0, palkka - jo);
  const muutos = jo > 0 && jaljella > 0 ? Math.min(P.vero.ennakonpidatys_enimmais_prosentti, Math.ceil(Math.max(0, (v.verot - jo * v.veroprosentti / 100) / jaljella * 100) * 2) / 2) : null;
  const rivit = [
    { label: tx(lang, 'Vuositulo (tuloraja)', 'Annual income (income limit)'), value: $(palkka) },
    { label: tx(lang, 'Valtionvero', 'State tax'), value: $(v.valtionvero), muted: true },
    { label: tx(lang, 'Kunnallisvero', 'Municipal tax'), value: $(v.kunnallisvero), muted: true },
    ...(v.kirkollisvero > 0 ? [{ label: tx(lang, 'Kirkollisvero', 'Church tax'), value: $(v.kirkollisvero), muted: true }] : []),
    { label: tx(lang, 'Sairausvakuutusmaksut', 'Health insurance contributions'), value: $(v.sairaanhoitomaksu + v.paivarahamaksu), muted: true },
    { label: tx(lang, 'Yle-vero', 'Yle tax'), value: $(v.yle), muted: true },
    { label: tx(lang, 'Verot yhteensä', 'Total tax'), value: $(v.verot), strong: true, sep: true },
    { label: tx(lang, 'Todellinen veroaste', 'Effective tax rate'), value: `${f1(v.veroaste * 100)} %` },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="v-tulo" label={tx(lang, 'Arvioitu palkkatulo vuonna 2026', 'Estimated 2026 salary income')} value={palkka} onChange={setPalkka} unit="€" max={5_000_000} lang={lang}
              help={tx(lang, 'Koko vuoden bruttopalkka lomarahoineen: tästä tulee tuloraja.', 'Full-year gross pay incl. holiday bonus: this becomes the income limit.')} />
            <NumberField id="v-jo" label={tx(lang, 'Jo maksettu palkka tänä vuonna', 'Salary already paid this year')} value={jo} onChange={setJo} unit="€" max={5_000_000} lang={lang}
              help={tx(lang, 'Muutosverokorttia varten; jätä tyhjäksi vuoden alussa.', 'For a revised tax card; leave empty at the start of the year.')} />
            <KuntaKentta lang={lang} id="v-kunta" value={p.kunta} onChange={(x) => set({ kunta: x })} />
            <KirkkoKentta lang={lang} id="v-kirkko" value={p.kirkko} onChange={(x) => set({ kirkko: x })} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3"><summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Lisäasetukset: ikä, lapset, työmatkat', 'More options: age, children, commuting')}</summary><div className="mt-3"><LisaKentat lang={lang} p={p} set={set} prefix="v" /></div></details>
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Veroprosentti (verokortti)', 'Withholding rate (tax card)')} wert={`${f1(v.veroprosentti)} %`}
            unter={tx(lang, `Lisäprosentti ${f1(lp)} % · tuloraja ${$(palkka)}`, `Additional rate ${f1(lp)}% · income limit ${$(palkka)}`)} />
          {muutos !== null && <p className="mt-2 text-sm text-navy-800">{tx(lang, `Muutosverokortti loppuvuodelle: noin ${f1(muutos)} %.`, `Revised tax card for the rest of the year: about ${f1(muutos)}%.`)}</p>}
          <Laskelma rows={rivit} />
          <p className="mt-2 text-xs text-navy-600">{tx(lang, 'Prosentti pyöristetään ylöspäin puolen prosenttiyksikön tarkkuudella, kuten Verohallinto tekee. Työeläke- ja työttömyysvakuutusmaksu peritään erikseen.', 'The rate is rounded up to the next half point, as the Tax Administration does. Pension and unemployment contributions are deducted separately.')}</p>
          <Toiminnot lang={lang} text={() => tx(lang, `Veroprosentti ${f1(v.veroprosentti)} %, lisäprosentti ${f1(lp)} % (${$(palkka)}, ${p.kunta})`, `Withholding ${f1(v.veroprosentti)}%, additional ${f1(lp)}% (${$(palkka)}, ${p.kunta})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600"><a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
