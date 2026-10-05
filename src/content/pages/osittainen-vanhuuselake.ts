import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { osittainenElake, ikaKuukausina, type IkaKk } from '../../lib/engine/elake';

const E = P.elake;
const VAH = E.varhennusvahennys_ove_prosentti_kk;
const LYK = E.lykkayskorotus_prosentti_kk;
const [PIENI, SUURI] = E.ove_osuudet as [25, 50];
const VAHV = E.elakeika_vahvistettu as Record<string, { alin: IkaKk; ove: IkaKk }>;
const ENN = E.elakeika_ennuste as Record<string, { alin: IkaKk; ove: IkaKk }>;
const OVE63 = VAHV['1963'].ove[0], OVE64 = VAHV['1964'].ove[0];
/** Vuodesta 1965: aikaisintaan näin monta vuotta ennen alinta ikää (ennusteen erotus). */
const ETAISYYS = Math.round((ikaKuukausina(ENN['1965'].alin) - ikaKuukausina(ENN['1965'].ove)) / 12);
const ALIN64 = VAHV['1964'].alin, ALIN63 = VAHV['1963'].alin;
const KK64 = ikaKuukausina(ALIN64) - ikaKuukausina(VAHV['1964'].ove);
const KK63 = ikaKuukausina(ALIN63) - ikaKuukausina(VAHV['1963'].ove);
const KERT = 2000;
const VIRALLINEN = osittainenElake(KERT, SUURI, 36);
/** Kuinka monta kuukautta pysyvä menetys syö jo saadut varhaiset erät (ilman veroja ja indeksejä). */
const KUITTAUS = (r: { maksu: number; pysyvaMenetys: number }, kk: number) => (r.maksu * kk) / r.pysyvaMenetys;
const KUITTAUS_V = KUITTAUS(VIRALLINEN, 36) / 12;
const RIVIT: Array<[25 | 50, number]> = [[PIENI, 12], [PIENI, 36], [SUURI, 12], [SUURI, 24], [SUURI, 36], [SUURI, KK63]];
/** Esimerkki: siirtyminen osa-aikatyöhön kolme vuotta ennen alinta ikää. */
const OS_PALKKA = 3500, OS_OSUUS = 0.6, OS_KERT = 1800, OS_KK = 36;
const OS = osittainenElake(OS_KERT, SUURI, OS_KK);
const OS_UUSI_PALKKA = OS_PALKKA * OS_OSUUS;
const OS_KARTTUMA = OS_UUSI_PALKKA * 12 * E.karttumaprosentti / 100 / 12 * (OS_KK / 12);
const OS_TAYSI_KARTTUMA = OS_PALKKA * 12 * E.karttumaprosentti / 100 / 12 * (OS_KK / 12);
const P12 = osittainenElake(KERT, PIENI, 12);
const VUODET20 = 20;
const MAX63 = osittainenElake(KERT, SUURI, KK63);

