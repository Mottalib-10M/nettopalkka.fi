/** Kansaneläke- ja takuueläkelaskuri 2026 (Kela): työeläkkeestä kansaneläke, takuueläke, kokonaiseläke ja nettoeläke. */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import { kansanelake, elakeNetto } from '../../lib/engine/elake';
import { formatMoney } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { KuntaKentta } from './Profiili';

export default function KansanelakeLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number, d = 2) => formatMoney(x, d, lang);
  const [tyoelake, setTyoelake] = useState(600);
  const [pari, setPari] = useState('0');
  const [asumis, setAsumis] = useState(49);
  const [kunta, setKunta] = useState('Helsinki');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setTyoelake(num(u, 'te', 600)); setPari(u.get('pari') === '1' ? '1' : '0'); setAsumis(num(u, 'asumis', 49)); if (u.get('kunta')) setKunta(u.get('kunta')!); }, []);
  useEffect(() => { updateURL({ te: tyoelake, pari: pari === '1' ? 1 : undefined, asumis: asumis !== 49 ? asumis : undefined, kunta }); }, [tyoelake, pari, asumis, kunta]);
  const k = kansanelake(tyoelake, { parisuhde: pari === '1', asumisvuodet: asumis });
  const n = elakeNetto(k.yhteensa, kunta);
  const rivit = [
    { label: tx(lang, 'Työeläkkeet yhteensä', 'Earnings-related pensions'), value: $(k.tyoelake) },
    { label: tx(lang, 'Kansaneläke', 'National pension'), value: $(k.kansanelake) },
    { label: tx(lang, 'Takuueläke', 'Guarantee pension'), value: $(k.takuuelake) },
    { label: tx(lang, 'Kokonaiseläke, brutto', 'Total pension, gross'), value: $(k.yhteensa), strong: true, sep: true },
    { label: tx(lang, `Nettoeläke (${kunta}, ei kirkkoa)`, `Net pension (${kunta}, no church tax)`), value: $(n.kkNetto), strong: true },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2">
          <NumberField id="ke-te" label={tx(lang, 'Työeläkkeet kuukaudessa (brutto)', 'Earnings-related pensions per month (gross)')} value={tyoelake} onChange={setTyoelake} unit="€" max={50000} lang={lang}
            help={tx(lang, 'Kaikki työeläkkeet ja ulkomaiset eläkkeet ennen veroja.', 'All work pensions and foreign pensions before tax.')} />
          <Toggle id="ke-pari" label={tx(lang, 'Avio- tai avoliitossa', 'Married or cohabiting')} value={pari} onChange={setPari} options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
          <NumberField id="ke-asumis" label={tx(lang, 'Suomessa asuttu 16 vuoden iän jälkeen', 'Years lived in Finland after age 16')} value={asumis} onChange={setAsumis} unit={tx(lang, 'v', 'yrs')} max={60} lang={lang}
            help={tx(lang, 'Täysi kansaneläke, kun asumisaikaa on vähintään 80 % ajasta 16–65 v.', 'Full national pension if you lived here at least 80% of the time from 16 to 65.')} />
          <KuntaKentta lang={lang} id="ke-kunta" value={kunta} onChange={setKunta} />
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Kelan eläkkeet kuukaudessa', 'Kela pensions per month')} wert={$(k.kansanelake + k.takuuelake)} unter={tx(lang, `Kokonaiseläke ${$(k.yhteensa)}`, `Total pension ${$(k.yhteensa)}`)} />
          <Laskelma rows={rivit} />
          <Toiminnot lang={lang} text={() => tx(lang, `Kansaneläke ${$(k.kansanelake)} + takuueläke ${$(k.takuuelake)} (työeläke ${$(tyoelake)})`, `National pension ${$(k.kansanelake)} + guarantee ${$(k.takuuelake)} (work pension ${$(tyoelake)})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600"><a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
