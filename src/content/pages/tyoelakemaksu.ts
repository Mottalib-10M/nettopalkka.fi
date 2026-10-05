import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, kuukausiNetto } from '../../lib/engine/vero';

const M = P.elake.tyel_maksu_2026;
const KA = P.elake.karttumaprosentti;
const IKA = P.elake.karttuma_ika;
const TVR = P.vero.tyottomyysvakuutusmaksu_prosentti, TVR_IKA = P.vero.tyottomyysvakuutusmaksu_ika;

const KK = 3500;
const tt = (kk: number) => kk * M.tyontekija / 100;
const ta = (kk: number) => kk * M.tyonantaja_keskimaarin / 100;
const tv = (kk: number) => kk * TVR / 100;
const kertyy = (kk: number) => kk * 12 * KA / 100 / 12; // eläkettä kuukaudessa yhden työvuoden jälkeen
const V40 = laskeVerot({ tulo: 40000 });
const V42 = laskeVerot({ tulo: KK * 12 });
const TASOT = [2000, 2500, 3000, 3500, 4000, 5000, 7000];
const VUODET = 30;
const EK = P.elake.elinaikakerroin_viimeisin;
const KN = kuukausiNetto(KK, { kunta: 'Helsinki' });
const LOMARAHA = KK / 2;

