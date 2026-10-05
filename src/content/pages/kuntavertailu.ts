import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot } from '../../lib/engine/vero';
import { KUNNAT, KUNNAT_META, type Kunta } from '../../lib/engine/params';
import { MANNER, HALVIN, KALLEIN, MEDIAANI, KUNTIA, AHVENANMAAN_KUNTIA, jarjestetty } from '../../lib/esimerkit';

const V = P.vero;
const PALKKA = 3500;
const nettoKk = (k: Kunta, kk = PALKKA) => laskeVerot({ tulo: kk * 12, kunta: k }).netto / 12;
const HALV10 = jarjestetty(1).slice(0, 10);
const KALL10 = jarjestetty(-1).slice(0, 10);
const MANNER_KA = MANNER.reduce((s, k) => s + k.kunta, 0) / MANNER.length;
const AH = KUNNAT.filter((k) => k.ahvenanmaa);
const AH_MIN = Math.min(...AH.map((k) => k.kunta)), AH_MAX = Math.max(...AH.map((k) => k.kunta));
const EVL = MANNER.map((k) => k.evl).filter((x) => x > 0), ORT = MANNER.map((k) => k.ort).filter((x) => x > 0);
const EVL_MIN = Math.min(...EVL), EVL_MAX = Math.max(...EVL), ORT_MIN = Math.min(...ORT), ORT_MAX = Math.max(...ORT);
/** Kuntia prosenttiväleittäin (Manner-Suomi). */
const VALIT: Array<[number, number]> = [[0, 7], [7, 8], [8, 9], [9, 10], [10, 100]];
const kpl = ([lo, hi]: [number, number]) => MANNER.filter((k) => k.kunta >= lo && k.kunta < hi).length;
/** Yhden prosenttiyksikön hinta: sama palkka kahdessa kuvitteellisessa kunnassa, joiden kunnallisvero eroaa yhdellä. */
const PISTE = [2500, 3500, 5000].map((kk) => {
  const k0: Kunta = { nimi: 'A', kunta: MEDIAANI, evl: 0, ort: 0, ahvenanmaa: false };
  const k1: Kunta = { ...k0, kunta: MEDIAANI + 1 };
  return { kk, vuosi: laskeVerot({ tulo: kk * 12, kunta: k1 }).verot - laskeVerot({ tulo: kk * 12, kunta: k0 }).verot };
});
const EROKK = nettoKk(HALVIN) - nettoKk(KALLEIN);
const MH = KUNNAT.find((k) => k.nimi === 'Maarianhamina')!;
const HKI = KUNNAT.find((k) => k.nimi === 'Helsinki')!;
const IKA = `${V.tyoelakemaksu_ika.alkaa}–${V.tyottomyysvakuutusmaksu_ika.paattyy}`;
const ALLE7 = MANNER.filter((k) => k.kunta < 7).map((k) => k.nimi);

