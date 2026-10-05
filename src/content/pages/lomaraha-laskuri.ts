import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { lomapaivat, lomaraha, prosenttilomapalkka } from '../../lib/engine/loma';
import { laskeVerot } from '../../lib/engine/vero';

const L = P.vuosiloma, V = P.vero;
const PROS = L.lomaraha_esimerkki_prosentti;
const MAKSUT = (V.tyoelakemaksu_prosentti + V.tyottomyysvakuutusmaksu_prosentti) / 100;
/** Kuten LomarahaLaskuri: lomaraha × (1 − verokortin prosentti − työntekijän maksut), Helsinki, ei kirkkoa. */
const laske = (kk: number, paivat: number) => {
  const l = lomaraha(kk, paivat);
  const v = laskeVerot({ tulo: kk * 12 + l.lomaraha, kunta: 'Helsinki' });
  return { ...l, pros: v.veroprosentti, netto: l.lomaraha * (1 - v.veroprosentti / 100 - MAKSUT) };
};
const TAYSI = lomapaivat(12);
const ENSI = lomapaivat(12, true);
const PALKAT = [2500, 3000, 3500, 4000, 5000];
const RIVIT = PALKAT.map((kk) => ({ kk, ...laske(kk, TAYSI) }));
const R3 = RIVIT[1];
const E3 = laske(3000, ENSI);
const OSA_KK = 7;
const OSA = lomapaivat(OSA_KK, true);
const TUNTI_VUOSI = 24000;