export default definePage({
  id: 'tyoelakemaksu',
  group: 'vero',
  order: 100,
  mini: 'tyel',
  related: ['sairausvakuutusmaksut', 'tyoelakkeen-karttuminen', 'bruttopalkka-laskuri', 'elakelaskuri'],
  sources: ['etk_maksut', 'vero_ennakonpidatys'],
  fi: {
    slug: 'tyoelakemaksu',
    nav: 'Työeläkemaksu',
    card: 'TyEL-maksu 2026: palkansaajan ja työnantajan osuus, työttömyysvakuutusmaksu ja karttuva eläke.',
    title: `Työeläkemaksu 2026: palkansaajan ${FI.p(M.tyontekija)} ja työnantajan osuus`,
    description: `Työeläkemaksu 2026 on ${FI.p(M.yhteensa)} palkasta: työntekijä maksaa ${FI.p(M.tyontekija)} iästä riippumatta, työnantaja keskimäärin ${FI.p(M.tyonantaja_keskimaarin)}. Laske oma maksusi ja karttuva eläke.`,
    h1: 'Työeläkemaksu eli TyEL-maksu',
    intro: 'Työeläkemaksu on palkkalaskelman suurin yksittäinen vähennys verojen jälkeen, ja se kerryttää sinulle eläkettä jokaisesta palkkaeurosta.',
    resume: `Työeläkemaksu on vuonna 2026 yhteensä ${FI.p(M.yhteensa)} palkasta, ja siitä palkansaaja maksaa ${FI.p(M.tyontekija)} ja työnantaja keskimäärin ${FI.p(M.tyonantaja_keskimaarin)}. Palkansaajan osuus on sama kaikenikäisille ${IKA.alkaa}–${IKA.paattyy}-vuotiaille, sillä ikääntyneiden korotettu maksu on poistunut. ${FI.eur(KK)} kuukausipalkasta työntekijän maksu on ${FI.eur(tt(KK), 2)} ja työnantajan keskimäärin ${FI.eur(ta(KK), 2)} kuukaudessa. Lisäksi ${TVR_IKA.alkaa}–${TVR_IKA.paattyy}-vuotiaan palkasta pidätetään työttömyysvakuutusmaksu ${FI.p(TVR)}, tässä esimerkissä ${FI.eur(tv(KK), 2)}. Eläkettä karttuu ${FI.p(KA, 1)} koko bruttopalkasta: omaa maksua ei vähennetä karttuman pohjasta, joten ${FI.eur(40000)} vuosiansioista syntyy noin ${FI.eur(40000 * KA / 100 / 12)} kuukausieläkettä jokaista työvuotta kohden ennen elinaikakerrointa. Työeläkemaksu ja työttömyysvakuutusmaksu eivät sisälly verokortin prosenttiin, vaan ne näkyvät palkkalaskelmalla omina riveinään. Molemmat ovat vähennyskelpoisia ja pienentävät verotettavaa tuloa, joten maksun todellinen hinta palkansaajalle on pienempi kuin rivin summa. Julkisella sektorilla ja yrittäjillä on omat eläkelakinsa, ja tämä sivu koskee yksityisen työnantajan palveluksessa olevaa palkansaajaa.`,
    faqs: [
      { q: 'Paljonko työeläkemaksu on 3500 euron palkasta?', a: `${FI.eur(KK)} kuukausipalkasta palkansaajan työeläkemaksu on ${FI.eur(tt(KK), 2)} kuukaudessa, ja sen lisäksi pidätetään työttömyysvakuutusmaksu ${FI.eur(tv(KK), 2)}. Työnantaja maksaa samasta palkasta keskimäärin ${FI.eur(ta(KK), 2)}, joten eläkevakuutukseen menee yhteensä ${FI.eur(tt(KK) + ta(KK), 2)} kuukaudessa. Työnantajan todellinen prosentti riippuu sen koosta ja eläkeyhtiöstä, siksi luku on keskiarvo. Palkansaajan osuus ei riipu työnantajasta.` },
      { q: 'Maksavatko yli 53-vuotiaat edelleen suurempaa työeläkemaksua?', a: `Eivät enää. Vuonna 2026 palkansaajan työeläkemaksu on ${FI.p(M.tyontekija)} kaikille ${IKA.alkaa}–${IKA.paattyy}-vuotiaille. Aiemmin ikääntyneiltä työntekijöiltä perittiin korkeampaa maksua ja heille myös karttui eläkettä nopeammin, mutta molemmat porrastukset on poistettu, ja karttuma on nyt ${FI.p(KA, 1)} kaikenikäisille. Muutos näkyy ikääntyneen palkansaajan palkkalaskelmalla hieman suurempana nettopalkkana.` },
      { q: 'Vähennetäänkö oma työeläkemaksu eläkkeen karttumasta?', a: `Ei vähennetä. Eläketurvakeskuksen mukaan palkansaajan maksun vähentäminen karttuman pohjasta lopetettiin vuoden 2017 eläkeuudistuksessa. Eläke karttuu siksi ${FI.p(KA, 1)} koko bruttopalkasta: ${FI.eur(KK)} kuukausipalkasta karttuu noin ${FI.eur(kertyy(KK), 2)} kuukausieläkettä jokaista työvuotta kohden. Elinaikakerroin pienentää summaa eläkkeen alkaessa, ja indeksit kasvattavat sitä ennen eläkkeelle jäämistä.` },
      { q: 'Peritäänkö työeläkemaksu myös lomarahasta?', a: `Peritään. Lomaraha on eläkkeen perusteena olevaa palkkaa, joten siitä pidätetään sekä työeläkemaksu ${FI.p(M.tyontekija)} että työttömyysvakuutusmaksu ${FI.p(TVR)}. Jos lomarahasi on puolet ${FI.eur(KK)} kuukausipalkasta eli ${FI.eur(LOMARAHA)}, siitä menee työeläkemaksua ${FI.eur(tt(LOMARAHA), 2)}. Vastaavasti lomarahasta karttuu eläkettä samalla ${FI.p(KA, 1)} prosentilla kuin muusta palkasta.` },
      { q: 'Paljonko eläkettä kertyy 40 000 euron vuosipalkasta?', a: `Yhdestä vuodesta ${FI.eur(40000)} palkalla karttuu ${FI.p(KA, 1)} eli ${FI.eur(40000 * KA / 100)} vuodessa, mikä tekee ${FI.eur(40000 * KA / 100 / 12)} kuukausieläkettä. Kymmenen samanlaista vuotta tuottaa siis noin ${FI.eur(40000 * KA / 100 / 12 * 10)} kuukaudessa ennen elinaikakerrointa ja indeksikorotuksia. Saman vuoden aikana palkansaaja maksaa työeläkemaksua ${FI.eur(V40.tyoelakemaksu)}.` },
      { q: 'Saako työeläkemaksun vähentää verotuksessa?', a: `Saa, ja vähennys tehdään automaattisesti. Työeläkemaksu ja työttömyysvakuutusmaksu vähennetään puhtaasta ansiotulosta ennen perusvähennystä, joten ne pienentävät kunnallisveroa, valtionveroa ja sairaanhoitomaksua. ${FI.eur(40000)} vuosipalkalla vähennettäviä maksuja kertyy ${FI.eur(V40.tyoelakemaksu + V40.tyottomyysvakuutusmaksu)}. Veroilmoitukseen niitä ei tarvitse lisätä, koska tiedot tulevat tulorekisteristä suoraan Verohallinnolle.` },
      { q: 'Kuinka kauan työeläkemaksua maksetaan?', a: `Työeläkemaksu koskee ${IKA.alkaa}–${IKA.paattyy}-vuotiaiden palkkoja, ja eläkettä karttuu samalta ajalta. Maksu ja karttuminen päättyvät ylimpään vanhuuseläkeikään, joka on nuoremmilla ikäluokilla ${P.elake.ylin_elakeika_1962_jalkeen} vuotta. Työttömyysvakuutusmaksu loppuu aiemmin: se koskee vain ${TVR_IKA.alkaa}–${TVR_IKA.paattyy}-vuotiaita. Eläkkeellä oleva, joka jatkaa töitä, maksaa työeläkemaksua edelleen, ja hänelle karttuu uutta eläkettä.` },
    ],
    body: (h) => `
<h2>Kuka maksaa mitäkin</h2>
<p>Yksityisen sektorin työeläkkeet rahoitetaan TyEL-maksulla, jonka ${h.src('etk_maksut', 'Eläketurvakeskus')} vahvistaa vuosittain. Vuonna 2026 maksu on keskimäärin ${h.num(M.yhteensa, 2)} % palkkasummasta. Siitä palkansaaja maksaa ${h.num(M.tyontekija, 2)} %, ja loput, keskimäärin ${h.num(M.tyonantaja_keskimaarin, 2)} %, jää työnantajan maksettavaksi. Työnantajan prosentti vaihtelee yrityksen koon ja eläkeyhtiön asiakashyvitysten mukaan, mutta palkansaajan osuus on kaikille sama.</p>
<p>Työeläkemaksun rinnalla palkasta pidätetään työttömyysvakuutusmaksu ${h.num(TVR, 2)} %. Sitä peritään ${TVR_IKA.alkaa}–${TVR_IKA.paattyy}-vuotiailta, ja se rahoittaa ansiosidonnaista työttömyysturvaa. Kummankin maksun prosentit ovat samat kuin Verohallinnon ${h.src('vero_ennakonpidatys', 'ennakonpidätyspäätöksessä')}, jossa ne vähennetään tulosta ennen verojen laskemista.</p>
${h.table(['Kuukausipalkka', 'Työntekijän TyEL', 'Työttömyysvakuutus', 'Työnantajan TyEL (ka.)', 'Eläkettä karttuu / kk'], TASOT.map((kk) => [h.eur(kk), h.eur(tt(kk), 2), h.eur(tv(kk), 2), h.eur(ta(kk), 2), h.eur(kertyy(kk), 2)]), 'Maksut kuukaudessa ja yhden työvuoden kerryttämä kuukausieläke, vuosi 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Viimeinen sarake näyttää, paljonko kuukausieläkettä yksi vuosi kyseisellä palkalla kerryttää ennen elinaikakerrointa ja indeksikorotuksia. ${h.eur(KK)} palkalla se on ${h.eur(kertyy(KK), 2)}; ${VUODET} vuoden työuralla samalla palkalla tulee noin ${h.eur(kertyy(KK) * VUODET)} kuukaudessa ennen kerrointa. Tarkempi arvio, jossa palkka muuttuu uran aikana, syntyy ${h.a('elakelaskuri', 'eläkelaskurissa')}.</p>
<h2>Karttuma koko bruttopalkasta</h2>
<p>Eläkettä karttuu ${h.num(KA, 1)} % vuoden työansioista ${IKA.alkaa} vuoden iästä alkaen. Pohja on bruttopalkka sellaisenaan: palkansaajan omaa maksua ei enää vähennetä siitä, kuten ennen vuoden 2017 uudistusta tehtiin. Samassa uudistuksessa päätettiin luopua ikääntyneiden korotetuista karttumista, ja vuodesta 2026 alkaen sekä karttuma että maksu ovat kaikille ikäryhmille samat. Ikääntyneelle työntekijälle muutos tarkoittaa pienempää maksua mutta myös hitaampaa karttumista kuin ennen.</p>
<p>Lomaraha, ylityökorvaukset, tulospalkkiot ja luontoisedut ovat eläkkeen perusteena olevaa palkkaa, joten niistä peritään maksu ja niistä karttuu eläkettä. Kulukorvaukset, kuten päivärahat ja kilometrikorvaukset, eivät ole palkkaa, eikä niistä makseta työeläkemaksua. Karttumisen yksityiskohdat, kuten etuuksien ajalta karttuva eläke, ovat sivulla ${h.a('tyoelakkeen-karttuminen', 'työeläkkeen karttuminen')}.</p>
<h2>Elinaikakerroin leikkaa karttuneesta eläkkeestä</h2>
<p>Karttunut eläke ei siirry sellaisenaan eläkkeeksi. Kun vanhuuseläke alkaa, se kerrotaan oman ikäluokan elinaikakertoimella, joka on vuonna ${EK.syntymavuosi} syntyneillä ${h.num(EK.arvo, 5)}. Jos ${h.eur(40000)} vuosiansioista karttuu ${h.eur(40000 * KA / 100 / 12)} kuukausieläkettä, kerroin pienentää sen noin ${h.eur(40000 * KA / 100 / 12 * EK.arvo, 2)} euroon. Toisaalta karttunutta eläkettä korotetaan työuran aikana palkkakertoimella, joten nuorena ansaitun eläkkeen arvo ei jää vuosikymmeniksi samaan euromäärään. Työeläkemaksun ja tulevan eläkkeen suhde ei siksi ole yksi yhteen, mutta mitä suurempi palkka, sitä suurempi maksu ja sitä suurempi karttuma.</p>
<h2>Mitä maksu oikeasti maksaa</h2>
<p>Työeläkemaksu näkyy palkkalaskelmalla täysimääräisenä, mutta sen nettohinta on pienempi, koska maksu vähennetään verotuksessa. ${h.eur(KK * 12)} vuosipalkalla työeläkemaksu on ${h.eur(V42.tyoelakemaksu)} ja työttömyysvakuutusmaksu ${h.eur(V42.tyottomyysvakuutusmaksu)} vuodessa. Molemmat pienentävät verotettavaa tuloa ja siten kunnallisveroa, valtionveroa ja sairaanhoitomaksua. Verokortin prosentti on laskettu jo valmiiksi niin, että maksut on vähennetty, joten erillistä palautusta ei tule.</p>
<p>Palkkalaskelmalla maksut erottuvat siitä, että ne pidätetään prosenttina bruttopalkasta verokortin prosentin lisäksi. ${h.eur(KK)} palkalla pidätykset ovat siis noin ${h.num(M.tyontekija + TVR, 2)} prosenttiyksikköä suuremmat kuin verokortin prosentti. ${h.a('bruttopalkka-laskuri', 'Bruttopalkkalaskuri')} laskee tämän toiseen suuntaan: minkä bruttopalkan tarvitset tiettyyn nettopalkkaan.</p>
<h2>Esimerkki palkkalaskelmasta</h2>
<p>Alla on ${h.eur(KK)} kuukausipalkan palkkalaskelma Helsingissä asuvalle palkansaajalle, joka ei kuulu kirkkoon. Veron pidätys lasketaan verokortin prosentilla ${h.num(KN.veroprosentti, 1)} %, ja työeläkemaksu ja työttömyysvakuutusmaksu pidätetään sen lisäksi omina riveinään.</p>
${h.table(['Rivi', 'Euroa kuukaudessa'], [
  ['Bruttopalkka', h.eur(KK, 2)],
  [`Ennakonpidätys ${h.num(KN.veroprosentti, 1)} %`, `−${h.eur(KN.kkVero, 2)}`],
  [`Työeläkemaksu ${h.num(M.tyontekija, 2)} %`, `−${h.eur(tt(KK), 2)}`],
  [`Työttömyysvakuutusmaksu ${h.num(TVR, 2)} %`, `−${h.eur(tv(KK), 2)}`],
  ['Nettopalkka', h.eur(KN.kkNetto, 2)],
], 'Palkkalaskelma, Helsinki, vuosi 2026', ['l', 'r'])}
<p>Työeläkemaksu on tässä esimerkissä noin kolmannes kaikista pidätyksistä. Se ei kuitenkaan ole menetetty raha samalla tavalla kuin vero, koska jokainen maksettu euro kuuluu samaan palkkaan, josta eläkettä karttuu. Työttömyysvakuutusmaksu on pienempi, mutta se on edellytys ansiosidonnaiselle turvalle vain, jos kuulut työttömyyskassaan; ilman kassan jäsenyyttä maksu peritään silti.</p>
<h2>Työnantajan näkökulma</h2>
<p>Työnantajalle palkansaajan bruttopalkka ei ole koko kustannus. ${h.eur(KK)} palkasta työnantaja maksaa TyEL-maksua keskimäärin ${h.eur(ta(KK), 2)} kuukaudessa, joten pelkkä palkka ja eläkemaksu tekevät yhteensä ${h.eur(KK + ta(KK), 2)}. Tämän päälle tulevat työnantajan sairausvakuutusmaksu, työttömyysvakuutusmaksu, tapaturmavakuutus ja lomapalkat. Palkkaneuvotteluissa kannattaa muistaa, että työnantajan osuus on yli kaksi kertaa palkansaajan osuus, ja juuri se kerryttää suurimman osan tulevasta eläkkeestäsi.</p>
<h2>Ulkomailta tulevalle</h2>
<p>Suomessa työskentelevä on pääsääntöisesti Suomen työeläkejärjestelmän piirissä, ja maksu pidätetään palkasta ensimmäisestä kuukaudesta alkaen. Karttunut työeläke maksetaan aikanaan myös ulkomaille. Jos sinut on lähetetty Suomeen ulkomaisen työnantajan palveluksesta ja kuulut edelleen kotimaasi järjestelmään, maksut voivat määräytyä toisin; tilanteen ratkaisee eläkelaitos, ei Verohallinto. EU- ja ETA-maissa sekä sosiaaliturvasopimusmaissa eri maissa karttuneet eläkkeet eivät kumoa toisiaan: jokainen maa maksaa oman osuutensa, ja Suomessa karttunut työeläke lasketaan samalla ${h.num(KA, 1)} prosentin karttumalla kuin suomalaisen työkaverin.</p>`,
  },
  en: {
    slug: 'pension-contribution',
    nav: 'Pension contribution',
    card: 'TyEL contribution 2026: your share, your employer’s, unemployment insurance and the pension it builds.',
    title: `Pension contribution 2026: ${EN.p(M.tyontekija)} TyEL fee on Finnish pay`,
    description: `Pension contribution 2026 in Finland: TyEL is ${EN.p(M.yhteensa)} of pay, of which employees pay ${EN.p(M.tyontekija)} at any age and employers ${EN.p(M.tyonantaja_keskimaarin)} on average. See what it builds.`,
    h1: 'The Finnish pension contribution (TyEL)',
    intro: 'The biggest deduction on a Finnish payslip after tax is the earnings-related pension contribution, and it buys you pension from every euro of salary.',
    resume: `The earnings-related pension contribution (työeläkemaksu, or TyEL contribution) for private-sector employees in Finland is ${EN.p(M.yhteensa)} of pay in 2026. You pay ${EN.p(M.tyontekija)} and your employer pays the rest, ${EN.p(M.tyonantaja_keskimaarin)} on average. Since 2026 the employee rate is the same for everyone aged ${IKA.alkaa} to ${IKA.paattyy}. On a monthly salary of ${EN.eur(KK)} your share is ${EN.eur(tt(KK), 2)} and your employer’s about ${EN.eur(ta(KK), 2)}. Employees aged ${TVR_IKA.alkaa} to ${TVR_IKA.paattyy} also pay unemployment insurance of ${EN.p(TVR)}, here ${EN.eur(tv(KK), 2)}. In return, pension accrues at ${EN.p(KA, 1)} of your full gross pay, so a year on ${EN.eur(40000)} adds about ${EN.eur(40000 * KA / 100 / 12)} a month to your future pension before the life expectancy coefficient. Neither contribution is part of the tax card percentage; they appear as separate lines on your payslip and are deducted from your taxable income automatically.`,
    faqs: [
      { q: 'Do I get my Finnish pension contributions back if I leave Finland?', a: `No, contributions are not refunded, but the pension you earn stays yours. At ${EN.p(KA, 1)} a year of gross pay, a year on ${EN.eur(KK)} a month builds about ${EN.eur(kertyy(KK), 2)} of monthly pension, which Finland pays abroad once you reach retirement age. Within the EU, periods in different countries are coordinated, but each country pays its own share.` },
      { q: 'How much does my employer pay into my pension?', a: `On average ${EN.p(M.tyonantaja_keskimaarin)} of your gross pay in 2026, more than twice your own ${EN.p(M.tyontekija)}. On ${EN.eur(KK)} a month that is about ${EN.eur(ta(KK), 2)}. The exact employer rate depends on company size and its pension insurer, which is why the Finnish Centre for Pensions publishes an average rather than a single figure.` },
      { q: 'Is the TyEL contribution higher for older workers?', a: `Not any more. In 2026 every employee aged ${IKA.alkaa} to ${IKA.paattyy} pays ${EN.p(M.tyontekija)}, and pension accrues at ${EN.p(KA, 1)} for all ages. Older workers previously paid a higher rate and earned pension faster; both age steps have been removed, so an older employee now sees slightly higher take-home pay and slower accrual than before.` },
      { q: 'Is pension contribution taken from my holiday bonus too?', a: `Yes. Holiday bonus (lomaraha) is pensionable pay, so both the ${EN.p(M.tyontekija)} pension contribution and the ${EN.p(TVR)} unemployment insurance are withheld from it. A holiday bonus of half a ${EN.eur(KK)} monthly salary, ${EN.eur(LOMARAHA)}, carries ${EN.eur(tt(LOMARAHA), 2)} of pension contribution, and pension accrues on it at ${EN.p(KA, 1)} like on any other pay.` },
      { q: 'Is my pension contribution tax deductible in Finland?', a: `Yes, automatically. The pension contribution and unemployment insurance are deducted from your net earned income before tax is calculated, so they reduce state tax, municipal tax and the health care contribution. On ${EN.eur(40000)} a year they total ${EN.eur(V40.tyoelakemaksu + V40.tyottomyysvakuutusmaksu)}. Your tax card already reflects this; you do not need to enter them in your tax return.` },
    ],
    body: (h) => `
<h2>Who pays what</h2>
<p>Private-sector earnings-related pensions are funded by the TyEL contribution, which the ${h.src('etk_maksut', 'Finnish Centre for Pensions (Eläketurvakeskus)')} confirms each year. In 2026 it averages ${h.num(M.yhteensa, 2)}% of payroll: ${h.num(M.tyontekija, 2)}% from you and on average ${h.num(M.tyonantaja_keskimaarin, 2)}% from your employer. Employer rates differ with company size and the insurer’s client bonuses, but the employee rate is identical for everyone.</p>
<p>Unemployment insurance of ${h.num(TVR, 2)}% is withheld alongside it from employees aged ${TVR_IKA.alkaa} to ${TVR_IKA.paattyy}. It funds the earnings-related unemployment allowance paid by the funds (kassa). Both rates are used in ${h.src('vero_ennakonpidatys', 'Vero’s withholding rules')}, which subtract them from income before tax is worked out.</p>
${h.table(['Monthly salary', 'Your TyEL', 'Unemployment insurance', 'Employer TyEL (avg.)', 'Pension accrued / month'], TASOT.map((kk) => [h.eur(kk), h.eur(tt(kk), 2), h.eur(tv(kk), 2), h.eur(ta(kk), 2), h.eur(kertyy(kk), 2)]), 'Monthly contributions and the monthly pension one year of work builds, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>The last column is the monthly pension that one year at that salary adds, before the life expectancy coefficient and index increases. At ${h.eur(KK)} it is ${h.eur(kertyy(KK), 2)}; ${VUODET} years on that salary would give roughly ${h.eur(kertyy(KK) * VUODET)} a month before the coefficient. For a career with changing pay, use the ${h.a('elakelaskuri', 'pension calculator')}.</p>
<h2>Accrual on the whole gross salary</h2>
<p>Pension accrues at ${h.num(KA, 1)}% of each year’s earnings from age ${IKA.alkaa}. The base is your gross salary as it stands; your own contribution is no longer deducted from it, a rule dropped in the 2017 reform. That reform also ended the higher accrual for older workers, and from 2026 contribution and accrual are the same at every age. Holiday bonus, overtime, performance pay and taxable benefits count as pensionable salary, while expense allowances such as per diems and mileage do not. More detail, including pension built up while on benefits, is on the ${h.a('tyoelakkeen-karttuminen', 'pension accrual')} page.</p>
<h2>The life expectancy coefficient</h2>
<p>Accrued pension is not paid out unchanged. When your old-age pension starts it is multiplied by the life expectancy coefficient (elinaikakerroin) of your birth cohort, ${h.num(EK.arvo, 5)} for people born in ${EK.syntymavuosi}. The ${h.eur(40000 * KA / 100 / 12)} a month earned from a year on ${h.eur(40000)} would become about ${h.eur(40000 * KA / 100 / 12 * EK.arvo, 2)}. In the meantime, accrued amounts are revalued with a wage coefficient during your career, so pension earned in your twenties keeps pace with pay levels.</p>
<h2>What it really costs you</h2>
<p>The full contribution shows on your payslip, but its net cost is lower because it is deductible. On ${h.eur(KK * 12)} a year you pay ${h.eur(V42.tyoelakemaksu)} of pension contribution and ${h.eur(V42.tyottomyysvakuutusmaksu)} of unemployment insurance, and both reduce your taxable income. Your tax card rate already assumes these deductions, so no separate refund follows. Total deductions from pay therefore run about ${h.num(M.tyontekija + TVR, 2)} points above the percentage on your tax card. The ${h.a('bruttopalkka-laskuri', 'gross salary calculator')} works this backwards from a target net pay.</p>
<h2>A payslip, line by line</h2>
<p>Here is a ${h.eur(KK)} monthly payslip for someone living in Helsinki who is not a church member. Tax is withheld at the tax card rate of ${h.num(KN.veroprosentti, 1)}%, and the two contributions come on top as separate lines.</p>
${h.table(['Line', 'Euros per month'], [
  ['Gross salary', h.eur(KK, 2)],
  [`Tax withheld at ${h.num(KN.veroprosentti, 1)}%`, `−${h.eur(KN.kkVero, 2)}`],
  [`Pension contribution ${h.num(M.tyontekija, 2)}%`, `−${h.eur(tt(KK), 2)}`],
  [`Unemployment insurance ${h.num(TVR, 2)}%`, `−${h.eur(tv(KK), 2)}`],
  ['Net pay', h.eur(KN.kkNetto, 2)],
], 'Payslip, Helsinki, 2026', ['l', 'r'])}
<p>The pension line is about a third of everything withheld. Unlike tax, it comes back as pension accrued on the same salary. Unemployment insurance is charged whether or not you have joined an unemployment fund (työttömyyskassa), but only fund members receive the earnings-related allowance it finances.</p>
<h2>The employer’s side</h2>
<p>For your employer, a ${h.eur(KK)} salary costs about ${h.eur(KK + ta(KK), 2)} a month with TyEL alone, before its own health insurance, unemployment insurance, accident insurance and holiday pay. If you are comparing a Finnish offer with one from a country where pensions are mostly private, remember that the employer share here is more than double yours, and it builds most of your statutory pension.</p>
<h2>If you came from abroad</h2>
<p>Anyone working for a Finnish employer is normally insured under TyEL from the first payslip, and the pension earned is paid abroad later if you move away. If you were posted to Finland by a foreign employer and stay in your home country’s scheme, different rules can apply; the pension provider, not Vero, decides. Health insurance contributions are a separate matter, covered on the ${h.a('sairausvakuutusmaksut', 'health insurance contributions')} page.</p>`,
  },
});
