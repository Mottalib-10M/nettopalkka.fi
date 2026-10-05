import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kuukausiNetto, laskeVerot } from '../../lib/engine/vero';
import { ansiopaivaraha, yleistukiKk } from '../../lib/engine/paivaraha';

const V = P.vero;
const T = P.tyottomyys;
const PALKKA = 2500;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const KK = R.netto / 12;
const RAJA2 = V.valtion_asteikko[1];
/** Perusvähennys ja valtionvero palkkaportaittain: kohta, jossa valtionvero syntyy. */
const PORTAAT = [2000, 2250, 2500, 2750].map((kk) => ({ kk, v: laskeVerot({ tulo: kk * 12, kunta: 'Helsinki' }) }));
const P2250 = PORTAAT[1].v;
/** Pyöristyksen vaikutus: verokortin prosentilla pidätetty vero vs. vuoden todellinen vero. */
const PIDATETTY = R.kkVero * 12;
const PALAUTUS = PIDATETTY - R.verot;
const A = ansiopaivaraha(PALKKA);
const TAITE = T.taitekohta_kerroin * T.perusosa_pv;
const YT = yleistukiKk();
/** Sadan euron korotus: paljonko jää käteen. */
const KOR = kuukausiNetto(PALKKA + 100, { kunta: 'Helsinki' });
const LISA = (KOR.netto - R.netto) / 12;

