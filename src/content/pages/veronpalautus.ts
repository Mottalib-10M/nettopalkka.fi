import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';

const PO = P.vero.paaomatulovero;
const pid = (tulo: number, pros: number) => tulo * pros / 100;

// 1. Pelkkä pyöristys: verokortti täsmälleen oikealla tulolla.
const TASOT = [25000, 30000, 35000, 40000, 45000, 50000, 60000].map((t) => { const v = laskeVerot({ tulo: t }); return { t, v, ero: pid(t, v.veroprosentti) - v.verot }; });
const V40 = laskeVerot({ tulo: 40000 });
const PYOR40 = pid(40000, V40.veroprosentti) - V40.verot;
// 2. Jäsenmaksut vähennetään vasta verotuksessa.
const JASEN = 450;
const JASEN_HYOTY = V40.verot - laskeVerot({ tulo: 40000, jasenmaksut: JASEN }).verot;
// 3. Palkankorotus ilman uutta verokorttia: kortti 36 000 eurolle, toteutunut 48 000.
const K36 = laskeVerot({ tulo: 36000 }), LP36 = lisaprosentti(K36), T48 = laskeVerot({ tulo: 48000 });
const KOROTUS_ERO = pid(36000, K36.veroprosentti) + pid(12000, LP36) - T48.verot;
// 4. Kaksi työtä samalla perusprosentilla: kortti 30 000 eurolle, tulot 45 000.
const K30 = laskeVerot({ tulo: 30000 }), T45 = laskeVerot({ tulo: 45000 });
const KAKSI_ERO = pid(45000, K30.veroprosentti) - T45.verot;
// 5. Vuokratulo ilman ennakkoa.
const VUOKRA = 3000;
const VUOKRA_VERO = VUOKRA * PO.prosentti / 100;
// 7. Tulot jäävät arvioitua pienemmiksi.
const K40 = laskeVerot({ tulo: 40000 }), T30 = laskeVerot({ tulo: 30000 });
const PIENEMPI_ERO = pid(30000, K40.veroprosentti) - T30.verot;
const [KT_TYO, KT_VAH] = P.kotitalousvahennys.esimerkit[0];
// 6. Minilaskurin oletus.
const V44 = laskeVerot({ tulo: 44000 }), MINI_PROS = 17, MINI_ERO = pid(44000, MINI_PROS) - V44.verot;

