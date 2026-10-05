import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { lomakorvaus, lomapaivat, prosenttilomapalkka } from '../../lib/engine/loma';
import { ansiopaivaraha } from '../../lib/engine/paivaraha';
import { r2 } from '../../lib/engine/params';

const L = P.vuosiloma;
const JK = L.lomakorvaus_jakaja_kk, JV = L.lomakorvaus_jakaja_vk;
const [PROS_ALLE, PROS_YLI] = L.prosenttiperuste;
/** Esimerkki: eroaa 30.9.; edellisen vuoden lomista pitämättä 12, kuluvalta vuodelta 6 täyttä kuukautta. */
const PALKKA = 3000;
const VANHAT = lomapaivat(12) - 18;
const UUDET = lomapaivat(6);
const YHT = VANHAT + UUDET;
const KORVAUS = lomakorvaus(PALKKA, YHT);
const PAIVA = r2(PALKKA / JK);
const PALKAT = [2500, 3000, 4000];
const PAIVIA = [5, 12, YHT];
const VIIKKO = 700, VPAIVAT = 10;
const VIIKKOKORV = r2(VIIKKO / JV * VPAIVAT);
const TUNTI_ANSIO = 8000;
const PA = prosenttilomapalkka(TUNTI_ANSIO, false), PY = prosenttilomapalkka(TUNTI_ANSIO, true);
const AP = ansiopaivaraha(PALKKA);
const VUOSI_PROS = prosenttilomapalkka(PALKKA * 12, true);
const ARVOT = [2000, 2500, 3000, 3500, 4000, 5000];
/** Ensimmäisen vuoden työsuhde: 1.11.2025–31.8.2026, viisi täyttä kuukautta ennen 31.3. ja viisi sen jälkeen, lomia ei pidetty. */
const ENS_A = lomapaivat(5, true), ENS_B = lomapaivat(5, true);
const ENS_PALKKA = 2600;
const ENS = lomakorvaus(ENS_PALKKA, ENS_A + ENS_B);

