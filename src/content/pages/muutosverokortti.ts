import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';

const V = P.vero;
const MAX = V.ennakonpidatys_enimmais_prosentti;
const v = (tulo: number) => laskeVerot({ tulo, kunta: 'Helsinki' });
/** Loppuvuoden prosentti: koko vuoden vero miinus jo pidätetty, jaettuna jäljellä olevalla palkalla, ylöspäin puoleen prosenttiin. */
const loppuvuosi = (vero: number, pidatetty: number, jaljella: number) => Math.min(MAX, Math.max(0, Math.ceil(((vero - pidatetty) / jaljella) * 200) / 2));

// 1. Palkankorotus heinäkuusta (minilaskurin oletus): 3 000 € → 3 800 € kuukaudessa, Helsinki.
const VANHA = 3000, UUSI = 3800, KK = 7;
const ENNEN = VANHA * (KK - 1), JALKEEN = UUSI * (13 - KK);
const R0 = v(VANHA * 12);
const R1 = v(ENNEN + JALKEEN);
const R_PID_VANHA = (ENNEN + JALKEEN) * R0.veroprosentti / 100;
const R_VAJAUS = R1.verot - R_PID_VANHA;
const R_UUSI = loppuvuosi(R1.verot, ENNEN * R0.veroprosentti / 100, JALKEEN);

// 2. Sivutyö: päätyö 3 000 €/kk koko vuoden, sivutyö 800 €/kk kymmenen kuukautta.
const PAA = 36000, SIVU = 800 * 10;
const S0 = v(PAA);
const S1 = v(PAA + SIVU);
const S_PID = (PAA + SIVU) * S0.veroprosentti / 100;
const S_LP = lisaprosentti(S0);

// 3. Osa-aikaan elokuusta: 3 500 €/kk seitsemän kuukautta, sitten 2 000 €/kk.
const O_TAYSI = 3500, O_OSA = 2000, O_KK = 7;
const O0 = v(O_TAYSI * 12);
const O_TULO = O_TAYSI * O_KK + O_OSA * (12 - O_KK);
const O1 = v(O_TULO);
const O_PID = O_TULO * O0.veroprosentti / 100;
const O_UUSI = loppuvuosi(O1.verot, O_TAYSI * O_KK * O0.veroprosentti / 100, O_OSA * (12 - O_KK));

// Sama korotus eri kuukausina: loppuvuoden prosentti.
const AJOITUS = [3, 7, 10].map((m) => {
  const e = VANHA * (m - 1), j = UUSI * (13 - m);
  return { m, uusi: loppuvuosi(v(e + j).verot, e * R0.veroprosentti / 100, j), vuosi: v(e + j).veroprosentti, raja: e + j };
});
const KUUT = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const RL = lisaprosentti(R1);