export default definePage({
  id: 'osittainen-vanhuuselake',
  group: 'elake',
  order: 50,
  mini: 'ove',
  related: ['elakeika', 'elakkeen-lykkaaminen', 'elakelaskuri', 'takuuelake-laskuri'],
  sources: ['tyoelake_ika', 'finlex_tyel'],
  fi: {
    slug: 'osittainen-varhennettu-vanhuuselake',
    nav: 'Osittainen vanhuuseläke',
    card: 'Neljäsosa tai puolet kertyneestä työeläkkeestä etuajassa: paljonko maksetaan ja paljonko menetät pysyvästi.',
    title: `Osittainen varhennettu vanhuuseläke 2026: ${PIENI} tai ${SUURI} %`,
    description: `Osittainen varhennettu vanhuuseläke 2026: nosta ${PIENI} tai ${SUURI} % kertyneestä työeläkkeestä. Jokainen varhennuskuukausi pienentää eläkeosuutta pysyvästi ${FI.num(VAH, 1)} %.`,
    h1: 'Osittainen varhennettu vanhuuseläke',
    intro: 'Laske, paljonko osittaisesta vanhuuseläkkeestä maksetaan kuukaudessa ja paljonko varhennus vie eläkkeestä loppuiäksi.',
    resume: `Osittainen varhennettu vanhuuseläke maksaa ${PIENI} tai ${SUURI} % siitä työeläkkeestä, joka on kertynyt edellisen vuoden loppuun mennessä, ja jokainen kuukausi ennen alinta vanhuuseläkeikää pienentää maksettavaa osuutta pysyvästi ${FI.num(VAH, 1)} %. Työeläke.fi:n oma esimerkki: kun kertynyt eläke on ${FI.eur(KERT)} ja siitä otetaan ${SUURI} % kolme vuotta ennen alinta ikää, työeläke pienenee pysyvästi ${FI.eur(VIRALLINEN.pysyvaMenetys)} kuukaudessa ja osittaisena eläkkeenä maksetaan ${FI.eur(VIRALLINEN.maksu)}. Vuosina 1956–1963 syntyneet ovat voineet ottaa eläkkeen ${OVE63}-vuotiaina ja vuonna 1964 syntyneet ${OVE64}-vuotiaina. Vuonna 1965 ja myöhemmin syntyneille alaikäraja on ${ETAISYYS} vuotta ennen omaa alinta vanhuuseläkeikää, joka ei vielä ole vahvistettu. Eläkkeen rinnalla saa jatkaa töitä, ja palkasta kertyy uutta eläkettä tavalliseen tapaan. Kelan kansaneläke ei korvaa varhennusvähennystä, joten pienen eläkkeen saajalle leikkaus on pysyvä menetys. Jos osittainen eläke otetaan vasta alimman iän jälkeen, siihen tehdään päinvastoin ${FI.num(LYK, 1)} prosentin lykkäyskorotus kuukautta kohti.`,
    faqs: [
      { q: 'Paljonko osittainen varhennettu vanhuuseläke pienentää eläkettä loppuiäksi?', a: `Vähennys on ${FI.num(VAH, 1)} % jokaiselta kuukaudelta ennen alinta eläkeikää, ja se koskee vain sitä osuutta, jonka otat maksuun. Kun ${FI.eur(KERT)} kertyneestä eläkkeestä otetaan ${SUURI} % kolme vuotta etuajassa, vähennys on ${FI.num(VIRALLINEN.vahennysProsentti, 1)} % eli ${FI.eur(VIRALLINEN.pysyvaMenetys)} kuukaudessa. Menetys säilyy myös silloin, kun myöhemmin siirryt täydelle vanhuuseläkkeelle.` },
      { q: 'Missä iässä osittaisen varhennetun vanhuuseläkkeen voi aloittaa?', a: `Vuosina 1956–1963 syntyneillä alaikäraja on ${OVE63} vuotta ja vuonna 1964 syntyneillä ${OVE64} vuotta. Vuodesta 1965 alkaen raja on ${ETAISYYS} vuotta ennen omaa alinta vanhuuseläkeikää. Koska vuoden 1965 alinta ikää ei ole lokakuun 2026 alussa vahvistettu, myös sen ikäluokan osittaisen eläkkeen ikäraja on vielä Työeläke.fi:n ennuste, ${ENN['1965'].ove[0]} vuotta.` },
      { q: 'Korvaako Kela osittaisen vanhuuseläkkeen varhennusvähennyksen?', a: `Ei korvaa. Työeläke.fi:n mukaan kansaneläke ei korvaa osittaiseen vanhuuseläkkeeseen tehtyä varhennusvähennystä. Kansaneläke lasketaan myöhemmin työeläkkeen todellisesta määrästä, joten jos kokonaiseläkkeesi jää pieneksi, varhennus voi näkyä pienempänä kokonaiseläkkeenä vielä vuosikymmenten päästä. Takuueläkkeen ${FI.eur(E.takuuelake.taysi_kk, 2)} raja turvaa vain pienimmät eläkkeet, joten varhennusta kannattaa harkita tarkimmin juuri silloin, kun eläke jää pieneksi.` },
      { q: 'Kannattaako ottaa 25 vai 50 prosenttia eläkkeestä?', a: `Prosentuaalinen leikkaus on sama: ${FI.num(VAH, 1)} % kuukautta kohti kummassakin. ${SUURI} prosentin osuus tuo kaksinkertaisen kuukausierän mutta myös kaksinkertaisen pysyvän menetyksen euroina. Valinta riippuu siitä, tarvitsetko rahaa nyt. ${PIENI} % jättää suuremman osan eläkkeestä kasvamaan, ja jäljelle jäävään osaan tehdään lykkäyskorotus, jos jatkat töissä alimman iän yli.` },
      { q: 'Mistä summasta osittainen vanhuuseläke lasketaan?', a: `Pohjana on työeläke, joka on kertynyt eläkkeen alkamista edeltävän vuoden loppuun mennessä. Jos aloitat osittaisen eläkkeen kesällä 2026, kuluvan vuoden palkat eivät ole vielä mukana. Siitä otetaan ${PIENI} tai ${SUURI} %, tehdään varhennusvähennys ${FI.num(VAH, 1)} % kuukautta kohti ja lopuksi oman ikäluokan elinaikakerroin, vuonna 1964 syntyneillä ${FI.num(E.elinaikakerroin_viimeisin.arvo, 5)}.` },
      { q: 'Voiko osittaisen vanhuuseläkkeen ottaa alimman eläkeiän jälkeen?', a: `Voi. Silloin varhennusvähennystä ei tehdä, vaan osuutta korotetaan ${FI.num(LYK, 1)} % jokaiselta kuukaudelta, jolla eläkkeen alkaminen siirtyy alimman eläkeiän täyttämistä seuraavaa kuukautta myöhemmäksi. Vuonna 1964 syntynyt, joka ottaa ${SUURI} % puoli vuotta ${ALIN64[0]} vuoden täyttämisen jälkeen, saa osuuteen ${FI.num(6 * LYK, 1)} prosentin korotuksen.` },
    ],
    body: (h) => `
<h2>Laskukaava</h2>
<p>${h.src('finlex_tyel', 'Työntekijän eläkelain')} mukaan eläkeosuus on hakijan valinnan mukaan ${PIENI} tai ${SUURI} prosenttia siitä eläkkeestä, joka on kertynyt eläkkeen alkamista edeltävän vuoden loppuun mennessä. Osuudesta vähennetään pysyvästi ${h.num(VAH, 1)} prosenttia jokaiselta kuukaudelta, jolla sen alkamista varhennetaan ennen alimman vanhuuseläkeiän täyttämistä seuraavan kalenterikuukauden alkua.</p>
<p>Kaava on siis: kertynyt eläke × osuus × (1 − ${h.num(VAH, 1)} % × varhennuskuukaudet). Elinaikakerroin tehdään lisäksi, kun eläke alkaa. Taulukossa kertynyt eläke on ${h.eur(KERT)}, ja kuukausia lasketaan alimpaan vanhuuseläkeikään.</p>
${h.table(['Osuus', 'Kuukautta etuajassa', 'Vähennys', 'Maksetaan kuukaudessa', 'Pysyvä menetys kuukaudessa'], RIVIT.map(([o, kk]) => { const r = osittainenElake(KERT, o, kk); return [`${o} %`, h.num(kk), `${h.num(r.vahennysProsentti, 1)} %`, h.eur(r.maksu), h.eur(r.pysyvaMenetys)]; }), `Kertynyt eläke ${h.eur(KERT)}, ennen elinaikakerrointa`, ['l', 'r', 'r', 'r', 'r'])}
<p>Viimeinen rivi näyttää enimmäisvarhennuksen vuonna 1963 syntyneelle: ${OVE63} vuoden iästä alimpaan ikään ${ALIN63[0]} vuotta on ${KK63} kuukautta, jolloin vähennys on ${h.num(MAX63.vahennysProsentti, 1)} %. Vuonna 1964 syntyneellä väli on ${KK64} kuukautta, koska alaikäraja nousi ${OVE64} vuoteen.</p>
<h2>Ikärajat syntymävuoden mukaan</h2>
<ul>
<li><strong>1956–1963:</strong> aikaisintaan ${OVE63}-vuotiaana.</li>
<li><strong>1964:</strong> aikaisintaan ${OVE64}-vuotiaana; alin vanhuuseläkeikä ${ALIN64[0]} vuotta.</li>
<li><strong>1965 ja myöhemmin:</strong> aikaisintaan ${ETAISYYS} vuotta ennen omaa alinta vanhuuseläkeikää. Ikä vahvistetaan ikäluokittain; siihen asti Työeläke.fi näyttää ennusteen, esimerkiksi vuonna 1970 syntyneelle ${ENN['1970'].ove[0]} v ${ENN['1970'].ove[1]} kk.</li>
</ul>
<p>Oman ikäluokkasi luvut näet ${h.a('elakeika', 'eläkeikäsivun')} minilaskurista, ja ${h.src('tyoelake_ika', 'Työeläke.fi')} pitää yllä virallista taulukkoa.</p>
<h2>Milloin varhaiset erät on syöty</h2>
<p>Osittainen eläke on käytännössä etukäteen nostettua rahaa. Työeläke.fi:n esimerkissä saat ${h.eur(VIRALLINEN.maksu)} kuukaudessa kolmen vuoden ajan ennen alinta eläkeikää, yhteensä ${h.eur(VIRALLINEN.maksu * 36)}. Sen jälkeen eläke on loppuelämän ajan ${h.eur(VIRALLINEN.pysyvaMenetys)} kuukaudessa pienempi kuin ilman varhennusta. Jos veroja ja indeksejä ei oteta huomioon, pysyvä menetys syö etukäteen saadun summan noin ${h.num(KUITTAUS_V, 1)} vuodessa alimman eläkeiän jälkeen.</p>
<p>Laskelma kertoo, että osittainen eläke kannattaa rahallisesti, jos elinaika eläkeiän jälkeen jää tätä lyhyemmäksi, ja muuten ei. Rahaa tärkeämpää on usein se, että osittainen eläke mahdollistaa työajan lyhentämisen: kun palkka laskee, osuus paikkaa tulonmenetystä. Palkasta kertyy samaan aikaan edelleen ${h.num(E.karttumaprosentti, 1)} % uutta eläkettä, joka lasketaan myöhemmin vanhuuseläkkeeseen.</p>
<h2>Esimerkki: osa-aikatyöhön kolme vuotta ennen eläkeikää</h2>
<p>Oletetaan, että kuukausipalkka on ${h.eur(OS_PALKKA)} ja työeläkeotteella kertynyttä eläkettä ${h.eur(OS_KERT)}. Työntekijä sopii siirtymisestä ${h.pct(OS_OSUUS, 0)} työaikaan kolme vuotta ennen alinta eläkeikää ja ottaa samalla ${SUURI} % eläkkeestään.</p>
<ul>
<li>Osa-aikapalkka on ${h.eur(OS_UUSI_PALKKA)} kuukaudessa.</li>
<li>Osittainen eläke on ${h.eur(OS.maksu)} kuukaudessa, kun ${h.num(OS.vahennysProsentti, 1)} prosentin vähennys on tehty.</li>
<li>Bruttotulot ovat yhteensä ${h.eur(OS_UUSI_PALKKA + OS.maksu)}, eli ${h.eur(OS_PALKKA - OS_UUSI_PALKKA - OS.maksu)} vähemmän kuin kokoaikatyössä.</li>
<li>Pysyvä menetys alimmasta eläkeiästä alkaen on ${h.eur(OS.pysyvaMenetys)} kuukaudessa.</li>
<li>Osa-aikapalkasta kertyy kolmessa vuodessa ${h.eur(OS_KARTTUMA)} kuukausieläkettä, kun kokoaikatyöstä olisi kertynyt ${h.eur(OS_TAYSI_KARTTUMA)}.</li>
</ul>
<p>Ratkaisun hinta on siis kaksiosainen: varhennusvähennys ja pienempi karttuma lyhyemmästä työajasta. Vastineeksi työtunnit vähenevät kahdella viidesosalla ja tulotaso putoaa vain vähän. Monelle juuri tämä vaihtokauppa on osittaisen vanhuuseläkkeen varsinainen tarkoitus. Esimerkin luvut ovat bruttoja; koska samanaikainen palkka pienentää osittaiselle eläkkeelle tehtävää eläketulovähennystä ja eläke nostaa marginaaliveroa, nettotulojen ero kokoaikatyöhön on hieman suurempi kuin bruttoluvuista näyttää, ja se kannattaa tarkistaa ennen sopimusta työnantajan kanssa.</p>
<h2>Kun alin vanhuuseläkeikä täyttyy</h2>
<p>Varhennusvähennys on pysyvä: se ei poistu, kun alin vanhuuseläkeikä täyttyy ja siirryt vanhuuseläkkeelle. Laki kohdistaa vähennyksen kuitenkin vain siihen eläkeosuuteen, jonka otit maksuun etuajassa. Maksuun ottamaton osa ja osittaisen eläkkeen aikana palkasta kertynyt uusi eläke eivät kanna varhennusvähennystä.</p>
<p>Pitkällä aikavälillä ero näkyy selvästi. Jos otat ${PIENI} % vain vuotta ennen alinta ikää, saat ${h.eur(P12.maksu)} kuukaudessa eli vuodessa ${h.eur(P12.maksu * 12)}, ja menetät sen jälkeen ${h.eur(P12.pysyvaMenetys)} kuukaudessa, ${h.num(VUODET20)} vuodessa ${h.eur(P12.pysyvaMenetys * 12 * VUODET20)}. Työeläke.fi:n esimerkin ${SUURI} % kolme vuotta etuajassa tuo ${h.eur(VIRALLINEN.maksu * 36)} ja maksaa ${h.num(VUODET20)} vuodessa ${h.eur(VIRALLINEN.pysyvaMenetys * 12 * VUODET20)}. Lyhyt ja pieni varhennus on suhteessa halvempi, koska vähennysprosentti kasvaa jokaisesta kuukaudesta.</p>
<p>Osittainen eläke sopii huonosti, jos odotettu kokonaiseläke jää pieneksi tai jos aiot jatkaa kokoaikatyötä samalla palkalla: silloin saat rahaa, jota et välttämättä tarvitse, ja maksat siitä sekä pysyvällä leikkauksella että pienentyneellä eläketulovähennyksellä.</p>
<h2>Verot ja Kela</h2>
<p>Osittainen vanhuuseläke on eläketuloa, joten siihen sovelletaan eläketulovähennystä. Jos teet samaan aikaan töitä, vähennys pienenee, koska sen pienennys lasketaan koko puhtaasta ansiotulosta; laskelma on sivulla ${h.a('elakkeen-verotus', 'eläkkeen verotus')}. Tämän takia osittaisesta eläkkeestä jää töissä käyvälle usein vähemmän käteen kuin pelkkä bruttosumma antaisi odottaa.</p>
<p>Kelan kansaneläke ei korvaa varhennusvähennystä. Jos odotettu kokonaiseläke on lähellä ${h.a('takuuelake-laskuri', 'kansaneläkkeen ja takuueläkkeen')} rajoja, pysyvä leikkaus osuu suoraan käteen jäävään eläkkeeseen. ${h.a('elakelaskuri', 'Eläkelaskurilla')} näet, mikä kertyneen eläkkeen taso on alimmassa iässä ennen varhennusta, ja ${h.a('elakkeen-lykkaaminen', 'lykkäyssivulla')} vastakkaisen ratkaisun eli myöhemmän eläköitymisen.</p>`,
  },
  en: {
    slug: 'partial-early-pension',
    nav: 'Partial early pension',
    card: 'Draw a quarter or half of your accrued pension early: what you are paid and what you lose for life.',
    title: `Partial Early Old-Age Pension 2026: Take ${PIENI}% or ${SUURI}%`,
    description: `Partial early old-age pension 2026: draw ${PIENI}% or ${SUURI}% of your accrued earnings-related pension from age ${OVE63} or ${OVE64}, with a permanent ${EN.num(VAH, 1)}% cut per early month.`,
    h1: 'Partial early old-age pension (osittainen varhennettu vanhuuseläke)',
    intro: 'See what a partial early pension pays each month and how much the early-take reduction costs you for the rest of your life.',
    resume: `The partial early old-age pension (osittainen varhennettu vanhuuseläke) lets you draw ${PIENI}% or ${SUURI}% of the earnings-related pension you had accrued by the end of the previous year, at a permanent cost of ${EN.num(VAH, 1)}% of that share for every month you take it before your earliest retirement age. Työeläke.fi’s own example: with ${EN.eur(KERT)} accrued, taking ${SUURI}% three years early cuts your earnings-related pension by ${EN.eur(VIRALLINEN.pysyvaMenetys)} a month for good, and the partial pension pays ${EN.eur(VIRALLINEN.maksu)}. People born 1956–1963 could start at ${OVE63}, the 1964 cohort at ${OVE64}. From the 1965 cohort onwards the lower limit is ${ETAISYYS} years before your own earliest retirement age, which is not yet confirmed. You may keep working alongside it, and your salary keeps accruing new pension. The Kela national pension does not make up for the reduction. Take the partial pension after your earliest age instead, and the share is raised by ${EN.num(LYK, 1)}% per month of delay.`,
    faqs: [
      { q: 'How much does a partial early pension cut my pension for life?', a: `${EN.num(VAH, 1)}% for each month before your earliest retirement age, applied only to the share you draw. Taking ${SUURI}% of a ${EN.eur(KERT)} accrued pension three years early means a ${EN.num(VIRALLINEN.vahennysProsentti, 1)}% reduction, or ${EN.eur(VIRALLINEN.pysyvaMenetys)} a month. The cut stays in place after you move to a full old-age pension.` },
      { q: 'What is the earliest age for a partial early pension in Finland?', a: `${OVE63} for people born 1956–1963 and ${OVE64} for those born in 1964. From 1965 it is ${ETAISYYS} years before your own earliest retirement age. Because that age had not been confirmed for the 1965 cohort as of early October 2026, its partial pension age is also only a Työeläke.fi forecast for now, ${ENN['1965'].ove[0]}.` },
      { q: 'Should I take 25% or 50% of my pension early?', a: `The percentage cut per month is identical, ${EN.num(VAH, 1)}%. Choosing ${SUURI}% doubles both the monthly payment and the permanent loss in euros. Take ${PIENI}% if you mainly want to cushion a move to part-time work; the untouched part keeps growing and receives the deferral increase if you work past your earliest age.` },
      { q: 'Which accrued amount is the partial pension based on?', a: `The pension you had accrued by the end of the year before it starts, so pay earned in the current year is not yet included. The chosen ${PIENI}% or ${SUURI}% is taken from that, the ${EN.num(VAH, 1)}% per month reduction applied, and finally your cohort’s life expectancy coefficient, ${EN.num(E.elinaikakerroin_viimeisin.arvo, 5)} for people born in 1964.` },
      { q: 'Can I take a partial pension after my earliest retirement age?', a: `Yes, and then the logic reverses: no reduction, and the share is increased by ${EN.num(LYK, 1)}% for each month the start is delayed beyond the month after you reach your earliest age. Someone born in 1964 who takes ${SUURI}% six months after turning ${ALIN64[0]} gets a ${EN.num(6 * LYK, 1)}% increase on that share.` },
    ],
    body: (h) => `
<h2>How the amount is worked out</h2>
<p>The ${h.src('finlex_tyel', 'Employees Pensions Act')} lets you choose ${PIENI}% or ${SUURI}% of the pension accrued up to the end of the year before it starts. That share is permanently reduced by ${h.num(VAH, 1)}% for each month it begins before the start of the month following your earliest retirement age. In short: accrued pension × share × (1 − ${h.num(VAH, 1)}% × months early). The life expectancy coefficient is applied as well when the pension begins.</p>
${h.table(['Share', 'Months early', 'Reduction', 'Paid per month', 'Lost per month for life'], RIVIT.map(([o, kk]) => { const r = osittainenElake(KERT, o, kk); return [`${o}%`, h.num(kk), `${h.num(r.vahennysProsentti, 1)}%`, h.eur(r.maksu), h.eur(r.pysyvaMenetys)]; }), `Accrued pension of ${h.eur(KERT)}, before the life expectancy coefficient`, ['l', 'r', 'r', 'r', 'r'])}
<p>The last row is the maximum for the 1963 cohort: from ${OVE63} to the earliest age of ${ALIN63[0]} is ${KK63} months, a ${h.num(MAX63.vahennysProsentti, 1)}% reduction. For people born in 1964 the gap is ${KK64} months, because their lower limit rose to ${OVE64}.</p>
<h2>Age limits by birth year</h2>
<p>Born 1956–1963: from ${OVE63}. Born 1964: from ${OVE64}, with an earliest retirement age of ${ALIN64[0]}. Born 1965 or later: ${ETAISYYS} years before your own earliest age, so the date moves with each cohort. Työeläke.fi forecasts ${ENN['1970'].ove[0]} years ${ENN['1970'].ove[1]} months for someone born in 1970, for example, but nothing beyond 1964 is confirmed. The ${h.a('elakeika', 'retirement age')} page shows your cohort, and ${h.src('tyoelake_ika', 'Työeläke.fi')} keeps the official table.</p>
<h2>When the early money has been used up</h2>
<p>A partial pension is essentially money drawn in advance. In the official example you receive ${h.eur(VIRALLINEN.maksu)} a month for three years, ${h.eur(VIRALLINEN.maksu * 36)} in total, and afterwards your pension is ${h.eur(VIRALLINEN.pysyvaMenetys)} a month lower for life. Ignoring tax and indexation, the permanent loss catches up with the early payments about ${h.num(KUITTAUS_V, 1)} years after your earliest retirement age.</p>
<p>So in pure euros it pays off if you do not live that long past retirement, and costs you if you do. The stronger case is usually practical: a partial pension can fund a shorter working week, topping up a reduced salary. Pay still accrues ${h.num(E.karttumaprosentti, 1)}% in new pension during that time.</p>
<h2>Worked example: going part-time three years early</h2>
<p>Say you earn ${h.eur(OS_PALKKA)} a month and your pension record (työeläkeote) shows ${h.eur(OS_KERT)} accrued. Three years before your earliest retirement age you agree a move to ${h.pct(OS_OSUUS, 0)} hours and take ${SUURI}% of your pension. Part-time pay is ${h.eur(OS_UUSI_PALKKA)}; the partial pension, after the ${h.num(OS.vahennysProsentti, 1)}% reduction, is ${h.eur(OS.maksu)}. Gross income comes to ${h.eur(OS_UUSI_PALKKA + OS.maksu)}, just ${h.eur(OS_PALKKA - OS_UUSI_PALKKA - OS.maksu)} below your full-time salary.</p>
<p>The cost has two parts. From your earliest age you lose ${h.eur(OS.pysyvaMenetys)} a month for life, and three part-time years accrue ${h.eur(OS_KARTTUMA)} of monthly pension instead of the ${h.eur(OS_TAYSI_KARTTUMA)} full-time work would have earned. In exchange you work roughly two days a week less on almost the same income, which for many people is the whole point.</p>
<h2>Reaching your earliest retirement age</h2>
<p>The reduction is permanent and does not disappear when you reach your earliest age and move onto an old-age pension. The law attaches it only to the share you drew early, though: the part you left untouched and the new pension accrued from your salary meanwhile carry no early-take reduction.</p>
<p>Over twenty years the difference between a small and a large early draw is stark. Taking ${PIENI}% one year early pays ${h.eur(P12.maksu * 12)} up front and costs ${h.eur(P12.pysyvaMenetys * 12 * VUODET20)} over ${h.num(VUODET20)} years; the official ${SUURI}%, three-year example pays ${h.eur(VIRALLINEN.maksu * 36)} and costs ${h.eur(VIRALLINEN.pysyvaMenetys * 12 * VUODET20)}. A short, small draw is relatively cheaper because the reduction percentage grows with every month.</p>
<h2>Tax, Kela and the bigger picture</h2>
<p>The partial pension is pension income, so it gets the pension income deduction. If you also earn a salary, that deduction shrinks because it is reduced on your total net earned income; ${h.a('elakkeen-verotus', 'pension tax')} shows the numbers. Kela will not top up the reduction through the national pension, which matters most if your total pension will be close to the ${h.a('takuuelake-laskuri', 'national and guarantee pension')} thresholds.</p>
<p>Before deciding, run your accrued pension through the ${h.a('elakelaskuri', 'pension calculator')} and compare with the opposite strategy on ${h.a('elakkeen-lykkaaminen', 'deferring your pension')}, which pays ${h.num(LYK, 1)}% per month instead of costing it.</p>`,
  },
});
