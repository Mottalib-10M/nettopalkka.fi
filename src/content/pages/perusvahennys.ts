import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, perusvahennys } from '../../lib/engine/vero';

const V = P.vero;
const PV = V.perusvahennys;
const AH = V.ahvenanmaa_perusvahennys;
/** Tulo, jolla vähennys loppuu: enimmäismäärä + enimmäismäärä / pienenemisprosentti. */
const LOPPUU = PV.enimmaismaara + PV.enimmaismaara / (PV.pienenemisprosentti / 100);
const AH_LOPPUU = AH.enimmaismaara + AH.enimmaismaara / (AH.pienenemisprosentti / 100);
const tre = (tulo: number, tulolaji: 'palkka' | 'etuus' = 'palkka') => laskeVerot({ tulo, kunta: 'Tampere', tulolaji });
/** Pienin vuosipalkka (Tampere), jolla perusvähennystä ei enää saa. */
const PALKKA_LOPPUU = (() => { let lo = 0, hi = 100000; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (tre(m).perusvahennys > 0) lo = m; else hi = m; } return Math.ceil(hi / 100) * 100; })();
const RIVIT = [6000, 10000, 15000, 20000, 25000, 30000].map((t) => ({ t, p: tre(t), e: tre(t, 'etuus') }));
const P15 = tre(15000);
const E15 = tre(15000, 'etuus');
const OSA = 18000;
const POSA = tre(OSA);
const ESIM = 15000;
const ESIM_PV = perusvahennys(ESIM);
const POHJA15 = P15.puhdasAnsiotulo - P15.tyoelakemaksu - P15.tyottomyysvakuutusmaksu - P15.paivarahamaksu;
/** Pienin palkka (Tampere), jolla kunnallis- tai valtionveroa jää maksettavaksi Yle-veron ja päivärahamaksun lisäksi. */
const VERORAJA = (() => { let lo = 0, hi = 100000; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; const r = tre(m); if (r.valtionvero + r.kunnallisvero + r.sairaanhoitomaksu > 0) hi = m; else lo = m; } return Math.ceil(hi / 100) * 100; })();
const RV = tre(VERORAJA);
const EL = laskeVerot({ tulo: 15000, kunta: 'Tampere', tulolaji: 'elake', ika: 70 });
const MUUTTO = tre(3500 * 4);
const E10 = RIVIT[1].e, P10 = RIVIT[1].p;
const AH30 = laskeVerot({ tulo: 30000, kunta: 'Maarianhamina' });