export default definePage({
  id: 'muutosverokortti',
  group: 'vero',
  order: 30,
  mini: 'muutos',
  related: ['verokortti', 'tuloraja', 'veroprosenttilaskuri', 'marginaalivero'],
  sources: ['vero_ennakonpidatys', 'vero_verokortti_en'],
  fi: {
    slug: 'muutosverokortti',
    nav: 'Muutosverokortti',
    card: 'Palkankorotus, sivutyö tai osa-aika kesken vuoden: milloin uusi verokortti kannattaa ja miten loppuvuoden prosentti lasketaan.',
    title: 'Muutosverokortti 2026: milloin uusi veroprosentti kannattaa',
    description: `Muutosverokortti 2026: kun palkka nousee, tulee sivutyö tai siirryt osa-aikaan, uusi prosentti lasketaan loppuvuoden palkoille. Kolme esimerkkiä euroina.`,
    h1: 'Muutosverokortti: uusi prosentti kesken vuoden',
    intro: 'Uusi verokortti korjaa pidätyksen, kun tulot muuttuvat kesken vuoden. Katso, milloin se kannattaa ja miksi loppuvuoden prosentti voi olla yllättävän suuri tai pieni.',
    resume: `Muutosverokortti kannattaa tilata, kun vuoden 2026 tulot poikkeavat selvästi siitä, mille nykyinen kortti on laskettu. Esimerkiksi helsinkiläisen palkka nousee heinäkuussa ${FI.eur(VANHA)} eurosta ${FI.eur(UUSI)} euroon kuukaudessa: vanha ${FI.num(R0.veroprosentti, 1)} %:n kortti pidättäisi koko vuonna ${FI.eur(R_PID_VANHA)}, mutta vero on ${FI.eur(R1.verot)}, joten vajausta kertyisi ${FI.eur(R_VAJAUS)}. Uusi kortti korjaa tämän loppuvuoden palkoista, ja siksi sen prosentti on ${FI.num(R_UUSI, 1)} % eikä koko vuoden keskimääräinen ${FI.num(R1.veroprosentti, 1)} %. Laskennassa koko vuoden arvioidusta verosta vähennetään jo pidätetty vero, ja jäljelle jäävä summa jaetaan loppuvuoden palkoille. Sama logiikka toimii toiseen suuntaan: kun tulot pienenevät, loppuvuoden prosentti voi pudota jopa nollaan. Uuden kortin voi tilata OmaVerossa milloin tahansa, ja se on voimassa vuoden loppuun tai seuraavaan muutokseen. Prosentti pyöristetään ylöspäin puolen prosenttiyksikön tarkkuudella, ja se on enintään ${FI.num(MAX)} %. Tavallisimmat syyt ovat palkankorotus, sivutyö, osa-aika, työttömyys ja perhevapaa.`,
    faqs: [
      { q: 'Miksi muutosverokortin prosentti on suurempi kuin koko vuoden veroprosentti?', a: `Koska se korjaa myös alkuvuoden. Jos alkuvuonna on pidätetty liian vähän, vaje kerätään loppuvuoden palkoista. Heinäkuun korotuksen esimerkissä koko vuoden prosentti olisi ${FI.num(R1.veroprosentti, 1)} %, mutta loppuvuoden kortille tulee ${FI.num(R_UUSI, 1)} %. Seuraavan vuoden automaattinen kortti lasketaan taas koko vuoden tulolle, joten korkea prosentti ei jää pysyväksi.` },
      { q: 'Kannattaako verokortti muuttaa, kun palkka nousee vain vähän?', a: `Ei aina. Jos korotus on pieni, tuloraja ja lisäprosentti hoitavat sen: Helsingissä ${FI.eur(PAA)} kortin lisäprosentti on ${FI.num(S_LP, 1)} %, ja se pidättää ylittävästä osasta yleensä riittävästi. Muutos kannattaa, kun korotus nostaa veroprosenttia vähintään puoli prosenttiyksikköä tai kun haluat välttää jäännösveron korot. Tarkista tilanne veroprosenttilaskurilla ennen tilausta.` },
      { q: 'Voiko veroprosentin laskea, jos siirryn osa-aikaiseksi?', a: `Voi, ja usein se kannattaa. Kun ${FI.eur(O_TAYSI)} kuukausipalkka putoaa elokuussa ${FI.eur(O_OSA)} euroon, vanha ${FI.num(O0.veroprosentti, 1)} %:n kortti pidättäisi vuodessa ${FI.eur(O_PID)}, vaikka vero on vain ${FI.eur(O1.verot)}. Uusi kortti loppuvuodelle on ${FI.num(O_UUSI, 1)} %, koska alkuvuonna pidätettiin jo enemmän kuin koko vuoden vero vaatii.` },
      { q: 'Tarvitseeko sivutyöhön oman verokortin?', a: `Sivutyön palkka pitää ottaa mukaan tulorajaan, koska työnantajat eivät näe toistensa maksuja. Jos ${FI.eur(PAA)} päätyön kortilla ${FI.num(S0.veroprosentti, 1)} % pidätetään myös ${FI.eur(SIVU)} sivutyön palkasta, vuoden pidätys on ${FI.eur(S_PID)} ja vero ${FI.eur(S1.verot)}. Uudella kortilla yhteistulolle prosentti on ${FI.num(S1.veroprosentti, 1)} %, ja vajaus jää syntymättä.` },
      { q: 'Mitä tietoja muutosverokortin tilaamiseen tarvitaan?', a: `Arvio koko vuoden 2026 palkoista ja muista tuloista, jo maksetut palkat sekä niistä pidätetyt verot, jotka näet viimeisimmältä palkkalaskelmalta. Lisäksi vähennykset, joita automaattinen kortti ei tunne, kuten kotitalousvähennys. Laskenta perustuu samaan Verohallinnon päätökseen kuin vuoden alun kortti, joten prosentti pyöristetään ylöspäin ja on enintään ${FI.num(MAX)} %.` },
      { q: 'Muuttuuko tuloraja muutosverokortissa koko vuodelle?', a: `Muuttuu. Uuden kortin tuloraja on koko kalenterivuoden palkkasumma, johon lasketaan myös ennen muutosta maksetut palkat. Heinäkuun korotuksen esimerkissä raja on ${FI.eur(ENNEN + JALKEEN)} eikä pelkkä loppuvuoden ${FI.eur(JALKEEN)}. Jos ilmoitat rajaksi vain loppuvuoden palkat, raja ylittyy pian, ja palkoista pidätetään ${FI.num(RL, 1)} %:n lisäprosentti.` },
    ],
    body: (h) => `
<h2>Miten loppuvuoden prosentti syntyy</h2>
<p>Vuoden alun verokortti on laskettu koko vuoden tulolle. Kun tulot muuttuvat, uusi prosentti ei kuitenkaan ole pelkkä uuden vuositulon veroprosentti. Laskennassa on kolme vaihetta: arvioidaan koko vuoden 2026 verot uudella vuositulolla, vähennetään niistä vero, joka on jo pidätetty vanhalla prosentilla, ja jaetaan jäljelle jäävä vero niille palkoille, jotka on vielä maksamatta. Tulos pyöristetään ylöspäin puolen prosenttiyksikön tarkkuudella. Siksi muutosverokortin prosentti on sitä jyrkempi, mitä pidempään tulojen muuttumisen jälkeen ehtii kulua ennen uutta korttia. Jokainen väärällä prosentilla maksettu palkka kasvattaa vajetta tai ylijäämää, joka pitää tasata harvemmista palkanmaksuista. Laskelmaan tarvitaan siksi kolme tietoa: arvio koko vuoden tuloista, tähän mennessä maksettu palkka ja tähän mennessä pidätetty vero. Kaksi jälkimmäistä löytyvät viimeisimmältä palkkalaskelmalta vuoden alusta kertyneinä summina.</p>

<h2>Palkankorotus heinäkuusta</h2>
<p>Helsinkiläinen saa ${h.eur(VANHA)} kuukausipalkkaa, ja kortti on laskettu ${h.eur(VANHA * 12)} vuosipalkalle: veroprosentti ${h.num(R0.veroprosentti, 1)} %. Heinäkuussa palkka nousee ${h.eur(UUSI)} euroon. Vuoden tulo on silloin ${h.eur(ENNEN + JALKEEN)}, ja sen vero ${h.eur(R1.verot)}.</p>
${h.table(['', 'Vanha kortti', 'Muutosverokortti'], [
  ['Prosentti tammi–kesäkuu', `${h.num(R0.veroprosentti, 1)} %`, `${h.num(R0.veroprosentti, 1)} %`],
  ['Prosentti heinä–joulukuu', `${h.num(R0.veroprosentti, 1)} %`, `${h.num(R_UUSI, 1)} %`],
  ['Pidätetty vuodessa', h.eur(R_PID_VANHA), h.eur(ENNEN * R0.veroprosentti / 100 + JALKEEN * R_UUSI / 100)],
  ['Lopullinen vero', h.eur(R1.verot), h.eur(R1.verot)],
  ['Vajaus (−) tai palautus (+)', h.eur(R_PID_VANHA - R1.verot), h.eur(ENNEN * R0.veroprosentti / 100 + JALKEEN * R_UUSI / 100 - R1.verot)],
], 'Helsinki, ei kirkon jäsen, vuoden 2026 perusteet', ['l', 'r', 'r'])}
<p>Vanhalla kortilla raja ylittyisi loppuvuodesta, ja lisäprosentti paikkaisi osan vajeesta. Taulukon vasen sarake näyttää pahimman tapauksen, jossa tuloraja on asetettu väljäksi eikä lisäprosenttia käytetä. Muutosverokortilla loppuvuoden pidätys nousee heti, ja vuosi päättyy lähelle nollaa.</p>

<h2>Sivutyö toisella työnantajalla</h2>
<p>Kaksi työnantajaa on tilanne, jossa verokortti menee helpoimmin pieleen. Kumpikin työnantaja vertaa tulorajaan vain omia maksujaan, joten kumpikaan ei huomaa, että yhteenlaskettu palkka ylittää rajan. Jos päätyön ${h.eur(PAA)} kortilla pidätetään ${h.num(S0.veroprosentti, 1)} % myös ${h.eur(SIVU)} sivutyön palkasta, koko vuoden pidätys on ${h.eur(S_PID)}, mutta ${h.eur(PAA + SIVU)} tulon vero on ${h.eur(S1.verot)}. Vajausta kertyy ${h.eur(S1.verot - S_PID)}. Kun uusi kortti lasketaan yhteistulolle, prosentti on ${h.num(S1.veroprosentti, 1)} %, ja molemmat työnantajat pidättävät sen mukaan. Progressio näkyy tässä selvästi: sivutyön euroja verotetaan ${h.a('marginaalivero', 'marginaaliveron')} mukaan, ei keskimääräisen prosentin.</p>

<h2>Osa-aika, työttömyys tai perhevapaa</h2>
<p>Kun tulot pienenevät, vanha kortti pidättää liikaa. Esimerkissä ${h.eur(O_TAYSI)} kuukausipalkka putoaa elokuussa ${h.eur(O_OSA)} euroon. Vuoden tulo on ${h.eur(O_TULO)}, vero ${h.eur(O1.verot)}, mutta vanha ${h.num(O0.veroprosentti, 1)} %:n kortti pidättäisi ${h.eur(O_PID)}. Alkuvuoden pidätykset riittävät jo lähes koko vuoden veroon, joten loppuvuoden prosentiksi tulee ${h.num(O_UUSI, 1)} %. Ilman muutosta ylimääräinen ${h.eur(O_PID - O1.verot)} palautuisi vasta seuraavana vuonna.</p>
<p>Työttömyysetuus ja vanhempainraha ovat veronalaista tuloa, ja niiden maksaja käyttää samaa verokorttia. Kun palkka loppuu kokonaan, kortin prosentti on siksi tärkeä myös etuuden kannalta: uusi arvio kannattaa tehdä niin, että vuositulossa ovat mukana sekä jo saadut palkat että arvioidut etuudet.</p>

<h2>Ajoitus ratkaisee prosentin</h2>
<p>Moni olettaa, että myöhään vuonna alkava korotus nostaa loppuvuoden prosenttia rajusti. Kun kortti muutetaan samaan aikaan kuin korotus alkaa, näin ei käy. Taulukossa sama ${h.eur(UUSI - VANHA)} korotus alkaa kolmena eri kuukautena.</p>
${h.table(['Uusi palkka alkaen', 'Vuositulo (uusi tuloraja)', 'Koko vuoden prosentti', 'Loppuvuoden prosentti'],
  AJOITUS.map((x) => [KUUT[x.m - 1], h.eur(x.raja), `${h.num(x.vuosi, 1)} %`, `${h.num(x.uusi, 1)} %`]),
  `Helsinki, ${h.eur(VANHA)} → ${h.eur(UUSI)} kuukaudessa, vanha prosentti ${h.num(R0.veroprosentti, 1)} %`, ['l', 'r', 'r', 'r'])}
<p>Koko vuoden prosentti vaihtelee ${h.num(Math.min(...AJOITUS.map((x) => x.vuosi)), 1)} ja ${h.num(Math.max(...AJOITUS.map((x) => x.vuosi)), 1)} prosentin välillä, mutta loppuvuoden prosentti pysyy lähes samana. Syy on se, että alkuvuoden palkat on pidätetty oikein vanhalle palkalle: vajetta syntyy vain korotetuista kuukausista, ja ne ovat samat kuukaudet, joille vaje jaetaan. Uusi kortti pidättää siis korotetusta palkasta vanhan prosentin ja lisäksi korotuksen osuuden marginaaliverosta. Jyrkkä korjaus syntyy vasta, jos muutosta lykätään ja korotettuja palkkoja ehtii kertyä useampi vanhalla prosentilla. Jos korotus on tiedossa etukäteen, kortin voi muuttaa ennen ensimmäistä korotettua palkkaa.</p>

<h2>Mitä uusi kortti muuttaa ja mitä ei</h2>
<p>Muutosverokortissa on kaikki kolme lukua uusina. Tuloraja on uusi koko vuoden arvio, johon kuuluvat myös jo maksetut palkat, ei pelkkä loppuvuoden palkkasumma. Heinäkuun korotuksen esimerkissä raja on ${h.eur(ENNEN + JALKEEN)} ja lisäprosentti ${h.num(RL, 1)} %. Työeläkemaksu ${h.num(V.tyoelakemaksu_prosentti, 2)} % ja työttömyysvakuutusmaksu ${h.num(V.tyottomyysvakuutusmaksu_prosentti, 2)} % eivät muutu, koska ne pidätetään aina samalla prosentilla verokortista riippumatta.</p>

<h2>Milloin muutos ei kannata</h2>
<ul>
<li>Korotus on niin pieni, ettei veroprosentti muutu puoltakaan prosenttiyksikköä.</li>
<li>Tuloraja on jo valmiiksi riittävä, ja vain kertaluonteinen erä, kuten bonus, menee lisäprosentilla. Lisäprosentti on korkea juuri siksi, että se kattaa tällaiset erät.</li>
<li>Vuotta on jäljellä yksi tai kaksi palkanmaksua, ja ero on muutamia kymppejä. Silloin verotus tasaa erotuksen ilman vaivaa.</li>
</ul>
<p>Jos muutos taas on suuri, kortti kannattaa vaihtaa heti: mitä useampi palkka maksetaan väärällä prosentilla, sitä jyrkempi loppuvuoden korjaus on. Rakenne, jonka uusi kortti muuttaa, on kuvattu sivulla ${h.a('verokortti', 'verokortti')}, ja ylityksen mekaniikka sivulla ${h.a('tuloraja', 'tuloraja ja lisäprosentti')}. Uuden prosentin voi arvioida ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurin')} kentällä jo maksetulle palkalle.</p>
<p>Lähteet: ${h.src('vero_ennakonpidatys')}; ${h.src('vero_verokortti_en')}.</p>`,
  },
  en: {
    slug: 'revised-tax-card',
    nav: 'Revised tax card',
    card: 'A raise, a side job or going part-time: when to order a new tax card and how the rest-of-year rate is set.',
    title: 'Revised Tax Card 2026: When to Change Your Withholding Rate',
    description: `Revised tax card 2026: after a raise, a second job or a switch to part-time, Vero sets a new rate for the rest of the year. Three worked examples in euros.`,
    h1: 'Revised tax card: a new rate mid-year',
    intro: 'A revised tax card (muutosverokortti) fixes your withholding when income changes during the year. Here is when it pays off and why the new rate can look oddly high or low.',
    resume: `Order a revised tax card (muutosverokortti) when your 2026 income moves well away from what your current card assumes. Take a Helsinki employee whose pay rises in July from ${EN.eur(VANHA)} to ${EN.eur(UUSI)} a month: the old ${EN.num(R0.veroprosentti, 1)}% card would withhold ${EN.eur(R_PID_VANHA)} over the year against a tax bill of ${EN.eur(R1.verot)}, leaving ${EN.eur(R_VAJAUS)} short. A revised card recovers that gap from the remaining paychecks, which is why it shows ${EN.num(R_UUSI, 1)}% rather than the full-year average of ${EN.num(R1.veroprosentti, 1)}%. Vero estimates the tax for the whole year, subtracts what has already been withheld and spreads the rest over pay still to come. It works in reverse too: when income drops, the rest-of-year rate can fall as low as zero. You can order a new card in MyTax (OmaVero) at any time; it applies until the end of the year or your next change. Rates are rounded up to the half point and capped at ${EN.num(MAX)}%. The usual triggers are a raise, a second job, part-time work, unemployment and parental leave.`,
    faqs: [
      { q: 'Why is the rate on my revised tax card higher than my real tax rate?', a: `Because it is also catching up on the months already paid. If too little was withheld early in the year, the gap is collected from the remaining paychecks. In the July raise example the full-year rate would be ${EN.num(R1.veroprosentti, 1)}%, yet the revised card reads ${EN.num(R_UUSI, 1)}%. Next January’s automatic card is computed on a whole year again, so the high rate does not stick.` },
      { q: 'Is it worth revising my tax card for a small pay rise?', a: `Often not. A modest raise is absorbed by the income limit and additional rate: on a ${EN.eur(PAA)} card in Helsinki the additional rate is ${EN.num(S_LP, 1)}%, which usually withholds enough on the excess. A revision makes sense when the raise moves your rate by half a point or more, or when you want to avoid interest on residual tax. Run the numbers first.` },
      { q: 'Can I lower my withholding rate if I go part-time?', a: `Yes, and it is usually worth doing. When ${EN.eur(O_TAYSI)} a month drops to ${EN.eur(O_OSA)} in August, the old ${EN.num(O0.veroprosentti, 1)}% card would withhold ${EN.eur(O_PID)} for the year although tax is only ${EN.eur(O1.verot)}. The revised rate for the remaining months is ${EN.num(O_UUSI, 1)}%, because the first months already covered almost the whole year’s tax.` },
      { q: 'I started a second job in Finland: do I need a new tax card?', a: `You need a card that reflects both salaries, because neither employer sees what the other pays. Using a ${EN.num(S0.veroprosentti, 1)}% card built for ${EN.eur(PAA)} on an extra ${EN.eur(SIVU)} of side income means ${EN.eur(S_PID)} withheld against tax of ${EN.eur(S1.verot)}. A revised card on the combined income comes out at ${EN.num(S1.veroprosentti, 1)}%, and the shortfall never builds up.` },
    ],
    body: (h) => `
<h2>How the rest-of-year rate is worked out</h2>
<p>The card you received in January assumes a whole year of income. A revised rate is not simply the rate for your new annual total. Vero takes three steps: it estimates your full-year tax on the updated income, deducts the tax already withheld at the old rate, and divides what is left by the pay you have still to receive. The result is rounded up to the next half point. The longer you wait after your income changes, the sharper that correction becomes, because every payslip on the wrong rate adds to the gap and fewer paychecks are left to absorb it.</p>
<p>To fill in the request you need an estimate of your total 2026 income, your pay to date and the tax already withheld, all of which appear on your latest payslip. Deductions the automatic card does not know about, such as the household tax credit (kotitalousvähennys), can be added at the same time.</p>

<h2>Case 1: a raise in July</h2>
<p>A Helsinki employee earns ${h.eur(VANHA)} a month on a card built for ${h.eur(VANHA * 12)}, with a ${h.num(R0.veroprosentti, 1)}% rate. From July the salary is ${h.eur(UUSI)}. Annual income becomes ${h.eur(ENNEN + JALKEEN)}, taxed at ${h.eur(R1.verot)}.</p>
${h.table(['', 'Old card', 'Revised card'], [
  ['Rate, January to June', `${h.num(R0.veroprosentti, 1)}%`, `${h.num(R0.veroprosentti, 1)}%`],
  ['Rate, July to December', `${h.num(R0.veroprosentti, 1)}%`, `${h.num(R_UUSI, 1)}%`],
  ['Withheld over the year', h.eur(R_PID_VANHA), h.eur(ENNEN * R0.veroprosentti / 100 + JALKEEN * R_UUSI / 100)],
  ['Final tax', h.eur(R1.verot), h.eur(R1.verot)],
  ['Shortfall (−) or refund (+)', h.eur(R_PID_VANHA - R1.verot), h.eur(ENNEN * R0.veroprosentti / 100 + JALKEEN * R_UUSI / 100 - R1.verot)],
], 'Helsinki, not a church member, 2026 rules', ['l', 'r', 'r'])}
<p>On the old card the income limit would eventually be crossed and the additional rate would cover part of the gap. The left column shows the worst case, where the limit was set generously and the additional rate never applies. With the revised card withholding rises immediately and the year ends close to even.</p>

<h2>Case 2: a second employer</h2>
<p>Two employers is where tax cards go wrong most easily. Each payroll compares only its own payments against the limit, so neither notices that your combined pay has passed it. If the ${h.num(S0.veroprosentti, 1)}% rate from a ${h.eur(PAA)} main job is also applied to ${h.eur(SIVU)} of side income, ${h.eur(S_PID)} is withheld across the year while tax on ${h.eur(PAA + SIVU)} is ${h.eur(S1.verot)}: a gap of ${h.eur(S1.verot - S_PID)}. A card calculated on combined income gives ${h.num(S1.veroprosentti, 1)}%, applied by both employers. The extra euros are taxed at your ${h.a('marginaalivero', 'marginal rate')}, not your average one, which is exactly what the old card misses.</p>

<h2>Case 3: part-time, unemployment or parental leave</h2>
<p>When income drops, the old card over-withholds. Here ${h.eur(O_TAYSI)} a month falls to ${h.eur(O_OSA)} in August. Income for the year is ${h.eur(O_TULO)} and tax ${h.eur(O1.verot)}, but the old ${h.num(O0.veroprosentti, 1)}% rate would take ${h.eur(O_PID)}. The first seven months have already covered nearly all of the year’s tax, so the revised rate for the rest of the year is ${h.num(O_UUSI, 1)}%. Without the change, ${h.eur(O_PID - O1.verot)} would sit with Vero until the refund the following year.</p>
<p>Unemployment benefit and parental allowance are taxable, and whoever pays them uses the same tax card. When your salary stops altogether, build the new estimate from wages already received plus the benefits you expect, so the rate works for both.</p>

<h2>Timing changes the rate</h2>
<p>You might expect a raise that starts late in the year to send the rest-of-year rate soaring. If you revise the card in the same month the raise begins, it does not. Here the same ${h.eur(UUSI - VANHA)} raise starts in three different months.</p>
${h.table(['New salary from', 'Annual income (new limit)', 'Full-year rate', 'Rest-of-year rate'],
  AJOITUS.map((x) => [MONTHS[x.m - 1], h.eur(x.raja), `${h.num(x.vuosi, 1)}%`, `${h.num(x.uusi, 1)}%`]),
  `Helsinki, ${h.eur(VANHA)} to ${h.eur(UUSI)} a month, old rate ${h.num(R0.veroprosentti, 1)}%`, ['l', 'r', 'r', 'r'])}
<p>The full-year rate moves a lot, the rest-of-year rate barely at all. Earlier months were withheld correctly for the old salary, so the only gap comes from the higher months, and those are the same months the gap is spread over. What hurts is delay: every higher payslip taxed at the old rate adds to the catch-up. If you know about a raise in advance, revise the card before the first higher payslip.</p>

<h2>When to leave the card alone</h2>
<ul>
<li>The raise is too small to move your rate by even half a point.</li>
<li>Your limit already has room, and only a one-off item such as a bonus goes over it. The additional rate is set high precisely to handle that.</li>
<li>Only one or two paydays are left and the difference is a few tens of euros; the assessment will settle it.</li>
</ul>
<p>For a big change, act at once: each payday on the wrong rate makes the year-end correction steeper. The ${h.a('verokortti', 'tax card guide')} explains the card the revision replaces, the ${h.a('tuloraja', 'income limit page')} covers what happens on the old card, and the ${h.a('veroprosenttilaskuri', 'tax rate calculator')} has a field for salary already paid.</p>
<p>Sources: ${h.src('vero_ennakonpidatys')}; ${h.src('vero_verokortti_en')}.</p>`,
  },
});