export default definePage({
  id: 'lomaraha-laskuri',
  group: 'laskurit',
  order: 110,
  tool: 'lomaraha',
  related: ['vuosiloma', 'lomakorvaus', 'nettopalkka-3000', 'veroprosenttilaskuri'],
  sources: ['finlex_vuosiloma', 'tyosuojelu_lomapalkka'],
  fi: {
    slug: 'lomaraha',
    nav: 'Lomarahalaskuri',
    card: 'Lomaraha ja lomapäivät kuukausipalkasta, työehtosopimuksen prosentilla, sekä käteen jäävä summa.',
    title: 'Lomaraha 2026: laskuri, lomapäivät ja lomarahan verotus',
    description: `Lomaraha 2026: laske lomarahasi kuukausipalkasta ja lomapäivistä. ${FI.eur(3000)} palkalla ja ${TAYSI} lomapäivällä lomaraha on ${FI.eur(R3.lomaraha)}, josta käteen jää noin ${FI.eur(R3.netto)}.`,
    h1: 'Lomarahalaskuri',
    intro: 'Syötä kuukausipalkka, lomavuoden täydet kuukaudet ja työehtosopimuksesi lomarahaprosentti, niin näet lomarahan bruttona ja käteen.',
    resume: `Kun kuukausipalkka on ${FI.eur(3000)} ja lomaa on kertynyt täydeltä lomavuodelta ${TAYSI} arkipäivää, ${FI.p(PROS, 0)} lomaraha on laskurin mukaan ${FI.eur(R3.lomaraha)} bruttona ja noin ${FI.eur(R3.netto)} käteen Helsingissä. Lomaraha ei perustu vuosilomalakiin vaan työehtosopimukseen, ja Työsuojeluhallinnon mukaan se on tyypillisesti esimerkiksi ${FI.p(PROS, 0)} lomapalkasta ja maksetaan yleensä kesäloman yhteydessä. Lomapäiviä kertyy laissa ${FI.num(L.lomapaivat_kk, 1)} arkipäivää jokaiselta täydeltä kuukaudelta, ja ensimmäisenä työvuonna, jos työsuhde on kestänyt maaliskuun loppuun mennessä alle vuoden, ${FI.num(L.lomapaivat_kk_alle_vuosi)} päivää. Kuukausi on täysi, kun töitä on vähintään ${L.taysi_kk_paivat} päivää tai ${L.taysi_kk_tunnit} tuntia. Laskuri arvottaa lomapäivän kuukausipalkka jaettuna ${L.lomakorvaus_jakaja_kk}:llä, samalla jakajalla, jota vuosilomalaki käyttää lomakorvauksessa, ja kertoo lomapalkan sopimuksesi prosentilla. Lomarahasta pidätetään veroa saman verokortin prosentilla kuin palkasta, ja siitä peritään myös työeläke- ja työttömyysvakuutusmaksu. Oman alasi lomarahaprosentti, laskentapohja ja maksupäivä löytyvät aina työehtosopimuksesta, joten tarkista ne ennen kuin luotat laskurin tulokseen.`,
    faqs: [
      { q: 'Paljonko lomarahaa saa 3 000 euron kuukausipalkalla?', a: `Täydeltä lomavuodelta kertyy ${TAYSI} lomapäivää. Laskurin tavalla lomapäivän palkka on ${FI.eur(3000)} / ${L.lomakorvaus_jakaja_kk} = ${FI.eur(R3.paivapalkka)}, lomapalkka ${FI.eur(R3.lomapalkka)} ja ${FI.p(PROS, 0)} lomaraha ${FI.eur(R3.lomaraha)}. Helsingissä ilman kirkollisveroa käteen jää noin ${FI.eur(R3.netto)}. Jos työehtosopimuksesi laskee lomarahan toisin, muuta prosenttia laskurissa.` },
      { q: 'Onko lomaraha lakisääteinen etu Suomessa?', a: `Ei ole. Vuosilomalaki takaa lomapäivät ja lomapalkan, mutta lomaraha eli lomaltapaluuraha sovitaan työehtosopimuksissa. Työsuojeluhallinto mainitsee esimerkkinä ${FI.p(PROS, 0)} lomapalkasta. Jos alallasi ei ole työehtosopimusta eikä työsopimuksessa sovita lomarahasta, sitä ei tarvitse maksaa. Tarkista ehdot, kuten paluu töihin loman jälkeen, omasta sopimuksestasi.` },
      { q: 'Montako lomapäivää ensimmäisenä työvuonna kertyy?', a: `Jos työsuhde on maaliskuun loppuun mennessä kestänyt alle vuoden, lomaa kertyy ${FI.num(L.lomapaivat_kk_alle_vuosi)} arkipäivää täydeltä kuukaudelta, eli täydeltä lomavuodelta ${ENSI} päivää. Esimerkiksi ${OSA_KK} täydeltä kuukaudelta kertyy ${OSA} päivää, ja päivän osa pyöristetään ylöspäin. ${FI.eur(3000)} palkalla ${ENSI} päivän lomaraha on ${FI.eur(E3.lomaraha)}. Seuraavana lomavuonna tahti nousee ${FI.num(L.lomapaivat_kk, 1)} päivään kuukaudessa.` },
      { q: 'Verotetaanko lomaraha eri prosentilla kuin palkka?', a: `Ei. Lomarahasta pidätetään vero samalla verokortin prosentilla kuin kuukausipalkasta, ja siitä peritään työeläkemaksu ${FI.p(V.tyoelakemaksu_prosentti)} ja työttömyysvakuutusmaksu ${FI.p(V.tyottomyysvakuutusmaksu_prosentti)}. Jos vuoden palkat lomaraha mukaan lukien ylittävät verokortin tulorajan, ylittävästä osasta pidätetään lisäprosentti. Siksi lomaraha kannattaa laskea mukaan vuositulon arvioon, kun tilaat uutta verokorttia OmaVerosta.` },
      { q: 'Milloin lomaraha maksetaan tilille?', a: `Maksuaika riippuu työehtosopimuksesta. Työsuojeluhallinnon mukaan lomaraha maksetaan yleensä kesäloman yhteydessä, mutta osa sopimuksista maksaa sen loman jälkeen tai jakaa sen. Laskuri ei ota kantaa maksupäivään. Lomaraha on tuloa myös Kelan etuuksissa: se lasketaan asumistuen tuloihin ja vanhempainrahan vuosituloon, mutta ei ansiopäivärahan palkkaan.` },
    ],
    body: (h) => `
<h2>Lomaraha eri palkoilla</h2>
<p>Taulukossa on täysi lomavuosi eli ${h.num(TAYSI)} lomapäivää, ${h.num(PROS)} prosentin lomaraha ja verot Helsingissä ilman kirkollisveroa. Käteen jäävä summa sisältää verokortin prosentin ja työntekijän maksut.</p>
${h.table(['Kuukausipalkka', 'Lomapäivän palkka', 'Lomapalkka', 'Lomaraha', 'Veroprosentti', 'Käteen'], RIVIT.map((x) => [h.eur(x.kk), h.eur(x.paivapalkka, 2), h.eur(x.lomapalkka), h.eur(x.lomaraha), `${h.num(x.pros, 1)} %`, h.eur(x.netto)]), `Lomaraha ${h.num(PROS)} % lomapalkasta, ${h.num(TAYSI)} lomapäivää, vuosi 2026`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Käteen jäävä osuus pienenee palkan kasvaessa, koska verokortin prosentti nousee. ${h.eur(2500)} palkalla lomarahasta jää käteen noin ${h.num(RIVIT[0].netto / RIVIT[0].lomaraha * 100)} %, ${h.eur(5000)} palkalla noin ${h.num(RIVIT[4].netto / RIVIT[4].lomaraha * 100)} %.</p>
<h2>Miten laskuri laskee</h2>
<ol>
<li><strong>Lomapäivät:</strong> täydet lomanmääräytymiskuukaudet 1.4.–31.3. kertaa ${h.num(L.lomapaivat_kk, 1)} (ensimmäisenä vuonna ${h.num(L.lomapaivat_kk_alle_vuosi)}), päivän osa pyöristetään ylöspäin.</li>
<li><strong>Lomapäivän palkka:</strong> kuukausipalkka jaettuna ${h.num(L.lomakorvaus_jakaja_kk)}:llä. Jakaja on vuosilomalain 17 §:stä, jossa se koskee lomakorvausta; laskuri käyttää sitä sopimuksen tavanomaisena laskentatapana.</li>
<li><strong>Lomapalkka:</strong> lomapäivän palkka × lomapäivät.</li>
<li><strong>Lomaraha:</strong> lomapalkka × työehtosopimuksen prosentti.</li>
</ol>
<p>Kuukausipalkkainen saa lain mukaan loman ajalta tavallisen palkkansa, joten laskurin lomapalkka on vain lomarahan laskentapohja, ei erillinen maksu. Työehtosopimukset voivat laskea pohjan toisin, esimerkiksi ottaa mukaan vuorolisät, joten tarkista oma sopimuksesi ${h.src('tyosuojelu_lomapalkka', 'Työsuojeluhallinnon ohjeen')} rinnalla.</p>
<h2>Lomaraha ja verokortin tuloraja</h2>
<p>Lomaraha nostaa vuoden palkkatuloja, ja se pitää muistaa, kun arvioit verokortin tulorajaa. ${h.eur(3000)} kuukausipalkalla ja ${h.eur(R3.lomaraha)} lomarahalla vuoden palkat ovat ${h.eur(3000 * 12 + R3.lomaraha)}. Jos tuloraja on ilmoitettu pelkän kuukausipalkan mukaan, raja ylittyy lomarahan maksukuussa ja ylittävästä osasta pidätetään lisäprosentti. Liika pidätys palautuu verotuksessa, mutta oikea tuloraja pitää kesän tilinauhan ennustettavana. Laskurin veroprosentti on laskettu koko vuoden tuloista lomaraha mukaan lukien.</p>
<h2>Vähän työpäiviä kuukaudessa</h2>
<p>Jos työskentelet sopimuksen mukaan alle ${h.num(L.taysi_kk_paivat)} päivää kuukaudessa, lomapalkka tai -korvaus lasketaan prosenttiperusteisesti: ${h.num(L.prosenttiperuste[0], 1)} % lomavuoden palkoista alle vuoden ja ${h.num(L.prosenttiperuste[1], 1)} % vähintään vuoden työsuhteessa. Esimerkiksi ${h.eur(TUNTI_VUOSI)} vuosiansioista se tekee ${h.eur(prosenttilomapalkka(TUNTI_VUOSI, true))}. Jos työehtosopimuksessa on lomaraha, sopimus määrää, miten se lasketaan tällaisessa työsuhteessa. Pitämättömät lomat korvataan työsuhteen päättyessä ${h.a('lomakorvaus', 'lomakorvauksena')}, ja lomapalkan saatavat vanhenevat ${h.num(L.vanhentuminen_v)} vuodessa.</p>
<p>Lomapäivien kertymä on selitetty sivulla ${h.a('vuosiloma', 'vuosiloman ansainta')} ja laki ${h.src('finlex_vuosiloma', 'vuosilomalaissa')}. Lomarahan vaikutuksen vuoden veroprosenttiin voi tarkistaa ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurilla')}, ja tavallisen kuukauden nettopalkan sivulta ${h.a('nettopalkka-3000', 'nettopalkka 3 000 euron palkasta')}.</p>`,
  },
  en: {
    slug: 'holiday-bonus-calculator',
    nav: 'Holiday bonus calculator',
    card: 'Your Finnish holiday bonus (lomaraha) and holiday days from your monthly salary, with take-home pay.',
    title: 'Holiday Bonus Finland 2026: Lomaraha Calculator and Tax',
    description: `Holiday bonus Finland 2026: work out your lomaraha from your monthly salary and holiday days. ${EN.eur(3000)} pay and ${TAYSI} days give ${EN.eur(R3.lomaraha)}, about ${EN.eur(R3.netto)} after tax.`,
    h1: 'Finnish holiday bonus calculator',
    intro: 'Enter your monthly salary, the full months in your holiday year and your collective agreement’s bonus rate to see the holiday bonus gross and take-home.',
    resume: `On a ${EN.eur(3000)} monthly salary with a full holiday year of ${TAYSI} working days of leave, a ${EN.p(PROS, 0)} holiday bonus (lomaraha) comes to ${EN.eur(R3.lomaraha)} gross per the calculator, about ${EN.eur(R3.netto)} after tax in Helsinki. The holiday bonus is not in the Annual Holidays Act: it comes from collective agreements (TES), and the Occupational Safety and Health Administration gives ${EN.p(PROS, 0)} of holiday pay as a typical example, usually paid with the summer holiday. The law gives you ${EN.num(L.lomapaivat_kk, 1)} working days of leave for each full month, or ${EN.num(L.lomapaivat_kk_alle_vuosi)} days if your job had lasted less than a year by the end of March. A month counts when you worked at least ${L.taysi_kk_paivat} days or ${L.taysi_kk_tunnit} hours. The calculator values a holiday day at your monthly salary divided by ${L.lomakorvaus_jakaja_kk}, the divisor the Act uses for holiday compensation, then applies your agreement’s rate. Tax is withheld at the same tax card rate as your salary, and the employee pension and unemployment contributions apply too. Your agreement sets the exact rate and payment date.`,
    faqs: [
      { q: 'How much holiday bonus do I get in Finland on €3,000 a month?', a: `A full holiday year gives ${TAYSI} days of leave. The calculator values a day at ${EN.eur(3000)} / ${L.lomakorvaus_jakaja_kk} = ${EN.eur(R3.paivapalkka)}, so holiday pay is ${EN.eur(R3.lomapalkka)} and a ${EN.p(PROS, 0)} bonus ${EN.eur(R3.lomaraha)}. In Helsinki without church tax about ${EN.eur(R3.netto)} reaches your account. If your agreement calculates it differently, change the percentage in the tool.` },
      { q: 'Is the holiday bonus required by Finnish law?', a: `No. The Annual Holidays Act guarantees holiday days and holiday pay, but the holiday bonus, also called lomaltapaluuraha, is agreed in collective agreements. The labour authorities cite ${EN.p(PROS, 0)} of holiday pay as an example. If no collective agreement covers your job and your contract says nothing about it, your employer does not have to pay one. Check conditions such as returning to work after the leave.` },
      { q: 'How many holiday days do I earn in my first year in a Finnish job?', a: `If your employment had lasted less than a year by the end of March, you earn ${EN.num(L.lomapaivat_kk_alle_vuosi)} working days per full month, ${ENSI} for a full holiday year. ${OSA_KK} full months give ${OSA} days, with part days rounded up. On ${EN.eur(3000)} a month, a bonus on ${ENSI} days is ${EN.eur(E3.lomaraha)}. From the next holiday year you earn ${EN.num(L.lomapaivat_kk, 1)} days a month.` },
      { q: 'Is the holiday bonus taxed at a higher rate than salary?', a: `No. Tax is withheld at the same tax card rate as your monthly salary, and the pension contribution (${EN.p(V.tyoelakemaksu_prosentti)}) and unemployment insurance (${EN.p(V.tyottomyysvakuutusmaksu_prosentti)}) are deducted as usual. If your pay for the year, bonus included, exceeds the income limit on your card, the excess is withheld at the additional rate. Include the bonus when you estimate income for a new tax card.` },
      { q: 'When is the holiday bonus paid in Finland?', a: `The timing depends on your collective agreement. The labour authorities say it is usually paid with the summer holiday, but some agreements pay it after the leave or in instalments. The calculator does not assume a date. The bonus also counts as income for Kela: it is included in housing allowance income and in the annual income behind parental allowance, but not in the wage base for unemployment allowance.` },
    ],
    body: (h) => `
<h2>Holiday bonus at different salaries</h2>
<p>The table assumes a full holiday year of ${h.num(TAYSI)} days, a ${h.num(PROS)}% bonus and tax in Helsinki without church tax. Take-home pay reflects the tax card rate and employee contributions.</p>
${h.table(['Monthly salary', 'Daily holiday pay', 'Holiday pay', 'Bonus', 'Tax rate', 'Take-home'], RIVIT.map((x) => [h.eur(x.kk), h.eur(x.paivapalkka, 2), h.eur(x.lomapalkka), h.eur(x.lomaraha), `${h.num(x.pros, 1)}%`, h.eur(x.netto)]), `Bonus ${h.num(PROS)}% of holiday pay, ${h.num(TAYSI)} days, 2026`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The share you keep shrinks as pay rises because your tax card rate climbs: about ${h.num(RIVIT[0].netto / RIVIT[0].lomaraha * 100)}% on ${h.eur(2500)}, about ${h.num(RIVIT[4].netto / RIVIT[4].lomaraha * 100)}% on ${h.eur(5000)}.</p>
<h2>How the calculator works</h2>
<ol>
<li><strong>Holiday days:</strong> full months in the holiday credit year (1 April to 31 March) × ${h.num(L.lomapaivat_kk, 1)}, or × ${h.num(L.lomapaivat_kk_alle_vuosi)} in your first year, rounded up.</li>
<li><strong>Daily holiday pay:</strong> monthly salary ÷ ${h.num(L.lomakorvaus_jakaja_kk)}. The divisor comes from section 17 of the Act, where it applies to holiday compensation; the tool uses it as a standard convention.</li>
<li><strong>Holiday pay:</strong> daily holiday pay × holiday days.</li>
<li><strong>Bonus:</strong> holiday pay × your agreement’s percentage.</li>
</ol>
<p>Monthly-paid staff simply keep their normal salary during leave, so the holiday pay figure here is only the base for the bonus, not an extra payment. Agreements may define the base differently, for example including shift allowances, so read yours alongside the ${h.src('tyosuojelu_lomapalkka', 'labour authorities’ guidance')}.</p>
<h2>Few working days a month</h2>
<p>If your contract has you working fewer than ${h.num(L.taysi_kk_paivat)} days a month, holiday pay or compensation is calculated as a percentage: ${h.num(L.prosenttiperuste[0], 1)}% of the year’s wages in a job under a year old and ${h.num(L.prosenttiperuste[1], 1)}% after a year. On ${h.eur(TUNTI_VUOSI)} of annual pay that is ${h.eur(prosenttilomapalkka(TUNTI_VUOSI, true))}, and any holiday bonus is calculated as your collective agreement specifies. Untaken leave is paid out as ${h.a('lomakorvaus', 'holiday compensation')} when you leave, and claims expire after ${h.num(L.vanhentuminen_v)} years.</p>
<p>Holiday accrual is explained on ${h.a('vuosiloma', 'annual leave accrual')} and in the ${h.src('finlex_vuosiloma', 'Annual Holidays Act')}. To see how the bonus affects your yearly tax rate, use the ${h.a('veroprosenttilaskuri', 'tax rate calculator')}; for an ordinary month, see ${h.a('nettopalkka-3000', 'net pay from €3,000')}.</p>`,
  },
});
