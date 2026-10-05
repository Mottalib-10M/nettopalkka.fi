import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta, KUNNAT, type Kunta } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { netto, MANNER, MEDIAANI } from '../../lib/esimerkit';

const HKI = kunta('Helsinki');
const KAU = kunta('Kauniainen');
const SIJA = 1 + MANNER.filter((k) => k.kunta < HKI.kunta).length;
const MIN_EVL = Math.min(...KUNNAT.map((k) => k.evl));
const EVL_SAMA = KUNNAT.filter((k) => k.evl === MIN_EVL).length;
const EVL_MED = (() => { const s = MANNER.map((k) => k.evl).sort((a, b) => a - b); return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2; })();
const MEDIAANIKUNTA: Kunta = { nimi: 'Mediaani', kunta: MEDIAANI, evl: 0, ort: 0, ahvenanmaa: false };

const N35 = netto(3500, 'Helsinki');
const V42 = laskeVerot({ tulo: 42000, kunta: 'Helsinki' });
const M42 = laskeVerot({ tulo: 42000, kunta: MEDIAANIKUNTA });
const ERO_MED = M42.verot - V42.verot;
const KIRKKO42 = laskeVerot({ tulo: 42000, kunta: 'Helsinki', kirkko: 'evl' }).verot - V42.verot;

const AT = P.asumistuki;
const ENI = AT.enimmaisasumismenot.I;
const ENI_II = AT.enimmaisasumismenot.II;
const TR1 = tuloraja('Helsinki', 1, 0);
const TR2 = tuloraja('Helsinki', 2, 0);
const VUOKRA = 800, TULOT = 1300;
const AT_HKI = asumistuki({ kunta: 'Helsinki', aikuiset: 1, lapset: 0, tulot: TULOT, vuokra: VUOKRA });
const AT_TRE = asumistuki({ kunta: 'Tampere', aikuiset: 1, lapset: 0, tulot: TULOT, vuokra: VUOKRA });

const KK = [2500, 3500, 5000];
const NAAP = ['Helsinki', 'Kauniainen', 'Espoo', 'Vantaa', 'Sipoo'];
const rivi = (n: string) => KK.map((x) => netto(x, n).kkNettoTodellinen);

