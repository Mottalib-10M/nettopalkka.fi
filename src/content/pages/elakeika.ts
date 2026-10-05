import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { ikaKuukausina, elakeIat, type IkaKk } from '../../lib/engine/elake';

const E = P.elake;
const VAHV = E.elakeika_vahvistettu as Record<string, { alin: IkaKk; tavoite: IkaKk; ylin: number; ove: IkaKk }>;
const ENN = E.elakeika_ennuste as Record<string, { alin: IkaKk; tavoite: IkaKk | null; ove: IkaKk }>;
const RAJAT = E.elake_1965_alin_rajat as { vahintaan: IkaKk; enintaan: IkaKk };
const YLIN = E.ylin_elakeika_1962_jalkeen;
const V64 = VAHV['1964'], V61 = VAHV['1961'], V56 = VAHV['1956'], V58 = VAHV['1958'];
const E65 = ENN['1965'], E80 = ENN['1980'], E90 = ENN['1990'];
const VAHVVUODET = Object.keys(VAHV);
const ENNVUODET = Object.keys(ENN);
/** Vahvistusikä: vuoden 1964 kerroin vahvistettiin vuodelle, jona ikäluokka täyttää tämän iän. */
const VAHVISTUSIKA = Number(E.elinaikakerroin_viimeisin.vahvistettu.slice(0, 4)) + 1 - E.elinaikakerroin_viimeisin.syntymavuosi;
/** Suurin vuosimuutos kuukausina (1965: ± tämä 1962–1964 tasosta). */
const MAXMUUTOS = ikaKuukausina(RAJAT.enintaan) - ikaKuukausina(V64.alin);
/** Ikäportaan nousu ikäluokkaa kohti 1956–1961. */
const PORRAS = ikaKuukausina(VAHV['1957'].alin) - ikaKuukausina(V56.alin);
const ENSIMMAINEN_1965 = 1965 + RAJAT.vahintaan[0] + 1;
const TAVOITE_ERO64 = ikaKuukausina(V64.tavoite) - ikaKuukausina(V64.alin);
const KERROIN64 = E.elinaikakerroin['1964'];
const KE65 = E.kansanelake.ika_ennen_1965;
const LYK = E.lykkayskorotus_prosentti_kk;
const I85 = elakeIat(1985);
const HAARUKKA = ikaKuukausina(RAJAT.enintaan) - ikaKuukausina(RAJAT.vahintaan);
const KE_VIIVE61 = KE65 * 12 - ikaKuukausina(V61.alin);

const ikaFi = (i: IkaKk) => (i[1] ? `${i[0]} v ${i[1]} kk` : `${i[0]} v`);
const ikaEn = (i: IkaKk) => (i[1] ? `${i[0]} y ${i[1]} m` : `${i[0]} y`);
const ikaFiPitka = (i: IkaKk) => (i[1] ? `${i[0]} vuotta ${i[1]} kuukautta` : `${i[0]} vuotta`);
const ikaEnPitka = (i: IkaKk) => (i[1] ? `${i[0]} years ${i[1]} months` : `${i[0]}`);

