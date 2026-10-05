/** Lomarahalaskuri 2026: lomapäivät (vuosilomalaki), lomapalkka, lomaraha TES-prosentilla ja sen nettomäärä. */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import { lomapaivat, lomaraha } from '../../lib/engine/loma';
import { laskeVerot } from '../../lib/engine/vero';
import { P } from '../../lib/engine/params';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { KuntaKentta } from './Profiili';

export default function LomarahaLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const [palkka, setPalkka] = useState(3200);
  const [kk, setKk] = useState(12);
  const [alle, setAlle] = useState('0');
  const [pros, setPros] = useState(P.vuosiloma.lomaraha_esimerkki_prosentti);
  const [kunta, setKunta] = useState('Helsinki');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setPalkka(num(u, 'palkka', 3200)); setKk(num(u, 'kk', 12)); setAlle(u.get('alle') === '1' ? '1' : '0'); setPros(num(u, 'pros', P.vuosiloma.lomaraha_esimerkki_prosentti)); if (u.get('kunta')) setKunta(u.get('kunta')!); }, []);
  useEffect(() => { updateURL({ palkka, kk, alle: alle === '1' ? 1 : undefined, pros, kunta }); }, [palkka, kk, alle, pros, kunta]);
  const paivat = lomapaivat(kk, alle === '1');
  const l = lomaraha(palkka, paivat, pros);
  const v = laskeVerot({ tulo: palkka * 12 + l.lomaraha, kunta });
  const maksut = (P.vero.tyoelakemaksu_prosentti + P.vero.tyottomyysvakuutusmaksu_prosentti) / 100;
  const netto = l.lomaraha * (1 - v.veroprosentti / 100 - maksut);
  const rivit = [
    { label: tx(lang, `Lomapäivät (${kk} täyttä kuukautta)`, `Holiday days (${kk} full months)`), value: tx(lang, `${paivat} arkipäivää`, `${paivat} working days`) },
    { label: tx(lang, 'Lomapäivän palkka (kuukausipalkka ÷ 25)', 'Daily holiday pay (monthly salary ÷ 25)'), value: $(l.paivapalkka, 2), muted: true },
    { label: tx(lang, 'Lomapalkka lomapäiviltä', 'Holiday pay for those days'), value: $(l.lomapalkka) },
    { label: tx(lang, `Lomaraha ${formatNumber(pros, 0, lang)} %`, `Holiday bonus ${formatNumber(pros, 0, lang)}%`), value: $(l.lomaraha), strong: true, sep: true },
    { label: tx(lang, `Käteen (veroprosentti ${formatNumber(v.veroprosentti, 1, lang)} % + työntekijän maksut)`, `Take-home (withholding ${formatNumber(v.veroprosentti, 1, lang)}% + employee contributions)`), value: $(netto) },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2">
          <NumberField id="lr-palkka" label={tx(lang, 'Kuukausipalkka', 'Monthly salary')} value={palkka} onChange={setPalkka} unit="€" max={100000} lang={lang} />
          <NumberField id="lr-kk" label={tx(lang, 'Täydet kuukaudet 1.4.–31.3.', 'Full months 1 April to 31 March')} value={kk} onChange={(x) => setKk(Math.min(12, Math.round(x)))} max={12} lang={lang}
            help={tx(lang, 'Kuukausi on täysi, kun töitä on vähintään 14 päivää tai 35 tuntia.', 'A month counts with at least 14 working days or 35 hours.')} />
          <Toggle id="lr-alle" label={tx(lang, 'Työsuhde alle vuoden 31.3.', 'Employed under a year on 31 March')} value={alle} onChange={setAlle} options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
          <NumberField id="lr-pros" label={tx(lang, 'Lomaraha työehtosopimuksessa', 'Holiday bonus in your agreement')} value={pros} onChange={setPros} unit="%" max={100} lang={lang}
            help={tx(lang, 'Usein 50 % lomapalkasta; tarkista oma TES.', 'Often 50% of holiday pay; check your agreement.')} />
          <KuntaKentta lang={lang} id="lr-kunta" value={kunta} onChange={setKunta} />
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Lomaraha, brutto', 'Holiday bonus, gross')} wert={$(l.lomaraha)} unter={tx(lang, `Noin ${$(netto)} käteen`, `About ${$(netto)} take-home`)} />
          <Laskelma rows={rivit} />
          <Toiminnot lang={lang} text={() => tx(lang, `Lomaraha ${$(l.lomaraha)} (palkka ${$(palkka)}, ${paivat} lomapäivää)`, `Holiday bonus ${$(l.lomaraha)} (salary ${$(palkka)}, ${paivat} days)`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Lomaraha ei perustu lakiin vaan työehtosopimukseen; laskutapa ja maksuaika vaihtelevat aloittain.', 'The holiday bonus comes from collective agreements, not the law; the method and timing vary by sector.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
