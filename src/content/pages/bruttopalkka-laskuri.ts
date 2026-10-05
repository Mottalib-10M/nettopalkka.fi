import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { bruttoNetosta, laskeVerot } from '../../lib/engine/vero';
import { HALVIN, KALLEIN } from '../../lib/esimerkit';

const V = P.vero;
const TT = V.tyotulovahennys;
const NETOT = [2000, 2500, 3000, 3500, 4000, 5000];
const KUNNAT_B = ['Helsinki', 'Tampere', HALVIN.nimi, KALLEIN.nimi];
/** Tarvittava bruttokuukausipalkka jokaiselle tavoitenetolle neljässä kunnassa (moottori, puolitushaku). */
const B: Record<string, number[]> = Object.fromEntries(KUNNAT_B.map((k) => [k, NETOT.map((n) => bruttoNetosta(n, { kunta: k }))]));
const HK = B.Helsinki, TR = B.Tampere;
const pros = (brutto: number, k: string) => laskeVerot({ tulo: brutto * 12, kunta: k }).veroprosentti;
/** Montako euroa bruttoa yksi lisäeuro nettoa vaatii kahden tavoitteen välillä (Helsinki). */
const LISA = NETOT.slice(1).map((n, i) => (HK[i + 1] - HK[i]) / (n - NETOT[i]));
const ALKU = LISA[0], LOPPU = LISA[LISA.length - 1];
const N3 = 2; // indeksi: 3 000 € netto
const EROKK = TR[N3] - HK[N3];
const MATKA = 3000;
const HK3M = bruttoNetosta(3000, { kunta: 'Helsinki', matkakulut: MATKA });
const L2 = bruttoNetosta(3000, { kunta: 'Helsinki', lapset: 2 });
const VAHV = HK[4] - HK[3];

