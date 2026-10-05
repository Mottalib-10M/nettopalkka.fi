import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const JKL = kunta('Jyväskylä');
const MUU = kunta('Muurame');
const ALEMPIA = MANNER.filter((k) => k.kunta < JKL.kunta).length;

const KK = [2500, 3500, 5000];
const YMPARISTO = ['Jyväskylä', 'Muurame', 'Jämsä', 'Laukaa', 'Petäjävesi'];
const J35 = netto(3500, 'Jyväskylä');
const MUU_ETU = KK.map((x) => (netto(x, 'Muurame').kkNettoTodellinen - netto(x, 'Jyväskylä').kkNettoTodellinen) * 12);
const LAU_HAITTA = (netto(3500, 'Jyväskylä').kkNettoTodellinen - netto(3500, 'Laukaa').kkNettoTodellinen) * 12;

const V = P.vero;
const OLETUS = V.oletuspalkkatulo['21_65'];
const OLETUS_ALLE21 = V.oletuspalkkatulo.alle21;
const OL = laskeVerot({ tulo: OLETUS, kunta: 'Jyväskylä' });
const OL_LISA = lisaprosentti(OL);
const YLI = 20000;
const KESA = laskeVerot({ tulo: YLI, kunta: 'Jyväskylä' });
const LISA_PIDATYS = (YLI - OLETUS) * OL_LISA / 100;
const ENS = laskeVerot({ tulo: 36000, kunta: 'Jyväskylä' });

const AT = P.asumistuki;
const VAST = { aikuiset: 1, lapset: 0, tulot: 1500, vuokra: 520 };
const AT_JKL = asumistuki({ kunta: 'Jyväskylä', ...VAST });
const TR1 = tuloraja('Jyväskylä', 1, 0);

