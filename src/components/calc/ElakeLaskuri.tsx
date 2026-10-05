/** Eläkelaskuri 2026: työeläkearvio, eläkeikä, elinaikakerroin, Kelan kansaneläke ja takuueläke sekä nettoeläke kotikunnan veroilla. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { tyoelakeArvio, kansanelake, elakeNetto, elakeIat, ikaKuukausina } from '../../lib/engine/elake';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { KuntaKentta, KirkkoKentta } from './Profiili';
import type { Kirkko } from '../../lib/engine/vero';

const ika = (m: number, lang: L) => { const y = Math.floor(m / 12), k = m % 12; return lang === 'fi' ? `${y} v${k ? ` ${k} kk` : ''}` : `${y} yrs${k ? ` ${k} mo` : ''}`; };

export default function ElakeLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number) => formatMoney(x, 0, lang);
  const [syntynyt, setSyntynyt] = useState(1975);
  const [palkka, setPalkka] = useState(3500);
  const [kertynyt, setKertynyt] = useState(0);
  const [aloitus, setAloitus] = useState(24);
  const [lykkays, setLykkays] = useState('0');
  const [pari, setPari] = useState('0');
  const [kunta, setKunta] = useState('Helsinki');
  const [kirkko, setKirkko] = useState<Kirkko>('ei');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setSyntynyt(num(u, 'v', 1975)); setPalkka(num(u, 'palkka', 3500)); setKertynyt(num(u, 'kertynyt', 0)); setAloitus(num(u, 'aloitus', 24)); setLykkays(u.get('lykkays') ?? '0'); setPari(u.get('pari') === '1' ? '1' : '0');
    if (u.get('kunta')) setKunta(u.get('kunta')!); const k = u.get('kirkko'); if (k === 'evl' || k === 'ort') setKirkko(k); }, []);
  useEffect(() => { updateURL({ v: syntynyt, palkka, kertynyt: kertynyt || undefined, aloitus, lykkays: lykkays !== '0' ? lykkays : undefined, pari: pari === '1' ? 1 : undefined, kunta, kirkko: kirkko !== 'ei' ? kirkko : undefined }); }, [syntynyt, palkka, kertynyt, aloitus, lykkays, pari, kunta, kirkko]);
  const iat = elakeIat(syntynyt);
  const alkamisKk = ikaKuukausina(iat.alin) + Number(lykkays);
  const t = useMemo(() => tyoelakeArvio({ syntymavuosi: syntynyt, kkPalkka: palkka, kertynyt, aloitusIka: aloitus, alkamisKk }), [syntynyt, palkka, kertynyt, aloitus, alkamisKk]);
  const k = kansanelake(t.kkElake, { parisuhde: pari === '1' });
  const n = elakeNetto(k.yhteensa, kunta, kirkko);
  const korvaus = palkka > 0 ? t.kkElake / palkka : 0;
  const rivit = [
    { label: tx(lang, 'Työeläke nyt kertynyt (arvio)', 'Earnings-related pension accrued so far (est.)'), value: $(t.kertynytNyt), muted: true },
    { label: tx(lang, `Karttuma eläkeikään, ${formatNumber(t.vuosiaJaljella, 1, lang)} vuotta × 1,5 %`, `Accrual until retirement, ${formatNumber(t.vuosiaJaljella, 1, lang)} years × 1.5%`), value: $(t.ennenKerrointa - t.kertynytNyt), muted: true },
    { label: tx(lang, `Elinaikakerroin ${formatNumber(t.kerroin.arvo, 5, lang)}${t.kerroin.vahvistettu ? '' : ' (viimeisin vahvistettu)'}`, `Life expectancy coefficient ${formatNumber(t.kerroin.arvo, 5, lang)}${t.kerroin.vahvistettu ? '' : ' (latest confirmed)'}`), value: `− ${$(t.ennenKerrointa * (1 - t.kerroin.arvo))}`, muted: true },
    ...(t.lykkays > 0 ? [{ label: tx(lang, 'Lykkäyskorotus 0,4 %/kk', 'Deferral increase 0.4%/month'), value: `+ ${$(t.lykkays)}`, muted: true }] : []),
    { label: tx(lang, 'Työeläke kuukaudessa', 'Earnings-related pension per month'), value: $(t.kkElake), strong: true },
    ...(k.kansanelake > 0 ? [{ label: tx(lang, 'Kelan kansaneläke', 'Kela national pension'), value: `+ ${$(k.kansanelake)}` }] : []),
    ...(k.takuuelake > 0 ? [{ label: tx(lang, 'Kelan takuueläke', 'Kela guarantee pension'), value: `+ ${$(k.takuuelake)}` }] : []),
    { label: tx(lang, 'Eläkkeet yhteensä, brutto', 'Total pension, gross'), value: $(k.yhteensa), strong: true, sep: true },
    { label: tx(lang, `Verot (${kunta}, eläketulovähennys)`, `Taxes (${kunta}, pension income deduction)`), value: `− ${$(n.kkVerot)}`, muted: true },
    { label: tx(lang, 'Nettoeläke kuukaudessa', 'Net pension per month'), value: $(n.kkNetto), strong: true, sep: true },
  ];
  const vuodet = Array.from({ length: 2008 - 1956 + 1 }, (_, i) => 1956 + i);
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <SelectField id="e-v" label={tx(lang, 'Syntymävuosi', 'Year of birth')} value={String(syntynyt)} onChange={(x) => setSyntynyt(Number(x))} options={vuodet.map((v) => ({ value: String(v), label: String(v) }))}
              help={tx(lang, `Alin eläkeikä ${ika(ikaKuukausina(iat.alin), 'fi')}${iat.vahvistettu ? '' : ' (ennuste)'}.`, `Earliest retirement age ${ika(ikaKuukausina(iat.alin), 'en')}${iat.vahvistettu ? '' : ' (forecast)'}.`)} />
            <NumberField id="e-palkka" label={tx(lang, 'Bruttopalkka kuukaudessa nyt', 'Current gross monthly salary')} value={palkka} onChange={setPalkka} unit="€" max={200000} lang={lang}
              help={tx(lang, 'Oletus: sama palkka (tämän päivän rahassa) eläkeikään asti.', 'Assumes the same salary (in today’s money) until retirement.')} />
            <NumberField id="e-kertynyt" label={tx(lang, 'Kertynyt eläke työeläkeotteelta', 'Accrued pension on your pension record')} value={kertynyt} onChange={setKertynyt} unit="€/kk" max={50000} lang={lang}
              help={tx(lang, 'Jos et tiedä, jätä tyhjäksi: arvioimme aloitusiästä.', 'If unknown, leave empty: we estimate from your starting age.')} />
            <NumberField id="e-aloitus" label={tx(lang, 'Työuran aloitusikä', 'Age you started working')} value={aloitus} onChange={setAloitus} unit={tx(lang, 'v', 'yrs')} max={70} lang={lang} />
            <SelectField id="e-lykkays" label={tx(lang, 'Eläkkeelle', 'Retire')} value={lykkays} onChange={setLykkays}
              options={[0, 6, 12, 24, 36, 48, 60].map((m) => ({ value: String(m), label: m === 0 ? tx(lang, `Alimmassa iässä (${ika(ikaKuukausina(iat.alin), 'fi')})`, `At the earliest age (${ika(ikaKuukausina(iat.alin), 'en')})`) : tx(lang, `${ika(ikaKuukausina(iat.alin) + m, 'fi')} (+${m} kk)`, `${ika(ikaKuukausina(iat.alin) + m, 'en')} (+${m} mo)`) }))} />
            <Toggle id="e-pari" label={tx(lang, 'Avio- tai avoliitossa', 'Married or cohabiting')} value={pari} onChange={setPari} options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
            <KuntaKentta lang={lang} id="e-kunta" value={kunta} onChange={setKunta} />
            <KirkkoKentta lang={lang} id="e-kirkko" value={kirkko} onChange={setKirkko} />
          </div>
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Nettoeläke kuukaudessa, arvio', 'Estimated net pension per month')} wert={$(n.kkNetto)}
            unter={tx(lang, `Brutto ${$(k.yhteensa)} · työeläke ${formatNumber(korvaus * 100, 0, lang)} % nykyisestä palkasta`, `Gross ${$(k.yhteensa)} · work pension ${formatNumber(korvaus * 100, 0, lang)}% of current pay`)} />
          <Laskelma rows={rivit} />
          <p className="mt-2 text-xs text-navy-600">{tx(lang, 'Tämän päivän rahassa: palkkakerroin ja työeläkeindeksi korottavat summia vuosittain. Tarkka kertymä näkyy työeläkeotteella (tyoelake.fi).', 'In today’s money: wage and pension indexes raise the amounts every year. Your exact accrual is on your pension record (tyoelake.fi).')}</p>
          <Toiminnot lang={lang} text={() => tx(lang, `Eläke noin ${$(n.kkNetto)}/kk netto (syntynyt ${syntynyt}, palkka ${$(palkka)})`, `Pension about ${$(n.kkNetto)}/month net (born ${syntynyt}, salary ${$(palkka)})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600"><a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
