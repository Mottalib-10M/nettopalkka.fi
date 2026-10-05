import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { ikaKuukausina, elakeNetto, type IkaKk } from '../../lib/engine/elake';

const E = P.elake;
const K = E.elinaikakerroin as Record<string, number>;
const VUODET = Object.keys(K);
const VAHV = E.elakeika_vahvistettu as Record<string, { alin: IkaKk; tavoite: IkaKk }>;
const VIIM = E.elinaikakerroin_viimeisin;
const K64 = VIIM.arvo, K61 = K['1961'], K55 = K['1955'], K63 = K['1963'];
const ESIM = 2000;
const JALKEEN = ESIM * K64;
const LEIKKAUS = (k: number) => (1 - k) * 100;
const LYK = E.lykkayskorotus_prosentti_kk;
const N_ENNEN = elakeNetto(ESIM, 'Helsinki'), N_JALK = elakeNetto(ESIM * K64, 'Helsinki');
const NETTOERO = N_ENNEN.kkNetto - N_JALK.kkNetto;
const URA_V = 40, URA_PALKKA = 40000;
const URA_KK = URA_PALKKA * E.karttumaprosentti / 100 * URA_V / 12;
const ERO_55_64 = ESIM * (K['1955'] - K64);
const tavoiteKk = (v: string) => (VAHV[v] ? ikaKuukausina(VAHV[v].tavoite) - ikaKuukausina(VAHV[v].alin) : null);
const T64 = tavoiteKk('1964')!;
/** Kuukaudet, joilla lykkäys kattaa leikkauksen: (1/k − 1) / 0,4 %. */
const kattavatKk = (k: number) => Math.ceil((1 / k - 1) * 100 / LYK);
/** Ikäluokan vahvistusvuosi = vuosi, jona kerroin vahvistettiin, + 1 (eläkkeelle soveltaminen). */
const VAHVISTUSVUOSI = Number(VIIM.vahvistettu.slice(0, 4));
const [VV, KK, PP] = VIIM.vahvistettu.split('-').map(Number);
const PVM_FI = `${PP}.${KK}.${VV}`;
/** Ikä, jona ikäluokan kerroin otetaan käyttöön (1964 → 2026). */
const KAYTTOIKA = VAHVISTUSVUOSI + 1 - VIIM.syntymavuosi;
const ALIN64 = VAHV['1964'].alin[0];
const V61 = E.elakeika_vahvistettu['1961'];
const ikaFi = (i: IkaKk) => (i[1] ? `${i[0]} v ${i[1]} kk` : `${i[0]} v`);
const ikaEn = (i: IkaKk) => (i[1] ? `${i[0]} y ${i[1]} m` : `${i[0]}`);