export default definePage({
  id: 'kuntavertailu',
  group: 'laskurit',
  order: 40,
  tool: 'kunnat',
  related: ['helsinki', 'tampere', 'kirkollisvero', 'ahvenanmaa'],
  sources: ['vero_kunnat', 'vero_ennakonpidatys'],
  fi: {
    slug: 'kunnallisvero-kunnittain',
    nav: 'Kunnallisvero kunnittain',
    card: `Kaikkien ${KUNTIA} kunnan tuloveroprosentit 2026 ja nettopalkka jokaisessa kunnassa samalla palkalla.`,
    title: 'Kunnallisvero 2026 kunnittain: kaikki kunnat ja nettopalkka',
    description: `Kunnallisvero 2026 kunnittain: ${KUNTIA} kunnan tuloveroprosentit ${FI.num(HALVIN.kunta, 2)}–${FI.num(KALLEIN.kunta, 2)} %, kirkollisvero ja nettopalkka samalla palkalla. Hae kunta tai järjestä taulukko.`,
    h1: 'Kunnallisvero 2026 kunnittain',
    intro: 'Valitse kuukausipalkka, niin taulukko näyttää jokaisen kunnan veroprosentin ja paljonko samasta palkasta jää käteen.',
    resume: `Vuonna 2026 Manner-Suomen matalin kunnallisvero on ${FI.p(HALVIN.kunta)} (${HALVIN.nimi}) ja korkein ${FI.p(KALLEIN.kunta)} (${KALLEIN.nimi}); ${FI.eur(PALKKA)} kuukausipalkasta jää matalimman veron kunnassa käteen noin ${FI.eur(EROKK)} enemmän kuukaudessa. Verohallinnon päätöksessä on ${KUNTIA} kuntaa, joista ${AHVENANMAAN_KUNTIA} on Ahvenanmaalla. Manner-Suomen kuntien mediaani on ${FI.p(MEDIAANI)} ja painottamaton keskiarvo ${FI.p(MANNER_KA)}, mutta väestöllä painotettu keskimääräinen tuloveroprosentti on vain ${FI.p(V.rajoitetusti_verovelvollisen_kunnallisvero)}, koska suurimmat kaupungit verottavat kevyesti. Kunnallisvero on tasavero ilman tuloportaita: sama prosentti koskee koko verotettavaa tuloa perusvähennyksen jälkeen, joten yhden prosenttiyksikön ero maksaa ${FI.eur(3500)} kuukausipalkalla noin ${FI.eur(PISTE[1].vuosi)} vuodessa. Kirkollisvero tulee kunnallisveron päälle vain seurakunnan jäsenille, ja sen prosentti vaihtelee kunnittain: evankelis-luterilaisilla ${FI.num(EVL_MIN, 2)}–${FI.num(EVL_MAX, 2)} % ja ortodokseilla ${FI.num(ORT_MIN, 2)}–${FI.num(ORT_MAX, 2)} %. Taulukossa voit hakea kuntaa nimellä, järjestää listan veron tai aakkosten mukaan ja vaihtaa kuukausipalkan omaksesi, jolloin jokaisen kunnan nettopalkka ja ero parhaaseen kuntaan lasketaan uudelleen.`,
    faqs: [
      { q: 'Missä kunnassa on Suomen matalin kunnallisvero vuonna 2026?', a: `Matalin prosentti on kunnalla ${HALVIN.nimi}, ${FI.p(HALVIN.kunta)}. Seuraavina ovat ${HALV10.slice(1, 4).map((k) => `${k.nimi} (${FI.p(k.kunta)})`).join(', ')}. Matalan veron kuntien joukossa on siis sekä suuria kaupunkeja että pieniä kuntia. Pääkaupunkiseudun matalat prosentit selittävät, miksi väestöllä painotettu keskiarvo on vain ${FI.p(V.rajoitetusti_verovelvollisen_kunnallisvero)}. ${FI.eur(PALKKA)} palkalla ero korkeimman veron kuntaan on noin ${FI.eur(EROKK)} nettoa kuukaudessa.` },
      { q: 'Paljonko yksi prosenttiyksikkö kunnallisveroa maksaa vuodessa?', a: `Laskurin mukaan ${FI.eur(PISTE[0].kk)} kuukausipalkalla noin ${FI.eur(PISTE[0].vuosi)}, ${FI.eur(PISTE[1].kk)} palkalla ${FI.eur(PISTE[1].vuosi)} ja ${FI.eur(PISTE[2].kk)} palkalla ${FI.eur(PISTE[2].vuosi)} vuodessa. Summa on hieman alle prosentin bruttopalkasta, koska kunnallisvero lasketaan verotettavasta tulosta eli maksujen, tulonhankkimisvähennyksen ja perusvähennyksen jälkeen. Työtulovähennys voi pienentää myös kunnallisveroa, jos valtionveroa ei ole tarpeeksi.` },
      { q: 'Miksi Ahvenanmaan kuntien veroprosentit ovat niin korkeita?', a: `Ahvenanmaan ${AHVENANMAAN_KUNTIA} kunnan prosentit ovat ${FI.num(AH_MIN, 2)}–${FI.num(AH_MAX, 2)} %, mutta valtion tuloveroasteikon prosentit ovat siellä ${FI.num(V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa, 2)} prosenttiyksikköä pienemmät. Kokonaisverotus ei siksi ole raskaampi: ${FI.eur(PALKKA)} palkasta jää Maarianhaminassa noin ${FI.eur(nettoKk(MH))} käteen, kun Helsingissä jää ${FI.eur(nettoKk(HKI))}. Yle-veron sijaan Ahvenanmaalla maksetaan ${FI.eur(V.ahvenanmaa_mediamaksu.maara)} mediamaksu, ja perusvähennys lasketaan kunnallisverotuksessa omalla kaavallaan.` },
      { q: 'Lasketaanko kirkollisvero mukaan kuntavertailun nettopalkkaan?', a: `Ei lasketa: taulukon nettopalkka koskee ${IKA}-vuotiasta palkansaajaa, joka ei kuulu kirkkoon. Kirkollisveron prosentit näkyvät omissa sarakkeissaan leveällä näytöllä. Evankelis-luterilainen kirkollisvero on ${FI.num(EVL_MIN, 2)}–${FI.num(EVL_MAX, 2)} % ja ortodoksinen ${FI.num(ORT_MIN, 2)}–${FI.num(ORT_MAX, 2)} %. Kirkon jäsenen netto on siis noin prosentin tai kaksi verotettavasta tulosta pienempi kuin taulukossa. Oman nettosi kirkollisveron kanssa näet veroprosenttilaskurista.` },
    ],
    body: (h) => `
<h2>Matalimmat ja korkeimmat kunnallisverot 2026</h2>
<p>Taulukoissa on Manner-Suomen kymmenen matalimman ja kymmenen korkeimman veroprosentin kuntaa sekä nettopalkka ${h.eur(PALKKA)} kuukausipalkasta ilman kirkollisveroa. Luvut tulevat samasta laskentamoottorista kuin yllä oleva vertailu.</p>
${h.table(['Kunta', 'Kunnallisvero', 'Netto/kk'], HALV10.map((k) => [k.nimi, `${h.num(k.kunta, 2)} %`, h.eur(nettoKk(k))]), `Matalin kunnallisvero 2026, palkka ${h.eur(PALKKA)}/kk`, ['l', 'r', 'r'])}
${h.table(['Kunta', 'Kunnallisvero', 'Netto/kk'], KALL10.map((k) => [k.nimi, `${h.num(k.kunta, 2)} %`, h.eur(nettoKk(k))]), `Korkein kunnallisvero 2026, palkka ${h.eur(PALKKA)}/kk`, ['l', 'r', 'r'])}
<h2>Miten kunnat jakautuvat</h2>
<p>Valtaosa kunnista sijoittuu kahdeksan ja kymmenen prosentin väliin. Alle seitsemän prosentin kuntia on vain ${h.num(ALLE7.length)}: ${ALLE7.join(', ')}. Joukossa on pääkaupunkiseudun kaupunkeja mutta myös pieniä kuntia, joten asukasluku ei yksin selitä veroprosenttia. Mediaanikunnassa prosentti on ${h.num(MEDIAANI, 2)} %, eli puolet kunnista verottaa tätä enemmän.</p>
${h.table(['Kunnallisvero', 'Kuntia'], VALIT.map((v) => [v[1] >= 100 ? `vähintään ${h.num(v[0], 2)} %` : v[0] === 0 ? `alle ${h.num(v[1], 2)} %` : `${h.num(v[0], 2)}–${h.num(v[1] - 0.01, 2)} %`, h.num(kpl(v))]), `Manner-Suomen ${MANNER.length} kuntaa, vuosi 2026`, ['l', 'r'])}
<h2>Mitä prosenttiyksikkö maksaa sinulle</h2>
<p>Kun mietit muuttoa naapurikuntaan, ratkaisevaa on erotus prosenttiyksikköinä, ei se, onko vero "korkea". Laskuri vertasi samaa palkkaa kahdessa kunnassa, joiden kunnallisvero eroaa täsmälleen yhdellä prosenttiyksiköllä:</p>
${h.table(['Kuukausipalkka', 'Lisävero vuodessa', 'Kuukaudessa'], PISTE.map((x) => [h.eur(x.kk), h.eur(x.vuosi), h.eur(x.vuosi / 12)]), '+1 prosenttiyksikkö kunnallisveroa, vuoden 2026 verot', ['l', 'r', 'r'])}
<p>Vaikutus kasvaa suoraan palkan mukana, koska kunnallisverossa ei ole portaita. Asumisen hinta ja työmatkat ratkaisevat muuttopäätöksen useimmiten enemmän, mutta suurella palkalla ero voi kattaa osan vuokraerosta.</p>
<h2>Kotikunnan valinta ja verokortti</h2>
<p>Kunnallisvero on suurin yksittäinen erä useimpien palkansaajien veroissa, joten kunnan vaihtaminen näkyy verokortin prosentissa. Pääkaupunkiseudulla ero on suurempi kuin moni arvaa: Helsingin ja Espoon ${h.num(HKI.kunta, 2)} % sekä Vantaan ${h.num(KUNNAT.find((k) => k.nimi === 'Vantaa')!.kunta, 2)} % ovat lähekkäin, mutta kehyskunnissa prosentti on selvästi korkeampi, esimerkiksi ${['Nurmijärvi', 'Järvenpää', 'Kerava'].map((n) => `${n} ${h.num(KUNNAT.find((k) => k.nimi === n)!.kunta, 2)} %`).join(', ')}. Jos olet muuttamassa, laske ensin uuden kunnan netto taulukosta ja tarkista sitten verokortin prosentti ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurilla')}.</p>
<h2>Mistä prosentit tulevat</h2>
<p>Jokainen kunta päättää tuloveroprosenttinsa itse, ja Verohallinto kokoaa ne vuosittain päätökseen. Tämän sivun luvut ovat ${h.src('vero_kunnat', `Verohallinnon päätöksestä ${h.date(KUNNAT_META.annettu)}`)} (${KUNNAT_META.diaari}). Kotikunnan prosentti vaikuttaa myös verokortin ennakonpidätykseen, jonka laskentaperusteet ovat ${h.src('vero_ennakonpidatys', 'ennakonpidätyspäätöksessä')}. Kaupunkikohtaiset esimerkit löytyvät sivuilta ${h.a('helsinki', 'Helsinki')} ja ${h.a('tampere', 'Tampere')}, kirkollisveron prosentit sivulta ${h.a('kirkollisvero', 'kirkollisvero')} ja Ahvenanmaan erillinen asteikko sivulta ${h.a('ahvenanmaa', 'Ahvenanmaan verotus')}.</p>`,
  },
  en: {
    slug: 'municipal-tax-rates',
    nav: 'Municipal tax rates',
    card: `All ${KUNTIA} Finnish municipal income tax rates for 2026, with the net pay the same salary gives in each.`,
    title: 'Municipal Tax Rates Finland 2026: All Towns and Net Pay',
    description: `Municipal tax rates Finland 2026: all ${KUNTIA} income tax rates from ${EN.num(HALVIN.kunta, 2)}% to ${EN.num(KALLEIN.kunta, 2)}%, church tax and net pay on the same salary. Search and sort the table.`,
    h1: 'Finnish municipal tax rates 2026',
    intro: 'Pick a monthly salary and the table shows every municipality’s tax rate and how much of that salary you keep there.',
    resume: `In 2026 the lowest municipal income tax (kunnallisvero) in mainland Finland is ${EN.p(HALVIN.kunta)} in ${HALVIN.nimi} and the highest ${EN.p(KALLEIN.kunta)} in ${KALLEIN.nimi}; on a ${EN.eur(PALKKA)} monthly salary, living in the cheapest one leaves you about ${EN.eur(EROKK)} more per month. Vero’s decision lists ${KUNTIA} municipalities, ${AHVENANMAAN_KUNTIA} of them in Åland. The mainland median is ${EN.p(MEDIAANI)} and the simple average ${EN.p(MANNER_KA)}, yet the population-weighted average rate is only ${EN.p(V.rajoitetusti_verovelvollisen_kunnallisvero)}, because the biggest cities tax lightly. Municipal tax is flat: one rate applies to all taxable income after the basic deduction, so each percentage point costs about ${EN.eur(PISTE[1].vuosi)} a year on a ${EN.eur(3500)} monthly salary. Church tax applies only to members of a parish, at ${EN.num(EVL_MIN, 2)}–${EN.num(EVL_MAX, 2)}% for the Lutheran church and ${EN.num(ORT_MIN, 2)}–${EN.num(ORT_MAX, 2)}% for the Orthodox church. If you are deciding between Helsinki, Espoo and Vantaa, or a commuter town, search the table by name.`,
    faqs: [
      { q: 'Which Finnish municipality has the lowest income tax in 2026?', a: `${HALVIN.nimi}, at ${EN.p(HALVIN.kunta)}. Next come ${HALV10.slice(1, 4).map((k) => `${k.nimi} (${EN.p(k.kunta)})`).join(', ')}, so the low-tax group mixes big cities with small municipalities. These low capital-region rates are why the population-weighted average is only ${EN.p(V.rajoitetusti_verovelvollisen_kunnallisvero)}. On a ${EN.eur(PALKKA)} salary the gap to the highest-tax municipality is about ${EN.eur(EROKK)} of net pay per month.` },
      { q: 'How much does one point of municipal tax cost me per year?', a: `Per the calculator, about ${EN.eur(PISTE[0].vuosi)} a year on ${EN.eur(PISTE[0].kk)} a month, ${EN.eur(PISTE[1].vuosi)} on ${EN.eur(PISTE[1].kk)} and ${EN.eur(PISTE[2].vuosi)} on ${EN.eur(PISTE[2].kk)}. That is slightly under one per cent of gross pay, because the rate applies to taxable income after contributions, the work-expense deduction and the basic deduction. When state tax is too small to absorb it, the earned income credit also trims municipal tax.` },
      { q: 'Why are municipal tax rates in Åland so much higher?', a: `Åland’s ${AHVENANMAAN_KUNTIA} municipalities charge ${EN.num(AH_MIN, 2)}–${EN.num(AH_MAX, 2)}%, but the state income tax rates there are ${EN.num(V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa, 2)} points lower. The total burden is therefore not heavier: ${EN.eur(PALKKA)} a month leaves about ${EN.eur(nettoKk(MH))} in Mariehamn against ${EN.eur(nettoKk(HKI))} in Helsinki. Åland residents pay a ${EN.eur(V.ahvenanmaa_mediamaksu.maara)} media fee instead of the Yle tax.` },
      { q: 'Does the municipality table include church tax in net pay?', a: `No. The net pay column assumes an employee aged ${IKA.replace('–', ' to ')} who does not belong to a church. Church tax rates appear in their own columns on wider screens: ${EN.num(EVL_MIN, 2)}–${EN.num(EVL_MAX, 2)}% for Lutherans and ${EN.num(ORT_MIN, 2)}–${EN.num(ORT_MAX, 2)}% for Orthodox members. Members keep roughly one to two per cent of taxable income less than the table shows.` },
    ],
    body: (h) => `
<h2>Lowest and highest municipal tax in 2026</h2>
<p>These are the ten mainland municipalities with the lowest and the ten with the highest rates, with net pay on a ${h.eur(PALKKA)} monthly salary and no church tax. The figures come from the same engine as the full table above.</p>
${h.table(['Municipality', 'Tax rate', 'Net/month'], HALV10.map((k) => [k.nimi, `${h.num(k.kunta, 2)}%`, h.eur(nettoKk(k))]), `Lowest municipal tax 2026, salary ${h.eur(PALKKA)}/month`, ['l', 'r', 'r'])}
${h.table(['Municipality', 'Tax rate', 'Net/month'], KALL10.map((k) => [k.nimi, `${h.num(k.kunta, 2)}%`, h.eur(nettoKk(k))]), `Highest municipal tax 2026, salary ${h.eur(PALKKA)}/month`, ['l', 'r', 'r'])}
<h2>How the rates are spread</h2>
<p>Most municipalities charge between eight and ten per cent. Only ${h.num(ALLE7.length)} charge under seven: ${ALLE7.join(', ')}. The list mixes capital-region cities with small municipalities, so size alone does not explain the rate. The median municipality charges ${h.num(MEDIAANI, 2)}%, meaning half of them charge more.</p>
${h.table(['Municipal tax', 'Municipalities'], VALIT.map((v) => [v[1] >= 100 ? `${h.num(v[0], 2)}% or more` : v[0] === 0 ? `under ${h.num(v[1], 2)}%` : `${h.num(v[0], 2)}–${h.num(v[1] - 0.01, 2)}%`, h.num(kpl(v))]), `${MANNER.length} mainland municipalities, 2026`, ['l', 'r'])}
<h2>What a percentage point is worth to you</h2>
<p>If you are comparing two places to live, look at the difference in points rather than whether a rate sounds high. The calculator ran the same salary through two municipalities whose tax differs by exactly one point:</p>
${h.table(['Monthly salary', 'Extra tax per year', 'Per month'], PISTE.map((x) => [h.eur(x.kk), h.eur(x.vuosi), h.eur(x.vuosi / 12)]), '+1 point of municipal tax, 2026 taxes', ['l', 'r', 'r'])}
<p>The effect grows in a straight line with salary, since municipal tax has no brackets. Rent and commuting usually matter more when choosing where to live, but on a high salary the tax gap can cover part of a rent difference.</p>
<h2>Where the rates come from</h2>
<p>Each municipality sets its own income tax rate and Vero publishes them all once a year. The rates on this page are from the ${h.src('vero_kunnat', `Tax Administration decision of ${h.date(KUNNAT_META.annettu)}`)} (${KUNNAT_META.diaari}). Your home municipality’s rate also feeds into the withholding on your tax card, calculated under the ${h.src('vero_ennakonpidatys', '2026 withholding decision')}. For worked examples see ${h.a('helsinki', 'Helsinki')} and ${h.a('tampere', 'Tampere')}; parish rates are on the ${h.a('kirkollisvero', 'church tax')} page and Åland’s own state scale on ${h.a('ahvenanmaa', 'Åland tax')}.</p>`,
  },
});
