import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { asumistuki, kuntaryhma } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const TRE = kunta('Tampere');
const KEHYS = ['Pirkkala', 'Nokia', 'Lempäälä', 'Ylöjärvi', 'Kangasala'];
const KEHYS_MIN = Math.min(...KEHYS.map((n) => kunta(n).kunta));
const KEHYS_MAX = Math.max(...KEHYS.map((n) => kunta(n).kunta));
const ALEMPIA = MANNER.filter((k) => k.kunta < TRE.kunta).length;
const SAMAA = MANNER.filter((k) => k.kunta === TRE.kunta).length;

const KK = [2500, 3500, 5000];
const T35 = netto(3500, 'Tampere');
const vuosi = (x: number, n: string) => netto(x, n).kkNettoTodellinen * 12;
const KANG_ERO = KK.map((x) => vuosi(x, 'Tampere') - vuosi(x, 'Kangasala'));
const EVL40 = laskeVerot({ tulo: 40000, kunta: 'Tampere', kirkko: 'evl' }).kirkollisvero;
const ORT40 = laskeVerot({ tulo: 40000, kunta: 'Tampere', kirkko: 'ort' }).kirkollisvero;

const AT = P.asumistuki;
const PARI = { aikuiset: 2, lapset: 0, tulot: 1700, vuokra: 850 };
const AT_TRE = asumistuki({ kunta: 'Tampere', ...PARI });
const AT_KANG = asumistuki({ kunta: 'Kangasala', ...PARI });
const III = KEHYS.filter((n) => kuntaryhma(n) === 'III');
const lista = (a: string[], ja: string) => `${a.slice(0, -1).join(', ')}${ja}${a[a.length - 1]}`;

