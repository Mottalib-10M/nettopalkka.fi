import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const KUO = kunta('Kuopio');
const SAMAT = MANNER.filter((k) => k.kunta === KUO.kunta).map((k) => k.nimi);
const ALEMPIA = MANNER.filter((k) => k.kunta < KUO.kunta).length;
const SII = kunta('Siilinjärvi');

const KK = [2500, 3500, 5000];
const SAVO = ['Kuopio', 'Leppävirta', 'Suonenjoki', 'Siilinjärvi', 'Tuusniemi'];
const K35 = netto(3500, 'Kuopio');
const SII_HAITTA = KK.map((x) => (netto(x, 'Kuopio').kkNettoTodellinen - netto(x, 'Siilinjärvi').kkNettoTodellinen) * 12);

const VT = P.vero.tyotulovahennys;
const ILMAN = laskeVerot({ tulo: 36000, kunta: 'Kuopio' });
const KAKSI = laskeVerot({ tulo: 36000, kunta: 'Kuopio', lapset: 2 });
const YKSINH = laskeVerot({ tulo: 36000, kunta: 'Kuopio', lapset: 2, ainoaHuoltaja: true });

const AT = P.asumistuki;
const L = AT.lammitys;
const PERHE = { aikuiset: 2, lapset: 2, tulot: 2900, vuokra: 820, vesiErikseen: true, lammitysErikseen: true, lammitysalue: 'itainen' as const };
const AT_KUO = asumistuki({ kunta: 'Kuopio', ...PERHE });
const AT_SII = asumistuki({ kunta: 'Siilinjärvi', ...PERHE });
const TR_PERHE = tuloraja('Kuopio', 2, 2);

