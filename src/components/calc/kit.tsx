/** Laskurien yhteiset osat: palkkalaskelman rivit, tuloksen pääluku, toiminnot (kopioi, linkki, tulosta). */
import { useState } from 'react';

export type L = 'fi' | 'en';
export const tx = <A,>(l: L, fi: A, en: A) => (l === 'en' ? en : fi);

export interface Rivi { label: string; value: string; strong?: boolean; muted?: boolean; sep?: boolean; bar?: number }

/** Palkkalaskelman tapaan: selite vasemmalla, summa oikealla, vähennykset miinuksella, osuus palkkina. */
export function Laskelma({ rows, caption }: { rows: Rivi[]; caption?: string }) {
  return (
    <table className="laskelma mt-3 w-full text-sm">
      {caption && <caption className="mb-1 text-left text-xs font-semibold uppercase tracking-wide text-navy-600">{caption}</caption>}
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={`${r.sep ? 'border-t-2 border-navy-800' : 'border-t border-navy-200'} ${r.strong ? 'font-semibold text-navy-900' : r.muted ? 'text-navy-600' : 'text-navy-800'}`}>
            <th scope="row" className="py-1.5 pr-3 text-left font-normal">
              {r.label}
              {r.bar !== undefined && r.bar > 0 && <span className="mt-1 block h-1 rounded bg-accent-200" style={{ width: `${Math.min(100, Math.max(2, r.bar * 100))}%` }} aria-hidden="true" />}
            </th>
            <td className="tabular-nums py-1.5 text-right align-top">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Toiminnot({ lang, text }: { lang: L; text: () => string }) {
  const [done, setDone] = useState('');
  const copy = (what: 'text' | 'link') => {
    const s = what === 'text' ? `${text()} · ${window.location.href}` : window.location.href;
    navigator.clipboard?.writeText(s).then(() => { setDone(what); setTimeout(() => setDone(''), 1500); });
  };
  const b = 'rounded-md border border-navy-300 bg-white px-3 py-1.5 text-sm font-medium text-navy-800 hover:bg-navy-50';
  return (
    <div className="no-print mt-4 flex flex-wrap gap-2">
      <button type="button" className={b} onClick={() => copy('text')}>{done === 'text' ? tx(lang, 'Kopioitu', 'Copied') : tx(lang, 'Kopioi tulos', 'Copy result')}</button>
      <button type="button" className={b} onClick={() => copy('link')}>{done === 'link' ? tx(lang, 'Linkki kopioitu', 'Link copied') : tx(lang, 'Jaa linkki', 'Share link')}</button>
      <button type="button" className={b} onClick={() => window.print()}>{tx(lang, 'Tulosta', 'Print')}</button>
    </div>
  );
}

/** Tuloksen pääluku: yksi suuri luku ja rivi sen alla. */
export function Paaluku({ label, wert, unter }: { label: string; wert: string; unter?: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-navy-700">{label}</p>
      <p className="tabular-nums mt-1 font-serif text-4xl font-bold text-navy-900">{wert}</p>
      {unter && <p className="tabular-nums mt-1 text-sm text-navy-700">{unter}</p>}
    </div>
  );
}

export const kasten = 'mt-6 rounded-xl border border-accent-200 bg-accent-50/50 p-4 sm:p-5 lg:mt-0 lg:sticky lg:top-20';
export const rahmen = 'laskuri not-prose overflow-hidden rounded-xl border border-navy-200 bg-white';
