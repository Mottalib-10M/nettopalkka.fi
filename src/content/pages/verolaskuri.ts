import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, lisaprosentti, type VeroInput } from '../../lib/engine/vero';
import { kotitalousvahennys } from '../../lib/engine/kotitalous';

const V = P.vero, KT = P.kotitalousvahennys;
const TULO = 45000;
const JASEN = 500, MATKA = 2500, TYO = 3000;
/** Sama logiikka kuin VeroLaskuri-komponentissa: kotitalousvähennys veroista, ei Yle-verosta eikä päivärahamaksusta. */
function laske(extra: Partial<VeroInput>, kotityo = 0) {
  const v = laskeVerot({ tulo: TULO, kunta: 'Helsinki', ...extra });
  const kt = Math.min(kotitalousvahennys({ tyoYritys: kotityo }).vahennys, Math.max(0, v.verot - v.yle - v.paivarahamaksu));
  return { v, kt, lopullinen: v.verot - kt };
}
const PERUS = laske({});
/** Ennakonpidätys koko vuodelta verokortin prosentilla, kun vähennyksiä ei ole ilmoitettu verokorttiin. */
const PID = TULO * PERUS.v.veroprosentti / 100;
const S = [
  { fi: 'Ei vähennyksiä', en: 'No deductions', r: PERUS },
  { fi: `Jäsenmaksut ${FI.eur(JASEN)}`, en: `Union and fund fees ${EN.eur(JASEN)}`, r: laske({ jasenmaksut: JASEN }) },
  { fi: `Työmatkat ${FI.eur(MATKA)}`, en: `Commuting ${EN.eur(MATKA)}`, r: laske({ matkakulut: MATKA }) },
  { fi: `Kotitaloustyö ${FI.eur(TYO)}`, en: `Household work ${EN.eur(TYO)}`, r: laske({}, TYO) },
  { fi: 'Kaikki kolme', en: 'All three', r: laske({ jasenmaksut: JASEN, matkakulut: MATKA }, TYO) },
];
const KAIKKI = S[4].r;
const JASENHYOTY = PERUS.lopullinen - S[1].r.lopullinen;
/** Palkankorotus: verokortti tilattiin 30 000 euron tulolle, mutta palkkaa kertyi 45 000 euroa (lisäprosentti tulorajan yli). */
const ARVIO = 30000;
const VANHA = laskeVerot({ tulo: ARVIO, kunta: 'Helsinki' });
const LISA = lisaprosentti(VANHA);
const PID_YLI = ARVIO * VANHA.veroprosentti / 100 + (TULO - ARVIO) * LISA / 100;
const YLI_ERO = PID_YLI - PERUS.lopullinen;

