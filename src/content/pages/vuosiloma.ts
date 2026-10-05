import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { lomapaivat, lomaraha, prosenttilomapalkka } from '../../lib/engine/loma';

const L = P.vuosiloma;
const KK = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const TAYSI = lomapaivat(12);
const UUSI7 = lomapaivat(7, true);
const VIIKOT = TAYSI / 6;
const [PROS_ALLE, PROS_YLI] = L.prosenttiperuste;
const VUOSIANSIO = 15000;
const PA = prosenttilomapalkka(VUOSIANSIO, false), PY = prosenttilomapalkka(VUOSIANSIO, true);
const LR = lomaraha(3000, TAYSI);
const OSA_KK = 5;

export default definePage({
  id: 'vuosiloma',
  group: 'tuet',
  order: 60,
  mini: 'lomapaivat',
  related: ['lomaraha-laskuri', 'lomakorvaus', 'nettopalkka-3000'],
  sources: ['finlex_vuosiloma', 'tyosuojelu_lomapalkka'],
  fi: {
    slug: 'vuosiloman-ansainta',
    nav: 'Vuosiloman ansainta',
    card: 'Montako lomapäivää kertyy kuukaudessa, milloin kuukausi on täysi ja miten lomapalkka määräytyy.',
    title: `Vuosiloman ansainta 2026: ${FI.num(L.lomapaivat_kk, 1)} lomapäivää kuukaudessa`,
    description: `Vuosiloman ansainta 2026: täydestä kuukaudesta kertyy ${FI.num(L.lomapaivat_kk, 1)} lomapäivää, ensimmäisenä vuonna ${L.lomapaivat_kk_alle_vuosi}. Kuukausi on täysi ${L.taysi_kk_paivat} työpäivällä tai ${L.taysi_kk_tunnit} tunnilla. Laske päiväsi.`,
    h1: 'Vuosiloman ansainta',
    intro: 'Vuosilomalaki määrää, kuinka monta lomapäivää kertyy ja millä palkalla lomasi maksetaan.',
    resume: `Työntekijälle kertyy vuosilomaa ${FI.num(L.lomapaivat_kk, 1)} arkipäivää jokaiselta täydeltä lomanmääräytymiskuukaudelta, ja täydestä lomanmääräytymisvuodesta lomaa tulee ${TAYSI} arkipäivää eli ${FI.num(VIIKOT)} viikkoa. Jos työsuhde on maaliskuun loppuun mennessä kestänyt yhtäjaksoisesti alle vuoden, kertymä on ${L.lomapaivat_kk_alle_vuosi} arkipäivää kuukaudessa, ja päivän osa pyöristetään aina täyteen lomapäivään. Lomanmääräytymisvuosi alkaa 1.4. ja päättyy 31.3., joten syyskuussa aloittanut ansaitsee ensimmäiseen kesään mennessä ${UUSI7} lomapäivää. Kuukausi on täysi, kun työssäolopäiviä kertyy vähintään ${L.taysi_kk_paivat}. Jos sopimuksen mukaan päiviä on niin vähän, ettei tämä raja täyty, kuukausi lasketaan täydeksi vähintään ${L.taysi_kk_tunnit} työtunnilla. Kuukausipalkkainen saa loman ajalta tavallisen palkkansa. Jos täysiä kuukausia ei kerry, työntekijä saa ${L.lomapaivat_kk_alle_vuosi} vapaapäivää kuukaudessa ja lomakorvauksen, joka on ${FI.num(PROS_ALLE, 0)} % tai vähintään vuoden jatkuneessa työsuhteessa ${FI.num(PROS_YLI, 1)} % vuoden palkoista. Lomaraha ei perustu vuosilomalakiin vaan työehtosopimukseen, ja lomapalkan saatavat vanhenevat ${L.vanhentuminen_v} vuodessa, joten virheellisestä laskelmasta kannattaa huomauttaa ajoissa.`,
    faqs: [
      { q: 'Montako lomapäivää kertyy ensimmäisenä työvuonna?', a: `${L.lomapaivat_kk_alle_vuosi} arkipäivää jokaiselta täydeltä kuukaudelta, jos työsuhde on 31.3. mennessä kestänyt alle vuoden. Syyskuun alussa aloittanut kerryttää maaliskuun loppuun mennessä seitsemän täyttä kuukautta ja ${UUSI7} lomapäivää. Seuraavana lomanmääräytymisvuonna kertymä nousee ${FI.num(L.lomapaivat_kk, 1)} päivään kuukaudessa, ja täydestä vuodesta tulee ${TAYSI} päivää. Pyöristys tehdään aina ylöspäin, joten esimerkiksi viidestä kuukaudesta ei menetetä puolikasta päivää.` },
      { q: 'Milloin kuukausi on täysi lomanmääräytymiskuukausi?', a: `Kun kalenterikuukauden aikana kertyy vähintään ${L.taysi_kk_paivat} työssäolopäivää. Osa-aikainen, joka tekee sopimuksen mukaan niin vähän päiviä, ettei ${L.taysi_kk_paivat} päivää täyty, saa täyden kuukauden vähintään ${L.taysi_kk_tunnit} työtunnista. Vain toinen säännöistä on käytössä kerrallaan, joten neljänä päivänä viikossa työskentelevälle ratkaisee päivämäärä ja kahtena päivänä viikossa tekevälle tuntimäärä.` },
      { q: 'Miksi lomavuosi alkaa huhtikuussa?', a: `Vuosilomalaki käyttää lomanmääräytymisvuotta, joka alkaa 1.4. ja päättyy 31.3. Siksi maaliskuun lopun tilanne ratkaisee sekä sen, onko työsuhde kestänyt vuoden, että sen, kertyykö kuukaudelta ${L.lomapaivat_kk_alle_vuosi} vai ${FI.num(L.lomapaivat_kk, 1)} päivää. Kalenterivuoteen tottunut ulkomailta tullut työntekijä huomaa tämän usein vasta ensimmäisen palkkalaskelman lomasaldosta. Uusi kertymä alkaa joka vuosi 1.4., ja edellisen vuoden päivät siirtyvät pidettäviksi.` },
      { q: 'Saako kuukausipalkkainen lomaltaan saman palkan kuin töistä?', a: `Saa. Vuosilomalain ${FI.num(10)} §:n mukaan työntekijä, jonka palkka on sovittu viikolta tai pidemmältä ajalta, saa tämän palkkansa myös vuosiloman ajalta. Jos loma ei kata koko palkanmaksukautta, palkka suhteutetaan loma- ja työpäiviin. ${FI.eur(3000)} kuukausipalkalla kesäkuun palkka on siis ${FI.eur(3000)}, vaikka koko kuukausi olisi lomaa.` },
      { q: 'Onko lomaraha lakisääteinen?', a: `Ei ole. Työsuojeluhallinnon mukaan lomaraha tai lomaltapaluuraha perustuu työehtosopimukseen, ja tyypillinen taso on ${L.lomaraha_esimerkki_prosentti} % lomapalkasta. Jos alallasi ei ole työehtosopimusta eikä työsopimuksessa sovita lomarahasta, sitä ei tarvitse maksaa. Esimerkiksi ${FI.eur(3000)} kuukausipalkalla ja ${TAYSI} lomapäivällä ${L.lomaraha_esimerkki_prosentti} prosentin lomaraha on ${FI.eur(LR.lomaraha)}.` },
      { q: 'Paljonko lomakorvausta saa, jos täysiä kuukausia ei kerry?', a: `Korvaus on ${FI.num(PROS_ALLE, 0)} % lomanmääräytymisvuoden aikana työssäolon ajalta maksetusta palkasta, tai ${FI.num(PROS_YLI, 1)} %, jos työsuhde on jatkunut vähintään vuoden. ${FI.eur(VUOSIANSIO)} vuosiansiolla summa on ensimmäisenä vuonna ${FI.eur(PA)} ja sen jälkeen ${FI.eur(PY)}. Lisäksi voit halutessasi pitää ${L.lomapaivat_kk_alle_vuosi} vapaapäivää jokaiselta kalenterikuukaudelta.` },
      { q: 'Kauanko pitämättömän lomapalkan voi vaatia jälkikäteen?', a: `Vuosilomalakiin perustuvat lomapalkka- ja lomakorvaussaatavat vanhenevat ${L.vanhentuminen_v} vuodessa. Jos työnantaja on maksanut lomapalkan liian pienenä tai jättänyt lomakorvauksen maksamatta, vaatimus kannattaa esittää kirjallisesti ennen määräajan päättymistä. Palkkalaskelmista ja työvuorolistoista näet, montako täyttä kuukautta sinulle on kertynyt. Vanhat palkkalaskelmat kannattaa siksi säilyttää vähintään ${L.vanhentuminen_v} vuotta työsuhteen päättymisen jälkeen.` },
    ],
    body: (h) => `
<h2>Kertymä kuukausittain</h2>
<p>Vuosilomalain ${h.num(5)} § on lyhyt: jokaiselta täydeltä lomanmääräytymiskuukaudelta kertyy ${h.num(L.lomapaivat_kk, 1)} arkipäivää lomaa, ja ensimmäisenä vuonna ${L.lomapaivat_kk_alle_vuosi}. Raja vuoden ja alle vuoden välillä katsotaan 31.3., ja päivän osat pyöristetään ylöspäin. Alla oleva taulukko näyttää molemmat kertymät rinnakkain.</p>
${h.table(['Täysiä kuukausia', 'Työsuhde alle vuoden 31.3.', 'Työsuhde vähintään vuoden'], KK.map((k) => [h.num(k), h.num(lomapaivat(k, true)), h.num(lomapaivat(k))]), 'Vuosilomapäivät (arkipäiviä) lomanmääräytymisvuodelta 1.4.–31.3.', ['l', 'r', 'r'])}
<p>Pyöristys näkyy parittomilla kuukausilla. Viidestä täydestä kuukaudesta kertyy ${h.num(L.lomapaivat_kk * OSA_KK, 1)} päivää, josta tulee ${h.num(lomapaivat(OSA_KK))}. Lomapäivät ovat arkipäiviä, joten ${TAYSI} päivää vastaa ${h.num(VIIKOT)} kuuden arkipäivän viikkoa.</p>
<h2>Täysi kuukausi: ${L.taysi_kk_paivat} päivää tai ${L.taysi_kk_tunnit} tuntia</h2>
<p>Kuukausi kerryttää lomaa vain, jos se on täysi. Pääsääntö on vähintään ${L.taysi_kk_paivat} työssäolopäivää kalenterikuukaudessa. Kokoaikaisella tämä täyttyy lähes aina, mutta kuukausi, jona työsuhde alkaa 20. päivä, ei välttämättä riitä.</p>
<p>Osa-aikatyössä ratkaisee sopimus. Jos työpäiviä on sopimuksen mukaan niin vähän, ettei yksikään kuukausi yllä ${L.taysi_kk_paivat} päivään, sovelletaan tuntisääntöä: kuukausi on täysi, kun tunteja kertyy vähintään ${L.taysi_kk_tunnit}. Kahtena päivänä viikossa seitsemän tuntia tekevä kerryttää siis täysiä kuukausia, vaikka päivärajasta jäätäisiin kauas. Rajalla liikutaan nopeasti: kuusi kuuden tunnin vuoroa kuukaudessa tuo ${h.num(6 * 6)} tuntia ja täyden kuukauden, viisi vuoroa vain ${h.num(5 * 6)} tuntia eikä täyttä kuukautta.</p>
<h2>Työsuhteen alku ja loppu kesken kuukauden</h2>
<p>Aloituskuukausi kerryttää lomaa vain, jos siihen ehtii kertyä ${L.taysi_kk_paivat} työssäolopäivää. Kuun puolivälissä aloittava kokoaikainen ylittää rajan yleensä niukasti, mutta 20. päivän jälkeen aloittava ei. Sama koskee viimeistä kuukautta. Ero on enimmillään ${h.num(L.lomapaivat_kk, 1)} lomapäivää, joten aloitus- ja lopetuspäivästä kannattaa sopia tämä mielessä. Kun työsuhde päättyy, kertyneet mutta pitämättömät päivät maksetaan rahana.</p>
<h2>Kun täysiä kuukausia ei kerry</h2>
<p>Pienellä tuntimäärällä työskentelevä ei välttämättä saa yhtään täyttä kuukautta. Silloin vuosilomalain ${h.num(8)} § antaa oikeuden pitää halutessaan ${L.lomapaivat_kk_alle_vuosi} arkipäivää vapaata jokaiselta kalenterikuukaudelta, ja raha tulee lomakorvauksena. Vapaa on työntekijän oikeus, ei velvollisuus: jos et halua pitää vapaapäiviä, saat silti prosenttiperusteisen korvauksen. Korvaus on ${h.num(PROS_ALLE, 0)} % lomanmääräytymisvuoden aikana työssäolon ajalta maksetusta palkasta, tai ${h.num(PROS_YLI, 1)} %, jos työsuhde on jatkunut vähintään vuoden.</p>
<p>${h.eur(VUOSIANSIO)} vuosiansiolla ero on selvä: ensimmäisenä vuonna korvaus on ${h.eur(PA)}, vähintään vuoden työsuhteessa ${h.eur(PY)}. Prosentin pohjana on työssäolon ajalta maksettu palkka, joten jokainen tehty tunti kasvattaa korvausta. Tämä tapa sopii erityisesti keikka- ja tarvetyöhön, jossa tunnit vaihtelevat kuukaudesta toiseen.</p>
<h2>Lomapäivät kalenterissa</h2>
<p>Lomapäivät ovat arkipäiviä, ja arkipäiviin kuuluu lauantai. Maanantaista sunnuntaihin kestävä lomaviikko kuluttaa siksi kuusi lomapäivää, ei viittä. ${TAYSI} päivän saldo riittää ${h.num(VIIKOT)} viikon lomaan, ja yksittäinen vapaa perjantai kuluttaa yhden päivän. Moni ulkomailta tullut laskee lomansa työpäivinä ja yllättyy, kun saldo hupenee nopeammin kuin odotti. Kolmen viikon kesäloma kuluttaa ${h.num(3 * 6)} päivää, jolloin talvelle jää vielä ${h.num(TAYSI - 3 * 6)} päivää eli ${h.num((TAYSI - 3 * 6) / 6)} viikkoa. Arkipyhät eivät ole arkipäiviä, joten esimerkiksi juhannusviikolla loma kuluttaa saldoa vähemmän.</p>
<h2>Kolme työntekijää, kolme laskutapaa</h2>
${h.table(['Työntekijä', 'Täysiä kuukausia', 'Lomaa kertyy', 'Loman ajan raha'], [
  ['Kokoaikainen, kuukausipalkka', h.num(12), `${h.num(TAYSI)} päivää`, 'kuukausipalkka jatkuu'],
  [`Osa-aikainen, vähintään ${L.taysi_kk_tunnit} h/kk`, h.num(12), `${h.num(TAYSI)} päivää`, 'kuukausipalkka jatkuu'],
  [`Tarvetyö, alle ${L.taysi_kk_tunnit} h/kk, ${h.eur(VUOSIANSIO)}/v`, h.num(0), `${L.lomapaivat_kk_alle_vuosi} vapaapäivää/kk`, `${h.eur(PY)} (${h.num(PROS_YLI, 1)} %)`],
], 'Vuosiloma eri työaikamuodoissa, vähintään vuoden työsuhde', ['l', 'r', 'l', 'l'])}
<p>Taulukko näyttää, että osa-aikaisuus ei sinänsä pienennä lomaa, kunhan tuntiraja täyttyy. Ratkaiseva raja kulkee siinä, kertyykö kuukaudelle ${L.taysi_kk_tunnit} tuntia.</p>
<h2>Lomapalkka kuukausipalkkaiselle</h2>
<p>Kun palkka on sovittu kuukaudelta, lomalla jatkuu sama kuukausipalkka. Lomakuukauden palkkalaskelma näyttää käytännössä samalta kuin muutkin, ja ${h.a('nettopalkka-3000', `${h.eur(3000)} kuukausipalkan`)} netto on lomalla sama kuin töissä. Jos loma alkaa tai päättyy kesken palkanmaksukauden, palkka jaetaan loma- ja työpäivien suhteessa.</p>
<p>Lomaraha on eri asia. Laki ei tunne sitä, mutta useimmat työehtosopimukset maksavat sen, tyypillisesti ${L.lomaraha_esimerkki_prosentti} % lomapalkasta. Laskurimme hinnoittelee lomapäivän samalla jakajalla ${L.lomakorvaus_jakaja_kk}, jota laki käyttää lomakorvauksessa: ${h.eur(3000)} palkalla ja ${TAYSI} päivällä lomapalkka on ${h.eur(LR.lomapalkka)} ja lomaraha ${h.eur(LR.lomaraha)}. Tarkka laskelma on ${h.a('lomaraha-laskuri', 'lomarahalaskurissa')}.</p>
<h2>Esimerkkejä</h2>
<ul>
<li>Aloitit 1.9.2025. Maaliskuun 2026 loppuun on seitsemän täyttä kuukautta, työsuhde alle vuoden: ${h.num(UUSI7)} lomapäivää.</li>
<li>Aloitit 1.3.2025. Työsuhde on 31.3.2026 kestänyt vuoden, ja huhtikuusta maaliskuuhun kertyi ${h.num(12)} täyttä kuukautta: ${h.num(TAYSI)} lomapäivää.</li>
<li>Olit vuoden aikana kaksi kuukautta palkattomalla vapaalla, jonka aikana työpäiviä ei kertynyt: ${h.num(10)} täyttä kuukautta ja ${h.num(lomapaivat(10))} lomapäivää.</li>
</ul>
<p>Sivun minilaskuri tekee saman laskelman omilla kuukausillasi. Jos työsuhde päättyy ennen kuin ehdit pitää lomasi, pitämättömät päivät maksetaan ${h.a('lomakorvaus', 'lomakorvauksena')}.</p>
<p>Lähteet: ${h.src('finlex_vuosiloma', 'vuosilomalaki 162/2005')} ja ${h.src('tyosuojelu_lomapalkka', 'Työsuojeluhallinto, lomapalkka ja -korvaus')}.</p>`,
  },
  en: {
    slug: 'annual-leave-accrual',
    nav: 'Annual leave accrual',
    card: 'How many holiday days you earn each month in Finland, when a month counts and how holiday pay works.',
    title: `Annual Leave Accrual 2026: ${EN.num(L.lomapaivat_kk, 1)} Days per Full Month`,
    description: `Annual leave accrual 2026 in Finland: ${EN.num(L.lomapaivat_kk, 1)} days per full month, ${L.lomapaivat_kk_alle_vuosi} in your first year, ${TAYSI} days after a full year. When a month counts and how holiday pay is set.`,
    h1: 'How annual leave builds up in Finland',
    intro: 'The Annual Holidays Act (vuosilomalaki) decides how many days you earn and what you are paid while away.',
    resume: `Under the Finnish Annual Holidays Act (vuosilomalaki), you earn ${EN.num(L.lomapaivat_kk, 1)} working days (arkipäivää) of leave for each full month of work, which adds up to ${TAYSI} days, or ${EN.num(VIIKOT)} six-day weeks, over a full holiday credit year. If your employment had lasted less than a year without a break by 31 March, you earn ${L.lomapaivat_kk_alle_vuosi} days a month instead, rounded up to whole days. The credit year (lomanmääräytymisvuosi) runs from 1 April to 31 March, which surprises many people arriving from countries that use the calendar year: someone who started in September has ${UUSI7} days by the following summer. A month counts as full with at least ${L.taysi_kk_paivat} days at work; if your contract has too few days for that ever to happen, ${L.taysi_kk_tunnit} hours in the month are enough. On a monthly salary you simply keep your normal pay during leave. Workers who never reach a full month get ${L.lomapaivat_kk_alle_vuosi} days off a month plus compensation of ${EN.num(PROS_ALLE, 0)}% of the year’s pay, or ${EN.num(PROS_YLI, 1)}% after a year of employment. The holiday bonus (lomaraha) is not in the act at all; it comes from collective agreements.`,
    faqs: [
      { q: 'How many days of annual leave do I get in my first year in Finland?', a: `${L.lomapaivat_kk_alle_vuosi} days for each full month until 31 March, if your employment has lasted less than a year by then. Starting on 1 September gives seven full months and ${UUSI7} days for the next summer. From the following April you earn ${EN.num(L.lomapaivat_kk, 1)} days a month, or ${TAYSI} for a full year. Days are working days, Saturdays included, so ${TAYSI} days is ${EN.num(VIIKOT)} weeks.` },
      { q: 'I work part time, two days a week. Do I earn annual leave?', a: `Yes. When your contract has too few working days ever to reach ${L.taysi_kk_paivat} in a month, a month counts as full once you work at least ${L.taysi_kk_tunnit} hours. Two seven-hour days a week clears that easily. If you stay under ${L.taysi_kk_tunnit} hours, you get ${L.lomapaivat_kk_alle_vuosi} days off per month on request, paid as ${EN.num(PROS_ALLE, 0)}% or ${EN.num(PROS_YLI, 1)}% of your wages.` },
      { q: 'Is holiday bonus required by law in Finland?', a: `No. The Occupational Safety and Health Administration states that holiday bonus is agreed in collective agreements, not in the Annual Holidays Act, typically at ${L.lomaraha_esimerkki_prosentti}% of holiday pay. If your sector has no collective agreement and your contract says nothing, your employer does not have to pay it. Check your contract for the words lomaraha or lomaltapaluuraha.` },
      { q: 'Does my salary continue while I am on annual leave?', a: `On a weekly or monthly salary, yes: section ${EN.num(10)} of the act says you keep the same pay during leave. If the leave covers only part of a pay period, pay is split between holiday and working days. On ${EN.eur(3000)} a month, a June spent entirely on holiday still pays ${EN.eur(3000)}, plus any holiday bonus under your collective agreement.` },
      { q: 'Why does my Finnish leave year run from April to March?', a: `Because the act uses a holiday credit year (lomanmääräytymisvuosi) from 1 April to 31 March rather than the calendar year. Your status on 31 March decides if you earn ${L.lomapaivat_kk_alle_vuosi} or ${EN.num(L.lomapaivat_kk, 1)} days a month for that year, and a fresh count starts every 1 April. Leave earned in May therefore belongs to the year that ends the following March.` },
      { q: 'How long can I claim unpaid holiday pay from a former employer?', a: `Holiday pay and holiday compensation based on the Annual Holidays Act expire after ${L.vanhentuminen_v} years. Put the claim in writing well before then and attach payslips or rosters showing your full months. Each month you can prove adds ${EN.num(L.lomapaivat_kk, 1)} days, or ${L.lomapaivat_kk_alle_vuosi} in the first year, to the total.` },
    ],
    body: (h) => `
<h2>Days earned, month by month</h2>
<p>Section ${h.num(5)} of the act sets the rate: ${h.num(L.lomapaivat_kk, 1)} working days for each full holiday credit month, ${L.lomapaivat_kk_alle_vuosi} in the first year. Your first-year status is checked on 31 March, and part days are rounded up. The table shows both scales.</p>
${h.table(['Full months', 'Employed under a year on 31 March', 'Employed a year or more'], KK.map((k) => [h.num(k), h.num(lomapaivat(k, true)), h.num(lomapaivat(k))]), 'Annual leave days for the credit year 1 April to 31 March', ['l', 'r', 'r'])}
<p>Rounding shows up on odd months: five full months give ${h.num(L.lomapaivat_kk * OSA_KK, 1)} days, which becomes ${h.num(lomapaivat(OSA_KK))}. Because leave is counted in working days including Saturdays, ${TAYSI} days equal ${h.num(VIIKOT)} weeks off.</p>
<h2>What makes a month “full”</h2>
<p>Only full months earn leave. The main test is at least ${L.taysi_kk_paivat} days at work in the calendar month. Full-time staff pass almost every month, but the month you start can fail if you begin late in it.</p>
<p>For part-timers the contract decides. If it gives you so few days that ${L.taysi_kk_paivat} is out of reach, the hours test applies instead: ${L.taysi_kk_tunnit} hours in the month make it full. Only one of the two tests applies to you at a time, so a four-day-a-week worker is judged on days and a two-day-a-week worker on hours.</p>
<h2>If you never reach a full month</h2>
<p>Very short hours can mean no full months at all. Section ${h.num(8)} then gives you the right to take ${L.lomapaivat_kk_alle_vuosi} working days off per calendar month if you want them, and the money comes as holiday compensation: ${h.num(PROS_ALLE, 0)}% of the wages paid for the credit year, or ${h.num(PROS_YLI, 1)}% once the job has lasted at least a year. On ${h.eur(VUOSIANSIO)} of yearly wages that is ${h.eur(PA)} in the first year and ${h.eur(PY)} afterwards.</p>
<h2>Leave days on the calendar</h2>
<p>Leave is counted in working days, and Saturday is one of them. A Monday-to-Sunday week off therefore uses six days of your balance, not five, and ${TAYSI} days cover ${h.num(VIIKOT)} weeks. Colleagues from countries that count holiday in five-day weeks often find their balance shrinking faster than expected; a single Friday off costs one day.</p>
<h2>Pay during leave</h2>
<p>With a monthly salary, your pay simply continues. The payslip for a holiday month looks like any other, and the take-home on ${h.a('nettopalkka-3000', `${h.eur(3000)} a month`)} does not change while you are away. When leave starts or ends mid-period, pay is split pro rata.</p>
<p>The holiday bonus is separate. Most collective agreements pay it, commonly ${L.lomaraha_esimerkki_prosentti}% of holiday pay, usually around the summer holiday. Our calculator prices a leave day with the divisor of ${L.lomakorvaus_jakaja_kk} that the act uses for holiday compensation: on ${h.eur(3000)} and ${TAYSI} days, holiday pay comes to ${h.eur(LR.lomapalkka)} and a ${L.lomaraha_esimerkki_prosentti}% bonus to ${h.eur(LR.lomaraha)}. The ${h.a('lomaraha-laskuri', 'holiday bonus calculator')} runs your own figures.</p>
<h2>Three typical cases</h2>
<ul>
<li>You started on 1 September 2025: seven full months by 31 March 2026, under a year employed, ${h.num(UUSI7)} days.</li>
<li>You started on 1 March 2025: a year employed on 31 March 2026 and ${h.num(12)} full months since April, ${h.num(TAYSI)} days.</li>
<li>Two months of unpaid leave with no working days during the year: ${h.num(10)} full months, ${h.num(lomapaivat(10))} days.</li>
</ul>
<p>The mini calculator above handles your own months. If the job ends before you use your days, they are paid out as ${h.a('lomakorvaus', 'holiday compensation')}.</p>
<p>Sources: ${h.src('finlex_vuosiloma', 'Annual Holidays Act 162/2005')} and ${h.src('tyosuojelu_lomapalkka', 'Occupational Safety and Health Administration, holiday pay and compensation')}.</p>`,
  },
});
