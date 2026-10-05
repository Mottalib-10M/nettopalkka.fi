import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { asumistuki, kuntaryhma } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const ESP = kunta('Espoo');
const KAU = kunta('Kauniainen');
const KIRK = kunta('Kirkkonummi');
const VIH = kunta('Vihti');
const ALEMPIA = MANNER.filter((k) => k.kunta < ESP.kunta).length;

const KK = [2500, 3500, 5000];
const NAAP = ['Espoo', 'Kauniainen', 'Helsinki', 'Kirkkonummi', 'Vihti'];
const rivi = (n: string) => KK.map((x) => netto(x, n).kkNettoTodellinen);
const E35 = netto(3500, 'Espoo');
const K35 = netto(3500, 'Kauniainen');
const ERO_KAU = KK.map((x) => (netto(x, 'Kauniainen').kkNettoTodellinen - netto(x, 'Espoo').kkNettoTodellinen) * 12);
const ERO_KIRK5 = (netto(5000, 'Espoo').kkNettoTodellinen - netto(5000, 'Kirkkonummi').kkNettoTodellinen) * 12;
const EVL35 = (netto(3500, 'Espoo').kkNettoTodellinen - netto(3500, 'Espoo', 'evl').kkNettoTodellinen) * 12;

const AT = P.asumistuki;
const PERHE = { aikuiset: 2, lapset: 1, tulot: 2600, vuokra: 1100 };
const AT_ESP = asumistuki({ kunta: 'Espoo', ...PERHE });
const AT_KIRK = asumistuki({ kunta: 'Kirkkonummi', ...PERHE });

