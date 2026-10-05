import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const VAN = kunta('Vantaa');
const HKI = kunta('Helsinki');
const KER = kunta('Kerava');
const SIJA = 1 + MANNER.filter((k) => k.kunta < VAN.kunta).length;
const PISTEET = VAN.kunta - HKI.kunta;

const KK = [2500, 3500, 5000];
const vuosiero = (x: number) => (netto(x, 'Helsinki').kkNettoTodellinen - netto(x, 'Vantaa').kkNettoTodellinen) * 12;
const ERO = KK.map(vuosiero);
const V35 = netto(3500, 'Vantaa');
const V42 = laskeVerot({ tulo: 42000, kunta: 'Vantaa' });
const LISA42 = lisaprosentti(V42);
const NAAP = ['Vantaa', 'Helsinki', 'Sipoo', 'Kerava', 'Tuusula'];
const rivi = (n: string) => KK.map((x) => netto(x, n).kkNettoTodellinen);

const AT = P.asumistuki;
const YKSIN = { aikuiset: 1, lapset: 0, tulot: 1500, vuokra: 700 };
const AT_VAN = asumistuki({ kunta: 'Vantaa', ...YKSIN });
const AT_KER = asumistuki({ kunta: 'Kerava', ...YKSIN });
const TR_VAN = tuloraja('Vantaa', 1, 0);
const TR_KER = tuloraja('Kerava', 1, 0);