export default definePage({
  id: 'kuopio',
  group: 'kunnat',
  order: 80,
  tool: 'netto',
  toolPreset: { kunta: 'Kuopio' },
  related: ['jyvaskyla', 'oulu', 'kuntavertailu', 'asumistuki-laskuri'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-kuopio',
    nav: 'Kuopio',
    card: 'Kuopion 8,10 %:n vero, Siilinjärven ero, lapsiperheen työtulovähennys ja itäinen lämmitysnormi.',
    title: 'Nettopalkka Kuopio 2026: kunnallisvero 8,10 % ja lapsiperhe',
    description: 'Nettopalkka Kuopiossa 2026: kunnallisvero 8,10 %, Siilinjärvi 9,40 %. Laske nettopalkka, lapsiperheen työtulovähennys ja Pohjois-Savon lämmitysnormi itse.',
    h1: 'Nettopalkka Kuopiossa',
    intro: 'Kuopioon asetettu laskuri: kirjoita bruttopalkka ja valitse kirkon jäsenyys, niin näet nettotulon.',
    resume: `Kuopiossa ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(K35.kkNettoTodellinen)} kuukaudessa, kun kirkollisveroa ja lomarahaa ei lasketa, ja verokorttiin tulee ${FI.p(K35.veroprosentti, 1)}. Kuopion tuloveroprosentti on ${FI.p(KUO.kunta)}, sama kuin muun muassa Oulussa ja Jyväskylässä, ja ${ALEMPIA} mannerkuntaa verottaa kevyemmin. Pohjoinen naapuri Siilinjärvi perii ${FI.p(SII.kunta)}, joten siellä asuva ${FI.eur(3500)} kuussa ansaitseva maksaa noin ${FI.eur(SII_HAITTA[1])} vuodessa enemmän veroa. Kuopion evankelis-luterilainen kirkollisvero on ${FI.p(KUO.evl)} ja ortodoksinen ${FI.p(KUO.ort)}. Lapsiperheessä työtulovähennys kasvaa ${FI.eur(VT.lapsikorotus)} jokaista alaikäistä lasta kohden, ja yksinhuoltajalla korotus on kaksinkertainen. Asumistuessa Kuopio kuuluu kuntaryhmään II, jossa nelihenkisen perheen asumismenojen katto on ${FI.eur(AT.enimmaisasumismenot.II[3])} kuukaudessa. Pohjois-Savossa Kela hyväksyy erikseen maksettavaksi lämmitykseksi ${FI.eur(L.itainen[0])} ensimmäiseltä ja ${FI.eur(L.itainen[1])} jokaiselta seuraavalta henkilöltä, hieman enemmän kuin perusnormi, jota käytetään suurimmassa osassa maata.`,
    faqs: [
      { q: 'Paljonko Kuopion kunnallisvero on 2026?', a: `Kuopion kunnan tuloveroprosentti on ${FI.p(KUO.kunta)} vuonna 2026. Sama prosentti on käytössä ${SAMAT.length} mannerkunnassa, joten Kuopiossa, Oulussa ja Jyväskylässä samasta palkasta jää käteen sama summa, jos kirkkoon ei kuulu. Kirkon jäsenillä erot syntyvät seurakuntien prosenteista, jotka Kuopiossa ovat ${FI.p(KUO.evl)} ja ${FI.p(KUO.ort)}.` },
      { q: 'Paljonko Siilinjärvellä maksaa enemmän veroa kuin Kuopiossa?', a: `Siilinjärven ${FI.p(SII.kunta)} on ${FI.num(SII.kunta - KUO.kunta, 2)} prosenttiyksikköä Kuopion prosenttia korkeampi. Vuodessa ero on noin ${FI.eur(SII_HAITTA[0])} ${FI.eur(KK[0])} kuukausipalkalla, ${FI.eur(SII_HAITTA[1])} ${FI.eur(KK[1])} palkalla ja ${FI.eur(SII_HAITTA[2])} ${FI.eur(KK[2])} palkalla. Siilinjärvi kuuluu lisäksi asumistuen kuntaryhmään III, jossa enimmäisasumismenot ovat pienemmät.` },
      { q: 'Paljonko lapset pienentävät veroa Kuopiossa?', a: `Lapset korottavat työtulovähennystä ${FI.eur(VT.lapsikorotus)} lasta kohden, yksinhuoltajalla ${FI.eur(VT.lapsikorotus * 2)}. ${FI.eur(36000)} vuosipalkalla kuopiolaisen verot ovat ilman lapsia ${FI.eur(ILMAN.verot)}, kahden lapsen vanhemmalla ${FI.eur(KAKSI.verot)} ja kahden lapsen yksinhuoltajalla ${FI.eur(YKSINH.verot)}. Korotus pienentää ensin valtionveroa, ja sen ylittävä osa vähennetään muista veroista.` },
      { q: 'Paljonko lämmityskuluja Kela hyväksyy Kuopiossa?', a: `Kuopio on Pohjois-Savossa, joka kuuluu Etelä-Savon ja Pohjois-Karjalan kanssa itäiseen lämmitysalueeseen. Kela hyväksyy erikseen maksettavaa lämmitystä ${FI.eur(L.itainen[0])} kuukaudessa yhden hengen taloudelle ja ${FI.eur(L.itainen[1])} jokaista lisähenkilöä kohden. Neljän hengen perheellä normi on siis ${FI.eur(L.itainen[0] + 3 * L.itainen[1])} kuukaudessa, kun perusnormin alueella se olisi ${FI.eur(L.perus[0] + 3 * L.perus[1])}.` },
    ],
    body: (h) => `
<h2>Kuopio ja Pohjois-Savon naapurit</h2>
<p>Kuopio on seudullaan verotuksen edullisimpia. Leppävirta jää lähelle, mutta Siilinjärvi, Suonenjoki ja Tuusniemi perivät selvästi enemmän. Taulukon luvut ovat kuukausinettoja kirkkoon kuulumattomalle ilman lomarahaa.</p>
${h.table(['Kunta', 'Tuloveroprosentti', `Brutto ${h.eur(KK[0])}`, `Brutto ${h.eur(KK[1])}`, `Brutto ${h.eur(KK[2])}`], SAVO.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Nettopalkka kuukaudessa Kuopiossa ja lähikunnissa 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Samaa ${h.pct(KUO.kunta / 100, 2)} käyttävät myös ${h.a('oulu', 'Oulu')} ja ${h.a('jyvaskyla', 'Jyväskylä')}. Täydellinen lista on ${h.a('kuntavertailu', 'kuntavertailussa')}.</p>
<h2>Lapsiperheen verotus</h2>
<p>Kunnallisvero on sama kaikille, mutta työtulovähennys, joka vähennetään ensin valtionverosta, kasvaa alaikäisten lasten mukaan. Korotus on ${h.eur(VT.lapsikorotus)} lasta kohden ja kaksinkertainen ainoalle huoltajalle.</p>
${h.table(['Tilanne', 'Työtulovähennys', 'Verot yhteensä', 'Nettotulo vuodessa'], [['Ei lapsia', h.eur(ILMAN.tyotulovahennys), h.eur(ILMAN.verot), h.eur(ILMAN.netto)], ['Kaksi lasta', h.eur(KAKSI.tyotulovahennys), h.eur(KAKSI.verot), h.eur(KAKSI.netto)], ['Kaksi lasta, yksinhuoltaja', h.eur(YKSINH.tyotulovahennys), h.eur(YKSINH.verot), h.eur(YKSINH.netto)]], `${h.eur(36000)} vuosipalkka Kuopiossa 2026, ei kirkon jäsen`, ['l', 'r', 'r', 'r'])}
<h2>Asumistuki: itäinen lämmitysnormi ja ryhmä II</h2>
<p>Nelihenkinen perhe, kaksi aikuista ja kaksi lasta, maksaa ${h.eur(PERHE.vuokra)} vuokraa sekä veden ja lämmityksen erikseen. Bruttotulot ovat yhteensä ${h.eur(PERHE.tulot)} kuukaudessa. Kuopiossa Kela laskee menoiksi ${h.eur(AT_KUO.menot)}, katto on ${h.eur(AT_KUO.enimmais)}, ja tukea maksetaan ${h.eur(AT_KUO.tuki, 2)}. Siilinjärvellä katto on ryhmän III ${h.eur(AT_SII.enimmais)}, joten samoilla luvuilla tuki on ${h.eur(AT_SII.tuki, 2)}. Tällaisen perheen tuki loppuu Kuopiossa noin ${h.eur(TR_PERHE)} kuukausituloihin. Kaava on ${h.src('kela_asumistuki_laskenta', 'Kelan sivulla')}, ja omat luvut voi kokeilla ${h.a('asumistuki-laskuri', 'asumistukilaskurissa')}.</p>`,
  },
  en: {
    slug: 'net-salary-kuopio',
    nav: 'Kuopio',
    card: 'Kuopio’s 8.10% tax, the gap to Siilinjärvi, child increases to the earned income credit and the eastern heating norm.',
    title: 'Net Salary Kuopio 2026: 8.10% Tax and Families With Children',
    description: 'Net salary in Kuopio for 2026: municipal tax 8.10%, Siilinjärvi 9.40%. See your pay, the child increase in the earned income credit and Kela’s heating norm.',
    h1: 'Net salary in Kuopio',
    intro: 'Calculator set to Kuopio: enter gross pay and church membership to see your net income.',
    resume: `A ${EN.eur(3500)} monthly salary in Kuopio leaves about ${EN.eur(K35.kkNettoTodellinen)} a month after tax in 2026, not counting church tax or holiday bonus, and the tax card (verokortti) shows ${EN.p(K35.veroprosentti, 1)}. Kuopio’s municipal tax is ${EN.p(KUO.kunta)}, the same as Oulu and Jyväskylä, and ${ALEMPIA} mainland municipalities charge less. Siilinjärvi, the neighbour to the north, charges ${EN.p(SII.kunta)}, so living there on ${EN.eur(3500)} a month costs roughly ${EN.eur(SII_HAITTA[1])} more tax per year. Kuopio’s Lutheran church tax is ${EN.p(KUO.evl)} and Orthodox ${EN.p(KUO.ort)}. If you have children under 18, the earned income tax credit (työtulovähennys) rises by ${EN.eur(VT.lapsikorotus)} per child, doubled for a sole guardian. For Kela’s housing allowance, Kuopio is in municipality group II, where a family of four can have up to ${EN.eur(AT.enimmaisasumismenot.II[3])} a month of housing costs accepted. Because Kuopio is in North Savo (Pohjois-Savo), Kela accepts separately billed heating at ${EN.eur(L.itainen[0])} for the first person and ${EN.eur(L.itainen[1])} for each additional one, slightly above the basic norm used in most of Finland.`,
    faqs: [
      { q: 'What is the municipal tax rate in Kuopio for 2026?', a: `Kuopio charges ${EN.p(KUO.kunta)} in 2026, a rate used by ${SAMAT.length} mainland municipalities. That means the same salary nets the same amount in Kuopio, Oulu and Jyväskylä if you are not a church member. For members, the parish rates make the difference: in Kuopio they are ${EN.p(KUO.evl)} (Lutheran) and ${EN.p(KUO.ort)} (Orthodox).` },
      { q: 'How much more tax would I pay in Siilinjärvi than in Kuopio?', a: `Siilinjärvi’s ${EN.p(SII.kunta)} is ${EN.num(SII.kunta - KUO.kunta, 2)} points above Kuopio. Over a year that comes to about ${EN.eur(SII_HAITTA[0])} at ${EN.eur(KK[0])} a month, ${EN.eur(SII_HAITTA[1])} at ${EN.eur(KK[1])} and ${EN.eur(SII_HAITTA[2])} at ${EN.eur(KK[2])}. Siilinjärvi is also in housing allowance group III, with lower caps on accepted housing costs.` },
      { q: 'Do my children reduce my income tax in Finland?', a: `Yes, through the earned income tax credit, which rises by ${EN.eur(VT.lapsikorotus)} per child under 18 and ${EN.eur(VT.lapsikorotus * 2)} for a sole guardian. On ${EN.eur(36000)} a year in Kuopio, total tax is ${EN.eur(ILMAN.verot)} without children, ${EN.eur(KAKSI.verot)} for a parent of two and ${EN.eur(YKSINH.verot)} for a sole guardian of two. The credit is taken off state tax first, and any excess reduces the other taxes.` },
      { q: 'What heating cost does Kela accept for housing allowance in Kuopio?', a: `North Savo belongs, with South Savo and North Karelia, to Kela’s eastern heating zone. Kela accepts ${EN.eur(L.itainen[0])} a month of separately billed heating for one person and ${EN.eur(L.itainen[1])} for each extra person. For a family of four that is ${EN.eur(L.itainen[0] + 3 * L.itainen[1])}, against ${EN.eur(L.perus[0] + 3 * L.perus[1])} in the basic zone.` },
    ],
    body: (h) => `
<h2>Kuopio and its North Savo neighbours</h2>
<p>Kuopio is one of the lighter-taxed places in its area. Leppävirta comes close, while Siilinjärvi, Suonenjoki and Tuusniemi charge clearly more. Figures are monthly net pay for someone outside the church, holiday bonus excluded.</p>
${h.table(['Municipality', 'Income tax rate', `Gross ${h.eur(KK[0])}`, `Gross ${h.eur(KK[1])}`, `Gross ${h.eur(KK[2])}`], SAVO.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Monthly net pay in Kuopio and nearby municipalities, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>${h.a('oulu', 'Oulu')} and ${h.a('jyvaskyla', 'Jyväskylä')} use the same ${h.pct(KUO.kunta / 100, 2)}. The complete list is in the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>Tax for families with children</h2>
<p>Municipal tax is the same for everyone, but the earned income tax credit, which is taken off state tax first, grows with the number of children under 18. The increase is ${h.eur(VT.lapsikorotus)} per child and double for a sole guardian.</p>
${h.table(['Situation', 'Earned income credit', 'Total tax', 'Net income per year'], [['No children', h.eur(ILMAN.tyotulovahennys), h.eur(ILMAN.verot), h.eur(ILMAN.netto)], ['Two children', h.eur(KAKSI.tyotulovahennys), h.eur(KAKSI.verot), h.eur(KAKSI.netto)], ['Two children, sole guardian', h.eur(YKSINH.tyotulovahennys), h.eur(YKSINH.verot), h.eur(YKSINH.netto)]], `${h.eur(36000)} annual salary in Kuopio, 2026, not a church member`, ['l', 'r', 'r', 'r'])}
<h2>Housing allowance with the eastern heating norm</h2>
<p>Consider two adults and two children paying ${h.eur(PERHE.vuokra)} rent plus separate water and heating, on ${h.eur(PERHE.tulot)} of combined gross monthly income. In Kuopio, Kela counts ${h.eur(AT_KUO.menot)} of housing costs against a cap of ${h.eur(AT_KUO.enimmais)} and pays ${h.eur(AT_KUO.tuki, 2)}. In Siilinjärvi the group III cap is ${h.eur(AT_SII.enimmais)}, so the same family would get ${h.eur(AT_SII.tuki, 2)}. A household like this stops qualifying in Kuopio at around ${h.eur(TR_PERHE)} a month. The formula is on ${h.src('kela_asumistuki_laskenta', 'Kela’s website')}; plug in your own figures in the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}.</p>`,
  },
});