export default definePage({
  id: 'jyvaskyla',
  group: 'kunnat',
  order: 70,
  tool: 'netto',
  toolPreset: { kunta: 'Jyväskylä' },
  related: ['kuopio', 'tampere', 'asumistuki-laskuri', 'kuntavertailu'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-jyvaskyla',
    nav: 'Jyväskylä',
    card: 'Jyväskylän 8,10 %:n vero, edullinen Muurame ja asumistuki opintojen päätyttyä.',
    title: 'Nettopalkka Jyväskylä 2026: kunnallisvero 8,10 % ja Muurame',
    description: 'Nettopalkka Jyväskylässä 2026: kunnallisvero 8,10 %, naapuri Muurame 6,90 %. Laske palkka ja katso, milloin yleinen asumistuki korvaa opiskelijan asumislisän.',
    h1: 'Nettopalkka Jyväskylässä',
    intro: 'Laskuri on asetettu Jyväskylään: kirjoita kuukausipalkka tai kesätyön palkka ja katso nettotulo.',
    resume: `Jyväskylässä ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(J35.kkNettoTodellinen)} kuukaudessa ilman kirkollisveroa ja lomarahaa, ja verokortin prosentti on ${FI.p(J35.veroprosentti, 1)}. Kaupungin tuloveroprosentti on ${FI.p(JKL.kunta)}, ja Manner-Suomen kunnista ${ALEMPIA} verottaa kevyemmin. Lähin niistä on eteläinen naapuri Muurame, jonka ${FI.p(MUU.kunta)} tuo ${FI.eur(3500)} palkalla noin ${FI.eur(MUU_ETU[1])} vuodessa enemmän käteen. Laukaa ja Petäjävesi perivät sen sijaan ${FI.p(kunta('Laukaa').kunta)}, ja Jämsä ${FI.p(kunta('Jämsä').kunta)}. Jyväskylän evankelis-luterilainen kirkollisvero on ${FI.p(JKL.evl)} ja ortodoksinen ${FI.p(JKL.ort)}. Asumistuessa Jyväskylä kuuluu kuntaryhmään II, jossa yhden hengen hyväksyttävät asumismenot ovat enintään ${FI.eur(AT.enimmaisasumismenot.II[0])} kuukaudessa. Opiskelija ei kuitenkaan yleensä saa yleistä asumistukea, jos hänellä on oikeus opintotuen asumislisään. Tuki tulee kyseeseen vasta, kun opinnot keskeytyvät, opintotukikuukaudet loppuvat tai ruokakunnassa on lapsi, ja tietysti valmistumisen jälkeen.`,
    faqs: [
      { q: 'Paljonko Jyväskylän kunnallisvero on vuonna 2026?', a: `Jyväskylän kunnan tuloveroprosentti on ${FI.p(JKL.kunta)} vuonna 2026, sama kuin Oulussa ja Kuopiossa. Se lasketaan verotettavasta tulosta vähennysten jälkeen. ${FI.eur(36000)} vuositulolla kunnallisveroa kertyy noin ${FI.eur(ENS.kunnallisvero)} ja verokortin kokonaisprosentiksi tulee ${FI.p(ENS.veroprosentti, 1)}, jos ei kuulu kirkkoon. Valtion vero ja maksut ovat samat kaikissa kunnissa.` },
      { q: 'Saako Jyväskylässä opiskeleva yleistä asumistukea?', a: `Yleensä ei. Kelan mukaan opiskelija, jolla on oikeus opintotuen asumislisään, ei saa yleistä asumistukea. Poikkeuksia ovat tilanteet, joissa asut oman tai puolisosi lapsen kanssa, saat opintojen ajalta muuta tukea kuin opintotukea, olet keskeyttänyt opinnot tai käyttänyt opintotukikuukautesi. Suomeen opiskelemaan tulleet eivät voi saada asumistukea lainkaan.` },
      { q: 'Mikä veroprosentti tulee kesätyöntekijän verokorttiin Jyväskylässä?', a: `Jos edellisen vuoden tulot olivat pienet, Verohallinto laskee 21–65-vuotiaalle prosentin ${FI.eur(OLETUS)} oletuspalkkatulolle ja nuoremmalle ${FI.eur(OLETUS_ALLE21)} tulolle. Jyväskylässä tällainen kortti näyttää perusprosentin ${FI.p(OL.veroprosentti, 1)} ja lisäprosentin ${FI.p(OL_LISA, 1)}. Jos palkkaa kertyy ${FI.eur(YLI)}, tulorajan ylittävästä osasta pidätetään ${FI.eur(LISA_PIDATYS)}, vaikka lopullinen vero on vain ${FI.eur(KESA.verot)}.` },
      { q: 'Kannattaako Jyväskylästä muuttaa Muurameen verojen vuoksi?', a: `Verotus on Muuramessa kevyempi: ${FI.p(MUU.kunta)} vastaan ${FI.p(JKL.kunta)}. Vuodessa ero on noin ${FI.eur(MUU_ETU[0])} ${FI.eur(KK[0])} kuukausipalkalla ja ${FI.eur(MUU_ETU[2])} ${FI.eur(KK[2])} palkalla. Muurame on kuitenkin asumistuen kuntaryhmässä III, jossa yhden hengen katto on ${FI.eur(AT.enimmaisasumismenot.III[0])}, kun Jyväskylässä se on ${FI.eur(AT.enimmaisasumismenot.II[0])}.` },
    ],
    body: (h) => `
<h2>Jyväskylä ja ympäröivät kunnat</h2>
<p>Jyväskylän seudulla kunnallisveron erot ovat poikkeuksellisen suuret: Muuramen ${h.pct(MUU.kunta / 100, 2)} ja Laukaan ${h.pct(kunta('Laukaa').kunta / 100, 2)} välillä on ${h.num(kunta('Laukaa').kunta - MUU.kunta, 2)} prosenttiyksikköä. Laukaaseen muuttava ${h.eur(KK[1])} kuussa ansaitseva maksaa veroa noin ${h.eur(LAU_HAITTA)} vuodessa enemmän kuin Jyväskylässä.</p>
${h.table(['Asuinkunta', 'Kunta-%', `${h.eur(KK[0])}`, `${h.eur(KK[1])}`, `${h.eur(KK[2])}`], YMPARISTO.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Kuukauden nettopalkka bruttopalkan mukaan, Jyväskylä ja lähikunnat 2026, ei kirkollisveroa', ['l', 'r', 'r', 'r', 'r'])}
<h2>Kesätyö ja ensimmäinen verokortti</h2>
<p>Verohallinnon päätöksen mukaan pienituloiselle lasketaan veroprosentti oletetulle palkalle: 21–65-vuotiaalle ${h.eur(OLETUS)} ja sitä nuoremmalle ${h.eur(OLETUS_ALLE21)}. Jyväskyläläisen ${h.eur(OLETUS)} oletustulon perusprosentti on ${h.pct(OL.veroprosentti / 100, 1)}, koska perusvähennys ja työtulovähennys poistavat niin pienen tulon verot kokonaan. Ansa on lisäprosentti ${h.pct(OL_LISA / 100, 1)}: kun vuoden palkat ylittävät ${h.eur(OLETUS)}, ylittävästä osasta pidätetään tämä prosentti. ${h.eur(YLI)} vuosipalkalla pidätystä kertyy ${h.eur(LISA_PIDATYS)}, mutta lopullinen vero on ${h.eur(KESA.verot)}. Erotus palautuu vasta seuraavana vuonna, joten jos tiedät tulojen ylittävän oletuksen, tilaa uusi verokortti oikealla tulorajalla.</p>
<h2>Asumistuki opiskelun jälkeen</h2>
<p>Yleisen asumistuen ja opintotuen asumislisän raja kulkee opiskelijastatuksessa, ei kaupungissa. Kun valmistut ja aloitat työt, tuki lasketaan ${h.src('kela_asumistuki_laskenta', 'Kelan kaavalla')} ryhmän II katoilla. Esimerkiksi yksin asuva, jonka bruttotulot ovat ${h.eur(VAST.tulot)} ja vuokra ${h.eur(VAST.vuokra)} kuukaudessa, saa Jyväskylässä tukea ${h.eur(AT_JKL.tuki, 2)}. Yhden hengen talouden tuki loppuu noin ${h.eur(TR1)} kuukausituloihin. Jyväskylä ei kuulu Kelan itäisen tai pohjoisen lämmitysnormin alueisiin, joten erikseen maksettavaa lämmitystä hyväksytään perusnormin ${h.eur(AT.lammitys.perus[0])} yhdelle hengelle. Vertaa ${h.a('kuopio', 'Kuopioon')} ja ${h.a('tampere', 'Tampereeseen')} tai käytä ${h.a('asumistuki-laskuri', 'asumistukilaskuria')}; kaikki kunnat ovat ${h.a('kuntavertailu', 'kuntavertailussa')}.</p>`,
  },
  en: {
    slug: 'net-salary-jyvaskyla',
    nav: 'Jyväskylä',
    card: 'Jyväskylä’s 8.10% tax, low-tax Muurame next door, and housing allowance once your studies end.',
    title: 'Net Salary Jyväskylä 2026: 8.10% Tax and Muurame Next Door',
    description: 'Net salary in Jyväskylä for 2026: municipal tax 8.10%, neighbouring Muurame 6.90%. Check your pay and when Kela housing allowance replaces student support.',
    h1: 'Net salary in Jyväskylä',
    intro: 'The calculator is set to Jyväskylä: enter a monthly salary or summer job pay to see what you keep.',
    resume: `In Jyväskylä, a ${EN.eur(3500)} monthly salary leaves about ${EN.eur(J35.kkNettoTodellinen)} a month after tax in 2026, excluding church tax and holiday bonus, with a tax card (verokortti) rate of ${EN.p(J35.veroprosentti, 1)}. The city’s municipal tax is ${EN.p(JKL.kunta)}, and ${ALEMPIA} mainland municipalities tax less. The nearest of them is Muurame, just south of the city, whose ${EN.p(MUU.kunta)} is worth about ${EN.eur(MUU_ETU[1])} a year at ${EN.eur(3500)} a month. Laukaa and Petäjävesi, on the other hand, charge ${EN.p(kunta('Laukaa').kunta)} and Jämsä ${EN.p(kunta('Jämsä').kunta)}. Church tax in Jyväskylä is ${EN.p(JKL.evl)} for Lutherans and ${EN.p(JKL.ort)} for Orthodox members. For Kela’s general housing allowance (yleinen asumistuki) the city is in municipality group II, with a single-person cap of ${EN.eur(AT.enimmaisasumismenot.II[0])} a month on accepted housing costs. Students entitled to the housing supplement of the study grant (asumislisä) are normally excluded from the general allowance, and international students who came to Finland to study cannot receive it at all. The general allowance becomes relevant once you graduate and start working.`,
    faqs: [
      { q: 'What is the 2026 municipal tax rate in Jyväskylä?', a: `Jyväskylä charges ${EN.p(JKL.kunta)} in 2026, the same as Oulu and Kuopio. It is levied on taxable income after deductions. On ${EN.eur(36000)} a year that means about ${EN.eur(ENS.kunnallisvero)} of municipal tax, and the full tax card rate comes to ${EN.p(ENS.veroprosentti, 1)} for someone outside the church.` },
      { q: 'Can an international student in Jyväskylä get Kela housing allowance?', a: `No. Kela states that students who came to Finland to study cannot belong to a household for housing allowance purposes or receive the allowance. Finnish students entitled to the study grant’s housing supplement are excluded too, unless they live with a child, receive support other than study grant, have interrupted their studies or used up their study grant months.` },
      { q: 'What tax rate goes on a summer job tax card in Jyväskylä?', a: `If last year’s income was small, Vero calculates the rate on an assumed salary of ${EN.eur(OLETUS)} for ages 21 to 65 and ${EN.eur(OLETUS_ALLE21)} for younger workers. In Jyväskylä such a card shows a base rate of ${EN.p(OL.veroprosentti, 1)} and an additional rate of ${EN.p(OL_LISA, 1)}. Earn ${EN.eur(YLI)} and ${EN.eur(LISA_PIDATYS)} is withheld on the part above the limit, although your final tax is only ${EN.eur(KESA.verot)}.` },
      { q: 'Does living in Muurame instead of Jyväskylä save tax?', a: `Yes. Muurame charges ${EN.p(MUU.kunta)} against Jyväskylä’s ${EN.p(JKL.kunta)}, worth about ${EN.eur(MUU_ETU[0])} a year at ${EN.eur(KK[0])} a month and ${EN.eur(MUU_ETU[2])} at ${EN.eur(KK[2])}. Muurame is in housing allowance group III, though, where the single-person cap is ${EN.eur(AT.enimmaisasumismenot.III[0])} instead of ${EN.eur(AT.enimmaisasumismenot.II[0])}, which matters if you expect to claim it.` },
    ],
    body: (h) => `
<h2>Jyväskylä and the surrounding municipalities</h2>
<p>Tax rates around Jyväskylä differ more than in most city regions. Between Muurame at ${h.pct(MUU.kunta / 100, 2)} and Laukaa at ${h.pct(kunta('Laukaa').kunta / 100, 2)} there are ${h.num(kunta('Laukaa').kunta - MUU.kunta, 2)} percentage points. On ${h.eur(KK[1])} a month, an address in Laukaa costs about ${h.eur(LAU_HAITTA)} a year more in tax than one in Jyväskylä.</p>
${h.table(['Home municipality', 'Rate', `${h.eur(KK[0])}`, `${h.eur(KK[1])}`, `${h.eur(KK[2])}`], YMPARISTO.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Monthly net pay by gross salary, Jyväskylä and nearby municipalities, 2026, no church tax', ['l', 'r', 'r', 'r', 'r'])}
<h2>Summer jobs and your first tax card</h2>
<p>Under Vero’s withholding decision, a low earner’s rate is calculated on an assumed salary (oletuspalkkatulo): ${h.eur(OLETUS)} for ages 21 to 65 and ${h.eur(OLETUS_ALLE21)} below that. In Jyväskylä the ${h.eur(OLETUS)} assumption produces a base rate of ${h.pct(OL.veroprosentti / 100, 1)}, because the basic deduction and earned income credit cancel all tax on an income that small. The catch is the additional rate of ${h.pct(OL_LISA / 100, 1)}: once your pay for the year passes ${h.eur(OLETUS)}, everything above it is withheld at that rate. On ${h.eur(YLI)} of salary that adds up to ${h.eur(LISA_PIDATYS)} withheld, against a final tax of ${h.eur(KESA.verot)}. The difference only comes back the following year, so if you expect to earn more than the assumption, order a new tax card with a realistic income limit.</p>
<h2>Housing allowance after graduation</h2>
<p>What separates the general housing allowance from the student housing supplement is your status as a student, not the city. Once you graduate and take a job, Kela uses ${h.src('kela_asumistuki_laskenta', 'its standard formula')} with the group II caps. Someone living alone on ${h.eur(VAST.tulot)} gross a month with ${h.eur(VAST.vuokra)} rent would get ${h.eur(AT_JKL.tuki, 2)} in Jyväskylä, and a single-person household stops qualifying at about ${h.eur(TR1)} a month. Jyväskylä is outside Kela’s eastern and northern heating zones, so separately billed heating counts at the basic ${h.eur(AT.lammitys.perus[0])} for one person. Compare ${h.a('kuopio', 'Kuopio')} and ${h.a('tampere', 'Tampere')}, try the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}, or browse the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>`,
  },
});
