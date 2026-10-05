/** Verotuksen perustiedot, joita palkka-, vero- ja eläkelaskurit jakavat: kotikunta, kirkko, ikä, lapset, matkakulut. */
import SelectField from '../ui/SelectField';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import { KUNNAT } from '../../lib/engine/params';
import type { Kirkko } from '../../lib/engine/vero';
import { formatNumber } from '../../lib/format';
import { tx, type L } from './kit';

export interface Profiili { kunta: string; kirkko: Kirkko; ika: number; lapset: number; ainoa: boolean; matka: number }
export const PROFIILI0: Profiili = { kunta: 'Helsinki', kirkko: 'ei', ika: 35, lapset: 0, ainoa: false, matka: 0 };

const KUNTA_NIMET = KUNNAT.map((k) => k.nimi);
export function profiiliUrlista(u: URLSearchParams, p0: Profiili): Profiili {
  const k = u.get('kunta');
  const ki = u.get('kirkko');
  const n = (key: string, d: number) => { const v = parseFloat(u.get(key) ?? ''); return isNaN(v) ? d : v; };
  return {
    kunta: k && KUNTA_NIMET.includes(k) ? k : p0.kunta,
    kirkko: ki === 'evl' || ki === 'ort' ? ki : ki === 'ei' ? 'ei' : p0.kirkko,
    ika: n('ika', p0.ika), lapset: n('lapset', p0.lapset), ainoa: u.get('ainoa') === '1' || p0.ainoa, matka: n('matka', p0.matka),
  };
}
export const profiiliUrliin = (p: Profiili) => ({ kunta: p.kunta, kirkko: p.kirkko !== 'ei' ? p.kirkko : undefined, ika: p.ika !== 35 ? p.ika : undefined, lapset: p.lapset || undefined, ainoa: p.ainoa ? 1 : undefined, matka: p.matka || undefined });

export function KuntaKentta({ lang, id, value, onChange, help }: { lang: L; id: string; value: string; onChange: (v: string) => void; help?: string }) {
  const opts = KUNNAT.map((k) => ({ value: k.nimi, label: `${k.nimi} · ${formatNumber(k.kunta, 2, lang)} %` }));
  return <SelectField id={id} label={tx(lang, 'Kotikunta (kunnallisvero 2026)', 'Home municipality (2026 municipal tax)')} value={value} onChange={onChange} options={opts} help={help} />;
}

export function KirkkoKentta({ lang, id, value, onChange }: { lang: L; id: string; value: Kirkko; onChange: (v: Kirkko) => void }) {
  return <Toggle id={id} label={tx(lang, 'Kirkon jäsen', 'Church member')} value={value} onChange={(v) => onChange(v as Kirkko)}
    options={[{ value: 'ei', label: tx(lang, 'Ei', 'No') }, { value: 'evl', label: tx(lang, 'Ev.lut.', 'Lutheran') }, { value: 'ort', label: tx(lang, 'Ortod.', 'Orthodox') }]} />;
}

/** Lisätiedot: ikä, alaikäiset lapset, ainoa huoltaja, matkakulut. Näytetään « Lisäasetukset »-osion sisällä. */
export function LisaKentat({ lang, p, set, prefix }: { lang: L; p: Profiili; set: (x: Partial<Profiili>) => void; prefix: string }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
      <NumberField id={`${prefix}-ika`} label={tx(lang, 'Ikä vuoden 2026 lopussa', 'Age at the end of 2026')} value={p.ika} onChange={(v) => set({ ika: v })} unit={tx(lang, 'v', 'yrs')} max={100} lang={lang}
        help={tx(lang, 'Maksut riippuvat iästä: työeläkemaksu 17–69 v., työttömyysvakuutusmaksu 18–64 v.', 'Contributions depend on age: pension 17 to 69, unemployment insurance 18 to 64.')} />
      <NumberField id={`${prefix}-lapset`} label={tx(lang, 'Alaikäiset lapset', 'Children under 18')} value={p.lapset} onChange={(v) => set({ lapset: Math.round(v) })} max={12} lang={lang}
        help={tx(lang, 'Korottaa työtulovähennystä.', 'Raises the earned income tax credit.')} />
      <Toggle id={`${prefix}-ainoa`} label={tx(lang, 'Lasten ainoa huoltaja', 'Sole guardian of the children')} value={p.ainoa ? '1' : '0'} onChange={(v) => set({ ainoa: v === '1' })}
        options={[{ value: '0', label: tx(lang, 'Ei', 'No') }, { value: '1', label: tx(lang, 'Kyllä', 'Yes') }]} />
      <NumberField id={`${prefix}-matka`} label={tx(lang, 'Työmatkakulut vuodessa', 'Commuting costs per year')} value={p.matka} onChange={(v) => set({ matka: v })} unit="€" max={100000} lang={lang}
        help={tx(lang, 'Halvimman kulkuneuvon mukaan; 900 € omavastuu vähennetään.', 'Cheapest means of transport; the first €900 is your own share.')} />
    </div>
  );
}
