import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { ansiopaivaraha, yleistukiKk } from '../../lib/engine/paivaraha';
import { r2 } from '../../lib/engine/params';

const T = P.tyottomyys;
const EHTO = T.tyossaoloehto_kk;
const TAYSI = T.tyossaoloehto_palkka_kk;
const PUOLI = T.tyossaoloehto_puolikas_kk;
const KKPV = T.tyopaivia_kuukaudessa;
/** Kuinka paljon yksi kuukausi kerryttää ehtoa palkan mukaan. */
const osuus = (palkka: number) => (palkka >= TAYSI ? 1 : palkka >= PUOLI ? 0.5 : 0);
const PALKAT = [400, 600, 900, TAYSI, 1600, 2800];
/** Esimerkki: 9 täyttä kuukautta ja 4 puolikasta. */
const KERT = 9 + 4 * osuus(700);
const PUUTTUU = Math.max(0, EHTO - KERT);
/** Päiväpalkan pohja: puoli vuotta 2 000 € ja puoli vuotta 3 000 €. */
const SUMMA = 2000 * 6 + 3000 * 6;
const PAIVAT = EHTO * KKPV;
const PAIVAPALKKA = r2(SUMMA / PAIVAT);
const KESKI = SUMMA / EHTO;
const AP = ansiopaivaraha(KESKI);
const YT = yleistukiKk();
const A28 = ansiopaivaraha(2800);
const TUNTI = 14, H1 = 70, H2 = 60;

