import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot } from '../../lib/engine/vero';

const V = P.vero;
const TT = V.tyotulovahennys;
/** Ikäraja luetaan parametrin avaimesta (yli65_korotus). */
const IKA = Number(Object.keys(TT).find((k) => k.startsWith('yli'))!.replace(/\D/g, ''));
const SYNTYNYT = P.year - IKA - 1;
const TAYSI_PALKKA = TT.enimmaismaara / (TT.prosentti / 100);
const MAX_PIEN = (TT.pienenemisen_ylaraja - TT.pienenemisraja) * TT.pienenemisprosentti / 100;
const LATTIA = TT.enimmaismaara - MAX_PIEN;
const hk = (tulo: number, o: { lapset?: number; ainoaHuoltaja?: boolean; ika?: number } = {}) => laskeVerot({ tulo, kunta: 'Helsinki', ...o });

const TAULU = [10000, 20000, 30000, 45000, 60000].map((t) => ({
  t,
  perus: hk(t).tyotulovahennys,
  lapset: hk(t, { lapset: 2 }).tyotulovahennys,
  yksin: hk(t, { lapset: 2, ainoaHuoltaja: true }).tyotulovahennys,
  ika: hk(t, { ika: IKA + 2 }).tyotulovahennys,
}));
const P42 = hk(42000);
const K40 = hk(40000), K45 = hk(45000);
const KESA = hk(6000, { ika: 19 });
const L42 = hk(42000, { lapset: 2 });
const M20 = hk(20000);
const M20_MUUT = M20.valtionveroEnnen + M20.verotettava * (M20.kunta.kunta + V.sairaanhoitomaksu_palkka_prosentti) / 100;

