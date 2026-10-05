/** Verolaskuri 2026: koko vuoden verot palkasta vähennyksineen (matkakulut, jäsenmaksut, kotitalousvähennys) ja veronpalautus tai jäännösvero. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import { laskeVerot } from '../../lib/engine/vero';
import { kotitalousvahennys } from '../../lib/engine/kotitalous';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { PROFIILI0, profiiliUrlista, profiiliUrliin, KuntaKentta, KirkkoKentta, LisaKentat, type Profiili } from './Profiili';

export default function VeroLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const [tulo, setTulo] = useState(45000);
  const [pidatetty, setPidatetty] = useState(7500);
  const [jasen, setJasen] = useState(0);
  const [kotitalous, setKotitalous] = useState(0);
  const [p, setP] = useState<Profiili>(PROFIILI0);
  const set = (x: Partial<Profiili>) => setP((o) => ({ ...o, ...x }));
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setTulo(num(u, 'tulo', 45000)); setPidatetty(num(u, 'pid', 7500)); setJasen(num(u, 'jasen', 0)); setKotitalous(num(u, 'kt', 0)); setP(profiiliUrlista(u, PROFIILI0)); }, []);
  useEffect(() => { updateURL({ tulo, pid: pidatetty, jasen: jasen || undefined, kt: kotitalous || undefined, ...profiiliUrliin(p) }); }, [tulo, pidatetty, jasen, kotitalous, p]);
  const opts = { kunta: p.kunta, kirkko: p.kirkko, ika: p.ika, lapset: p.lapset, ainoaHuoltaja: p.ainoa, matkakulut: p.matka, jasenmaksut: jasen };
  const v = useMemo(() => laskeVerot({ ...opts, tulo }), [tulo, JSON.stringify(opts)]);
  const kt = kotitalousvahennys({ tyoYritys: kotitalous }).vahennys;
  // Kotitalousvähennys vähennetään veroista, mutta ei Yle-verosta eikä päivärahamaksusta.
  const ktKaytetty = Math.min(kt, Math.max(0, v.verot - v.yle - v.paivarahamaksu));
  const lopullinen = v.verot - ktKaytetty;
  const ero = pidatetty - lopullinen;
  const rivit = [
    { label: tx(lang, 'Palkkatulot', 'Salary income'), value: $(tulo) },
    { label: tx(lang, 'Puhdas ansiotulo vähennysten jälkeen', 'Net earned income after deductions'), value: $(v.puhdasAnsiotulo), muted: true },
    { label: tx(lang, 'Verotettava tulo (kunnallisverotus)', 'Taxable income (municipal tax)'), value: $(v.verotettava), muted: true },
    { label: tx(lang, 'Työtulovähennys', 'Earned income tax credit'), value: `− ${$(v.tyotulovahennys)}`, muted: true },
    ...(ktKaytetty > 0 ? [{ label: tx(lang, 'Kotitalousvähennys', 'Household tax credit'), value: `− ${$(ktKaytetty)}`, muted: true }] : []),
    { label: tx(lang, 'Verot ja maksut lopullisesti', 'Final taxes and contributions'), value: $(lopullinen), strong: true, sep: true },
    { label: tx(lang, 'Ennakonpidätys vuoden aikana', 'Tax withheld during the year'), value: $(pidatetty) },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="vl-tulo" label={tx(lang, 'Palkkatulot vuonna 2026', 'Salary income in 2026')} value={tulo} onChange={setTulo} unit="€" max={5_000_000} lang={lang} help={tx(lang, 'Bruttona, lomarahat mukaan lukien.', 'Gross, holiday bonus included.')} />
            <NumberField id="vl-pid" label={tx(lang, 'Ennakonpidätys yhteensä', 'Total tax withheld')} value={pidatetty} onChange={setPidatetty} unit="€" max={5_000_000} lang={lang} help={tx(lang, 'Palkkalaskelmista tai OmaVerosta; ilman työeläke- ja työttömyysmaksua.', 'From payslips or MyTax; without pension and unemployment contributions.')} />
            <NumberField id="vl-jasen" label={tx(lang, 'Ammattiliitto ja työttömyyskassa', 'Trade union and unemployment fund fees')} value={jasen} onChange={setJasen} unit="€" max={10000} lang={lang} help={tx(lang, 'Vuoden jäsenmaksut, vähennetään tulosta.', 'Annual fees, deducted from income.')} />
            <NumberField id="vl-kt" label={tx(lang, 'Kotitalousvähennykseen oikeuttava työ', 'Work eligible for the household credit')} value={kotitalous} onChange={setKotitalous} unit="€" max={100000} lang={lang} help={tx(lang, 'Yritykseltä ostetun työn osuus, alv mukana.', 'Labour share bought from a company, VAT included.')} />
            <KuntaKentta lang={lang} id="vl-kunta" value={p.kunta} onChange={(x) => set({ kunta: x })} />
            <KirkkoKentta lang={lang} id="vl-kirkko" value={p.kirkko} onChange={(x) => set({ kirkko: x })} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3"><summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Lisäasetukset: ikä, lapset, työmatkat', 'More options: age, children, commuting')}</summary><div className="mt-3"><LisaKentat lang={lang} p={p} set={set} prefix="vl" /></div></details>
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={ero >= 0 ? tx(lang, 'Veronpalautus, arvio', 'Estimated tax refund') : tx(lang, 'Jäännösvero, arvio', 'Estimated residual tax')} wert={$(Math.abs(ero))}
            unter={tx(lang, `Lopullinen veroaste ${formatNumber(tulo > 0 ? lopullinen / tulo * 100 : 0, 1, lang)} %`, `Final tax rate ${formatNumber(tulo > 0 ? lopullinen / tulo * 100 : 0, 1, lang)}%`)} />
          <Laskelma rows={rivit} />
          <Toiminnot lang={lang} text={() => tx(lang, `${ero >= 0 ? 'Veronpalautus' : 'Jäännösvero'} noin ${$(Math.abs(ero))} (${$(tulo)}, ${p.kunta})`, `${ero >= 0 ? 'Tax refund' : 'Residual tax'} about ${$(Math.abs(ero))} (${$(tulo)}, ${p.kunta})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Arvio. Pääomatuloja, alijäämähyvitystä ja muita vähennyksiä ei lasketa.', 'Estimate. Capital income, deficit credit and other deductions are not included.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
