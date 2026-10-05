/** Ansiosidonnainen päiväraha 2026: täysi määrä, porrastus 80 % / 75 %, enimmäiskesto ja vero (etuuden verotus). */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import { ansiopaivaraha, enimmaiskesto, yleistukiKk } from '../../lib/engine/paivaraha';
import { laskeVerot } from '../../lib/engine/vero';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { KuntaKentta } from './Profiili';

export default function AnsiopaivarahaLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const T = P.tyottomyys;
  const [palkka, setPalkka] = useState(3000);
  const [tyovuodet, setTyovuodet] = useState(5);
  const [ika, setIka] = useState(40);
  const [kunta, setKunta] = useState('Helsinki');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setPalkka(num(u, 'palkka', 3000)); setTyovuodet(num(u, 'tv', 5)); setIka(num(u, 'ika', 40)); if (u.get('kunta')) setKunta(u.get('kunta')!); }, []);
  useEffect(() => { updateURL({ palkka, tv: tyovuodet, ika, kunta }); }, [palkka, tyovuodet, ika, kunta]);
  const a = useMemo(() => ansiopaivaraha(palkka), [palkka]);
  const kesto = enimmaiskesto(tyovuodet, ika);
  // Verot: etuustulona koko vuodelta täydellä tasolla (arvio), prosentti vähintään 25 % pidätyksessä.
  const v = laskeVerot({ tulo: a.taysiKk * 12, tulolaji: 'etuus', kunta, ika });
  const pidatys = Math.max(T.ennakonpidatys_vahintaan, v.veroprosentti);
  const netto = a.taysiKk * (1 - pidatys / 100);
  const rivit = [
    { label: tx(lang, `Päiväpalkka (−${formatNumber(T.vahennettava_prosentti, 2, lang)} %, ÷ 21,5)`, `Daily wage (−${formatNumber(T.vahennettava_prosentti, 2, lang)}%, ÷ 21.5)`), value: $(a.paivapalkka, 2), muted: true },
    { label: tx(lang, `Täysi päiväraha, ${formatNumber(T.porrastus[0].paivia, 0, lang)} ensimmäistä päivää`, `Full allowance, first ${T.porrastus[0].paivia} days`), value: `${$(a.taysiPv, 2)}/${tx(lang, 'pv', 'day')} · ${$(a.taysiKk)}` },
    { label: tx(lang, `${T.porrastus[0].prosentti} % päivästä ${T.porrastus[0].paivia + 1}`, `${T.porrastus[0].prosentti}% from day ${T.porrastus[0].paivia + 1}`), value: `${$(a.porras1Pv, 2)} · ${$(a.porras1Kk)}` },
    { label: tx(lang, `${T.porrastus[1].prosentti} % päivästä ${T.porrastus[1].paivia + 1}`, `${T.porrastus[1].prosentti}% from day ${T.porrastus[1].paivia + 1}`), value: `${$(a.porras2Pv, 2)} · ${$(a.porras2Kk)}` },
    { label: tx(lang, 'Enimmäiskesto', 'Maximum duration'), value: tx(lang, `${kesto} päivää`, `${kesto} days`) },
    { label: tx(lang, `Netto alussa, pidätys ${formatNumber(pidatys, 1, lang)} %`, `Net at first, withholding ${formatNumber(pidatys, 1, lang)}%`), value: $(netto), strong: true, sep: true },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2">
          <NumberField id="ap-palkka" label={tx(lang, 'Keskimääräinen bruttopalkka', 'Average gross salary')} value={palkka} onChange={setPalkka} unit="€/kk" max={100000} lang={lang}
            help={tx(lang, 'Työssäoloehdon 12 kuukaudelta, ilman lomarahaa.', 'Over the 12 qualifying months, without holiday bonus.')} />
          <NumberField id="ap-tv" label={tx(lang, 'Työhistoria 17 vuoden iän jälkeen', 'Work history after age 17')} value={tyovuodet} onChange={setTyovuodet} unit={tx(lang, 'v', 'yrs')} max={60} lang={lang} />
          <NumberField id="ap-ika" label={tx(lang, 'Ikä työttömäksi jäädessä', 'Age when unemployed')} value={ika} onChange={setIka} unit={tx(lang, 'v', 'yrs')} max={70} lang={lang} />
          <KuntaKentta lang={lang} id="ap-kunta" value={kunta} onChange={setKunta} />
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Ansiopäiväraha kuukaudessa, brutto', 'Earnings-related allowance per month, gross')} wert={$(a.taysiKk)}
            unter={tx(lang, `${$(a.taysiPv, 2)} päivässä, 5 päivää viikossa · yleistuki olisi ${$(yleistukiKk())}`, `${$(a.taysiPv, 2)} per day, 5 days a week · yleistuki would be ${$(yleistukiKk())}`)} />
          <Laskelma rows={rivit} />
          {a.kattoKaytetty && <p className="mt-2 text-sm text-navy-800">{tx(lang, 'Päiväraha on rajattu 90 prosenttiin päiväpalkasta.', 'Capped at 90% of the daily wage.')}</p>}
          <Toiminnot lang={lang} text={() => tx(lang, `Ansiopäiväraha ${$(a.taysiKk)}/kk (palkka ${$(palkka)})`, `Earnings-related allowance ${$(a.taysiKk)}/month (salary ${$(palkka)})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Kassa laskee tarkan määrän palkkatiedoistasi. Omavastuuaika 7 päivää.', 'Your fund calculates the exact amount from your wage data. 7-day waiting period.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
