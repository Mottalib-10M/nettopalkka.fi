/** Asumistukilaskuri 2026 (yleinen asumistuki, Kela): kuntaryhmä, enimmäisasumismenot, perusomavastuu ja tuki €/kk. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { formatMoney } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';
import { KuntaKentta } from './Profiili';

export default function AsumistukiLaskuri({ lang = 'fi', methodHref, preset = {} }: { lang?: L; methodHref?: string; preset?: { kunta?: string } }) {
  const $ = (x: number, d = 0) => formatMoney(x, d, lang);
  const [kunta, setKunta] = useState(preset.kunta ?? 'Tampere');
  const [aikuiset, setAikuiset] = useState(1);
  const [lapset, setLapset] = useState(0);
  const [tulot, setTulot] = useState(1200);
  const [vuokra, setVuokra] = useState(650);
  const [vesi, setVesi] = useState('1');
  const [lammitys, setLammitys] = useState('0');
  const [alue, setAlue] = useState('perus');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return;
    if (u.get('kunta')) setKunta(u.get('kunta')!); setAikuiset(num(u, 'a', 1)); setLapset(num(u, 'l', 0)); setTulot(num(u, 'tulot', 1200)); setVuokra(num(u, 'vuokra', 650));
    setVesi(u.get('vesi') === '0' ? '0' : '1'); setLammitys(u.get('lammitys') === '1' ? '1' : '0'); setAlue(u.get('alue') ?? 'perus'); }, []);
  useEffect(() => { updateURL({ kunta, a: aikuiset, l: lapset || undefined, tulot, vuokra, vesi: vesi === '0' ? 0 : undefined, lammitys: lammitys === '1' ? 1 : undefined, alue: alue !== 'perus' ? alue : undefined }); }, [kunta, aikuiset, lapset, tulot, vuokra, vesi, lammitys, alue]);
  const r = useMemo(() => asumistuki({ kunta, aikuiset, lapset, tulot, vuokra, vesiErikseen: vesi === '1', lammitysErikseen: lammitys === '1', lammitysalue: alue as 'perus' }), [kunta, aikuiset, lapset, tulot, vuokra, vesi, lammitys, alue]);
  const raja = useMemo(() => tuloraja(kunta, aikuiset, lapset), [kunta, aikuiset, lapset]);
  const ryhmaNimi = r.ryhma === 'Ahvenanmaa' ? tx(lang, 'Ahvenanmaa', 'Åland') : tx(lang, `kuntaryhmä ${r.ryhma}`, `municipality group ${r.ryhma}`);
  const rivit = [
    { label: tx(lang, 'Asumismenot (vuokra, vesi, lämmitys)', 'Housing costs (rent, water, heating)'), value: $(r.menot, 2) },
    { label: tx(lang, `Enimmäismäärä, ${ryhmaNimi}, ${r.henkiloita} hlö`, `Maximum, ${ryhmaNimi}, ${r.henkiloita} people`), value: $(r.enimmais), muted: true },
    { label: tx(lang, 'Hyväksytyt asumismenot', 'Accepted housing costs'), value: $(r.hyvaksytyt, 2) },
    { label: tx(lang, 'Perusomavastuu tuloista', 'Basic deductible from income'), value: `− ${$(r.perusomavastuu, 2)}`, muted: true },
    { label: tx(lang, `Asumistuki ${r.tukiprosentti} % erotuksesta`, `Housing allowance ${r.tukiprosentti}% of the difference`), value: $(r.tuki, 2), strong: true, sep: true },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <KuntaKentta lang={lang} id="at-kunta" value={kunta} onChange={setKunta} help={tx(lang, `Asumistuessa ${ryhmaNimi}.`, `For housing allowance: ${ryhmaNimi}.`)} />
            <NumberField id="at-vuokra" label={tx(lang, 'Vuokra tai käyttövastike', 'Rent or right-of-occupancy charge')} value={vuokra} onChange={setVuokra} unit="€/kk" max={20000} lang={lang} help={tx(lang, 'Ilman sähköä, autopaikkaa ja nettiä.', 'Without electricity, parking or internet.')} />
            <NumberField id="at-aikuiset" label={tx(lang, 'Aikuiset ruokakunnassa', 'Adults in the household')} value={aikuiset} onChange={(v) => setAikuiset(Math.max(1, Math.round(v)))} min={1} max={10} lang={lang} />
            <NumberField id="at-lapset" label={tx(lang, 'Lapset', 'Children')} value={lapset} onChange={(v) => setLapset(Math.round(v))} max={12} lang={lang} />
            <NumberField id="at-tulot" label={tx(lang, 'Ruokakunnan bruttotulot', 'Household gross income')} value={tulot} onChange={setTulot} unit="€/kk" max={100000} lang={lang} help={tx(lang, 'Kaikkien aikuisten palkat ja etuudet ennen veroja.', 'All adults’ wages and benefits before tax.')} />
            <Toggle id="at-vesi" label={tx(lang, 'Vesi maksetaan erikseen', 'Water paid separately')} value={vesi} onChange={setVesi} options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3"><summary className="cursor-pointer text-sm font-semibold text-navy-800">{tx(lang, 'Lämmitys erikseen', 'Heating paid separately')}</summary>
            <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <Toggle id="at-lammitys" label={tx(lang, 'Lämmitys erikseen', 'Separate heating')} value={lammitys} onChange={setLammitys} options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
              <SelectField id="at-alue" label={tx(lang, 'Alue', 'Region')} value={alue} onChange={setAlue} options={[{ value: 'perus', label: tx(lang, 'Muu Suomi', 'Rest of Finland') }, { value: 'itainen', label: 'Etelä-Savo, Pohjois-Savo, Pohjois-Karjala' }, { value: 'pohjoinen', label: tx(lang, 'Pohjois-Pohjanmaa, Kainuu, Lappi', 'North Ostrobothnia, Kainuu, Lapland') }]} />
            </div>
          </details>
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Asumistuki kuukaudessa, arvio', 'Estimated housing allowance per month')} wert={$(r.tuki, 2)}
            unter={tx(lang, `Tuloraja tälle ruokakunnalle noin ${$(raja)}/kk`, `Income limit for this household about ${$(raja)}/month`)} />
          <Laskelma rows={rivit} />
          {r.estynyt === 'pieni' && <p className="mt-2 text-sm text-navy-800">{tx(lang, 'Alle 15 euron tukea ei makseta.', 'Allowances under €15 are not paid.')}</p>}
          {r.estynyt === 'varallisuus' && <p className="mt-2 text-sm text-navy-800">{tx(lang, 'Varallisuus vähintään 50 000 €: ei oikeutta tukeen.', 'Assets of €50,000 or more: no entitlement.')}</p>}
          <Toiminnot lang={lang} text={() => tx(lang, `Asumistuki noin ${$(r.tuki, 2)}/kk (${kunta}, vuokra ${$(vuokra)})`, `Housing allowance about ${$(r.tuki, 2)}/month (${kunta}, rent ${$(vuokra)})`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600">{tx(lang, 'Arvio Kelan 2026 kaavalla; Kela päättää tuen hakemuksesta.', 'Estimate with Kela’s 2026 formula; Kela decides on application.')} <a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