export default definePage({
  id: 'tyossaoloehto',
  group: 'tuet',
  order: 30,
  mini: 'tyossaolo',
  related: ['ansiosidonnainen-laskuri', 'ansiopaivarahan-kesto', 'yleistuki'],
  sources: ['tyj_laskenta', 'finlex_tyottomyysturva'],
  fi: {
    slug: 'tyossaoloehto',
    nav: 'Työssäoloehto',
    card: 'Montako kuukautta ja millä palkalla pitää olla töissä, jotta kassa maksaa ansiopäivärahaa.',
    title: `Työssäoloehto 2026: ${EHTO} kuukautta ja ${TAYSI} euron raja`,
    description: `Työssäoloehto 2026 vaatii ${EHTO} kuukautta palkkaa, ja kuukausi lasketaan täydeksi ${TAYSI} eurosta ja puolikkaaksi ${PUOLI} eurosta. Laske, montako kuukautta puuttuu.`,
    h1: 'Työssäoloehto',
    intro: 'Ansiopäivärahan ensimmäinen kynnys on työssäoloehto: riittävä määrä kuukausia, joina palkkaa on maksettu.',
    resume: `Työssäoloehto täyttyy, kun sinulle on maksettu palkkaa ${EHTO} kalenterikuukautena, ja kuukausi lasketaan täydeksi, jos palkkaa on vähintään ${FI.eur(TAYSI)}. Jos kuukauden palkka on ${FI.eur(PUOLI)} mutta alle ${FI.eur(TAYSI)}, kuukausi kerryttää ehtoa puolikkaan. Vaatimus kiristyi 2.9.2024: sitä ennen riitti 26 kalenteriviikkoa eli noin puoli vuotta, nyt tarvitaan koko vuosi. Kuukaudet etsitään tavallisesti edellisen kahden vuoden ja neljän kuukauden ajalta, ja tietyin perustein jaksoa voidaan pidentää yhdeksään vuoteen ja neljään kuukauteen. Ehto ratkaisee kaksi asiaa: saako työttömyyskassan jäsen ansiosidonnaista päivärahaa lainkaan, ja minkä palkan perusteella se lasketaan. Päiväpalkka lasketaan samojen vähintään ${EHTO} kuukauden bruttopalkoista, joihin ei lueta lomarahaa eikä lomakorvausta. Jos ehto jää vajaaksi, Kela maksaa yleistukea, ${FI.eur(T.yleistuki_pv, 2)} päivässä. Kun olet ollut ${EHTO} kuukautta töissä vähintään ${FI.eur(TAYSI)} kuukausipalkalla, ansiopäivärahan enimmäisaika alkaa alusta ja päiväraha lasketaan uudelleen.`,
    faqs: [
      { q: 'Montako kuukautta pitää olla töissä ennen ansiopäivärahaa?', a: `${EHTO} kalenterikuukautta, joina palkkaa on maksettu vähintään ${FI.eur(TAYSI)}. Kahdella puolikkaalla kuukaudella, joina palkka on ollut ${FI.eur(PUOLI)}–${FI.eur(TAYSI)}, saa yhden täyden kuukauden. Ennen 2.9.2024 vaatimus oli 26 kalenteriviikkoa, joten moni vanhan säännön varassa laskenut huomaa nyt tarvitsevansa noin puoli vuotta enemmän työtä.` },
      { q: 'Lasketaanko kuukausi, jos palkka jää alle 930 euron?', a: `Puolikkaana, jos palkkaa on maksettu vähintään ${FI.eur(PUOLI)}. Alle sen jäävä kuukausi ei kerrytä ehtoa lainkaan. Esimerkiksi osa-aikatyöstä maksettu ${FI.eur(700)} kuukausipalkka tuo puoli kuukautta, joten neljä tällaista kuukautta vastaa kahta täyttä. Raja katsotaan kalenterikuukauden aikana maksetusta palkasta, joten maksupäivä ratkaisee, mihin kuukauteen palkka kirjautuu.` },
      { q: 'Kuinka kauas taaksepäin työssäoloehtoa lasketaan?', a: `Tavallisesti kaksi vuotta ja neljä kuukautta ennen työttömyyden alkua. Laissa luetelluin perustein tarkastelujakso voi venyä enintään yhdeksään vuoteen ja neljään kuukauteen, jolloin vanhempiakin palkkakuukausia voidaan ottaa mukaan. Kuukausien ei tarvitse olla peräkkäisiä, vaan kaikki jakson aikana palkanmaksua sisältäneet kuukaudet lasketaan yhteen.` },
      { q: 'Vaikuttaako lomaraha ansiopäivärahan suuruuteen?', a: `Ei vaikuta. TYJ:n mukaan lomarahaa ja lomakorvausta ei lueta palkkaan, kun päiväpalkka lasketaan. Pohjana ovat työssäoloehtoon luettujen kuukausien bruttopalkat, joista otetaan huomioon vähintään ${EHTO} kuukautta. Summa jaetaan kuukausien määrällä kerrottuna luvulla ${FI.num(KKPV, 1)}, ja tuloksesta tehdään vielä ${FI.num(T.vahennettava_prosentti, 2)} prosentin vähennys. Kesäkuun lomarahakuukausi ei siis nosta päivärahaa.` },
      { q: 'Täyttyykö työssäoloehto pelkillä kesätöillä?', a: `Harvoin yhden kesän aikana, koska kolme kuukautta kattaa vain neljänneksen ${EHTO} kuukauden ehdosta. Kesätyökuukaudet kuitenkin säilyvät laskelmassa kahden vuoden ja neljän kuukauden ajan. Kaksi kolmen kuukauden kesää ja puolen vuoden määräaikainen työ samalla jaksolla täyttävät ehdon, jos jokaisen kuukauden palkka on vähintään ${FI.eur(TAYSI)}.` },
      { q: 'Mitä tapahtuu, jos työssäoloehto jää vajaaksi?', a: `Kassa ei silloin maksa ansiopäivärahaa, mutta voit hakea Kelasta yleistukea, joka on ${FI.eur(T.yleistuki_pv, 2)} päivässä eli keskimäärin ${FI.eur(YT)} kuukaudessa. Kun puuttuvat kuukaudet myöhemmin kertyvät, voit hakea ansiopäivärahaa uudelleen. Sivun minilaskuri kertoo, montako kuukautta sinulta puuttuu täysistä ja puolikkaista kuukausista laskettuna.` },
      { q: 'Nollautuuko ansiopäivärahakausi, kun olen ollut vuoden töissä?', a: `Kyllä. Jos olet työssä ${EHTO} kuukautta niin, että palkkaa kertyy kuukaudessa vähintään ${FI.eur(TAYSI)}, ansiopäivärahan enimmäisaika alkaa alusta. Päiväraha lasketaan silloin uuden työn palkoista, ja porrastus palaa täyteen tasoon. Uuden kauden alussa on jälleen ${T.omavastuupaivat} päivän omavastuuaika. Lyhyemmät työjaksot eivät nollaa kautta, vaan jo maksetut päivät säilyvät.` },
    ],
    body: (h) => `
<h2>Täysi kuukausi, puolikas kuukausi ja nolla</h2>
<p>Työssäoloehdon yksikkö on kalenterikuukausi, jona palkkaa on maksettu. Laki edellyttää vakuutuksenalaista vakiintunutta palkkaa vähintään ${h.eur(TAYSI)} kuukaudessa, jotta kuukausi lasketaan täydeksi. ${h.eur(PUOLI)}–${h.eur(TAYSI)} palkka tuo puolikkaan kuukauden. Pienemmät summat eivät kerrytä ehtoa, vaikka työtä olisi tehty joka viikko.</p>
${h.table(['Kuukauden palkka', 'Kerryttää ehtoa', `Kuukausia ${EHTO} kk:n ehtoon`], PALKAT.map((p) => [h.eur(p), osuus(p) === 1 ? 'täysi kuukausi' : osuus(p) === 0.5 ? 'puolikas kuukausi' : 'ei kerrytä', osuus(p) ? h.num(EHTO / osuus(p)) : 'ei täyty']), 'Työssäoloehdon kertyminen kuukausipalkan mukaan, 2026', ['l', 'l', 'r'])}
<p>Taulukko kertoo, miksi pienipalkkaisella osa-aikatyöllä ehto voi kestää kaksi vuotta. ${h.eur(600)} kuukausipalkalla jokainen kuukausi on puolikas, joten ${EHTO} kuukauden ehtoon tarvitaan ${h.num(EHTO * 2)} kuukautta työtä. Se mahtuu juuri ja juuri kahden vuoden ja neljän kuukauden tarkastelujaksoon.</p>
<h2>Vanha ja uusi sääntö</h2>
<p>Ennen 2.9.2024 työssäoloehto oli 26 kalenteriviikkoa. Uudistus muutti sekä keston että yksikön: viikkojen tilalle tulivat kalenterikuukaudet ja euromääräinen raja. Ero näkyy erityisesti määräaikaisissa töissä: puolen vuoden sopimus riitti ennen ansiopäivärahaan, nyt se kattaa vain puolet ehdosta. Jos kuitenkin saat toisen puolen vuoden sopimuksen tarkastelujakson sisällä, kuukaudet lasketaan yhteen ja ehto täyttyy, vaikka sopimusten välissä olisi ollut työttömyyttä.</p>
<h2>Tuntipalkkaisen tarkistus</h2>
<p>Tunneilla työskentelevän kannattaa laskea kuukausittain, ylittyykö raja. ${h.eur(TUNTI)} tuntipalkalla ${h.num(H1)} tuntia kuukaudessa tuottaa ${h.eur(TUNTI * H1)}, mikä on täysi kuukausi. ${h.num(H2)} tunnilla palkkaa kertyy ${h.eur(TUNTI * H2)}, ja kuukausi jää puolikkaaksi. Kymmenen tunnin ero kuukaudessa merkitsee siis vuoden mittaan kuuden kuukauden eroa ehdon täyttymisessä. Jos vuorolistat vaihtelevat, yksi lisävuoro rajan alittavana kuukautena voi kannattaa enemmän kuin mikään muu ylityö.</p>
<h2>Ehto ja kassan jäsenyys</h2>
<p>Työssäoloehto ei yksin riitä. Ansiosidonnaista päivärahaa maksaa työttömyyskassa jäsenilleen, joten kassaan kuulumaton saa täyttyneestä ehdosta huolimatta vain Kelan yleistukea, keskimäärin ${h.eur(YT)} kuukaudessa. ${h.eur(2800)} kuukausipalkalla kassan jäsen saisi alussa noin ${h.eur(A28.taysiKk)} kuukaudessa. Ero on yli ${h.eur(Math.floor((A28.taysiKk - YT) / 100) * 100)} kuukaudessa, mikä on syy liittyä kassaan heti ensimmäisessä työpaikassa.</p>
<h2>Tarkastelujakso</h2>
<p>Kassa etsii palkanmaksukuukaudet työttömyyttä edeltävän kahden vuoden ja neljän kuukauden ajalta. Laissa luetelluin perustein jakso voi pidentyä enintään yhdeksään vuoteen ja neljään kuukauteen. Kuukausien ei tarvitse olla peräkkäisiä, joten kesätyöt, sijaisuudet ja keikkatyöt lasketaan yhteen.</p>
<p>Käytännön esimerkki: jos työttömyys alkaa lokakuussa 2026, tarkastelujakso ulottuu kesäkuuhun 2024 asti. Kaikki sen jälkeen maksetut palkkakuukaudet ovat mukana, mutta toukokuun 2024 palkka ei enää ole. Ikkuna lasketaan taaksepäin siitä hetkestä, kun työttömyys alkaa, joten vanhimmat kuukaudet kannattaa tarkistaa omista palkkalaskelmista ennen hakemusta, jos ehto on lähellä rajaa. Palkkalaskelmasta näet maksupäivän, ja juuri maksupäivä ratkaisee, mihin kuukauteen palkka lasketaan.</p>
<h2>Esimerkki: puuttuuko vielä kuukausi?</h2>
<p>Anna on ollut yhdeksän kuukautta kokoaikatyössä ja sen jälkeen neljä kuukautta osa-aikaisena ${h.eur(700)} kuukausipalkalla. Täydet kuukaudet tuovat yhdeksän, osa-aikakuukaudet ${h.num(4 * osuus(700))}, joten ehtoa on kertynyt ${h.num(KERT)} kuukautta. Puuttumaan jää ${h.num(PUUTTUU)} kuukautta. Jos Anna jää nyt työttömäksi, hän saa Kelan ${h.a('yleistuki', 'yleistukea')} siihen asti, kunnes ehto täyttyy uusista palkoista. Sivun minilaskuri tekee saman laskelman omilla kuukausillasi.</p>
<p>Annalla on kaksi tapaa kuroa ero umpeen. Yksi täysi kuukausi vähintään ${h.eur(TAYSI)} palkalla riittää, samoin kaksi puolikasta kuukautta nykyisellä osa-aikapalkalla. Ensimmäinen vaihtoehto täyttää ehdon kuukautta nopeammin, joten tuntien lisääminen hetkeksi rajan yli kannattaa, jos työnantaja siihen suostuu. Kun ehto täyttyy, Anna voi kassan jäsenenä hakea ansiopäivärahaa, joka on yleistukea suurempi.</p>
<h2>Ehto määrää myös päivärahan suuruuden</h2>
<p>Työssäoloehtoon luettujen kuukausien palkat ovat ansiopäivärahan pohja. Mukaan otetaan vähintään ${EHTO} kuukautta, palkat bruttona, mutta lomarahaa ja lomakorvausta ei lueta palkkaan. Summa jaetaan päivillä: ${EHTO} kuukautta kertaa ${h.num(KKPV, 1)} on ${h.num(PAIVAT)} päivää.</p>
<p>TYJ käyttää esimerkkinä tilannetta, jossa puolet vuodesta palkka on ${h.eur(2000)} ja puolet ${h.eur(3000)}. Palkkoja kertyy ${h.eur(SUMMA)}, ja päiväpalkka ennen vähennystä on ${h.eur(PAIVAPALKKA, 2)}. Kun tästä vähennetään vuoden 2026 ${h.num(T.vahennettava_prosentti, 2)} % ja lasketaan perusosa ja ansio-osa, täysi ansiopäiväraha on ${h.eur(AP.taysiPv, 2)} päivässä eli noin ${h.eur(AP.taysiKk)} kuukaudessa. Porrastettuna se laskee myöhemmin, kuten sivulla ${h.a('ansiopaivarahan-kesto', 'ansiopäivärahan kesto ja porrastus')} näytetään.</p>
<p>Palkankorotus ehdon viimeisinä kuukausina nostaa päivärahaa vain osittain, koska se jakautuu koko jaksolle.</p>
<h2>Kun ehto täyttyy uudelleen</h2>
<p>Ehto on myös nollausnappi. Kun saman henkilön palkkaa on taas kertynyt ${EHTO} kuukautta vähintään ${h.eur(TAYSI)} kuukaudessa, enimmäisaika alkaa alusta, porrastus palaa täyteen ja päiväraha lasketaan uusista palkoista. Uuden kauden alussa on ${T.omavastuupaivat} päivän omavastuuaika. Oman päivärahasi saat ${h.a('ansiosidonnainen-laskuri', 'ansiopäivärahalaskurista')}.</p>
<p>Lähteet: ${h.src('tyj_laskenta', 'TYJ, näin ansiopäiväraha lasketaan')} ja ${h.src('finlex_tyottomyysturva', 'työttömyysturvalaki 1290/2002, 5 luku')}.</p>`,
  },
  en: {
    slug: 'employment-condition',
    nav: 'Employment condition',
    card: 'How many months, and at what pay, before your unemployment fund pays the earnings-related allowance.',
    title: `Employment Condition 2026: ${EHTO} Months for Kassa Allowance`,
    description: `Employment condition 2026: ${EHTO} months of work, a month counts in full from ${EN.eur(TAYSI)} of pay and as half from ${EN.eur(PUOLI)}. Check how many months you still need for kassa pay.`,
    h1: 'The employment condition for kassa pay',
    intro: 'Joining an unemployment fund is step one; the employment condition (työssäoloehto) decides when it actually pays.',
    resume: `To receive the earnings-related allowance from a Finnish unemployment fund (työttömyyskassa), you must meet the employment condition (työssäoloehto): ${EHTO} calendar months in which you were paid at least ${EN.eur(TAYSI)} each. A month with pay between ${EN.eur(PUOLI)} and ${EN.eur(TAYSI)} counts as half, and anything lower counts as nothing. The rule tightened on 2 September 2024; before that, 26 calendar weeks of work were enough, so a six-month contract no longer qualifies on its own. The fund looks back over the two years and four months before you became unemployed, and that window can stretch to nine years and four months in specific situations. The same months also set the size of your allowance: gross pay from at least ${EHTO} months, excluding holiday bonus and holiday compensation, is divided by the number of months times ${EN.num(KKPV, 1)}. Until you qualify, Kela’s general support of ${EN.eur(T.yleistuki_pv, 2)} a day is the fallback. Once you have worked another ${EHTO} months at ${EN.eur(TAYSI)} or more, your allowance period starts over.`,
    faqs: [
      { q: 'How long do I have to work in Finland before my kassa pays?', a: `${EHTO} calendar months with at least ${EN.eur(TAYSI)} of pay each, or the equivalent in half months. Two months paid between ${EN.eur(PUOLI)} and ${EN.eur(TAYSI)} make one full month. Only fund members receive this allowance, so joining a kassa with your first Finnish job is the safe choice.` },
      { q: 'Does a summer job count towards the employment condition?', a: `Yes, if the pay reaches the limits. A summer job paying ${EN.eur(1600)} a month for three months gives three full months. The months do not need to be consecutive, so seasonal work, temp contracts and gig work in the two years and four months before unemployment are all added together.` },
      { q: 'Is my holiday bonus counted in the salary that sets my unemployment allowance?', a: `No. According to TYJ, which publishes the funds’ common calculation rules, holiday bonus and holiday compensation are left out of the pay used for the allowance. The fund takes gross wages from at least ${EHTO} employment-condition months, divides them by the months times ${EN.num(KKPV, 1)} and then deducts ${EN.num(T.vahennettava_prosentti, 2)}% before applying the formula.` },
      { q: 'What if I am two months short of the employment condition?', a: `The fund cannot pay yet, but Kela’s general support (yleistuki) can: ${EN.eur(T.yleistuki_pv, 2)} a day, about ${EN.eur(YT)} a month. Keep working where you can, because every month paid at ${EN.eur(TAYSI)} or more brings you closer, and you can claim from the fund once the twelfth month is complete. The calculator above shows your exact gap.` },
      { q: 'Did the employment condition change in 2024?', a: `Yes. Until 1 September 2024 you needed 26 calendar weeks of work, roughly half a year. From 2 September 2024 the requirement is ${EHTO} calendar months, with a monthly pay threshold of ${EN.eur(TAYSI)} for a full month and ${EN.eur(PUOLI)} for a half. In practice the bar doubled, and the euro thresholds replaced the old weekly hour count.` },
    ],
    body: (h) => `
<h2>How a month is counted</h2>
<p>The fund counts calendar months in which salary was paid. A month counts in full when insured, regular pay of at least ${h.eur(TAYSI)} was paid in it. Between ${h.eur(PUOLI)} and ${h.eur(TAYSI)} it counts as half. Below ${h.eur(PUOLI)} it does not count, however many hours you worked.</p>
${h.table(['Pay in the month', 'Counts as', `Months needed for ${EHTO}`], PALKAT.map((p) => [h.eur(p), osuus(p) === 1 ? 'full month' : osuus(p) === 0.5 ? 'half month' : 'nothing', osuus(p) ? h.num(EHTO / osuus(p)) : 'never']), 'Employment condition by monthly pay, 2026', ['l', 'l', 'r'])}
<p>The payment date decides which month the salary falls in, which matters for people paid every two weeks or with irregular hours. A month that sits just under ${h.eur(TAYSI)} because of a short shift pattern costs you half a month of progress.</p>
<h2>Hourly workers: check each month</h2>
<p>If you are paid by the hour, the threshold is worth checking month by month. At ${h.eur(TUNTI)} an hour, ${h.num(H1)} hours bring ${h.eur(TUNTI * H1)}, a full month; ${h.num(H2)} hours bring ${h.eur(TUNTI * H2)}, only a half. Ten hours a month decide whether a year of work gives you twelve months or six. When rosters vary, one extra shift in a month that would fall short is worth more for your unemployment cover than any amount of overtime in a month already above the line.</p>
<h2>Fund membership is a separate requirement</h2>
<p>Meeting the condition is not enough on its own. Only members of an unemployment fund receive the earnings-related allowance; a non-member with a full twelve months still gets Kela’s general support, about ${h.eur(YT)} a month. On ${h.eur(2800)} a month a fund member would start at about ${h.eur(A28.taysiKk)}. That gap is the case for joining a kassa in your first month in Finland, before you need it.</p>
<h2>Why expats often fall short</h2>
<p>Many people arrive on a fixed-term contract of six or nine months. Under the pre-2024 rule of 26 weeks, six months was enough. Under the current ${EHTO}-month rule it covers half the condition. If the contract is not renewed, the fund has nothing to pay and the first support comes from Kela. The look-back window is two years and four months, so a second contract within that time adds to the first.</p>
<p>A second trap is low part-time pay. At ${h.eur(600)} a month every month is a half, so you need ${h.num(EHTO * 2)} months of work, which only just fits in the window. Topping one month over ${h.eur(TAYSI)}, for example with extra shifts, saves you a whole extra month.</p>
<h2>A worked example</h2>
<p>Anna worked nine months full time, then four months part time at ${h.eur(700)} a month. The full months give nine, the part-time months give ${h.num(4 * osuus(700))}, total ${h.num(KERT)}. She is ${h.num(PUUTTUU)} month short. If she becomes unemployed now, Kela’s ${h.a('yleistuki', 'general support')} pays until new payslips complete the condition. The mini calculator above runs the same sum for your own months.</p>
<h2>The condition also sets your allowance</h2>
<p>Your allowance is built on the pay from the months that met the condition, at least ${EHTO} of them. Pay is taken gross, without holiday bonus or holiday compensation, and divided by the number of months times ${h.num(KKPV, 1)}: twelve months make ${h.num(PAIVAT)} days.</p>
<p>TYJ illustrates it with six months at ${h.eur(2000)} and six at ${h.eur(3000)}. Total pay is ${h.eur(SUMMA)}, giving a daily wage of ${h.eur(PAIVAPALKKA, 2)} before the deduction. After the 2026 deduction of ${h.num(T.vahennettava_prosentti, 2)}% and the base and earnings parts, you arrive at a full daily allowance of ${h.eur(AP.taysiPv, 2)}, roughly ${h.eur(AP.taysiKk)} per month. A pay rise in the last months lifts this only partly, because it is averaged over the whole period. How it then steps down is covered under ${h.a('ansiopaivarahan-kesto', 'allowance duration')}.</p>
<h2>Requalifying resets everything</h2>
<p>Working another ${EHTO} months at ${h.eur(TAYSI)} or more restarts your maximum period, resets the step-down and recalculates the allowance from the new salary. A new ${T.omavastuupaivat}-day waiting period applies. Shorter jobs between periods of unemployment do not reset anything. Run your numbers in the ${h.a('ansiosidonnainen-laskuri', 'unemployment allowance calculator')}.</p>
<p>Sources: ${h.src('tyj_laskenta', 'TYJ, how the allowance is calculated')} and ${h.src('finlex_tyottomyysturva', 'Unemployment Security Act 1290/2002, chapter 5')}.</p>`,
  },
});