export default definePage({
  id: 'veronpalautus',
  group: 'vero',
  order: 120,
  mini: 'palautus',
  related: ['verolaskuri', 'verokortti', 'tuloraja', 'kotitalousvahennys-laskuri'],
  sources: ['vero_ennakonpidatys', 'vero_veroperusteet'],
  fi: {
    slug: 'veronpalautus-ja-jaannosvero',
    nav: 'Veronpalautus ja jäännösvero',
    card: 'Miksi verotus päättyy palautukseen tai jäännösveroon, ja miten ero arvioidaan etukäteen.',
    title: 'Veronpalautus ja jäännösvero 2026: mistä ero syntyy',
    description: `Veronpalautus vai jäännösvero 2026? Verokortin prosentti pyöristetään ylöspäin puoleen prosenttiin, ja osa vähennyksistä tulee vasta verotuksessa. Arvioi omasi.`,
    h1: 'Veronpalautus ja jäännösvero',
    intro: 'Verotuksessa lopullista veroa verrataan vuoden aikana pidätettyyn, ja erotus joko palautetaan tai peritään.',
    resume: `Veronpalautus syntyy, kun vuoden aikana on pidätetty enemmän veroa kuin lopullinen verotus vaatii, ja jäännösvero, kun pidätys on jäänyt liian pieneksi. Vuoden 2026 tuloista tavallisin syy palautukseen on pyöristys: Verohallinto pyöristää verokortin prosentin ylöspäin puolen prosenttiyksikön tarkkuudella, joten ${FI.eur(40000)} palkalla Helsingissä verokortin ${FI.num(V40.veroprosentti, 1)} % pidättää noin ${FI.eur(PYOR40)} enemmän kuin todellinen vero ${FI.eur(V40.verot)}, vaikka tuloraja olisi arvioitu täsmälleen. Toinen syy ovat vähennykset, jotka tehdään vasta verotuksessa, kuten ammattiliiton ja työttömyyskassan jäsenmaksut: ${FI.eur(JASEN)} jäsenmaksut pienentävät samalla palkalla veroa ${FI.eur(JASEN_HYOTY)}. Jäännösveroa kertyy, kun tuloja on enemmän kuin verokorttiin ilmoitettiin, kun kaksi työnantajaa pidättää samalla perusprosentilla tai kun pääomatuloista, esimerkiksi vuokrasta, ei ole maksettu ennakkoa. Kahden työn esimerkissämme jäännösveroa kertyy ${FI.eur(-KAKSI_ERO)}. Lopulliset summat näkyvät verotuspäätöksessä OmaVerossa, eikä tämä sivu arvioi maksupäiviä.`,
    faqs: [
      { q: 'Miksi saan veronpalautusta joka vuosi, vaikka en ole tehnyt vähennyksiä?', a: `Syy on yleensä pyöristys. Verokortin prosentti pyöristetään aina ylöspäin seuraavaan puoleen prosenttiin, joten pidätys on lähes aina hieman todellista veroa suurempi. ${FI.eur(40000)} palkalla todellinen veroaste on ${FI.num(V40.veroaste * 100, 2)} %, mutta verokortissa on ${FI.num(V40.veroprosentti, 1)} %, ja vuodessa liikaa pidätetty summa on noin ${FI.eur(PYOR40)}. Erotus palautetaan verotuksen valmistuttua.` },
      { q: 'Miksi palkankorotuksen jälkeen tuli jäännösveroa, vaikka lisäprosentti oli korkea?', a: `Lisäprosentti on suunniteltu kattamaan tulorajan ylittävän osan verot, mutta se ei aina riitä. Jos verokortti on laskettu ${FI.eur(36000)} vuositulolle ja palkka nousee niin, että vuositulo on ${FI.eur(48000)}, ylimenevä ${FI.eur(12000)} pidätetään ${FI.num(LP36, 1)} prosentilla. Laskelmamme mukaan pidätys jää silti ${FI.eur(-KOROTUS_ERO)} lopullista veroa pienemmäksi. Uuden verokortin tilaaminen korotuksen yhteydessä estää tämän.` },
      { q: 'Kertyykö jäännösveroa, jos minulla on kaksi työpaikkaa?', a: `Usein kertyy, jos kumpikin työnantaja soveltaa perusprosenttia. Jos verokortti on laskettu ${FI.eur(30000)} tuloille ja prosentti on ${FI.num(K30.veroprosentti, 1)} %, mutta palkkaa tulee kahdesta työstä yhteensä ${FI.eur(45000)}, pidätys jää ${FI.eur(-KAKSI_ERO)} liian pieneksi. Oikea prosentti olisi ollut ${FI.num(T45.veroprosentti, 1)} %. Tulorajan voi jakaa työnantajien kesken tai tilata sivutoimelle oman verokortin.` },
      { q: 'Paljonko veroa vuokratulosta pitää maksaa jälkikäteen?', a: `Puhtaasta vuokratulosta menee pääomatuloveroa ${FI.p(PO.prosentti, 0)} ja ${FI.eur(PO.raja)} ylittävältä osalta ${FI.p(PO.ylempi_prosentti, 0)}. ${FI.eur(VUOKRA)} puhtaasta vuokratulosta pääomatulovero on siis ${FI.eur(VUOKRA_VERO)}. Koska vuokratulosta ei pidätetä veroa palkan tapaan, summa tulee jäännösverona, ellei sitä maksa ennakkona tai lisäennakkona OmaVerossa vuoden aikana.` },
      { q: 'Tuleeko kotitalousvähennys veronpalautuksena?', a: `Tulee, jos et ole ilmoittanut sitä verokorttiin. Kotitalousvähennys vähennetään suoraan veroista, joten se kasvattaa palautusta euro eurolta. Vero.fi:n esimerkissä yritykseltä ostetusta ${FI.eur(KT_TYO)} työstä vähennystä tulee ${FI.eur(KT_VAH)} omavastuun jälkeen. Jos ilmoitat työn jo verokorttia muuttaessasi, sama hyöty tulee pienempänä pidätyksenä vuoden aikana eikä palautuksena.` },
      { q: 'Voiko jäännösveroa välttää maksamalla lisää vuoden aikana?', a: `Voi. OmaVerossa voi maksaa lisäennakkoa, joka luetaan vuoden veroihin samalla tavalla kuin palkasta pidätetty vero. Toinen keino on tilata korkeampi verokortti, jolloin pidätys kasvaa joka palkasta. Jos tiedät tulojesi nousevan esimerkiksi ${FI.eur(36000)} eurosta ${FI.eur(48000)} euroon, uusi verokortti on varmin tapa, koska lisäprosenttikaan ei aina riitä.` },
    ],
    body: (h) => `
<h2>Laskelma, joka ratkaisee palautuksen</h2>
<p>Verotuksessa Verohallinto laskee vuoden lopulliset verot kaikista tuloista ja vähennyksistä ja vertaa niitä verokortin perusteella pidätettyyn summaan. Jos pidätetty on suurempi, erotus palautetaan veronpalautuksena. Jos pidätetty on pienempi, erotus peritään jäännösverona. Yksinkertaistettuna: veronpalautus = pidätetty vero − lopullinen vero. Laskentaperusteet ovat samat kuin ${h.src('vero_ennakonpidatys', 'vuoden 2026 ennakonpidätyspäätöksessä')}, joten verokortti on lähtökohtaisesti ennuste lopullisesta verotuksesta.</p>
<p>Alla oleva taulukko näyttää, kuinka paljon pelkkä pyöristys tuottaa palautusta, kun vuositulo on arvioitu täsmälleen oikein. Muita vähennyksiä tai tuloja ei ole.</p>
${h.table(['Vuosipalkka', 'Verokortin %', 'Todellinen veroaste', 'Pidätetty', 'Lopullinen vero', 'Palautus'], TASOT.map(({ t, v, ero }) => [h.eur(t), h.num(v.veroprosentti, 1), h.pct(v.veroaste, 2), h.eur(pid(t, v.veroprosentti)), h.eur(v.verot), h.eur(ero)]), 'Helsinki, ei kirkon jäsen, vuosi 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Pyöristyksen palautus vaihtelee sattumanvaraisesti sen mukaan, kuinka kaukana todellinen veroaste on seuraavasta puolesta prosentista. ${h.eur(45000)} palkalla se jää muutamaan euroon, ${h.eur(60000)} palkalla siitä tulee kahden sadan euron luokkaa. Suuria palautuksia selittävät siksi lähes aina vähennykset tai liian suureksi arvioitu tuloraja.</p>
<h2>Vähennykset, jotka näkyvät vasta verotuksessa</h2>
<p>Osa vähennyksistä otetaan verokortissa huomioon vain, jos ilmoitat ne itse. Ammattiliiton ja työttömyyskassan jäsenmaksut tulevat yleensä verotukseen suoraan liitolta ja kassalta, mutta verokortin prosenttiin niitä ei ole laskettu. ${h.eur(JASEN)} vuodessa jäsenmaksuja maksava ${h.eur(40000)} palkansaaja saa niistä noin ${h.eur(JASEN_HYOTY)} veronpalautusta. Samaan ryhmään kuuluvat ${h.a('kotitalousvahennys-laskuri', 'kotitalousvähennys')}, työmatkakulujen vähennys ja muut tulonhankkimiskulut, jos niitä ei ole ilmoitettu verokorttia tilattaessa.</p>
<p>Vähennyksen voi ottaa huomioon jo vuoden aikana muuttamalla verokorttia, jolloin hyöty tulee kuukausittain pienempänä pidätyksenä. Lopputulos on sama: verotuksessa vähennys tehdään vain kerran.</p>
<h2>Miksi jäännösvero syntyy</h2>
<p>Jäännösvero on yleensä merkki siitä, että verokortti on laadittu liian pienille tuloille tai jotakin tuloa ei ole pidätetty lainkaan. Tavallisimmat tilanteet:</p>
<ul>
<li><strong>Palkankorotus ilman uutta verokorttia.</strong> ${h.eur(36000)} vuositulolle laskettu verokortti, prosentti ${h.num(K36.veroprosentti, 1)} % ja lisäprosentti ${h.num(LP36, 1)} %, kun tulot nousevat ${h.eur(48000)} euroon: pidätys jää ${h.eur(-KOROTUS_ERO)} vajaaksi, koska korkeampi tulo nostaa myös perusprosentilla pidätetyn osan verot. ${h.a('tuloraja', 'Tuloraja ja lisäprosentti')} -sivulla on laskelma eri korotuksille.</li>
<li><strong>Kaksi työnantajaa.</strong> Jos molemmat soveltavat perusprosenttia, tuloraja ylittyy käytännössä kahdesti ilman, että kumpikaan huomaa. ${h.eur(30000)} tuloille laskettu ${h.num(K30.veroprosentti, 1)} % kahdesta työstä, joista kertyy yhteensä ${h.eur(45000)}, jättää ${h.eur(-KAKSI_ERO)} jäännösveroa.</li>
<li><strong>Pääomatulot.</strong> Vuokra, osingot ja luovutusvoitot verotetaan ${h.num(PO.prosentti, 0)} prosentilla ja ${h.eur(PO.raja)} ylittävältä osin ${h.num(PO.ylempi_prosentti, 0)} prosentilla. ${h.eur(VUOKRA)} puhtaasta vuokratulosta pääomaveroa on ${h.eur(VUOKRA_VERO)}, ja koska siitä ei pidätetä mitään, se tulee jäännösverona.</li>
<li><strong>Päivärahamaksun raja.</strong> Jos arvioit palkkasi alle ${h.eur(h.P.vero.paivarahamaksu_tuloraja)} mutta ylität rajan, ${h.num(h.P.vero.paivarahamaksu_prosentti, 2)} % päivärahamaksu koko palkasta peritään verotuksessa.</li>
</ul>
<h2>Kun tulot jäävät arvioitua pienemmiksi</h2>
<p>Suurimmat palautukset syntyvät, kun vuoden tulot jäävät selvästi alle verokorttiin ilmoitetun. Verokortin prosentti on laskettu koko vuoden tulolle, ja Suomen progressiivisessa verotuksessa pienemmän tulon veroaste on matalampi. Jos verokortti on tehty ${h.eur(40000)} tulolle (${h.num(K40.veroprosentti, 1)} %) mutta palkkaa kertyy osa-aikaistumisen tai pitkän poissaolon takia vain ${h.eur(30000)}, samalla prosentilla pidätetään ${h.eur(pid(30000, K40.veroprosentti))}. Lopullinen vero on kuitenkin vain ${h.eur(T30.verot)}, ja palautusta tulee ${h.eur(PIENEMPI_ERO)}. Saman summan olisi saanut käyttöönsä jo vuoden aikana tilaamalla uuden verokortin, kun tulojen pieneneminen oli tiedossa.</p>
<p>Sama ilmiö näkyy työttömyyden aikana. Ansiopäivärahasta pidätetään veroa vähintään ${h.num(h.P.tyottomyys.ennakonpidatys_vahintaan)} %, vaikka palkan verokortin prosentti olisi pienempi. Jos työttömyys kestää vain osan vuotta ja vuoden kokonaistulot jäävät maltillisiksi, korotettu pidätys johtaa usein palautukseen. Päinvastainen tilanne syntyy, jos etuuden maksaja käyttää liian pientä prosenttia ja palkkatulot ovat samana vuonna suuret.</p>
<h2>Arvioi oma tilanteesi</h2>
<p>Yllä olevaan laskuriin syötetään vuoden toteutunut tulo ja verokortin prosentti. Esimerkiksi ${h.eur(44000)} vuositulolla ja ${h.num(MINI_PROS)} % verokortilla pidätetty summa on ${h.eur(pid(44000, MINI_PROS))}, lopullinen vero ${h.eur(V44.verot)} ja palautus noin ${h.eur(MINI_ERO)}. Oikea prosentti olisi ollut ${h.num(V44.veroprosentti, 1)} %, joten tässä tapauksessa verokortti oli tehty liian suurelle tulolle tai siihen oli lisätty varmuusmarginaali. Laskuri ei tunne pääomatuloja eikä vähennyksiä; niitä varten ${h.a('verolaskuri', 'verolaskuri')} on tarkempi.</p>
<h2>Liian suuri pidätys on koroton laina valtiolle</h2>
<p>Moni pitää veronpalautusta säästämisenä, mutta raha olisi voinut olla käytössä koko vuoden. Jos palautus on toistuvasti satoja euroja, kannattaa tarkistaa ${h.a('verokortti', 'verokortin')} tuloraja ja ilmoittaa vähennykset jo verokorttiin. Päinvastoin jäännösvero ei ole rangaistus, mutta sen maksaminen kertaluonteisesti voi tulla yllätyksenä, ja jäännösverolle voidaan laskea korkoa. Verotuspäätös kertoo kummankin summan ja peruste näkyy ${h.src('vero_veroperusteet', 'veroperusteissa')}.</p>`,
  },
  en: {
    slug: 'tax-refund-residual-tax',
    nav: 'Tax refund and residual tax',
    card: 'Why your Finnish tax assessment ends in a refund or a bill, and how to estimate it in advance.',
    title: 'Tax refund and residual tax 2026: why Finland pays or bills',
    description: `Tax refund or residual tax 2026 in Finland? Your card rate is rounded up to the next half point and some deductions only count at assessment. Estimate yours.`,
    h1: 'Tax refund and residual tax in Finland',
    intro: 'Each year Vero compares the tax withheld from your pay with your final tax, and either refunds the difference or bills you for it.',
    resume: `A Finnish tax refund (veronpalautus) arises when more tax was withheld during the year than your final assessment requires; residual tax (jäännösvero) when too little was. For 2026 income, the most common cause of a refund is rounding: Vero always rounds your tax card rate up to the next half point, so on ${EN.eur(40000)} in Helsinki a ${EN.num(V40.veroprosentti, 1)}% card withholds about ${EN.eur(PYOR40)} more than the real tax of ${EN.eur(V40.verot)}, even if your income estimate was perfect. The second cause is deductions only applied at assessment, such as union and unemployment fund (kassa) fees: ${EN.eur(JASEN)} of fees lowers tax on the same salary by ${EN.eur(JASEN_HYOTY)}. Residual tax usually means you earned more than your card assumed, two employers both withheld at your base rate, or you had capital income such as rent with nothing withheld. In our two-job example the shortfall is ${EN.eur(-KAKSI_ERO)}. The amounts appear in your tax decision in MyTax (OmaVero); this page does not predict payment dates.`,
    faqs: [
      { q: 'Why do I get a Finnish tax refund every year without claiming anything?', a: `Almost always because of rounding. The tax card rate is rounded up to the next half point, so withholding nearly always exceeds the real tax a little. On ${EN.eur(40000)} the true tax rate is ${EN.num(V40.veroaste * 100, 2)}% but the card says ${EN.num(V40.veroprosentti, 1)}%, which over-withholds about ${EN.eur(PYOR40)} a year. Union and kassa fees, reported by those bodies, add to it.` },
      { q: 'I got a pay rise and now owe residual tax: why?', a: `The additional rate (lisäprosentti) on income above your limit does not always cover the higher tax on the whole year. With a card set for ${EN.eur(36000)} and actual pay of ${EN.eur(48000)}, the extra ${EN.eur(12000)} is withheld at ${EN.num(LP36, 1)}%, yet our calculation still leaves ${EN.eur(-KOROTUS_ERO)} unpaid. Ordering a revised tax card when the rise starts prevents it.` },
      { q: 'I have two jobs in Finland: will I owe tax at the end of the year?', a: `Quite possibly, if both employers apply your base rate. A ${EN.num(K30.veroprosentti, 1)}% card made for ${EN.eur(30000)} of income, used for two jobs paying ${EN.eur(45000)} together, leaves ${EN.eur(-KAKSI_ERO)} of residual tax; the right rate would have been ${EN.num(T45.veroprosentti, 1)}%. Split the income limit between employers or order a separate card for the second job.` },
      { q: 'Does the household tax credit come back as a refund?', a: `Yes, unless you already put it on your tax card. The household tax credit (kotitalousvähennys) comes straight off your tax, so it raises your refund euro for euro. In Vero’s own example, ${EN.eur(KT_TYO)} of work bought from a company gives a credit of ${EN.eur(KT_VAH)} after the own share. Entering the work on your card instead lowers withholding during the year.` },
      { q: 'How do I avoid residual tax on rental income from my home country?', a: `Pay it in advance. Net rental income is capital income taxed at ${EN.p(PO.prosentti, 0)} (${EN.p(PO.ylempi_prosentti, 0)} above ${EN.eur(PO.raja)}), and nothing is withheld through your Finnish payslip. On ${EN.eur(VUOKRA)} of net rent that is ${EN.eur(VUOKRA_VERO)} before any credit for tax paid abroad. You can make an additional prepayment (lisäennakko) in MyTax during the year so it does not arrive as residual tax.` },
    ],
    body: (h) => `
<h2>The one comparison that decides it</h2>
<p>In the annual assessment Vero works out your final tax on all income and deductions and compares it with what was withheld under your tax card (verokortti). Refund = tax withheld − final tax; a negative result is residual tax. The rules are the same as in ${h.src('vero_ennakonpidatys', 'Vero’s 2026 withholding decision')}, so your tax card is really a forecast of your assessment.</p>
<p>The table shows the refund produced by rounding alone, with a perfectly estimated income and no other deductions or income.</p>
${h.table(['Annual salary', 'Card rate', 'Real tax rate', 'Withheld', 'Final tax', 'Refund'], TASOT.map(({ t, v, ero }) => [h.eur(t), `${h.num(v.veroprosentti, 1)}%`, h.pct(v.veroaste, 2), h.eur(pid(t, v.veroprosentti)), h.eur(v.verot), h.eur(ero)]), 'Helsinki, no church membership, 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The rounding refund is essentially random: a few euros at ${h.eur(45000)}, around two hundred at ${h.eur(60000)}, depending on how far your real rate sits below the next half point. Large refunds nearly always come from deductions or from an income limit set too high.</p>
<h2>Deductions that only count at assessment</h2>
<p>Some deductions are not in your tax card rate unless you add them yourself. Union and unemployment fund fees are usually reported to Vero directly by the union and the fund, but they are not built into withholding: ${h.eur(JASEN)} of fees on a ${h.eur(40000)} salary brings back about ${h.eur(JASEN_HYOTY)}. The ${h.a('kotitalousvahennys-laskuri', 'household tax credit')} and the commuting deduction behave the same way when you have not entered them on your card. Entering them on the card instead spreads the benefit over the year; the final tax is identical.</p>
<h2>Where residual tax comes from</h2>
<ul>
<li><strong>A pay rise without a new card.</strong> A card for ${h.eur(36000)} with a ${h.num(K36.veroprosentti, 1)}% base rate and ${h.num(LP36, 1)}% additional rate, against actual pay of ${h.eur(48000)}, falls ${h.eur(-KOROTUS_ERO)} short, because higher income also raises the tax on the part withheld at the base rate. See ${h.a('tuloraja', 'income limit and additional rate')}.</li>
<li><strong>Two employers.</strong> If both apply your base rate, the income limit is effectively used twice. A ${h.num(K30.veroprosentti, 1)}% card for ${h.eur(30000)} used on two jobs paying ${h.eur(45000)} leaves ${h.eur(-KAKSI_ERO)} to pay.</li>
<li><strong>Capital income.</strong> Rent, dividends and gains are taxed at ${h.num(PO.prosentti, 0)}% (${h.num(PO.ylempi_prosentti, 0)}% above ${h.eur(PO.raja)}) with nothing withheld through your payslip. ${h.eur(VUOKRA)} of net rent means ${h.eur(VUOKRA_VERO)} of tax.</li>
<li><strong>The daily allowance contribution threshold.</strong> If you estimated your wages below ${h.eur(h.P.vero.paivarahamaksu_tuloraja)} and then crossed it, the ${h.num(h.P.vero.paivarahamaksu_prosentti, 2)}% contribution on all your pay is collected at assessment.</li>
</ul>
<h2>When you earn less than you estimated</h2>
<p>The largest refunds come from income well below the figure on your card. Your rate was set for the whole year’s income, and Finnish tax is progressive, so a lower income has a lower average rate. With a card for ${h.eur(40000)} at ${h.num(K40.veroprosentti, 1)}% and actual pay of only ${h.eur(30000)}, perhaps after going part-time or a long leave, ${h.eur(pid(30000, K40.veroprosentti))} is withheld against a final tax of ${h.eur(T30.verot)}: a refund of ${h.eur(PIENEMPI_ERO)}. A revised card ordered when the change was known would have put that money in your pocket during the year.</p>
<h2>Estimate yours</h2>
<p>The calculator above takes your actual annual income and the rate on your card. With ${h.eur(44000)} of income and a ${h.num(MINI_PROS)}% card, ${h.eur(pid(44000, MINI_PROS))} was withheld against final tax of ${h.eur(V44.verot)}, a refund of about ${h.eur(MINI_ERO)}; the right rate would have been ${h.num(V44.veroprosentti, 1)}%. It ignores capital income and deductions, for which the ${h.a('verolaskuri', 'tax calculator')} is more precise.</p>
<h2>A refund is an interest-free loan to the state</h2>
<p>Many people treat a refund as savings, but the money could have been in your account all year. If it is regularly several hundred euros, check the income limit on your ${h.a('verokortti', 'tax card')} and add your deductions to it. Residual tax, on the other hand, is not a penalty, but it can arrive as a lump sum and may carry interest. Your tax decision shows both figures, with the bases listed on ${h.src('vero_veroperusteet', 'vero.fi')}.</p>`,
  },
});