export default definePage({
  id: 'lomakorvaus',
  group: 'tuet',
  order: 70,
  mini: 'lomakorvaus',
  related: ['vuosiloma', 'lomaraha-laskuri', 'tyossaoloehto'],
  sources: ['finlex_vuosiloma', 'tyosuojelu_lomapalkka'],
  fi: {
    slug: 'lomakorvaus',
    nav: 'Lomakorvaus',
    card: 'Pitämättömien lomapäivien korvaus työsuhteen päättyessä: laskutapa, esimerkit ja vanhentuminen.',
    title: 'Lomakorvaus 2026: pitämättömät lomat työsuhteen lopussa',
    description: `Lomakorvaus 2026 maksetaan pitämättömistä lomapäivistä työsuhteen päättyessä: kuukausipalkka jaetaan ${JK}:llä. Laske korvaus ja katso, milloin se vanhenee.`,
    h1: 'Lomakorvaus työsuhteen päättyessä',
    intro: 'Kun työsuhde loppuu, jokainen pitämätön lomapäivä muuttuu rahaksi.',
    resume: `Lomakorvaus on rahakorvaus, jonka työntekijä saa työsuhteen päättyessä kaikista lomapäivistä, joita hän ei ole ehtinyt pitää ja joista ei ole aiemmin maksettu korvausta. Kuukausipalkkaisella yhden lomapäivän korvaus on kuukausipalkka jaettuna ${JK}:llä, viikkopalkkaisella viikkopalkka jaettuna ${JV}:lla. ${FI.eur(PALKKA)} kuukausipalkalla päivän arvo on ${FI.eur(PAIVA, 2)}. Korvaukseen kuuluvat sekä edelliseltä lomanmääräytymisvuodelta pitämättä jääneet päivät että kuluvana vuonna 1.4. jälkeen kertyneet päivät. Syyskuun lopussa eroava, jolta on jäänyt kesältä ${VANHAT} päivää pitämättä ja jolle on kertynyt huhti–syyskuulta ${UUDET} päivää, saa ${YHT} päivän korvauksen eli ${FI.eur(KORVAUS)}. Jos työntekijä ei ole kerryttänyt täysiä kuukausia, korvaus lasketaan prosentteina vuoden palkoista: ${FI.num(PROS_ALLE, 0)} % alle vuoden ja ${FI.num(PROS_YLI, 1)} % vähintään vuoden kestäneessä työsuhteessa. Lomakorvaus vanhenee ${L.vanhentuminen_v} vuodessa, eikä sitä lueta palkkaan, kun työttömyyskassa laskee ansiopäivärahan. Oikeus korvaukseen syntyy aina, kun työsuhde päättyy, oli syynä irtisanoutuminen, irtisanominen tai määräaikaisen sopimuksen loppuminen.`,
    faqs: [
      { q: 'Miten lomakorvaus lasketaan kuukausipalkasta?', a: `Kuukausipalkka jaetaan ${JK}:llä, ja tulos kerrotaan pitämättömien lomapäivien määrällä. ${FI.eur(PALKKA)} kuukausipalkalla päivän korvaus on ${FI.eur(PAIVA, 2)}, joten ${PAIVIA[1]} pitämätöntä päivää tuottaa ${FI.eur(lomakorvaus(PALKKA, PAIVIA[1]))}. Jakaja on kirjattu vuosilomalain ${FI.num(17)} §:ään, ja viikkopalkkaisella se on ${JV}. Jakaja on sama palkan suuruudesta riippumatta.` },
      { q: 'Saako lomakorvauksen myös kuluvan lomavuoden päivistä?', a: `Saa. Laki antaa oikeuden korvaukseen siltä ajalta, jolta et ole saanut lomaa tai lomakorvausta. Huhtikuun alun jälkeen kertyneet päivät ovat siis mukana, vaikka niiden pitäminen olisi ollut mahdollista vasta seuraavana vuonna. Vähintään vuoden työsuhteessa kuusi täyttä kuukautta tuo ${UUDET} päivää, ensimmäisenä vuonna ${lomapaivat(6, true)} päivää.` },
      { q: 'Kuuluuko lomakorvaukseen myös lomaraha?', a: `Laki ei sitä edellytä, koska lomaraha ei perustu vuosilomalakiin vaan työehtosopimukseen. Siksi vastaus löytyy oman alasi työehtosopimuksesta, jossa lomarahan ehdot on kirjoitettu. Tarkista sopimuksesta erityisesti, mitä se sanoo lomarahasta silloin, kun työsuhde päättyy ennen loman pitämistä. Jos työehtosopimusta ei ole eikä työsopimuksessa sovita lomarahasta, saat pelkän ${JK}:n jakajalla lasketun lomakorvauksen.` },
      { q: 'Vaikuttaako lomakorvaus ansiopäivärahan suuruuteen?', a: `Ei. Työttömyyskassojen yhteisjärjestö TYJ jättää lopputilin lomakorvauksen päiväpalkan laskennan ulkopuolelle. Suurikaan lomakorvaus viimeisessä palkassa ei siis nosta päivärahaa. ${FI.eur(PALKKA)} kuukausipalkalla päivärahan pohjana on pelkkä palkka, ja täysi ansiopäiväraha on noin ${FI.eur(AP.taysiKk)} kuukaudessa. Lomakorvaus on siis kertaluonteinen erä, joka ei siirry tulevaan päivärahaan.` },
      { q: 'Kauanko maksamatonta lomakorvausta voi vaatia?', a: `Vuosilomalakiin perustuva lomakorvaus vanhenee ${L.vanhentuminen_v} vuodessa. Tarkista lopputilin palkkalaskelmasta, montako päivää korvattiin, ja vertaa sitä omaan laskelmaasi. Jos päiviä puuttuu, esitä vaatimus kirjallisesti ja liitä mukaan työvuorolistat tai palkkalaskelmat, joista täydet kuukaudet näkyvät. Säilytä kopio vaatimuksesta ja työnantajan vastauksesta, sillä määräajan kuluttua saatavaa ei voi enää periä.` },
      { q: 'Saako lomakorvauksen, jos irtisanoutuu itse?', a: `Saa. Vuosilomalain ${FI.num(17)} § koskee kaikkia työsuhteen päättymistapoja, joten oikeus syntyy samalla tavalla, kun irtisanoudut, sinut irtisanotaan tai määräaikainen sopimus päättyy. Korvaus lasketaan pitämättömistä päivistä: ${FI.eur(PALKKA)} kuukausipalkalla jokainen päivä on ${FI.eur(PAIVA, 2)}, ja ${YHT} päivää tuo ${FI.eur(KORVAUS)}. Irtisanoutumisen syy ei vaikuta summaan.` },
      { q: 'Miksi lomakorvauksen jakaja on 25 eikä 21?', a: `Lomapäivät ovat arkipäiviä, ja arkipäiviin kuuluu myös lauantai. Kun lauantait lasketaan mukaan, kuukaudessa on arkipäiviä selvästi enemmän kuin maanantaista perjantaihin laskettuja työpäiviä, ja jakaja ${JK} on lähellä tätä määrää. Luku on kirjoitettu suoraan vuosilomalain ${FI.num(17)} §:ään, joten se ei ole työnantajan valittavissa.` },
    ],
    body: (h) => `
<h2>Laskukaava</h2>
<p>Vuosilomalain ${h.num(17)} § sanoo, että työsuhteen päättyessä työntekijällä on oikeus saada vuosiloman sijasta lomakorvaus siltä ajalta, jolta hän ei ole saanut lomaa tai lomakorvausta. Lomapäivän palkka lasketaan kuukausipalkkaisilla jakajalla ${JK} ja viikkopalkkaisilla jakajalla ${JV}. Kaava on yksinkertainen: kuukausipalkka / ${JK} × pitämättömät lomapäivät.</p>
${h.table(['Kuukausipalkka', ...PAIVIA.map((d) => `${h.num(d)} päivää`)], PALKAT.map((p) => [h.eur(p), ...PAIVIA.map((d) => h.eur(lomakorvaus(p, d)))]), `Lomakorvaus ennen veroja, kuukausipalkka / ${JK} × pitämättömät päivät`, ['l', 'r', 'r', 'r'])}
<p>Taulukon viimeinen sarake vastaa alla olevan esimerkin tilannetta. Päivien määrä vaikuttaa summaan suoraan, joten jokainen palkkalaskelmasta puuttuva päivä on ${h.eur(PALKKA / JK, 2)} pois ${h.eur(PALKKA)} kuukausipalkalla.</p>
<p>Määräaikaisessa työssä sama sääntö toistuu jokaisen sopimuksen lopussa. Kun sopimus päättyy, sen aikana kertyneet ja pitämättä jääneet päivät korvataan, vaikka sama työnantaja palkkaisi sinut myöhemmin uudelleen. Peräkkäisten lyhyiden sopimusten tekijän kannattaa siksi tarkistaa jokainen lopputili erikseen.</p>
<h2>Esimerkki: ero syyskuun lopussa</h2>
<p>Mikko on ollut samassa työpaikassa kolme vuotta ja eroaa 30.9.2026. Edelliseltä lomanmääräytymisvuodelta hänelle kertyi ${lomapaivat(12)} päivää, ja kesällä hän piti niistä 18. Pitämättä jäi ${VANHAT} päivää. Huhtikuusta syyskuuhun on kertynyt kuusi täyttä kuukautta ja ${UUDET} uutta päivää. Korvattavia päiviä on ${YHT}.</p>
<p>${h.eur(PALKKA)} kuukausipalkalla päivän arvo on ${h.eur(PAIVA, 2)}, ja lomakorvaus on ${h.eur(KORVAUS)}. Jos Mikko olisi pitänyt koko kesän ${h.num(lomapaivat(12))} päivää, korvattavaksi jäisi vain kuluvan vuoden ${UUDET} päivää eli ${h.eur(lomakorvaus(PALKKA, UUDET))}. Sivun minilaskuri tekee saman laskelman omalla palkallasi ja päivilläsi.</p>
<h2>Ensimmäisen vuoden työsuhde</h2>
<p>Lyhyessä työsuhteessa korvaus kertyy pienemmällä kertoimella. Sari aloitti 1.11.2025 ja lähtee 31.8.2026 eikä ole pitänyt lomia. Maaliskuun loppuun mennessä hänelle kertyi viisi täyttä kuukautta ja, koska työsuhde oli kestänyt alle vuoden, ${h.num(ENS_A)} lomapäivää. Huhtikuusta elokuuhun kertyi taas viisi täyttä kuukautta. Koko työsuhde jää alle vuoden, joten näistäkin tulee ${h.num(ENS_B)} päivää. ${h.eur(ENS_PALKKA)} kuukausipalkalla ${h.num(ENS_A + ENS_B)} päivän korvaus on ${h.eur(ENS)}.</p>
<p>Esimerkki näyttää, miksi lyhyiden työsuhteiden lomakorvaus kannattaa laskea itse. Jos palkanlaskenta käyttää vahingossa ${h.num(L.lomapaivat_kk, 1)} päivän kerrointa tai unohtaa huhtikuun jälkeiset kuukaudet, ero on helposti satoja euroja suuntaan tai toiseen.</p>
<h2>Viikkopalkka ja prosenttisääntö</h2>
<p>Viikkopalkkaisella päivän arvo on viikkopalkka jaettuna ${JV}:lla. ${h.eur(VIIKKO)} viikkopalkalla ${h.num(VPAIVAT)} pitämättömän päivän korvaus on ${h.eur(VIIKKOKORV)}.</p>
<p>Jos täysiä lomanmääräytymiskuukausia ei kerry, koska työpäiviä on alle ${L.taysi_kk_paivat} ja tunteja alle ${L.taysi_kk_tunnit} kuukaudessa, lomakorvaus lasketaan prosentteina. Ensimmäisenä vuonna kerroin on ${h.num(PROS_ALLE, 0)} prosenttia tehdystä työstä maksetuista palkoista ja vuoden täyttymisen jälkeen ${h.num(PROS_YLI, 1)} prosenttia. Keikkatyöstä vuodessa ${h.eur(TUNTI_ANSIO)} ansaitseva saa ensimmäisenä vuonna ${h.eur(PA)} ja myöhemmin ${h.eur(PY)}.</p>
<h2>Jakaja vai prosentti: kumpi koskee sinua</h2>
<p>Sivun minilaskuri näyttää kaksi lukua, ja ne kannattaa erottaa. Jakajaa ${JK} käytetään, kun olet kerryttänyt täysiä lomanmääräytymiskuukausia, mikä koskee lähes kaikkia kuukausipalkkaisia. Prosenttisääntö on tarkoitettu vain niille, joille täysiä kuukausia ei kerry lainkaan. ${h.eur(PALKKA)} kuukausipalkkaisen ${h.num(PROS_YLI, 1)} prosentin luku, ${h.eur(VUOSI_PROS)}, on siksi vain vertailukohta: hänen lomakorvauksensa lasketaan pitämättömistä päivistä.</p>
<h2>Päivän arvo eri palkoilla</h2>
${h.table(['Kuukausipalkka', `Päivän arvo (/ ${JK})`, `Täysi vuosi, ${lomapaivat(12)} päivää`], ARVOT.map((p) => [h.eur(p), h.eur(p / JK, 2), h.eur(lomakorvaus(p, lomapaivat(12)))]), 'Lomapäivän arvo lomakorvauksessa, 2026', ['l', 'r', 'r'])}
<p>Taulukon viimeinen sarake näyttää, mitä koko vuoden pitämätön loma on rahana: hieman yli kuukauden palkka, koska ${lomapaivat(12)} päivää jaettuna ${JK}:llä on enemmän kuin yksi. Siksi pitkään kertynyt lomasaldo voi tehdä lopputilistä selvästi tavallista palkkaa suuremman.</p>
<h2>Mitä lomakorvaus ei tee</h2>
<p>Lomakorvaus ei nosta ansiopäivärahaa. TYJ:n laskentaohjeen mukaan lomarahaa ja lomakorvausta ei lueta palkkaan, kun päiväpalkka lasketaan, joten viimeisen kuukauden suuri lopputili ei vaikuta päivärahaan. Päivärahan pohjana ovat ${h.a('tyossaoloehto', 'työssäoloehtoon')} luettujen kuukausien tavalliset bruttopalkat.</p>
<p>Lomakorvaus ei myöskään sisällä automaattisesti lomarahaa. Lomaraha perustuu työehtosopimukseen, joten sen ehdot päättyvässä työsuhteessa luetaan sopimuksesta. Lomarahan suuruuden voi arvioida ${h.a('lomaraha-laskuri', 'lomarahalaskurilla')}.</p>
<h2>Tarkista lopputili</h2>
<ul>
<li>Laske edellisen lomanmääräytymisvuoden päivät ja vähennä niistä pidetyt päivät.</li>
<li>Lisää kuluvan vuoden täydet kuukaudet 1.4. alkaen, ${h.num(L.lomapaivat_kk, 1)} päivää kuukaudelta, ensimmäisenä vuonna ${L.lomapaivat_kk_alle_vuosi}.</li>
<li>Kerro päivät kuukausipalkalla jaettuna ${JK}:llä.</li>
<li>Vertaa tulosta lopputilin palkkalaskelmaan.</li>
</ul>
<p>Kertymäsäännöt on selitetty tarkemmin sivulla ${h.a('vuosiloma', 'vuosiloman ansainta')}. Saatava vanhenee ${L.vanhentuminen_v} vuodessa, joten puuttuvat päivät kannattaa selvittää heti työsuhteen päätyttyä. Mitä tuoreempi asia on, sitä helpompi työnantajan on tarkistaa työvuorot ja korjata virhe seuraavan palkanmaksun yhteydessä ilman riitaa.</p>
<p>Lähteet: ${h.src('finlex_vuosiloma', 'vuosilomalaki 162/2005, 16 ja 17 §')} ja ${h.src('tyosuojelu_lomapalkka', 'Työsuojeluhallinto, lomapalkka ja -korvaus')}.</p>`,
  },
  en: {
    slug: 'holiday-compensation',
    nav: 'Holiday compensation',
    card: 'Pay for unused annual leave when your Finnish job ends: the formula, examples and the deadline.',
    title: 'Holiday Compensation 2026: Unused Leave When a Job Ends',
    description: `Holiday compensation 2026: when your Finnish job ends, each unused leave day is paid at monthly salary divided by ${JK}. Work yours out and claim within ${L.vanhentuminen_v} years.`,
    h1: 'Holiday compensation when a job ends',
    intro: 'Leaving a Finnish job turns every unused leave day into money on your final payslip.',
    resume: `Holiday compensation (lomakorvaus) is what your employer pays on your final payslip for every day of annual leave you earned but did not take. On a monthly salary, each day is worth your monthly pay divided by ${JK}; on a weekly wage, weekly pay divided by ${JV}. That makes a day worth ${EN.eur(PAIVA, 2)} on ${EN.eur(PALKKA)} a month. The compensation covers both leftover days from the previous holiday credit year and days earned since 1 April of the current one, even though you could not have taken those yet. Someone resigning at the end of September with ${VANHAT} days left from the summer and ${UUDET} new days since April receives ${YHT} days, or ${EN.eur(KORVAUS)} before tax. Workers whose hours were too short for any full month get a percentage instead: ${EN.num(PROS_ALLE, 0)}% of the year’s pay in a job of under a year, ${EN.num(PROS_YLI, 1)}% after that. The claim expires after ${L.vanhentuminen_v} years. For anyone moving on to unemployment benefit, holiday compensation is left out of the salary on which the earnings-related allowance is calculated.`,
    faqs: [
      { q: 'How is holiday compensation calculated when I leave a job in Finland?', a: `Divide your monthly salary by ${JK} and multiply by the number of unused leave days. On ${EN.eur(PALKKA)} a month a day is worth ${EN.eur(PAIVA, 2)}, so ${PAIVIA[1]} unused days pay ${EN.eur(lomakorvaus(PALKKA, PAIVIA[1]))}. The divisor is written into section ${EN.num(17)} of the Annual Holidays Act. The divisor is the same whatever your salary level.` },
      { q: 'Do I get paid for the leave I earned since April if I resign in autumn?', a: `Yes. The act gives you compensation for all time for which you have received neither leave nor compensation, so days earned since 1 April count even though they were not yet available to take. Six full months in a job of a year or more add ${UUDET} days; in a first-year job, ${lomapaivat(6, true)} days.` },
      { q: 'Does holiday compensation increase my unemployment allowance?', a: `No. The unemployment funds’ umbrella organisation TYJ excludes holiday compensation from the wage base of the allowance. A large final payslip therefore does not raise your daily allowance. On ${EN.eur(PALKKA)} a month the full allowance stays at about ${EN.eur(AP.taysiKk)}, based on salary alone.` },
      { q: 'My old employer never paid my holiday compensation. How long do I have to claim?', a: `${L.vanhentuminen_v} years. Claims for holiday pay and holiday compensation under the Annual Holidays Act expire after that. Write to the employer with your calculation, attach payslips or rosters that show your full months, and keep a copy. The longer you wait, the harder it becomes to prove which months counted.` },
      { q: 'Do I lose holiday compensation if I resign instead of being dismissed?', a: `No. Section ${EN.num(17)} applies however the employment ends: resignation, dismissal or the end of a fixed-term contract. On ${EN.eur(PALKKA)} a month every unused day is worth ${EN.eur(PAIVA, 2)} either way, and ${YHT} days come to ${EN.eur(KORVAUS)}. The reason you leave has no effect on the amount.` },
      { q: 'I was paid weekly. How is my holiday compensation worked out?', a: `With a weekly wage the divisor is ${JV}, not ${JK}. Weekly pay of ${EN.eur(VIIKKO)} makes each leave day worth ${EN.eur(r2(VIIKKO / JV), 2)}, so ${VPAIVAT} unused days come to ${EN.eur(VIIKKOKORV)}. If your hours were so short that no month was full, the percentage rule of ${EN.num(PROS_ALLE, 0)}% or ${EN.num(PROS_YLI, 1)}% of the year’s pay applies instead.` },
    ],
    body: (h) => `
<h2>The rule in section 17</h2>
<p>When employment ends, the Annual Holidays Act entitles you to compensation instead of leave for the period for which you have not received leave or compensation. A day of leave is priced with a divisor of ${JK} for monthly salaries and ${JV} for weekly ones. The sum is: monthly salary / ${JK} × unused days.</p>
${h.table(['Monthly salary', ...PAIVIA.map((d) => `${h.num(d)} days`)], PALKAT.map((p) => [h.eur(p), ...PAIVIA.map((d) => h.eur(lomakorvaus(p, d)))]), `Holiday compensation before tax, monthly salary / ${JK} × unused days`, ['l', 'r', 'r', 'r'])}
<h2>Worked example: leaving at the end of September</h2>
<p>Mikko has been in the job for three years and leaves on 30 September 2026. Last credit year earned him ${lomapaivat(12)} days, of which he took 18 in the summer, leaving ${VANHAT}. Since 1 April he has six full months, worth ${UUDET} days. That is ${YHT} days in total.</p>
<p>At ${h.eur(PALKKA)} a month each day is worth ${h.eur(PAIVA, 2)}, and his compensation comes to ${h.eur(KORVAUS)}. Had he used all ${h.num(lomapaivat(12))} days in the summer, only this year’s ${UUDET} days would remain, worth ${h.eur(lomakorvaus(PALKKA, UUDET))}. The mini calculator above does the same sum with your own pay and days.</p>
<h2>A first-year job</h2>
<p>In a job that lasts less than a year, compensation builds up at the lower rate. Sari started on 1 November 2025 and leaves on 31 August 2026 without having taken leave. By 31 March she had five full months in a job of under a year: ${h.num(ENS_A)} days. April to August adds five more months, still in a job of under a year, so another ${h.num(ENS_B)} days. On ${h.eur(ENS_PALKKA)} a month, ${h.num(ENS_A + ENS_B)} days pay ${h.eur(ENS)}. Payroll mistakes are common here, in both directions, so check the multiplier and that the months after April are included.</p>
<h2>Weekly pay and short-hours work</h2>
<p>On a weekly wage, divide by ${JV}. Weekly pay of ${h.eur(VIIKKO)} and ${h.num(VPAIVAT)} unused days give ${h.eur(VIIKKOKORV)}.</p>
<p>If you never had a full month, because you worked fewer than ${L.taysi_kk_paivat} days and fewer than ${L.taysi_kk_tunnit} hours a month, compensation is a percentage of the wages paid for time at work in the credit year: ${h.num(PROS_ALLE, 0)}% in a job of under a year, ${h.num(PROS_YLI, 1)}% once it has lasted a year. Gig work worth ${h.eur(TUNTI_ANSIO)} a year gives ${h.eur(PA)} in the first year and ${h.eur(PY)} after.</p>
<h2>Divisor or percentage: which one is yours</h2>
<p>The mini calculator shows two figures. The divisor of ${JK} applies whenever you earned full holiday credit months, which covers almost everyone on a monthly salary. The percentage rule is only for people who never reached a full month. For a ${h.eur(PALKKA)} monthly employee, the ${h.num(PROS_YLI, 1)}% figure of ${h.eur(VUOSI_PROS)} is a reference point only; their compensation is counted in unused days.</p>
<h2>What it does not do</h2>
<p>It does not raise your unemployment allowance. The calculation rules published by TYJ leave holiday bonus and holiday compensation out of the pay base, so the allowance rests on the ordinary gross salary from the months that met the ${h.a('tyossaoloehto', 'employment condition')}.</p>
<p>It does not automatically include a holiday bonus either. The bonus comes from collective agreements, and whether one is paid when employment ends depends on the agreement for your sector. The ${h.a('lomaraha-laskuri', 'holiday bonus calculator')} estimates the amount if yours does.</p>
<h2>Checking your final payslip</h2>
<ul>
<li>Take last credit year’s days and subtract the days you used.</li>
<li>Add ${h.num(L.lomapaivat_kk, 1)} days for each full month since 1 April, or ${L.lomapaivat_kk_alle_vuosi} in a first-year job.</li>
<li>Multiply by monthly salary divided by ${JK}.</li>
<li>Compare with the holiday compensation line on the final payslip.</li>
</ul>
<p>The accrual rules are explained under ${h.a('vuosiloma', 'annual leave accrual')}. The claim lapses after ${L.vanhentuminen_v} years, so raise any shortfall soon after you leave.</p>
<p>Sources: ${h.src('finlex_vuosiloma', 'Annual Holidays Act 162/2005, sections 16 and 17')} and ${h.src('tyosuojelu_lomapalkka', 'Occupational Safety and Health Administration, holiday pay and compensation')}.</p>`,
  },
});