export default definePage({
  id: 'vantaa',
  group: 'kunnat',
  order: 30,
  tool: 'netto',
  toolPreset: { kunta: 'Vantaa' },
  related: ['helsinki', 'espoo', 'kuntavertailu', 'asumistuki-laskuri'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-vantaa',
    nav: 'Vantaa',
    card: 'Vantaan 6,40 %:n kunnallisvero euroina verrattuna Helsinkiin ja pohjoisiin naapureihin.',
    title: 'Nettopalkka Vantaa 2026: veroero Helsinkiin ja naapureihin',
    description: 'Nettopalkka Vantaalla 2026: kunnallisvero 6,40 % eli 1,10 prosenttiyksikköä Helsinkiä enemmän. Katso ero euroina ja vertaa Keravaan, Tuusulaan ja Sipooseen.',
    h1: 'Nettopalkka Vantaalla',
    intro: 'Laskuri käyttää Vantaan veroprosenttia: anna bruttopalkka ja katso nettotulo ja verokortin prosentti.',
    resume: `Vantaalla ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(V35.kkNettoTodellinen)} kuukaudessa, kun kirkollisveroa ja lomarahaa ei lasketa, ja verokortin prosentti on ${FI.p(V35.veroprosentti, 1)}. Vantaan kunnallisvero ${FI.p(VAN.kunta)} on ${FI.num(PISTEET, 2)} prosenttiyksikköä korkeampi kuin rajanaapuri Helsingin ${FI.p(HKI.kunta)}. Euroina ero on vuodessa noin ${FI.eur(ERO[0])} ${FI.eur(KK[0])} kuukausipalkalla, ${FI.eur(ERO[1])} ${FI.eur(KK[1])} palkalla ja ${FI.eur(ERO[2])} ${FI.eur(KK[2])} palkalla. Valtakunnallisesti Vantaa on silti verotuksen kärkipäässä: ${MANNER.length} mannerkunnasta vain ${SIJA - 1} perii vähemmän. Pohjoisessa Kerava ja Tuusula perivät ${FI.p(KER.kunta)}. Asumistuessa Vantaa on samassa kuntaryhmässä I kuin Helsinki, joten hyväksyttävien asumismenojen katto on sama, yksin asuvalle ${FI.eur(AT.enimmaisasumismenot.I[0])} kuukaudessa. Keravalla, Tuusulassa ja Sipoossa katto on ryhmän II mukainen ${FI.eur(AT.enimmaisasumismenot.II[0])}. Vantaalaisen kannattaa siis verrata Helsinkiin vuokraa ja veroa yhdessä, ei pelkkää veroprosenttia.`,
    faqs: [
      { q: 'Paljonko enemmän veroa Vantaalla maksaa kuin Helsingissä?', a: `Vantaan prosentti on ${FI.p(VAN.kunta)} ja Helsingin ${FI.p(HKI.kunta)}, ero ${FI.num(PISTEET, 2)} prosenttiyksikköä. Koska kunnallisvero lasketaan vähennysten jälkeisestä tulosta, ero ei ole ${FI.num(PISTEET, 2)} % bruttopalkasta: ${FI.eur(3500)} kuukausipalkalla se on noin ${FI.eur(ERO[1])} vuodessa eli ${FI.eur(ERO[1] / 12)} kuukaudessa. Muut verot ja maksut ovat molemmissa kaupungeissa samat.` },
      { q: 'Mikä on vantaalaisen verokortin lisäprosentti?', a: `Lisäprosentti riippuu tulosta. ${FI.eur(42000)} vuositulolla vantaalaisen perusprosentti on ${FI.p(V42.veroprosentti, 1)} ja lisäprosentti ${FI.p(LISA42, 1)}, jos ei kuulu kirkkoon. Lisäprosentti koostuu Verohallinnon asteikon prosentista, Vantaan ${FI.p(VAN.kunta)} kunnallisverosta ja sairausvakuutusmaksuista, ja työnantaja pidättää sen vain siitä palkan osasta, joka ylittää verokorttiin merkityn tulorajan.` },
      { q: 'Onko Vantaan asumistuki pienempi kuin Helsingin?', a: `Ei ole. Vantaa ja Helsinki kuuluvat molemmat kuntaryhmään I, joten samoilla tuloilla ja samalla vuokralla tuki on sama. Yksin asuvalla tuki päättyy kummassakin noin ${FI.eur(TR_VAN)} bruttokuukausituloihin. Keravalla raja on noin ${FI.eur(TR_KER)}, koska Kerava on ryhmässä II ja sen enimmäisasumismenot ovat pienemmät.` },
    ],
    body: (h) => `
<h2>Vantaa vai Helsinki: ero euroina</h2>
<p>Kunnallisveron ${h.num(PISTEET, 2)} prosenttiyksikön ero kuulostaa pieneltä, mutta se kasvaa palkan mukana, koska perusvähennys ja työtulovähennys pienenevät tulojen noustessa. Alla on vuositasolla laskettu summa, jonka vantaalainen maksaa veroa enemmän kuin helsinkiläinen samasta palkasta, sekä verokortin prosentti kummassakin kaupungissa.</p>
${h.table(['Kuukausipalkka', 'Verokortti Vantaa', 'Verokortti Helsinki', 'Lisävero Vantaalla / v'], KK.map((x, i) => [h.eur(x), h.pct(netto(x, 'Vantaa').veroprosentti / 100, 1), h.pct(netto(x, 'Helsinki').veroprosentti / 100, 1), h.eur(ERO[i])]), 'Vantaan ja Helsingin verot samasta palkasta 2026, ei kirkon jäsen', ['l', 'r', 'r', 'r'])}
<p>Verokortin prosentit eroavat tasan puolen prosenttiyksikön portain, koska Verohallinto pyöristää ylöspäin. Lopullinen vero lasketaan kuitenkin sentilleen verotuksessa, joten liian suuri pidätys palautuu. Helsinkiin tai Helsingistä muuttavan kannattaa tarkistaa verokortti, sillä pidätys perustuu kotikunnan prosenttiin.</p>
<h2>Pohjoiset ja itäiset naapurit</h2>
${h.table(['Kunta', 'Kunnallisvero', `${h.eur(KK[0])}`, `${h.eur(KK[1])}`, `${h.eur(KK[2])}`], NAAP.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...rivi(n).map((v) => h.eur(v))]), 'Nettopalkka kuukaudessa Vantaalla ja naapureissa 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Keravan ja Tuusulan ${h.pct(KER.kunta / 100, 2)} tekee niistä Vantaata kalliimpia asuinpaikkoja verotuksen kannalta; Sipoon ${h.pct(kunta('Sipoo').kunta / 100, 2)} on lähempänä. Kaikki ${MANNER.length} prosenttia järjestyksessä: ${h.a('kuntavertailu', 'kuntavertailu')}.</p>
<h2>Asumistuki Vantaalla ja Keravalla</h2>
<p>Vantaa on asumistuen kuntaryhmässä I, Kerava ryhmässä II. Esimerkkinä yksin asuva, jonka bruttotulot ovat ${h.eur(YKSIN.tulot)} kuukaudessa ja vuokra ${h.eur(YKSIN.vuokra)}. Vantaalla tuki on ${h.eur(AT_VAN.tuki, 2)} ja Keravalla ${h.eur(AT_KER.tuki, 2)}. Kelan ${h.src('kela_asumistuki_laskenta', 'laskentaohje')} kertoo, mitkä tulot ja menot otetaan huomioon. Omia lukuja voi kokeilla ${h.a('asumistuki-laskuri', 'asumistukilaskurilla')}.</p>`,
  },
  en: {
    slug: 'net-salary-vantaa',
    nav: 'Vantaa',
    card: 'What Vantaa’s 6.40% municipal tax costs in euros compared with Helsinki and the northern suburbs.',
    title: 'Net Salary Vantaa 2026: 6.40% Tax and the Gap With Helsinki',
    description: 'Net salary in Vantaa for 2026: municipal tax is 6.40%, 1.10 points above Helsinki. See the yearly cost in euros and compare with Kerava, Tuusula and Sipoo.',
    h1: 'Net salary in Vantaa',
    intro: 'This calculator uses Vantaa’s tax rate: enter your gross salary to see net pay and your tax card percentage.',
    resume: `Living in Vantaa, a ${EN.eur(3500)} monthly salary nets about ${EN.eur(V35.kkNettoTodellinen)} a month in 2026, without church tax or holiday bonus, with a withholding rate of ${EN.p(V35.veroprosentti, 1)} on the tax card (verokortti). Vantaa’s municipal tax of ${EN.p(VAN.kunta)} is ${EN.num(PISTEET, 2)} percentage points above Helsinki’s ${EN.p(HKI.kunta)}, and anyone choosing between an apartment on either side of the city border will want to know what that gap really costs. In euros it comes to about ${EN.eur(ERO[0])} a year at ${EN.eur(KK[0])} a month, ${EN.eur(ERO[1])} at ${EN.eur(KK[1])} and ${EN.eur(ERO[2])} at ${EN.eur(KK[2])}. Nationally Vantaa is still a low-tax city: only ${SIJA - 1} of the ${MANNER.length} mainland municipalities charge less. To the north, Kerava and Tuusula charge ${EN.p(KER.kunta)}. For Kela’s housing allowance (asumistuki), Vantaa is in the same group I as Helsinki, so the cap on accepted housing costs is identical, ${EN.eur(AT.enimmaisasumismenot.I[0])} a month for a single person. Kerava, Tuusula and Sipoo fall into group II with a ${EN.eur(AT.enimmaisasumismenot.II[0])} cap. Compare rent and tax together before signing a lease.`,
    faqs: [
      { q: 'How much more tax do I pay in Vantaa than in Helsinki?', a: `Vantaa charges ${EN.p(VAN.kunta)} and Helsinki ${EN.p(HKI.kunta)}. The rate applies after deductions, so the difference is not ${EN.num(PISTEET, 2)}% of gross pay: at ${EN.eur(3500)} a month it is about ${EN.eur(ERO[1])} a year, or ${EN.eur(ERO[1] / 12)} a month. State tax, the Yle tax and social contributions are identical in both cities.` },
      { q: 'What additional tax rate will a Vantaa tax card show?', a: `It depends on income. On ${EN.eur(42000)} a year with no church membership, a Vantaa resident gets a base rate of ${EN.p(V42.veroprosentti, 1)} and an additional rate (lisäprosentti) of ${EN.p(LISA42, 1)}. The additional rate combines Vero’s scale, Vantaa’s ${EN.p(VAN.kunta)} and the health insurance contributions, and only applies to pay above your income limit (tuloraja).` },
      { q: 'Is housing allowance lower in Vantaa than in Helsinki?', a: `No. Vantaa and Helsinki are both in Kela’s municipality group I, so the same income and rent give the same allowance. A single person stops qualifying at around ${EN.eur(TR_VAN)} of gross monthly income in either city. In neighbouring Kerava, a group II town, the limit is about ${EN.eur(TR_KER)} because the housing cost cap is lower.` },
    ],
    body: (h) => `
<h2>Vantaa against Helsinki, in euros</h2>
<p>A ${h.num(PISTEET, 2)}-point gap in municipal tax sounds trivial, yet it widens as salary rises because the basic deduction and the earned income credit fade out. The table shows how much more tax a Vantaa resident pays per year than a Helsinki resident on the same salary, and the tax card rate in each city.</p>
${h.table(['Monthly salary', 'Tax card, Vantaa', 'Tax card, Helsinki', 'Extra tax in Vantaa / year'], KK.map((x, i) => [h.eur(x), h.pct(netto(x, 'Vantaa').veroprosentti / 100, 1), h.pct(netto(x, 'Helsinki').veroprosentti / 100, 1), h.eur(ERO[i])]), 'Same salary taxed in Vantaa and Helsinki, 2026, no church membership', ['l', 'r', 'r', 'r'])}
<p>Withholding rates move in half-point steps because Vero rounds them up. Your final tax is calculated to the cent in the annual assessment, so anything withheld in excess comes back as a refund.</p>
<h2>Northern and eastern neighbours</h2>
${h.table(['Municipality', 'Rate', `${h.eur(KK[0])}`, `${h.eur(KK[1])}`, `${h.eur(KK[2])}`], NAAP.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...rivi(n).map((v) => h.eur(v))]), 'Monthly net pay in Vantaa and surrounding municipalities, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>At ${h.pct(KER.kunta / 100, 2)}, Kerava and Tuusula tax more than Vantaa; Sipoo, at ${h.pct(kunta('Sipoo').kunta / 100, 2)}, is closer. The full ranking of all ${MANNER.length} rates is in the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>Housing allowance in Vantaa and Kerava</h2>
<p>Vantaa is in group I, Kerava in group II. Take a single tenant with ${h.eur(YKSIN.tulot)} of gross monthly income paying ${h.eur(YKSIN.vuokra)} rent: Kela would pay ${h.eur(AT_VAN.tuki, 2)} in Vantaa and ${h.eur(AT_KER.tuki, 2)} in Kerava. ${h.src('kela_asumistuki_laskenta', 'Kela’s guidance')} lists which income and costs count; test your own numbers in the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}.</p>`,
  },
});
