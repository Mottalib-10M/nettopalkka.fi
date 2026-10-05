import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { asumistuki, kuntaryhma, tuloraja } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const TKU = kunta('Turku');
const NAA = kunta('Naantali');
const KAA = kunta('Kaarina');
const ALEMPIA = MANNER.filter((k) => k.kunta < TKU.kunta).length;

const KK = [2500, 3500, 5000];
const SEUTU = ['Turku', 'Naantali', 'Lieto', 'Kaarina', 'Raisio'];
const T35 = netto(3500, 'Turku');
const NAA_ETU = KK.map((x) => (netto(x, 'Naantali').kkNettoTodellinen - netto(x, 'Turku').kkNettoTodellinen) * 12);
const KAA_HAITTA = (netto(3500, 'Turku').kkNettoTodellinen - netto(3500, 'Kaarina').kkNettoTodellinen) * 12;

const AT = P.asumistuki;
const [JAAKKO, EINO] = AT.esimerkit;
const J = asumistuki({ kunta: JAAKKO.kunta, aikuiset: JAAKKO.aikuiset, lapset: JAAKKO.lapset, tulot: JAAKKO.tulot, vuokra: JAAKKO.menot });
const E = asumistuki({ kunta: EINO.kunta, aikuiset: EINO.aikuiset, lapset: EINO.lapset, tulot: EINO.tulot, vuokra: EINO.menot });
const J_KAA = asumistuki({ kunta: 'Kaarina', aikuiset: JAAKKO.aikuiset, lapset: JAAKKO.lapset, tulot: JAAKKO.tulot, vuokra: JAAKKO.menot });
const TR2 = tuloraja('Turku', 2, 0);