export default definePage({
  id: 'nettopalkka-2500',
  group: 'palkka',
  order: 20,
  mini: 'nettoSumma',
  miniDefaults: { p: 2500 },
  related: ['nettopalkka-2000', 'nettopalkka-3000', 'valtion-tuloveroasteikko', 'ansiosidonnainen-laskuri'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-2500',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Valtionvero syntyy, perusvähennys loppuu: mitä ${FI.eur(PALKKA)} palkasta jää ja mitä työttömyysturva maksaisi.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: valtionvero alkaa tuntua`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: käteen noin ${FI.eur(KK)}, verokortissa ${FI.num(R.veroprosentti, 1)} %. Valtionvero syntyy, perusvähennys hupenee ja ansiopäiväraha on laskettu valmiiksi.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Tällä palkalla ylitetään kaksi verorajaa yhtä aikaa, ja se näkyy verokortin prosentissa.`,
    resume: `Helsingissä asuva saa ${FI.eur(PALKKA)} kuukausipalkasta käteen keskimäärin ${FI.eur(KK)} kuussa vuonna 2026, ja verokortin prosentti on ${FI.num(R.veroprosentti, 1)} %. Palkkataso on verotuksen käännekohta. Verotettava tulo, noin ${FI.eur(R.verotettava)} vuodessa, on jo valtion tuloveroasteikon toisella portaalla, joka alkaa ${FI.eur(RAJA2.alaraja)} kohdalla ja jolla rajaveroprosentti on ${FI.num(RAJA2.prosentti, 2)} %. Samalla perusvähennyksestä on jäljellä enää ${FI.eur(R.perusvahennys)}, ja se häviää kokonaan pienelläkin korotuksella. Työtulovähennys on vielä täysi ${FI.eur(R.tyotulovahennys)}, mutta se ei enää riitä kattamaan koko valtionveroa: palkkalaskelmaan jää ensimmäistä kertaa valtionveroa ${FI.eur(R.valtionvero)} vuodessa. Koska Verohallinto pyöristää prosentin ylöspäin puolen prosenttiyksikön tarkkuudella, vuoden aikana pidätetään noin ${FI.eur(PALAUTUS)} liikaa, ja summa palautuu verotuksen valmistuttua. Pienikin palkankorotus näkyy siksi verokortissa selvemmin kuin aiemmin. Jos työ päättyisi, kassan jäsenen täysi ansiopäiväraha olisi ${FI.eur(A.taysiKk)} kuukaudessa ennen veroja.`,
    faqs: [
      { q: `Paljonko veronpalautusta ${FI.eur(PALKKA)} kuukausipalkalla voi odottaa?`, a: `Ilman muita vähennyksiä noin ${FI.eur(PALAUTUS)}. Verot ovat todellisuudessa ${FI.num(R.veroaste * 100, 2)} % palkasta, mutta kortin prosentti pyöristetään ylöspäin ${FI.num(R.veroprosentti, 1)} prosenttiin. Vuodessa pidätetään ${FI.eur(PIDATETTY)}, kun lopullinen vero on ${FI.eur(R.verot)}. Ammattiliiton ja kassan jäsenmaksut tai työmatkat kasvattavat palautusta, koska ne vähennetään vasta verotuksessa.` },
      { q: `Missä kohtaa palkkaa valtionveroa alkaa jäädä maksettavaksi?`, a: `Helsinkiläisellä noin ${FI.eur(2250)} ja ${FI.eur(PALKKA)} kuukausipalkan välissä. ${FI.eur(2250)} palkalla laskennallinen valtionvero on ${FI.eur(P2250.valtionveroEnnen)} ja täysi työtulovähennys ${FI.eur(P2250.tyotulovahennys)} kuittaa sen. ${FI.eur(PALKKA)} palkalla vero ${FI.eur(R.valtionveroEnnen)} ylittää vähennyksen ${FI.num(R.valtionvero)} eurolla. Kunnasta raja ei riipu, koska valtionvero lasketaan kaikille samalla asteikolla.` },
      { q: `Paljonko ansiosidonnaista saisi ${FI.eur(PALKKA)} palkan jälkeen?`, a: `Täysi ansiopäiväraha on ${FI.eur(A.taysiPv, 2)} päivässä eli ${FI.eur(A.taysiKk)} kuukaudessa, kun työssäoloehto on täyttynyt ja olet kassan jäsen. Kun päivärahaa on maksettu ${T.porrastus[0].paivia} päivältä, summa laskee ${FI.eur(A.porras1Kk)} tasolle ja ${T.porrastus[1].paivia} päivän jälkeen ${FI.eur(A.porras2Kk)} tasolle. Päivärahasta pidätetään veroa vähintään ${T.ennakonpidatys_vahintaan} %.` },
      { q: `Kannattaako ${FI.eur(PALKKA)} palkalla kuulua työttömyyskassaan?`, a: `Ero näkyy heti työttömyyden alkaessa. Kassan jäsen saisi ${FI.eur(PALKKA)} palkan jälkeen täyttä ansiopäivärahaa ${FI.eur(A.taysiKk)} kuukaudessa, kun Kelan yleistuki ilman kassaa on keskimäärin ${FI.eur(YT, 2)} kuukaudessa. Molemmat ovat veronalaisia. Kassan jäsenmaksu on lisäksi vähennyskelpoinen verotuksessa, joten se kasvattaa veronpalautusta.` },
    ],
    body: (h) => `
<h2>Valtionvero ilmestyy palkkalaskelmaan</h2>
<p>Kahden ja puolen tuhannen euron palkalla verotus muuttaa luonnettaan. Pienemmillä palkoilla työtulovähennys nielaisee koko valtion tuloveron, mutta nyt verotettavaa tuloa kertyy noin ${h.eur(R.verotettava)} vuodessa. Se ylittää asteikon toisen portaan alarajan ${h.eur(RAJA2.alaraja)}, ja rajan ylittävästä osasta valtio ottaa ${h.num(RAJA2.prosentti, 2)} %. Laskennallinen valtionvero nousee ${h.num(R.valtionveroEnnen)} euroon, kun täysi työtulovähennys on ${h.eur(R.tyotulovahennys)}, joten erotus ${h.eur(R.valtionvero)} jää maksettavaksi. Summa on pieni, mutta sen merkitys on suuri: tästä eteenpäin jokainen lisäeuro kasvattaa sekä valtionveroa että kunnallisveroa, eikä ylijäämäistä vähennystä enää siirry kevennykseksi kunnallisveroon. Samaan aikaan perusvähennys on lähes lopussa. Se pienenee ${h.num(V.perusvahennys.pienenemisprosentti)} prosentilla tulon kasvaessa, joten veroprosentti nousee nopeammin kuin palkka. Taulukko näyttää, miten neljänsadan euron palkkaero kertautuu verokortissa. Asteikon kaikki portaat ovat sivulla ${h.a('valtion-tuloveroasteikko', 'valtion tuloveroasteikko')}.</p>
${h.table(['Kuukausipalkka', 'Perusvähennys', 'Verotettava tulo', 'Valtionvero', 'Veroprosentti'], PORTAAT.map((x) => [h.eur(x.kk), h.eur(x.v.perusvahennys), h.eur(x.v.verotettava), h.eur(x.v.valtionvero), `${h.num(x.v.veroprosentti, 1)} %`]), 'Vuositasolla, Helsinki, ei kirkon jäsen, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Pyöristys ylöspäin ja palautus</h2>
<p>Verokortin prosentti ei ole tarkka veroaste. Tällä palkalla verot ovat ${h.num(R.veroaste * 100, 2)} % vuosipalkasta, mutta kortti näyttää ${h.num(R.veroprosentti, 1)} %, koska Verohallinto vahvistaa prosentin puolen prosenttiyksikön tarkkuudella ja aina ylöspäin. Työnantaja pidättää siis vuoden mittaan ${h.eur(PIDATETTY)}, vaikka lopullinen vero on ${h.eur(R.verot)}. Palkkalaskelman nettosumma on ${h.eur(R.kkNetto, 2)} kuukaudessa, ja ero vuoden todelliseen nettoon tulee takaisin veronpalautuksena. Pyöristyksen periaate on kirjattu Verohallinnon ${h.src('vero_ennakonpidatys', 'ennakonpidätyspäätökseen')}.</p>
<h2>Työttömyysturva tällä palkkatasolla</h2>
<p>Kassan jäsenelle ansiopäiväraha lasketaan työssäoloehdon ajan bruttopalkoista. Palkasta vähennetään ensin ${h.num(T.vahennettava_prosentti, 2)} % ja tulos jaetaan ${h.num(T.tyopaivia_kuukaudessa, 1)} päivällä, jolloin päiväpalkaksi tulee ${h.eur(A.paivapalkka, 2)}. Perusosan ${h.eur(T.perusosa_pv, 2)} päälle maksetaan ${h.num(T.ansio_osa_prosentti)} % päiväpalkan ja perusosan erotuksesta. ${h.eur(PALKKA)} palkka jää selvästi alle taitekohdan ${h.eur(TAITE, 2)}, joten koko ansio-osa lasketaan korkeammalla prosentilla. Lomarahaa ei lueta palkkaan. Laske oma summasi ${h.a('ansiosidonnainen-laskuri', 'ansiosidonnaisen päivärahan laskurilla')}.</p>
<h2>Mitä sadan euron korotuksesta jää</h2>
<p>Kun bruttopalkka nousee ${h.num(PALKKA)} eurosta ${h.num(PALKKA + 100)} euroon, nettotulo kasvaa keskimäärin ${h.eur(LISA, 2)} kuukaudessa. Korotuksesta menee siis noin ${h.num(100 - LISA, 0)} % veroihin ja maksuihin, vaikka verokortin prosentti on vain ${h.num(R.veroprosentti, 1)} %. Ero syntyy siitä, että korotus osuu kokonaan ylimpään verotettavaan euroon ja leikkaa samalla perusvähennyksen viimeistä osaa. Tämä kannattaa muistaa palkkaneuvottelussa: lisäeuroista jää käteen vähemmän kuin keskimääräinen veroprosentti antaa ymmärtää. Uutta verokorttia korotus ei välttämättä vaadi, jos vuoden tuloraja ei ylity.</p>
${h.table(['Vaihe', 'Euroa päivässä', 'Euroa kuukaudessa'], [
  ['Täysi päiväraha', h.eur(A.taysiPv, 2), h.eur(A.taysiKk)],
  [`${T.porrastus[0].paivia} maksupäivän jälkeen (${T.porrastus[0].prosentti} %)`, h.eur(A.porras1Pv, 2), h.eur(A.porras1Kk)],
  [`${T.porrastus[1].paivia} maksupäivän jälkeen (${T.porrastus[1].prosentti} %)`, h.eur(A.porras2Pv, 2), h.eur(A.porras2Kk)],
], `Ansiopäiväraha ${h.eur(PALKKA)} kuukausipalkalla, brutto, 2026`, ['l', 'r', 'r'])}`,
  },
  en: {
    slug: 'net-salary-2500',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `Where state tax starts and the basic deduction runs out: take-home pay and unemployment cover at ${EN.eur(PALKKA)} a month.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: where state tax begins`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: around ${EN.eur(KK)} after tax at a ${EN.num(R.veroprosentti, 1)}% card rate, plus your expected refund and earnings-related unemployment pay.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `Two Finnish tax thresholds are crossed at this pay level, and your withholding rate shows it.`,
    resume: `On ${EN.eur(PALKKA)} a month before tax, someone registered in Helsinki takes home about ${EN.eur(KK)} a month on average in 2026, with a withholding rate of ${EN.num(R.veroprosentti, 1)}% on the tax card (verokortti). This is the salary at which state income tax finally becomes visible. Your taxable income, about ${EN.eur(R.verotettava)} a year, sits in the second band of the state scale, which starts at ${EN.eur(RAJA2.alaraja)} and charges ${EN.num(RAJA2.prosentti, 2)}% on the slice above it. The earned income tax credit (työtulovähennys) is still at its full ${EN.eur(R.tyotulovahennys)}, but it no longer covers the whole state bill, so ${EN.eur(R.valtionvero)} a year remains payable. Meanwhile only ${EN.eur(R.perusvahennys)} is left of the basic deduction (perusvähennys). Because Vero rounds the card rate up to the next half point, around ${EN.eur(PALAUTUS)} too much is withheld over the year and comes back as a refund. Should you lose the job after meeting the employment condition, full earnings-related unemployment allowance would be ${EN.eur(A.taysiKk)} a month gross.`,
    faqs: [
      { q: `What tax refund can I expect in Finland on ${EN.eur(PALKKA)} a month?`, a: `Roughly ${EN.eur(PALAUTUS)} if you claim nothing else. Your real tax is ${EN.num(R.veroaste * 100, 2)}% of pay, but the card rounds up to ${EN.num(R.veroprosentti, 1)}%, so ${EN.eur(PIDATETTY)} is withheld against a final bill of ${EN.eur(R.verot)}. Union and unemployment fund fees, or commuting costs, are only deducted in the annual assessment and make the refund larger.` },
      { q: `At what monthly salary does Finnish state income tax actually start?`, a: `For a Helsinki resident, somewhere between ${EN.eur(2250)} and ${EN.eur(PALKKA)} a month. At ${EN.eur(2250)} the computed state tax of ${EN.eur(P2250.valtionveroEnnen)} is still fully absorbed by the ${EN.eur(P2250.tyotulovahennys)} credit. At ${EN.eur(PALKKA)} the tax of ${EN.eur(R.valtionveroEnnen)} exceeds it by ${EN.eur(R.valtionvero)}. The municipality makes no difference here, since state tax uses one national scale.` },
      { q: `How much earnings-related unemployment pay would I get after a ${EN.eur(PALKKA)} job?`, a: `If you belong to an unemployment fund (kassa) and meet the employment condition, the full allowance is ${EN.eur(A.taysiPv, 2)} a day, about ${EN.eur(A.taysiKk)} a month. After ${T.porrastus[0].paivia} paid days it drops to ${EN.eur(A.porras1Kk)} and after ${T.porrastus[1].paivia} days to ${EN.eur(A.porras2Kk)}. The fund withholds at least ${T.ennakonpidatys_vahintaan}% tax from each payment.` },
    ],
    body: (h) => `
<h2>Crossing into the second state tax band</h2>
<p>Many newcomers are surprised that a payslip on two thousand euros shows no state tax at all, and then a modest raise brings it in. The reason is the order in which Vero applies the rules. At ${h.eur(PALKKA)} a month your taxable income reaches about ${h.eur(R.verotettava)} a year, above the ${h.eur(RAJA2.alaraja)} threshold where the state rate steps up to ${h.num(RAJA2.prosentti, 2)}%. Computed state tax comes to ${h.eur(R.valtionveroEnnen)}. The earned income credit, still at its ceiling of ${h.eur(R.tyotulovahennys)}, is deducted from it, and for the first time something is left: ${h.eur(R.valtionvero)}. From here on, each extra euro adds to both state and municipal tax, and no surplus credit flows over to soften your municipal bill. The basic deduction is also nearly used up, falling by ${h.num(V.perusvahennys.pienenemisprosentti)} cents for each additional euro earned. Two effects stacked together explain why the withholding rate jumps faster than gross pay in the table below. The full band structure is on ${h.a('valtion-tuloveroasteikko', 'the state income tax scale')}.</p>
${h.table(['Monthly pay', 'Basic deduction', 'Taxable income', 'State tax', 'Card rate'], PORTAAT.map((x) => [h.eur(x.kk), h.eur(x.v.perusvahennys), h.eur(x.v.verotettava), h.eur(x.v.valtionvero), `${h.num(x.v.veroprosentti, 1)}%`]), 'Annual figures, Helsinki, no church membership, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Why your payslip and your real net differ</h2>
<p>The card rate is not your exact tax ratio. Here your taxes are ${h.num(R.veroaste * 100, 2)}% of annual pay, yet the card says ${h.num(R.veroprosentti, 1)}%, because Vero always rounds up to a half point. Your employer therefore withholds ${h.eur(PIDATETTY)} over the year against a final tax of ${h.eur(R.verot)}. The payslip shows ${h.eur(R.kkNetto, 2)} a month; the gap to your true net returns as a refund once the annual assessment is done. The rounding rule is set out in Vero's ${h.src('vero_ennakonpidatys', 'withholding decision')}.</p>
<h2>What a fund would pay if the job ended</h2>
<p>Finland's earnings-related allowance comes from your unemployment fund, not from Kela. The fund takes gross wages over the employment condition period, removes ${h.num(T.vahennettava_prosentti, 2)}% and divides by ${h.num(T.tyopaivia_kuukaudessa, 1)} days, giving a daily wage of ${h.eur(A.paivapalkka, 2)}. You receive the basic amount of ${h.eur(T.perusosa_pv, 2)} plus ${h.num(T.ansio_osa_prosentti)}% of the difference. Your pay is well under the ${h.eur(TAITE, 2)} turning point, so the whole earnings part uses the higher rate. Holiday bonus is left out. Try your own figures in the ${h.a('ansiosidonnainen-laskuri', 'unemployment allowance calculator')}.</p>
${h.table(['Stage', 'Per day', 'Per month'], [
  ['Full allowance', h.eur(A.taysiPv, 2), h.eur(A.taysiKk)],
  [`After ${T.porrastus[0].paivia} paid days (${T.porrastus[0].prosentti}%)`, h.eur(A.porras1Pv, 2), h.eur(A.porras1Kk)],
  [`After ${T.porrastus[1].paivia} paid days (${T.porrastus[1].prosentti}%)`, h.eur(A.porras2Pv, 2), h.eur(A.porras2Kk)],
], `Earnings-related allowance after a ${h.eur(PALKKA)} monthly salary, gross, 2026`, ['l', 'r', 'r'])}`,
  },
});