export default definePage({
  id: 'elinaikakerroin',
  group: 'elake',
  order: 20,
  mini: 'elinaikakerroin',
  related: ['elakeika', 'elakelaskuri', 'elakkeen-lykkaaminen', 'tyoelakkeen-karttuminen'],
  sources: ['etk_elinaikakerroin', 'finlex_tyel'],
  fi: {
    slug: 'elinaikakerroin',
    nav: 'Elinaikakerroin',
    card: 'Elinaikakertoimet 1955–1964, paljonko kerroin leikkaa alkavaa eläkettä ja miten leikkauksen saa kurottua umpeen.',
    title: `Elinaikakerroin 2026: ${FI.num(K64, 5)} pienentää eläkettä ${FI.num(LEIKKAUS(K64), 1)} %`,
    description: `Elinaikakerroin 2026 on 1964 syntyneillä ${FI.num(K64, 5)}, joten ${FI.num(ESIM)} euron kertynyt työeläke pienenee ${FI.num(JALKEEN, 2)} euroon. Taulukko 1955–1964 ja vuoden 2027 muutos.`,
    h1: 'Elinaikakerroin',
    intro: 'Kerroin, jolla kertynyt työeläke kerrotaan eläkkeen alkaessa: katso oman ikäluokkasi arvo ja euromääräinen vaikutus.',
    resume: `Vuonna 1964 syntyneiden elinaikakerroin on ${FI.num(K64, 5)}, ja se pienentää vuonna 2026 alkavia vanhuuseläkkeitä noin ${FI.num(LEIKKAUS(K64), 1)} prosenttia. Sosiaali- ja terveysministeriö vahvisti arvon asetuksella, ja Eläketurvakeskus tiedotti siitä ${PVM_FI}. Kerroin toimii yksinkertaisesti: eläkkeen alkaessa kertynyt työeläke kerrotaan sillä, joten ${FI.eur(ESIM)} kuukaudessa muuttuu ${FI.eur(JALKEEN, 2)} kuukaudessa. Leikkaus kompensoi sitä, että ikäluokka elää keskimäärin pidempään ja nostaa eläkettä useamman vuoden. Kertoimen arvo määräytyy syntymävuoden mukaan, ja se on ollut käytössä vuonna 1947 syntyneistä alkaen. Kerroin on pienentynyt lähes joka vuosi: vuonna 1955 syntyneillä leikkaus oli ${FI.num(LEIKKAUS(K55), 1)} %, vuonna 1961 syntyneillä ${FI.num(LEIKKAUS(K61), 1)} %. Leikkauksen voi kuroa umpeen jatkamalla työssä tavoite-eläkeikään, sillä jokainen lykätty kuukausi korottaa eläkettä pysyvästi. Vuonna 1965 syntyneiden kerrointa ei ole vielä vahvistettu, ja sen laskutapa muuttuu vuodesta 2027 niin, että pohjana on alin vanhuuseläkeikä eikä enää kiinteä ${KAYTTOIKA} vuoden ikä.`,
    faqs: [
      { q: 'Paljonko elinaikakerroin pienentää 1964 syntyneen työeläkettä euroina?', a: `Kerroin ${FI.num(K64, 5)} vie jokaisesta kertyneestä sadasta eurosta noin ${FI.num(LEIKKAUS(K64), 2)} euroa. Esimerkiksi ${FI.eur(ESIM)} kuukaudessa kertynyt eläke maksetaan ${FI.eur(JALKEEN, 2)} suuruisena, jolloin ero on ${FI.eur(ESIM - JALKEEN, 2)} kuukaudessa ja noin ${FI.eur((ESIM - JALKEEN) * 12)} vuodessa ennen veroja, jos eläke alkaa alimmassa iässä.` },
      { q: 'Mikä on vuonna 1965 syntyneiden elinaikakerroin?', a: `Sitä ei ole vielä vahvistettu. Ministeriö antaa asetuksen viimeistään kuukautta ennen sen vuoden alkua, jona ikäluokka täyttää ${KAYTTOIKA} vuotta, eli viimeistään marraskuun 2026 lopussa. Siihen asti eläkelaskurimme käyttää arviona viimeisintä vahvistettua arvoa ${FI.num(K64, 5)} ja merkitsee tuloksen ennusteeksi. Vahvistuksen jälkeen laskuri päivitetään uuteen arvoon.` },
      { q: 'Pienentääkö elinaikakerroin eläkettä joka vuosi uudelleen?', a: `Ei. Kerroin tehdään kerran, kun vanhuuseläke alkaa, ja ikäluokan oma kerroin jää pysyväksi osaksi eläkettä. Esimerkiksi vuonna 1961 syntyneen kerroin on ${FI.num(K61, 5)} riippumatta siitä, alkaako eläke alimmassa iässä ${ikaFi(V61.alin as IkaKk)} vai vasta ${V61.ylin}-vuotiaana. Eläkkeen vuotuinen tarkistus tehdään erikseen työeläkeindeksillä, jonka pisteluku vuodelle 2026 on ${FI.num(E.indeksit.tyoelakeindeksi)}.` },
      { q: 'Kuinka monta kuukautta pitää jatkaa töitä, jotta leikkaus kuittaantuu?', a: `Lykkäyskorotus on ${FI.num(LYK, 1)} % kuukaudessa. Vuonna 1964 syntyneellä ${FI.num(kattavatKk(K64))} kuukauden lykkäys riittää kattamaan kertoimen ${FI.num(K64, 5)}, ja virallinen tavoite-eläkeikä on ${FI.num(T64)} kuukautta alimman iän jälkeen. Samalla palkasta kertyy uutta eläkettä ${FI.num(E.karttumaprosentti, 1)} %, joten todellinen hyöty on vielä hieman suurempi. Lykkäys ei ole pakollinen, mutta ilman sitä leikkaus jää pysyväksi.` },
      { q: 'Milloin oman ikäluokkani elinaikakerroin vahvistetaan?', a: `Kerroin vahvistetaan sinä vuonna, jona täytät ${KAYTTOIKA - 1} vuotta, viimeistään kuukautta ennen seuraavan vuoden alkua, ja sitä sovelletaan vuodesta, jona täytät ${KAYTTOIKA}. Esimerkiksi vuonna 1964 syntyneiden kerroin ${FI.num(K64, 5)} vahvistettiin marraskuussa ${VAHVISTUSVUOSI}. Sitä ennen kaikki oman ikäluokkasi kertoimet ovat arvioita, myös pitkän aikavälin eläkelaskelmissa käytetyt luvut.` },
      { q: 'Miksi elinaikakertoimen laskutapa muuttuu vuonna 2027?', a: `Vuoden 1965 ikäluokasta alkaen myös alin eläkeikä nousee elinajanodotteen mukana. Jos kerroin laskettaisiin edelleen ${KAYTTOIKA} vuoden iästä, pidempi elinikä huomioitaisiin kahteen kertaan. Siksi laki määrää, että vuodesta 2027 kerroin lasketaan viimeksi vahvistetusta alimmasta vanhuuseläkeiästä ja verrataan vuoden 2026 tasoon ${ALIN64} vuoden iässä.` },
    ],
    body: (h) => `
<h2>Elinaikakertoimet syntymävuosittain</h2>
<p>Taulukko näyttää jokaisen vahvistetun kertoimen ja sen vaikutuksen ${h.eur(ESIM)} kuukausieläkkeeseen. Viimeinen sarake kertoo, montako kuukautta yli alimman eläkeiän pitää työskennellä, jotta ${h.num(LYK, 1)} prosentin kuukausittainen lykkäyskorotus nostaa eläkkeen takaisin kertoimetonta tasoa vastaavaksi.</p>
${h.table(['Syntymävuosi', 'Kerroin', 'Leikkaus', `${h.eur(ESIM)} kertoimen jälkeen`, 'Lykkäys, joka kattaa leikkauksen'], VUODET.map((v) => [v, h.num(K[v], 5), `${h.num(LEIKKAUS(K[v]), 1)} %`, h.eur(ESIM * K[v], 2), `${h.num(kattavatKk(K[v]))} kk`]), 'Vahvistetut elinaikakertoimet, lähde Eläketurvakeskus', ['l', 'r', 'r', 'r', 'r'])}
<p>Kerroin pieneni vuosittain vuoden 1961 ikäluokkaan asti, jolloin leikkaus oli suurimmillaan ${h.num(LEIKKAUS(K61), 1)} %. Vuosina 1962 ja 1963 syntyneillä kerroin nousi hieman, ${h.num(K63, 5)} vuonna 1963 syntyneillä, ja laski taas vuoden 1964 ikäluokalla. Muutokset heijastavat kuolevuustilastoja, joista kerroin lasketaan, eivät poliittisia päätöksiä.</p>
<h2>Miten kerroin lasketaan</h2>
<p>${h.src('finlex_tyel', 'Työntekijän eläkelain')} mukaan vuosien 2018–2026 kerroin määrätään niin, että ${KAYTTOIKA} vuoden iässä alkavan eläkkeen pääoma-arvo on sama kuin kertoimen käyttöönottovuonna. Pääoma-arvo lasketaan viiden viimeisimmän vuoden kuolevuustilastoista. Kun ikäluokka elää pidempään, sama pääoma jakautuu useammalle vuodelle, ja kuukausierä pienenee kertoimen verran.</p>
<p>Kerroin vaikuttaa vanhuuseläkkeeseen ja eräisiin samana vuonna alkaviin muihin työeläkkeisiin. Se kohdistuu koko kertyneeseen työeläkkeeseen, ei pelkästään viimeisten vuosien karttumaan. Kansaneläke ja takuueläke lasketaan Kelan omilla säännöillä, ks. ${h.a('takuuelake-laskuri', 'kansaneläke ja takuueläke')}.</p>
<h2>Muutos vuodesta 2027: pohjana alin eläkeikä</h2>
<p>Laki muuttaa laskentaa vuoden 1965 ikäluokasta alkaen. Vuodesta 2027 kerroin määrätään niin, että eläkkeen pääoma-arvo viimeksi vahvistetusta alimmasta vanhuuseläkeiästä alkaen vastaa vuoden 2026 kertoimella muunnetun eläkkeen pääoma-arvoa ${ALIN64} vuoden iässä. Syynä on, että vuoden 1965 ikäluokasta lähtien myös alin eläkeikä seuraa elinajanodotetta. Eläketurvakeskuksen mukaan uudistuksella vältetään se, että elinajan pidentyminen leikkaisi eläkettä kahteen kertaan: ensin myöhemmän eläkeiän ja sitten pienemmän kertoimen kautta.</p>
<p>Käytännössä vuonna 1965 syntyneiden kerroin ja alin eläkeikä vahvistetaan samana syksynä: ikäraja viimeistään lokakuun 2026 lopussa ja kerroin viimeistään marraskuun lopussa. Kumpaakaan ei tätä kirjoitettaessa ole julkaistu, joten ${h.a('elakeika', 'eläkeikäsivun')} ja tämän sivun luvut ikäluokalle 1965 ovat arvioita.</p>
<h2>Paljonko kerroin vie verojen jälkeen</h2>
<p>Bruttoleikkaus ei siirry täysimääräisenä tilille, koska pienempi eläke maksaa myös vähemmän veroa. Helsinkiläinen, joka ei kuulu kirkkoon, saisi ${h.eur(ESIM)} bruttoeläkkeestä käteen ${h.eur(N_ENNEN.kkNetto)} kuukaudessa. Kertoimen ${h.num(K64, 5)} jälkeen nettoeläke on ${h.eur(N_JALK.kkNetto)}. Bruttoero on ${h.eur(ESIM - JALKEEN)}, mutta nettoero vain ${h.eur(NETTOERO)} kuukaudessa, koska ${h.a('elakkeen-verotus', 'eläkkeen verotuksessa')} marginaalivero leikkaa osan menetyksestä.</p>
${h.table(['', 'Ilman kerrointa', `Kertoimella ${h.num(K64, 5)}`], [
  ['Bruttoeläke kuukaudessa', h.eur(ESIM), h.eur(JALKEEN, 2)],
  ['Veroprosentti', `${h.num(N_ENNEN.veroprosentti, 1)} %`, `${h.num(N_JALK.veroprosentti, 1)} %`],
  ['Nettoeläke kuukaudessa', h.eur(N_ENNEN.kkNetto), h.eur(N_JALK.kkNetto)],
], 'Helsinki, ei kirkon jäsen, verot vuoden 2026 perusteilla', ['l', 'r', 'r'])}
<h2>Sama kertymä, eri ikäluokka</h2>
<p>Kertoimen merkitys näkyy parhaiten vertaamalla ikäluokkia. Ensimmäisellä kertoimen piiriin kuuluneella ikäluokalla, vuonna 1947 syntyneillä, kerroin oli tasan yksi, eli eläkettä ei leikattu lainkaan. Vuonna 1955 syntynyt, jolle oli kertynyt ${h.eur(ESIM)}, sai ${h.eur(ESIM * K55, 2)}. Vuonna 1964 syntynyt saa samasta kertymästä ${h.eur(JALKEEN, 2)}, eli ${h.eur(ERO_55_64, 2)} vähemmän kuukaudessa kuin yhdeksän vuotta vanhempi. Eläkkeellä vietettyjen vuosien määrä ratkaisee, kumpi saa elinaikanaan enemmän; kertoimen tarkoitus on, että keskimäärin kumpikin saa saman.</p>
<p>Ero kasvaa sitä suuremmaksi, mitä suurempi kertymä on. ${h.eur(3000)} kertyneestä eläkkeestä vuonna 1964 syntyneen leikkaus on ${h.eur(3000 * (1 - K64), 2)} kuukaudessa, ${h.eur(1000)} eläkkeestä ${h.eur(1000 * (1 - K64), 2)}. Prosentti on kaikille sama, joten kerroin ei painota pieni- tai suurituloisia.</p>
<h2>Kerroin seuraa syntymävuotta, ei eläkkeen alkamisvuotta</h2>
<p>Yleinen väärinkäsitys on, että vuonna 2026 eläkkeelle jäävät saavat kaikki vuoden 2026 kertoimen. Näin ei ole. Vuonna 1961 syntynyt, joka jatkoi töitä ja jää eläkkeelle vasta nyt, saa edelleen oman ikäluokkansa kertoimen ${h.num(K61, 5)}. Vuoden 2026 arvo ${h.num(K64, 5)} koskee vuonna 1964 syntyneitä ja eräitä muita samana vuonna alkavia työeläkkeitä. Myöhäisempi eläkkeelle jääminen ei siis vaihda kerrointa parempaan tai huonompaan, vaan se kasvattaa eläkettä lykkäyskorotuksen ja uuden karttuman kautta.</p>
<p>Esimerkin ${h.eur(ESIM)} ei ole sattumaa. Se on suunnilleen se kuukausieläke, joka syntyy ${h.num(URA_V)} vuoden työurasta ${h.eur(URA_PALKKA)} vuosipalkalla, kun eläkettä kertyy ${h.num(E.karttumaprosentti, 1)} % vuodessa ja palkkoja ei indeksoida: ${h.eur(URA_KK)} kuukaudessa. Kerroin tekee tästä koko työurasta ${h.eur(URA_KK * K64, 2)}. Laskelma on yksinkertaistettu ja tämän päivän rahassa, mutta se näyttää, että kerroin vie neljän vuosikymmenen työstä suunnilleen kahden vuoden karttuman.</p>
<h2>Kertoimen ja lykkäyksen yhteispeli</h2>
<p>Tavoite-eläkeikä on rakennettu kertoimen ympärille. Vuonna 1964 syntynyt pääsee eläkkeelle ${ALIN64}-vuotiaana, mutta virallinen tavoite on ${h.num(T64)} kuukautta myöhemmin. Lykkäyskorotus kertoo eläkkeen alimmassa iässä kertyneen määrän, joten esimerkin ${h.eur(ESIM)} kertynyt eläke nousee tavoiteikään mennessä ${h.eur(JALKEEN * (1 + T64 * LYK / 100), 2)} kuukaudessa ennen uutta karttumaa. Tarkempi laskelma on sivulla ${h.a('elakkeen-lykkaaminen', 'eläkkeen lykkääminen')}.</p>
<p>Kerrointa ei kannata arvioida erillään muista luvuista. Kertynyt eläke muodostuu ${h.a('tyoelakkeen-karttuminen', 'vuosittaisesta karttumasta')}, ja koko kuvan kuukausieläkkeestä verojen jälkeen näet ${h.a('elakelaskuri', 'eläkelaskurista')}, joka tekee kertoimen ja lykkäyksen yhdessä.</p>`,
  },
  en: {
    slug: 'life-expectancy-coefficient',
    nav: 'Life expectancy coefficient',
    card: 'Coefficients for 1955–1964, what they cut from your starting pension and how working longer wins it back.',
    title: `Life Expectancy Coefficient 2026: ${EN.num(K64, 5)} Cuts Pension ${EN.num(LEIKKAUS(K64), 1)}%`,
    description: `Life expectancy coefficient 2026 is ${EN.num(K64, 5)} for those born in 1964: an accrued ${EN.eur(ESIM)} pension becomes ${EN.eur(JALKEEN, 2)}. Values from 1955 and the 2027 rule change.`,
    h1: 'Life expectancy coefficient (elinaikakerroin)',
    intro: 'The multiplier applied to your earnings-related pension when it starts: your cohort’s value and what it means in euros.',
    resume: `For people born in 1964, the life expectancy coefficient (elinaikakerroin) is ${EN.num(K64, 5)}, which trims old-age pensions starting in 2026 by roughly ${EN.num(LEIKKAUS(K64), 1)}%. The value was set by ministerial decree and announced by the Finnish Centre for Pensions (Eläketurvakeskus, ETK) in November ${VAHVISTUSVUOSI}. The mechanism is one multiplication: when your earnings-related pension (työeläke) begins, everything you have accrued is multiplied by your cohort’s coefficient, so ${EN.eur(ESIM)} a month becomes ${EN.eur(JALKEEN, 2)}. The idea is that a cohort expected to live longer receives the same total pension spread over more years. The coefficient has shrunk for almost every cohort since it was introduced: ${EN.num(LEIKKAUS(K55), 1)}% for people born in 1955, ${EN.num(LEIKKAUS(K61), 1)}% for 1961. You can offset it by working until your target retirement age. The coefficient for the 1965 cohort is still pending, and from 2027 the method itself changes: it will be calculated from the earliest retirement age instead of a fixed age of ${KAYTTOIKA}.`,
    faqs: [
      { q: 'How much does the life expectancy coefficient take from a €2,000 pension?', a: `With the 1964 value of ${EN.num(K64, 5)}, an accrued ${EN.eur(ESIM)} a month is paid as ${EN.eur(JALKEEN, 2)}. That is ${EN.eur(ESIM - JALKEEN, 2)} less each month, about ${EN.eur((ESIM - JALKEEN) * 12)} a year before tax, as long as the pension starts at the earliest retirement age and is not deferred.` },
      { q: 'Has the coefficient for people born in 1965 been published?', a: `No. The ministry must confirm it at least one month before the start of the year the cohort turns ${KAYTTOIKA}, which means by the end of November 2026. Until then our calculators use the latest confirmed value, ${EN.num(K64, 5)}, and flag any result for 1965 or later as an estimate rather than a fixed figure.` },
      { q: 'Does the coefficient cut my pension again every year after I retire?', a: `No. It is applied once, when your old-age pension starts, and your cohort’s value stays with you. Someone born in 1961 has ${EN.num(K61, 5)} whether they retire at their earliest age of ${ikaEn(V61.alin as IkaKk)} or wait until ${V61.ylin}. The annual adjustment of a pension already in payment is a separate step that uses the earnings-related pension index (työeläkeindeksi), ${EN.num(E.indeksit.tyoelakeindeksi)} points in 2026.` },
      { q: 'Does the life expectancy coefficient apply to all of my Finnish work history?', a: `Yes. It multiplies the whole earnings-related pension accrued in Finland, from your first job at ${E.karttuma_ika.alkaa} onwards, not just recent years. The Kela national pension and guarantee pension follow their own rules and are not multiplied by it. If you only worked a few years in Finland, the cut is the same percentage, just applied to a smaller amount.` },
    ],
    body: (h) => `
<h2>Every confirmed coefficient</h2>
<p>The table lists each confirmed value, what it does to a ${h.eur(ESIM)} monthly pension, and how many months beyond your earliest age you would need to work for the ${h.num(LYK, 1)}% monthly deferral increase to restore the uncut amount.</p>
${h.table(['Born', 'Coefficient', 'Cut', `${h.eur(ESIM)} after`, 'Deferral that offsets it'], VUODET.map((v) => [v, h.num(K[v], 5), `${h.num(LEIKKAUS(K[v]), 1)}%`, h.eur(ESIM * K[v], 2), `${h.num(kattavatKk(K[v]))} mo`]), 'Confirmed coefficients, source: Finnish Centre for Pensions', ['l', 'r', 'r', 'r', 'r'])}
<p>The deepest cut so far fell on the 1961 cohort at ${h.num(LEIKKAUS(K61), 1)}%. People born in 1962 and 1963 saw it ease slightly, then the 1964 value dipped again. These moves track mortality statistics, which is all the formula uses; nobody negotiates them.</p>
<h2>The formula in plain terms</h2>
<p>Under the ${h.src('finlex_tyel', 'Employees Pensions Act')}, the coefficient for 2018 to 2026 is set so that the capital value of a pension starting at ${KAYTTOIKA} stays equal to its value when the coefficient was introduced. Capital value is computed from the five most recent years of mortality data. If people live longer, the same capital covers more years and the monthly payment shrinks by exactly the coefficient. ${h.src('etk_elinaikakerroin', 'ETK’s announcement for the 1964 cohort')} gives the worked example of ${h.eur(ESIM)} turning into ${h.eur(JALKEEN, 2)}.</p>
<p>It affects old-age pensions and certain other earnings-related pensions that start the same year. It does not touch the Kela national pension (kansaneläke) or guarantee pension (takuueläke); those are covered on ${h.a('takuuelake-laskuri', 'national and guarantee pension')}.</p>
<h2>What changes from 2027</h2>
<p>From the cohort born in 1965, the earliest retirement age itself moves with life expectancy. Keeping the old formula would have penalised longer lives twice: once through a later retirement age and again through a smaller coefficient. The amended law therefore says that from 2027 the coefficient makes the capital value of a pension starting at the latest confirmed earliest retirement age equal to that of a pension converted with the 2026 coefficient and starting at ${ALIN64}.</p>
<p>Both figures for the 1965 cohort arrive this autumn: the age by the end of October 2026 and the coefficient by the end of November. Neither was published when this page was updated, so anything we show for 1965 on ${h.a('elakeika', 'retirement age')} or here is an estimate.</p>
<h2>What the cut looks like after tax</h2>
<p>The gross cut does not reach your bank account in full, because a smaller pension also pays less tax. Living in Helsinki without church membership, a ${h.eur(ESIM)} gross pension leaves ${h.eur(N_ENNEN.kkNetto)} a month after tax; after the ${h.num(K64, 5)} coefficient the net figure is ${h.eur(N_JALK.kkNetto)}. The gross difference of ${h.eur(ESIM - JALKEEN)} shrinks to ${h.eur(NETTOERO)} net, because the marginal tax on that slice of income is fairly high. ${h.a('elakkeen-verotus', 'Pension tax')} explains the pension income deduction behind these numbers.</p>
${h.table(['', 'Without coefficient', `With ${h.num(K64, 5)}`], [
  ['Gross pension per month', h.eur(ESIM), h.eur(JALKEEN, 2)],
  ['Withholding rate', `${h.num(N_ENNEN.veroprosentti, 1)}%`, `${h.num(N_JALK.veroprosentti, 1)}%`],
  ['Net pension per month', h.eur(N_ENNEN.kkNetto), h.eur(N_JALK.kkNetto)],
], 'Helsinki, no church tax, 2026 tax rules', ['l', 'r', 'r'])}
<p>Comparing cohorts makes the trend concrete. The first cohort under the system, born in 1947, had a coefficient of exactly one. A person born in 1955 with ${h.eur(ESIM)} accrued received ${h.eur(ESIM * K55, 2)}; a person born in 1964 with the same record receives ${h.eur(JALKEEN, 2)}, which is ${h.eur(ERO_55_64, 2)} a month less. The percentage is identical at every income level, so ${h.eur(1000)} accrued loses ${h.eur(1000 * (1 - K64), 2)} and ${h.eur(3000)} loses ${h.eur(3000 * (1 - K64), 2)}.</p>
<p>One misunderstanding worth clearing up: the coefficient follows your birth year, not the year you retire. Someone born in 1961 who kept working and retires in 2026 still gets the 1961 value of ${h.num(K61, 5)}, not ${h.num(K64, 5)}. Retiring later never swaps your coefficient; it raises the pension through the deferral increase and extra accrual instead.</p>
<h2>Using the target age to cancel the cut</h2>
<p>The target retirement age is built around this number. Someone born in 1964 may retire at ${ALIN64}, but the official target is ${h.num(T64)} months later. Each month of deferral adds ${h.num(LYK, 1)}% to the pension accrued at the earliest age, so the example pension reaches ${h.eur(JALKEEN * (1 + T64 * LYK / 100), 2)} a month at the target age, before counting any new accrual from salary. ${h.a('elakkeen-lykkaaminen', 'Deferring your pension')} works through the trade-off, including how long it takes to earn back the months you were not paid.</p>
<p>The coefficient is only one input. Your accrued amount comes from ${h.a('tyoelakkeen-karttuminen', 'yearly pension accrual')}, and the ${h.a('elakelaskuri', 'pension calculator')} combines accrual, coefficient, deferral and tax in one estimate.</p>`,
  },
});
