/** Vanhempainpäivärahalaskuri 2026 (Kela): vuosituloista päiväraha, korotettu 90 % ja kuukausiarvio. */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import { vanhempainraha } from '../../lib/engine/paivaraha';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';

export default function VanhempainpaivarahaLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const V = P.vanhempainraha;
  const [palkka, setPalkka] = useState(3200);
  const [lomaraha, setLomaraha] = useState(1600);
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setPalkka(num(u, 'palkka', 3200)); setLomaraha(num(u, 'lr', 1600)); }, []);
  useEffect(() => { updateURL({ palkka, lr: lomaraha }); }, [palkka, lomaraha]);
  const vuosi = palkka * 12 + lomaraha;
  const r = vanhempainraha(vuosi);
  const kiintio = V.paivat_vanhempi;
  const yhteensa = r.korotettuPv * V.korotetut_paivat_vanhempainraha + r.pv * (kiintio - V.korotetut_paivat_vanhempainraha);
  const rivit = [
    { label: tx(lang, 'Vuositulo (12 kk + lomaraha)', 'Annual income (12 months + holiday bonus)'), value: $(vuosi) },
    { label: tx(lang, `Vakuutusmaksuvähennys ${formatNumber(V.vakuutusmaksuvahennys_prosentti, 2, lang)} %`, `Insurance contribution deduction ${formatNumber(V.vakuutusmaksuvahennys_prosentti, 2, lang)}%`), value: `− ${$(vuosi - r.vuositulo)}`, muted: true },
    { label: tx(lang, `Korotettu päiväraha (${V.korotetut_paivat_vanhempainraha} ensimmäistä arkipäivää)`, `Raised allowance (first ${V.korotetut_paivat_vanhempainraha} working days)`), value: $(r.korotettuPv, 2) },
    { label: tx(lang, 'Vanhempainraha arkipäivältä', 'Parental allowance per working day'), value: $(r.pv, 2), strong: true },
    { label: tx(lang, `Oma kiintiö ${kiintio} arkipäivää yhteensä`, `Own quota of ${kiintio} working days in total`), value: $(yhteensa), strong: true, sep: true },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2">
          <NumberField id="vp-palkka" label={tx(lang, 'Bruttopalkka kuukaudessa', 'Gross monthly salary')} value={palkka} onChange={setPalkka} unit="€" max={100000} lang={lang}
            help={tx(lang, 'Kela katsoo 12 kalenterikuukautta, kuukauden välein ennen vapaata.', 'Kela looks at 12 calendar months, one month before the leave.')} />
          <NumberField id="vp-lr" label={tx(lang, 'Lomaraha ja muut lisät vuodessa', 'Holiday bonus and extras per year')} value={lomaraha} onChange={setLomaraha} unit="€" max={100000} lang={lang} />
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Vanhempainraha kuukaudessa, arvio', 'Estimated parental allowance per month')} wert={$(r.kk)}
            unter={tx(lang, `${$(r.pv, 2)} arkipäivältä, 6 päivää viikossa (25 pv/kk)`, `${$(r.pv, 2)} per working day, 6 days a week (25 days/month)`)} />
          <Laskelma rows={rivit} />
          <Toiminnot lang={lang} text={() => tx(lang, `Vanhempainraha ${$(r.pv, 2)}/arkipäivä (palkka ${$(palkka)})`, `Parental allowance ${$(r.pv, 2)}/working day (salary ${$(palkka)})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Veronalaista tuloa. Kela tekee päätöksen tulorekisterin tiedoista.', 'Taxable income. Kela decides from the Incomes Register data.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
