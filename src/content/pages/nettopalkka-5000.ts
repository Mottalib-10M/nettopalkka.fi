import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kuukausiNetto, laskeVerot } from '../../lib/engine/vero';
import { ansiopaivaraha, vanhempainraha } from '../../lib/engine/paivaraha';

const V = P.vero;
const T = P.tyottomyys;
const TT = V.tyotulovahennys;
const PALKKA = 5000;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const KK = R.netto / 12;
const KIRKKO = kuukausiNetto(PALKKA, { kunta: 'Helsinki', kirkko: 'evl' });
const AS = V.valtion_asteikko;
const YLIN = AS[AS.length - 1];
/** Valtionvero portaittain: kuinka paljon verotettavaa tuloa osuu kullekin portaalle. */
const PORTAAT = AS.map((p, i) => {
  const yla = i + 1 < AS.length ? AS[i + 1].alaraja : Infinity;
  const osa = Math.max(0, Math.min(R.verotettava, yla) - p.alaraja);
  return { p, yla, osa, vero: osa * p.prosentti / 100 };
});
const YLIN_OSA = PORTAAT[PORTAAT.length - 1].osa;
/** Rajavero: sadan euron korotuksesta jäävä osuus. */
const KOR = (kuukausiNetto(PALKKA + 100, { kunta: 'Helsinki' }).netto - R.netto) / 12;
/** Ansiopäiväraha ja taitekohta: korvausaste laskee palkan noustessa. */
const TAITE = T.taitekohta_kerroin * T.perusosa_pv;
const AP = [3000, 4000, 5000, 6000].map((kk) => ({ kk, a: ansiopaivaraha(kk), netto: kuukausiNetto(kk, { kunta: 'Helsinki' }).netto / 12 }));
const A = AP[2].a;
/** Kuukausipalkka, jolla verotettava tulo saavuttaa ylimmän portaan rajan (10 euron tarkkuudella). */
let RAJAPALKKA = 4000;
while (laskeVerot({ tulo: RAJAPALKKA * 12, kunta: 'Helsinki' }).verotettava < YLIN.alaraja) RAJAPALKKA += 10;
/** Vanhempainraha: vuositulo on rajojen 45 744 ja 70 379 välissä (40 prosentin osuus). */
const VP = P.vanhempainraha;
const VR = vanhempainraha(PALKKA * 12);

