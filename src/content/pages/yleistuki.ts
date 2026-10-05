import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { ansiopaivaraha, yleistukiKk } from '../../lib/engine/paivaraha';
import { laskeVerot } from '../../lib/engine/vero';
import { r2 } from '../../lib/engine/params';
import { asumistuki } from '../../lib/engine/asumistuki';

const T = P.tyottomyys;
const YV = T.yleistuki_vanhemmat;
const PV = T.yleistuki_pv;
const KK = yleistukiKk();
const ALKU = T.yleistuki_alkaen;
const KK_PV = T.tyopaivia_kuukaudessa;
const VK = T.paivia_viikossa;

/** Muut kuin palkkatulot: puolet rajan ylittävästä osasta vähennetään. */
const muuTulo = (tulo: number) => r2(Math.max(0, KK - Math.max(0, tulo - T.yleistuki_muut_tulot_raja_kk) * T.yleistuki_muut_tulot_vahennys / 100));
/** Vanhempien tulot: raja 2 500 € + 106 € / alaikäinen lapsi, puolet ylityksestä pois, vähintään 35 %. */
const vanhemmat = (tulot: number, lapsia: number) => {
  const raja = YV.tuloraja + YV.lapsikorotus * lapsia;
  const tuki = Math.max(KK * YV.vahintaan_prosentti / 100, KK - Math.max(0, tulot - raja) * YV.vahennys / 100);
  return { raja, tuki: r2(tuki) };
};
const LATTIA = r2(KK * YV.vahintaan_prosentti / 100);
const VUOKRA = 600, MUU = muuTulo(VUOKRA);
const V1 = vanhemmat(3600, 1), V2 = vanhemmat(5000, 0);
const VERO = laskeVerot({ tulo: KK * 12, kunta: 'Tampere', tulolaji: 'etuus' });
const NETTO_KK = r2((KK * 12 - VERO.verot) / 12);
const A26 = ansiopaivaraha(2600);
const OMAV = T.omavastuupaivat;
const AT = asumistuki({ kunta: 'Tampere', aikuiset: 1, lapset: 0, tulot: KK, vuokra: 600 });

