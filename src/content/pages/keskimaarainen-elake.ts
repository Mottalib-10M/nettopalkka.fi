import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { elakeNetto } from '../../lib/engine/elake';
import { KALLEIN, HALVIN } from '../../lib/esimerkit';

const E = P.elake;
const S = E.tilastot_2025;
const K64 = E.elinaikakerroin_viimeisin.arvo;
const KP = E.karttumaprosentti;
const TAKUU = E.takuuelake.taysi_kk, KE = E.kansanelake.yksin_kk;
const SUKUP_ERO = S.miehet_kk - S.naiset_kk;
const SUKUP_PROS = SUKUP_ERO / S.miehet_kk;
const RIVIT: Array<[string, string, number]> = [
  ['Kaikki eläkkeensaajat', 'All pension recipients', S.kokonaiselake_kaikki_kk],
  ['Suomessa asuvat, oma eläke', 'Residents of Finland with own pension', S.kokonaiselake_suomessa_kk],
  ['Vanhuuseläkkeensaajat', 'Old-age pensioners', S.vanhuuselakkeensaaja_kk],
  ['Miehet', 'Men', S.miehet_kk],
  ['Naiset', 'Women', S.naiset_kk],
];
const N = RIVIT.map(([fi, en, b]) => ({ fi, en, b, n: elakeNetto(b, 'Helsinki') }));
const NV = elakeNetto(S.vanhuuselakkeensaaja_kk, 'Helsinki');
const NK = elakeNetto(S.kokonaiselake_kaikki_kk, 'Helsinki');
/** Vuosipalkka, jolla 40 vuoden ura tuottaa keskimääräisen vanhuuseläkkeen työeläkkeen (kerroin mukana, ei indeksejä). */
const URA = 40;
const PALKKA_KESKI = S.tyoelake_vanhuus_kk * 12 / (KP / 100 * URA) / K64;
const KE_YLA = E.kansanelake.yla_raja_yksin_kk;
const URAT = [30000, 40000, 50000, 60000].map((v) => ({ v, e: v * KP / 100 * URA / 12 * K64 }));
const KUNNAT_N = [KALLEIN.nimi, 'Helsinki', HALVIN.nimi].map((k) => ({ k, n: elakeNetto(S.vanhuuselakkeensaaja_kk, k) }));
/** Lyhyt ura Suomessa: 10 vuotta 50 000 €/v. */
const LYHYT = 50000 * KP / 100 * 10 / 12 * K64;

