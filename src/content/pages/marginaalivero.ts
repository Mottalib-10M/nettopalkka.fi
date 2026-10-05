import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot } from '../../lib/engine/vero';
import { kunta } from '../../lib/engine/params';

const V = P.vero;
const TT = V.tyotulovahennys;
const D = 1000;
/** Marginaalivero: osuus D euron lisäpalkasta, joka menee veroihin ja palkansaajan maksuihin. */
const marg = (t: number, k = 'Helsinki') => {
  const a = laskeVerot({ tulo: t, kunta: k }), b = laskeVerot({ tulo: t + D, kunta: k });
  return {
    m: 1 - (b.netto - a.netto) / D,
    valtio: (b.valtionvero - a.valtionvero) / D,
    kunta: (b.kunnallisvero - a.kunnallisvero) / D,
    maksut: (b.tyoelakemaksu + b.tyottomyysvakuutusmaksu + b.paivarahamaksu + b.sairaanhoitomaksu + b.yle - (a.tyoelakemaksu + a.tyottomyysvakuutusmaksu + a.paivarahamaksu + a.sairaanhoitomaksu + a.yle)) / D,
    ttv: (a.tyotulovahennys - b.tyotulovahennys) / D,
    a, b,
  };
};
const TASOT = [20000, 25000, 30000, 36000, 42000, 48000, 54000, 60000, 80000].map((t) => ({ t, r: marg(t) }));
const MAX = Math.max(...TASOT.map((x) => x.r.m));
const PORRAS = laskeVerot({ tulo: V.paivarahamaksu_tuloraja - 1 }).netto - laskeVerot({ tulo: V.paivarahamaksu_tuloraja }).netto;
const M48 = marg(48000), M60 = marg(60000), M20 = marg(20000), M25 = marg(25000), M54 = marg(54000);
const M48T = marg(48000, 'Tampere');
const MAKSUT = V.tyoelakemaksu_prosentti + V.tyottomyysvakuutusmaksu_prosentti;
// Minilaskurin oletus: 3 500 €/kk ja 200 € korotus.
const KK = 3500, KOR = 200;
const KA = laskeVerot({ tulo: KK * 12 }), KB = laskeVerot({ tulo: (KK + KOR) * 12 });
const KOR_KATEEN = (KB.netto - KA.netto) / 12;
const TOP = V.valtion_asteikko[V.valtion_asteikko.length - 1];
const BONUS = 3000, BA = laskeVerot({ tulo: 48000 }), BB = laskeVerot({ tulo: 48000 + BONUS });
const BONUS_NETTO = BB.netto - BA.netto;
const YLI = 500, M36 = marg(36000);
const SIVU_A = laskeVerot({ tulo: 20000 }), SIVU_B = laskeVerot({ tulo: 25000 });
const SIVU_NETTO = SIVU_B.netto - SIVU_A.netto;
const HKI = kunta('Helsinki').kunta, TRE = kunta('Tampere').kunta;