export default definePage({
  id: 'verolaskuri',
  group: 'laskurit',
  order: 30,
  tool: 'verolaskuri',
  related: ['veronpalautus', 'matkakulut', 'kotitalousvahennys-laskuri', 'veroprosenttilaskuri'],
  sources: ['vero_ennakonpidatys', 'vero_veroperusteet', 'vero_kotitalous'],
  fi: {
    slug: 'verolaskuri',
    nav: 'Verolaskuri',
    card: 'Koko vuoden lopulliset verot vähennyksineen ja arvio veronpalautuksesta tai jäännösverosta.',
    title: 'Verolaskuri 2026: veronpalautus vai jäännösvero palkasta',
    description: `Verolaskuri 2026: laske palkan lopulliset verot jäsenmaksujen, työmatkojen ja kotitalousvähennyksen jälkeen ja vertaa pidätykseen. Palautus vai jäännösvero?`,
    h1: 'Verolaskuri: veronpalautus tai jäännösvero',
    intro: 'Syötä vuoden palkkatulot, palkasta pidätetty vero ja vähennykset, niin näet, palautuuko rahaa vai joudutko maksamaan lisää.',
    resume: `Kun palkkaa kertyy vuonna 2026 ${FI.eur(TULO)} ja asut Helsingissä, lopulliset verot ja maksut ovat ${FI.eur(PERUS.lopullinen, 2)}, mutta verokortin ${FI.num(PERUS.v.veroprosentti, 1)} prosentilla palkasta pidätetään ${FI.eur(PID, 2)}; erotus ${FI.eur(PID - PERUS.lopullinen, 2)} palautuu veronpalautuksena. Palautus kasvaa, kun ilmoitat verotuksessa vähennyksiä, joita verokortti ei tiennyt: ${FI.eur(JASEN)} ammattiliiton ja työttömyyskassan jäsenmaksuja, ${FI.eur(MATKA)} työmatkakuluja ja ${FI.eur(TYO)} kotitalousvähennykseen oikeuttavaa työtä nostavat samassa esimerkissä palautuksen ${FI.eur(PID - KAIKKI.lopullinen)} suuruiseksi. Jäännösvero syntyy päinvastaisessa tilanteessa, kun osasta vuoden tuloista ei pidätetty veroa lainkaan tai verokorttiin ilmoitettiin vähennyksiä, joita ei lopulta syntynyt. Palkankorotus ei yleensä aiheuta jäännösveroa, koska tulorajan ylittävästä palkasta pidätetään reilusti suurempi lisäprosentti. Verolaskuri laskee ensin lopullisen veron samoilla vuoden 2026 perusteilla kuin Verohallinto, vähentää kotitalousvähennyksen ja vertaa tulosta siihen ennakonpidätykseen, jonka syötät palkkalaskelmista tai OmaVerosta. Työeläke- ja työttömyysvakuutusmaksua ei lasketa pidätykseen, koska ne eivät palaudu.`,
    faqs: [
      { q: 'Miksi saan pienen veronpalautuksen, vaikka en ilmoittanut vähennyksiä?', a: `Verohallinto pyöristää ennakonpidätysprosentin ylöspäin puolen prosenttiyksikön tarkkuudella, joten oikeallakin verokortilla pidätetään yleensä hieman yli lopullisen veron. ${FI.eur(TULO)} palkalla Helsingissä ero on ${FI.eur(PID - PERUS.lopullinen, 2)}. Suuremmat palautukset syntyvät vähennyksistä, joita ei ollut verokortissa, sekä tilanteista, joissa vuoden tulot jäivät arvioitua pienemmiksi. Laskurin kenttiin voi kokeilla, miten kukin vähennys muuttaa summaa.` },
      { q: 'Lasketaanko työeläkemaksu ennakonpidätykseen verolaskurissa?', a: `Ei lasketa. Syötä kenttään vain palkasta pidätetty vero, jonka näet palkkalaskelmasta tai OmaVerosta. Työeläkemaksu ${FI.p(V.tyoelakemaksu_prosentti)} ja työttömyysvakuutusmaksu ${FI.p(V.tyottomyysvakuutusmaksu_prosentti)} ovat lopullisia maksuja, joita ei palauteta, vaikka ne vähennetään verotuksessa tulosta. Jos lasket ne mukaan, laskuri näyttää palautusta, jota et koskaan saa. Palkkalaskelmassa nämä maksut näkyvät yleensä omilla riveillään veron alapuolella.` },
      { q: 'Paljonko 500 euron ammattiliiton jäsenmaksu pienentää veroja?', a: `Jäsenmaksu vähennetään ansiotulosta, joten säästö riippuu rajaveroasteestasi. ${FI.eur(TULO)} palkalla Helsingissä ${FI.eur(JASEN)} jäsenmaksut pienentävät veroja ${FI.eur(JASENHYOTY, 2)}, eli noin ${FI.num(JASENHYOTY / JASEN * 100, 0)} senttiä jokaisesta eurosta. Työttömyyskassan maksu vähennetään samalla tavalla. Pienemmällä palkalla hyöty on pienempi, koska rajavero on matalampi. Jos jäsenmaksuja ei ilmoitettu verokorttiin, säästö näkyy vasta palautuksessa.` },
      { q: 'Miten verolaskuri käsittelee kotitalousvähennyksen?', a: `Kotitalousvähennys on vähennys veroista eikä tulosta. Laskuri ottaa työn osuudesta ${FI.p(KT.voimassa.yritys_prosentti, 0)}, vähentää ${FI.eur(KT.voimassa.omavastuu)} omavastuun ja rajaa tuloksen ${FI.eur(KT.voimassa.enimmaismaara)} enimmäismäärään. Vähennys tehdään muista veroista kuin Yle-verosta ja päivärahamaksusta, eikä se voi ylittää niitä. ${FI.eur(TYO)} työn osuus antaa ${FI.eur(S[3].r.kt)} vähennyksen, joka näkyy palautuksessa täysimääräisenä, jos sitä ei ollut ilmoitettu verokorttiin.` },
      { q: 'Riittääkö lisäprosentti, kun palkka nousee yli verokortin tulorajan?', a: `Yleensä riittää ja ylikin. Jos verokortti tilattiin ${FI.eur(ARVIO)} tulolle (prosentti ${FI.num(VANHA.veroprosentti, 1)}, lisäprosentti ${FI.num(LISA, 1)}) ja palkkaa kertyi ${FI.eur(TULO)}, Helsingissä pidätetään vuoden aikana ${FI.eur(PID_YLI, 2)} ja lopullinen vero on ${FI.eur(PERUS.lopullinen, 2)}, joten palautusta tulee ${FI.eur(YLI_ERO, 2)}. Raha on kuitenkin ollut valtiolla korotta, joten uusi verokortti kannattaa tilata.` },
    ],
    body: (h) => `
<h2>Viisi esimerkkiä samasta palkasta</h2>
<p>Alla on sama ${h.eur(TULO)} vuosipalkka Helsingissä ilman kirkon jäsenyyttä. Ennakonpidätys on joka rivillä ${h.eur(PID, 2)}, koska verokortti laskettiin ilman vähennyksiä. Vähennykset ilmoitetaan vasta verotuksessa, ja ne näkyvät kokonaan palautuksessa.</p>
${h.table(['Tilanne', 'Lopulliset verot', 'Pidätetty', 'Palautus'], S.map((x) => [x.fi, h.eur(x.r.lopullinen, 2), h.eur(PID, 2), h.eur(PID - x.r.lopullinen, 2)]), `Palkkatulo ${h.eur(TULO)}, Helsinki, vuosi 2026`, ['l', 'r', 'r', 'r'])}
<p>Työmatkavähennys on esimerkeistä tehokkain, koska koko omavastuun ${h.eur(V.matkakulut.omavastuu)} ylittävä osa vähennetään tulosta ja säästö lasketaan rajaveroprosentilla. Kotitalousvähennys taas vähennetään suoraan veroista, joten ${h.eur(TYO)} remontti- tai siivoustyöstä palautuu euromääräisesti saman verran tulotasosta riippumatta, kunhan veroja on riittävästi.</p>
<h2>Kun tulot muuttuivat kesken vuoden</h2>
<p>Palkankorotus näkyy verotuksessa harvoin jäännösverona. Kun palkka ylittää verokortin tulorajan, työnantaja alkaa pidättää ylittävästä osasta lisäprosenttia, joka on vähintään kaksi prosenttiyksikköä perusprosenttia suurempi ja usein paljon enemmän. Esimerkiksi ${h.eur(ARVIO)} tulolle tilattu verokortti antaa Helsingissä lisäprosentiksi ${h.num(LISA, 1)} %, ja kun palkkaa kertyy lopulta ${h.eur(TULO)}, liikaa pidätettyä veroa on ${h.eur(YLI_ERO, 2)}. Laskurissa tämän näkee syöttämällä toteutuneen pidätyksen sellaisenaan.</p>
<p>Jäännösveron riski on suurempi, jos osa tuloista tuli ilman ennakonpidätystä, esimerkiksi vuokrana tai ulkomailta maksettuna palkkana, tai jos verokorttiin merkittiin työmatkakuluja, joita ei lopulta syntynyt. Silloin syötä laskuriin kaikki palkkatulot ja vain se vero, joka niistä todella pidätettiin.</p>
<h2>Miten lopullinen vero lasketaan</h2>
<p>Laskuri kulkee samaa reittiä kuin verotus. Palkasta vähennetään ensin tulonhankkimisvähennys ${h.eur(V.tulonhankkimisvahennys)}, työmatkakulujen omavastuun ylittävä osa ja jäsenmaksut, jolloin saadaan puhdas ansiotulo. Siitä vähennetään työeläke-, työttömyysvakuutus- ja päivärahamaksu sekä perusvähennys. Jäljelle jäävästä verotettavasta tulosta lasketaan valtion vero, kunnallisvero, mahdollinen kirkollisvero ja sairaanhoitomaksu ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)} %. Työtulovähennys pienentää valtionveroa, Yle-vero lisätään ja lopuksi kotitalousvähennys vähennetään. Maksujen prosentit on koottu ${h.src('vero_veroperusteet', 'Verohallinnon veroperusteisiin vuodelle 2026')}.</p>
<h2>Vähennykset, jotka laskuri tuntee</h2>
<ul>
<li><strong>Ammattiliiton ja työttömyyskassan jäsenmaksut</strong> vähennetään kokonaan ansiotulosta.</li>
<li><strong>Työmatkakulut</strong> halvimman kulkuneuvon mukaan, omavastuu ${h.eur(V.matkakulut.omavastuu)} ja enimmäismäärä ${h.eur(V.matkakulut.enimmaismaara)} vuodessa; omalla autolla ${h.num(V.matkakulut.oma_auto_euroa_km, 2)} €/km, kun auton käyttö hyväksytään. Hallitus on esittänyt omavastuun laskemista ${h.eur(KT.esitys_matkakulut_omavastuu)} euroon, mutta laskuri käyttää voimassa olevaa lakia. Tarkemmin sivulla ${h.a('matkakulut', 'matkakulujen verovähennys')}.</li>
<li><strong>Kotitalousvähennys</strong> yritykseltä ostetusta työstä voimassa olevan lain mukaan. Puolisoiden jako ja korotusesitys löytyvät ${h.a('kotitalousvahennys-laskuri', 'kotitalousvähennyksen laskurista')}.</li>
<li><strong>Lapset ja ikä</strong> lisäasetuksissa: alaikäiset lapset korottavat työtulovähennystä ${h.eur(V.tyotulovahennys.lapsikorotus)} lasta kohden.</li>
</ul>
<h2>Ennen kuin luotat tulokseen</h2>
<p>Laskuri ei tunne pääomatuloja, alijäämähyvitystä, opintolainavähennystä, tulonhankkimiskuluja eikä etuuksia, joista vero lasketaan eri tavalla. Jos sinulla on niitä, tulos on suuntaa antava. Vertaa lukuja OmaVerossa julkaistavaan esitäytettyyn veroilmoitukseen ja korjaa siihen puuttuvat vähennykset. Pidätetyn veron kokonaismäärä on myös palkkakuitissa tai vuoden viimeisessä palkkalaskelmassa. Palautuksen ja jäännösveron syyt käydään läpi sivulla ${h.a('veronpalautus', 'veronpalautus ja jäännösvero')}, ja ensi vuoden verokortin prosentin voi tarkistaa ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurilla')}.</p>`,
  },
  en: {
    slug: 'tax-refund-calculator',
    nav: 'Tax refund calculator',
    card: 'Your final Finnish income tax for the year with deductions, and an estimate of your refund or residual tax.',
    title: 'Tax Refund Calculator Finland 2026: Refund or Residual Tax',
    description: `Tax refund calculator Finland 2026: work out the final tax on your salary after union fees, commuting and the household credit, and compare with withholding.`,
    h1: 'Finnish tax refund calculator 2026',
    intro: 'Enter your salary for the year, the tax withheld from it and your deductions to see whether money comes back or you owe more.',
    resume: `With a 2026 salary of ${EN.eur(TULO)} in Helsinki, your final taxes and contributions come to ${EN.eur(PERUS.lopullinen, 2)}, while your employer withholds ${EN.eur(PID, 2)} at your ${EN.num(PERUS.v.veroprosentti, 1)}% tax card rate, so ${EN.eur(PID - PERUS.lopullinen, 2)} comes back as a tax refund (veronpalautus). The refund grows when you claim deductions your tax card did not know about: in the same example, ${EN.eur(JASEN)} of trade union and unemployment fund fees, ${EN.eur(MATKA)} of commuting costs and ${EN.eur(TYO)} of household work lift it to ${EN.eur(PID - KAIKKI.lopullinen)}. Residual tax (jäännösvero) is the opposite case: part of your income had no tax withheld, or your card included deductions that never happened. A pay rise rarely causes it, because pay above the income limit is withheld at a much higher additional rate. The calculator first works out your final tax with the same 2026 rules Vero uses, subtracts the household tax credit and then compares the result with the tax withheld that you enter from your payslips or MyTax (OmaVero). Leave out the pension and unemployment insurance contributions: they are final and never refunded.`,
    faqs: [
      { q: 'Why do I get a small Finnish tax refund without claiming anything?', a: `Vero rounds the withholding rate up to the next half percentage point, so even a correct tax card withholds slightly more than your final tax. On ${EN.eur(TULO)} in Helsinki the difference is ${EN.eur(PID - PERUS.lopullinen, 2)}. Larger refunds come from deductions that were not on your card, or from a year in which you earned less than the income limit you gave.` },
      { q: 'Do I include the pension contribution in the tax withheld field?', a: `No. Enter only the income tax withheld, which appears on your payslip and in MyTax. The pension contribution (${EN.p(V.tyoelakemaksu_prosentti)}) and unemployment insurance (${EN.p(V.tyottomyysvakuutusmaksu_prosentti)}) are final payments: they are deducted from your taxable income but never paid back. Adding them to the field would show a refund you will not receive.` },
      { q: 'How much does a €500 union fee cut my tax in Finland?', a: `Union and unemployment fund fees are deducted from earned income, so the saving equals your marginal rate. On ${EN.eur(TULO)} in Helsinki, ${EN.eur(JASEN)} of fees reduce tax by ${EN.eur(JASENHYOTY, 2)}, about ${EN.num(JASENHYOTY / JASEN * 100, 0)} cents per euro. On a lower salary the saving is smaller, because the marginal rate is lower. Membership of a kassa also gives you the right to earnings-related unemployment allowance.` },
      { q: 'How does the calculator apply the household tax credit?', a: `The household credit (kotitalousvähennys) comes off your taxes, not your income. The tool takes ${EN.p(KT.voimassa.yritys_prosentti, 0)} of the labour cost, subtracts the ${EN.eur(KT.voimassa.omavastuu)} deductible and caps the result at ${EN.eur(KT.voimassa.enimmaismaara)}. It is applied to taxes other than the Yle tax and the daily allowance contribution and cannot exceed them. ${EN.eur(TYO)} of labour gives a ${EN.eur(S[3].r.kt)} credit.` },
      { q: 'Will a pay rise above my income limit leave me with residual tax?', a: `Usually not. Pay above the income limit (tuloraja) is withheld at the additional rate, which tends to overshoot. With a card ordered for ${EN.eur(ARVIO)} (rate ${EN.num(VANHA.veroprosentti, 1)}%, additional rate ${EN.num(LISA, 1)}%) and ${EN.eur(TULO)} actually earned in Helsinki, ${EN.eur(PID_YLI, 2)} is withheld against a final tax of ${EN.eur(PERUS.lopullinen, 2)}: a ${EN.eur(YLI_ERO, 2)} refund. That money sat with the state interest-free, so a revised card is still worth ordering.` },
    ],
    body: (h) => `
<h2>Five versions of the same salary</h2>
<p>Each row uses ${h.eur(TULO)} of salary in Helsinki, no church tax, with ${h.eur(PID, 2)} withheld because the tax card was calculated without deductions. Deductions are only claimed in the tax assessment, so they show up in full in the refund.</p>
${h.table(['Situation', 'Final tax', 'Withheld', 'Refund'], S.map((x) => [x.en, h.eur(x.r.lopullinen, 2), h.eur(PID, 2), h.eur(PID - x.r.lopullinen, 2)]), `Salary ${h.eur(TULO)}, Helsinki, 2026`, ['l', 'r', 'r', 'r'])}
<p>Commuting gives the biggest return here because everything above the ${h.eur(V.matkakulut.omavastuu)} own share is deducted from income, saving tax at your marginal rate. The household credit works differently: it is subtracted from tax itself, so ${h.eur(TYO)} of renovation or cleaning labour returns the same amount at any income level, as long as you pay enough tax to absorb it.</p>
<h2>How the final tax is worked out</h2>
<p>The tool follows the order of the Finnish assessment. From salary it subtracts the automatic ${h.eur(V.tulonhankkimisvahennys)} work-expense deduction, commuting costs above the own share and membership fees to reach net earned income. Then come the pension, unemployment insurance and daily allowance contributions and the basic deduction. On the taxable income left it applies state tax, municipal tax, any church tax and the ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)}% health care contribution. The earned income credit reduces state tax, the Yle tax is added and the household credit comes off last. All 2026 rates are listed in ${h.src('vero_veroperusteet', 'Vero’s 2026 tax bases')}.</p>
<h2>Deductions the calculator handles</h2>
<ul>
<li><strong>Trade union and unemployment fund (kassa) fees</strong>, deducted in full from earned income.</li>
<li><strong>Commuting costs</strong> by the cheapest means of transport, with a ${h.eur(V.matkakulut.omavastuu)} own share and a ${h.eur(V.matkakulut.enimmaismaara)} yearly cap; ${h.num(V.matkakulut.oma_auto_euroa_km, 2)} €/km when using your own car is accepted. The government has proposed lowering the own share to ${h.eur(KT.esitys_matkakulut_omavastuu)}, but the calculator applies current law. Details on the ${h.a('matkakulut', 'commuting deduction page')}.</li>
<li><strong>Household tax credit</strong> on work bought from a company, under current law. Splitting it with a spouse and the proposed increase are covered by the ${h.a('kotitalousvahennys-laskuri', 'household credit calculator')}.</li>
<li><strong>Children and age</strong> under More options: each child under 18 raises the earned income credit by ${h.eur(V.tyotulovahennys.lapsikorotus)}.</li>
</ul>
<h2>Before you rely on the result</h2>
<p>The tool ignores capital income, the deficit credit, the student loan deduction, other work expenses and benefits taxed differently. If any of those apply to you, treat the figure as a rough guide. Compare it with the pre-completed tax return Vero publishes in MyTax and add any deduction it is missing. Your total tax withheld is also on the last payslip of the year. Reasons for refunds and residual tax are covered in ${h.a('veronpalautus', 'tax refund and residual tax')}, and you can check next year’s card with the ${h.a('veroprosenttilaskuri', 'tax rate calculator')}.</p>`,
  },
});