export default definePage({
  id: 'espoo',
  group: 'kunnat',
  order: 20,
  tool: 'netto',
  toolPreset: { kunta: 'Espoo' },
  related: ['helsinki', 'vantaa', 'kuntavertailu', 'kirkollisvero'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-espoo',
    nav: 'Espoo',
    card: 'Espoon ja Kauniaisten veroero, länsinaapurit ja asumistuen raja kuntaryhmien välillä.',
    title: 'Nettopalkka Espoo 2026: verot, Kauniainen ja länsinaapurit',
    description: 'Nettopalkka Espoossa 2026: kunnallisvero 5,30 % kuten Helsingissä, Kauniainen 4,70 % keskellä Espoota. Laske palkka ja vertaa Kirkkonummeen ja Vihtiin.',
    h1: 'Nettopalkka Espoossa',
    intro: 'Syötä bruttopalkkasi: laskuri käyttää Espoon kunnallisveroa ja seurakuntien prosentteja.',
    resume: `Espoossa ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(E35.kkNettoTodellinen)} kuukaudessa ilman kirkollisveroa ja lomarahaa, eli täsmälleen saman verran kuin Helsingissä, koska molempien kaupunkien tuloveroprosentti on ${FI.p(ESP.kunta)}. Koko maan matalin prosentti on kuitenkin Espoon sisällä: Kauniainen perii ${FI.p(KAU.kunta)}, ja ${FI.eur(3500)} palkalla kauniaislainen saa vuodessa ${FI.eur(ERO_KAU[1])} enemmän käteen kuin espoolainen. Länteen päin verotus kiristyy nopeasti. Kirkkonummen prosentti on ${FI.p(KIRK.kunta)} ja Vihdin ${FI.p(VIH.kunta)}, joten ${FI.eur(5000)} kuussa ansaitseva maksaa Kirkkonummella noin ${FI.eur(ERO_KIRK5)} vuodessa enemmän veroa kuin Espoossa. Espoon evankelis-luterilaisten seurakuntien kirkollisvero on ${FI.p(ESP.evl)}. Asumistuessa Espoo ja Kauniainen kuuluvat kuntaryhmään I, mutta Kirkkonummi ja Vihti ryhmään II, joten kuntarajan ylittävä vuokralainen menettää osan hyväksyttävistä asumismenoista. Laskuri alla on asetettu Espooseen, ja taulukko näyttää, miten sama palkka muuttuu, jos kotiosoite on Kauniaisissa, Helsingissä, Kirkkonummella tai Vihdissä.`,
    faqs: [
      { q: 'Onko Espoon veroprosentti sama kuin Helsingin?', a: `Kunnallisvero on sama, ${FI.p(ESP.kunta)}, ja Manner-Suomessa vain ${ALEMPIA} kunta perii vähemmän. Myös evankelis-luterilainen kirkollisvero ${FI.p(ESP.evl)} on molemmissa sama. Siksi samalla palkalla verokortin prosentti ja nettopalkka ovat Espoossa ja Helsingissä identtiset: ${FI.eur(3500)} kuussa prosentti on ${FI.p(E35.veroprosentti, 1)}. Eroja syntyy vasta asumiskustannuksista, joita verotus ei katso.` },
      { q: 'Paljonko Kauniaisissa jää enemmän käteen kuin Espoossa?', a: `Kauniaisten ${FI.p(KAU.kunta)} on ${FI.num(ESP.kunta - KAU.kunta, 2)} prosenttiyksikköä Espoon prosenttia pienempi. Vuodessa se tekee ${FI.eur(KK[0])} kuukausipalkalla noin ${FI.eur(ERO_KAU[0])}, ${FI.eur(KK[1])} palkalla ${FI.eur(ERO_KAU[1])} ja ${FI.eur(KK[2])} palkalla ${FI.eur(ERO_KAU[2])}. Verokortin prosentti on ${FI.eur(3500)} palkalla Kauniaisissa ${FI.p(K35.veroprosentti, 1)}. Ratkaisevaa on kotikunta, ei työpaikan sijainti.` },
      { q: 'Kannattaako Espoosta muuttaa Kirkkonummelle verojen kannalta?', a: `Verojen puolesta ei: Kirkkonummen ${FI.p(KIRK.kunta)} on ${FI.num(KIRK.kunta - ESP.kunta, 2)} prosenttiyksikköä korkeampi, ja ${FI.eur(5000)} kuukausipalkalla ero on noin ${FI.eur(ERO_KIRK5)} vuodessa. Kirkkonummi kuuluu lisäksi asumistuen kuntaryhmään ${kuntaryhma('Kirkkonummi')}, jossa hyväksyttävien asumismenojen katto on matalampi. Muuton taloudellinen järkevyys ratkeaa siksi vuokran tai asuntolainan suuruudesta.` },
      { q: 'Kuinka paljon kirkkoon kuuluminen maksaa espoolaiselle?', a: `Espoon evankelis-luterilaisten seurakuntien prosentti ${FI.p(ESP.evl)} on maan matalimpia. ${FI.eur(3500)} kuukausipalkalla jäsenyys pienentää nettotuloa noin ${FI.eur(EVL35)} vuodessa. Ortodoksinen kirkollisvero on Espoossa ${FI.p(ESP.ort)}. Vero lasketaan samasta verotettavasta tulosta kuin kunnallisvero, joten työtulovähennys ja perusvähennys pienentävät myös kirkollisveron euromäärää.` },
    ],
    body: (h) => `
<h2>Kauniainen: matalin kunnallisvero keskellä Espoota</h2>
<p>Kauniainen on Espoon ympäröimä pieni kaupunki, ja sen ${h.pct(KAU.kunta / 100, 2)} on koko maan ${MANNER.length} mannerkunnan pienin tuloveroprosentti. Espoo ja Helsinki jakavat seuraavan sijan prosentilla ${h.pct(ESP.kunta / 100, 2)}. Kotikunnan raja kulkee usein saman kadun poikki, joten kahdella samaa palkkaa saavalla naapurilla voi olla eri veroprosentti.</p>
${h.table(['Kotikunta', 'Kunta-%', `Netto ${h.eur(KK[0])}`, `Netto ${h.eur(KK[1])}`, `Netto ${h.eur(KK[2])}`], NAAP.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...rivi(n).map((v) => h.eur(v))]), 'Kuukauden nettopalkka Espoossa ja naapureissa vuonna 2026, kirkkoon kuulumaton, ilman lomarahaa', ['l', 'r', 'r', 'r', 'r'])}
<h2>Länsinaapureissa verot nousevat</h2>
<p>Kirkkonummen ${h.pct(KIRK.kunta / 100, 2)} ja Vihdin ${h.pct(VIH.kunta / 100, 2)} ovat selvästi Espoota korkeammat. Taulukosta näkyy, että suurimmalla palkkatasolla kuukausiero Espoon ja Vihdin välillä on ${h.eur(rivi('Espoo')[2] - rivi('Vihti')[2])}. Seurakuntien prosentit kasvavat samaan suuntaan: Kirkkonummella ${h.pct(KIRK.evl / 100, 2)} ja Vihdissä ${h.pct(VIH.evl / 100, 2)} Espoon ${h.pct(ESP.evl / 100, 2)} sijaan. Kirkollisverosta ja eroamisen vaikutuksesta kertoo ${h.a('kirkollisvero', 'kirkollisverosivu')}.</p>
<h2>Kuntaryhmän raja asumistuessa</h2>
<p>Espoo kuuluu asumistuessa samaan kuntaryhmään I kuin Helsinki, Kauniainen ja Vantaa. Kirkkonummi ja Vihti ovat ryhmässä II. Kolmen hengen perheellä hyväksyttävien asumismenojen katto on ryhmässä I ${h.eur(AT.enimmaisasumismenot.I[2])} ja ryhmässä II ${h.eur(AT.enimmaisasumismenot.II[2])} kuukaudessa.</p>
<p>Esimerkkiperheessä on kaksi aikuista ja yksi lapsi, bruttotulot ${h.eur(PERHE.tulot)} kuussa ja vuokra ${h.eur(PERHE.vuokra)}. Espoossa asumistuki on ${h.eur(AT_ESP.tuki, 2)}, Kirkkonummella samoilla luvuilla ${h.eur(AT_KIRK.tuki, 2)}. Laskelma noudattaa ${h.src('kela_asumistuki_laskenta', 'Kelan kaavaa')}: ${h.pct(AT.tukiprosentti / 100, 0)} hyväksyttävistä menoista perusomavastuun jälkeen. Kuntien verot vierekkäin löytyvät ${h.a('kuntavertailu', 'kuntavertailusta')}.</p>`,
  },
  en: {
    slug: 'net-salary-espoo',
    nav: 'Espoo',
    card: 'Espoo vs Kauniainen tax, the western neighbours and the housing allowance group boundary.',
    title: 'Net Salary Espoo 2026: Income Tax, Kauniainen and Neighbours',
    description: 'Net salary in Espoo for 2026: the same 5.30% municipal tax as Helsinki, while Kauniainen inside Espoo charges 4.70%. Compare with Kirkkonummi and Vihti.',
    h1: 'Net salary in Espoo',
    intro: 'Enter your gross pay: the calculator applies Espoo’s municipal tax and parish rates.',
    resume: `A ${EN.eur(3500)} monthly salary leaves an Espoo resident about ${EN.eur(E35.kkNettoTodellinen)} a month after tax in 2026, without church tax or holiday bonus, which is exactly what the same salary yields in Helsinki: both cities set their municipal income tax at ${EN.p(ESP.kunta)}. The cheapest rate in Finland, though, sits inside Espoo’s borders. Kauniainen charges ${EN.p(KAU.kunta)}, which at ${EN.eur(3500)} a month puts ${EN.eur(ERO_KAU[1])} more a year in your pocket than an Espoo address. Head west and the rate climbs: Kirkkonummi charges ${EN.p(KIRK.kunta)} and Vihti ${EN.p(VIH.kunta)}, so someone earning ${EN.eur(5000)} a month pays about ${EN.eur(ERO_KIRK5)} more tax a year in Kirkkonummi than in Espoo. Lutheran church tax in Espoo is ${EN.p(ESP.evl)}. For Kela’s housing allowance, Espoo and Kauniainen belong to municipality group I, Kirkkonummi and Vihti to group II, so crossing that line lowers the rent Kela will count. If you have a job offer in Espoo and are still choosing where to rent, the table below shows the trade-off.`,
    faqs: [
      { q: 'Is income tax in Espoo the same as in Helsinki?', a: `Yes for the municipal part: both charge ${EN.p(ESP.kunta)}, and only ${ALEMPIA} mainland municipality charges less. Lutheran church tax is ${EN.p(ESP.evl)} in both. With the same salary you therefore get the same tax card rate and the same net pay, ${EN.p(E35.veroprosentti, 1)} at ${EN.eur(3500)} a month. Differences between the two cities come from rent, not from Vero.` },
      { q: 'How much more do I take home living in Kauniainen instead of Espoo?', a: `Kauniainen’s ${EN.p(KAU.kunta)} is ${EN.num(ESP.kunta - KAU.kunta, 2)} points below Espoo. Over a year that is worth roughly ${EN.eur(ERO_KAU[0])} at ${EN.eur(KK[0])} a month, ${EN.eur(ERO_KAU[1])} at ${EN.eur(KK[1])} and ${EN.eur(ERO_KAU[2])} at ${EN.eur(KK[2])}. What counts is your registered home municipality, not where your office is, and the tax card follows your home address.` },
      { q: 'Is Kirkkonummi cheaper than Espoo for taxes?', a: `No. Kirkkonummi charges ${EN.p(KIRK.kunta)}, ${EN.num(KIRK.kunta - ESP.kunta, 2)} points more than Espoo, which at ${EN.eur(5000)} a month costs about ${EN.eur(ERO_KIRK5)} a year. It is also in housing allowance group ${kuntaryhma('Kirkkonummi')}, where Kela accepts lower housing costs. A move west only pays off if the rent or mortgage saving is larger than the tax you lose.` },
      { q: 'What does church tax cost in Espoo?', a: `Espoo’s Lutheran parishes charge ${EN.p(ESP.evl)}, among the lowest rates in Finland; the Orthodox rate is ${EN.p(ESP.ort)}. At ${EN.eur(3500)} a month, Lutheran membership reduces your yearly take-home pay by about ${EN.eur(EVL35)}. Church tax is charged on the same taxable income as municipal tax, so the basic deduction and earned income credit shrink it too.` },
    ],
    body: (h) => `
<h2>Kauniainen, the low-tax island inside Espoo</h2>
<p>Kauniainen is a small town completely surrounded by Espoo, and its ${h.pct(KAU.kunta / 100, 2)} is the lowest municipal tax among the ${MANNER.length} mainland municipalities. Espoo and Helsinki share the next place at ${h.pct(ESP.kunta / 100, 2)}. The municipal border can run down the middle of a street, so two neighbours on the same salary may hold tax cards with different percentages.</p>
${h.table(['Home municipality', 'Tax rate', `Net on ${h.eur(KK[0])}`, `Net on ${h.eur(KK[1])}`, `Net on ${h.eur(KK[2])}`], NAAP.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...rivi(n).map((v) => h.eur(v))]), 'Monthly net pay in Espoo and nearby municipalities, 2026, not a church member, holiday bonus excluded', ['l', 'r', 'r', 'r', 'r'])}
<h2>Going west costs more</h2>
<p>Kirkkonummi (${h.pct(KIRK.kunta / 100, 2)}) and Vihti (${h.pct(VIH.kunta / 100, 2)}) are well above Espoo. At the top salary in the table, the monthly gap between Espoo and Vihti is ${h.eur(rivi('Espoo')[2] - rivi('Vihti')[2])}. Parish rates rise the same way, ${h.pct(KIRK.evl / 100, 2)} in Kirkkonummi and ${h.pct(VIH.evl / 100, 2)} in Vihti against ${h.pct(ESP.evl / 100, 2)} in Espoo. The ${h.a('kirkollisvero', 'church tax page')} explains how leaving the church changes your tax card.</p>
<h2>Housing allowance: where group I ends</h2>
<p>Espoo sits in housing allowance group I together with Helsinki, Kauniainen and Vantaa; Kirkkonummi and Vihti are in group II. For a household of three, Kela accepts housing costs up to ${h.eur(AT.enimmaisasumismenot.I[2])} a month in group I and ${h.eur(AT.enimmaisasumismenot.II[2])} in group II.</p>
<p>Picture two adults and a child with ${h.eur(PERHE.tulot)} of gross monthly income and ${h.eur(PERHE.vuokra)} rent. In Espoo the allowance comes to ${h.eur(AT_ESP.tuki, 2)}; in Kirkkonummi, with the same numbers, ${h.eur(AT_KIRK.tuki, 2)}. The figures follow ${h.src('kela_asumistuki_laskenta', 'Kela’s formula')}, ${h.pct(AT.tukiprosentti / 100, 0)} of accepted costs after the income-based deductible. All rates side by side: ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>`,
  },
});
