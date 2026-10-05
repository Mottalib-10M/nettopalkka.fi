import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { yleistukiKk } from '../../lib/engine/paivaraha';
import { r2 } from '../../lib/engine/params';

const A = P.asumistuki;
const O = A.perusomavastuu;
const V = A.varallisuus;
const M = A.muutosilmoitus;
/** Euroa tukea pois jokaista 100 euron bruttotuloa kohti: 70 % × 0,5. */
const LEIKKURI = r2(100 * (A.tukiprosentti / 100) * O.kerroin);
const TAYSI_YKSIN = O.perus + O.aikuinen;
const RAJAT: Array<[number, number]> = [[1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 0]];
const KUNNAT = ['Helsinki', 'Tampere', 'Pori'];
const TR = RAJAT.map(([a, l]) => ({ a, l, r: KUNNAT.map((k) => tuloraja(k, a, l)) }));
const VUOKRA = 600;
const PORTAAT = [800, 1000, 1200, 1400, 1600].map((t) => ({ t, r: asumistuki({ kunta: 'Tampere', aikuiset: 1, lapset: 0, tulot: t, vuokra: VUOKRA }) }));
const EE = A.esimerkit[1];
const EINO = asumistuki({ kunta: EE.kunta, aikuiset: EE.aikuiset, lapset: EE.lapset, tulot: EE.tulot, vuokra: EE.menot });
const NETTO_VARAT = 15000;
const VARAT_KK = r2((V.osuus / 100) * (NETTO_VARAT - V.raja_yksi) / 12);
const SAASTO = NETTO_VARAT + V.kayttovara_henkilo;
const ILMAN = asumistuki({ kunta: 'Tampere', aikuiset: 1, lapset: 0, tulot: 1200, vuokra: VUOKRA });
const VARALLINEN = asumistuki({ kunta: 'Tampere', aikuiset: 1, lapset: 0, tulot: 1200, vuokra: VUOKRA, varallisuus: SAASTO });
const YT = yleistukiKk();
const YT_AT = asumistuki({ kunta: 'Helsinki', aikuiset: 1, lapset: 0, tulot: YT, vuokra: 700 });

