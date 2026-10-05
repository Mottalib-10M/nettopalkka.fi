import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { kunta } from '../../lib/engine/params';

const HKI = kunta('Helsinki').kunta, POM = kunta('Pomarkku').kunta;

const V = P.vero;
const A = laskeVerot({ tulo: 40000, kunta: 'Helsinki' });
const B = laskeVerot({ tulo: 40000, kunta: 'Pomarkku' });
const LA = lisaprosentti(A);
const E30 = laskeVerot({ tulo: 30000, kunta: 'Helsinki', kirkko: 'evl' });

export default definePage({
  id: 'veroprosenttilaskuri',
  group: 'laskurit',
  order: 10,
  tool: 'veroprosentti',
  related: ['verokortti', 'tuloraja', 'muutosverokortti', 'kuntavertailu', 'verolaskuri'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat', 'vero_esimerkit', 'vero_prosenttilaskuri'],
  fi: {
    slug: 'veroprosenttilaskuri',
    nav: 'Veroprosenttilaskuri',
    card: 'Verokortin veroprosentti, lisäprosentti ja tuloraja vuoden 2026 perusteilla.',
    title: 'Veroprosenttilaskuri 2026: verokortin prosentti kunnittain',
    description: 'Veroprosenttilaskuri 2026: laske verokortin ennakonpidätysprosentti, lisäprosentti ja tuloraja kotikuntasi verolla. Sama pyöristys kuin Verohallinnolla.',
    h1: 'Veroprosenttilaskuri 2026',
    intro: 'Arvioi verokorttisi veroprosentti ennen kuin tilaat uuden: syötä vuositulo, kotikunta ja kirkon jäsenyys.',
    resume: `Veroprosentti on se osuus palkasta, jonka työnantaja pidättää verokortin mukaan. Vuonna 2026 helsinkiläinen, jonka palkkatulo on ${FI.eur(40000)} vuodessa, saa verokorttiin prosentin ${FI.num(A.veroprosentti, 1)} %, kun hän ei kuulu kirkkoon, mutta samalla tulolla Pomarkussa prosentti on ${FI.num(B.veroprosentti, 1)} %. Ero syntyy kunnallisverosta, joka on Helsingissä ${FI.num(HKI, 2)} % ja Pomarkussa ${FI.num(POM, 2)} %. Verohallinto laskee prosentin niin, että vuoden aikana pidätetty summa vastaa mahdollisimman tarkasti lopullisia veroja ja maksuja, ja pyöristää sen ylöspäin puolen prosenttiyksikön tarkkuudella. Prosenttiin sisältyvät valtion tulovero, kunnallisvero, kirkollisvero, sairaanhoitomaksu, päivärahamaksu ja Yle-vero; työeläkemaksu ${FI.num(V.tyoelakemaksu_prosentti, 2)} % ja työttömyysvakuutusmaksu ${FI.num(V.tyottomyysvakuutusmaksu_prosentti, 2)} % pidätetään erikseen. Kun tulot ylittävät verokortin tulorajan, ylimenevästä osasta pidätetään lisäprosentti, ${FI.eur(40000)} tulolla Helsingissä ${FI.num(LA, 1)} %. Laskuri tekee saman laskelman kaikille 308 kunnalle ja näyttää jokaisen veron erikseen, joten näet heti, mistä prosentti muodostuu ja miksi se poikkeaa työkaverisi prosentista.`,
    faqs: [
      { q: 'Miksi veroprosenttini on pyöreä luku tai puolikas?', a: `Verohallinnon päätöksen mukaan ennakonpidätysprosentti vahvistetaan puolen prosenttiyksikön tarkkuudella ja pyöristetään aina ylöspäin. Jos verosi ovat ${FI.num(13.62, 2)} % tulosta, verokorttiin tulee 14,0 %. Ylöspäin pyöristys tarkoittaa, että vuoden aikana pidätetään yleensä hieman liikaa, ja erotus palautetaan veronpalautuksena seuraavan vuoden verotuksessa.` },
      { q: 'Sisältyykö työeläkemaksu veroprosenttiin?', a: `Ei sisälly. Verokortin prosentti kattaa verot ja sairausvakuutusmaksut. Työntekijän työeläkemaksu ${FI.num(V.tyoelakemaksu_prosentti, 2)} % ja työttömyysvakuutusmaksu ${FI.num(V.tyottomyysvakuutusmaksu_prosentti, 2)} % pidätetään palkasta erikseen, joten palkkalaskelmalla pidätykset ovat yhteensä noin ${FI.num(V.tyoelakemaksu_prosentti + V.tyottomyysvakuutusmaksu_prosentti, 2)} prosenttiyksikköä veroprosenttia suuremmat. Ne vähennetään kuitenkin verotuksessa tulosta.` },
      { q: 'Mitä vuositulo-kenttään kannattaa kirjoittaa?', a: `Koko vuoden 2026 bruttopalkka, johon on laskettu mukaan lomaraha, ylityökorvaukset, bonukset ja luontoisedut. Tämä summa on myös tuloraja, jonka voit ilmoittaa uutta verokorttia tilatessasi. Jos tulorajaa on vaikea arvioida, valitse mieluummin hieman liian suuri luku: liian pieni tuloraja johtaa siihen, että ylittävästä osasta pidätetään lisäprosentti.` },
      { q: 'Onko tulos sama kuin Verohallinnon veroprosenttilaskurissa?', a: `Laskenta perustuu samaan Verohallinnon päätökseen vuodelta 2026, ja tarkistimme sen Verohallinnon julkaisemista esimerkeistä: esimerkiksi ${FI.eur(30000)} palkasta Helsingissä kirkon jäsenelle vero on ${FI.eur(E30.verot, 2)} ja veroprosentti ${FI.num(E30.veroprosentti, 1)} %, kuten Verohallinnon taulukossa. Erot syntyvät vähennyksistä, joita tämä laskuri ei tunne, kuten pääomatuloista tai erityisistä tulonhankkimiskuluista.` },
      { q: 'Kannattaako veroprosenttia nostaa itse?', a: `Se kannattaa, jos tiedät saavasi tuloja, joista ei pidätetä veroa, esimerkiksi vuokratuloja tai ulkomaan palkkaa, tai jos tulosi nousevat selvästi. Liian pieni prosentti johtaa jäännösveroon, jota peritään tammikuusta alkaen erissä ja jolle voi kertyä korkoa. Liian suuri prosentti taas lainaa rahaa valtiolle ilman korkoa, joten tavoitteeksi kannattaa ottaa mahdollisimman oikea prosentti.` },
    ],
    body: (h) => `
<h2>Mistä veroprosentti koostuu</h2>
<p>Verokortin prosentti on kaikkien vuoden verojen summa jaettuna vuositulolla. Laskuri laskee ensin puhtaan ansiotulon: palkasta vähennetään automaattinen ${h.eur(V.tulonhankkimisvahennys)} tulonhankkimisvähennys ja ${h.eur(V.matkakulut.omavastuu)} ylittävät työmatkakulut. Sen jälkeen vähennetään työeläke-, työttömyysvakuutus- ja päivärahamaksu sekä perusvähennys, ja jäljelle jäävästä verotettavasta tulosta lasketaan valtion vero, kunnallisvero, kirkollisvero ja sairaanhoitomaksu. Työtulovähennys pienentää ensin valtionveroa. Yle-vero lisätään loppuun.</p>
${h.table(['Vero tai maksu', `${h.eur(40000)}, Helsinki`, `${h.eur(40000)}, Pomarkku`], [
  ['Valtion tulovero', h.eur(A.valtionvero), h.eur(B.valtionvero)],
  ['Kunnallisvero', h.eur(A.kunnallisvero), h.eur(B.kunnallisvero)],
  ['Sairaanhoitomaksu', h.eur(A.sairaanhoitomaksu), h.eur(B.sairaanhoitomaksu)],
  ['Päivärahamaksu', h.eur(A.paivarahamaksu), h.eur(B.paivarahamaksu)],
  ['Yle-vero', h.eur(A.yle), h.eur(B.yle)],
  ['Verot yhteensä', h.eur(A.verot), h.eur(B.verot)],
  ['Veroprosentti', `${h.num(A.veroprosentti, 1)} %`, `${h.num(B.veroprosentti, 1)} %`],
], 'Sama palkka kahdessa kunnassa, ei kirkon jäsen, vuosi 2026', ['l', 'r', 'r'])}
<p>Taulukko näyttää, että valtion vero ja maksut ovat kunnasta riippumatta samat. Koko ero tulee kunnallisverosta, jonka prosentit löytyvät ${h.a('kuntavertailu', 'kuntien veroprosenttien vertailusta')}.</p>
<h2>Tuloraja ja lisäprosentti</h2>
<p>Verokortissa on veroprosentin lisäksi tuloraja ja lisäprosentti. Niin kauan kuin vuoden palkat pysyvät tulorajan alla, työnantaja pidättää perusprosentin. Kun raja ylittyy, ylittävästä osasta pidätetään lisäprosentti, joka on aina vähintään kaksi prosenttiyksikköä perusprosenttia suurempi. Lisäprosentin pohjana on Verohallinnon asteikko, jossa verotettavan tulon mukainen prosentti vaihtelee ${h.num(V.lisaprosenttiasteikko[0].prosentti, 2)} prosentista ${h.num(V.lisaprosenttiasteikko[V.lisaprosenttiasteikko.length - 1].prosentti, 2)} prosenttiin; siihen lisätään kunnan ja seurakunnan prosentti sekä sairausvakuutusmaksut. Tulorajan ylitystä käsitellään tarkemmin sivulla ${h.a('tuloraja', 'tuloraja ja lisäprosentti')}.</p>
<h2>Kun tulot muuttuvat kesken vuoden</h2>
<p>Jos palkka nousee, aloitat uuden työn tai jäät työttömäksi, vanha prosentti ei enää vastaa koko vuoden veroja. Laskurin kenttä "jo maksettu palkka" arvioi prosentin, joka riittää loppuvuodeksi, kun tähän mennessä pidätetty vero on jo maksettu vanhalla prosentilla. Uuden verokortin voi tilata OmaVerossa, ja se toimitetaan työnantajalle tulorekisterin kautta. ${h.a('muutosverokortti', 'Muutosverokortti')}-sivulla on esimerkki palkankorotuksesta heinäkuussa.</p>`,
  },
  en: {
    slug: 'tax-rate-calculator',
    nav: 'Tax rate calculator',
    card: 'Your Finnish tax card withholding rate, additional rate and income limit for 2026.',
    title: 'Tax Rate Calculator Finland 2026: Your Tax Card Percentage',
    description: 'Tax rate calculator Finland 2026: estimate your tax card withholding rate, additional rate and income limit with your own municipality’s tax, rounded like Vero.',
    h1: 'Finnish tax rate calculator 2026',
    intro: 'Check your tax card (verokortti) percentage before ordering a new one: enter your annual income, municipality and church membership.',
    resume: `The tax rate (veroprosentti) is the share of your salary your employer withholds according to your tax card. In 2026, someone living in Helsinki with ${EN.eur(40000)} of annual salary and no church membership gets a rate of ${EN.num(A.veroprosentti, 1)}%, while the same income in Pomarkku gives ${EN.num(B.veroprosentti, 1)}%. The difference is municipal tax: ${EN.num(HKI, 2)}% in Helsinki, ${EN.num(POM, 2)}% in Pomarkku. Vero, the Finnish Tax Administration, sets the rate so that the tax withheld over the year matches your final taxes and contributions as closely as possible, then rounds it up to the next half point. The rate covers state income tax, municipal tax, church tax, the health care contribution, the daily allowance contribution and the Yle tax; your pension contribution (${EN.num(V.tyoelakemaksu_prosentti, 2)}%) and unemployment insurance (${EN.num(V.tyottomyysvakuutusmaksu_prosentti, 2)}%) are withheld on top. Once your pay passes the income limit (tuloraja) on the card, the excess is withheld at the additional rate, ${EN.num(LA, 1)}% at ${EN.eur(40000)} in Helsinki.`,
    faqs: [
      { q: 'Why is my Finnish tax rate always a whole or half number?', a: `Vero’s decision says the withholding rate is set to the nearest half point and always rounded up. If your taxes come to ${EN.num(13.62, 2)}% of income, the card shows 14.0%. Rounding up means slightly too much is usually withheld during the year, and the difference comes back as a tax refund after the following year’s assessment.` },
      { q: 'Does the tax card percentage include my pension contribution?', a: `No. The tax card covers taxes and health insurance contributions. The employee pension contribution of ${EN.num(V.tyoelakemaksu_prosentti, 2)}% and unemployment insurance of ${EN.num(V.tyottomyysvakuutusmaksu_prosentti, 2)}% are withheld separately, so on a payslip total deductions run about ${EN.num(V.tyoelakemaksu_prosentti + V.tyottomyysvakuutusmaksu_prosentti, 2)} points above your tax rate. Both are, however, deducted from income in your tax assessment.` },
      { q: 'What should I enter as annual income when I have just moved to Finland?', a: `Only the income you will earn in Finland in 2026, from your start date to 31 December, including holiday bonus and any taxable benefits such as a phone or car. That figure is also your income limit. If you arrived mid-year, a lower annual income usually means a lower rate, because the basic deduction and the earned income credit are annual amounts.` },
      { q: 'Is the result the same as Vero’s own calculator?', a: `It follows the same 2026 Vero decision and we checked it against Vero’s published examples: on ${EN.eur(30000)} of wages in Helsinki for a church member, tax is ${EN.eur(E30.verot, 2)} and the rate ${EN.num(E30.veroprosentti, 1)}%, exactly as in Vero’s table. Differences come from deductions this tool does not know, such as capital income or special work expenses.` },
      { q: 'Should I raise my tax rate myself?', a: `It makes sense if you expect income with no tax withheld, such as rent or foreign pay, or if your income will rise sharply. Too low a rate leads to residual tax, collected in instalments from January with interest. Too high a rate lends money to the state for free, so aim for the most accurate rate you can.` },
    ],
    body: (h) => `
<h2>What goes into the rate</h2>
<p>Your tax card rate is the sum of the year’s taxes divided by annual income. The calculator first works out net earned income: salary minus the automatic ${h.eur(V.tulonhankkimisvahennys)} work-expense deduction and commuting costs above ${h.eur(V.matkakulut.omavastuu)}. It then deducts the pension, unemployment and daily allowance contributions and the basic deduction, and applies state tax, municipal tax, church tax and the health care contribution to what remains. The earned income tax credit reduces state tax first. The Yle tax is added at the end.</p>
${h.table(['Tax or contribution', `${h.eur(40000)}, Helsinki`, `${h.eur(40000)}, Pomarkku`], [
  ['State income tax', h.eur(A.valtionvero), h.eur(B.valtionvero)],
  ['Municipal tax', h.eur(A.kunnallisvero), h.eur(B.kunnallisvero)],
  ['Health care contribution', h.eur(A.sairaanhoitomaksu), h.eur(B.sairaanhoitomaksu)],
  ['Daily allowance contribution', h.eur(A.paivarahamaksu), h.eur(B.paivarahamaksu)],
  ['Yle tax', h.eur(A.yle), h.eur(B.yle)],
  ['Total', h.eur(A.verot), h.eur(B.verot)],
  ['Withholding rate', `${h.num(A.veroprosentti, 1)}%`, `${h.num(B.veroprosentti, 1)}%`],
], 'Same salary in two municipalities, no church membership, 2026', ['l', 'r', 'r'])}
<p>State tax and contributions are identical in both places; the whole gap is municipal tax. All rates are in the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>Income limit and additional rate</h2>
<p>Besides the rate, the card carries an income limit and an additional rate. While your pay for the year stays under the limit, your employer applies the base rate. Above it, the additional rate applies, always at least two points higher. It comes from Vero’s scale, ranging from ${h.num(V.lisaprosenttiasteikko[0].prosentti, 2)}% to ${h.num(V.lisaprosenttiasteikko[V.lisaprosenttiasteikko.length - 1].prosentti, 2)}% depending on taxable income, plus your municipal and parish rate and the health insurance contributions. See ${h.a('tuloraja', 'income limit and additional rate')} for a worked example.</p>
<h2>When your income changes during the year</h2>
<p>A pay rise, a second job or a period of unemployment makes the old rate wrong for the year. The "salary already paid" field estimates the rate you need for the rest of the year, given that tax so far was withheld at the old rate. You can order a revised card in MyTax (OmaVero) and Vero passes it to your employer through the Incomes Register. The ${h.a('muutosverokortti', 'revised tax card')} page shows a July pay rise as an example.</p>`,
  },
});