export default definePage({
  id: 'tyotulovahennys',
  group: 'vero',
  order: 50,
  mini: 'tyotulovahennys',
  related: ['valtion-tuloveroasteikko', 'perusvahennys', 'veroprosenttilaskuri', 'nettopalkka-4000'],
  sources: ['finlex_tvl', 'vero_ennakonpidatys'],
  fi: {
    slug: 'tyotulovahennys',
    nav: 'Työtulovähennys',
    card: 'Työtulovähennys 2026: enimmäismäärä, lapsikorotus, ikääntyneen korotus ja miten vähennys pienenee suurilla tuloilla.',
    title: 'Työtulovähennys 2026: enimmäismäärä, lapset ja pieneneminen',
    description: `Työtulovähennys 2026 on ${FI.num(TT.prosentti)} % työtulosta, enintään ${FI.eur(TT.enimmaismaara)}, lapsista korotus ja pieneneminen ${FI.eur(TT.pienenemisraja)} tulon jälkeen. Laske oma vähennyksesi minilaskurilla.`,
    h1: 'Työtulovähennys 2026',
    intro: 'Työtulovähennys pienentää palkansaajan veroja suoraan euroina. Näin se lasketaan ja kenelle se kasvaa.',
    resume: `Työtulovähennys on vuonna 2026 ${FI.num(TT.prosentti)} % palkasta ja muusta työtulosta, enintään ${FI.eur(TT.enimmaismaara)}, ja se vähennetään suoraan veroista eikä tulosta. Täyden määrän saa noin ${FI.eur(TAYSI_PALKKA)} vuosipalkalla. Kun puhdas ansiotulo ylittää ${FI.eur(TT.pienenemisraja)}, vähennys pienenee ${FI.num(TT.pienenemisprosentti)} % ylittävästä osasta, mutta pieneneminen loppuu ${FI.eur(TT.pienenemisen_ylaraja)} tuloon, joten kaikkein suurituloisimmankin vähennys on ${FI.eur(LATTIA)}. Enimmäismäärä nousee ${FI.eur(TT.lapsikorotus)} jokaisesta alaikäisestä lapsesta, jonka huoltaja olet vuoden lopussa, ja ainoalla huoltajalla korotus on kaksinkertainen. Ennen verovuoden alkua ${IKA} vuotta täyttäneen enimmäismäärä on ${FI.eur(TT.yli65_korotus)} suurempi. Vähennys tehdään ensin valtion tuloverosta, ja jos se ei riitä, loput vähennetään kunnallisverosta, sairaanhoitomaksusta ja kirkollisverosta niiden suhteessa. Helsinkiläisellä ${FI.eur(42000)} palkansaajalla vähennys on ${FI.eur(P42.tyotulovahennys)}, ja kahden lapsen huoltajalla ${FI.eur(L42.tyotulovahennys)}. Verokortti ottaa vähennyksen ja korotukset huomioon jo ennakonpidätyksessä, joten ne näkyvät jokaisessa palkassa.`,
    faqs: [
      { q: 'Paljonko työtulovähennys on 2026 suurimmillaan?', a: `Perusmäärä on enintään ${FI.eur(TT.enimmaismaara)}. Kahden lapsen huoltajalla katto on ${FI.eur(TT.enimmaismaara + 2 * TT.lapsikorotus)} ja ainoalla huoltajalla ${FI.eur(TT.enimmaismaara + 4 * TT.lapsikorotus)}. Ennen vuotta ${P.year} ${IKA} vuotta täyttänyt saa lisäksi ${FI.eur(TT.yli65_korotus)}. Katto saavutetaan vasta, kun ${FI.num(TT.prosentti)} % työtuloista riittää siihen; ilman korotuksia se tapahtuu noin ${FI.eur(TAYSI_PALKKA)} palkalla.` },
      { q: 'Missä tuloissa työtulovähennys alkaa pienentyä?', a: `Kun puhdas ansiotulo ylittää ${FI.eur(TT.pienenemisraja)}, vähennys pienenee ${FI.num(TT.pienenemisprosentti)} % ylittävästä osasta. Pieneneminen päättyy ${FI.eur(TT.pienenemisen_ylaraja)} puhtaaseen ansiotuloon, joten se voi olla enintään ${FI.eur(MAX_PIEN)}. Sitä suuremmilla tuloilla vähennys pysyy ${FI.eur(LATTIA)} eurossa, vaikka palkka kasvaisi kuinka paljon tahansa.` },
      { q: 'Saako työtulovähennystä työttömyyspäivärahasta tai eläkkeestä?', a: `Ei saa. Vähennys lasketaan palkasta ja muista työtuloista, kuten työkorvauksesta, käyttökorvauksesta ja yrittäjän ansiotulo-osuudesta. Etuudet ja eläkkeet eivät kerrytä sitä. Jos teet töitä vain osan vuotta, vähennys on ${FI.num(TT.prosentti)} % niistä palkoista, esimerkiksi ${FI.eur(10000)} palkasta ${FI.eur(TAULU[0].perus)}, vaikka muita tuloja olisi enemmän.` },
      { q: 'Pitääkö työtulovähennyksen lapsikorotus hakea erikseen?', a: `Ei tarvitse. Korotus kuuluu jokaisesta alaikäisestä lapsesta, jonka huoltaja olet verovuoden päättyessä, ${FI.eur(TT.lapsikorotus)} lasta kohden, ja Verohallinnon päätöksen mukaan se otetaan huomioon jo ennakonpidätyksessä. Ainoa huoltaja saa kaksinkertaisen korotuksen, jos hänellä ei ole puolisoa. Kahden lapsen huoltajan vero on ${FI.eur(42000)} palkalla ${FI.eur(P42.verot - L42.verot)} pienempi.` },
      { q: 'Miksi pienellä palkalla työtulovähennys ei näy kokonaan?', a: `Koska vähennys ei voi olla suurempi kuin verot, joista se tehdään. ${FI.eur(20000)} palkalla Helsingissä vähennys olisi ${FI.eur(M20.tyotulovahennys)}, mutta valtion vero, kunnallisvero ja sairaanhoitomaksu ovat yhteensä vain noin ${FI.eur(M20_MUUT)}. Ylijäämä jää käyttämättä. Yle-veroa ja päivärahamaksua vähennys ei pienennä lainkaan.` },
      { q: 'Saako yrittäjä työtulovähennystä?', a: `Saa, siltä osin kuin tulo on työtuloa. Päätöksen mukaan vähennys lasketaan myös jaettavan yritystulon ansiotulo-osuudesta, yhtymän osakkaan elinkeinotoiminnan tai maatalouden ansiotulo-osuudesta, työkorvauksista ja ansiotulona verotettavasta osingosta. Laskusäännöt ovat samat kuin palkansaajalla: ${FI.num(TT.prosentti)} %, enintään ${FI.eur(TT.enimmaismaara)} ja pieneneminen ${FI.eur(TT.pienenemisraja)} puhtaan ansiotulon jälkeen.` },
    ],
    body: (h) => `
<h2>Kolme lukua: prosentti, katto ja pieneneminen</h2>
<p>Työtulovähennys rakentuu kolmesta osasta. Ensin lasketaan ${h.num(TT.prosentti)} % työtuloista. Sitten tulos rajataan enimmäismäärään, joka on ${h.eur(TT.enimmaismaara)} ja kasvaa lapsista ja iästä. Lopuksi vähennyksestä otetaan pois ${h.num(TT.pienenemisprosentti)} % siitä puhtaan ansiotulon osasta, joka ylittää ${h.eur(TT.pienenemisraja)} mutta jää alle ${h.eur(TT.pienenemisen_ylaraja)}. Ensimmäinen vaihe lasketaan bruttotyötulosta, viimeinen puhtaasta ansiotulosta, eli tulonhankkimisvähennyksen ja muiden luonnollisten vähennysten jälkeen.</p>
${h.table(['Vuosipalkka', 'Perusvähennys ilman lapsia', 'Kaksi lasta', 'Kaksi lasta, ainoa huoltaja', `Täyttänyt ${h.num(IKA)} v.`],
  TAULU.map((x) => [h.eur(x.t), h.eur(x.perus), h.eur(x.lapset), h.eur(x.yksin), h.eur(x.ika)]),
  'Työtulovähennys euroina vuonna 2026, Helsinki', ['l', 'r', 'r', 'r', 'r'])}
<p>Taulukon pienimmällä palkalla kaikki sarakkeet ovat samat, koska ${h.num(TT.prosentti)} % palkasta jää alle jokaisen katon: korotukset auttavat vasta, kun tulo riittää niiden täyttämiseen. Ilman korotuksia täysi vähennys saavutetaan noin ${h.eur(TAYSI_PALKKA)} palkalla, ja kahden lapsen huoltajalla vähän myöhemmin.</p>

<h2>Pieneneminen loppuu ${h.eur(TT.pienenemisen_ylaraja)} tuloon</h2>
<p>Vuoden 2026 säännöissä pienenemisellä on yläraja. Puhtaan ansiotulon ${h.eur(TT.pienenemisraja)} ja ${h.eur(TT.pienenemisen_ylaraja)} välillä jokainen lisäeuro vie vähennyksestä ${h.num(TT.pienenemisprosentti)} senttiä, mutta sen jälkeen vähennys ei enää pienene. Enimmäispieneneminen on ${h.eur(MAX_PIEN)}, joten perusmuotoinen vähennys on suurituloisellakin ${h.eur(LATTIA)}. Korotukset lapsista ja iästä lisätään enimmäismäärään ennen pienenemistä, joten ne säilyvät täysimääräisinä myös suurilla tuloilla.</p>
<p>Pienenemisvälillä vähennys toimii käytännössä ${h.num(TT.pienenemisprosentti)} prosenttiyksikön lisäverona. Se on yksi syy siihen, että keskituloisen ${h.a('valtion-tuloveroasteikko', 'valtion tuloveroasteikon')} prosentti ei yksin kerro, paljonko palkankorotuksesta jää käteen.</p>

<p>Käytännössä pieneneminen näkyy palkankorotuksessa. Kun helsinkiläisen palkka nousee ${h.eur(40000)} eurosta ${h.eur(45000)} euroon, työtulovähennys pienenee ${h.eur(K40.tyotulovahennys)} eurosta ${h.eur(K45.tyotulovahennys)} euroon, eli korotuksesta menee vähennyksen pienenemiseen ${h.eur(K40.tyotulovahennys - K45.tyotulovahennys)} ennen kuin yhtäkään asteikon veroa on laskettu.</p>

<h2>Mistä verosta vähennys tehdään</h2>
<p>Työtulovähennys tehdään ennen muita verosta tehtäviä vähennyksiä ja ensisijaisesti valtion tuloverosta. Jos valtion vero ei riitä, ylimenevä osa vähennetään kunnallisverosta, sairaanhoitomaksusta ja kirkollisverosta niiden suhteessa. Yle-veroa ja päivärahamaksua se ei koske. Helsingissä ${h.eur(20000)} vuosipalkalla asteikon mukainen valtion vero on ${h.eur(M20.valtionveroEnnen)}, ja ${h.eur(M20.tyotulovahennys)} vähennys pyyhkii sen kokonaan ja vie lisäksi kunnallisveron ja sairaanhoitomaksun. Jäljelle jäävät vain Yle-vero ${h.eur(M20.yle)} ja päivärahamaksu ${h.eur(M20.paivarahamaksu)}.</p>
<p>Tämä selittää, miksi pienipalkkaisen veroprosentti on lähellä nollaa ja miksi lisäprosentti on samaan aikaan korkea: kun tulot kasvavat, vähennys ei enää kasva, ja jokainen lisäeuro verotetaan täysimääräisesti. Myös ${h.a('perusvahennys', 'perusvähennys')} pienenee samalla tulovälillä, mikä jyrkentää efektiä.</p>

<h2>Kenelle vähennys kuuluu</h2>
<ul>
<li>Palkansaajille sekä työkorvauksen, käyttökorvauksen ja ansiotulona verotettavan osingon saajille.</li>
<li>Yrittäjille jaettavan yritystulon ansiotulo-osuudesta ja yhtymän osakkaille vastaavasti.</li>
<li>Ei etuuksista eikä eläkkeistä: työttömyyspäiväraha, vanhempainraha ja eläke eivät kerrytä vähennystä, vaikka ne ovat ansiotuloa.</li>
</ul>
<p>Ikäkorotus koskee niitä, jotka ovat täyttäneet ${h.num(IKA)} vuotta ennen verovuoden alkua, eli vuonna ${SYNTYNYT} tai aiemmin syntyneitä. Työtä tekevä eläkeläinen saa sen palkastaan, vaikka eläke ei vähennystä kerrytä.</p>

<h2>Molemmat huoltajat ja kesätyöntekijät</h2>
<p>Lapsikorotus ei ole jaettava etu. Se kuuluu jokaiselle, joka on lapsen huoltaja verovuoden päättyessä, joten kahden huoltajan perheessä kumpikin saa korotuksen omaan vähennykseensä, jos omat työtulot riittävät sen täyttämiseen. Ainoan huoltajan kaksinkertainen korotus koskee henkilöä, jolla ei ole puolisoa.</p>
<p>Kesätyössä työtulovähennys on usein koko vuoden tärkein vähennys. ${h.eur(6000)} kesäpalkasta vähennys on ${h.eur(KESA.tyotulovahennys)}, ja yhdessä perusvähennyksen kanssa se vie veron nollaan: veroa jää ${h.eur(KESA.verot)}. Työeläke- ja työttömyysvakuutusmaksu pidätetään silti, koska ne eivät ole veroja eikä vähennys koske niitä.</p>

<h2>Verokortissa ja nettopalkassa</h2>
<p>Verohallinto ottaa työtulovähennyksen huomioon jo verokortin prosentissa, joten se näkyy jokaisessa palkassa eikä vasta veronpalautuksessa. ${h.eur(42000)} palkalla ilman lapsia vähennys on ${h.eur(P42.tyotulovahennys)}, noin ${h.eur(P42.tyotulovahennys / 12)} kuukaudessa. Kahden lapsen huoltajalla vero on samalla palkalla ${h.eur(P42.verot - L42.verot)} pienempi. Oman summan voi kokeilla yllä olevalla minilaskurilla, ja koko nettopalkan esimerkiksi sivulla ${h.a('nettopalkka-4000', `nettopalkka ${h.eur(4000)}`)} tai ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurilla')}.</p>
<p>Vähennyksen merkitys näkyy parhaiten vertaamalla. Ilman työtulovähennystä ${h.eur(42000)} palkansaajan vero olisi ${h.eur(P42.tyotulovahennys)} suurempi, ja verokortin prosentti olisi noin ${h.num(P42.tyotulovahennys / 42000 * 100, 1)} prosenttiyksikköä korkeampi kuin nyt. Se on suurempi kuin moni kunnallisveron ero kuntien välillä. Vähennys on myös syy siihen, että palkka ja samansuuruinen etuus verotetaan eri tavalla: etuudesta vähennystä ei saa, joten esimerkiksi työttömyyspäivärahan veroprosentti on samalla vuositulolla selvästi palkan veroprosenttia korkeampi.</p>
<p>Tulo, josta ${h.num(TT.prosentti)} % lasketaan, on bruttotyötulo ilman mitään vähennyksiä. Pienenemisessä käytetty puhdas ansiotulo on taas tulo tulonhankkimisvähennyksen, työmatkakulujen ja muiden luonnollisten vähennysten jälkeen, ja siihen lasketaan myös muut ansiotulot, kuten etuudet ja eläke. Siksi palkan ohella saatu etuus voi pienentää työtulovähennystä, vaikka se ei itse kerrytä sitä.</p>
<p>Lähteet: ${h.src('finlex_tvl')}; ${h.src('vero_ennakonpidatys')}.</p>`,
  },
  en: {
    slug: 'earned-income-tax-credit',
    nav: 'Earned income tax credit',
    card: 'The 2026 earned income tax credit: maximum, child and age top-ups, and how it tapers on higher pay.',
    title: 'Earned Income Tax Credit 2026: Maximum, Children, Phase-Out',
    description: `Earned income tax credit 2026 in Finland: ${EN.num(TT.prosentti)}% of work income up to ${EN.eur(TT.enimmaismaara)}, child top-ups and a taper above ${EN.eur(TT.pienenemisraja)}. Work out your own credit in seconds.`,
    h1: 'Earned income tax credit 2026',
    intro: 'The earned income tax credit (työtulovähennys) cuts an employee’s tax bill euro for euro. How it is calculated and who gets more.',
    resume: `The earned income tax credit (työtulovähennys) is ${EN.num(TT.prosentti)}% of your wages and other work income in 2026, capped at ${EN.eur(TT.enimmaismaara)}, and it comes off your tax rather than your income. You reach the full amount at a salary of about ${EN.eur(TAYSI_PALKKA)}. Once net earned income passes ${EN.eur(TT.pienenemisraja)}, the credit shrinks by ${EN.num(TT.pienenemisprosentti)}% of the excess, but the taper stops at ${EN.eur(TT.pienenemisen_ylaraja)}, so even the highest earners keep ${EN.eur(LATTIA)}. The cap rises by ${EN.eur(TT.lapsikorotus)} for each child under 18 in your custody at the end of the year, doubled for a sole guardian, and by ${EN.eur(TT.yli65_korotus)} if you turned ${IKA} before the tax year began. The credit is set against state income tax first; anything left over reduces municipal tax, the health care contribution and church tax in proportion. In Helsinki, a ${EN.eur(42000)} salary gives a credit of ${EN.eur(P42.tyotulovahennys)}, or ${EN.eur(L42.tyotulovahennys)} with two children. Vero builds it into your tax card rate automatically, so you see it in every payslip rather than as a refund.`,
    faqs: [
      { q: 'What is the maximum earned income tax credit in Finland for 2026?', a: `The base maximum is ${EN.eur(TT.enimmaismaara)}. With two children the cap is ${EN.eur(TT.enimmaismaara + 2 * TT.lapsikorotus)}, and ${EN.eur(TT.enimmaismaara + 4 * TT.lapsikorotus)} for a sole guardian. Anyone who turned ${IKA} before ${P.year} adds ${EN.eur(TT.yli65_korotus)}. The cap only binds once ${EN.num(TT.prosentti)}% of your work income reaches it, which without top-ups happens around ${EN.eur(TAYSI_PALKKA)} of salary.` },
      { q: 'At what income does the earned income credit start to shrink?', a: `Above ${EN.eur(TT.pienenemisraja)} of net earned income, the credit drops by ${EN.num(TT.pienenemisprosentti)}% of the excess. The taper ends at ${EN.eur(TT.pienenemisen_ylaraja)}, so the most it can fall is ${EN.eur(MAX_PIEN)}. Beyond that the credit stays at ${EN.eur(LATTIA)} however much you earn, plus any child or age top-up you qualify for.` },
      { q: 'Do I get the earned income credit on unemployment benefit or a pension?', a: `No. It is calculated on wages and other work income such as fees for work, royalties and the earned-income share of business profits. Benefits and pensions do not count, even though they are taxed as earned income. If you worked only part of the year, the credit is ${EN.num(TT.prosentti)}% of that pay: ${EN.eur(TAULU[0].perus)} on ${EN.eur(10000)}.` },
      { q: 'Why does my small salary not get the full earned income credit?', a: `A credit cannot exceed the taxes it is deducted from. On ${EN.eur(20000)} in Helsinki the credit would be ${EN.eur(M20.tyotulovahennys)}, but state tax, municipal tax and the health care contribution total only about ${EN.eur(M20_MUUT)}. The surplus is simply lost. The Yle tax and the daily allowance contribution are never reduced by it, which is why your tax is not quite zero.` },
    ],
    body: (h) => `
<h2>Rate, cap, taper</h2>
<p>Finland’s earned income credit works in three steps. Take ${h.num(TT.prosentti)}% of your gross work income. Limit the result to the maximum, ${h.eur(TT.enimmaismaara)} plus any child or age top-up. Then subtract ${h.num(TT.pienenemisprosentti)}% of the part of your net earned income between ${h.eur(TT.pienenemisraja)} and ${h.eur(TT.pienenemisen_ylaraja)}. The first step uses gross pay, the taper uses net earned income, meaning after the work-expense deduction and similar deductions.</p>
${h.table(['Annual salary', 'No children', 'Two children', 'Two children, sole guardian', `Aged ${h.num(IKA)}+`],
  TAULU.map((x) => [h.eur(x.t), h.eur(x.perus), h.eur(x.lapset), h.eur(x.yksin), h.eur(x.ika)]),
  'Earned income tax credit in euros, 2026, Helsinki', ['l', 'r', 'r', 'r', 'r'])}
<p>At the lowest salary every column matches: ${h.num(TT.prosentti)}% of pay is below all the caps, so the top-ups only help once income is large enough to fill them.</p>

<h2>A taper with an end point</h2>
<p>Under the 2026 rules the taper has a ceiling. Between ${h.eur(TT.pienenemisraja)} and ${h.eur(TT.pienenemisen_ylaraja)} of net earned income each extra euro costs ${h.num(TT.pienenemisprosentti)} cents of credit; above that range nothing more is lost. The maximum reduction is ${h.eur(MAX_PIEN)}, leaving ${h.eur(LATTIA)} for high earners without top-ups. Child and age top-ups are added to the cap before the taper, so they survive in full at any income.</p>
<p>Inside the taper band the credit behaves like an extra ${h.num(TT.pienenemisprosentti)}-point tax on each raise. Combined with the ${h.a('valtion-tuloveroasteikko', 'state income tax scale')}, it explains why middle earners keep less of a raise than the bracket rate suggests.</p>

<p>You feel the taper when you get a raise. Going from ${h.eur(40000)} to ${h.eur(45000)} in Helsinki trims the credit from ${h.eur(K40.tyotulovahennys)} to ${h.eur(K45.tyotulovahennys)}, so ${h.eur(K40.tyotulovahennys - K45.tyotulovahennys)} of the raise is lost before any bracket rate is applied.</p>

<h2>Which taxes it reduces</h2>
<p>The credit is deducted before any other tax credits and goes against state income tax first. If state tax runs out, the rest is taken off municipal tax, the health care contribution and church tax in proportion to each. It never touches the Yle tax or the daily allowance contribution. On ${h.eur(20000)} in Helsinki, scale tax is ${h.eur(M20.valtionveroEnnen)}; the ${h.eur(M20.tyotulovahennys)} credit wipes it out and the municipal tax and health care contribution with it. What remains is the Yle tax of ${h.eur(M20.yle)} and the daily allowance contribution of ${h.eur(M20.paivarahamaksu)}.</p>
<p>That is why a low earner’s card rate sits near zero while the additional rate is high: once income outgrows the credit, each extra euro is taxed in full. The ${h.a('perusvahennys', 'basic deduction')} fades out over a similar range, which sharpens the effect.</p>

<h2>Who qualifies</h2>
<ul>
<li>Employees, and people paid fees for work, royalties or dividends taxed as earned income.</li>
<li>Entrepreneurs on the earned-income share of business profits, and partners in a partnership likewise.</li>
<li>Not benefits or pensions: unemployment allowance, parental allowance and pensions do not build up the credit.</li>
</ul>
<p>The age top-up applies if you turned ${h.num(IKA)} before the tax year started, which for 2026 means born in ${SYNTYNYT} or earlier. A working pensioner gets it on wages, though not on the pension itself.</p>

<h2>Both parents, and summer jobs</h2>
<p>The child top-up is not split between parents. Every person who is a guardian at the end of the year gets it on their own credit, provided their work income is large enough to fill it. On a ${h.eur(6000)} summer job the credit is ${h.eur(KESA.tyotulovahennys)}, and with the basic deduction it brings income tax down to ${h.eur(KESA.verot)}. Pension and unemployment insurance contributions are still deducted, since they are not taxes.</p>

<h2>On your tax card and payslip</h2>
<p>Because Vero builds the credit into your withholding rate, it reaches you monthly rather than as a lump sum. On ${h.eur(42000)} with no children it is ${h.eur(P42.tyotulovahennys)}, roughly ${h.eur(P42.tyotulovahennys / 12)} a month. A parent of two on the same pay owes ${h.eur(P42.verot - L42.verot)} less tax for the year. Try your own figures in the mini calculator above, or see a full payslip on ${h.a('nettopalkka-4000', `net salary on ${h.eur(4000)}`)}.</p>
<p>To see what the credit is worth, remove it: on ${h.eur(42000)} the tax bill would be ${h.eur(P42.tyotulovahennys)} higher and the card rate about ${h.num(P42.tyotulovahennys / 42000 * 100, 1)} points steeper. It is also why a benefit and a salary of the same size are taxed differently. Benefits earn no credit but still count in the net earned income that drives the taper, so a benefit received alongside wages can shrink the credit without adding to it.</p>
<p>Sources: ${h.src('finlex_tvl')}; ${h.src('vero_ennakonpidatys')}.</p>`,
  },
});
