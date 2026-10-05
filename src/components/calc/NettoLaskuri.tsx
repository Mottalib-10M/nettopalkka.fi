/**
 * Nettopalkkalaskuri 2026 (etusivu, kuntasivut, upotus). Moottori: lib/engine/vero.ts (valtion asteikko, 308 kunnan
 * vero, kirkollisvero, sairausvakuutusmaksut, Yle-vero, työeläke- ja työttömyysvakuutusmaksu). Ensimmäinen
 * renderöinti = oletusarvot (RECETTE §17.5); jaettu linkki luetaan vasta useEffectissä.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import StackedBar from '../ui/StackedBar';
import { kuukausiNetto, lisaprosentti } from '../../lib/engine/vero';
import { lomaraha as laskeLomaraha, lomapaivat } from '../../lib/engine/loma';
import { KUNNAT, P } from '../../lib/engine/params';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { PROFIILI0, profiiliUrlista, profiiliUrliin, KuntaKentta, KirkkoKentta, LisaKentat, type Profiili } from './Profiili';

interface Props { lang?: L; methodHref?: string; preset?: Partial<Profiili>; palkka?: number }

export default function NettoLaskuri({ lang = 'fi', methodHref, preset = {}, palkka: palkka0 = 3500 }: Props) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const pc = (x: number, d = 2) => formatPercent(x / 100, d, lang);
  const p0 = { ...PROFIILI0, ...preset };
  const [palkka, setPalkka] = useState(palkka0);
  const [jakso, setJakso] = useState('kk');
  const [lomaraha, setLomaraha] = useState('0');
  const [p, setP] = useState<Profiili>(p0);
  const set = (x: Partial<Profiili>) => setP((o) => ({ ...o, ...x }));

  useEffect(() => {
    const u = readParams(window.location.search);
    if (![...u.keys()].length) return;
    setPalkka(num(u, 'palkka', palkka0)); setJakso(u.get('jakso') === 'v' ? 'v' : 'kk'); setLomaraha(u.get('lomaraha') === '1' ? '1' : '0');
    setP(profiiliUrlista(u, p0));
  }, []);
  useEffect(() => { updateURL({ palkka, jakso: jakso === 'v' ? 'v' : undefined, lomaraha: lomaraha === '1' ? 1 : undefined, ...profiiliUrliin(p) }); }, [palkka, jakso, lomaraha, p]);

  const kk = jakso === 'v' ? palkka / 12 : palkka;
  // Lomaraha: TES:n tavallinen 50 % lomapalkasta, täyden lomanmääräytymisvuoden 30 lomapäivältä (lib/engine/loma.ts).
  const lr = lomaraha === '1' ? laskeLomaraha(kk, lomapaivat(12)).lomaraha : 0;
  const opts = { kunta: p.kunta, kirkko: p.kirkko, ika: p.ika, lapset: p.lapset, ainoaHuoltaja: p.ainoa, matkakulut: p.matka, lomaraha: lr };
  const r = useMemo(() => kuukausiNetto(kk, opts), [kk, JSON.stringify(opts)]);
  const lp = lisaprosentti(r, p.kirkko);
  const vuosi = r.tulo;

  // Vertailu: sama palkka edullisimmassa ja kalleimmassa Manner-Suomen kunnassa.
  const manner = KUNNAT.filter((k) => !k.ahvenanmaa);
  const halvin = manner.reduce((a, b) => (b.kunta < a.kunta ? b : a));
  const kallein = manner.reduce((a, b) => (b.kunta > a.kunta ? b : a));
  const vrt = (nimi: string) => kuukausiNetto(kk, { ...opts, kunta: nimi }).netto;
  const eroHalvin = (vrt(halvin.nimi) - r.netto) / 12, eroKallein = (r.netto - vrt(kallein.nimi)) / 12;

  const kirkkoPros = p.kirkko === 'evl' ? r.kunta.evl : p.kirkko === 'ort' ? r.kunta.ort : 0;
  const osuus = (x: number) => (vuosi > 0 ? x / vuosi : 0);
  const rivit = [
    { label: tx(lang, 'Bruttopalkka vuodessa', 'Gross pay per year'), value: $(vuosi), strong: true },
    { label: tx(lang, 'Valtion tulovero (työtulovähennyksen jälkeen)', 'State income tax (after earned income credit)'), value: `− ${$(r.valtionvero)}`, muted: true, bar: osuus(r.valtionvero) },
    { label: tx(lang, `Kunnallisvero, ${r.kunta.nimi} ${pc(r.kunta.kunta)}`, `Municipal tax, ${r.kunta.nimi} ${pc(r.kunta.kunta)}`), value: `− ${$(r.kunnallisvero)}`, muted: true, bar: osuus(r.kunnallisvero) },
    ...(r.kirkollisvero > 0 ? [{ label: tx(lang, `Kirkollisvero ${pc(kirkkoPros)}`, `Church tax ${pc(kirkkoPros)}`), value: `− ${$(r.kirkollisvero)}`, muted: true, bar: osuus(r.kirkollisvero) }] : []),
    { label: tx(lang, `Sairaanhoitomaksu ${pc(P.vero.sairaanhoitomaksu_palkka_prosentti)}`, `Health care contribution ${pc(P.vero.sairaanhoitomaksu_palkka_prosentti)}`), value: `− ${$(r.sairaanhoitomaksu)}`, muted: true, bar: osuus(r.sairaanhoitomaksu) },
    { label: tx(lang, `Päivärahamaksu ${pc(P.vero.paivarahamaksu_prosentti)}`, `Daily allowance contribution ${pc(P.vero.paivarahamaksu_prosentti)}`), value: `− ${$(r.paivarahamaksu)}`, muted: true, bar: osuus(r.paivarahamaksu) },
    { label: r.ahvenanmaa ? tx(lang, 'Ahvenanmaan mediamaksu', 'Åland media fee') : tx(lang, 'Yle-vero', 'Yle tax'), value: `− ${$(r.yle)}`, muted: true, bar: osuus(r.yle) },
    { label: tx(lang, `Työeläkemaksu ${pc(P.vero.tyoelakemaksu_prosentti)}`, `Earnings-related pension contribution ${pc(P.vero.tyoelakemaksu_prosentti)}`), value: `− ${$(r.tyoelakemaksu)}`, muted: true, bar: osuus(r.tyoelakemaksu) },
    { label: tx(lang, `Työttömyysvakuutusmaksu ${pc(P.vero.tyottomyysvakuutusmaksu_prosentti)}`, `Unemployment insurance ${pc(P.vero.tyottomyysvakuutusmaksu_prosentti)}`), value: `− ${$(r.tyottomyysvakuutusmaksu)}`, muted: true, bar: osuus(r.tyottomyysvakuutusmaksu) },
    { label: tx(lang, 'Nettotulot vuodessa', 'Net income per year'), value: $(r.netto), strong: true, sep: true },
  ];
  const segs = [
    { label: tx(lang, 'Netto', 'Net'), value: Math.max(0, r.netto), color: '#002F6C' },
    { label: tx(lang, 'Verot', 'Taxes'), value: r.verot, color: '#94a3b8' },
    { label: tx(lang, 'Työeläke ja työttömyys', 'Pension and unemployment'), value: r.tyoelakemaksu + r.tyottomyysvakuutusmaksu, color: '#e2e8f0' },
  ];
  const huom: string[] = [];
  if (r.ahvenanmaa) huom.push(tx(lang, 'Ahvenanmaa: valtion veroasteikko 12,64 prosenttiyksikköä matalampi, oma perusvähennys kunnallisverotuksessa ja Yle-veron sijaan mediamaksu.', 'Åland: state tax scale 12.64 points lower, its own basic deduction in municipal tax, and a media fee instead of the Yle tax.'));
  if (r.paivarahamaksu === 0 && r.tulo > 0) huom.push(tx(lang, `Vuositulo alle ${$(P.vero.paivarahamaksu_tuloraja)}: päivärahamaksua ei peritä.`, `Annual income below ${$(P.vero.paivarahamaksu_tuloraja)}: no daily allowance contribution.`));
  if (lr > 0) huom.push(tx(lang, `Lomaraha ${$(lr)} lisätty vuosituloon (${P.vuosiloma.lomaraha_esimerkki_prosentti} % 30 lomapäivän lomapalkasta). Se maksetaan yleensä kesä- tai heinäkuussa.`, `Holiday bonus of ${$(lr)} added to annual income (${P.vuosiloma.lomaraha_esimerkki_prosentti}% of holiday pay for 30 days of leave), usually paid in June or July.`));
  const palautus = r.kkVero * 12 + (lr > 0 ? lr * r.veroprosentti / 100 : 0) - r.verot;

  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <NumberField id="n-palkka" label={jakso === 'v' ? tx(lang, 'Bruttopalkka vuodessa', 'Gross salary per year') : tx(lang, 'Bruttopalkka kuukaudessa', 'Gross salary per month')} value={palkka} onChange={setPalkka} unit="€" max={2_000_000} lang={lang}
              help={tx(lang, 'Palkkalaskelman bruttosumma, luontoisedut mukaan lukien.', 'The gross figure on your payslip, fringe benefits included.')} />
            <Toggle id="n-jakso" label={tx(lang, 'Jakso', 'Period')} value={jakso} onChange={(v) => { setPalkka(v === 'v' ? Math.round(kk * 12) : Math.round(kk)); setJakso(v); }}
              options={[{ value: 'kk', label: tx(lang, 'Kuukausi', 'Month') }, { value: 'v', label: tx(lang, 'Vuosi', 'Year') }]} />
            <KuntaKentta lang={lang} id="n-kunta" value={p.kunta} onChange={(v) => set({ kunta: v })} />
            <KirkkoKentta lang={lang} id="n-kirkko" value={p.kirkko} onChange={(v) => set({ kirkko: v })} />
            <Toggle id="n-lomaraha" label={tx(lang, 'Lomaraha (TES)', 'Holiday bonus (collective agreement)')} value={lomaraha} onChange={setLomaraha}
              options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Lisäasetukset: ikä, lapset, työmatkat', 'More options: age, children, commuting')}</summary>
            <div className="mt-3"><LisaKentat lang={lang} p={p} set={set} prefix="n" /></div>
          </details>
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Nettopalkka kuukaudessa', 'Net pay per month')} wert={$(r.kkNetto)}
            unter={tx(lang, `Veroprosentti ${formatNumber(r.veroprosentti, 1, lang)} % · lisäprosentti ${formatNumber(lp, 1, lang)} % · tuloraja ${$(vuosi)}`, `Withholding rate ${formatNumber(r.veroprosentti, 1, lang)}% · additional rate ${formatNumber(lp, 1, lang)}% · income limit ${$(vuosi)}`)} />
          <div className="mt-4"><StackedBar segments={segs} total={vuosi} ariaPrefix={tx(lang, 'Palkan jakautuminen', 'Breakdown of pay')} /></div>
          <Laskelma rows={rivit} />
          <p className="mt-3 text-sm text-navy-700">
            {r.kunta.nimi === halvin.nimi
              ? tx(lang, `${r.kunta.nimi} kuuluu Manner-Suomen matalimman kunnallisveron kuntiin.`, `${r.kunta.nimi} has one of mainland Finland’s lowest municipal tax rates.`)
              : tx(lang, `Kunnassa ${halvin.nimi} (${pc(halvin.kunta)}) käteen jäisi ${$(eroHalvin)} enemmän kuukaudessa.`, `In ${halvin.nimi} (${pc(halvin.kunta)}) you would keep ${$(eroHalvin)} more per month.`)}
            {' '}{eroKallein > 0.5 && tx(lang, `Kunnassa ${kallein.nimi} (${pc(kallein.kunta)}) ${$(eroKallein)} vähemmän.`, `In ${kallein.nimi} (${pc(kallein.kunta)}) ${$(eroKallein)} less.`)}
          </p>
          {Math.abs(palautus) >= 1 && <p className="mt-2 text-sm text-navy-700">{palautus > 0
            ? tx(lang, `Verokortin pyöristys ylöspäin pidättää noin ${$(palautus)} liikaa vuodessa: se palautuu veronpalautuksena.`, `Rounding the withholding rate up keeps about ${$(palautus)} too much over the year: it comes back as a tax refund.`)
            : tx(lang, `Pidätys jää noin ${$(-palautus)} vajaaksi: odota jäännösveroa.`, `Withholding falls about ${$(-palautus)} short: expect residual tax.`)}</p>}
          {huom.map((h) => <p key={h} className="mt-2 text-xs text-navy-600">{h}</p>)}
          <Toiminnot lang={lang} text={() => tx(lang, `Nettopalkka ${$(r.kkNetto)}/kk (${$(kk)} brutto, ${r.kunta.nimi})`, `Net pay ${$(r.kkNetto)}/month (${$(kk)} gross, ${r.kunta.nimi})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Arvio vuoden 2026 perusteilla, ei korvaa verokorttia.', 'Estimate on 2026 rules; it does not replace your tax card.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
