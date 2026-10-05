import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kuukausiNetto, lisaprosentti } from '../../lib/engine/vero';
import { tyoelakeArvio } from '../../lib/engine/elake';
import { HALVIN, KALLEIN, MANNER } from '../../lib/esimerkit';

const V = P.vero;
const PALKKA = 3500;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const KK = R.netto / 12;
const KIRKKO = kuukausiNetto(PALKKA, { kunta: 'Helsinki', kirkko: 'evl' });
const LISA = lisaprosentti(R);
const PORRAS = V.valtion_asteikko[2];
/** Sama palkka kahdeksassa kunnassa: halvin, kallein ja suurimmat kaupungit. */
const KUNNAT = [HALVIN.nimi, 'Helsinki', 'Espoo', 'Vantaa', 'Turku', 'Tampere', 'Oulu', KALLEIN.nimi]
  .map((nimi) => ({ nimi, r: kuukausiNetto(PALKKA, { kunta: nimi }) }))
  .map((x) => ({ ...x, kk: x.r.netto / 12, ero: x.r.netto - R.netto }));
const HALPA = KUNNAT[0], KALLIS = KUNNAT[KUNNAT.length - 1];
const EROVUOSI = HALPA.r.netto - KALLIS.r.netto;
/** Työeläkkeen karttuma: 1,5 % vuoden palkasta, kuukausieläkkeenä (ilman lomarahaa). */
const EL = tyoelakeArvio({ syntymavuosi: 1990, kkPalkka: PALKKA, kuukausiaVuodessa: 12 });
const KARTTUMA_KK = EL.karttumaVuodessa / 12;
const ESPOO = KUNNAT.find((x) => x.nimi === 'Espoo')!;
/** Sadan euron korotus Helsingissä ja kalleimmassa kunnassa. */
const KOR_H = (kuukausiNetto(PALKKA + 100, { kunta: 'Helsinki' }).netto - R.netto) / 12;
const KOR_K = (kuukausiNetto(PALKKA + 100, { kunta: KALLIS.nimi }).netto - KALLIS.r.netto) / 12;