export default definePage({
  id: 'nettopalkka-5000',
  group: 'palkka',
  order: 60,
  mini: 'nettoSumma',
  miniDefaults: { p: 5000 },
  related: ['nettopalkka-4000', 'nettopalkka-7000', 'marginaalivero', 'ansiosidonnainen-laskuri'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-5000',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Valtion ylin veroporras ja ansiosidonnaisen taitekohta: ${FI.eur(PALKKA)} palkan verot ja työttömyysturva.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: valtion ylin veroporras alkaa`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: käteen ${FI.eur(KK)}, verokortissa ${FI.num(R.veroprosentti, 1)} %. Valtion ylin ${FI.num(YLIN.prosentti, 1)} prosentin porras ja ansiopäivärahan taitekohta laskettuina valmiiksi.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Viiden tuhannen euron palkka ulottuu jo valtion ylimmälle veroportaalle, ja työttömyysturva korvaa siitä selvästi alle puolet.`,
    resume: `Viiden tuhannen euron bruttopalkasta jää helsinkiläiselle vuonna 2026 käteen keskimäärin ${FI.eur(KK)} kuukaudessa, ja verokortin prosentti on ${FI.num(R.veroprosentti, 1)} %, kirkon jäsenellä ${FI.num(KIRKKO.veroprosentti, 1)} %. Vuositulo ${FI.eur(PALKKA * 12)} tuo verotettavaa tuloa noin ${FI.eur(R.verotettava)}, joten ${FI.eur(YLIN_OSA)} siitä on jo valtion tuloveroasteikon ylimmällä portaalla, joka alkaa ${FI.eur(YLIN.alaraja)} kohdalla ja jolla vero on ${FI.num(YLIN.prosentti, 2)} %. Toisaalta puhdas ansiotulo ${FI.eur(R.puhdasAnsiotulo)} on ohittanut rajan ${FI.eur(TT.pienenemisen_ylaraja)}, jonka jälkeen työtulovähennys ei enää pienene vaan pysyy ${FI.eur(R.tyotulovahennys)} suuruisena. Lisäeurosta jää käteen noin ${FI.num(KOR, 0)} senttiä. Työttömyysturvassa palkka on ylittänyt taitekohdan ${FI.eur(TAITE, 2)}, jonka yli menevästä palkan osasta ansio-osaa maksetaan vain ${FI.num(T.ansio_osa_yli_taitekohdan)} %. Täysi ansiopäiväraha olisi ${FI.eur(A.taysiKk)} kuussa, alle puolet bruttopalkasta, joten säästöpuskurin merkitys kasvaa tällä tulotasolla.`,
    faqs: [
      { q: `Paljonko valtionveroa ${FI.eur(PALKKA)} kuukausipalkasta maksetaan vuodessa?`, a: `Asteikon mukaan laskettu vero on ${FI.eur(R.valtionveroEnnen)}, ja kun siitä vähennetään työtulovähennys ${FI.eur(R.tyotulovahennys)}, maksettavaksi jää ${FI.eur(R.valtionvero)}. Summa on suurempi kuin Helsingin kunnallisvero ${FI.eur(R.kunnallisvero)}. Ylimmällä ${FI.num(YLIN.prosentti, 2)} prosentin portaalla on verotettavasta tulosta vasta ${FI.eur(YLIN_OSA)}, joten portaan vaikutus kasvaa vasta palkan noustessa.` },
      { q: `Paljonko ansiosidonnaista saa ${FI.eur(PALKKA)} palkan jälkeen?`, a: `Täysi ansiopäiväraha on ${FI.eur(A.taysiPv, 2)} päivässä eli noin ${FI.eur(A.taysiKk)} kuukaudessa, kun olet kassan jäsen ja työssäoloehto täyttyy. Taitekohdan ${FI.eur(TAITE, 2)} ylittävästä palkan osasta ansio-osa on vain ${FI.num(T.ansio_osa_yli_taitekohdan)} %. Porrastus laskee summan ${FI.eur(A.porras1Kk)} tasolle ${T.porrastus[0].paivia} maksupäivän jälkeen.` },
      { q: `Mikä on veroprosentti ${FI.eur(PALKKA)} palkalla kirkon jäsenenä?`, a: `Helsingissä evankelis-luterilaisen seurakunnan jäsenen verokorttiin tulee ${FI.num(KIRKKO.veroprosentti, 1)} %, kun muilla prosentti on ${FI.num(R.veroprosentti, 1)} %. Kirkollisveroa kertyy ${FI.eur(KIRKKO.kirkollisvero)} vuodessa, ja nettopalkka pienenee noin ${FI.eur((R.netto - KIRKKO.netto) / 12)} kuukaudessa. Seurakunnan veroprosentti vaihtelee kunnittain, joten summa riippuu asuinpaikasta ja siitä, mihin seurakuntaan juuri sinä kuulut.` },
      { q: `Paljonko vanhempainrahaa saa ${FI.eur(PALKKA)} kuukausipalkalla?`, a: `Kela vähentää ${FI.eur(PALKKA * 12)} vuositulosta ${FI.num(VP.vakuutusmaksuvahennys_prosentti, 2)} %, ja jäljelle jäävä ${FI.eur(VR.vuositulo)} ylittää rajan ${FI.eur(VP.rajat[1])}. Rajan alittava osa korvataan ${FI.num(VP.prosentit[0])} prosentilla ja ylittävä osa vain ${FI.num(VP.prosentit[1])} prosentilla, joten päiväraha on ${FI.eur(VR.pv, 2)} arkipäivältä. Korotettuina päivinä se on ${FI.eur(VR.korotettuPv, 2)}.` },
    ],
    body: (h) => `
<h2>Verotettava tulo ylittää ${h.eur(YLIN.alaraja)}</h2>
<p>Valtion tuloveroasteikossa on vuonna 2026 viisi porrasta, ja ${h.eur(PALKKA)} kuukausipalkka on ensimmäinen pyöreä palkkataso, jolla verotettavaa tuloa riittää kaikille niille. Taulukko purkaa valtionveron portaittain. Alin porras verottaa ${h.num(AS[0].prosentti, 2)} prosentilla, ja jokainen seuraava porras koskee vain sitä osaa tulosta, joka ylittää edellisen rajan. Ylimmälle portaalle osuu tällä palkalla ${h.eur(YLIN_OSA)}, joten sen paino on vielä pieni: suurin osa verosta kertyy kolmannelta ja neljänneltä portaalta. Tärkeämpää on, että jokainen tuleva palkankorotus verotetaan nyt ylimmällä valtion prosentilla ${h.num(YLIN.prosentti, 2)} %. Sen päälle tulevat kunnallisvero, sairausvakuutusmaksut sekä työeläke- ja työttömyysvakuutusmaksu, jolloin sadan euron korotuksesta jää Helsingissä käteen ${h.eur(KOR, 2)}. Asteikko on Suomessa progressiivinen vain valtionverossa; kunnallisvero, sairaanhoitomaksu ja eläkemaksu peritään tasaprosentilla. Taulukon summa vastaa valtionveroa ennen työtulovähennystä. Helsingissä ylimmän portaan raja ylittyy noin ${h.eur(RAJAPALKKA)} kuukausipalkalla; sitä pienemmillä palkoilla lisäeuron valtionvero on ${h.num(AS[3].prosentti, 2)} %. Lomaraha, bonukset ja luontoisedut lasketaan samaan vuosituloon, joten raja voi ylittyä jo pienemmällä kuukausipalkalla.</p>
${h.table(['Porras', 'Verotettava tulo portaalla', 'Prosentti', 'Vero'], PORTAAT.map((x) => [x.yla === Infinity ? `yli ${h.eur(x.p.alaraja)}` : `${h.eur(x.p.alaraja)} – ${h.eur(x.yla)}`, h.eur(x.osa), `${h.num(x.p.prosentti, 2)} %`, h.eur(x.vero)]).concat([['Yhteensä', h.eur(R.verotettava), '', h.eur(R.valtionveroEnnen)], ['Työtulovähennyksen jälkeen', '', '', h.eur(R.valtionvero)]]), `Valtionvero ${h.eur(PALKKA * 12)} vuosipalkasta, 2026`, ['l', 'r', 'r', 'r'])}
<h2>Työtulovähennys vakiintuu</h2>
<p>Keskituloisten palkkoja raskauttanut työtulovähennyksen leikkaus päättyy, kun puhdas ansiotulo ylittää ${h.eur(TT.pienenemisen_ylaraja)}. ${h.eur(PALKKA)} palkalla puhdasta ansiotuloa on ${h.eur(R.puhdasAnsiotulo)}, joten vähennys on lukittunut ${h.num(R.tyotulovahennys)} euroon ja pysyy siinä myös suuremmilla palkoilla. Lisäeuroa kohden se tarkoittaa kahden sentin kevennystä, mutta ylimmän portaan alkaminen syö sen. Lapsiperheessä vähennys on hieman suurempi, koska jokainen alaikäinen lapsi korottaa enimmäismäärää ${h.eur(TT.lapsikorotus)}, ja yksinhuoltajalla korotus on kaksinkertainen. Korotuksen saa alaikäisen lapsen huoltaja, ja koska työtulovähennys vähennetään suoraan verosta, jokainen korotuseuro pienentää veroja euron verran.</p>
<h2>Ansiosidonnaisen korvausaste putoaa</h2>
<p>Työttömyysturvassa ${h.eur(PALKKA)} palkka tarkoittaa, että osa palkasta jää lähes korvauksetta. Ansio-osa on ${h.num(T.ansio_osa_prosentti)} % päiväpalkan ja perusosan erotuksesta taitekohtaan ${h.eur(TAITE, 2)} asti ja vain ${h.num(T.ansio_osa_yli_taitekohdan)} % sen yli. Taulukko näyttää, miten päiväraha suhteessa palkkaan laskee palkan noustessa. Kun päivärahaa on maksettu ${h.num(T.porrastus[0].paivia)} päivältä, se porrastuu ${h.num(T.porrastus[0].prosentti)} prosenttiin ja ${h.num(T.porrastus[1].paivia)} päivän jälkeen ${h.num(T.porrastus[1].prosentti)} prosenttiin täydestä määrästä. Kassa pidättää päivärahasta veroa vähintään ${h.num(T.ennakonpidatys_vahintaan)} %, joten käteen jäävä summa on selvästi taulukon lukuja pienempi. Jo täysi päiväraha ennen veroja jää nykyisestä nettopalkasta ${h.eur(KK - A.taysiKk)} kuukaudessa. Oman summan voi laskea ${h.a('ansiosidonnainen-laskuri', 'ansiosidonnaisen laskurilla')} ja rajaveron vaikutuksen sivulta ${h.a('marginaalivero', 'marginaalivero')}.</p>
${h.table(['Bruttopalkka / kk', 'Nettopalkka / kk', 'Ansiopäiväraha / kk', 'Päiväraha bruttopalkasta'], AP.map((x) => [h.eur(x.kk), h.eur(x.netto), h.eur(x.a.taysiKk), h.pct(x.a.taysiKk / x.kk)]), 'Täysi ansiopäiväraha ennen veroja, Helsinki, 2026', ['l', 'r', 'r', 'r'])}`,
  },
  en: {
    slug: 'net-salary-5000',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `Finland's top state tax band and the unemployment benefit turning point: tax and cover on ${EN.eur(PALKKA)} a month.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: entering the top tax band`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: ${EN.eur(KK)} after tax at a ${EN.num(R.veroprosentti, 1)}% card rate, plus the ${EN.num(YLIN.prosentti, 1)}% top band and the much lower unemployment cover you get.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `Five thousand a month reaches the top of Finland's state tax scale, and unemployment insurance replaces well under half of it.`,
    resume: `On a gross salary of ${EN.eur(PALKKA)} a month, a Helsinki resident takes home around ${EN.eur(KK)} a month in 2026, with a ${EN.num(R.veroprosentti, 1)}% card rate, or ${EN.num(KIRKKO.veroprosentti, 1)}% for a church member. Annual pay of ${EN.eur(PALKKA * 12)} gives taxable income of about ${EN.eur(R.verotettava)}, so ${EN.eur(YLIN_OSA)} already falls in the top state band, which starts at ${EN.eur(YLIN.alaraja)} and is taxed at ${EN.num(YLIN.prosentti, 2)}%. On the positive side, net earned income of ${EN.eur(R.puhdasAnsiotulo)} is past ${EN.eur(TT.pienenemisen_ylaraja)}, where the earned income tax credit (työtulovähennys) stops shrinking and stays at ${EN.eur(R.tyotulovahennys)}. Of each extra euro you keep about ${EN.num(KOR, 0)} cents. Unemployment cover is where high earners feel the squeeze: the part of your pay above the turning point (taitekohta) of ${EN.eur(TAITE, 2)} a month earns only ${EN.num(T.ansio_osa_yli_taitekohdan)}% in the earnings-related component. Full earnings-related allowance would be ${EN.eur(A.taysiKk)} a month, less than half your gross pay, which is worth knowing when you size your emergency savings.`,
    faqs: [
      { q: `How much Finnish state income tax is paid on ${EN.eur(PALKKA)} a month?`, a: `The scale gives ${EN.eur(R.valtionveroEnnen)} a year; after the ${EN.eur(R.tyotulovahennys)} earned income credit, ${EN.eur(R.valtionvero)} is payable. That is more than your Helsinki municipal tax of ${EN.eur(R.kunnallisvero)}. Only ${EN.eur(YLIN_OSA)} of taxable income sits in the ${EN.num(YLIN.prosentti, 2)}% top band at this salary, so its effect grows mainly as your pay rises further.` },
      { q: `What would my unemployment fund pay after a ${EN.eur(PALKKA)} salary?`, a: `With fund (kassa) membership and the employment condition met, the full allowance is ${EN.eur(A.taysiPv, 2)} a day, roughly ${EN.eur(A.taysiKk)} a month before tax. Pay above ${EN.eur(TAITE, 2)} a month is compensated at only ${EN.num(T.ansio_osa_yli_taitekohdan)}%. After ${T.porrastus[0].paivia} paid days the allowance steps down to ${EN.eur(A.porras1Kk)}, so a cash buffer matters more at this income.` },
      { q: `How much Kela parental allowance is paid on ${EN.eur(PALKKA)} a month?`, a: `Kela trims your ${EN.eur(PALKKA * 12)} annual income by ${EN.num(VP.vakuutusmaksuvahennys_prosentti, 2)}% to ${EN.eur(VR.vuositulo)}, which is above ${EN.eur(VP.rajat[1])}. Income up to that line is replaced at ${EN.num(VP.prosentit[0])}% and the rest at only ${EN.num(VP.prosentit[1])}%, giving ${EN.eur(VR.pv, 2)} per weekday, or ${EN.eur(VR.korotettuPv, 2)} on the higher-rate days at the start.` },
      { q: `What is the tax card rate on ${EN.eur(PALKKA)} a month for a church member in Helsinki?`, a: `${EN.num(KIRKKO.veroprosentti, 1)}%, compared with ${EN.num(R.veroprosentti, 1)}% without membership. Church tax comes to ${EN.eur(KIRKKO.kirkollisvero)} a year and lowers take-home pay by about ${EN.eur((R.netto - KIRKKO.netto) / 12)} a month. Parish rates differ by municipality, so the figure depends on where you live and which parish you belong to.` },
    ],
    body: (h) => `
<h2>All five state bands in use</h2>
<p>Finland's state income tax has five bands in 2026, and ${h.eur(PALKKA)} a month is the first round salary that reaches every one of them. The table splits your state tax by band. The lowest slice is taxed at ${h.num(AS[0].prosentti, 2)}%, and each higher rate applies only to income above the previous threshold, never to the whole salary. At this pay only ${h.eur(YLIN_OSA)} reaches the top band, so most state tax still comes from the third and fourth bands. What changes is the treatment of future raises: every one of them now pays the ${h.num(YLIN.prosentti, 2)}% top state rate, plus flat-rate municipal tax, health insurance contributions, and pension and unemployment premiums. In Helsinki ${h.eur(KOR, 2)} of a ${h.eur(100)} raise reaches you. Only state tax is progressive in Finland; everything else is a flat percentage. The total in the table is state tax before the work credit. In Helsinki the top band starts to apply from roughly ${h.eur(RAJAPALKKA)} a month; below that, the state takes ${h.num(AS[3].prosentti, 2)}% of each extra euro. Holiday bonus, bonuses and taxable benefits all count towards the same annual figure, so you can reach the band on a lower base salary.</p>
${h.table(['Band', 'Taxable income in band', 'Rate', 'Tax'], PORTAAT.map((x) => [x.yla === Infinity ? `over ${h.eur(x.p.alaraja)}` : `${h.eur(x.p.alaraja)} – ${h.eur(x.yla)}`, h.eur(x.osa), `${h.num(x.p.prosentti, 2)}%`, h.eur(x.vero)]).concat([['Total', h.eur(R.verotettava), '', h.eur(R.valtionveroEnnen)], ['After the work credit', '', '', h.eur(R.valtionvero)]]), `State tax on ${h.eur(PALKKA * 12)} a year, 2026`, ['l', 'r', 'r', 'r'])}
<h2>The work credit stops falling</h2>
<p>The taper that weighs on middle incomes ends once net earned income passes ${h.eur(TT.pienenemisen_ylaraja)}. Yours is ${h.eur(R.puhdasAnsiotulo)}, so the credit is fixed at ${h.eur(R.tyotulovahennys)} and will stay there at higher salaries too. That removes two cents of tax per extra euro, roughly offset by the top band kicking in. Parents get a little more, since each child under 18 raises the maximum by ${h.eur(TT.lapsikorotus)}.</p>
<h2>Unemployment cover replaces less and less</h2>
<p>Earnings-related allowance pays ${h.num(T.ansio_osa_prosentti)}% of the gap between your daily wage and the basic amount up to the ${h.eur(TAITE, 2)} turning point, and just ${h.num(T.ansio_osa_yli_taitekohdan)}% beyond it. The table shows the replacement rate sliding as pay rises. Compare your own case in the ${h.a('ansiosidonnainen-laskuri', 'unemployment allowance calculator')} and see the ${h.a('marginaalivero', 'marginal tax rate')} page for what raises are worth.</p>
${h.table(['Gross pay / month', 'Net pay / month', 'Full allowance / month', 'Allowance as share of gross'], AP.map((x) => [h.eur(x.kk), h.eur(x.netto), h.eur(x.a.taysiKk), h.pct(x.a.taysiKk / x.kk)]), 'Full earnings-related allowance before tax, Helsinki, 2026', ['l', 'r', 'r', 'r'])}`,
  },
});