export default definePage({
  id: 'tampere',
  group: 'kunnat',
  order: 40,
  tool: 'netto',
  toolPreset: { kunta: 'Tampere' },
  related: ['turku', 'oulu', 'kuntavertailu', 'asumistuki-enimmaismenot'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-tampere',
    nav: 'Tampere',
    card: 'Tampereen 7,60 %:n vero verrattuna kehyskuntiin ja asumistuen kuntaryhmät II ja III.',
    title: 'Nettopalkka Tampere 2026: vero 7,60 % ja kehyskuntien ero',
    description: 'Nettopalkka Tampereella 2026: kunnallisvero 7,60 % on matalampi kuin Nokialla, Kangasalla tai Ylöjärvellä. Laske käteen jäävä palkka ja vertaa kehyskuntiin.',
    h1: 'Nettopalkka Tampereella',
    intro: 'Kirjoita bruttopalkka: laskuri laskee nettotulon Tampereen kunnallisverolla ja kirkollisverolla.',
    resume: `Tampereella ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(T35.kkNettoTodellinen)} kuukaudessa ilman kirkollisveroa ja lomarahaa, ja verokortin prosentiksi tulee ${FI.p(T35.veroprosentti, 1)}. Tampereen tuloveroprosentti on ${FI.p(TRE.kunta)}, ja se on pienempi kuin yhdessäkään kaupunkia ympäröivässä kehyskunnassa, joissa prosentit vaihtelevat Pirkkalan ${FI.p(KEHYS_MIN)} ja Kangasalan ${FI.p(KEHYS_MAX)} välillä. Kangasalle muuttava ${FI.eur(5000)} kuukaudessa ansaitseva maksaa veroa vuodessa noin ${FI.eur(KANG_ERO[2])} enemmän kuin Tampereella. Manner-Suomen ${MANNER.length} kunnasta ${ALEMPIA} perii Tamperetta vähemmän. Tampereen evankelis-luterilainen kirkollisvero on ${FI.p(TRE.evl)} ja ortodoksinen ${FI.p(TRE.ort)}. Asumistuessa Tampere ja Nokia kuuluvat kuntaryhmään II, jossa yhden hengen hyväksyttävät asumismenot ovat enintään ${FI.eur(AT.enimmaisasumismenot.II[0])} ja kahden ${FI.eur(AT.enimmaisasumismenot.II[1])} kuukaudessa, kun taas Pirkkala, Lempäälä, Ylöjärvi ja Kangasala ovat ryhmässä III. Keskuskaupungissa asuva saa siis sekä kevyemmän verotuksen että korkeamman asumistuen katon.`,
    faqs: [
      { q: 'Paljonko Tampereen kunnallisvero on 2026?', a: `Tampereen kunnan tuloveroprosentti on ${FI.p(TRE.kunta)} vuonna 2026. Sama prosentti on yhteensä ${SAMAA} mannerkunnassa. Prosentti kohdistuu verotettavaan tuloon, joten ${FI.eur(3500)} kuukausipalkasta kunnallisveroa ei mene ${FI.p(TRE.kunta)} vaan vähemmän: perusvähennys ja työtulovähennys pienentävät sitä. Verokortin kokonaisprosentti on tällä palkalla ${FI.p(T35.veroprosentti, 1)}.` },
      { q: 'Kannattaako asua Tampereella vai Kangasalla verojen takia?', a: `Verot ovat Kangasalla korkeammat: ${FI.p(kunta('Kangasala').kunta)} vastaan Tampereen ${FI.p(TRE.kunta)}. Vuodessa ero on noin ${FI.eur(KANG_ERO[0])} ${FI.eur(KK[0])} kuukausipalkalla ja ${FI.eur(KANG_ERO[1])} ${FI.eur(KK[1])} palkalla. Kangasala on lisäksi asumistuen kuntaryhmässä III. Edullisempi asuminen voi silti kattaa eron, joten vertaa koko kuukausibudjettia.` },
      { q: 'Paljonko kirkollisveroa Tampereella maksetaan vuodessa?', a: `Tampereen evankelis-luterilaisten seurakuntien prosentti on ${FI.p(TRE.evl)} ja ortodoksisen seurakunnan ${FI.p(TRE.ort)}. ${FI.eur(40000)} vuosipalkalla evankelis-luterilaiselle kertyy kirkollisveroa noin ${FI.eur(EVL40)} ja ortodoksille ${FI.eur(ORT40)} vuodessa. Kirkollisvero lasketaan kunnallisverotuksen verotettavasta tulosta, ja jos työtulovähennys on valtionveroa suurempi, ylimenevä osa pienentää myös kirkollisveroa samassa suhteessa kuin kunnallisveroa.` },
      { q: 'Mikä on asumistuen enimmäisvuokra Tampereella?', a: `Tampere kuuluu kuntaryhmään II. Hyväksyttävät asumismenot ovat enintään ${FI.eur(AT.enimmaisasumismenot.II[0])} yhdelle, ${FI.eur(AT.enimmaisasumismenot.II[1])} kahdelle, ${FI.eur(AT.enimmaisasumismenot.II[2])} kolmelle ja ${FI.eur(AT.enimmaisasumismenot.II[3])} neljälle hengelle kuukaudessa. Katon ylittävää vuokraa Kela ei ota huomioon lainkaan, joten kalliimpi asunto ei kasvata tukea. Sähköä ei hyväksytä asumismenoksi, ja jos se sisältyy vuokraan, sen osuus vähennetään.` },
    ],
    body: (h) => `
<h2>Keskuskaupunki verottaa kevyemmin kuin kehyskunnat</h2>
<p>Moni olettaa, että kaupungista naapurikuntaan muuttaminen keventää verotusta, mutta Tampereen seudulla asetelma on toisin päin. Kaikki viisi taulukon kehyskuntaa perivät enemmän kuin Tampere, ja Ylöjärven ja Kangasalan prosentit ovat jo selvästi maan mediaanin yläpuolella. Luvut ovat kuukauden nettopalkkoja ilman kirkollisveroa ja lomarahaa.</p>
${h.table(['Asuinkunta', 'Tulovero-%', `${h.eur(KK[0])} kk`, `${h.eur(KK[1])} kk`, `${h.eur(KK[2])} kk`], ['Tampere', ...KEHYS].map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Käteen jäävä palkka Tampereella ja kehyskunnissa 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Pirkkalan ja Tampereen ero on pieni, ${h.num(kunta('Pirkkala').kunta - TRE.kunta, 2)} prosenttiyksikköä. Nokialla ja Lempäälässä prosentti on ${h.pct(kunta('Nokia').kunta / 100, 2)}. Muiden suurten kaupunkien vertailu löytyy esimerkiksi ${h.a('turku', 'Turun')} ja ${h.a('oulu', 'Oulun')} sivuilta, kaikki kunnat ${h.a('kuntavertailu', 'kuntavertailusta')}.</p>
<h2>Asumistuki: ryhmä II kaupungissa, ryhmä III rajan takana</h2>
<p>Asumistuen kuntaryhmissä Tampere ja Nokia ovat ryhmässä II, ja ${lista(III, ' ja ')} kuuluvat ryhmään III, jossa yhden hengen katto on ${h.eur(AT.enimmaisasumismenot.III[0])} ja kahden ${h.eur(AT.enimmaisasumismenot.III[1])} kuukaudessa. Kun pariskunnan bruttotulot ovat yhteensä ${h.eur(PARI.tulot)} ja vuokra ${h.eur(PARI.vuokra)}, Tampereella asumistukea tulee ${h.eur(AT_TRE.tuki, 2)} ja Kangasalla ${h.eur(AT_KANG.tuki, 2)} kuukaudessa. Ero johtuu pelkästään enimmäisasumismenoista, sillä perusomavastuu lasketaan kaikkialla samalla ${h.src('kela_asumistuki_laskenta', 'Kelan kaavalla')}. Kuntaryhmien katot kaikille ruokakuntakoille: ${h.a('asumistuki-enimmaismenot', 'asumistuen enimmäisasumismenot')}.</p>`,
  },
  en: {
    slug: 'net-salary-tampere',
    nav: 'Tampere',
    card: 'Tampere’s 7.60% tax against its surrounding municipalities, plus housing allowance groups II and III.',
    title: 'Net Salary Tampere 2026: 7.60% Tax and Surrounding Towns',
    description: 'Net salary in Tampere for 2026: the 7.60% municipal tax is lower than in Nokia, Kangasala or Ylöjärvi. Work out your take-home pay and compare nearby towns.',
    h1: 'Net salary in Tampere',
    intro: 'Type in your gross pay and the calculator works out net income with Tampere’s municipal and church tax.',
    resume: `A ${EN.eur(3500)} monthly salary in Tampere leaves about ${EN.eur(T35.kkNettoTodellinen)} a month after tax in 2026, not counting church tax or holiday bonus, and your tax card (verokortti) will show ${EN.p(T35.veroprosentti, 1)}. Tampere’s municipal tax rate is ${EN.p(TRE.kunta)}, and it is lower than in every municipality around it: the ring runs from ${EN.p(KEHYS_MIN)} in Pirkkala to ${EN.p(KEHYS_MAX)} in Kangasala. If you earn ${EN.eur(5000)} a month, moving out to Kangasala adds roughly ${EN.eur(KANG_ERO[2])} a year to your tax bill. Across mainland Finland, ${ALEMPIA} of ${MANNER.length} municipalities charge less than Tampere. Lutheran church tax here is ${EN.p(TRE.evl)} and Orthodox ${EN.p(TRE.ort)}. For Kela’s general housing allowance, Tampere and Nokia are in municipality group II, with accepted housing costs capped at ${EN.eur(AT.enimmaisasumismenot.II[0])} for one person and ${EN.eur(AT.enimmaisasumismenot.II[1])} for two, while Pirkkala, Lempäälä, Ylöjärvi and Kangasala are in group III. Living in the city itself gives you both the lighter tax and the higher rent cap.`,
    faqs: [
      { q: 'What is Tampere’s income tax rate in 2026?', a: `Tampere’s municipal income tax is ${EN.p(TRE.kunta)} in 2026, a rate shared by ${SAMAA} mainland municipalities. It is applied to taxable income after deductions, so on ${EN.eur(3500)} a month you pay well under ${EN.p(TRE.kunta)} of gross pay in municipal tax. Including state tax and contributions, the tax card rate at that salary is ${EN.p(T35.veroprosentti, 1)}.` },
      { q: 'Should I live in Tampere or Kangasala to save tax?', a: `Tampere. Kangasala charges ${EN.p(kunta('Kangasala').kunta)} against Tampere’s ${EN.p(TRE.kunta)}, which costs about ${EN.eur(KANG_ERO[0])} a year at ${EN.eur(KK[0])} a month and ${EN.eur(KANG_ERO[1])} at ${EN.eur(KK[1])}. Kangasala is also in housing allowance group III with a lower rent cap. A cheaper flat there can still outweigh the tax, so compare your whole monthly budget.` },
      { q: 'How much church tax would I pay as a member in Tampere?', a: `Tampere’s Lutheran parishes charge ${EN.p(TRE.evl)}, the Orthodox parish ${EN.p(TRE.ort)}. On a ${EN.eur(40000)} salary that is about ${EN.eur(EVL40)} a year for a Lutheran member and ${EN.eur(ORT40)} for an Orthodox member. If you registered as a member when you moved to Finland and later resign, order a new tax card to stop the withholding.` },
      { q: 'What rent does Kela accept for housing allowance in Tampere?', a: `Tampere is in group II. Kela counts housing costs up to ${EN.eur(AT.enimmaisasumismenot.II[0])} a month for one person, ${EN.eur(AT.enimmaisasumismenot.II[1])} for two, ${EN.eur(AT.enimmaisasumismenot.II[2])} for three and ${EN.eur(AT.enimmaisasumismenot.II[3])} for four. Anything above the cap is ignored, so a pricier flat does not raise your allowance. Electricity is never counted as a housing cost.` },
    ],
    body: (h) => `
<h2>The city taxes less than its suburbs</h2>
<p>It is easy to assume that moving out of a city cuts your tax. Around Tampere it works the other way: every one of the five neighbouring municipalities below charges more, and Ylöjärvi and Kangasala are well above the national median. Figures are monthly net pay without church tax or holiday bonus.</p>
${h.table(['Home municipality', 'Income tax', `${h.eur(KK[0])} a month`, `${h.eur(KK[1])} a month`, `${h.eur(KK[2])} a month`], ['Tampere', ...KEHYS].map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Take-home pay in Tampere and its surrounding municipalities, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Pirkkala is only ${h.num(kunta('Pirkkala').kunta - TRE.kunta, 2)} points above Tampere; Nokia and Lempäälä both charge ${h.pct(kunta('Nokia').kunta / 100, 2)}. For other big cities see ${h.a('turku', 'Turku')} and ${h.a('oulu', 'Oulu')}, and for every municipality the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>Housing allowance: group II in town, group III outside</h2>
<p>Tampere and Nokia are in housing allowance group II; ${lista(III, ' and ')} are in group III, where the cap is ${h.eur(AT.enimmaisasumismenot.III[0])} for one person and ${h.eur(AT.enimmaisasumismenot.III[1])} for two. A couple with ${h.eur(PARI.tulot)} of combined gross income and ${h.eur(PARI.vuokra)} rent would get ${h.eur(AT_TRE.tuki, 2)} a month in Tampere and ${h.eur(AT_KANG.tuki, 2)} in Kangasala. The gap comes entirely from the caps, because the deductible is worked out with the same ${h.src('kela_asumistuki_laskenta', 'Kela formula')} everywhere. Caps for every household size are on the ${h.a('asumistuki-enimmaismenot', 'maximum housing costs page')}.</p>`,
  },
});