export default definePage({
  id: 'asumistuki-tulot',
  group: 'tuet',
  order: 50,
  mini: 'asumistukiTuloraja',
  related: ['asumistuki-laskuri', 'asumistuki-enimmaismenot', 'yleistuki', 'nettopalkka-2000'],
  sources: ['kela_asumistuki_laskenta', 'kela_yleinen_asumistuki'],
  fi: {
    slug: 'asumistuki-ja-tulot',
    nav: 'Asumistuki ja tulot',
    card: 'Perusomavastuun kaava, tulorajat ja varallisuuden vaikutus yleiseen asumistukeen.',
    title: 'Asumistuki ja tulot 2026: perusomavastuu ja tulorajat',
    description: `Asumistuki ja tulot 2026: jokainen ${FI.eur(100)} bruttotulo vähentää tukea ${FI.eur(LEIKKURI)}. Perusomavastuun kaava, Kelan tulorajat, varallisuusraja ja muutosilmoitukset.`,
    h1: 'Asumistuki ja tulot',
    intro: 'Tulot vaikuttavat yleiseen asumistukeen yhden luvun kautta: perusomavastuun, joka vähennetään hyväksytyistä asumismenoista.',
    resume: `Jokainen ${FI.eur(100)} lisää bruttotuloa pienentää yleistä asumistukea ${FI.eur(LEIKKURI)}, kun tulot ylittävät täyteen tukeen oikeuttavan rajan. Raja on yksin asuvalla ${FI.eur(TAYSI_YKSIN)} kuukaudessa: ${FI.eur(O.perus)}, johon lisätään ${FI.eur(O.aikuinen)} jokaista aikuista ja ${FI.eur(O.lapsi)} jokaista lasta kohti. Tämän ylittävästä osasta puolet on perusomavastuuta, joka vähennetään hyväksytyistä asumismenoista, ja tuki on ${A.tukiprosentti} % erotuksesta. Kela laskee tulot aina bruttona, ja mukaan tulevat palkan lisäksi lomarahat, ylityö- ja vuorotyölisät, yleistuki ja ansiopäiväraha. Tuki loppuu, kun se jäisi alle ${FI.eur(A.pienin_maksettava)}: yksin asuvalla tämä tuloraja on vuonna 2026 ${FI.eur(TR[0].r[0])} Helsingissä, ${FI.eur(TR[0].r[1])} Tampereella ja ${FI.eur(TR[0].r[2])} esimerkiksi Porissa. Myös varallisuus voi vaikuttaa: yhden aikuisen talouden ${FI.eur(V.raja_yksi)} ja useamman aikuisen ${FI.eur(V.raja_useampi)} ylittävästä nettovarallisuudesta ${V.osuus} % lisätään vuosituloon, ja ${FI.eur(V.este)} varallisuus estää tuen kokonaan. Kelalle on ilmoitettava, jos tulot nousevat vähintään ${FI.eur(M.nousu)} tai laskevat ${FI.eur(M.lasku)} kuukaudessa.`,
    faqs: [
      { q: 'Paljonko palkankorotus pienentää asumistukea?', a: `${FI.eur(LEIKKURI)} jokaista ${FI.eur(100)} bruttokorotusta kohti, kunhan tulot ovat jo täyden tuen rajan yläpuolella. Tämä tulee kaavasta: perusomavastuu kasvaa puolella korotuksesta, ja tuki on ${A.tukiprosentti} % menojen ja omavastuun erotuksesta. Verojen jälkeen korotuksesta jää siis selvästi vähemmän käteen kuin palkkalaskelma näyttää, mutta tulot nousevat silti aina enemmän kuin tuki laskee.` },
      { q: 'Mikä on asumistuen tuloraja yksin asuvalle vuonna 2026?', a: `Kelan taulukon mukaan ${FI.eur(TR[0].r[0])} kuukaudessa pääkaupunkiseudun I-kuntaryhmässä, ${FI.eur(TR[0].r[1])} II-kuntaryhmässä ja ${FI.eur(TR[0].r[2])} muualla. Rajat on laskettu olettaen, että vuokra on vähintään kuntaryhmän enimmäismäärän suuruinen. Pienemmällä vuokralla tuki loppuu jo matalammilla tuloilla, koska perusomavastuu syö menot aiemmin.` },
      { q: 'Lasketaanko lomaraha asumistuen tuloksi?', a: `Lasketaan. Kela mainitsee luettelossaan lomarahat samoin kuin ylityökorvaukset, vuorotyölisät ja luontoisedut. Koska tulo arvioidaan kuukausitasolla, epäsäännöllinen erä kannattaa ottaa huomioon keskiarvotulossa: jos tulot vaihtelevat, Kela laskee yhteen seuraavan ${FI.num(12)} kuukauden arvioidut tulot ja jakaa summan ${FI.num(12)}:lla. Kesäkuun lomaraha nostaa näin koko vuoden keskituloa eikä vain yhtä kuukautta.` },
      { q: 'Vaikuttavatko säästöt asumistukeen?', a: `Vaikuttavat, jos ne ovat suuret. Talletuksista vähennetään ensin ${FI.eur(V.kayttovara_henkilo)} henkeä kohti. Yhden aikuisen taloudessa ${FI.eur(V.raja_yksi)} ja useamman aikuisen taloudessa ${FI.eur(V.raja_useampi)} ylittävästä varallisuudesta ${V.osuus} % jaettuna kahdellatoista lisätään kuukausituloon. ${FI.eur(NETTO_VARAT)} nettovarallisuus yksin asuvalla lisää tuloa ${FI.eur(VARAT_KK, 2)} kuukaudessa. Vähintään ${FI.eur(V.este)} varallisuus estää tuen kokonaan.` },
      { q: 'Milloin tulojen muutoksesta pitää ilmoittaa Kelalle?', a: `Kun ruokakunnan tulot nousevat vähintään ${FI.eur(M.nousu)} tai laskevat vähintään ${FI.eur(M.lasku)} kuukaudessa. Ilman ilmoitusta tukea maksettaisiin liikaa, koska jokainen ${FI.eur(M.nousu)} lisätuloa olisi pienentänyt tukea ${FI.eur(r2(M.nousu * LEIKKURI / 100))}. Laskusta kannattaa ilmoittaa heti, sillä asumistukea voi saada takautuvasti enintään ${A.takautuvasti_kk} kuukauden ajalta.` },
      { q: 'Vaikuttaako lapsilisä asumistukeen?', a: `Ei vaikuta. Kela ei laske asumistuen tuloiksi lapsilisää, toimeentulotukea, elatustukea, opintolainaa eikä opintotuen asumislisää. Lapset vaikuttavat laskelmaan toista kautta: jokainen lapsi nostaa täyteen tukeen oikeuttavaa tuloa ${FI.eur(O.lapsi)} kuukaudessa, ja perheen koko nostaa myös hyväksyttävien asumismenojen enimmäismäärää. Lapsilisä jää siis kokonaan perheen käyttöön.` },
    ],
    body: (h) => `
<h2>Perusomavastuun kaava</h2>
<p>Kela laskee tuen kaavalla ${h.num(A.tukiprosentti / 100, 1)} × (hyväksyttävät asumismenot − perusomavastuu). Perusomavastuu puolestaan on ${h.num(O.kerroin, 1)} × [T − (${O.perus} + ${O.aikuinen} × A + ${O.lapsi} × L)], jossa T on ruokakunnan bruttotulot kuukaudessa, A aikuisten ja L lasten määrä. Luvut on sidottu kansaneläkeindeksiin ja ovat vuoden 2026 tasossa. Ruokakuntaan katsotaan aina kuuluvan vähintään yksi aikuinen, ja alle ${h.eur(O.huomiotta_alle)} omavastuu jätetään huomiotta.</p>
<p>Kaavasta seuraa kaksi asiaa. Ensinnäkin yksin asuvan tulot voivat olla ${h.eur(TAYSI_YKSIN)} kuukaudessa ilman, että ne pienentävät tukea lainkaan. Toiseksi rajan yli jokainen euro pienentää tukea ${h.num(LEIKKURI, 0)} senttiä, oli tulo sitten palkkaa, päivärahaa tai eläkettä.</p>
${h.table(['Bruttotulot/kk', 'Perusomavastuu', 'Asumistuki'], PORTAAT.map((x) => [h.eur(x.t), h.eur(x.r.perusomavastuu, 2), h.eur(x.r.tuki, 2)]), `Yksin asuva Tampereella, vuokra ${h.eur(VUOKRA)}, hyväksytään ${h.eur(PORTAAT[0].r.hyvaksytyt)}, 2026`, ['l', 'r', 'r'])}
<p>Taulukon jokainen ${h.eur(200)} tulonlisäys vie tuesta saman ${h.eur(2 * LEIKKURI)}. Vuokra ei muuta tätä leikkuria, koska Tampereella yksin asuvalta hyväksytään joka tapauksessa vain ${h.eur(PORTAAT[0].r.hyvaksytyt)}.</p>
<h2>Kelan tulorajat 2026</h2>
<p>Tuloraja on bruttotulo, jolla tuki putoaa alle ${h.eur(A.pienin_maksettava)}, kun asumismenot ovat kuntaryhmän enimmäismäärän suuruiset. Laskurimme tuottaa Kelan julkaisemat rajat euron tarkkuudella:</p>
${h.table(['Ruokakunta', 'I-ryhmä (Helsinki)', 'II-ryhmä (Tampere)', 'III-ryhmä (Pori)'], TR.map((x) => [`${x.a} aik. + ${x.l} lasta`, ...x.r.map((v) => h.eur(v))]), 'Asumistuen tulorajat euroa kuukaudessa, 2026', ['l', 'r', 'r', 'r'])}
<p>Taulukosta näkyy, kuinka paljon lapset nostavat rajaa. Yksinhuoltajan, jolla on kaksi lasta, tuki loppuu Helsingissä vasta ${h.eur(TR[2].r[0])} tuloilla, kun yksin asuvalla raja on ${h.eur(TR[0].r[0])}. Jokainen lapsi nostaa sekä täyteen tukeen oikeuttavaa tuloa ${h.eur(O.lapsi)} että asumismenojen kattoa.</p>
<p>Rajan alapuolellakin tuki voi olla pieni. Jos vuokra jää kuntaryhmän enimmäismäärää pienemmäksi, raja tulee vastaan aiemmin, koska omavastuu kuluttaa pienemmät menot nopeammin.</p>
<h2>Mitkä tulot lasketaan</h2>
<p>Kela huomioi tulot aina bruttona. Mukaan tulevat palkat luontoisetuineen, ylityökorvaukset, vuorotyölisät ja lomarahat, työttömyysetuuksista yleistuki ja ansiosidonnainen päiväraha sekä useimmat muut etuudet. Korot ja osingot otetaan tuloksi, jos ne ovat yli ${h.eur(A.korot_osingot_huomiotta_kk, 2)} kuukaudessa. Lapsilisä, toimeentulotuki, elatustuki, opintolaina ja opintotuen asumislisä eivät vaikuta.</p>
<p>Jos tulot ovat pysyneet samoina kolme kuukautta, Kela käyttää jatkuvaa kuukausituloa. Vaihtelevissa tuloissa se laskee seuraavan ${h.num(12)} kuukauden arvioidut tulot yhteen ja jakaa summan ${h.num(12)}:lla. Keikkatyöläisen tai kausityöntekijän kannattaa siksi arvioida koko vuosi eikä vain hakemuskuukautta.</p>
<h2>Kahden aikuisen esimerkki</h2>
<p>Kelan esimerkissä ${EE.nimi} asuvat ${EE.kunta.replace('Turku', 'Turussa')}. Heidän yhteiset bruttotulonsa ovat ${h.eur(EE.tulot)} ja asumismenot ${h.eur(EE.menot)} kuukaudessa. Täyteen tukeen oikeuttava tulo on ${h.eur(O.perus + 2 * O.aikuinen)}, joten perusomavastuu on ${h.eur(EINO.perusomavastuu, 2)}. Menoista hyväksytään ${h.eur(EINO.enimmais)}, ja tuki on ${h.eur(EINO.tuki, 2)} kuukaudessa. Kahden aikuisen talous saa yhden aikuisen lisäyksen vain ${h.eur(O.aikuinen)}, joten parin yhteiset tulot leikkaavat tukea selvästi nopeammin kuin kaksi erillistä yksin asuvaa.</p>
<h2>Pieni tuki ja pieni omavastuu</h2>
<p>Kaksi pientä sääntöä vaikuttaa rajoilla. Jos laskettu perusomavastuu jää alle ${h.eur(O.huomiotta_alle)}, se jätetään kokonaan huomiotta, eli tuloiltaan juuri rajan yläpuolella oleva saa vielä täyden tuen. Toisessa päässä alle ${h.eur(A.pienin_maksettava)} kuukausituki jätetään maksamatta. Sen vuoksi tuloraja ei ole se tulo, jolla laskennallinen tuki on nolla, vaan se, jolla tuki putoaa ${h.eur(A.pienin_maksettava)} alle.</p>
<h2>Varallisuus</h2>
<p>Varallisuus lasketaan velkojen jälkeen, ja talletuksista vähennetään käyttövaroina ${h.eur(V.kayttovara_henkilo)} henkeä kohti. Jos jäljelle jää yhden aikuisen taloudessa yli ${h.eur(V.raja_yksi)} tai useamman aikuisen taloudessa yli ${h.eur(V.raja_useampi)}, ylittävästä osasta ${V.osuus} % vuodessa lisätään tuloihin. Yksin asuva, jolla on ${h.eur(SAASTO)} talletuksia, saa nettovarallisuudeksi ${h.eur(NETTO_VARAT)}, ja tuloihin lisätään ${h.eur(VARAT_KK, 2)} kuukaudessa. Tampereella ${h.eur(1200)} tuloilla ja ${h.eur(VUOKRA)} vuokralla tuki laskee näin ${h.eur(ILMAN.tuki, 2)}:sta ${h.eur(VARALLINEN.tuki, 2)}:oon. Kun nettovarallisuus on vähintään ${h.eur(V.este)}, oikeutta tukeen ei ole.</p>
<h2>Työttömänä asumistuella</h2>
<p>Työttömyys pudottaa tulot usein täyden tuen tuntumaan. Yksin asuva helsinkiläinen, jonka ainoa tulo on ${h.a('yleistuki', 'yleistuki')} ${h.eur(YT, 2)} kuukaudessa ja vuokra ${h.eur(700)}, saa asumistukea ${h.eur(YT_AT.tuki, 2)}, koska perusomavastuu on vain ${h.eur(YT_AT.perusomavastuu, 2)}. Jos tulot laskevat vähintään ${h.eur(M.lasku)} kuukaudessa, ilmoita muutoksesta heti, sillä tukea maksetaan takautuvasti enintään ${A.takautuvasti_kk} kuukauden ajalta.</p>
<p>Opiskelija ei yleensä saa yleistä asumistukea, vaan hänen asumisensa tuetaan opintotuen asumislisällä, ja Suomeen opiskelemaan tulleet eivät voi kuulua asumistuen ruokakuntaan. Matalapalkkaisen työntekijän tilannetta havainnollistaa sivu ${h.a('nettopalkka-2000', `nettopalkka ${h.eur(2000)} palkasta`)}. Laske oma tukesi ${h.a('asumistuki-laskuri', 'asumistukilaskurilla')} tai tarkista ensin kuntasi katto sivulta ${h.a('asumistuki-enimmaismenot', 'enimmäisasumismenot')}.</p>
<p>Lähteet: ${h.src('kela_asumistuki_laskenta', 'Kela, miten tulot ja menot vaikuttavat')} ja ${h.src('kela_yleinen_asumistuki', 'Kela, yleinen asumistuki')}.</p>`,
  },
  en: {
    slug: 'housing-allowance-income-limits',
    nav: 'Housing allowance and income',
    card: 'The deductible formula, income limits and savings rules behind Kela’s general housing allowance.',
    title: 'Housing Allowance Income Limits 2026: How Pay Cuts It',
    description: `Housing allowance income limits 2026: every ${EN.eur(100)} of gross pay cuts Kela’s allowance by ${EN.eur(LEIKKURI)}. The basic deductible formula, income limits by household and assets.`,
    h1: 'Housing allowance and your income',
    intro: 'Income enters Kela’s housing allowance through one number, the basic deductible (perusomavastuu).',
    resume: `Each extra ${EN.eur(100)} of gross monthly income cuts Kela’s general housing allowance (yleinen asumistuki) by ${EN.eur(LEIKKURI)} once you are above the full-allowance threshold, which for a single person is ${EN.eur(TAYSI_YKSIN)} a month in 2026. That threshold is ${EN.eur(O.perus)} plus ${EN.eur(O.aikuinen)} per adult and ${EN.eur(O.lapsi)} per child. Half of whatever you earn above it becomes your basic deductible (perusomavastuu), which is subtracted from your accepted housing costs, and Kela pays ${A.tukiprosentti}% of what remains. Kela always uses gross income, including holiday bonus, overtime, shift premiums, general support and earnings-related unemployment allowance. The allowance stops once it would fall below ${EN.eur(A.pienin_maksettava)}: for a single person the cut-off is ${EN.eur(TR[0].r[0])} in the capital region, ${EN.eur(TR[0].r[1])} in group II towns and ${EN.eur(TR[0].r[2])} in the rest of the mainland. Savings count too: net assets above ${EN.eur(V.raja_yksi)} for one adult, or ${EN.eur(V.raja_useampi)} for more, add ${V.osuus}% of the excess to yearly income, and ${EN.eur(V.este)} or more rules you out. Kela must hear from you when household income goes up by ${EN.eur(M.nousu)} or down by ${EN.eur(M.lasku)} a month.`,
    faqs: [
      { q: 'Does Kela use my gross or net salary for housing allowance?', a: `Gross. Kela takes income before tax, counting holiday bonus, overtime, shift premiums and fringe benefits such as a company phone. Above the full-allowance threshold of ${EN.eur(TAYSI_YKSIN)} for a single person, each ${EN.eur(100)} of gross pay removes ${EN.eur(LEIKKURI)} of allowance, even though only part of that ${EN.eur(100)} reaches your account after tax.` },
      { q: 'What is the housing allowance income limit for a couple in 2026?', a: `For two adults without children, the allowance ends at ${EN.eur(TR[3].r[0])} of combined gross income a month in the capital-region group I, ${EN.eur(TR[3].r[1])} in group II towns such as Tampere and Turku, and ${EN.eur(TR[3].r[2])} elsewhere. These limits assume rent at least equal to the cap for your town; a cheaper flat stops the allowance earlier.` },
      { q: 'I have €30,000 in savings. Can I still get housing allowance?', a: `Yes, but less. Deposits are reduced by ${EN.eur(V.kayttovara_henkilo)} per person first. For a single adult, ${V.osuus}% of net assets above ${EN.eur(V.raja_yksi)} is added to yearly income and divided by twelve, so ${EN.eur(30000)} adds about ${EN.eur(r2((V.osuus / 100) * (30000 - V.kayttovara_henkilo - V.raja_yksi) / 12), 2)} a month to your income. Only net assets of ${EN.eur(V.este)} or more block the allowance completely.` },
      { q: 'Do I have to tell Kela about a pay rise while on housing allowance?', a: `Yes, if household income rises by ${EN.eur(M.nousu)} a month or more. Otherwise you would be overpaid: ${EN.eur(M.nousu)} more income means ${EN.eur(r2(M.nousu * LEIKKURI / 100))} less allowance each month. A drop of ${EN.eur(M.lasku)} or more should also be reported, and quickly, because back pay is limited to ${A.takautuvasti_kk} month.` },
      { q: 'Does interest on my savings account count as income for Kela?', a: `Only above ${EN.eur(A.korot_osingot_huomiotta_kk, 2)} a month per household member, and the same applies to dividends. Below that, Kela ignores it. Larger savings are mostly caught by the asset rule rather than the interest itself, so a big deposit earning little interest can still affect your allowance.` },
    ],
    body: (h) => `
<h2>The formula</h2>
<p>Kela’s calculation is allowance = ${h.num(A.tukiprosentti / 100, 1)} × (accepted housing costs − basic deductible). The deductible is ${h.num(O.kerroin, 1)} × [T − (${O.perus} + ${O.aikuinen} × A + ${O.lapsi} × L)], where T is the household’s gross monthly income, A the number of adults and L the number of children. The amounts are tied to the national pension index and are at 2026 level. Kela always counts at least one adult, and ignores a deductible below ${h.eur(O.huomiotta_alle)}.</p>
<p>Two consequences follow. A single person can earn ${h.eur(TAYSI_YKSIN)} a month without losing a cent of allowance. Above that, every euro of income costs ${h.num(LEIKKURI, 0)} cents of allowance, whether it is salary, unemployment benefit or pension.</p>
${h.table(['Gross income/month', 'Basic deductible', 'Allowance'], PORTAAT.map((x) => [h.eur(x.t), h.eur(x.r.perusomavastuu, 2), h.eur(x.r.tuki, 2)]), `Single person in Tampere, rent ${h.eur(VUOKRA)}, ${h.eur(PORTAAT[0].r.hyvaksytyt)} accepted, 2026`, ['l', 'r', 'r'])}
<p>Each ${h.eur(200)} step in the table removes the same ${h.eur(2 * LEIKKURI)}. Rent does not change the rate, because Tampere accepts only ${h.eur(PORTAAT[0].r.hyvaksytyt)} for one person either way.</p>
<h2>Kela’s 2026 income limits</h2>
<p>The income limit is the gross income at which the allowance drops below ${h.eur(A.pienin_maksettava)}, assuming housing costs at the cap for your town. Our engine reproduces Kela’s published table to the euro:</p>
${h.table(['Household', 'Group I (Helsinki)', 'Group II (Tampere)', 'Group III (Pori)'], TR.map((x) => [`${x.a} adult${x.a > 1 ? 's' : ''} + ${x.l} child${x.l === 1 ? '' : 'ren'}`, ...x.r.map((v) => h.eur(v))]), 'Housing allowance income limits, euros per month, 2026', ['l', 'r', 'r', 'r'])}
<p>If your rent is below the cap, the allowance runs out sooner, because the deductible eats through smaller costs faster.</p>
<h2>What Kela counts</h2>
<p>Income is always gross. It includes wages with taxable benefits, overtime, shift premiums and holiday bonus, general support and the earnings-related unemployment allowance, and most other benefits. Interest and dividends count above ${h.eur(A.korot_osingot_huomiotta_kk, 2)} a month. Child benefit, social assistance, child maintenance allowance, student loans and the student housing supplement do not count.</p>
<p>If your income has been steady for three months, Kela uses that monthly figure. If it varies, Kela adds up the income expected over the next ${h.num(12)} months and divides by ${h.num(12)}. Gig and seasonal workers should therefore estimate the whole year, not just the month they apply.</p>
<h2>Couples lose it faster</h2>
<p>In Kela’s own example, ${EE.nimi.replace(' ja ', ' and ')} live in ${EE.kunta} on ${h.eur(EE.tulot)} of combined gross income, with ${h.eur(EE.menot)} of housing costs. Their full-allowance threshold is ${h.eur(O.perus + 2 * O.aikuinen)}, the deductible is ${h.eur(EINO.perusomavastuu, 2)}, the cap is ${h.eur(EINO.enimmais)} and the allowance is ${h.eur(EINO.tuki, 2)} a month. The second adult raises the threshold by only ${h.eur(O.aikuinen)}, so moving in together usually cuts the allowance well below what two single people would get.</p>
<h2>Savings and other assets</h2>
<p>Assets are counted net of debts, and ${h.eur(V.kayttovara_henkilo)} per person is deducted from deposits as everyday money. Above ${h.eur(V.raja_yksi)} for one adult or ${h.eur(V.raja_useampi)} for more, ${V.osuus}% of the excess per year is added to income. A single person with ${h.eur(SAASTO)} in the bank has ${h.eur(NETTO_VARAT)} of counted assets, adding ${h.eur(VARAT_KK, 2)} a month to income. In Tampere, on ${h.eur(1200)} income and ${h.eur(VUOKRA)} rent, that takes the allowance from ${h.eur(ILMAN.tuki, 2)} to ${h.eur(VARALLINEN.tuki, 2)}. At ${h.eur(V.este)} of net assets there is no allowance.</p>
<h2>Out of work</h2>
<p>Unemployment often brings income close to the full-allowance level. A single person in Helsinki living on ${h.a('yleistuki', 'general support')} of ${h.eur(YT, 2)} a month with ${h.eur(700)} rent receives ${h.eur(YT_AT.tuki, 2)} of housing allowance, since the deductible is only ${h.eur(YT_AT.perusomavastuu, 2)}. Report the fall in income straight away: Kela pays back no more than ${A.takautuvasti_kk} month.</p>
<p>Students usually get the student housing supplement instead, and Kela excludes students who moved to Finland for their studies from housing allowance households altogether. For a low salary in context, see ${h.a('nettopalkka-2000', `net pay on ${h.eur(2000)}`)}. Try your own figures in the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}, or check your town’s cap under ${h.a('asumistuki-enimmaismenot', 'maximum housing costs')}.</p>
<p>Sources: ${h.src('kela_asumistuki_laskenta', 'Kela, how income and costs affect the allowance')} and ${h.src('kela_yleinen_asumistuki', 'Kela, general housing allowance')}.</p>`,
  },
});