export default definePage({
  id: 'helsinki',
  group: 'kunnat',
  order: 10,
  tool: 'netto',
  toolPreset: { kunta: 'Helsinki' },
  related: ['espoo', 'vantaa', 'asumistuki-laskuri', 'kuntavertailu'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-helsinki',
    nav: 'Helsinki',
    card: 'Helsingin kunnallisvero, kirkollisvero ja asumistuen kuntaryhmä I nettopalkan kannalta.',
    title: 'Nettopalkka Helsinki 2026: kunnallisvero 5,30 % ja käteen',
    description: 'Nettopalkka Helsingissä 2026: kunnallisvero 5,30 %, maan matalin kirkollisvero ja asumistuen kuntaryhmä I. Laske käteen jäävä palkka helsinkiläisenä nyt.',
    h1: 'Nettopalkka Helsingissä',
    intro: 'Laskuri on asetettu valmiiksi Helsinkiin: kirjoita bruttopalkka ja näet, paljonko siitä jää helsinkiläiselle käteen.',
    resume: `Helsingissä ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen keskimäärin ${FI.eur(N35.kkNettoTodellinen)} kuukaudessa, kun palkansaaja ei kuulu kirkkoon eikä lomarahaa lasketa mukaan, ja verokortin prosentti on ${FI.p(N35.veroprosentti, 1)}. Kaupungin tuloveroprosentti on ${FI.p(HKI.kunta)}, mikä on Manner-Suomen ${MANNER.length} kunnan joukossa ${SIJA}. pienin: vain Kauniainen perii vähemmän (${FI.p(KAU.kunta)}), ja Espoossa prosentti on täsmälleen sama. Mediaanikunnan prosentti on ${FI.p(MEDIAANI)}, joten ${FI.eur(42000)} vuosipalkalla helsinkiläisen verot ovat ${FI.eur(ERO_MED)} pienemmät kuin saman palkan saajalla tyypillisessä kunnassa. Evankelis-luterilaisten seurakuntien kirkollisvero on ${FI.p(HKI.evl)} ja ortodoksisen ${FI.p(HKI.ort)}. Asumistuessa Helsinki kuuluu kuntaryhmään I, jossa yksin asuvalle hyväksytään asumismenoja enintään ${FI.eur(ENI[0])} ja kahden hengen ruokakunnalle ${FI.eur(ENI[1])} kuukaudessa. Yksin asuvan tuki loppuu, kun bruttotulot ovat noin ${FI.eur(TR1)} kuukaudessa. Kevyt verotus ei siis yksin kerro, paljonko rahaa jää elämiseen, koska asumismenot ratkaisevat loput.`,
    faqs: [
      { q: 'Paljonko Helsingin kunnallisvero on vuonna 2026?', a: `Helsingin kunnan tuloveroprosentti on ${FI.p(HKI.kunta)} vuonna 2026. Prosentti lasketaan kunnallisverotuksen verotettavasta tulosta eli sen jälkeen, kun palkasta on vähennetty tulonhankkimisvähennys, työntekijän maksut ja perusvähennys. Siksi ${FI.eur(42000)} vuosipalkasta kunnallisveroa kertyy ${FI.eur(V42.kunnallisvero)} eikä ${FI.p(HKI.kunta)} koko palkasta. Luku on Verohallinnon päätöksestä kuntien ja seurakuntien tuloveroprosenteista.` },
      { q: 'Kuinka paljon kirkollisveroa Helsingissä maksetaan?', a: `Helsingin evankelis-luterilaisten seurakuntien kirkollisvero on ${FI.p(HKI.evl)}, mikä on koko maan pienin; sama prosentti on vain ${EVL_SAMA} kunnassa. ${FI.eur(42000)} vuosipalkalla jäsenyys maksaa noin ${FI.eur(KIRKKO42)} vuodessa. Ortodoksisen seurakunnan jäsenelle prosentti on ${FI.p(HKI.ort)}. Kirkollisvero kuuluu verokortin prosenttiin, joten eroaminen näkyy pidätyksessä vasta, kun tilaat uuden verokortin.` },
      { q: 'Saako Helsingissä asumistukea, jos vuokra on yli 800 euroa?', a: `Saa, mutta vuokrasta hyväksytään enintään kuntaryhmän I enimmäismäärä, yhdelle hengelle ${FI.eur(ENI[0])} kuukaudessa. Esimerkiksi ${FI.eur(TULOT)} bruttotuloilla ja ${FI.eur(VUOKRA)} vuokralla yksin asuva saa tukea noin ${FI.eur(AT_HKI.tuki, 2)} kuukaudessa. Kahden aikuisen talouden tuki päättyy noin ${FI.eur(TR2)} kuukausituloihin. Kela ottaa päätöksessä huomioon myös ruokakunnan varallisuuden.` },
      { q: 'Miksi helsinkiläisen verokortin prosentti on pienempi kuin työkaverin Vantaalla?', a: `Valtion vero, sairausvakuutusmaksut ja Yle-vero ovat kaikille samat, joten ero tulee kunnallisverosta. Vantaa perii ${FI.p(kunta('Vantaa').kunta)}, Helsinki ${FI.p(HKI.kunta)}. ${FI.eur(3500)} kuukausipalkalla helsinkiläisen verokorttiin tulee ${FI.p(N35.veroprosentti, 1)} ja vantaalaisen ${FI.p(netto(3500, 'Vantaa').veroprosentti, 1)}, koska Verohallinto pyöristää jokaisen prosentin ylöspäin puolen prosenttiyksikön tarkkuudella.` },
    ],
    body: (h) => `
<h2>Helsinki kuntien veroprosenttien järjestyksessä</h2>
<p>Pääkaupungin ${h.pct(HKI.kunta / 100, 2)} on ${SIJA}. pienin prosentti Manner-Suomen ${MANNER.length} kunnasta. Ero näkyy euroina vasta, kun palkkaa on riittävästi: pienillä tuloilla perusvähennys ja työtulovähennys syövät suurimman osan kunnallisverosta kaikkialla. Alla oleva taulukko on laskettu samalla moottorilla kuin sivun laskuri, ilman kirkollisveroa ja lomarahaa, ja se kertoo, paljonko kuukaudessa jää käteen Helsingissä ja sen naapureissa.</p>
${h.table(['Kunta', `Kunnallisvero`, `${h.eur(KK[0])}/kk`, `${h.eur(KK[1])}/kk`, `${h.eur(KK[2])}/kk`], NAAP.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...rivi(n).map((v) => h.eur(v))]), 'Nettopalkka kuukaudessa pääkaupunkiseudulla ja Sipoossa 2026, ei kirkon jäsen', ['l', 'r', 'r', 'r', 'r'])}
<p>Kauniainen on ainoa naapuri, jossa käteen jää enemmän. Sipooseen muuttava ${h.eur(KK[2])} kuussa ansaitseva menettää verotuksessa noin ${h.eur((rivi('Helsinki')[2] - rivi('Sipoo')[2]) * 12)} vuodessa. Kaikkien kuntien prosentit ovat ${h.a('kuntavertailu', 'kuntavertailussa')}.</p>
<h2>Kirkollisvero: Helsingin seurakunnat perivät vähiten</h2>
<p>Helsingin evankelis-luterilaisten seurakuntien ${h.pct(HKI.evl / 100, 2)} on koko maan matalin kirkollisvero, ja sama prosentti on käytössä vain kolmessa muussa kunnassa. Manner-Suomen kuntien keskimmäinen evankelis-luterilainen prosentti on ${h.pct(EVL_MED / 100, 2)}. Ortodoksisen seurakunnan jäsenelle Helsingissä kertyy ${h.pct(HKI.ort / 100, 2)}. Laskurin kirkko-valinta lisää prosentin suoraan kunnallisverotuksen verotettavaan tuloon.</p>
<h2>Asumistuen kuntaryhmä I ja vuokran yläraja</h2>
<p>Kela jakaa kunnat yleisessä asumistuessa kolmeen ryhmään. Helsinki on Espoon, Kauniaisten ja Vantaan kanssa ryhmässä I, jossa hyväksyttävien asumismenojen katto on korkein: ${h.eur(ENI[0])} yhdelle, ${h.eur(ENI[1])} kahdelle, ${h.eur(ENI[2])} kolmelle ja ${h.eur(ENI[3])} neljälle hengelle kuukaudessa. Ryhmässä II yhden hengen katto on ${h.eur(ENI_II[0])}. Tuki on ${h.pct(AT.tukiprosentti / 100, 0)} katon alle jäävistä menoista vähennettynä tuloista laskettavalla perusomavastuulla.</p>
<p>Esimerkki: yksin asuva maksaa ${h.eur(VUOKRA)} vuokraa ja ansaitsee ${h.eur(TULOT)} brutto kuukaudessa. Helsingissä tukea tulee ${h.eur(AT_HKI.tuki, 2)}, mutta samoilla luvuilla Tampereella vain ${h.eur(AT_TRE.tuki, 2)}, koska Tampereen katto on matalampi. Vuokrasta jää molemmissa kaupungeissa yli katon menevä osa kokonaan omaksi maksettavaksi. Tarkemmin ${h.a('asumistuki-laskuri', 'asumistukilaskurissa')} ja ${h.src('kela_asumistuki_laskenta', 'Kelan laskentaohjeessa')}.</p>`,
  },
  en: {
    slug: 'net-salary-helsinki',
    nav: 'Helsinki',
    card: 'Take-home pay in Helsinki: 2026 municipal and church tax, housing allowance group I.',
    title: 'Net Salary Helsinki 2026: Take-Home Pay at 5.30% City Tax',
    description: 'Net salary in Helsinki for 2026: 5.30% municipal tax, the lowest church tax in Finland and housing allowance group I. See what reaches your bank account.',
    h1: 'Net salary in Helsinki',
    intro: 'The calculator below is already set to Helsinki: type your gross monthly salary to see your take-home pay.',
    resume: `On a gross salary of ${EN.eur(3500)} a month, a Helsinki resident takes home about ${EN.eur(N35.kkNettoTodellinen)} a month in 2026, assuming no church membership and leaving the holiday bonus aside, and the tax card (verokortti) shows a withholding rate of ${EN.p(N35.veroprosentti, 1)}. Helsinki’s municipal tax (kunnallisvero) is ${EN.p(HKI.kunta)}, ranked number ${SIJA} out of ${MANNER.length} mainland municipalities: only Kauniainen charges less (${EN.p(KAU.kunta)}), and Espoo charges exactly the same. The median municipality sits at ${EN.p(MEDIAANI)}, so on ${EN.eur(42000)} a year you pay ${EN.eur(ERO_MED)} less tax in Helsinki than you would in a typical Finnish town. Lutheran church tax is ${EN.p(HKI.evl)}, the lowest in the country, and Orthodox ${EN.p(HKI.ort)}. For Kela’s general housing allowance (yleinen asumistuki), Helsinki is in municipality group I, where the accepted housing cost is capped at ${EN.eur(ENI[0])} a month for one person and ${EN.eur(ENI[1])} for two. A single person stops qualifying at around ${EN.eur(TR1)} of gross monthly income. Low tax is only half the picture, because rent decides the rest.`,
    faqs: [
      { q: 'What is the municipal tax rate in Helsinki for 2026?', a: `Helsinki’s municipal income tax rate is ${EN.p(HKI.kunta)} in 2026. It applies to taxable income after the work-expense deduction, your own contributions and the basic deduction, not to gross pay. On ${EN.eur(42000)} a year that comes to ${EN.eur(V42.kunnallisvero)} of municipal tax. The rate comes from the Finnish Tax Administration’s list of municipal and parish rates for 2026.` },
      { q: 'How much does church membership cost me in Helsinki?', a: `Helsinki’s Lutheran parishes charge ${EN.p(HKI.evl)}, the lowest church tax in Finland, shared by only ${EVL_SAMA} municipalities. On a ${EN.eur(42000)} salary that is about ${EN.eur(KIRKKO42)} a year. Members of the Orthodox parish pay ${EN.p(HKI.ort)}. If you were registered as a member when you moved here and leave later, order a new tax card so withholding drops.` },
      { q: 'Can I get Kela housing allowance in Helsinki if my rent is €800?', a: `Possibly, but Kela only counts rent up to the group I ceiling of ${EN.eur(ENI[0])} a month for one person. With ${EN.eur(TULOT)} of gross monthly income and ${EN.eur(VUOKRA)} rent, a single person gets roughly ${EN.eur(AT_HKI.tuki, 2)} a month. For a couple, support ends at about ${EN.eur(TR2)} of combined monthly income. Students on study grant usually fall under a different scheme.` },
      { q: 'Why is my tax rate lower than my colleague’s who lives in Vantaa?', a: `State tax, health insurance contributions and Yle tax are the same everywhere, so the gap is municipal tax: ${EN.p(kunta('Vantaa').kunta)} in Vantaa against ${EN.p(HKI.kunta)} in Helsinki. At ${EN.eur(3500)} a month a Helsinki tax card shows ${EN.p(N35.veroprosentti, 1)} and a Vantaa card ${EN.p(netto(3500, 'Vantaa').veroprosentti, 1)}, partly because Vero rounds every rate up to the next half point.` },
    ],
    body: (h) => `
<h2>Where Helsinki stands among Finnish municipalities</h2>
<p>With ${h.pct(HKI.kunta / 100, 2)}, the capital has the ${SIJA === 2 ? 'second' : `number ${SIJA}`} lowest rate of the ${MANNER.length} municipalities on the mainland. Low earners hardly feel it, because the basic deduction (perusvähennys) and the earned income tax credit (työtulovähennys) wipe out most municipal tax at small incomes. The gap opens up as your pay rises. The table uses the same engine as the calculator above, with no church tax and no holiday bonus.</p>
${h.table(['Municipality', 'Rate', `${h.eur(KK[0])}/month`, `${h.eur(KK[1])}/month`, `${h.eur(KK[2])}/month`], NAAP.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...rivi(n).map((v) => h.eur(v))]), 'Monthly take-home pay in the capital region and Sipoo, 2026, no church membership', ['l', 'r', 'r', 'r', 'r'])}
<p>Only Kauniainen beats Helsinki. If you earn ${h.eur(KK[2])} a month and move out to Sipoo, the higher rate costs you about ${h.eur((rivi('Helsinki')[2] - rivi('Sipoo')[2]) * 12)} a year. Every municipality is listed in the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>Church tax is cheapest here</h2>
<p>You only pay church tax (kirkollisvero) if you are a registered member of the Lutheran or Orthodox church. In Helsinki the Lutheran rate is ${h.pct(HKI.evl / 100, 2)}, matched by three other municipalities and undercut by none; the middle Lutheran rate across mainland municipalities is ${h.pct(EVL_MED / 100, 2)}. Orthodox members pay ${h.pct(HKI.ort / 100, 2)}. The calculator starts without church tax; switch it on if you are a member.</p>
<h2>Housing allowance: group I ceilings</h2>
<p>Kela sorts municipalities into three groups (kuntaryhmä) for the general housing allowance. Helsinki shares group I with Espoo, Kauniainen and Vantaa, which has the highest caps on accepted housing costs: ${h.eur(ENI[0])} for one person, ${h.eur(ENI[1])} for two, ${h.eur(ENI[2])} for three and ${h.eur(ENI[3])} for four, per month. In group II the single-person cap is ${h.eur(ENI_II[0])}. Kela pays ${h.pct(AT.tukiprosentti / 100, 0)} of accepted costs minus a basic deductible (perusomavastuu) that grows with gross income.</p>
<p>Take a single tenant paying ${h.eur(VUOKRA)} and earning ${h.eur(TULOT)} gross a month. In Helsinki the allowance is ${h.eur(AT_HKI.tuki, 2)}; with identical figures in Tampere it would be ${h.eur(AT_TRE.tuki, 2)}, purely because of the lower cap. Whatever rent exceeds the cap is yours to pay in both cities. Run your own case in the ${h.a('asumistuki-laskuri', 'housing allowance calculator')} or read ${h.src('kela_asumistuki_laskenta', 'Kela’s explanation of how income and costs count')}.</p>`,
  },
});