export default definePage({
  id: 'marginaalivero',
  group: 'vero',
  order: 130,
  mini: 'marginaali',
  related: ['valtion-tuloveroasteikko', 'bruttopalkka-laskuri', 'tyotulovahennys', 'nettopalkka-5000'],
  sources: ['vero_asteikko', 'vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'marginaalivero',
    nav: 'Marginaalivero',
    card: 'Paljonko palkankorotuksesta jää käteen eri tulotasoilla vuonna 2026, ja miksi työtulovähennys nostaa marginaaliveroa.',
    title: 'Marginaalivero 2026: paljonko palkankorotuksesta jää käteen',
    description: `Marginaalivero 2026: palkankorotuksesta menee veroihin ja maksuihin jopa ${FI.pct(MAX, 0)}, ja työtulovähennyksen pieneneminen ${FI.eur(TT.pienenemisraja)} jälkeen nostaa osuutta entisestään.`,
    h1: 'Marginaalivero: paljonko lisäeurosta jää käteen',
    intro: 'Marginaalivero kertoo, kuinka suuri osa seuraavasta palkkaeurosta menee veroihin ja maksuihin, ja se on aina selvästi suurempi kuin verokortin prosentti.',
    resume: `Marginaalivero on se osuus palkankorotuksesta, joka menee veroihin ja palkansaajan maksuihin. Vuonna 2026 helsinkiläiseltä, joka ansaitsee ${FI.eur(48000)} vuodessa, menee jokaisesta lisäeurosta ${FI.pct(M48.m, 1)}, vaikka hänen verokorttinsa prosentti on vain ${FI.num(M48.a.veroprosentti, 1)} %. Ero syntyy siitä, että verokortin prosentti on keskimääräinen veroaste koko tulosta, kun taas marginaalivero koskee vain viimeistä euroa, johon osuvat valtion tuloveroasteikon korkein käytössä oleva porras, kunnallisvero, sairausvakuutusmaksut sekä työeläke- ja työttömyysvakuutusmaksu yhteensä ${FI.num(MAKSUT, 2)} %. Tulovälillä ${FI.eur(TT.pienenemisraja)}–${FI.eur(TT.pienenemisen_ylaraja)} työtulovähennys pienenee ${FI.p(TT.pienenemisprosentti, 0)} puhtaan ansiotulon kasvusta, mikä lisää marginaaliveroa noin kahdella prosenttiyksiköllä. Siksi ${FI.eur(48000)} palkalla marginaalivero on suurempi kuin ${FI.eur(54000)} palkalla (${FI.pct(M54.m, 1)}). Korkeimmillaan, kun verotettava tulo ylittää ${FI.eur(TOP.alaraja)}, marginaalivero on Helsingissä ${FI.pct(M60.m, 1)}. Kotikunta muuttaa lukua kunnallisveron verran: Tampereella sama ${FI.eur(48000)} palkka tuottaa ${FI.pct(M48T.m, 1)} marginaaliveron.`,
    faqs: [
      { q: 'Paljonko 200 euron palkankorotuksesta jää käteen?', a: `${FI.eur(KK)} kuukausipalkalla Helsingissä ${FI.eur(KOR)} korotuksesta jää käteen noin ${FI.eur(KOR_KATEEN)} kuukaudessa, eli vuodessa ${FI.eur(KOR_KATEEN * 12)}. Loput menevät valtionveroon, kunnallisveroon, sairausvakuutusmaksuihin sekä työeläke- ja työttömyysvakuutusmaksuun. Verokortin prosentti nousee korotuksen myötä ${FI.num(KA.veroprosentti, 1)} prosentista ${FI.num(KB.veroprosentti, 1)} prosenttiin, mutta marginaalivero on tätä selvästi suurempi.` },
      { q: 'Voiko palkankorotus pienentää nettopalkkaa Suomessa?', a: `Lähes aina korotuksesta jää jotain käteen, koska korkeinkin marginaalivero on Helsingissä ${FI.pct(M60.m, 1)}. Poikkeus on päivärahamaksun raja ${FI.eur(V.paivarahamaksu_tuloraja)} vuodessa: kun se ylittyy, maksu lasketaan koko palkasta. Laskelmamme mukaan nettotulo putoaa rajalla ${FI.eur(PORRAS)}, joten tätä pienempi korotus, joka vie vuositulot rajan yli, voi jättää käteen vähemmän kuin ennen.` },
      { q: 'Miksi marginaalivero on suurempi 48 000 kuin 54 000 euron palkalla?', a: `Syy on työtulovähennyksen pieneneminen. Kun puhdas ansiotulo on ${FI.eur(TT.pienenemisraja)}–${FI.eur(TT.pienenemisen_ylaraja)}, työtulovähennys pienenee ${FI.p(TT.pienenemisprosentti, 0)} jokaisesta lisäeurosta, mikä toimii lisäverona. ${FI.eur(48000)} palkalla marginaalivero on ${FI.pct(M48.m, 1)}, mutta kun vähennyksen pieneneminen loppuu, ${FI.eur(54000)} palkalla se on ${FI.pct(M54.m, 1)}. Seuraava asteikon porras nostaa sen myöhemmin taas ylemmäs.` },
      { q: 'Kannattaako ylityö, jos marginaalivero on lähes 50 prosenttia?', a: `Kannattaa, jos haluat lisää rahaa, sillä jokaisesta ylityöeurosta jää silti yli puolet. ${FI.eur(48000)} palkalla Helsingissä ${FI.eur(YLI)} ylityökorvauksesta jää käteen noin ${FI.eur(YLI * (1 - M48.m))}. Ylityökorvaus kerryttää myös eläkettä, koska siitä peritään työeläkemaksu. Arvioon kannattaa lisätä vain se, että palkanmaksussa pidätys voi olla suurempi, jos tuloraja ylittyy.` },
      { q: 'Mikä on marginaalivero 3000 euron kuukausipalkalla?', a: `${FI.eur(3000)} kuukausipalkka tekee ${FI.eur(36000)} vuodessa. Helsingissä sen marginaalivero on ${FI.pct(M36.m, 1)}, eli ${FI.eur(100)} lisäpalkasta jää käteen noin ${FI.eur(100 * (1 - M36.m))}. Tulo on jo työtulovähennyksen pienenemisvyöhykkeellä, joten mukana on ${FI.pct(M36.ttv, 1)} vähennyksen pienenemisestä. Korkeamman kunnallisveron kunnassa luku on suurempi.` },
      { q: 'Lasketaanko työeläkemaksu mukaan marginaaliveroon?', a: `Tässä laskelmassa lasketaan, koska se pienentää käteen jäävää rahaa samalla tavalla kuin vero. Työeläkemaksu ${FI.p(V.tyoelakemaksu_prosentti)} ja työttömyysvakuutusmaksu ${FI.p(V.tyottomyysvakuutusmaksu_prosentti)} vievät jokaisesta lisäeurosta yhteensä ${FI.num(MAKSUT, 2)} senttiä. Työeläkemaksu kuitenkin kerryttää eläkettä, joten osa marginaaliverosta palaa myöhemmin eläkkeenä, toisin kuin varsinaiset verot.` },
      { q: 'Mikä on Suomen korkein marginaaliveroprosentti palkkatulolle?', a: `Palkkatulon marginaalivero on korkeimmillaan, kun verotettava tulo ylittää valtion asteikon ylimmän rajan ${FI.eur(TOP.alaraja)}, jolloin valtionvero on ${FI.p(TOP.prosentti, 2)}. Helsingissä marginaalivero on silloin ${FI.pct(M60.m, 1)}, korkeamman kunnallisveron kunnissa enemmän. Kirkon jäsenyys lisää siihen seurakunnan prosentin. Tätä ylempää porrasta palkkatulolle ei ole.` },
    ],
    body: (h) => `
<h2>Marginaalivero tulotasoittain</h2>
<p>Alla oleva taulukko on laskettu sivuston verolaskentamoottorilla vertaamalla nettotuloa kahdella palkalla, joiden ero on ${h.eur(D)}. Mukana ovat kaikki palkansaajan verot ja maksut: valtionvero ${h.src('vero_asteikko', 'vuoden 2026 asteikolla')}, Helsingin kunnallisvero ${h.num(HKI, 2)} % ${h.src('vero_kunnat', 'kuntien veroprosenttien')} mukaan, sairaanhoitomaksu, päivärahamaksu, Yle-vero sekä työeläke- ja työttömyysvakuutusmaksu. Kirkollisveroa ei ole mukana.</p>
${h.table(['Vuosipalkka', 'Marginaalivero', 'Valtionvero', 'Kunnallisvero', 'Maksut ja Yle', 'Työtulovähennyksen pieneneminen'], TASOT.map(({ t, r }) => [h.eur(t), h.pct(r.m, 1), h.pct(r.valtio, 1), h.pct(r.kunta, 1), h.pct(r.maksut, 1), h.pct(r.ttv, 1)]), `Osuus seuraavasta ${h.eur(D)} lisäpalkasta, Helsinki, vuosi 2026`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Valtionveron sarakkeeseen sisältyy työtulovähennyksen pieneneminen, koska vähennys tehdään ensin valtionverosta; viimeinen sarake näyttää sen osuuden erikseen. Taulukosta näkyy kolme vaihetta, jotka eivät ilmene verokortin prosentista.</p>
<h3>Pienet tulot: työtulovähennys suojaa</h3>
<p>${h.eur(20000)} palkalla marginaalivero on vain ${h.pct(M20.m, 1)}. Työtulovähennys on täysimääräinen ja niin suuri, että se kattaa sekä valtionveron että kunnallisveron. Lisäeurosta menevät käytännössä vain maksut ja Yle-vero. Kun palkka nousee ${h.eur(25000)} tasolle, vähennyksen ylijäämä on käytetty ja kunnallisvero alkaa purra: marginaalivero hyppää ${h.pct(M25.m, 1)}. Tällä tulovälillä myös perusvähennys pienenee, mikä nostaa kunnallisveron osuutta lisäeurosta enemmän kuin kunnan prosentti yksin.</p>
<h3>Keskitulot: kaksi prosenttiyksikköä lisää</h3>
<p>Kun puhdas ansiotulo ylittää ${h.eur(TT.pienenemisraja)}, ${h.a('tyotulovahennys', 'työtulovähennys')} alkaa pienentyä ${h.num(TT.pienenemisprosentti, 0)} % tulon kasvusta, ja pieneneminen jatkuu ${h.eur(TT.pienenemisen_ylaraja)} asti. Käytännössä jokaisesta lisäeurosta menee kaksi senttiä enemmän veroa kuin asteikko antaisi olettaa. ${h.eur(48000)} palkalla marginaalivero on ${h.pct(M48.m, 1)}, josta työtulovähennyksen osuus on ${h.pct(M48.ttv, 1)}. Kun pieneneminen päättyy, ${h.eur(54000)} palkalla marginaalivero putoaa ${h.pct(M54.m, 1)} tasolle, kunnes ${h.a('valtion-tuloveroasteikko', 'valtion asteikon')} ylin porras ${h.num(TOP.prosentti, 2)} % alkaa ${h.eur(TOP.alaraja)} verotettavasta tulosta.</p>
<h3>Suuret tulot: tasainen katto</h3>
<p>Ylimmällä portaalla marginaalivero on Helsingissä ${h.pct(M60.m, 1)} kaikilla tuloilla. Mikään vähennys ei enää pienene, perusvähennys on poistunut ja Yle-vero on täynnä, joten jokainen lisäeuro jakautuu samalla tavalla. Tämä on palkkatulon korkein marginaalivero; pääomatuloja verotetaan omalla asteikollaan.</p>
<h2>Bonus, lomaraha ja ylityö</h2>
<p>Kertaluonteinen erä verotetaan samalla marginaaliverolla kuin palkankorotus, koska verotus katsoo koko vuoden tuloa. ${h.eur(48000)} vuodessa ansaitsevalle maksettu ${h.eur(BONUS)} bonus nostaa nettotuloa ${h.eur(BONUS_NETTO)}, eli käteen jää ${h.pct(BONUS_NETTO / BONUS, 1)}. Palkanmaksuhetkellä pidätys voi näyttää tätä suuremmalta, jos bonus ylittää verokortin tulorajan ja siitä pidätetään lisäprosentti, mutta liika pidätys palautuu verotuksessa. Ylityökorvaus toimii samoin: ${h.eur(YLI)} ylityöstä jää ${h.eur(48000)} palkalla käteen noin ${h.eur(YLI * (1 - M48.m))}.</p>
<h2>Sivutyö pienellä päätulolla</h2>
<p>Pienituloiselle lisätyö on verotuksellisesti edullisempaa kuin keskituloiselle, mutta ei niin edullista kuin ensimmäiset eurot. Jos ${h.eur(20000)} vuodessa ansaitseva tekee sivutyötä ${h.eur(5000)} edestä, nettotulo kasvaa ${h.eur(SIVU_NETTO)}, eli lisätyöstä jää käteen ${h.pct(SIVU_NETTO / 5000, 1)}. Tällä tulovälillä työtulovähennyksen ylijäämä loppuu ja kunnallisvero alkaa kertyä, joten keskimääräinen marginaalivero on taulukon kahden ensimmäisen rivin välissä. Jos sivutyöstä pidätetään vero samalla perusprosentilla kuin päätyöstä, jäännösveroa voi tulla, vaikka marginaalivero itsessään olisi kohtuullinen.</p>
<h2>Kotikunta ja kirkko</h2>
<p>Kunnallisvero lisää marginaaliveroa lähes oman prosenttinsa verran. Helsingin ${h.num(HKI, 2)} % on maan matalimpia, joten muualla luvut ovat suurempia: Tampereella, jossa kunnallisvero on ${h.num(TRE, 2)} %, ${h.eur(48000)} palkan marginaalivero on ${h.pct(M48T.m, 1)}. Kirkon jäsenyys lisää seurakunnan prosentin. Ero näkyy suoraan siinä, paljonko korotuksesta jää käteen, ja muuttoa harkitsevan kannattaa laskea molemmat.</p>
<p>Kunnallisveron vaikutus ei ole aivan yhtä suuri kuin sen prosentti, koska kunnallisvero lasketaan verotettavasta tulosta, josta työeläke-, työttömyysvakuutus- ja päivärahamaksu on jo vähennetty. Lisäeurosta kunnallisvero osuu siis vain noin ${h.num(100 - MAKSUT - V.paivarahamaksu_prosentti, 0)} senttiin. Sama koskee valtionveroa: asteikon ${h.num(TOP.prosentti, 2)} % ei tarkoita, että lisäeurosta menisi valtiolle täsmälleen niin paljon, vaan hieman vähemmän. Taulukon sarakkeet näyttävät todelliset osuudet.</p>
<h2>Marginaalivero palkkaneuvottelussa</h2>
<p>Kun neuvottelet palkasta, ajattele korotusta nettona. ${h.eur(KK)} kuukausipalkalla ${h.eur(KOR)} korotus tuo käteen noin ${h.eur(KOR_KATEEN)} kuukaudessa. Jos vaihtoehtona on verovapaa etu, kuten tietyt henkilökuntaedut, sen arvo kannattaa verrata korotuksen nettoarvoon eikä bruttoarvoon. Samaa logiikkaa voi käyttää toiseen suuntaan: ${h.a('bruttopalkka-laskuri', 'bruttopalkkalaskuri')} kertoo, kuinka suuri bruttokorotus tarvitaan tiettyyn nettolisään, ja ${h.a('nettopalkka-5000', 'nettopalkka 5000 euron palkasta')} näyttää ylemmän tulotason tilanteen.</p>
<p>Marginaalivero vaikuttaa myös vähennysten arvoon. Työmatkakulujen tai jäsenmaksujen vähennys säästää veroa suunnilleen marginaaliveron verran, mutta vain verojen osalta: työeläke- ja työttömyysvakuutusmaksu lasketaan bruttopalkasta, joten vähennykset eivät pienennä niitä.</p>`,
  },
  en: {
    slug: 'marginal-tax-rate',
    nav: 'Marginal tax rate',
    card: 'How much of a pay rise you keep at each salary level in 2026, and why the earned income credit raises the marginal rate.',
    title: 'Marginal tax rate 2026: how much of a pay rise you keep',
    description: `Marginal tax rate 2026 in Finland: tax and contributions take up to ${EN.pct(MAX, 0)} of each extra euro, and the shrinking earned income credit above ${EN.eur(TT.pienenemisraja)} adds to it.`,
    h1: 'Finnish marginal tax rate',
    intro: 'Your marginal tax rate is the share of your next euro of salary that goes to tax and contributions, and it is always well above your tax card percentage.',
    resume: `The marginal tax rate (marginaalivero) is the share of a pay rise lost to tax and employee contributions. In 2026 an employee in Helsinki earning ${EN.eur(48000)} a year loses ${EN.pct(M48.m, 1)} of every extra euro, even though their tax card shows only ${EN.num(M48.a.veroprosentti, 1)}%. The card rate is an average over all your income; the marginal rate applies to the last euro, which is hit by the highest state tax bracket you reach, municipal tax, health insurance contributions and the ${EN.num(MAKSUT, 2)}% pension and unemployment contributions. Between ${EN.eur(TT.pienenemisraja)} and ${EN.eur(TT.pienenemisen_ylaraja)} of net earned income the earned income tax credit (työtulovähennys) shrinks by ${EN.p(TT.pienenemisprosentti, 0)} of each extra euro, adding about two points. That is why the marginal rate at ${EN.eur(48000)} is higher than at ${EN.eur(54000)} (${EN.pct(M54.m, 1)}). Once taxable income passes ${EN.eur(TOP.alaraja)} it reaches ${EN.pct(M60.m, 1)} in Helsinki and stays there. Municipality matters: in Tampere the same ${EN.eur(48000)} salary has a marginal rate of ${EN.pct(M48T.m, 1)}.`,
    faqs: [
      { q: 'How much of a €200 monthly raise will I actually keep in Finland?', a: `On ${EN.eur(KK)} a month in Helsinki, a ${EN.eur(KOR)} raise leaves about ${EN.eur(KOR_KATEEN)} extra a month, ${EN.eur(KOR_KATEEN * 12)} a year. The rest goes to state and municipal tax, health insurance contributions and the pension and unemployment contributions. Your tax card moves from ${EN.num(KA.veroprosentti, 1)}% to ${EN.num(KB.veroprosentti, 1)}%, but the share of the raise you lose is much higher than either figure.` },
      { q: 'Why is my marginal tax rate higher than my tax card percentage?', a: `Because the card shows your average rate over the year, including the euros taxed lightly or not at all thanks to the basic deduction and the earned income credit. The marginal rate measures only the next euro. At ${EN.eur(48000)} in Helsinki the card says ${EN.num(M48.a.veroprosentti, 1)}% while the marginal rate, contributions included, is ${EN.pct(M48.m, 1)}.` },
      { q: 'What is the top marginal tax rate on salary in Finland?', a: `On wages it peaks once taxable income passes ${EN.eur(TOP.alaraja)}, where state tax reaches ${EN.p(TOP.prosentti, 2)}. In Helsinki the total marginal rate is then ${EN.pct(M60.m, 1)}; municipalities with higher local tax push it higher, and church members add their parish rate. There is no further bracket for earned income above that point.` },
      { q: 'How much of a bonus do I keep after tax in Finland?', a: `The same share as of a raise, because the assessment looks at your whole year. A ${EN.eur(BONUS)} bonus on top of ${EN.eur(48000)} in Helsinki adds ${EN.eur(BONUS_NETTO)} to net income, ${EN.pct(BONUS_NETTO / BONUS, 1)} of the gross. Your payslip may show more withheld if the bonus pushes you over your income limit, but any excess comes back as a refund.` },
      { q: 'What is the marginal tax rate on €3,000 a month in Finland?', a: `${EN.eur(3000)} a month is ${EN.eur(36000)} a year. In Helsinki the marginal rate there is ${EN.pct(M36.m, 1)}, so ${EN.eur(100)} more gross pay leaves about ${EN.eur(100 * (1 - M36.m))}. You are already in the band where the earned income credit shrinks, which accounts for ${EN.pct(M36.ttv, 1)} of it.` },
      { q: 'Should I count the pension contribution as part of my marginal tax?', a: `For take-home pay, yes: the ${EN.p(V.tyoelakemaksu_prosentti)} pension and ${EN.p(V.tyottomyysvakuutusmaksu_prosentti)} unemployment contributions take ${EN.num(MAKSUT, 2)} cents of every extra euro. Unlike tax, though, the pension contribution buys future pension, as each euro of pay accrues entitlement. Strictly speaking the tax-only marginal rate is about ${EN.num(MAKSUT, 0)} points lower than the figures on this page.` },
    ],
    body: (h) => `
<h2>Marginal rates by salary</h2>
<p>The table compares net income on two salaries ${h.eur(D)} apart, using the site’s tax engine. It includes every employee tax and contribution: state tax on ${h.src('vero_asteikko', 'the 2026 scale')}, Helsinki municipal tax of ${h.num(HKI, 2)}% from ${h.src('vero_kunnat', 'Vero’s municipal rates')}, the health care and daily allowance contributions, Yle tax, and the pension and unemployment contributions. Church tax is left out.</p>
${h.table(['Annual salary', 'Marginal rate', 'State tax', 'Municipal tax', 'Contributions and Yle', 'Lost earned income credit'], TASOT.map(({ t, r }) => [h.eur(t), h.pct(r.m, 1), h.pct(r.valtio, 1), h.pct(r.kunta, 1), h.pct(r.maksut, 1), h.pct(r.ttv, 1)]), `Share of the next ${h.eur(D)} of pay, Helsinki, 2026`, ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The state tax column already includes the lost earned income credit, since the credit is taken off state tax first; the last column shows that part on its own.</p>
<h3>Low pay: the credit shields you</h3>
<p>At ${h.eur(20000)} the marginal rate is just ${h.pct(M20.m, 1)}. The earned income credit is at its maximum and large enough to cancel both state and municipal tax, so an extra euro only bears contributions and Yle tax. By ${h.eur(25000)} the surplus credit is used up and municipal tax starts to bite, lifting the rate to ${h.pct(M25.m, 1)}. The basic deduction also phases out over this range, which makes municipal tax on the extra euro heavier than the municipal rate alone.</p>
<h3>Middle incomes: the two-point hump</h3>
<p>Once net earned income passes ${h.eur(TT.pienenemisraja)}, the ${h.a('tyotulovahennys', 'earned income credit')} shrinks by ${h.num(TT.pienenemisprosentti, 0)}% of extra income until ${h.eur(TT.pienenemisen_ylaraja)}. Each additional euro therefore costs two cents more than the scale suggests. At ${h.eur(48000)} the marginal rate is ${h.pct(M48.m, 1)}, of which the lost credit is ${h.pct(M48.ttv, 1)}. When the phase-out ends, the rate at ${h.eur(54000)} drops to ${h.pct(M54.m, 1)}, until the top step of the ${h.a('valtion-tuloveroasteikko', 'state tax scale')}, ${h.num(TOP.prosentti, 2)}%, starts at ${h.eur(TOP.alaraja)} of taxable income.</p>
<h3>High pay: a flat ceiling</h3>
<p>On the top step the marginal rate in Helsinki is ${h.pct(M60.m, 1)} at any salary: no deduction is still shrinking, the basic deduction is gone and the Yle tax is capped. That is the highest marginal rate on earned income; capital income has its own scale.</p>
<h2>Bonus, holiday bonus and overtime</h2>
<p>One-off payments are taxed at the same marginal rate as a raise, since tax is assessed on the whole year. A ${h.eur(BONUS)} bonus on ${h.eur(48000)} lifts net income by ${h.eur(BONUS_NETTO)}, or ${h.pct(BONUS_NETTO / BONUS, 1)} of the gross. ${h.eur(YLI)} of overtime at the same salary leaves about ${h.eur(YLI * (1 - M48.m))}. If the payment takes you past the income limit on your tax card, the additional rate is withheld and the payslip looks worse than this, but the difference is refunded after the assessment.</p>
<h2>A side job on a small main income</h2>
<p>If you earn ${h.eur(20000)} and take on ${h.eur(5000)} of extra work, net income rises by ${h.eur(SIVU_NETTO)}, so you keep ${h.pct(SIVU_NETTO / 5000, 1)}. Across this range the surplus credit runs out and municipal tax kicks in, so the average marginal rate sits between the first two rows of the table.</p>
<h2>Where you live</h2>
<p>Municipal tax adds almost its full rate to your marginal tax. Helsinki’s ${h.num(HKI, 2)}% is among the lowest in the country; in Tampere, at ${h.num(TRE, 2)}%, the marginal rate on ${h.eur(48000)} is ${h.pct(M48T.m, 1)}. Church members add their parish rate on top.</p>
<h2>Using it when you negotiate</h2>
<p>Think of a raise in net terms. On ${h.eur(KK)} a month, ${h.eur(KOR)} more brings about ${h.eur(KOR_KATEEN)} into your account. If you are offered a tax-free staff benefit instead, compare its value with the net raise, not the gross one. The ${h.a('bruttopalkka-laskuri', 'gross salary calculator')} works backwards from the net increase you want, and ${h.a('nettopalkka-5000', 'net pay on €5,000 a month')} shows a higher-income example. Deductions such as commuting costs or union fees save tax at roughly your marginal tax rate minus the contributions, because the pension and unemployment contributions are charged on gross pay and no deduction reduces them.</p>`,
  },
});