export default definePage({
  id: 'turku',
  group: 'kunnat',
  order: 50,
  tool: 'netto',
  toolPreset: { kunta: 'Turku' },
  related: ['tampere', 'helsinki', 'kuntavertailu', 'asumistuki-laskuri'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-turku',
    nav: 'Turku',
    card: 'Turun 7,10 %:n kunnallisvero, edullisempi Naantali ja Kelan Turku-esimerkit asumistuesta.',
    title: 'Nettopalkka Turku 2026: kunnallisvero 7,10 % ja naapurit',
    description: 'Nettopalkka Turussa 2026: kunnallisvero 7,10 %, Naantali 6,40 %, Kaarina ja Raisio 7,60 %. Laske käteen jäävä palkka ja katso Kelan asumistukiesimerkki Turusta.',
    h1: 'Nettopalkka Turussa',
    intro: 'Laskuri on asetettu Turkuun: anna kuukausipalkka, niin saat nettotulon ja verokortin prosentin.',
    resume: `Turussa ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(T35.kkNettoTodellinen)} kuukaudessa, kun kirkollisveroa ja lomarahaa ei oteta mukaan, ja ennakonpidätysprosentti on ${FI.p(T35.veroprosentti, 1)}. Turun kunnallisvero on ${FI.p(TKU.kunta)}, ja ${MANNER.length} mannerkunnasta vain ${ALEMPIA} verottaa kevyemmin. Yksi niistä on naapuri Naantali, jonka ${FI.p(NAA.kunta)} tuo ${FI.eur(3500)} palkalla noin ${FI.eur(NAA_ETU[1])} enemmän käteen vuodessa. Kaarina ja Raisio perivät ${FI.p(KAA.kunta)}, ja Lieto on samalla tasolla kuin Turku. Turun evankelis-luterilaisten seurakuntien kirkollisvero on ${FI.p(TKU.evl)} ja ortodoksisen ${FI.p(TKU.ort)}. Asumistuessa Turku ja Raisio kuuluvat kuntaryhmään II, Naantali, Kaarina ja Lieto ryhmään III. Kela käyttää Turkua omissa esimerkeissään: yksin asuva Jaakko, jonka tulot ovat ${FI.eur(JAAKKO.tulot)} ja vuokra ${FI.eur(JAAKKO.menot)} kuukaudessa, saa tukea ${FI.eur(JAAKKO.tuki, 2)}, ja tämän sivun laskentamoottori päätyy täsmälleen samaan summaan.`,
    faqs: [
      { q: 'Paljonko Turun kunnallisvero on vuonna 2026?', a: `Turun kunnan tuloveroprosentti on ${FI.p(TKU.kunta)} vuonna 2026. Se lasketaan kunnallisverotuksen verotettavasta tulosta, ei bruttopalkasta. ${FI.eur(3500)} kuukausipalkalla turkulaisen verokortin prosentti on ${FI.p(T35.veroprosentti, 1)}, ja siihen sisältyvät myös valtion tulovero, sairaanhoito- ja päivärahamaksu sekä Yle-vero. Työeläke- ja työttömyysvakuutusmaksu pidätetään erikseen.` },
      { q: 'Onko Naantalissa pienemmät verot kuin Turussa?', a: `On. Naantalin tuloveroprosentti on ${FI.p(NAA.kunta)}, Turun ${FI.p(TKU.kunta)}. Vuodessa ero on noin ${FI.eur(NAA_ETU[0])} ${FI.eur(KK[0])} kuukausipalkalla ja ${FI.eur(NAA_ETU[2])} ${FI.eur(KK[2])} palkalla. Naantalin evankelis-luterilainen kirkollisvero ${FI.p(NAA.evl)} on kuitenkin Turun ${FI.p(TKU.evl)} korkeampi, mikä kaventaa eroa kirkon jäsenillä.` },
      { q: 'Miten Kelan Jaakko-esimerkin asumistuki Turussa lasketaan?', a: `Jaakon tulot ovat ${FI.eur(JAAKKO.tulot)} ja vuokra ${FI.eur(JAAKKO.menot)} kuukaudessa. Turku on ryhmässä II, joten menoista hyväksytään ${FI.eur(AT.enimmaisasumismenot.II[0])}. Perusomavastuu on ${FI.eur(J.perusomavastuu, 2)}, ja tuki on ${FI.pct(AT.tukiprosentti / 100)} erotuksesta eli ${FI.eur(J.tuki, 2)} kuukaudessa. Kaarinassa samoilla luvuilla tukea tulisi ${FI.eur(J_KAA.tuki, 2)}, koska Kaarina on ryhmässä III.` },
      { q: 'Paljonko kahden aikuisen talous voi Turussa ansaita ja saada asumistukea?', a: `Kahden aikuisen ruokakunnan tuki loppuu Turussa noin ${FI.eur(TR2)} yhteisiin bruttokuukausituloihin, kun asumismenot ovat vähintään ryhmän II enimmäismäärän ${FI.eur(AT.enimmaisasumismenot.II[1])} suuruiset. Kelan esimerkissä Eino ja Elisa ansaitsevat ${FI.eur(EINO.tulot)} ja maksavat ${FI.eur(EINO.menot)}, ja tuki on ${FI.eur(E.tuki, 2)} kuukaudessa.` },
    ],
    body: (h) => `
<h2>Turun seudun veroprosentit rinnakkain</h2>
<p>Turun seudulla kunnallisveron haarukka on kapea mutta merkityksellinen. Naantali on ainoa taulukon kunta, jossa käteen jää enemmän kuin Turussa; Kaarina ja Raisio jäävät jälkeen. Laskelmat on tehty samalla moottorilla kuin yllä oleva laskuri, kirkkoon kuulumattomalle ja ilman lomarahaa.</p>
${h.table(['Kunta', 'Veroprosentti', `Palkka ${h.eur(KK[0])}`, `Palkka ${h.eur(KK[1])}`, `Palkka ${h.eur(KK[2])}`], SEUTU.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Kuukausinetto Turussa ja lähikunnissa vuonna 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Kaarinaan muuttava ${h.eur(KK[1])} kuussa ansaitseva maksaa veroa noin ${h.eur(KAA_HAITTA)} vuodessa enemmän kuin Turussa. Vertailukohdaksi ${h.a('tampere', 'Tampereella')} prosentti on ${h.pct(kunta('Tampere').kunta / 100, 2)} ja ${h.a('helsinki', 'Helsingissä')} ${h.pct(kunta('Helsinki').kunta / 100, 2)}.</p>
<h2>Kelan esimerkit ovat turkulaisia</h2>
<p>Kela selittää ${h.src('kela_asumistuki_laskenta', 'asumistuen laskennan')} kahdella turkulaisella ruokakunnalla. Ne ovat hyvä tarkistus mille tahansa laskurille, ja tämä sivusto toistaa molemmat sentilleen:</p>
${h.table(['Ruokakunta', 'Tulot / kk', 'Asumismenot / kk', 'Hyväksytty enintään', 'Perusomavastuu', 'Asumistuki'], [[JAAKKO.nimi, h.eur(JAAKKO.tulot), h.eur(JAAKKO.menot), h.eur(J.enimmais), h.eur(J.perusomavastuu, 2), h.eur(J.tuki, 2)], [EINO.nimi, h.eur(EINO.tulot), h.eur(EINO.menot), h.eur(E.enimmais), h.eur(E.perusomavastuu, 2), h.eur(E.tuki, 2)]], 'Kelan esimerkkilaskelmat Turusta (kuntaryhmä II), 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Molemmissa tapauksissa vuokra ylittää kuntaryhmän ${kuntaryhma('Turku')} katon, joten ylimenevä osa jää kokonaan ruokakunnan maksettavaksi. Raisio on samassa ryhmässä, mutta Kaarinassa, Naantalissa ja Liedossa katto on ryhmän III mukainen ${h.eur(AT.enimmaisasumismenot.III[0])} yhdelle hengelle. Omat luvut voi syöttää ${h.a('asumistuki-laskuri', 'asumistukilaskuriin')}.</p>`,
  },
  en: {
    slug: 'net-salary-turku',
    nav: 'Turku',
    card: 'Turku’s 7.10% municipal tax, cheaper Naantali, and Kela’s own Turku housing allowance examples.',
    title: 'Net Salary Turku 2026: 7.10% Tax, Naantali and Kaarina',
    description: 'Net salary in Turku for 2026: municipal tax 7.10%, Naantali 6.40%, Kaarina and Raisio 7.60%. Check your take-home pay and Kela’s housing allowance example.',
    h1: 'Net salary in Turku',
    intro: 'The calculator is set to Turku: enter your monthly salary for net income and your tax card rate.',
    resume: `In Turku, a ${EN.eur(3500)} monthly salary leaves about ${EN.eur(T35.kkNettoTodellinen)} a month after tax in 2026, excluding church tax and holiday bonus, and the withholding rate on your tax card (verokortti) is ${EN.p(T35.veroprosentti, 1)}. The city’s municipal tax is ${EN.p(TKU.kunta)}; only ${ALEMPIA} of the ${MANNER.length} mainland municipalities tax less. Next-door Naantali is one of them: its ${EN.p(NAA.kunta)} adds roughly ${EN.eur(NAA_ETU[1])} a year to the take-home pay of someone on ${EN.eur(3500)} a month. Kaarina and Raisio charge ${EN.p(KAA.kunta)}, while Lieto matches Turku. Lutheran church tax in Turku is ${EN.p(TKU.evl)} and Orthodox ${EN.p(TKU.ort)}. For Kela’s housing allowance, Turku and Raisio are in municipality group II, and Naantali, Kaarina and Lieto in group III. Kela itself uses Turku to explain the allowance: Jaakko, who lives alone on ${EN.eur(JAAKKO.tulot)} a month and pays ${EN.eur(JAAKKO.menot)} rent, receives ${EN.eur(JAAKKO.tuki, 2)}. The engine behind this page reproduces that figure to the cent, which is a useful check before you trust any calculator with your own numbers.`,
    faqs: [
      { q: 'What is the municipal tax rate in Turku in 2026?', a: `Turku’s municipal income tax rate is ${EN.p(TKU.kunta)} for 2026. It is charged on taxable income, not on gross salary. At ${EN.eur(3500)} a month, a Turku tax card shows ${EN.p(T35.veroprosentti, 1)}, which also covers state income tax, the health care and daily allowance contributions and the Yle tax. Pension and unemployment insurance contributions are withheld separately.` },
      { q: 'Are taxes lower in Naantali than in Turku?', a: `Yes. Naantali charges ${EN.p(NAA.kunta)} against Turku’s ${EN.p(TKU.kunta)}, worth about ${EN.eur(NAA_ETU[0])} a year at ${EN.eur(KK[0])} a month and ${EN.eur(NAA_ETU[2])} at ${EN.eur(KK[2])}. Naantali’s Lutheran church tax of ${EN.p(NAA.evl)} is higher than Turku’s ${EN.p(TKU.evl)}, though, so church members gain a little less from the move.` },
      { q: 'How does Kela calculate housing allowance for Jaakko in Turku?', a: `Jaakko earns ${EN.eur(JAAKKO.tulot)} and pays ${EN.eur(JAAKKO.menot)} a month. Turku is in group II, so Kela accepts at most ${EN.eur(AT.enimmaisasumismenot.II[0])}. His deductible is ${EN.eur(J.perusomavastuu, 2)}, and the allowance is ${EN.pct(AT.tukiprosentti / 100)} of the difference: ${EN.eur(J.tuki, 2)} a month. In Kaarina, a group III town, the same figures would give ${EN.eur(J_KAA.tuki, 2)}.` },
      { q: 'Up to what income can a couple in Turku get housing allowance?', a: `For two adults in Turku, support ends at roughly ${EN.eur(TR2)} of combined gross monthly income, assuming housing costs at least equal the group II cap of ${EN.eur(AT.enimmaisasumismenot.II[1])}. In Kela’s worked example, Eino and Elisa earn ${EN.eur(EINO.tulot)}, pay ${EN.eur(EINO.menot)} and receive ${EN.eur(E.tuki, 2)} a month.` },
    ],
    body: (h) => `
<h2>Tax rates around Turku</h2>
<p>The spread of municipal tax around Turku is narrow but it still shows up on payslips. Naantali is the only town in the table where you keep more than in Turku itself; Kaarina and Raisio leave you with less. The figures come from the same engine as the calculator above, for someone outside the church and without holiday bonus.</p>
${h.table(['Municipality', 'Tax rate', `Salary ${h.eur(KK[0])}`, `Salary ${h.eur(KK[1])}`, `Salary ${h.eur(KK[2])}`], SEUTU.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Monthly net pay in Turku and nearby municipalities, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Move to Kaarina on ${h.eur(KK[1])} a month and you pay about ${h.eur(KAA_HAITTA)} more tax a year than in Turku. For comparison, ${h.a('tampere', 'Tampere')} charges ${h.pct(kunta('Tampere').kunta / 100, 2)} and ${h.a('helsinki', 'Helsinki')} ${h.pct(kunta('Helsinki').kunta / 100, 2)}.</p>
<h2>Kela’s worked examples come from Turku</h2>
<p>Kela explains ${h.src('kela_asumistuki_laskenta', 'how housing allowance is calculated')} with two Turku households. They make a good test for any calculator, and this site matches both to the cent:</p>
${h.table(['Household', 'Income / month', 'Housing costs / month', 'Accepted at most', 'Deductible', 'Allowance'], [[JAAKKO.nimi, h.eur(JAAKKO.tulot), h.eur(JAAKKO.menot), h.eur(J.enimmais), h.eur(J.perusomavastuu, 2), h.eur(J.tuki, 2)], [EINO.nimi.replace(' ja ', ' and '), h.eur(EINO.tulot), h.eur(EINO.menot), h.eur(E.enimmais), h.eur(E.perusomavastuu, 2), h.eur(E.tuki, 2)]], 'Kela’s sample calculations for Turku (group II), 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>In both cases the rent exceeds the group ${kuntaryhma('Turku')} cap, so the excess is paid entirely by the household. Raisio shares the group, but in Kaarina, Naantali and Lieto the single-person cap drops to the group III level of ${h.eur(AT.enimmaisasumismenot.III[0])}. Try your own figures in the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}.</p>`,
  },
});