export default definePage({
  id: 'yleistuki',
  group: 'tuet',
  order: 10,
  mini: 'yleistuki',
  related: ['ansiosidonnainen-laskuri', 'tyossaoloehto', 'asumistuki-laskuri', 'perusvahennys'],
  sources: ['kela_yleistuki', 'finlex_tyottomyysturva'],
  fi: {
    slug: 'yleistuki',
    nav: 'Yleistuki',
    card: 'Kelan uusi työttömyystuki: päivämäärä, kuukausisumma ja tulojen vaikutus.',
    title: 'Yleistuki 2026: määrä, tulorajat ja vanhempien tulot',
    description: `Yleistuki 2026 on ${FI.eur(PV, 2)}/pv eli keskimäärin ${FI.eur(KK)}/kk, ${VK} päivänä viikossa. Näin omat ja vanhempien tulot pienentävät tukea ja paljonko siitä jää käteen.`,
    h1: 'Yleistuki: Kelan työttömyystuki',
    intro: 'Kela maksaa yleistukea työttömälle, joka ei saa ansiosidonnaista päivärahaa työttömyyskassasta.',
    resume: `Yleistuki on ${FI.eur(PV, 2)} päivässä, ja kun sitä maksetaan ${VK} päivältä viikossa arkipyhät mukaan lukien, kuukausikertymä on keskimäärin ${FI.eur(KK, 2)}. Kela otti tuen käyttöön 1.5.2026, ja samana päivänä lakkautettiin sekä työmarkkinatuki että peruspäiväraha, joten työtön, jolla ei ole oikeutta kassan ansiopäivärahaan, hakee nyt yhtä tukea kahden sijaan. Täyden tuen saa, jos muut kuin palkkatulot, kuten vuokra- tai korkotulot, jäävät alle ${FI.eur(T.yleistuki_muut_tulot_raja_kk)} kuukaudessa; rajan ylittävästä osasta ${FI.num(T.yleistuki_muut_tulot_vahennys)} % vähennetään tuesta. Vanhempien luona asuvan nuoren tukeen vaikuttavat myös vanhempien tulot: raja on ${FI.eur(YV.tuloraja)} kuukaudessa, ja jokainen perheen alaikäinen lapsi nostaa sitä ${FI.eur(YV.lapsikorotus)}. Ylityksestä puolet pienentää tukea, mutta tuki ei laske alle ${FI.num(YV.vahintaan_prosentti)} prosentin täydestä määrästä. Alussa on ${OMAV} arkipäivän omavastuuaika. Yleistuki on veronalaista tuloa: Tampereella asuvalle, jolla ei ole muita tuloja, jää koko vuoden tuesta verojen jälkeen noin ${FI.eur(NETTO_KK)} kuukaudessa.`,
    faqs: [
      { q: 'Paljonko yleistuki on kuukaudessa verojen jälkeen?', a: `Täysi yleistuki on ${FI.eur(KK, 2)} kuukaudessa ennen veroja. Jos tuki on koko vuoden ainoa tulosi ja asut Tampereella, vuoden verot ja maksut ovat noin ${FI.eur(VERO.verot)}, joten käteen jää keskimäärin ${FI.eur(NETTO_KK)} kuukaudessa. Kunnallisvero ja kirkon jäsenyys muuttavat summaa hieman, ja muut tulot nostavat veroprosenttia.` },
      { q: 'Pienentävätkö vanhempieni tulot yleistukeani?', a: `Vain jos asut vanhempiesi luona. Tuki on täysi, kun vanhempien yhteiset tulot ovat enintään ${FI.eur(YV.tuloraja)} kuukaudessa, ja raja nousee ${FI.eur(YV.lapsikorotus)} jokaista perheen alaikäistä lasta kohti. Rajan ylittävästä osasta ${FI.num(YV.vahennys)} % vähennetään tuesta. Pienimmilläänkin tuki on ${FI.num(YV.vahintaan_prosentti)} % täydestä määrästä eli noin ${FI.eur(LATTIA)} kuukaudessa.` },
      { q: 'Vaikuttavatko vuokratulot yleistukeen?', a: `Vaikuttavat. Pääomatulot ja muut kuin palkkatulot otetaan huomioon, kun ne ylittävät ${FI.eur(T.yleistuki_muut_tulot_raja_kk)} kuukaudessa. Ylittävästä osasta puolet vähennetään tuesta. Esimerkiksi ${FI.eur(VUOKRA)} kuukausittainen vuokratulo pienentää täyttä tukea ${FI.eur(KK - MUU, 2)}, jolloin maksettavaksi jää ${FI.eur(MUU, 2)} kuukaudessa. Palkkatulot eivät kuulu tähän rajaan, sillä se koskee vain pääomatuloja ja muita kuin palkkatuloja, kuten vuokraa, korkoja ja osinkoja.` },
      { q: 'Maksetaanko yleistukea myös arkipyhiltä?', a: `Maksetaan. Kela maksaa yleistukea ${VK} päivältä viikossa, ja arkipyhät lasketaan maksupäiviksi samalla tavalla kuin tavalliset arkipäivät. Siksi kuukausisumma on tasaisesti noin ${FI.eur(KK, 2)}, joka saadaan kertomalla päivämäärä ${FI.eur(PV, 2)} luvulla ${FI.num(KK_PV, 1)}, eli kuukauden keskimääräisellä maksupäivien määrällä. Pitkä joulun ja loppiaisen jakso ei siis pienennä tuloja, vaikka moni työpaikka on silloin kiinni.` },
      { q: 'Mitä tapahtui työmarkkinatuelle ja peruspäivärahalle?', a: `Molemmat lakkautettiin 1.5.2026, ja niiden tilalle tuli yleistuki. Peruspäiväraha oli alkuvuonna ${FI.eur(PV, 2)} päivässä, eli päivämäärä pysyi samana. Kassan ansiopäivärahan perusosa on edelleen samansuuruinen ${FI.eur(T.perusosa_pv, 2)}, joten kassan jäsen saa aina vähintään yleistuen verran, kun hänen ehtonsa täyttyvät. Muutos koski vain Kelan tukia: työttömyyskassojen ansiopäiväraha jatkuu entisellään, ja sen perusosa on sidottu samaan päivämäärään.` },
      { q: 'Saako yleistukea heti ensimmäisestä työttömyyspäivästä?', a: `Ei saa. Tuen alussa on ${OMAV} arkipäivän omavastuuaika, jolta mitään ei makseta. Koska viikonloput eivät kuulu arkipäiviin, omavastuu kestää kalenterissa käytännössä puolitoista viikkoa. Osalla hakijoista on lisäksi ${T.yleistuki_odotusaika_viikkoa} viikon odotusaika. Ensimmäisen kuukauden tulot jäävät siksi selvästi alle ${FI.eur(KK)}, mikä kannattaa huomioida vuokranmaksussa.` },
      { q: 'Kannattaako työttömyyskassaan liittyä, jos yleistuki on olemassa?', a: `Ero on suuri, jos palkkasi on keskitasoa. ${FI.eur(2600)} kuukausipalkasta laskettu ansiopäiväraha on alussa noin ${FI.eur(A26.taysiKk)} kuukaudessa, kun yleistuki on ${FI.eur(KK)}. Ansiopäiväraha edellyttää kuitenkin ${T.tyossaoloehto_kk} kuukauden työssäoloehtoa, joten jäsenyys hyödyttää vasta, kun ehto on ehtinyt täyttyä.` },
    ],
    body: (h) => `
<h2>Yksi tuki kahden sijaan</h2>
<p>Ennen toukokuuta 2026 Kelan työttömyysturvassa oli kaksi rinnakkaista etuutta. Peruspäivärahaa sai työtön, joka oli täyttänyt työssäoloehdon mutta ei kuulunut työttömyyskassaan, ja työmarkkinatukea se, jolta työhistoria puuttui tai jonka ansiopäivärahan enimmäisaika oli täyttynyt. Kela lakkautti molemmat ${h.date(ALKU)} ja korvasi ne yleistuella. Päivän määrä ei muuttunut: alkuvuoden peruspäiväraha oli ${h.eur(PV, 2)}, ja yleistuki on täsmälleen saman suuruinen.</p>
<p>Käytännössä yleistukeen päätyy kolmenlainen hakija. Ensimmäinen on työtön, joka ei ole työttömyyskassan jäsen. Toinen on kassan jäsen, jonka ${h.a('tyossaoloehto', 'työssäoloehto')} ei vielä täyty. Kolmas on se, jonka ansiopäivärahan enimmäiskesto on käytetty loppuun; hänelle yleistuki on seuraava porras, kun ${h.a('ansiopaivarahan-kesto', 'ansiopäivärahan kesto')} tulee täyteen.</p>
<h2>Miten kuukausisumma muodostuu</h2>
<p>Tuki lasketaan päivinä, ei kuukausina. Viikossa maksupäiviä on ${VK}, ja Kela käyttää kuukauden keskiarvona lukua ${h.num(KK_PV, 1)}. Tästä tulee ${h.eur(KK, 2)} kuukaudessa. Kuukausi, jossa on enemmän arkipäiviä, tuottaa hieman suuremman maksun, mutta vuoden mittaan ero tasoittuu. Budjettia tehdessä kannattaa siksi käyttää keskiarvoa eikä yksittäisen maksuerän summaa, sillä helmikuun ja maaliskuun maksut voivat erota toisistaan useita kymppejä.</p>
${h.table(['Tilanne', 'Yleistuki kuukaudessa'], [
  ['Täysi tuki, ei muita tuloja', h.eur(KK, 2)],
  [`Vuokratuloa ${h.eur(VUOKRA)}/kk`, h.eur(MUU, 2)],
  [`Asuu vanhempien luona, heidän tulonsa ${h.eur(3600)}/kk, yksi alaikäinen sisarus`, h.eur(V1.tuki, 2)],
  [`Asuu vanhempien luona, heidän tulonsa ${h.eur(5000)}/kk, ei alaikäisiä`, h.eur(V2.tuki, 2)],
  [`Alin mahdollinen tuki (${h.num(YV.vahintaan_prosentti)} %)`, h.eur(LATTIA, 2)],
], 'Yleistuki 2026 eri tulotilanteissa, arvio ennen veroja', ['l', 'r'])}
<h2>Omat tulot: ${h.eur(T.yleistuki_muut_tulot_raja_kk)} raja</h2>
<p>Pääomatulot ja muut kuin palkkatulot, esimerkiksi vuokra, osingot tai korot, saavat olla enintään ${h.eur(T.yleistuki_muut_tulot_raja_kk)} kuukaudessa ilman että tuki pienenee. Rajan ylittävästä osasta ${h.num(T.yleistuki_muut_tulot_vahennys)} % vähennetään. Jos vuokraat asuntoa ${h.eur(VUOKRA)} kuukaudessa, ylitys on ${h.eur(VUOKRA - T.yleistuki_muut_tulot_raja_kk)} ja tuesta lähtee ${h.eur(KK - MUU, 2)}. Palkka ei kuulu tähän rajaan, koska raja koskee nimenomaan pääomatuloja ja muita kuin palkkatuloja.</p>
<h2>Vanhempien tulot ja ${h.num(YV.vahintaan_prosentti)} prosentin lattia</h2>
<p>Vanhempien luona asuvan nuoren tukeen vaikuttaa koko perheen tilanne. Kun vanhempien yhteenlasketut tulot ovat enintään ${h.eur(YV.tuloraja)} kuukaudessa, tuki maksetaan täytenä. Jokainen perheeseen kuuluva alaikäinen lapsi nostaa rajaa ${h.eur(YV.lapsikorotus)}. Rajan yli menevästä osasta puolet vähennetään tuesta, mutta vähennys pysähtyy, kun tuki on pudonnut ${h.num(YV.vahintaan_prosentti)} prosenttiin täydestä määrästä, eli noin ${h.eur(LATTIA, 2)} kuukaudessa.</p>
<p>Taulukon esimerkissä vanhemmat ansaitsevat yhteensä ${h.eur(3600)} ja perheessä on yksi alaikäinen sisarus, joten raja on ${h.eur(V1.raja)}. Ylitys puolitettuna vie tuesta ${h.eur(KK - V1.tuki, 2)}. Jos vanhempien tulot ovat ${h.eur(5000)} eikä kotona ole alaikäisiä, laskennallinen vähennys menisi lattian alle, ja tuki jää lattiatasolle. Muuttaminen omaan asuntoon poistaa vanhempien tulojen vaikutuksen, mutta silloin kannattaa tarkistaa myös ${h.a('asumistuki-laskuri', 'yleinen asumistuki')}, jossa yleistuki lasketaan ruokakunnan bruttotuloksi.</p>
<h2>Omavastuuaika ja odotusaika</h2>
<p>Tuen alussa on ${OMAV} arkipäivän omavastuuaika, jolta tukea ei makseta. Kela mainitsee lisäksi ${T.yleistuki_odotusaika_viikkoa} viikon odotusajan, joka koskee vain osaa hakijoista. Kela ratkaisee hakemuksen perusteella, kuuluuko sinun tilanteesi siihen, joten älä laske odotusaikaa omaan budjettiisi ennen päätöstä. Päätöksestä näet myös ensimmäisen maksupäivän.</p>
<h2>Yleistuki ja asumistuki samassa taloudessa</h2>
<p>Omassa vuokra-asunnossa asuva työtön hakee usein yleistuen rinnalle yleistä asumistukea. Kela laskee yleistuen asumistuessa ruokakunnan bruttotuloksi, joten tuki ei mene asumistuen laskelmassa nollaksi. Yksin asuva tamperelainen, jonka ainoa tulo on täysi yleistuki ja vuokra ${h.eur(600)}, saa yleistä asumistukea noin ${h.eur(AT.tuki, 2)} kuukaudessa. Laskelmassa vuokrasta hyväksytään enintään ${h.eur(AT.enimmais)}, ja perusomavastuu on ${h.eur(AT.perusomavastuu, 2)}. Yhteensä tuista kertyy ennen veroja noin ${h.eur(KK + AT.tuki)}, ja asumistuki on verotonta. Kuntaryhmien rajat löytyvät sivulta ${h.a('asumistuki-enimmaismenot', 'asumistuen enimmäisasumismenot')}.</p>
<h2>Verotus</h2>
<p>Yleistuesta maksetaan veroa, ja koska etuustulosta ei kerry työtulovähennystä, sen verotus on hieman ankarampi kuin samansuuruisen palkan. Koko vuoden täydellä tuella Tampereella vuoden verot ja maksut ovat noin ${h.eur(VERO.verot)}, eli verokortin prosentti olisi ${h.num(VERO.veroprosentti, 1)} %. Pienituloisella ${h.a('perusvahennys', 'perusvähennys')} pitää verot matalina. Jos tuen rinnalla on palkkaa tai vuokratuloa, tilaa uusi verokortti, ettei vuoden lopussa tule jäännösveroa.</p>
<h2>Yleistuki vai ansiopäiväraha</h2>
<p>Työttömyyskassa maksaa jäsenilleen ansiosidonnaista päivärahaa, jonka perusosa on sama ${h.eur(T.perusosa_pv, 2)} päivässä kuin yleistuki. Siihen lisätään ansio-osa, ${h.num(T.ansio_osa_prosentti)} % päiväpalkan ja perusosan erotuksesta. Sivun minilaskuri vertaa summia: ${h.eur(2600)} kuukausipalkalla ansiopäiväraha on alussa ${h.eur(A26.taysiKk)} kuukaudessa ja ${h.eur(A26.porras2Kk)} vielä porrastuksen jälkeenkin, kun yleistuki pysyy ${h.eur(KK)} tasolla. Tarkempi laskelma omalla palkallasi on ${h.a('ansiosidonnainen-laskuri', 'ansiopäivärahalaskurissa')}.</p>
<p>Lähteet: ${h.src('kela_yleistuki', 'Kela, yleistuki')} ja ${h.src('finlex_tyottomyysturva', 'työttömyysturvalaki 1290/2002')}.</p>`,
  },
  en: {
    slug: 'general-support-yleistuki',
    nav: 'General support (yleistuki)',
    card: 'Kela’s new flat-rate unemployment support: daily rate, monthly total and how income reduces it.',
    title: 'Yleistuki 2026: Finland’s New General Unemployment Support',
    description: `Yleistuki 2026 pays ${EN.eur(PV, 2)} a day, about ${EN.eur(KK)} a month, since 1 May 2026. How other income and your parents’ income reduce it, and how it compares with kassa pay.`,
    h1: 'Yleistuki: Kela’s general unemployment support',
    intro: 'Kela pays general support (yleistuki) to jobseekers who get no earnings-related allowance from an unemployment fund.',
    resume: `General support (yleistuki) pays ${EN.eur(PV, 2)} per day in 2026, five days a week including public holidays, which averages ${EN.eur(KK, 2)} a month before tax. Kela introduced it on 1 May 2026 and closed two older benefits on the same day, the labour market subsidy (työmarkkinatuki) and the basic unemployment allowance (peruspäiväraha). If you lose your job in Finland and are not a member of an unemployment fund (työttömyyskassa), or have not yet worked long enough to qualify for its pay, this is the benefit you apply for. Capital and non-wage income up to ${EN.eur(T.yleistuki_muut_tulot_raja_kk)} a month leaves it untouched; above that, half of the excess is deducted. Young people living with their parents also see their parents’ income tested against ${EN.eur(YV.tuloraja)} a month plus ${EN.eur(YV.lapsikorotus)} per minor child, though the support never falls below ${EN.num(YV.vahintaan_prosentti)}% of the full rate. The first ${OMAV} working days are unpaid. Yleistuki is taxable: with no other income in Tampere, roughly ${EN.eur(NETTO_KK)} a month remains after tax.`,
    faqs: [
      { q: 'How much is yleistuki per month after tax?', a: `The full rate is ${EN.eur(KK, 2)} a month gross. If it is your only income for the whole year and you live in Tampere, taxes and contributions come to about ${EN.eur(VERO.verot)} for the year, leaving roughly ${EN.eur(NETTO_KK)} a month. Your municipality, church membership and any extra income shift that figure, so order a tax card that matches the benefit.` },
      { q: 'Can I get yleistuki if I just arrived in Finland and never joined a kassa?', a: `Kela’s general support is the benefit for jobseekers without fund membership, so not being in a kassa does not by itself exclude you. Payment starts after ${OMAV} unpaid working days, and Kela also lists a ${T.yleistuki_odotusaika_viikkoa}-week waiting period that applies only in some situations. Kela decides your residence and eligibility from the application, so apply without waiting for your last salary to run out.` },
      { q: 'Does rental income from my flat abroad reduce yleistuki?', a: `Yes, if it counts as capital or non-wage income. The first ${EN.eur(T.yleistuki_muut_tulot_raja_kk)} a month is ignored and half of anything above is deducted. Renting out a flat for ${EN.eur(VUOKRA)} a month therefore cuts the support by ${EN.eur(KK - MUU, 2)}, leaving ${EN.eur(MUU, 2)}. Report the income to Kela even if it is taxed in another country.` },
      { q: 'Why did my son’s yleistuki drop when he moved back home?', a: `Because the support of a young person living with their parents is tested against the parents’ combined income. Above ${EN.eur(YV.tuloraja)} a month, raised by ${EN.eur(YV.lapsikorotus)} for every minor child in the family, half of the excess is deducted. The cut stops at ${EN.num(YV.vahintaan_prosentti)}% of the full rate, about ${EN.eur(LATTIA)} a month. Moving out removes the test.` },
      { q: 'How much more does a kassa pay than yleistuki?', a: `On a ${EN.eur(2600)} monthly salary, the earnings-related allowance starts at about ${EN.eur(A26.taysiKk)} a month and is still ${EN.eur(A26.porras2Kk)} after the second step-down, against ${EN.eur(KK)} of yleistuki. The fund only pays once you meet its ${T.tyossaoloehto_kk}-month employment condition, which is why joining early, with your first Finnish job, matters.` },
    ],
    body: (h) => `
<h2>What changed on 1 May 2026</h2>
<p>Until the end of April 2026 Kela ran two separate unemployment benefits. The basic allowance (peruspäiväraha) went to people who had worked enough but were not in a fund, and the labour market subsidy (työmarkkinatuki) covered those with no qualifying work history or whose earnings-related days had run out. On ${h.date(ALKU)} both disappeared and general support took their place. The daily amount did not move: the basic allowance had been ${h.eur(PV, 2)} in early 2026 and yleistuki pays the same.</p>
<p>For a foreign worker this mostly simplifies things. There is one Kela form instead of two, and the question is no longer which benefit fits your history but if anything comes on top from an unemployment fund. That top-up is the earnings-related allowance, and it depends on fund membership and the ${h.a('tyossaoloehto', 'employment condition')}.</p>
<h2>From a daily rate to a monthly figure</h2>
<p>Kela calculates in days. It pays ${VK} days a week and counts public holidays as paid days, so the month is treated as ${h.num(KK_PV, 1)} paid days on average. That gives ${h.eur(KK, 2)}. Months with more weekdays pay a little more, months with fewer pay a little less.</p>
${h.table(['Your situation', 'Support per month'], [
  ['Full rate, no other income', h.eur(KK, 2)],
  [`Rental income of ${h.eur(VUOKRA)}/month`, h.eur(MUU, 2)],
  [`Living with parents earning ${h.eur(3600)}/month, one minor sibling`, h.eur(V1.tuki, 2)],
  [`Living with parents earning ${h.eur(5000)}/month, no minors`, h.eur(V2.tuki, 2)],
  [`Lowest possible amount (${h.num(YV.vahintaan_prosentti)}%)`, h.eur(LATTIA, 2)],
], 'General support 2026 in different income situations, before tax', ['l', 'r'])}
<h2>Your own non-wage income</h2>
<p>Interest, dividends, rent and other income that is not salary is free up to ${h.eur(T.yleistuki_muut_tulot_raja_kk)} a month. Kela deducts ${h.num(T.yleistuki_muut_tulot_vahennys)}% of everything above that line. Expats often keep a flat in their home country: if it brings in ${h.eur(VUOKRA)} a month, the excess is ${h.eur(VUOKRA - T.yleistuki_muut_tulot_raja_kk)} and the support falls by ${h.eur(KK - MUU, 2)}. Wages sit outside this limit: it covers only capital income and income other than pay.</p>
<h2>The parental income test</h2>
<p>A young adult who lives in the family home has the parents’ combined income counted. The limit is ${h.eur(YV.tuloraja)} a month, plus ${h.eur(YV.lapsikorotus)} for each minor child in the household. Half of what the parents earn above that limit comes off the support. The deduction can never take it below ${h.num(YV.vahintaan_prosentti)}% of the full rate, about ${h.eur(LATTIA, 2)} a month.</p>
<p>In the table, parents earning ${h.eur(3600)} with one younger child at home face a limit of ${h.eur(V1.raja)}, and half the excess costs ${h.eur(KK - V1.tuki, 2)} a month. With ${h.eur(5000)} of parental income and no minors, the formula would go below the floor, so the floor applies. Once the young person moves into their own place the test ends, and Kela’s ${h.a('asumistuki-laskuri', 'general housing allowance')} becomes relevant, where yleistuki itself counts as gross household income.</p>
<h2>Unpaid days at the start</h2>
<p>The first ${OMAV} working days of unemployment are a waiting period with no payment (omavastuuaika). Kela also refers to a longer ${T.yleistuki_odotusaika_viikkoa}-week waiting period (odotusaika) that applies only to some applicants. Kela decides whether it applies to you when it processes the claim, so check the decision letter before planning your budget around the first payment.</p>
<h2>Stacking it with the housing allowance</h2>
<p>If you rent your own place, Kela’s general housing allowance (yleinen asumistuki) can run alongside yleistuki. The housing calculation treats yleistuki as gross household income, but at this level the deductible stays small. A single person in Tampere paying ${h.eur(600)} in rent, with full yleistuki as the only income, gets about ${h.eur(AT.tuki, 2)} of housing allowance a month: Kela accepts at most ${h.eur(AT.enimmais)} of that rent and the basic deductible is ${h.eur(AT.perusomavastuu, 2)}. Together that is roughly ${h.eur(KK + AT.tuki)} before tax, and the housing part is tax-free. Rent caps by town are on the ${h.a('asumistuki-enimmaismenot', 'housing allowance maximum costs')} page.</p>
<h2>Tax on general support</h2>
<p>Yleistuki is taxable income. Benefits do not earn the earned income tax credit that wages do, so the same gross euros are taxed a little more heavily than pay. A full year on the benefit in Tampere means about ${h.eur(VERO.verot)} in taxes and contributions, a tax card rate of ${h.num(VERO.veroprosentti, 1)}%. At this income the ${h.a('perusvahennys', 'basic deduction')} does most of the work. If you also earn wages or rent, order a revised tax card through MyTax so the year does not end with residual tax.</p>
<h2>Comparing with an unemployment fund</h2>
<p>An unemployment fund pays its members the earnings-related allowance. Its base part equals yleistuki at ${h.eur(T.perusosa_pv, 2)} a day; on top comes ${h.num(T.ansio_osa_prosentti)}% of whatever your daily wage exceeds that base. The mini calculator above runs the comparison: on ${h.eur(2600)} a month the fund pays ${h.eur(A26.taysiKk)} at first and ${h.eur(A26.porras2Kk)} after the step-downs, while general support stays at ${h.eur(KK)}. Run your own salary through the ${h.a('ansiosidonnainen-laskuri', 'unemployment allowance calculator')}.</p>
<p>Sources: ${h.src('kela_yleistuki', 'Kela, general support')} and ${h.src('finlex_tyottomyysturva', 'Unemployment Security Act 1290/2002')}.</p>`,
  },
});