export default definePage({
  id: 'keskimaarainen-elake',
  group: 'elake',
  order: 70,
  mini: 'elakeVertailu',
  related: ['elakelaskuri', 'takuuelake-laskuri', 'elakkeen-verotus', 'tyoelakkeen-karttuminen'],
  sources: ['etk_keskielake', 'kela_takuuelake'],
  fi: {
    slug: 'keskimaarainen-elake',
    nav: 'Keskimääräinen eläke',
    card: 'Eläketurvakeskuksen keskiarvot: kaikki eläkkeensaajat, vanhuuseläkeläiset, miehet ja naiset sekä netto verojen jälkeen.',
    title: `Keskimääräinen eläke 2026: ${FI.eur(S.kokonaiselake_kaikki_kk)} kuukaudessa ennen veroja`,
    description: `Keskimääräinen eläke oli vuoden 2025 lopussa ${FI.eur(S.kokonaiselake_kaikki_kk)}/kk ja vanhuuseläkeläisillä ${FI.eur(S.vanhuuselakkeensaaja_kk)}/kk. Miehet ${FI.eur(S.miehet_kk)}, naiset ${FI.eur(S.naiset_kk)}. Vertaa omaa eläkettäsi 2026.`,
    h1: 'Keskimääräinen eläke',
    intro: 'Vertaa omaa eläkettäsi Eläketurvakeskuksen tuoreimpiin keskiarvoihin ja katso, paljonko keskimääräisestä eläkkeestä jää käteen.',
    resume: `Suomen eläkkeensaajien keskimääräinen kokonaiseläke oli vuoden 2025 lopussa ${FI.eur(S.kokonaiselake_kaikki_kk)} kuukaudessa ennen veroja, ja pelkkien vanhuuseläkkeensaajien keskiarvo oli ${FI.eur(S.vanhuuselakkeensaaja_kk)}. Luvut ovat Eläketurvakeskuksen tilastosta, joka on tuorein julkaistu: vuoden 2026 keskiarvot valmistuvat vasta vuoden päätyttyä. Kokonaiseläke tarkoittaa kaikkia eläkkeitä yhteensä, eli työeläkettä sekä Kelan kansaneläkettä ja takuueläkettä. Miesten keskimääräinen kokonaiseläke oli ${FI.eur(S.miehet_kk)} ja naisten ${FI.eur(S.naiset_kk)}, joten ero on ${FI.eur(SUKUP_ERO)} eli ${FI.pct(SUKUP_PROS, 0)} miesten eläkkeestä. Vuonna 2025 omaan työuraan perustuvalle eläkkeelle siirtyneiden keskimääräinen työeläke oli ${FI.eur(S.uudet_elakkeet_2025_kk)}. Verojen jälkeen helsinkiläiselle vanhuuseläkeläiselle jää keskimääräisestä eläkkeestä noin ${FI.eur(NV.kkNetto)} kuukaudessa, kun hän ei kuulu kirkkoon. Eläkkeiden mediaania Eläketurvakeskus ei julkaise keskimääräisten eläkkeiden sivullaan, joten emme esitä sille arviota. Pienin turvattu taso on takuueläke, ${FI.eur(TAKUU, 2)} kuukaudessa, joka edellyttää vähintään ${E.kansanelake.asumisaika_vahintaan_v} vuoden asumista Suomessa.`,
    faqs: [
      { q: 'Paljonko keskimääräinen eläke on Suomessa kuukaudessa?', a: `Eläketurvakeskuksen mukaan kaikkien eläkkeensaajien keskimääräinen kokonaiseläke oli vuoden 2025 lopussa ${FI.eur(S.kokonaiselake_kaikki_kk)} kuukaudessa. Vanhuuseläkkeensaajilla keskiarvo oli korkeampi, ${FI.eur(S.vanhuuselakkeensaaja_kk)}. Kun mukaan otetaan vain Suomessa asuvat, joilla on omaan työuraan perustuva eläke, keskiarvo on ${FI.eur(S.kokonaiselake_suomessa_kk)}. Summat ovat bruttoja ennen veroja.` },
      { q: 'Paljonko keskimääräisestä eläkkeestä jää käteen verojen jälkeen?', a: `Helsingissä ilman kirkollisveroa vanhuuseläkeläisten keskimääräisestä ${FI.eur(S.vanhuuselakkeensaaja_kk)} eläkkeestä jää noin ${FI.eur(NV.kkNetto)} kuukaudessa, veroprosentti ${FI.num(NV.veroprosentti, 1)}. Kaikkien eläkkeensaajien keskiarvosta ${FI.eur(S.kokonaiselake_kaikki_kk)} jää ${FI.eur(NK.kkNetto)}. Kalliimman kunnallisveron kunnassa ja kirkon jäsenellä netto on muutamia kymmeniä euroja pienempi, edullisimman veron kunnassa vastaavasti suurempi.` },
      { q: 'Mikä on eläkkeiden mediaani Suomessa?', a: `Eläketurvakeskuksen keskimääräisiä eläkkeitä käsittelevä sivu ei kerro mediaania, joten emme julkaise sille omaa arviota. Keskiarvo ja mediaani voivat poiketa toisistaan, koska muutama suuri eläke nostaa keskiarvoa. Siksi oman ${FI.eur(1800)} eläkkeen jääminen ${FI.eur(S.vanhuuselakkeensaaja_kk - 1800)} alle vanhuuseläkkeensaajien keskiarvon ei vielä kerro, että eläke olisi tavallista pienempi.` },
      { q: 'Kuinka paljon naisten eläke on miesten eläkettä pienempi?', a: `Vuoden 2025 lopussa naisten keskimääräinen kokonaiseläke oli ${FI.eur(S.naiset_kk)} ja miesten ${FI.eur(S.miehet_kk)} kuukaudessa. Ero on ${FI.eur(SUKUP_ERO)} eli noin ${FI.pct(SUKUP_PROS, 0)}. Työeläke seuraa työuran ansioita, joten palkkaerot ja osa-aikatyö kertautuvat eläkkeessä. Kelan eläkkeet tasoittavat eroa pienimmissä eläkkeissä.` },
      { q: 'Millä palkalla saa keskimääräisen eläkkeen?', a: `Vanhuuseläkkeensaajien keskimääräinen työeläke on ${FI.eur(S.tyoelake_vanhuus_kk)} kuukaudessa. Kun eläkettä kertyy ${FI.num(KP, 1)} % vuodessa ja vuonna 1964 syntyneen elinaikakerroin on ${FI.num(K64, 5)}, siihen tarvitaan ${URA} vuoden ajan noin ${FI.eur(PALKKA_KESKI)} vuosipalkka eli ${FI.eur(PALKKA_KESKI / 12)} kuukaudessa. Laskelma ei sisällä indeksejä eikä lykkäystä.` },
      { q: 'Miksi vuonna 2025 eläkkeelle jääneiden keskimääräinen eläke on pienempi kuin muiden?', a: `Vuonna 2025 omaan työuraan perustuvalle eläkkeelle siirtyneiden keskimääräinen työeläke oli ${FI.eur(S.uudet_elakkeet_2025_kk)}, kun kaikkien vanhuuseläkettä työeläkkeenä saavien keskiarvo oli ${FI.eur(S.tyoelake_vanhuus_kk)}. Uusien joukossa on myös työkyvyttömyyseläkkeelle siirtyneitä, ja uusiin vanhuuseläkkeisiin tehdään elinaikakertoimen leikkaus, vuonna 1963 syntyneillä ${FI.num((1 - E.elinaikakerroin['1963']) * 100, 1)} %.` },
    ],
    body: (h) => `
<h2>Keskiarvot ryhmittäin ja verojen jälkeen</h2>
<p>${h.src('etk_keskielake', 'Eläketurvakeskuksen tilasto')} kuvaa tilannetta 31.12.2025. Taulukkoon on laskettu jokaiselle keskiarvolle nettoeläke vuoden 2026 veroperusteilla helsinkiläiselle, joka ei kuulu kirkkoon. Kaikki summat ovat kuukausieläkkeitä.</p>
${h.table(['Ryhmä', 'Brutto', 'Veroprosentti', 'Netto'], N.map((r) => [r.fi, h.eur(r.b), `${h.num(r.n.veroprosentti, 1)} %`, h.eur(r.n.kkNetto)]), 'Lähde: Eläketurvakeskus, tilanne vuoden 2025 lopussa; verot laskurin moottorilla', ['l', 'r', 'r', 'r'])}
<p>Kaikkien eläkkeensaajien keskiarvo on muita pienempi, koska siihen sisältyvät myös työkyvyttömyyseläkkeensaajat ja ulkomailla asuvat eläkkeensaajat. Pelkkien Suomessa asuvien, omaan työuraan perustuvaa eläkettä saavien keskiarvo on ${h.eur(S.kokonaiselake_suomessa_kk)}. Vanhuuseläkkeensaajien ${h.eur(S.vanhuuselakkeensaaja_kk)} on paras vertailukohta, jos olet itse jäämässä vanhuuseläkkeelle.</p>
<h2>Uudet eläkkeet ja työeläkkeen osuus</h2>
<p>Vanhuuseläkettä työeläkkeenä saavien keskimääräinen työeläke oli ${h.eur(S.tyoelake_vanhuus_kk)} kuukaudessa. Vuoden 2025 aikana omaan työuraan perustuvalle eläkkeelle siirtyneiden keskimääräinen työeläke oli ${h.eur(S.uudet_elakkeet_2025_kk)}. Uusien eläkkeiden keskiarvoon vaikuttavat elinaikakerroin, joka leikkaa vuonna 2025 alkaneita vanhuuseläkkeitä noin ${h.num((1 - E.elinaikakerroin['1963']) * 100, 1)} %, sekä se, että joukossa on myös työkyvyttömyyseläkkeelle siirtyneitä.</p>
<p>Keskimääräinen työeläke kertoo, mitä tavallinen työura tuottaa. ${h.a('tyoelakkeen-karttuminen', 'Karttumasäännöillä')} ${h.num(URA)} vuoden ura noin ${h.eur(PALKKA_KESKI)} vuosipalkalla tuottaa vanhuuseläkkeensaajien keskimääräisen työeläkkeen, kun mukaan otetaan vuoden 1964 elinaikakerroin. Laskelma on karkea, koska todellisessa urassa palkka nousee ja ansiot tarkistetaan palkkakertoimella, mutta se antaa mittakaavan.</p>
<h2>Keskiarvo ja turvan alaraja</h2>
<p>Kelan ${h.src('kela_takuuelake', 'takuueläke')} on ${h.eur(TAKUU, 2)} kuukaudessa: se nostaa Suomessa asuvan eläkkeensaajan kokonaiseläkkeen vähintään tälle tasolle, kun asumisaikaehto täyttyy. Täysi kansaneläke yksin asuvalle on ${h.eur(KE, 2)}. Keskimääräinen vanhuuseläke on siis yli kaksinkertainen takuueläkkeeseen verrattuna, mutta jakauman alapäässä moni elää lähellä takuutasoa. Kelan eläkkeiden laskenta on sivulla ${h.a('takuuelake-laskuri', 'kansaneläke ja takuueläke')}.</p>
<h2>Keskimääräinen eläkeläinen ei saa kansaneläkettä</h2>
<p>Yksin asuva saa Kelan kansaneläkettä vain, jos työeläke on enintään ${h.eur(KE_YLA, 2)} kuukaudessa. Vanhuuseläkkeensaajien keskimääräinen työeläke ${h.eur(S.tyoelake_vanhuus_kk)} ylittää rajan selvästi: keskimääräisellä työeläkkeellä kansaneläkettä ei makseta lainkaan, ja kokonaiseläke koostuu pelkästä työeläkkeestä. Kansaneläke ja takuueläke kohdistuvat jakauman alapäähän: niille, joiden työura on jäänyt lyhyeksi tai palkat pieniksi, sekä niille, jotka ovat muuttaneet Suomeen aikuisena.</p>
${h.table(['Taso', 'Euroa kuukaudessa'], [
  ['Takuueläke (täysi)', h.eur(TAKUU, 2)],
  ['Kansaneläke yksin asuvalle (täysi)', h.eur(KE, 2)],
  ['Työeläke, jonka yläpuolella kansaneläkettä ei makseta', h.eur(KE_YLA, 2)],
  ['Uusien eläkkeiden keskimääräinen työeläke 2025', h.eur(S.uudet_elakkeet_2025_kk)],
  ['Vanhuuseläkkeensaajien keskimääräinen kokonaiseläke', h.eur(S.vanhuuselakkeensaaja_kk)],
], 'Kela 2026 ja Eläketurvakeskus 2025', ['l', 'r'])}
<h2>Mihin tavallinen työura riittää</h2>
<p>Taulukko näyttää, millaisen työeläkkeen ${h.num(URA)} vuoden ura tuottaa eri vuosipalkoilla, kun eläkettä kertyy ${h.num(KP, 1)} % ja käytetään vuonna 1964 syntyneiden elinaikakerrointa. Palkka pysyy samana koko uran, eikä indeksejä huomioida.</p>
${h.table(['Vuosipalkka', 'Työeläke kuukaudessa', 'Ero keskimääräiseen työeläkkeeseen'], URAT.map((u) => [h.eur(u.v), h.eur(u.e), h.eur(u.e - S.tyoelake_vanhuus_kk)]), 'Yksinkertaistettu laskelma, vertailukohta vanhuuseläkkeensaajien keskimääräinen työeläke', ['l', 'r', 'r'])}
<p>Keskimääräisen eläkkeen saavuttaminen edellyttää siis pitkää uraa vähintään keskitasoisella palkalla. Muutaman vuoden katkos tai pitkä osa-aikajakso siirtää lopputulosta helposti keskiarvon alle.</p>
<p>Lyhyt ura Suomessa jää vielä kauemmas. Jos olet muuttanut maahan keski-iässä ja teet täällä kymmenen vuotta töitä ${h.eur(50000)} vuosipalkalla, Suomesta kertyy noin ${h.eur(LYHYT)} kuukausieläke elinaikakertoimen jälkeen. Kelan kansaneläke on suhteutettu Suomessa asuttuun aikaan, ja takuueläkettä pienentävät lähes kaikki muut eläkkeet, myös ulkomailta maksettavat, bruttomääräisinä ennen veroja. Keskiarvo kuvaa siksi lähinnä niitä, jotka ovat tehneet koko uransa Suomessa, eikä se sovellu sellaisenaan maahan myöhemmin muuttaneen eläketavoitteeksi.</p>
<h2>Sama keskiarvo eri kunnissa</h2>
<p>Bruttoeläke on sama kaikkialla, mutta netto ei. Vanhuuseläkkeensaajien keskimääräisestä eläkkeestä jää käteen ${KUNNAT_N.map((x) => `${x.k}: ${h.eur(x.n.kkNetto)}`).join(', ')} kuukaudessa, kun kirkollisveroa ei makseta. Ero kalleimman ja edullisimman kunnan välillä on ${h.eur(KUNNAT_N[2].n.kkNetto - KUNNAT_N[0].n.kkNetto)} kuukaudessa.</p>
<h2>Miesten ja naisten ero</h2>
<p>Miesten keskimääräinen kokonaiseläke on ${h.eur(SUKUP_ERO)} naisten eläkettä suurempi. Ero johtuu ennen kaikkea työeläkkeistä, sillä työeläke seuraa koko työuran ansioita: pienemmät palkat, osa-aikatyö ja pitkät hoitovapaat näkyvät vuosikymmenten päästä kuukausieläkkeessä. Nykyiset säännöt kerryttävät eläkettä myös perhevapaiden ajalta, joten ero voi kaventua tulevilla eläkeläisillä, mutta muutos on hidas.</p>
<h2>Miten vertaat omaa eläkettäsi</h2>
<h2>Keskiarvo suunnittelun apuna</h2>
<p>Keskiarvo on hyödyllinen vertailukohta, mutta huono tavoite. Eläkkeen riittävyyttä kannattaa arvioida omien menojen kautta: asuminen, ruoka, terveys ja liikkuminen. Jos nykyiset nettotulot ovat selvästi keskimääräistä nettoeläkettä suuremmat, eläkkeelle siirtyminen pudottaa tulotasoa tuntuvasti, vaikka eläke olisi keskiarvon yläpuolella. Toisaalta eläkeläisen verotus on kevyempää pienillä tuloilla eläketulovähennyksen ansiosta, ja työssäkäyntiin liittyvät kulut jäävät pois.</p>
<p>Oman tilanteen vertailu kannattaa aloittaa työeläkeotteesta, jossa näkyy jo kertynyt eläke. Kun lisäät siihen jäljellä olevien työvuosien karttuman ja kerrot tuloksen elinaikakertoimella, saat karkean arvion, jota voi verrata yllä oleviin keskiarvoihin.</p>
<p>Minilaskuri vertaa syöttämääsi kokonaiseläkettä vanhuuseläkkeensaajien keskiarvoon. Oman tulevan eläkkeesi arvion saat ${h.a('elakelaskuri', 'eläkelaskurista')}, ja sen nettomäärän ${h.a('elakkeen-verotus', 'eläkkeen verotus')} -sivun minilaskurista. Muista, että keskiarvot ovat vuoden 2025 lopun tasoa; työeläkkeitä tarkistetaan vuosittain työeläkeindeksillä, jonka pisteluku vuodelle 2026 on ${h.num(E.indeksit.tyoelakeindeksi)}, ja Kelan eläkkeitä kansaneläkeindeksillä, jonka mukaan ne nousivat vuoden 2026 alussa ${h.num(E.indeksit.korotus_prosentti, 1)} %.</p>`,
  },
  en: {
    slug: 'average-pension',
    nav: 'Average pension',
    card: 'Official averages from the Finnish Centre for Pensions: all pensioners, old-age pensioners, men and women, and net after tax.',
    title: `Average Pension 2026: ${EN.eur(S.kokonaiselake_kaikki_kk)} a Month Before Tax in Finland`,
    description: `Average pension in Finland was ${EN.eur(S.kokonaiselake_kaikki_kk)} a month at the end of 2025, ${EN.eur(S.vanhuuselakkeensaaja_kk)} for old-age pensioners. Men ${EN.eur(S.miehet_kk)}, women ${EN.eur(S.naiset_kk)}. Compare your own pension for 2026.`,
    h1: 'Average pension in Finland',
    intro: 'Compare your pension with the latest official averages and see what an average pension leaves after tax.',
    resume: `The average total pension in Finland was ${EN.eur(S.kokonaiselake_kaikki_kk)} a month before tax at the end of 2025, and ${EN.eur(S.vanhuuselakkeensaaja_kk)} for old-age pensioners alone, according to the Finnish Centre for Pensions (Eläketurvakeskus, ETK). These are the most recent published figures; averages for 2026 will only be compiled after the year ends. Total pension (kokonaiseläke) means everything a person receives as pension: the earnings-related pension (työeläke) plus Kela’s national pension and guarantee pension. Men averaged ${EN.eur(S.miehet_kk)} and women ${EN.eur(S.naiset_kk)}, a gap of ${EN.eur(SUKUP_ERO)} or ${EN.pct(SUKUP_PROS, 0)} of the men’s figure. People who retired on a pension based on their own working life during 2025 received ${EN.eur(S.uudet_elakkeet_2025_kk)} of earnings-related pension on average. After tax, an old-age pensioner in Helsinki with no church membership keeps about ${EN.eur(NV.kkNetto)} of the average. ETK does not publish a median on its average pensions page, so we do not estimate one. The floor is the guarantee pension (takuueläke), ${EN.eur(TAKUU, 2)} a month.`,
    faqs: [
      { q: 'What is the average monthly pension in Finland?', a: `${EN.eur(S.kokonaiselake_kaikki_kk)} a month across all pension recipients at the end of 2025, before tax, per the Finnish Centre for Pensions. Old-age pensioners averaged more, ${EN.eur(S.vanhuuselakkeensaaja_kk)}. Counting only residents of Finland whose pension is based on their own career, the average is ${EN.eur(S.kokonaiselake_suomessa_kk)}.` },
      { q: 'How much of an average Finnish pension is left after tax?', a: `In Helsinki without church tax, the old-age average of ${EN.eur(S.vanhuuselakkeensaaja_kk)} leaves about ${EN.eur(NV.kkNetto)} a month at a withholding rate of ${EN.num(NV.veroprosentti, 1)}%. The all-pensioner average of ${EN.eur(S.kokonaiselake_kaikki_kk)} leaves ${EN.eur(NK.kkNetto)}. A higher municipal tax rate or church membership lowers the net figure by a few tens of euros.` },
      { q: 'Will I reach the average Finnish pension if I only work here ten years?', a: `Unlikely. Ten years on ${EN.eur(50000)} a year accrues about ${EN.eur(LYHYT)} a month after the ${EN.num(K64, 5)} life expectancy coefficient, far below the ${EN.eur(S.tyoelake_vanhuus_kk)} average earnings-related pension of old-age pensioners. The Kela national pension is pro-rated by years of residence, and the guarantee pension is reduced by almost all other pensions, including those paid from abroad.` },
      { q: 'What salary gives you an average Finnish pension?', a: `Old-age pensioners receive an average earnings-related pension of ${EN.eur(S.tyoelake_vanhuus_kk)}. With ${EN.num(KP, 1)}% annual accrual and the 1964 coefficient of ${EN.num(K64, 5)}, that takes about ${EN.eur(PALKKA_KESKI)} a year, ${EN.eur(PALKKA_KESKI / 12)} a month, for ${URA} years. Indexation and deferral are left out, so treat it as an order of magnitude.` },
      { q: 'Why do new retirees get less than the average old-age pensioner?', a: `In 2025, people moving onto a pension based on their own career averaged ${EN.eur(S.uudet_elakkeet_2025_kk)} of earnings-related pension, against ${EN.eur(S.tyoelake_vanhuus_kk)} for all old-age pensioners. The new group includes disability pensioners, and new old-age pensions are cut by the life expectancy coefficient, ${EN.num((1 - E.elinaikakerroin['1963']) * 100, 1)}% for the 1963 cohort.` },
    ],
    body: (h) => `
<h2>Averages by group, gross and net</h2>
<p>The ${h.src('etk_keskielake', 'Finnish Centre for Pensions statistics')} describe the situation on 31 December 2025. We have added the net amount for each average using 2026 tax rules for a Helsinki resident who does not belong to a church. All figures are monthly.</p>
${h.table(['Group', 'Gross', 'Withholding rate', 'Net'], N.map((r) => [r.en, h.eur(r.b), `${h.num(r.n.veroprosentti, 1)}%`, h.eur(r.n.kkNetto)]), 'Source: Finnish Centre for Pensions, end of 2025; tax computed with our engine', ['l', 'r', 'r', 'r'])}
<p>The all-recipient average is lower because it also covers disability pensioners and pension recipients living abroad; residents of Finland with a pension from their own career average ${h.eur(S.kokonaiselake_suomessa_kk)}. If you are heading for an old-age pension yourself, ${h.eur(S.vanhuuselakkeensaaja_kk)} is the fairer benchmark.</p>
<h2>New retirees and the earnings-related part</h2>
<p>Old-age pensioners receiving an earnings-related pension averaged ${h.eur(S.tyoelake_vanhuus_kk)} from that source. Those who moved onto a pension based on their own career during 2025 averaged ${h.eur(S.uudet_elakkeet_2025_kk)}; that group includes new disability pensioners, and new old-age pensions in 2025 were trimmed by the life expectancy coefficient of about ${h.num((1 - E.elinaikakerroin['1963']) * 100, 1)}%.</p>
<p>Using the ${h.a('tyoelakkeen-karttuminen', 'accrual rules')}, ${h.num(URA)} years on roughly ${h.eur(PALKKA_KESKI)} a year produces the average earnings-related pension after the 1964 coefficient. Real careers have rising pay and revalued earnings, so this is only a sense of scale.</p>
<h2>If you came to Finland mid-career</h2>
<p>Averages describe people who spent most of their working lives in Finland. A shorter Finnish career builds a proportionally smaller earnings-related pension: ten years on ${h.eur(50000)} comes to about ${h.eur(LYHYT)} a month. The ${h.a('takuuelake-laskuri', 'national and guarantee pension')} can top up low totals, but both require residence in Finland, the national pension is pro-rated by residence time, and pensions from other countries reduce the guarantee pension.</p>
<h2>The typical old-age pensioner gets no Kela national pension</h2>
<p>A single person receives the Kela national pension only if their earnings-related pension is at most ${h.eur(KE_YLA, 2)} a month. The average earnings-related pension of old-age pensioners, ${h.eur(S.tyoelake_vanhuus_kk)}, is well above that line: at the average, no national pension is paid and the total pension is the earnings-related pension alone. Kela’s pensions matter at the bottom of the distribution: short careers, low pay, and people who arrived in Finland as adults.</p>
${h.table(['Level', 'Euros per month'], [
  ['Guarantee pension (full)', h.eur(TAKUU, 2)],
  ['National pension, single (full)', h.eur(KE, 2)],
  ['Earnings-related pension above which no national pension is paid', h.eur(KE_YLA, 2)],
  ['New retirees’ average earnings-related pension, 2025', h.eur(S.uudet_elakkeet_2025_kk)],
  ['Old-age pensioners’ average total pension', h.eur(S.vanhuuselakkeensaaja_kk)],
], 'Kela 2026 and Finnish Centre for Pensions 2025', ['l', 'r'])}
<h2>What a full career produces</h2>
<p>Forty years at a flat salary, ${h.num(KP, 1)}% accrual and the 1964 coefficient give the following earnings-related pensions, compared with the old-age average:</p>
${h.table(['Annual salary', 'Pension per month', 'Versus average'], URAT.map((u) => [h.eur(u.v), h.eur(u.e), h.eur(u.e - S.tyoelake_vanhuus_kk)]), 'Simplified, no indexation', ['l', 'r', 'r'])}
<p>Net of tax, the old-age average leaves ${KUNNAT_N.map((x) => `${h.eur(x.n.kkNetto)} in ${x.k}`).join(', ')}, without church tax: a spread of ${h.eur(KUNNAT_N[2].n.kkNetto - KUNNAT_N[0].n.kkNetto)} a month between the most and least expensive municipalities.</p>
<h2>The floor and the gender gap</h2>
<p>Kela’s ${h.src('kela_takuuelake', 'guarantee pension')} of ${h.eur(TAKUU, 2)} a month lifts a resident pensioner’s total pension to at least that level once the residence condition is met; the full national pension for a single person is ${h.eur(KE, 2)}. The average old-age pension is more than twice the guarantee level. Men’s average total pension is ${h.eur(SUKUP_ERO)} higher than women’s, mostly through earnings-related pensions, which mirror lifetime pay, part-time work and long care leaves. Current rules credit pension during family leave, so the gap may narrow slowly for future retirees.</p>
<p>Treat the average as a reference, not a target. Whether a pension is enough depends on your own costs, and moving from a good salary to even an above-average pension can mean a sharp drop in net income. Start from your pension record (työeläkeote), add accrual for your remaining working years, apply the coefficient, and compare the result with the figures above.</p>
<p>The mini calculator compares your total pension with the old-age average. For your own projection, use the ${h.a('elakelaskuri', 'pension calculator')}, and for the after-tax figure see ${h.a('elakkeen-verotus', 'pension tax')}. Earnings-related pensions are indexed each year with the earnings-related pension index (työeläkeindeksi), ${h.num(E.indeksit.tyoelakeindeksi)} points for 2026, while Kela pensions rose ${h.num(E.indeksit.korotus_prosentti, 1)}% at the start of 2026.</p>`,
  },
});
