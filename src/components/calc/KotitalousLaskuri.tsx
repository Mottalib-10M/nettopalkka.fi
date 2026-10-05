/** Kotitalousvähennyslaskuri 2026: voimassa oleva laki (35 %, 1 600 €) ja hallituksen esitys (40 %, 2 100 €) rinnakkain. */
import { useEffect, useState } from 'react';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import { kotitalousvahennys, kotitalousvahennysEsitys } from '../../lib/engine/kotitalous';
import { P } from '../../lib/engine/params';
import { formatMoney } from '../../lib/format';
import { readParams, num, updateURL } from '../../lib/url-state';
import { Laskelma, Toiminnot, Paaluku, kasten, rahmen, tx, type L } from './kit';

export default function KotitalousLaskuri({ lang = 'fi', methodHref }: { lang?: L; methodHref?: string }) {
  const $ = (x: number) => formatMoney(x, 0, lang);
  const K = P.kotitalousvahennys;
  const [tyo, setTyo] = useState(3000);
  const [palkka, setPalkka] = useState(0);
  const [kaksi, setKaksi] = useState('1');
  useEffect(() => { const u = readParams(window.location.search); if (![...u.keys()].length) return; setTyo(num(u, 'tyo', 3000)); setPalkka(num(u, 'palkka', 0)); setKaksi(u.get('h') === '2' ? '2' : '1'); }, []);
  useEffect(() => { updateURL({ tyo, palkka: palkka || undefined, h: kaksi === '2' ? 2 : undefined }); }, [tyo, palkka, kaksi]);
  const inp = { tyoYritys: tyo, palkka, henkiloita: (kaksi === '2' ? 2 : 1) as 1 | 2 };
  const v = kotitalousvahennys(inp), e = kotitalousvahennysEsitys(inp);
  const rivit = [
    { label: tx(lang, `Työn osuus × ${K.voimassa.yritys_prosentti} %${palkka ? ` + palkka × ${K.voimassa.palkka_prosentti} %` : ''}`, `Labour × ${K.voimassa.yritys_prosentti}%${palkka ? ` + wages × ${K.voimassa.palkka_prosentti}%` : ''}`), value: $(v.brutto) },
    { label: tx(lang, `Omavastuu ${$(K.voimassa.omavastuu)} / henkilö`, `Deductible ${$(K.voimassa.omavastuu)} per person`), value: `− ${$(v.omavastuu)}`, muted: true },
    { label: tx(lang, `Kotitalousvähennys (enintään ${$(K.voimassa.enimmaismaara)} / henkilö)`, `Household credit (max ${$(K.voimassa.enimmaismaara)} per person)`), value: $(v.vahennys), strong: true, sep: true },
    { label: tx(lang, `Jos esitys hyväksytään (${K.esitys_2026_2027.yritys_prosentti} %, enintään ${$(K.esitys_2026_2027.enimmaismaara)})`, `If the proposal passes (${K.esitys_2026_2027.yritys_prosentti}%, max ${$(K.esitys_2026_2027.enimmaismaara)})`), value: $(e.vahennys) },
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="siniristi h-1" aria-hidden="true" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={(e2) => e2.preventDefault()} className="grid grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2">
          <NumberField id="kt-tyo" label={tx(lang, 'Työn osuus laskusta (alv mukana)', 'Labour share of the invoice (VAT incl.)')} value={tyo} onChange={setTyo} unit="€" max={1_000_000} lang={lang}
            help={tx(lang, 'Remontti, siivous, hoiva, ICT-tuki. Ei tarvikkeita eikä matkoja.', 'Renovation, cleaning, care, IT help. No materials or travel.')} />
          <NumberField id="kt-palkka" label={tx(lang, 'Palkka itse palkatulle', 'Wages you paid as an employer')} value={palkka} onChange={setPalkka} unit="€" max={1_000_000} lang={lang}
            help={tx(lang, 'Palkka ja työnantajan sivukulut.', 'Wages plus employer contributions.')} />
          <Toggle id="kt-h" label={tx(lang, 'Vähennyksen saajat', 'People claiming')} value={kaksi} onChange={setKaksi} options={[{ value: '1', label: tx(lang, 'Yksi', 'One') }, { value: '2', label: tx(lang, 'Puolisot', 'Spouses') }]} />
        </form>
        <div className={kasten} aria-live="polite">
          <Paaluku label={tx(lang, 'Kotitalousvähennys 2026', 'Household tax credit 2026')} wert={$(v.vahennys)}
            unter={tx(lang, `Esityksen mukaan ${$(e.vahennys)}: ei vielä laki`, `Under the proposal ${$(e.vahennys)}: not yet law`)} />
          <Laskelma rows={rivit} />
          {v.yliJaa > 0 && kaksi === '1' && <p className="mt-2 text-sm text-navy-800">{tx(lang, `${$(v.yliJaa)} jää yli: puoliso voi vähentää osan, jos hän maksoi työstä osan.`, `${$(v.yliJaa)} is above the cap: a spouse who paid part of the work can claim it.`)}</p>}
          <Toiminnot lang={lang} text={() => tx(lang, `Kotitalousvähennys ${$(v.vahennys)} (${$(tyo)} työtä)`, `Household credit ${$(v.vahennys)} (${$(tyo)} of labour)`)} />
          {methodHref && <p className="mt-3 text-xs text-navy-600"><a className="underline" href={methodHref}>{tx(lang, 'Laskentatapa', 'Calculation method')}</a></p>}
        </div>
      </div>
    </div>
  );
}