export default definePage({
  id: 'nettopalkka-3500',
  group: 'palkka',
  order: 40,
  mini: 'nettoSumma',
  miniDefaults: { p: 3500 },
  related: ['nettopalkka-3000', 'nettopalkka-4000', 'kuntavertailu', 'elakelaskuri'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-3500',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Kotikunta muuttaa ${FI.eur(PALKKA)} palkan nettoa satoja euroja vuodessa: vertailu kahdeksaan kuntaan ja eläkekarttuma.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: kahdeksan kunnan vertailu`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: Helsingissä käteen ${FI.eur(KK)}, kunnasta riippuen jopa ${FI.eur(EROVUOSI)} vuodessa eroa. Lisäksi laskettu vuotuinen työeläkkeen karttuma.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Tällä palkalla kotikunnan veroprosentti erottaa naapurit toisistaan selvimmin, ja eläkettä kertyy joka vuosi.`,
    resume: `${FI.eur(PALKKA)} bruttopalkasta jää vuonna 2026 helsinkiläiselle käteen keskimäärin ${FI.eur(KK)} kuukaudessa, kun verokortin prosentti on ${FI.num(R.veroprosentti, 1)} % eikä palkansaaja kuulu kirkkoon. Kotikunta muuttaa summaa enemmän kuin moni arvaa. Edullisimmassa kunnassa (${HALPA.nimi}) kunnallisvero on ${FI.num(HALPA.r.kunta.kunta, 2)} % ja nettoa jää ${FI.eur(HALPA.kk)} kuussa, kun kalleimman kunnan (${KALLIS.nimi}) ${FI.num(KALLIS.r.kunta.kunta, 2)} prosentin vero jättää ${FI.eur(KALLIS.kk)}. Vuodessa eroa kertyy ${FI.eur(EROVUOSI)}, ja se kasvaa palkan mukana, koska kunnallisvero on tasavero ilman portaita. Valtionveroa kunta ei muuta: verotettava tulo, noin ${FI.eur(R.verotettava)}, on kaikkialla asteikon ${FI.num(PORRAS.prosentti, 2)} prosentin portaalla, joka alkaa ${FI.eur(PORRAS.alaraja)} kohdalta. Kirkon jäsenyys lisää Helsingissä prosenttia ${FI.num(KIRKKO.veroprosentti - R.veroprosentti, 1)} prosenttiyksikköä. Ero ei johdu valtionverosta eikä maksuista, jotka ovat kaikkialla samat. Jokainen vuosi tällä palkalla kerryttää työeläkettä noin ${FI.eur(KARTTUMA_KK, 2)} kuukaudessa ennen elinaikakerrointa.`,
    faqs: [
      { q: `Paljonko kotikunta vaikuttaa ${FI.eur(PALKKA)} nettopalkkaan?`, a: `Manner-Suomen ${FI.num(MANNER.length)} kunnan ääripäiden välillä ${FI.eur(EROVUOSI)} vuodessa eli noin ${FI.eur(EROVUOSI / 12)} kuukaudessa. Matalin kunnallisvero on ${FI.num(HALPA.r.kunta.kunta, 2)} % (${HALPA.nimi}) ja korkein ${FI.num(KALLIS.r.kunta.kunta, 2)} % (${KALLIS.nimi}). Verokortin prosenttiin vaikuttaa kotikunta, ei työpaikan sijainti, joten pendelöijä maksaa asuinkuntansa veroa. Suurissa kaupungeissa ero on pienempi mutta silti satoja euroja.` },
      { q: `Paljonko työeläkettä kertyy vuodessa ${FI.eur(PALKKA)} kuukausipalkalla?`, a: `Eläkettä karttuu ${FI.num(P.elake.karttumaprosentti, 1)} % vuoden ansioista. ${FI.eur(PALKKA * 12)} vuosipalkasta kertyy ${FI.eur(EL.karttumaVuodessa)} vuotuista eläkettä eli ${FI.eur(KARTTUMA_KK, 2)} kuukaudessa, ja lomaraha nostaa summaa hieman, koska sekin on eläkkeen perusteena olevaa palkkaa. Eläkkeen alkaessa kertynyt määrä kerrotaan elinaikakertoimella, joka oli vuonna 1964 syntyneille ${FI.num(P.elake.elinaikakerroin_viimeisin.arvo, 5)}.` },
      { q: `Mikä on lisäprosentti ${FI.eur(PALKKA)} palkalla Helsingissä?`, a: `Laskennallisesti ${FI.num(LISA, 1)} %, kun perusprosentti on ${FI.num(R.veroprosentti, 1)} %. Lisäprosenttia käytetään vain siihen osaan vuoden palkasta, joka ylittää verokortin tulorajan, esimerkiksi bonukseen tai ylitöihin. Se on korkeampi, koska ylimenevät eurot verotetaan ylimmällä rajaveroprosentilla, ja se on aina vähintään kaksi prosenttiyksikköä perusprosenttia suurempi.` },
      { q: `Miksi ${FI.eur(PALKKA)} palkasta jää Espoossa sama netto kuin Helsingissä?`, a: `Koska kunnallisveroprosentti on vuonna 2026 molemmissa sama, ${FI.num(ESPOO.r.kunta.kunta, 2)} %. Valtionvero, sairaanhoitomaksu, päivärahamaksu, Yle-vero ja palkasta pidätettävät maksut eivät riipu kunnasta, joten nettopalkka on molemmissa ${FI.eur(ESPOO.kk)} kuukaudessa. Eroa syntyy vain kirkollisverosta, jos kuuluu seurakuntaan, sillä seurakuntien prosentit vaihtelevat kunnasta toiseen.` },
    ],
    body: (h) => `
<h2>Sama palkka, kahdeksan eri nettoa</h2>
<p>Kolmen ja puolen tuhannen euron kuukausipalkalla kunnallisveron ero alkaa näkyä tilillä selvästi. Kunnallisvero on tasavero: kaikki verotettava tulo verotetaan samalla prosentilla, ja vuonna 2026 prosentit vaihtelevat Manner-Suomessa ${h.num(HALPA.r.kunta.kunta, 2)} prosentista ${h.num(KALLIS.r.kunta.kunta, 2)} prosenttiin. Kun verotettavaa tuloa on noin ${h.eur(R.verotettava)}, yksi prosenttiyksikkö kunnallisveroa maksaa vuodessa ${h.eur(R.verotettava / 100)}. Pienemmillä palkoilla työtulovähennyksen ylijäämä tasoittaa kuntien eroja, mutta tällä tasolla vähennys kuluu kokonaan valtionveroon, joten kunnan prosentti siirtyy sellaisenaan nettopalkkaan. Taulukon kahdeksan kuntaa kattavat koko vaihteluvälin halvimmasta kalleimpaan sekä suurimmat kaupungit. Taulukon ääripäiden ero on ${h.eur(EROVUOSI)} vuodessa, mikä vastaa lähes ${h.num(EROVUOSI / KALLIS.kk, 1)} kuukauden nettopalkkaa kalleimmassa kunnassa. Muuttoa harkitsevan kannattaa silti verrata kokonaisuutta, sillä vuokrataso ja työmatkat painavat yleensä enemmän. Kaikkien kuntien prosentit ovat sivulla ${h.a('kuntavertailu', 'kunnallisvero kunnittain')}.</p>
${h.table(['Kunta', 'Kunnallisvero', 'Veroprosentti', 'Netto / kk', 'Ero Helsinkiin / v'], KUNNAT.map((x) => [x.nimi, `${h.num(x.r.kunta.kunta, 2)} %`, `${h.num(x.r.veroprosentti, 1)} %`, h.eur(x.kk), `${x.ero > 0 ? '+' : ''}${h.eur(x.ero)}`]), `${h.eur(PALKKA)} kuukausipalkka, ei kirkon jäsen, 2026`, ['l', 'r', 'r', 'r', 'r'])}
<h2>Korotus kalliissa ja edullisessa kunnassa</h2>
<p>Kunnallisvero vaikuttaa myös siihen, mitä palkankorotuksesta jää. Sadan euron kuukausikorotuksesta jää Helsingissä käteen ${h.eur(KOR_H, 2)}, mutta kalleimmassa kunnassa vain ${h.eur(KOR_K, 2)}. Ero on pieni yksittäisessä kuukaudessa, mutta se toistuu jokaisessa tulevassa korotuksessa, koska kunnallisvero peritään jokaisesta lisäeurosta samalla prosentilla. Rajaveroprosentti koostuu tällä palkalla valtion ${h.num(PORRAS.prosentti, 2)} prosentin portaasta, kunnan prosentista, työtulovähennyksen ${h.num(V.tyotulovahennys.pienenemisprosentti)} prosentin leikkauksesta sekä palkasta pidätettävistä maksuista.</p>
<h2>Asteikon kolmas porras</h2>
<p>Valtionvero lasketaan kaikille samalla asteikolla. Tällä palkalla verotettavasta tulosta ${h.eur(R.verotettava - PORRAS.alaraja)} on ${h.eur(PORRAS.alaraja)} rajan yläpuolella, ja siitä osasta valtio perii ${h.num(PORRAS.prosentti, 2)} %. Työtulovähennys on jo alkanut pienentyä, ja sitä on jäljellä ${h.eur(R.tyotulovahennys)}. Valtionveroa jää maksettavaksi ${h.eur(R.valtionvero)} vuodessa, joka on lähes yhtä paljon kuin Helsingin kunnallisvero ${h.eur(R.kunnallisvero)}. Seuraava raja tulee vastaan ${h.eur(V.valtion_asteikko[3].alaraja)} verotettavan tulon kohdalla, jonka jälkeen valtion osuus nousee ${h.num(V.valtion_asteikko[3].prosentti, 2)} prosenttiin. Miltä se näyttää käytännössä, selviää sivulta ${h.a('nettopalkka-4000', `nettopalkka ${h.eur(4000)}`)}.</p>
<h2>Kirkollisvero ja eläkekarttuma</h2>
<p>Evankelis-luterilaisen kirkon jäsen maksaa Helsingissä kirkollisveroa ${h.num(KIRKKO.kunta.evl, 2)} % verotettavasta tulosta, eli ${h.eur(KIRKKO.kirkollisvero)} vuodessa, ja verokortin prosentti nousee ${h.num(KIRKKO.veroprosentti, 1)} prosenttiin. Palkasta pidätettävä työeläkemaksu ${h.num(V.tyoelakemaksu_prosentti, 2)} % taas kerryttää omaa eläkettä: ${h.num(P.elake.karttumaprosentti, 1)} % vuoden ansioista eli ${h.eur(KARTTUMA_KK, 2)} kuukausieläkettä jokaiselta työvuodelta tällä palkalla. Kymmenen vuotta samalla palkalla tuo noin ${h.eur(KARTTUMA_KK * 10)} kuukaudessa ennen elinaikakerrointa. Arvioi koko uran eläke ${h.a('elakelaskuri', 'eläkelaskurilla')}, ja tarkista kuntasi prosentti Verohallinnon ${h.src('vero_kunnat', 'veroprosenttiluettelosta')}.</p>`,
  },
  en: {
    slug: 'net-salary-3500',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `Your municipality moves the net of a ${EN.eur(PALKKA)} salary by hundreds of euros a year: eight places compared, plus pension accrual.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: eight cities compared`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: ${EN.eur(KK)} in Helsinki, up to ${EN.eur(EROVUOSI)} a year apart by municipality, and the work pension you build each year.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `At this income, where you register your home matters more than at any lower pay, and every year adds to your pension.`,
    resume: `In 2026 a gross salary of ${EN.eur(PALKKA)} a month gives a Helsinki resident outside the church about ${EN.eur(KK)} a month net, with a ${EN.num(R.veroprosentti, 1)}% rate on the tax card (verokortti). Your home municipality makes a real difference here. Municipal tax (kunnallisvero) is a flat rate on all taxable income, ranging from ${EN.num(HALPA.r.kunta.kunta, 2)}% in ${HALPA.nimi} to ${EN.num(KALLIS.r.kunta.kunta, 2)}% in ${KALLIS.nimi}. On this salary that turns into ${EN.eur(HALPA.kk)} a month net in the cheapest place against ${EN.eur(KALLIS.kk)} in the dearest, a gap of ${EN.eur(EROVUOSI)} a year. State tax is the same everywhere: taxable income of about ${EN.eur(R.verotettava)} has entered the ${EN.num(PORRAS.prosentti, 2)}% band, which starts at ${EN.eur(PORRAS.alaraja)}. Joining the Evangelical Lutheran church would add ${EN.num(KIRKKO.veroprosentti - R.veroprosentti, 1)} points to your card rate in Helsinki. Each year at this pay also builds earnings-related pension (työeläke) worth about ${EN.eur(KARTTUMA_KK, 2)} a month, before the life expectancy coefficient.`,
    faqs: [
      { q: `How much does my municipality change take-home pay on ${EN.eur(PALKKA)} a month?`, a: `Between the cheapest and dearest of the ${EN.num(MANNER.length)} mainland municipalities, ${EN.eur(EROVUOSI)} a year, or about ${EN.eur(EROVUOSI / 12)} a month. Municipal tax is ${EN.num(HALPA.r.kunta.kunta, 2)}% in ${HALPA.nimi} and ${EN.num(KALLIS.r.kunta.kunta, 2)}% in ${KALLIS.nimi}. Your card uses your home municipality's rate, not the rate where your office is, so a commuter pays where they live.` },
      { q: `How much pension do I earn per year on a ${EN.eur(PALKKA)} salary in Finland?`, a: `Pension accrues at ${EN.num(P.elake.karttumaprosentti, 1)}% of annual earnings. ${EN.eur(PALKKA * 12)} a year adds ${EN.eur(EL.karttumaVuodessa)} of annual pension, ${EN.eur(KARTTUMA_KK, 2)} a month, slightly more once holiday bonus is counted. At retirement the total is multiplied by the life expectancy coefficient; the latest confirmed one, for people born in 1964, is ${EN.num(P.elake.elinaikakerroin_viimeisin.arvo, 5)}.` },
      { q: `What additional withholding rate applies to a bonus at ${EN.eur(PALKKA)} a month?`, a: `In Helsinki the computed additional rate (lisäprosentti) is ${EN.num(LISA, 1)}%, against a base rate of ${EN.num(R.veroprosentti, 1)}%. It is used only on pay above the income limit on your tax card, such as a bonus or overtime. It is always at least two points above the base rate, because those extra euros are taxed at your highest marginal rates.` },
    ],
    body: (h) => `
<h2>Where you live, what you keep</h2>
<p>If you are choosing between apartments in different municipalities, the tax side is easy to quantify at this salary. Municipal tax has no bands: every euro of taxable income pays the same rate, and in 2026 mainland rates run from ${h.num(HALPA.r.kunta.kunta, 2)}% to ${h.num(KALLIS.r.kunta.kunta, 2)}%. With taxable income around ${h.eur(R.verotettava)}, one percentage point of municipal tax costs ${h.eur(R.verotettava / 100)} a year. At lower salaries the leftover work tax credit cushions these differences, but here the credit is fully absorbed by state tax, so the municipal rate passes straight into your net. The eight places below cover the full span plus the largest cities. ${HALPA.nimi} and ${KALLIS.nimi} are ${h.eur(EROVUOSI)} a year apart, close to ${h.num(EROVUOSI / KALLIS.kk, 1)} months of net pay in the dearest municipality. Rent and commuting usually outweigh this, so compare the whole budget before moving. Every rate is in the ${h.a('kuntavertailu', 'municipal tax table')}.</p>
${h.table(['Municipality', 'Municipal tax', 'Card rate', 'Net / month', 'vs Helsinki / year'], KUNNAT.map((x) => [x.nimi, `${h.num(x.r.kunta.kunta, 2)}%`, `${h.num(x.r.veroprosentti, 1)}%`, h.eur(x.kk), `${x.ero > 0 ? '+' : ''}${h.eur(x.ero)}`]), `${h.eur(PALKKA)} a month, no church membership, 2026`, ['l', 'r', 'r', 'r', 'r'])}
<h2>A raise in a cheap versus a dear municipality</h2>
<p>The municipal rate also decides how much of each pay rise you keep. Out of an extra ${h.eur(100)} a month, ${h.eur(KOR_H, 2)} reaches you in Helsinki and only ${h.eur(KOR_K, 2)} in ${KALLIS.nimi}. Your marginal rate here combines the ${h.num(PORRAS.prosentti, 2)}% state band, the local rate, the ${h.num(V.tyotulovahennys.pienenemisprosentti)}% taper of the work credit and the payroll contributions, so the local rate is the one piece you can change by moving.</p>
<h2>The ${h.num(PORRAS.prosentti, 2)}% state band</h2>
<p>State tax uses one national scale. At this pay ${h.eur(R.verotettava - PORRAS.alaraja)} of your taxable income is above ${h.eur(PORRAS.alaraja)}, and that slice is taxed at ${h.num(PORRAS.prosentti, 2)}%. Your work tax credit has begun tapering and stands at ${h.eur(R.tyotulovahennys)}. State tax still due is ${h.eur(R.valtionvero)} a year, almost as much as Helsinki's municipal tax of ${h.eur(R.kunnallisvero)}.</p>
<h2>Church tax and the pension you are building</h2>
<p>A member of the Evangelical Lutheran church in Helsinki pays ${h.num(KIRKKO.kunta.evl, 2)}% church tax, ${h.eur(KIRKKO.kirkollisvero)} a year, lifting the card rate to ${h.num(KIRKKO.veroprosentti, 1)}%. The ${h.num(V.tyoelakemaksu_prosentti, 2)}% pension contribution on your payslip is not lost money: each working year here adds ${h.eur(KARTTUMA_KK, 2)} to your future monthly pension, and ten years add about ${h.eur(KARTTUMA_KK * 10)} before the coefficient. Estimate a full career in the ${h.a('elakelaskuri', 'pension calculator')} and confirm your municipality's rate in Vero's ${h.src('vero_kunnat', 'list of tax rates')}.</p>`,
  },
});