export default definePage({
  id: 'elakeika',
  group: 'elake',
  order: 10,
  mini: 'elakeika',
  related: ['elakelaskuri', 'elinaikakerroin', 'osittainen-vanhuuselake', 'elakkeen-lykkaaminen'],
  sources: ['tyoelake_ika', 'etk_elinaikakerroin', 'finlex_tyel'],
  fi: {
    slug: 'elakeika',
    nav: 'Eläkeikä',
    card: 'Alin, tavoite- ja ylin eläkeikä syntymävuoden mukaan, vahvistetut iät ja ennusteet erikseen.',
    title: 'Eläkeikä 2026: alin ja tavoite-eläkeikä syntymävuoden mukaan',
    description: `Eläkeikä 2026: 1962–1964 syntyneiden alin vanhuuseläkeikä on ${V64.alin[0]} vuotta. Vuoden 1965 ikäluokan ikä vahvistetaan syksyllä 2026; myöhemmät ovat vasta ennusteita.`,
    h1: 'Eläkeikä syntymävuoden mukaan',
    intro: 'Valitse syntymävuosi, niin näet alimman eläkeiän, tavoite-eläkeiän ja sen, onko ikä jo vahvistettu.',
    resume: `Vuosina 1962–1964 syntyneiden alin vanhuuseläkeikä on ${V64.alin[0]} vuotta ja ylin eläkeikä ${YLIN} vuotta; nämä iät on vahvistettu laissa. Vuonna 1965 syntyneiden ikärajaa ei lokakuun 2026 alussa ole vielä vahvistettu: se sidotaan elinajanodotteeseen, ja sosiaali- ja terveysministeriön asetuksella se asettuu välille ${ikaFiPitka(RAJAT.vahintaan)} ja ${ikaFiPitka(RAJAT.enintaan)}. Asetus annetaan viimeistään kaksi kuukautta ennen sen vuoden alkua, jona ikäluokka täyttää ${VAHVISTUSIKA} vuotta, eli vuoden 1965 ikäluokalle viimeistään lokakuun 2026 lopussa. Työeläke.fi:n laskuri ennustaa tälle ikäluokalle ${ikaFi(E65.alin)}, mutta luku on arvio eikä päätös. Myöhemmin syntyneiden iät ovat kaikki ennusteita, esimerkiksi vuonna 1980 syntyneelle ${ikaFi(E80.alin)}. Alimman iän lisäksi jokaisella ikäluokalla on tavoite-eläkeikä, jossa lykkäyskorotus kattaa elinaikakertoimen leikkauksen: vuonna 1964 syntyneellä se on ${ikaFi(V64.tavoite)}. Kelan kansaneläkkeen ikäraja on ennen vuotta 1965 syntyneillä ${KE65} vuotta ja myöhemmin sama kuin työeläkkeen alin ikä.`,
    faqs: [
      { q: 'Milloin vuonna 1965 syntynyt pääsee vanhuuseläkkeelle?', a: `Tarkkaa ikää ei ole vielä vahvistettu. Laki rajaa sen välille ${ikaFiPitka(RAJAT.vahintaan)} ja ${ikaFiPitka(RAJAT.enintaan)}, ja ministeriön asetus annetaan viimeistään lokakuun 2026 lopussa. Työeläke.fi:n ennuste on ${ikaFi(E65.alin)}. Koska alarajakin on yli ${RAJAT.vahintaan[0]} vuotta, kukaan tästä ikäluokasta ei jää vanhuuseläkkeelle ennen vuotta ${ENSIMMAINEN_1965}.` },
      { q: 'Mikä on vuonna 1964 syntyneen alin ja ylin eläkeikä?', a: `Alin vanhuuseläkeikä on ${ikaFiPitka(V64.alin)} ja ylin ${V64.ylin} vuotta. Tavoite-eläkeikä on ${ikaFi(V64.tavoite)}, ja osittaisen varhennetun vanhuuseläkkeen voi ottaa aikaisintaan ${V64.ove[0]}-vuotiaana. Elinaikakerroin on ${FI.num(KERROIN64, 5)}, joten alimmassa iässä alkava työeläke on noin ${FI.num((1 - KERROIN64) * 100, 1)} % kertynyttä pienempi. Nämä iät ovat lopullisia, toisin kuin nuoremmilla ikäluokilla.` },
      { q: 'Saako Kelan kansaneläkkeen samassa iässä kuin työeläkkeen?', a: `Ennen vuotta 1965 syntyneillä kansaneläkkeen ikäraja on ${KE65} vuotta. Vuosina 1962–1964 syntyneillä se osuu yksiin työeläkkeen alimman iän kanssa, mutta esimerkiksi vuonna 1958 syntyneen työeläke alkoi jo ${ikaFiPitka(V58.alin)} iässä. Vuodesta 1965 alkaen kansaneläkkeen ikä on sama kuin työeläkkeen alin vanhuuseläkeikä, joten ero poistuu.` },
      { q: 'Onko vuonna 1980 syntyneen eläkeikä varmasti yli 66 vuotta?', a: `Ei varmasti. Työeläke.fi:n laskuri arvioi vuonna 1980 syntyneen alimmaksi eläkeiäksi ${ikaFi(E80.alin)} ja tavoite-eläkeiäksi ${ikaFi(E80.tavoite!)}, mutta arvio perustuu elinajanodotteen kehitykseen. Ikä vahvistetaan vasta vuonna, jona ikäluokka täyttää ${VAHVISTUSIKA}, ja se voi nousta vuodessa enintään ${MAXMUUTOS} kuukautta.` },
      { q: 'Mitä tapahtuu, jos teen töitä alimman eläkeiän jälkeen?', a: `Jokainen kuukausi, jonka lykkäät eläkkeen alkua alimman ikäsi yli, korottaa työeläkettä ${FI.num(LYK, 1)} %. Lisäksi palkasta kertyy uutta eläkettä ${FI.num(E.karttumaprosentti, 1)} % ${E.karttuma_ika.paattyy} ikävuoteen asti. Ylin eläkeikä, vuonna 1962 tai myöhemmin syntyneillä ${YLIN} vuotta, on raja, jonka jälkeen työeläkettä ei enää kerry.` },
    ],
    body: (h) => `
<h2>Vahvistetut eläkeiät 1956–1964</h2>
<p>Vuoden 2017 eläkeuudistus nosti alinta vanhuuseläkeikää ${PORRAS} kuukaudella jokaista ikäluokkaa kohti, kunnes taso ${V64.alin[0]} vuotta saavutettiin vuonna 1962 syntyneillä. Samalla ylin eläkeikä, johon asti työeläkettä voi kerryttää, nousi ${V56.ylin} vuodesta ${YLIN} vuoteen. Taulukon iät on kirjattu ${h.src('finlex_tyel', 'työntekijän eläkelakiin')} ja julkaistu ${h.src('tyoelake_ika', 'Työeläke.fi-sivustolla')}, joten ne eivät enää muutu.</p>
${h.table(['Syntymävuosi', 'Alin eläkeikä', 'Tavoite-eläkeikä', 'Osittainen aikaisintaan', 'Ylin eläkeikä'], VAHVVUODET.map((v) => [v, ikaFi(VAHV[v].alin), ikaFi(VAHV[v].tavoite), ikaFi(VAHV[v].ove), `${VAHV[v].ylin} v`]), 'Vahvistetut ikärajat (työeläkkeet)', ['l', 'r', 'r', 'r', 'r'])}
<p>Huomaa, että vuosina 1962, 1963 ja 1964 syntyneillä alin ikä on sama, ${V64.alin[0]} vuotta, mutta tavoite-eläkeikä vaihtelee kuukaudella. Tavoite-eläkeikä riippuu kunkin ikäluokan elinaikakertoimesta, joka lasketaan kuolevuustilastoista erikseen joka vuosi. Siksi kaksi peräkkäin syntynyttä voi saada eri tavoitteen, vaikka eläkkeelle pääsee samassa iässä.</p>
<h2>Vuonna 1965 syntyneet: ikää ei ole vielä päätetty</h2>
<p>Vuonna 1965 syntyneistä alkaen alin vanhuuseläkeikä kytketään elinajanodotteeseen. Eläketurvakeskus laskee tarkistuksen ensimmäisen kerran tälle ikäluokalle, ja muutos tehdään täysinä kuukausina, korkeintaan ${MAXMUUTOS} kuukautta vuodessa. Lähtötaso on ${V64.alin[0]} vuotta, joten vuoden 1965 ikäluokan alin eläkeikä on vähintään ${ikaFiPitka(RAJAT.vahintaan)} ja enintään ${ikaFiPitka(RAJAT.enintaan)}.</p>
<p>Sosiaali- ja terveysministeriö vahvistaa iän asetuksella viimeistään kaksi kuukautta ennen sen kalenterivuoden alkua, jona ikäluokka täyttää ${VAHVISTUSIKA} vuotta. Vuonna 1965 syntyneille takaraja on siis lokakuun 2026 loppu. Tämän sivun päivityshetkellä asetusta ei ole annettu, joten laskurimme merkitsee vuoden 1965 ikärajan ennusteeksi. Ensimmäiset tämän ikäluokan vanhuuseläkkeet voivat alkaa aikaisintaan vuonna ${ENSIMMAINEN_1965}.</p>
<p>Ylä- ja alarajan väli on ${HAARUKKA} kuukautta. Jos suunnittelet jääväsi pois töistä täsmälleen alimmassa iässä, eläkepäivää ei kannata lyödä lukkoon ennen asetusta: muutaman kuukauden virhe tarkoittaa joko kuukausia ilman palkkaa ja eläkettä tai ylimääräisiä työkuukausia. Myöhempi ikä ei silti ole pelkkää menetystä, sillä jokainen alimman iän jälkeen tehty kuukausi kasvattaa eläkettä lykkäyskorotuksen verran.</p>
<h2>Ennusteet vuonna 1965 ja myöhemmin syntyneille</h2>
<p>Työeläke.fi:n virallinen laskuri näyttää nuoremmille ikäluokille arvion, ja sama arvio on tämän sivun minilaskurissa. Luvut ovat suuntaa antavia, koska ne riippuvat siitä, miten elinajanodote todella kehittyy ennen kuin ikäluokka täyttää ${VAHVISTUSIKA} vuotta. Taulukon iät on poimittu laskurin tiedoista lokakuussa 2026.</p>
${h.table(['Syntymävuosi', 'Alin (ennuste)', 'Tavoite (ennuste)', 'Osittainen (ennuste)'], ENNVUODET.map((v) => [v, ikaFi(ENN[v].alin), ENN[v].tavoite ? ikaFi(ENN[v].tavoite!) : 'ei lasketa', ikaFi(ENN[v].ove)]), 'Ennusteita, ei vahvistettuja ikärajoja', ['l', 'r', 'r', 'r'])}
<p>Vuonna 1993 ja sen jälkeen syntyneille Työeläke.fi ei laske tavoite-eläkeikää lainkaan. Ylin eläkeikä pysyy näillä ikäluokilla ${YLIN} vuodessa. Osittaisen varhennetun vanhuuseläkkeen alaikäraja seuraa alinta ikää kolmen vuoden etäisyydellä, mikä näkyy taulukon viimeisessä sarakkeessa.</p>
<h2>Tavoite-eläkeikä ja elinaikakerroin</h2>
<p>Tavoite-eläkeikä on ikä, jossa lykkäyskorotus on yhtä suuri kuin elinaikakertoimen aiheuttama kuukausieläkkeen pienennys alimmassa eläkeiässä. Vuonna 1964 syntyneen kerroin ${h.num(KERROIN64, 5)} leikkaa alkavaa eläkettä noin ${h.num((1 - KERROIN64) * 100, 1)} prosenttia. Tavoite on ${TAVOITE_ERO64} kuukautta alinta ikää myöhemmin, ja ${TAVOITE_ERO64} kuukauden lykkäys korottaa eläkettä ${h.num(TAVOITE_ERO64 * LYK, 1)} prosenttia. Leikkaus siis kuroutuu umpeen. Laskelma on selitetty tarkemmin sivuilla ${h.a('elinaikakerroin', 'elinaikakerroin')} ja ${h.a('elakkeen-lykkaaminen', 'eläkkeen lykkääminen')}.</p>
<p>Tavoite-eläkeikä ei ole velvoite. Alimmassa iässä saa jäädä eläkkeelle, mutta silloin kerroin pienentää eläkettä pysyvästi. ${h.a('elakelaskuri', 'Eläkelaskuri')} näyttää kummankin vaihtoehdon kuukausieläkkeen omalla palkallasi.</p>
<h2>Muut ikärajat samassa järjestelmässä</h2>
<ul>
<li><strong>Kansaneläke:</strong> ennen vuotta 1965 syntyneillä ${KE65} vuotta, sen jälkeen sama kuin työeläkkeen alin vanhuuseläkeikä.</li>
<li><strong>Osittainen varhennettu vanhuuseläke:</strong> 1956–1963 syntyneillä ${VAHV['1963'].ove[0]} vuotta, vuonna 1964 syntyneillä ${V64.ove[0]} vuotta, myöhemmin kolme vuotta ennen omaa alinta ikää. Ks. ${h.a('osittainen-vanhuuselake', 'osittainen varhennettu vanhuuseläke')}.</li>
<li><strong>Työuraeläke:</strong> aikaisintaan ${E.tyouraelake_ika} vuoden iässä, jos takana on vähintään ${E.tyouraelake_tyovuodet} vuoden työura rasittavassa työssä ja terveys heikentää työkykyä.</li>
<li><strong>Karttumisen yläraja:</strong> työeläkettä kertyy ${E.karttuma_ika.alkaa}–${E.karttuma_ika.paattyy}-vuotiaana tehdystä työstä.</li>
</ul>
<p>Vuonna 1961 syntyneen esimerkki kertoo, miten eri iät asettuvat: alin ikä ${ikaFi(V61.alin)}, tavoite ${ikaFi(V61.tavoite)} ja ylin ${V61.ylin} vuotta. Hänen kansaneläkkeensä alkoi kuitenkin vasta ${KE65} vuoden iässä, ${KE_VIIVE61} kuukautta työeläkkeen jälkeen, jos hän jäi eläkkeelle heti alimmassa iässä.</p>`,
  },
  en: {
    slug: 'retirement-age',
    nav: 'Retirement age',
    card: 'Earliest, target and upper retirement age by birth year, with confirmed ages and forecasts kept apart.',
    title: 'Retirement Age in Finland 2026: Earliest and Target Age',
    description: `Retirement age 2026: people born 1962–1964 can retire at ${V64.alin[0]}. The age for the 1965 cohort is set in autumn 2026; later years are only tyoelake.fi forecasts.`,
    h1: 'Finnish retirement age by year of birth',
    intro: 'Pick your birth year to see your earliest retirement age, your target age and whether the figure is confirmed yet.',
    resume: `If you were born between 1962 and 1964, your earliest old-age retirement age (alin vanhuuseläkeikä) in Finland is ${V64.alin[0]} and the upper age is ${YLIN}; both are fixed in law. For anyone born in 1965 or later the age is not settled. From that cohort onwards it is tied to life expectancy, and for those born in 1965 it will land somewhere between ${ikaEnPitka(RAJAT.vahintaan)} and ${ikaEnPitka(RAJAT.enintaan)}. The Ministry of Social Affairs and Health has to confirm it by decree no later than the end of October 2026, and as of early October 2026 it has not done so. The official calculator on Työeläke.fi forecasts ${ikaEn(E65.alin)} for 1965, and ${ikaEn(E90.alin)} for someone born in 1990, but these are projections, not entitlements. Each cohort also has a target retirement age (tavoite-eläkeikä), the point at which the deferral increase offsets the life expectancy cut: ${ikaEn(V64.tavoite)} for people born in 1964. The Kela national pension starts at ${KE65} for those born before 1965.`,
    faqs: [
      { q: 'I was born in 1985, when can I retire in Finland?', a: `Nobody can say for certain yet. Your age will be confirmed only in the year you turn ${VAHVISTUSIKA}. Työeläke.fi currently projects ${ikaEn(ENN['1984'].alin)} for the 1984 cohort and ${ikaEn(E90.alin)} for 1990; between those points our calculator estimates ${ikaEn(I85.alin)} for 1985. Treat this as a planning figure that can move by up to ${MAXMUUTOS} months per cohort, not a promise.` },
      { q: 'Is the retirement age for people born in 1965 already decided?', a: `Not as of early October 2026. The law limits it to between ${ikaEnPitka(RAJAT.vahintaan)} and ${ikaEnPitka(RAJAT.enintaan)}, and the ministry must issue the decree by the end of October 2026. The Työeläke.fi forecast is ${ikaEn(E65.alin)}. Since even the lower bound is above ${RAJAT.vahintaan[0]}, no one in this cohort can start an old-age pension before ${ENSIMMAINEN_1965}.` },
      { q: 'What is the difference between earliest and target retirement age?', a: `The earliest age is when you may start your earnings-related pension. The target age is later: it is where ${EN.num(LYK, 1)}% per month of deferral makes up for the life expectancy coefficient. For the 1964 cohort the coefficient trims about ${EN.num((1 - KERROIN64) * 100, 1)}% and the target sits ${TAVOITE_ERO64} months after the earliest age, which adds ${EN.num(TAVOITE_ERO64 * LYK, 1)}%.` },
      { q: 'What changes at the upper retirement age in Finland?', a: `The upper age, ${YLIN} for anyone born in 1962 or later, is where earnings-related pension stops accruing: new pay no longer earns pension after age ${E.karttuma_ika.paattyy}. Before that, every month you keep working past your earliest age raises the pension by ${EN.num(LYK, 1)}% on top of the ${EN.num(E.karttumaprosentti, 1)}% accrual from your salary.` },
    ],
    body: (h) => `
<h2>Ages already fixed in law</h2>
<p>The 2017 pension reform raised the earliest retirement age by ${PORRAS} months for each birth cohort until it reached ${V64.alin[0]} for people born in 1962. The upper limit for accruing pension rose from ${V56.ylin} to ${YLIN} at the same time. These figures are written into the ${h.src('finlex_tyel', 'Employees Pensions Act (työntekijän eläkelaki)')} and published on ${h.src('tyoelake_ika', 'Työeläke.fi')}, so they will not change for these cohorts.</p>
${h.table(['Born', 'Earliest age', 'Target age', 'Partial pension from', 'Upper age'], VAHVVUODET.map((v) => [v, ikaEn(VAHV[v].alin), ikaEn(VAHV[v].tavoite), ikaEn(VAHV[v].ove), `${VAHV[v].ylin} y`]), 'Confirmed age limits for earnings-related pensions', ['l', 'r', 'r', 'r', 'r'])}
<p>The three cohorts born in 1962, 1963 and 1964 share the same earliest age but not the same target age. That is because each cohort gets its own life expectancy coefficient (elinaikakerroin), recalculated from mortality data every year, and the target age is derived from it.</p>
<h2>Born in 1965 or later: what you can and cannot know</h2>
<p>From the 1965 cohort onwards, the earliest age follows life expectancy. The Finnish Centre for Pensions (Eläketurvakeskus) runs the first adjustment for this cohort; changes come in whole months and are capped at ${MAXMUUTOS} months per year of birth. Starting from ${V64.alin[0]}, that gives a window of ${ikaEnPitka(RAJAT.vahintaan)} to ${ikaEnPitka(RAJAT.enintaan)} for 1965.</p>
<p>The legal deadline is two months before the start of the calendar year in which the cohort turns ${VAHVISTUSIKA}, so the end of October 2026 for people born in 1965. Until that decree appears, our calculator labels the 1965 age as a forecast. Pensions for this cohort cannot begin before ${ENSIMMAINEN_1965}.</p>
<p>If you moved to Finland in your thirties or forties, this is the part that concerns you. Every figure below is a projection that the official calculator publishes for planning. Faster gains in life expectancy would push the ages up; slower gains would hold them back.</p>
${h.table(['Born', 'Earliest (forecast)', 'Target (forecast)', 'Partial (forecast)'], ENNVUODET.map((v) => [v, ikaEn(ENN[v].alin), ENN[v].tavoite ? ikaEn(ENN[v].tavoite!) : 'not computed', ikaEn(ENN[v].ove)]), 'Työeläke.fi forecasts, read in October 2026; not confirmed', ['l', 'r', 'r', 'r'])}
<p>For people born in 1993 or later, Työeläke.fi shows no target age at all. The upper age stays at ${YLIN}. The partial early pension follows the earliest age at a fixed distance of three years, visible in the last column.</p>
<h2>Why the target age matters more than it looks</h2>
<p>Retiring at your earliest age is allowed, but the life expectancy coefficient then reduces your earnings-related pension for good. For the 1964 cohort the coefficient is ${h.num(KERROIN64, 5)}, a cut of about ${h.num((1 - KERROIN64) * 100, 1)}%. Working ${TAVOITE_ERO64} more months, up to the target age, earns a deferral increase of ${h.num(TAVOITE_ERO64 * LYK, 1)}%, which covers that cut. The arithmetic is set out on ${h.a('elinaikakerroin', 'life expectancy coefficient')} and ${h.a('elakkeen-lykkaaminen', 'deferring your pension')}, and the ${h.a('elakelaskuri', 'pension calculator')} compares both options on your own salary.</p>
<h2>Other age limits you will meet</h2>
<ul>
<li><strong>Kela national pension (kansaneläke):</strong> ${KE65} for people born before 1965; for later cohorts, the same as the earliest earnings-related age.</li>
<li><strong>Partial early old-age pension:</strong> ${VAHV['1963'].ove[0]} for those born 1956–1963, ${V64.ove[0]} for 1964, three years before the earliest age after that. See ${h.a('osittainen-vanhuuselake', 'partial early pension')}.</li>
<li><strong>Years-of-service pension (työuraeläke):</strong> from ${E.tyouraelake_ika} at the earliest, after at least ${E.tyouraelake_tyovuodet} years in physically or mentally demanding work, when health makes continuing difficult.</li>
<li><strong>Accrual window:</strong> work between ages ${E.karttuma_ika.alkaa} and ${E.karttuma_ika.paattyy} earns pension.</li>
</ul>
<p>One condition matters to newcomers: the Kela national pension needs at least ${E.kansanelake.asumisaika_vahintaan_v} years of residence in Finland after age 16, and it is paid in full only after long residence. The earnings-related pension has no such condition; every euro of Finnish pay from age ${E.karttuma_ika.alkaa} counts, however short your stay.</p>`,
  },
});