export default definePage({
  id: 'bruttopalkka-laskuri',
  group: 'laskurit',
  order: 20,
  tool: 'brutto',
  related: ['marginaalivero', 'nettopalkka-3000', 'tyoelakemaksu', 'kuntavertailu'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat', 'vero_asteikko'],
  fi: {
    slug: 'bruttopalkka-laskuri',
    nav: 'Bruttopalkkalaskuri',
    card: 'Paljonko bruttopalkkaa tarvitset, jotta haluamasi nettosumma jää käteen kotikunnassasi.',
    title: 'Bruttopalkkalaskuri 2026: paljonko pyytää, että käteen jää',
    description: `Bruttopalkkalaskuri 2026: muuta haluttu nettopalkka bruttopalkaksi kotikuntasi verolla. Esimerkiksi ${FI.eur(3000)} käteen vaatii Helsingissä ${FI.eur(HK[N3])} bruttona.`,
    h1: 'Bruttopalkkalaskuri: nettopalkasta bruttoon',
    intro: 'Kirjoita summa, jonka haluat tilillesi kuukaudessa, niin laskuri kertoo palkkatoiveen, joka siihen tarvitaan.',
    resume: `Jotta helsinkiläiselle jäisi vuonna 2026 käteen ${FI.eur(3000)} kuukaudessa, bruttopalkan pitää olla noin ${FI.eur(HK[N3])}; Tampereella samaan nettoon tarvitaan ${FI.eur(TR[N3])}, koska kunnallisvero on siellä korkeampi. Laskuri tekee tavallisen palkkalaskelman takaperin: se hakee bruttosumman, josta vähennettyinä valtion vero, kunnallisvero, sairaanhoitomaksu, päivärahamaksu, Yle-vero, työeläkemaksu ${FI.p(V.tyoelakemaksu_prosentti)} ja työttömyysvakuutusmaksu ${FI.p(V.tyottomyysvakuutusmaksu_prosentti)} jää jäljelle juuri tavoittelemasi nettokuukausi. Nettona käytetään koko vuoden todellista nettotuloa jaettuna kahdellatoista, joten verokortin pyöristys ja veronpalautus eivät vääristä tulosta. Suhde ei ole suora: ensimmäinen ${FI.eur(500)} lisää nettoa ${FI.eur(2000)} tasolta maksaa noin ${FI.eur(ALKU * 500)} bruttona, mutta ${FI.eur(4000)} ja ${FI.eur(5000)} välillä jokainen nettoeuro vaatii jo noin ${FI.num(LOPPU, 2)} euroa palkkaa. Siksi palkkaneuvottelussa kannattaa laskea toive bruttona eikä lisätä nettotoiveeseen kiinteää prosenttia. Kotikunnan, kirkon jäsenyyden, lasten ja työmatkakulujen vaikutuksen voi kokeilla laskurin lisäasetuksista, ja tulos päivittyy heti.`,
    faqs: [
      { q: 'Paljonko bruttopalkkaa pitää pyytää, jotta käteen jää 3 000 euroa kuussa?', a: `Vuoden 2026 veroilla Helsingissä noin ${FI.eur(HK[N3])}, Tampereella ${FI.eur(TR[N3])}, korkeimman kunnallisveron kunnassa (${KALLEIN.nimi}) ${FI.eur(B[KALLEIN.nimi][N3])} ja matalimman veron kunnassa (${HALVIN.nimi}) ${FI.eur(B[HALVIN.nimi][N3])}, kun et kuulu kirkkoon etkä vähennä työmatkoja. Erot johtuvat pelkästään kunnallisverosta. Kirkon jäsenyys nostaa tarvittavaa bruttoa vielä hieman, ja lapset tai työmatkakulut laskevat sitä, koska ne pienentävät veroja.` },
      { q: 'Kannattaako palkkatoive ilmoittaa bruttona vai nettona?', a: `Bruttona, koska työnantaja sopii ja maksaa bruttopalkan, ja nettosi riippuu asioista, joihin työnantaja ei vaikuta: kotikunnasta, kirkon jäsenyydestä, lapsista ja vähennyksistä. Sama ${FI.eur(3000)} netto vaatii Tampereella noin ${FI.eur(EROKK)} kuukaudessa enemmän bruttoa kuin Helsingissä. Laske ensin tarvitsemasi netto, muunna se laskurilla bruttosummaksi ja pyöristä neuvotteluvaraa varten ylöspäin.` },
      { q: 'Miksi jokainen lisäeuro nettoa vaatii enemmän bruttoa?', a: `Valtion tuloveroasteikko on progressiivinen, ja ylimmässä portaassa marginaalivero on ${FI.p(V.valtion_asteikko[V.valtion_asteikko.length - 1].prosentti)}. Lisäksi työtulovähennys pienenee ${FI.p(TT.pienenemisprosentti, 0)} puhtaan ansiotulon ylittäessä ${FI.eur(TT.pienenemisraja)}. Helsingissä ${FI.eur(2000)} ja ${FI.eur(2500)} netto eroavat noin ${FI.eur(HK[1] - HK[0])} bruttona, mutta ${FI.eur(3500)} ja ${FI.eur(4000)} netto jo ${FI.eur(VAHV)}, vaikka nettoero on molemmissa ${FI.eur(500)}.` },
      { q: 'Onko lomaraha mukana laskurin bruttopalkassa?', a: `Ei ole. Laskuri olettaa kaksitoista samansuuruista palkkakuukautta, ja tulos on kuukausipalkka ilman lomarahaa, ylitöitä ja bonuksia. Jos työehtosopimuksesi lomaraha on esimerkiksi ${FI.p(P.vuosiloma.lomaraha_esimerkki_prosentti, 0)} lomapalkasta, vuoden nettotulosi on laskurin lupaamaa suurempi. Neuvottelussa palkkatoive tarkoittaa yleensä kuukausipalkkaa, jonka päälle lomaraha tulee erikseen. Tarkista siis ennen allekirjoitusta, mikä työehtosopimus työpaikalla on käytössä.` },
    ],
    body: (h) => `
<h2>Tavoitenetosta bruttopalkaksi neljässä kunnassa</h2>
<p>Taulukon luvut ovat laskurin omia: jokaiselle nettotavoitteelle on haettu bruttokuukausipalkka, jolla vuoden 2026 verojen ja maksujen jälkeen jää keskimäärin juuri tavoitesumma käteen. Oletuksena on työikäinen palkansaaja ilman kirkon jäsenyyttä, lapsia ja työmatkavähennystä. Manner-Suomen matalin kunnallisvero on kunnassa ${HALVIN.nimi} ja korkein kunnassa ${KALLEIN.nimi}, joten kaksi viimeistä saraketta näyttävät koko vaihteluvälin.</p>
${h.table(['Netto/kk', 'Helsinki', 'Tampere', HALVIN.nimi, KALLEIN.nimi], NETOT.map((n, i) => [h.eur(n), h.eur(HK[i]), h.eur(TR[i]), h.eur(B[HALVIN.nimi][i]), h.eur(B[KALLEIN.nimi][i])]), 'Tarvittava bruttopalkka kuukaudessa, vuoden 2026 verot, ei kirkkoa', ['l', 'r', 'r', 'r', 'r'])}
<p>Kuntien välinen ero kasvaa palkan mukana, koska kunnallisvero on tasavero: se otetaan samalla prosentilla koko verotettavasta tulosta. Kun nettotavoite on ${h.eur(5000)}, kalleimman ja halvimman kunnan ero on jo ${h.eur(B[KALLEIN.nimi][5] - B[HALVIN.nimi][5])} bruttoa kuukaudessa. Kaikkien kuntien prosentit löytyvät ${h.a('kuntavertailu', 'kunnallisveron vertailusta')}.</p>
<h2>Miksi nettopalkan nostaminen kallistuu</h2>
<p>Palkasta pidätetään aina ensin työntekijän maksut, jotka ovat suoraan suhteessa bruttoon. Verot sen sijaan kiristyvät portaittain: valtion asteikko alkaa ${h.num(V.valtion_asteikko[0].prosentti, 2)} prosentista ja nousee ${h.num(V.valtion_asteikko[V.valtion_asteikko.length - 1].prosentti, 2)} prosenttiin verotettavan tulon ylittäessä ${h.eur(V.valtion_asteikko[V.valtion_asteikko.length - 1].alaraja)}, ja työtulovähennys alkaa pienentyä puhtaan ansiotulon ylittäessä ${h.eur(TT.pienenemisraja)}. Laskurin tuloksista näkee, mitä se tarkoittaa käytännössä:</p>
${h.table(['Nettotavoitteen nousu', 'Lisäbrutto/kk', 'Bruttoa per nettoeuro'], NETOT.slice(1).map((n, i) => [`${h.eur(NETOT[i])} → ${h.eur(n)}`, h.eur(HK[i + 1] - HK[i]), h.num(LISA[i], 2)]), 'Helsinki, vuoden 2026 verot', ['l', 'r', 'r'])}
<p>Jos tavoittelet palkankorotusta, joka näkyy tilillä, kannattaa siis laskea, mihin veroportaaseen nykyinen palkkasi osuu. Rajaveroasteen voi tarkistaa ${h.a('marginaalivero', 'marginaaliverolaskelmasta')}.</p>
<h2>Palkkatoive työhakemukseen</h2>
<p>Moni työpaikkailmoitus pyytää kertomaan palkkatoiveen, ja vastaus annetaan Suomessa lähes aina bruttokuukausipalkkana. Hyvä toive syntyy kolmessa vaiheessa. Laske ensin, paljonko tarvitset tilille kuukaudessa asumiseen ja muihin menoihin. Muunna summa laskurilla bruttopalkaksi omassa kotikunnassasi. Vertaa tulosta alan palkkatasoon ja työehtosopimuksen taulukkoon, jos sellainen on. Jos olet muuttamassa toiselle paikkakunnalle työn perässä, laske toive uuden kunnan verolla: esimerkiksi Helsingistä Tampereelle muuttava tarvitsee samaan nettoon noin ${h.eur(EROKK)} enemmän bruttoa kuukaudessa.</p>
<h2>Mitä laskuri olettaa</h2>
<ul>
<li><strong>Netto on vuoden keskiarvo.</strong> Laskuri jakaa koko vuoden todellisen nettotulon kahdellatoista. Palkkakuitin netto voi poiketa siitä muutamalla eurolla, koska työnantaja pidättää veron verokortin ylöspäin pyöristetyllä prosentilla; erotus palautuu verotuksessa.</li>
<li><strong>Työntekijän maksut kuuluvat pidätyksiin.</strong> Työeläkemaksu ja työttömyysvakuutusmaksu vähennetään bruttopalkasta ennen nettoa. Niiden osuus on selitetty sivulla ${h.a('tyoelakemaksu', 'työeläkemaksu')}.</li>
<li><strong>Vähennykset muuttavat tulosta.</strong> Jos työmatkasi maksavat ${h.eur(MATKA)} vuodessa, ${h.eur(3000)} netto vaatii Helsingissä ${h.eur(HK3M)} eikä ${h.eur(HK[N3])}, koska omavastuun ${h.eur(V.matkakulut.omavastuu)} ylittävä osa vähennetään tulosta. Kaksi alaikäistä lasta laskee tarvittavan bruttopalkan ${h.eur(L2)} euroon työtulovähennyksen lapsikorotuksen ansiosta.</li>
<li><strong>Ei pääomatuloja eikä sivutuloja.</strong> Laskuri olettaa, että palkka on ainoa tulosi. Toisen työn, vuokratulon tai etuuden kanssa kokonaisverotus on toinen.</li>
</ul>
<p>Laskenta perustuu ${h.src('vero_ennakonpidatys', 'Verohallinnon ennakonpidätyspäätökseen vuodelle 2026')} ja ${h.src('vero_kunnat', 'kuntien vuoden 2026 tuloveroprosentteihin')}. Valmiiksi lasketun esimerkin yhdestä palkkatasosta löydät sivulta ${h.a('nettopalkka-3000', 'nettopalkka 3 000 euron bruttopalkasta')}.</p>`,
  },
  en: {
    slug: 'gross-salary-calculator',
    nav: 'Gross salary calculator',
    card: 'The gross salary you need in Finland to take home the net amount you have in mind.',
    title: 'Gross Salary Calculator Finland 2026: Net to Gross Pay',
    description: `Gross salary calculator Finland 2026: turn the net pay you want into the gross salary to ask for, using your municipality’s tax. ${EN.eur(3000)} net needs ${EN.eur(HK[N3])} gross.`,
    h1: 'Finnish gross salary calculator: from net to gross',
    intro: 'Type the amount you want in your bank account each month and get the gross salary expectation that delivers it.',
    resume: `To take home ${EN.eur(3000)} a month in Helsinki in 2026, you need a gross salary of about ${EN.eur(HK[N3])}; in Tampere the same net pay requires ${EN.eur(TR[N3])}, because the municipal tax rate there is higher. This calculator runs a Finnish payslip in reverse. It searches for the gross amount that leaves exactly your target after state income tax, municipal tax, the health care and daily allowance contributions, the Yle tax, the employee pension contribution (${EN.p(V.tyoelakemaksu_prosentti)}) and unemployment insurance (${EN.p(V.tyottomyysvakuutusmaksu_prosentti)}). Net pay here means your real net income for the whole year divided by twelve, so tax card rounding and refunds do not distort the answer. The relationship is not linear: going from ${EN.eur(2000)} to ${EN.eur(2500)} net costs about ${EN.eur(ALKU * 500)} of extra gross, but between ${EN.eur(4000)} and ${EN.eur(5000)} net, each extra euro in your pocket needs roughly ${EN.num(LOPPU, 2)} euros of salary. When a recruiter asks for your salary expectation (palkkatoive), quote it gross and work it out from the net figure you actually need.`,
    faqs: [
      { q: 'What gross salary do I need in Finland to take home €3,000 a month?', a: `With 2026 taxes, about ${EN.eur(HK[N3])} in Helsinki, ${EN.eur(TR[N3])} in Tampere, ${EN.eur(B[KALLEIN.nimi][N3])} in ${KALLEIN.nimi} and ${EN.eur(B[HALVIN.nimi][N3])} in ${HALVIN.nimi}, assuming no church membership and no commuting deduction. The whole spread comes from municipal tax. Church membership pushes the required gross slightly up; children and commuting costs pull it down because they cut your taxes.` },
      { q: 'Should I give my salary expectation in Finland as gross or net?', a: `Gross. Finnish employers agree and pay gross monthly salaries, and your net depends on things they do not control: where you live, church tax, children and deductions. The same ${EN.eur(3000)} net needs about ${EN.eur(EROKK)} more gross per month in Tampere than in Helsinki. Work out the net you need, convert it here, then round the gross figure up to leave room for negotiation.` },
      { q: 'Why does each extra euro of Finnish net pay cost more gross salary?', a: `The state income tax scale is progressive, reaching ${EN.p(V.valtion_asteikko[V.valtion_asteikko.length - 1].prosentti)} at the top, and the earned income tax credit shrinks by ${EN.p(TT.pienenemisprosentti, 0)} once net earned income passes ${EN.eur(TT.pienenemisraja)}. In Helsinki, moving from ${EN.eur(2000)} to ${EN.eur(2500)} net takes about ${EN.eur(HK[1] - HK[0])} more gross, while moving from ${EN.eur(3500)} to ${EN.eur(4000)} net takes ${EN.eur(VAHV)}.` },
      { q: 'Is the holiday bonus included in the gross salary result?', a: `No. The calculator assumes twelve equal monthly salaries, so the result is a base monthly salary without holiday bonus (lomaraha), overtime or bonuses. If your collective agreement pays a holiday bonus of, say, ${EN.p(P.vuosiloma.lomaraha_esimerkki_prosentti, 0)} of holiday pay, your yearly net will be higher than the calculator shows. In Finland a salary expectation normally refers to the monthly salary, with the holiday bonus on top.` },
    ],
    body: (h) => `
<h2>Gross pay needed in four municipalities</h2>
<p>Every figure below comes from the calculator itself: for each net target it found the gross monthly salary that leaves that amount on average after 2026 taxes and contributions. The profile is a working-age employee with no church membership, no children and no commuting deduction. ${HALVIN.nimi} has the lowest municipal tax in mainland Finland and ${KALLEIN.nimi} the highest, so the outer columns show the full range.</p>
${h.table(['Net/month', 'Helsinki', 'Tampere', HALVIN.nimi, KALLEIN.nimi], NETOT.map((n, i) => [h.eur(n), h.eur(HK[i]), h.eur(TR[i]), h.eur(B[HALVIN.nimi][i]), h.eur(B[KALLEIN.nimi][i])]), 'Gross monthly salary required, 2026 taxes, no church tax', ['l', 'r', 'r', 'r', 'r'])}
<p>The gap between towns widens as pay rises, because municipal tax is a flat rate on all taxable income. At a ${h.eur(5000)} net target, ${KALLEIN.nimi} needs ${h.eur(B[KALLEIN.nimi][5] - B[HALVIN.nimi][5])} more gross per month than ${HALVIN.nimi}. If you are choosing where to rent, the ${h.a('kuntavertailu', 'municipal tax rates table')} lists all of them.</p>
<h2>Why raising your net pay gets expensive</h2>
<p>Employee contributions are a fixed share of gross pay, but income tax climbs in steps. The state scale starts at ${h.num(V.valtion_asteikko[0].prosentti, 2)}% and reaches ${h.num(V.valtion_asteikko[V.valtion_asteikko.length - 1].prosentti, 2)}% on taxable income above ${h.eur(V.valtion_asteikko[V.valtion_asteikko.length - 1].alaraja)}, while the earned income tax credit (työtulovähennys) starts to fade above ${h.eur(TT.pienenemisraja)} of net earned income. Here is what that does to a Helsinki salary:</p>
${h.table(['Net target rises', 'Extra gross/month', 'Gross per net euro'], NETOT.slice(1).map((n, i) => [`${h.eur(NETOT[i])} → ${h.eur(n)}`, h.eur(HK[i + 1] - HK[i]), h.num(LISA[i], 2)]), 'Helsinki, 2026 taxes', ['l', 'r', 'r'])}
<p>So before negotiating a raise, check which tax bracket your current salary sits in. The ${h.a('marginaalivero', 'marginal tax rate page')} shows how much of the next hundred euros you keep.</p>
<h2>Assumptions behind the result</h2>
<ul>
<li><strong>Net is a yearly average.</strong> The tool divides your real annual net income by twelve. Your payslip can differ by a few euros, because the employer withholds at the tax card rate, which Vero rounds up; the difference returns as a refund.</li>
<li><strong>Employee contributions are deducted.</strong> The pension and unemployment insurance contributions come off gross pay before net. The ${h.a('tyoelakemaksu', 'pension contribution page')} explains the rate.</li>
<li><strong>Deductions lower the gross you need.</strong> With commuting costs of ${h.eur(MATKA)} a year, ${h.eur(3000)} net in Helsinki needs ${h.eur(HK3M)} instead of ${h.eur(HK[N3])}, since everything above the ${h.eur(V.matkakulut.omavastuu)} own share is deductible. Two children under 18 bring it to ${h.eur(L2)} through the child increase of the earned income credit.</li>
<li><strong>Salary is your only income.</strong> A second job, rental income or a benefit changes the total tax bill; the calculator does not include them.</li>
</ul>
<p>The calculation follows the ${h.src('vero_ennakonpidatys', 'Tax Administration’s 2026 withholding decision')} and the ${h.src('vero_kunnat', '2026 municipal tax rates')}. For a fully worked single example, see ${h.a('nettopalkka-3000', 'net pay from a €3,000 salary')}.</p>`,
  },
});