export default definePage({
  id: 'perusvahennys',
  group: 'vero',
  order: 60,
  mini: 'perusvahennys',
  related: ['tyotulovahennys', 'valtion-tuloveroasteikko', 'nettopalkka-2000', 'yleistuki'],
  sources: ['vero_ennakonpidatys', 'finlex_tvl'],
  fi: {
    slug: 'perusvahennys',
    nav: 'Perusvähennys',
    card: 'Perusvähennys 2026: enimmäismäärä, pieneneminen ja miksi se ratkaisee pienituloisen, opiskelijan ja etuudensaajan veron.',
    title: 'Perusvähennys 2026: kenelle vähennys kuuluu ja paljonko',
    description: `Perusvähennys 2026 on enintään ${FI.eur(PV.enimmaismaara)} ja pienenee ${FI.num(PV.pienenemisprosentti)} % ylittävästä tulosta, joten se loppuu noin ${FI.eur(LOPPUU)} tulolla. Katso vaikutus palkkaan ja etuuteen.`,
    h1: 'Perusvähennys 2026',
    intro: 'Perusvähennys tekee pienistä tuloista lähes verottomia. Näin se lasketaan, missä se loppuu ja ketä se koskee eniten.',
    resume: `Perusvähennys on vuonna 2026 enintään ${FI.eur(PV.enimmaismaara)}, ja se pienenee ${FI.num(PV.pienenemisprosentti)} prosentilla siitä tulosta, joka ylittää ${FI.eur(PV.enimmaismaara)}. Vähennys loppuu kokonaan, kun tulo on noin ${FI.eur(LOPPUU)}; palkansaajalla se tarkoittaa noin ${FI.eur(PALKKA_LOPPUU)} vuosipalkkaa, koska ensin vähennetään tulonhankkimisvähennys ja työntekijän maksut. Perusvähennys tehdään viimeisenä puhtaasta ansiotulosta, ja Verohallinnon esimerkit osoittavat, että sama vähennys pienentää sekä kunnallisverotuksen että valtionverotuksen verotettavaa tuloa. Sen merkitys on suurin pienillä tuloilla: tamperelaisen ${FI.eur(15000)} vuosipalkasta perusvähennys on ${FI.eur(P15.perusvahennys)}, ja yhdessä työtulovähennyksen kanssa se tekee palkasta verottoman. Samansuuruisesta etuudesta, josta työtulovähennystä ei saa, veroa menee ${FI.eur(E15.verot)}, vaikka perusvähennys on silloinkin ${FI.eur(E15.perusvahennys)}. Vähennys koskee kaikkea ansiotuloa, siis myös opintojen ohessa tehtyä osa-aikatyötä ja Kelan veronalaisia etuuksia. Ahvenanmaan kunnallisverotuksessa perusvähennys on ${FI.eur(AH.enimmaismaara)} ja pienenee ${FI.num(AH.pienenemisprosentti, 1)} prosentilla. Vähennystä ei tarvitse hakea, sillä se lasketaan automaattisesti verokorttiin ja verotukseen.`,
    faqs: [
      { q: 'Millä tuloilla perusvähennys loppuu vuonna 2026?', a: `Perusvähennys loppuu, kun tulo, josta se lasketaan, on noin ${FI.eur(LOPPUU)}. Se on tulo tulonhankkimisvähennyksen ja työntekijän maksujen jälkeen, joten palkansaajalla raja vastaa noin ${FI.eur(PALKKA_LOPPUU)} vuosipalkkaa. Sitä suuremmilla tuloilla perusvähennystä ei ole lainkaan, ja verotusta keventää enää työtulovähennys.` },
      { q: `Paljonko perusvähennys on ${FI.eur(ESIM)} tulolla?`, a: `Jos tulo vähennysten jälkeen on ${FI.eur(ESIM)}, perusvähennys on ${FI.eur(PV.enimmaismaara)} miinus ${FI.num(PV.pienenemisprosentti)} % ylittävästä ${FI.eur(ESIM - PV.enimmaismaara)} osasta eli ${FI.eur(ESIM_PV)}. Jos ${FI.eur(ESIM)} on bruttopalkka, vähennys on suurempi, ${FI.eur(P15.perusvahennys)}, koska pohjana on palkka maksujen ja tulonhankkimisvähennyksen jälkeen.` },
      { q: 'Saako opiskelija perusvähennyksen opintotuen lisäksi?', a: `Perusvähennys koskee kaikkea veronalaista ansiotuloa, joten opiskelija saa sen osa-aikatyön palkasta ja veronalaisista etuuksista ilman hakemusta. ${FI.eur(OSA)} vuositulolla palkasta perusvähennys on ${FI.eur(POSA.perusvahennys)}, ja vero jää ${FI.eur(POSA.verot)} euroon, joka muodostuu Yle-verosta ja päivärahamaksusta. Opintolainaa vähennys ei koske, koska laina ei ole tuloa.` },
      { q: 'Vähennetäänkö perusvähennys myös valtion verosta?', a: `Kyllä. Perusvähennys pienentää verotettavaa tuloa sekä kunnallisverotuksessa että valtionverotuksessa, ja Verohallinnon vuoden 2026 esimerkkilaskelmat täsmäävät vain, kun vähennys tehdään molemmissa. Ahvenanmaalla kunnallisverotuksen perusvähennys on oma, ${FI.eur(AH.enimmaismaara)}, mutta valtionverotuksessa käytetään manner-Suomen ${FI.eur(PV.enimmaismaara)} vähennystä. Siksi ahvenanmaalaisella on kaksi eri verotettavaa tuloa.` },
      { q: 'Saako eläkeläinen perusvähennyksen?', a: `Saa, sillä eläke on ansiotuloa. Eläkkeestä tehdään kuitenkin ensin eläketulovähennys, ja perusvähennys lasketaan vasta jäljelle jäävästä tulosta. ${FI.eur(15000)} eläkkeestä Tampereella perusvähennystä jää ${FI.eur(EL.perusvahennys)}, ja veroa menee ${FI.eur(EL.verot)}. Työtulovähennystä eläkkeestä ei saa, joten eläkkeen ja palkan verot eroavat samalla tulolla selvästi.` },
      { q: 'Pitääkö perusvähennys vaatia veroilmoituksella?', a: `Ei tarvitse. Perusvähennys kuuluu valmiiksi laskettuihin vähennyksiin: Verohallinto laskee sen verokortin prosenttiin arvioidusta vuositulosta ja lopulliseen verotukseen todellisista tuloista. Jos tulosi jäivät arvioitua pienemmiksi ja palkkaa kertyi koko vuonna vain ${FI.eur(10000)}, vähennys on verotuksessa automaattisesti ${FI.eur(P10.perusvahennys)}, ja liikaa pidätetty vero palautetaan sinulle veronpalautuksena.` },
    ],
    body: (h) => `
<h2>Laskukaava</h2>
<p>Perusvähennys lasketaan yhdellä kaavalla: ${h.eur(PV.enimmaismaara)} miinus ${h.num(PV.pienenemisprosentti)} % siitä osasta tuloa, joka ylittää ${h.eur(PV.enimmaismaara)}. Tulo tarkoittaa tässä puhdasta ansiotuloa sen jälkeen, kun siitä on vähennetty muut puhtaasta ansiotulosta tehtävät vähennykset, palkansaajalla työeläkemaksu, työttömyysvakuutusmaksu ja päivärahamaksu. Verohallinnon päätöksen sanoin perusvähennys lasketaan viimeisenä puhtaasta ansiotulosta tehtävänä vähennyksenä. Vähennys ei voi olla suurempi kuin tulo, josta se tehdään, joten aivan pienillä tuloilla verotettavaa tuloa ei jää lainkaan.</p>
<p>Koska vähennys pienenee ${h.num(PV.pienenemisprosentti)} sentillä jokaista ylittävää euroa kohden, se toimii käytännössä lisäverona tulovälillä ${h.eur(PV.enimmaismaara)}–${h.eur(LOPPUU)}. Jokainen lisäeuro kasvattaa verotettavaa tuloa ${h.num(1 + PV.pienenemisprosentti / 100, 2)} eurolla, kunnes vähennys on kulunut loppuun.</p>

<h2>Perusvähennys palkasta ja etuudesta</h2>
${h.table(['Vuositulo', 'Perusvähennys, palkka', 'Vero, palkka', 'Perusvähennys, etuus', 'Vero, etuus'],
  RIVIT.map(({ t, p, e }) => [h.eur(t), h.eur(p.perusvahennys), h.eur(p.verot), h.eur(e.perusvahennys), h.eur(e.verot)]),
  'Tampere, ei kirkon jäsen, vuoden 2026 perusteet; etuus = esimerkiksi työttömyysetuus', ['l', 'r', 'r', 'r', 'r'])}
<p>Taulukko näyttää kaksi asiaa. Palkasta perusvähennys on hieman suurempi kuin samasta etuudesta, koska palkasta vähennetään ensin tulonhankkimisvähennys ja työntekijän maksut, jolloin vähennyksen pohja on pienempi. Silti etuuden vero on paljon suurempi, sillä etuudesta ei saa ${h.a('tyotulovahennys', 'työtulovähennystä')}. Etuudensaajalle perusvähennys on käytännössä ainoa ansiotulosta tehtävä yleinen vähennys, ja siksi se ratkaisee esimerkiksi ${h.a('yleistuki', 'yleistuen')} verotuksen.</p>

<h2>Askel askeleelta: ${h.eur(15000)} vuosipalkka</h2>
<p>Tamperelainen tienaa osa-aikatyöstä ${h.eur(15000)} vuodessa. Palkasta vähennetään ensin ${h.eur(V.tulonhankkimisvahennys)} tulonhankkimisvähennys, jolloin puhdas ansiotulo on ${h.eur(P15.puhdasAnsiotulo)}. Siitä vähennetään työeläkemaksu ${h.eur(P15.tyoelakemaksu)} ja työttömyysvakuutusmaksu ${h.eur(P15.tyottomyysvakuutusmaksu)}; päivärahamaksua ei peritä, koska palkka jää alle ${h.eur(V.paivarahamaksu_tuloraja)}. Perusvähennyksen pohjaksi jää ${h.eur(POHJA15)}. Vähennys on ${h.eur(PV.enimmaismaara)} miinus ${h.num(PV.pienenemisprosentti)} % rajan ylittävästä ${h.eur(POHJA15 - PV.enimmaismaara)} osasta eli ${h.eur(P15.perusvahennys)}, ja verotettavaa tuloa jää ${h.eur(P15.verotettava)}. Siitä laskettu kunnallisvero, sairaanhoitomaksu ja valtion vero jäävät pienemmiksi kuin työtulovähennys, joten veroa ei jää lainkaan.</p>

<h2>Missä palkassa vero alkaa</h2>
<p>Perus- ja työtulovähennys yhdessä määräävät, mistä palkasta alkaen varsinaista tuloveroa kertyy. Tampereella kunnallis- ja valtionveroa sekä sairaanhoitomaksua alkaa jäädä maksettavaksi noin ${h.eur(VERORAJA)} vuosipalkasta. Sitä pienemmällä palkalla ainoat verot ovat Yle-vero ja päivärahamaksu, jos tulot ylittävät niiden rajat. Raja riippuu kunnasta: mitä korkeampi kunnallisvero, sitä aiemmin vähennykset eivät enää riitä. Perusvähennys kuluu loppuun noin ${h.eur(PALKKA_LOPPUU)} palkalla, joten välillä ${h.eur(VERORAJA)}–${h.eur(PALKKA_LOPPUU)} jokainen lisäeuro sekä nostaa veroa että pienentää vähennystä. Tällä tulovälillä palkansaajan marginaalivero on suurempi kuin pelkkä kunnallis- ja valtionveron prosentti antaa ymmärtää.</p>

<h2>Kenelle perusvähennys merkitsee eniten</h2>
<ul>
<li><strong>Opiskelijat ja kesätyöntekijät:</strong> pieni vuositulo jää perusvähennyksen ja työtulovähennyksen ansiosta lähes verottomaksi. ${h.eur(OSA)} palkasta veroa jää vain ${h.eur(POSA.verot)}.</li>
<li><strong>Osa-aikatyötä tekevät:</strong> esimerkiksi ${h.a('nettopalkka-2000', `${h.eur(2000)} kuukausipalkalla`)} vähennystä on vielä jäljellä, ja se laskee veroprosenttia tuntuvasti.</li>
<li><strong>Etuudensaajat:</strong> työttömyysetuus, vanhempainraha ja muut veronalaiset etuudet saavat perusvähennyksen mutta eivät työtulovähennystä.</li>
<li><strong>Vuoden kesken Suomeen muuttaneet:</strong> vähennys on vuotuinen, joten muutaman kuukauden palkasta se on suhteessa suuri.</li>
</ul>
<p>Täyttä palkkaa koko vuoden saavalle perusvähennyksellä ei ole merkitystä: se loppuu noin ${h.eur(PALKKA_LOPPUU)} vuosipalkalla, ja keskipalkalla sitä ei ole lainkaan.</p>
<p>Etuudensaajan tilanne on toinen. ${h.eur(10000)} vuodessa työttömyysetuutta saavan perusvähennys on Tampereella ${h.eur(E10.perusvahennys)}, mutta veroa menee silti ${h.eur(E10.verot)} ja verokortin prosentti on ${h.num(E10.veroprosentti, 1)} %. Samansuuruisesta palkasta veroa ei menisi lainkaan, koska palkansaaja saa perusvähennyksen lisäksi työtulovähennyksen. Ero ei johdu perusvähennyksestä vaan siitä, että se on etuudensaajan ainoa yleinen vähennys.</p>
<p>Vuoden kesken Suomeen muuttanut hyötyy vähennyksestä samalla tavalla. Jos syyskuussa alkava työ tuottaa vuoden aikana ${h.eur(3500 * 4)} palkkaa, perusvähennys on ${h.eur(MUUTTO.perusvahennys)} ja koko vuoden vero ${h.eur(MUUTTO.verot)}, koska vähennystä ei jaeta kuukausille. Seuraavana vuonna täydellä palkalla vähennystä ei enää ole, ja veroprosentti nousee selvästi.</p>

<h2>Perusvähennys verokortissa</h2>
<p>Vähennystä ei haeta erikseen. Verohallinto laskee sen verokortin prosenttiin arvioidun vuositulon perusteella, ja lopullinen määrä lasketaan verotuksessa todellisista tuloista. Jos tulot jäävät arvioitua pienemmiksi, perusvähennys kasvaa ja pidätettyä veroa palautuu. Jos ne kasvavat, vähennys pienenee, mikä kannattaa muistaa, kun opiskelija siirtyy kesken vuoden kokoaikatyöhön. Lisäprosentin suuruus selittyy osin samalla: tulorajan yli menevillä euroilla perusvähennystä ei enää ole.</p>

<h2>Ahvenanmaa</h2>
<p>Ahvenanmaan kunnallisverotuksessa perusvähennys on ${h.eur(AH.enimmaismaara)}, ja se pienenee ${h.num(AH.pienenemisprosentti, 1)} prosentilla ylittävästä tulosta. Pieneneminen on loivempi kuin mantereella, joten vähennys loppuu vasta noin ${h.eur(AH_LOPPUU)} tulolla. Maarianhaminassa ${h.eur(30000)} palkasta kunnallisverotuksen perusvähennys on ${h.eur(AH30.perusvahennys)}, kun mantereella samasta palkasta jäisi enää ${h.eur(RIVIT[5].p.perusvahennys)}. Valtionverotuksessa käytetään myös Ahvenanmaalla manner-Suomen vähennystä, ja ${h.a('valtion-tuloveroasteikko', 'valtion asteikko')} on siellä alennettu.</p>
<p>Lähteet: ${h.src('vero_ennakonpidatys')}; ${h.src('finlex_tvl')}.</p>`,
  },
  en: {
    slug: 'basic-deduction',
    nav: 'Basic deduction',
    card: 'The 2026 basic deduction: maximum, taper and why it decides the tax of low earners, students and benefit recipients.',
    title: 'Basic Deduction 2026: Who Gets It and How Much It Is Worth',
    description: `Basic deduction 2026 in Finland: up to ${EN.eur(PV.enimmaismaara)}, reduced by ${EN.num(PV.pienenemisprosentti)}% of income above that, gone at about ${EN.eur(LOPPUU)}. Who it helps, wages versus benefits, and Åland.`,
    h1: 'The basic deduction 2026',
    intro: 'The basic deduction (perusvähennys) makes very small incomes almost tax-free. How it is calculated, where it ends and who benefits most.',
    resume: `The basic deduction (perusvähennys) is worth up to ${EN.eur(PV.enimmaismaara)} in 2026 and shrinks by ${EN.num(PV.pienenemisprosentti)}% of any income above ${EN.eur(PV.enimmaismaara)}. It disappears completely at an income of about ${EN.eur(LOPPUU)}, which for an employee means a salary of roughly ${EN.eur(PALKKA_LOPPUU)}, since the work-expense deduction and employee contributions come off first. It is the last deduction taken from net earned income, and Vero’s own 2026 examples only match when it reduces taxable income for both municipal and state tax. Its weight is greatest at low incomes: on a ${EN.eur(15000)} salary in Tampere it is ${EN.eur(P15.perusvahennys)}, and together with the earned income credit it makes that pay tax-free. The same amount received as a benefit, which earns no earned income credit, still gets a ${EN.eur(E15.perusvahennys)} basic deduction yet is taxed ${EN.eur(E15.verot)}. It applies to all earned income, including part-time work alongside studies and taxable Kela benefits. In Åland municipal taxation the deduction is ${EN.eur(AH.enimmaismaara)} with a ${EN.num(AH.pienenemisprosentti, 1)}% taper. You never apply for it; Vero includes it in your tax card and your assessment automatically.`,
    faqs: [
      { q: 'At what income does the Finnish basic deduction run out?', a: `It reaches zero when the income it is calculated on hits about ${EN.eur(LOPPUU)}. That base is income after the work-expense deduction and employee contributions, so for an employee it corresponds to a salary of about ${EN.eur(PALKKA_LOPPUU)}. Above that you get no basic deduction at all; the earned income credit is then the only general relief left.` },
      { q: `How much is the basic deduction on ${EN.eur(ESIM)} of income?`, a: `If income after other deductions is ${EN.eur(ESIM)}, the deduction is ${EN.eur(PV.enimmaismaara)} less ${EN.num(PV.pienenemisprosentti)}% of the ${EN.eur(ESIM - PV.enimmaismaara)} above the threshold, giving ${EN.eur(ESIM_PV)}. If ${EN.eur(ESIM)} is your gross salary the deduction is larger, ${EN.eur(P15.perusvahennys)}, because contributions and the work-expense deduction shrink the base first.` },
      { q: 'Do international students in Finland get the basic deduction?', a: `If you are taxed in Finland as a resident, yes: it applies to all taxable earned income without any application. On ${EN.eur(OSA)} of part-time wages the deduction is ${EN.eur(POSA.perusvahennys)}, and only ${EN.eur(POSA.verot)} of tax remains, made up of the Yle tax and the daily allowance contribution. Student loans are not income, so the deduction does not touch them.` },
      { q: 'Does the basic deduction also reduce state income tax?', a: `Yes. It lowers taxable income for both municipal and state tax, and Vero’s 2026 worked examples only reconcile when it is applied in both. In Åland the municipal deduction has its own figures, ${EN.eur(AH.enimmaismaara)} and ${EN.num(AH.pienenemisprosentti, 1)}%, while state taxation there uses the mainland ${EN.eur(PV.enimmaismaara)} deduction.` },
    ],
    body: (h) => `
<h2>The formula</h2>
<p>One line does it: ${h.eur(PV.enimmaismaara)} minus ${h.num(PV.pienenemisprosentti)}% of whatever income exceeds ${h.eur(PV.enimmaismaara)}. Income here means net earned income after the other deductions made from it, which for an employee are the pension, unemployment insurance and daily allowance contributions. Vero’s decision puts it plainly: the basic deduction is the last one taken from net earned income. It can never exceed the income it is deducted from, so on very small earnings nothing taxable is left.</p>
<p>Because it shrinks by ${h.num(PV.pienenemisprosentti)} cents for every euro above the threshold, it acts as a hidden surcharge between ${h.eur(PV.enimmaismaara)} and ${h.eur(LOPPUU)}: each extra euro you earn adds ${h.num(1 + PV.pienenemisprosentti / 100, 2)} euros to your taxable income until the deduction is used up.</p>

<h2>Wages versus benefits</h2>
${h.table(['Annual income', 'Deduction on wages', 'Tax on wages', 'Deduction on benefit', 'Tax on benefit'],
  RIVIT.map(({ t, p, e }) => [h.eur(t), h.eur(p.perusvahennys), h.eur(p.verot), h.eur(e.perusvahennys), h.eur(e.verot)]),
  'Tampere, not a church member, 2026 rules; benefit = e.g. unemployment allowance', ['l', 'r', 'r', 'r', 'r'])}
<p>Two things stand out. On wages the deduction is slightly larger than on the same benefit, because contributions and the work-expense deduction reduce the base first. Yet the benefit is taxed far more heavily, since benefits get no ${h.a('tyotulovahennys', 'earned income tax credit')}. For anyone living on benefits, the basic deduction is effectively the only general relief, and it is what shapes the tax on ${h.a('yleistuki', 'general support (yleistuki)')}.</p>

<h2>Step by step: a ${h.eur(15000)} salary</h2>
<p>A part-timer in Tampere earns ${h.eur(15000)} a year. The ${h.eur(V.tulonhankkimisvahennys)} work-expense deduction leaves net earned income of ${h.eur(P15.puhdasAnsiotulo)}. The pension contribution (${h.eur(P15.tyoelakemaksu)}) and unemployment insurance (${h.eur(P15.tyottomyysvakuutusmaksu)}) come off next; there is no daily allowance contribution below ${h.eur(V.paivarahamaksu_tuloraja)} of wages. That leaves ${h.eur(POHJA15)} as the base, so the deduction is ${h.eur(P15.perusvahennys)} and taxable income ${h.eur(P15.verotettava)}. The tax on that is smaller than the earned income credit, and nothing is left to pay.</p>

<h2>Where income tax actually starts</h2>
<p>Between them, the basic deduction and the earned income credit decide the salary at which real income tax begins. In Tampere, municipal tax, state tax and the health care contribution start to show at about ${h.eur(VERORAJA)} a year. Below that, the only charges are the Yle tax and the daily allowance contribution once their thresholds are passed. From there up to about ${h.eur(PALKKA_LOPPUU)}, each extra euro is taxed and also erodes the deduction, so the effective marginal rate is higher than the headline rates suggest.</p>

<h2>Who it matters to</h2>
<ul>
<li><strong>Students and summer workers:</strong> small annual earnings end up almost untaxed; ${h.eur(OSA)} of wages leaves just ${h.eur(POSA.verot)} of tax.</li>
<li><strong>Part-timers:</strong> on ${h.a('nettopalkka-2000', `a ${h.eur(2000)} monthly salary`)} some deduction is still left, and it pulls the rate down noticeably.</li>
<li><strong>Benefit recipients:</strong> unemployment allowance, parental allowance and other taxable benefits get the basic deduction but no earned income credit.</li>
<li><strong>People who arrive mid-year:</strong> the deduction is annual, so against a few months of Finnish salary it is relatively large.</li>
</ul>
<p>For a full-time salary it is irrelevant: it runs out around ${h.eur(PALKKA_LOPPUU)} a year, well below typical professional pay.</p>
<p>Arriving in September on ${h.eur(3500)} a month gives ${h.eur(3500 * 4)} of Finnish pay for the year, a basic deduction of ${h.eur(MUUTTO.perusvahennys)} and total tax of just ${h.eur(MUUTTO.verot)}, because the deduction is not prorated by month. The following year, on a full twelve months, the deduction is gone and the rate jumps; expect that on your January card.</p>

<h2>On your tax card</h2>
<p>There is nothing to claim. Vero builds the deduction into your card rate from your estimated income, and the final amount is set in the assessment from what you actually earned. Earn less than expected and the deduction grows, so some withholding comes back. Earn more and it shrinks, worth remembering if you move from a student job to full-time work during the year.</p>

<h2>The Åland Islands</h2>
<p>For Åland municipal tax the basic deduction is ${h.eur(AH.enimmaismaara)}, reduced by ${h.num(AH.pienenemisprosentti, 1)}% of income above it. The gentler taper means it lasts until about ${h.eur(AH_LOPPUU)}. In Mariehamn a ${h.eur(30000)} salary still carries a ${h.eur(AH30.perusvahennys)} municipal deduction, against ${h.eur(RIVIT[5].p.perusvahennys)} on the mainland. State tax in Åland uses the mainland deduction and a reduced ${h.a('valtion-tuloveroasteikko', 'state scale')}.</p>
<p>Sources: ${h.src('vero_ennakonpidatys')}; ${h.src('finlex_tvl')}.</p>`,
  },
});
