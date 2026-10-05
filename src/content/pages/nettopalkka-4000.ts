import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { bruttoNetosta, kuukausiNetto, laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { kunta } from '../../lib/engine/params';

const V = P.vero;
const TT = V.tyotulovahennys;
const PALKKA = 4000;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const KK = R.netto / 12;
const HKI = kunta('Helsinki').kunta;
const PORRAS = V.valtion_asteikko[3];
/** Korotukset: mitä bruttolisästä jää käteen ja mihin kortin prosentti nousee. */
const KOR = [100, 250, 500, 1000].map((d) => {
  const k = kuukausiNetto(PALKKA + d, { kunta: 'Helsinki' });
  const lisa = (k.netto - R.netto) / 12;
  return { d, lisa, osuus: lisa / d, vp: k.veroprosentti };
});
const RAJA = 1 - KOR[0].osuus;
/** Kertabonus tulorajan yli: lisäprosentilla pidätetty vs. lopullinen vero. */
const BONUS = 3000;
const LP = lisaprosentti(R);
const BV = laskeVerot({ tulo: PALKKA * 12 + BONUS, kunta: 'Helsinki' });
const BONUS_VERO = BV.verot - R.verot;
const BONUS_PIDATYS = BONUS * LP / 100;
const BONUS_NETTO = BONUS - (BV.pidatykset - R.pidatykset);
/** Bruttokorotus, jolla nettoa jää 200 € enemmän kuussa. */
const TAVOITE = 200;
const TARVE = bruttoNetosta(KK + TAVOITE, { kunta: 'Helsinki' }) - PALKKA;
/** Työnantajan keskimääräinen TyEL-maksu korotuksesta. */
const TA = P.elake.tyel_maksu_2026.tyonantaja_keskimaarin;

export default definePage({
  id: 'nettopalkka-4000',
  group: 'palkka',
  order: 50,
  mini: 'nettoSumma',
  miniDefaults: { p: 4000 },
  related: ['nettopalkka-3500', 'nettopalkka-5000', 'marginaalivero', 'tyotulovahennys'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-4000',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Rajavero lähes puolet: mitä ${FI.eur(PALKKA)} palkan korotuksesta ja bonuksesta oikeasti jää käteen.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: rajavero, korotus ja bonus`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: käteen ${FI.eur(KK)}, verokortissa ${FI.num(R.veroprosentti, 1)} %. Rajavero on ${FI.pct(RAJA)}, joten katso, mitä korotuksesta ja bonuksesta oikeasti jää käteen.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Neljän tuhannen euron palkalla keskimääräinen veroprosentti ja lisäeuron verotus eroavat jo jyrkästi toisistaan.`,
    resume: `Helsinkiläisen ${FI.eur(PALKKA)} kuukausipalkasta jää vuonna 2026 käteen keskimäärin ${FI.eur(KK)} kuussa, ja verokortin prosentti on ${FI.num(R.veroprosentti, 1)} %. Keskimääräinen prosentti kuitenkin harhauttaa, kun mietitään palkankorotusta. Vuositulo ${FI.eur(PALKKA * 12)} nostaa verotettavan tulon noin ${FI.num(R.verotettava)} euroon, joten ylimmät eurot ovat valtion asteikon ${FI.num(PORRAS.prosentti, 2)} prosentin portaalla, joka alkaa ${FI.eur(PORRAS.alaraja)} kohdalta. Samaan aikaan työtulovähennys pienenee ${FI.num(TT.pienenemisprosentti)} prosentilla jokaisesta lisäeurosta, ja sitä on jäljellä ${FI.eur(R.tyotulovahennys)}. Kun mukaan lasketaan kunnallisvero ${FI.num(HKI, 2)} %, sairaanhoito- ja päivärahamaksu sekä työeläke- ja työttömyysvakuutusmaksu, sadan euron korotuksesta jää käteen vain ${FI.eur(KOR[0].lisa, 2)}. Rajaveroaste on siis noin ${FI.pct(RAJA)}, lähes kolminkertainen kortin prosenttiin verrattuna. Tulorajan ylittävästä bonuksesta työnantaja pidättää lisäprosentin ${FI.num(LP, 1)} %. Jos tavoitteena on ${FI.eur(TAVOITE)} lisää käteen joka kuukausi, bruttopalkan pitää nousta noin ${FI.eur(TARVE)}.`,
    faqs: [
      { q: `Paljonko ${FI.eur(PALKKA)} palkan korotuksesta jää käteen?`, a: `Sadan euron kuukausikorotuksesta noin ${FI.eur(KOR[0].lisa, 2)} ja viidensadan euron korotuksesta ${FI.eur(KOR[2].lisa)}. Korotus verotetaan kokonaan ylimmällä rajaverolla, johon kuuluvat valtion ${FI.num(PORRAS.prosentti, 2)} prosentin porras, kunnallisvero, työtulovähennyksen leikkaus ja palkasta pidätettävät maksut. Verokortin prosentti nousee ${FI.num(KOR[2].vp, 1)} prosenttiin, jos korotus on viisisataa euroa.` },
      { q: `Miksi ${FI.eur(BONUS)} bonuksesta pidätetään niin paljon veroa?`, a: `Jos bonus ylittää verokortin tulorajan, siitä pidätetään lisäprosentti, ${FI.eur(PALKKA)} palkalla Helsingissä ${FI.num(LP, 1)} % eli ${FI.eur(BONUS_PIDATYS)}. Lopullinen vero bonuksesta on ${FI.eur(BONUS_VERO)}, joten pidätys on lähellä oikeaa. Lisäksi bonuksesta peritään työeläke- ja työttömyysvakuutusmaksu, ja käteen jää noin ${FI.eur(BONUS_NETTO)}.` },
      { q: `Kannattaako ${FI.eur(PALKKA)} palkalla tehdä ylitöitä?`, a: `Taloudellisesti hyöty on noin puolet bruttosummasta. Ylityökorvaus on palkkaa, joten siihen pätee sama ${FI.pct(RAJA)} rajavero kuin korotukseen, ja tulorajan ylittyessä pidätys tehdään lisäprosentilla ${FI.num(LP, 1)} %. Jos ylitöitä on paljon, tuloraja kannattaa nostaa uudella verokortilla, jolloin pidätys tasaantuu koko vuodelle.` },
      { q: `Paljonko palkkaa pitää pyytää lisää, jotta ${FI.eur(PALKKA)} palkasta jää ${FI.eur(TAVOITE)} enemmän käteen?`, a: `Noin ${FI.eur(TARVE)} kuukaudessa bruttona. Koska korotuksesta jää Helsingissä käteen vain hieman yli puolet, nettotavoite pitää lähes kaksinkertaistaa palkkaneuvottelussa. Kunnallisveroltaan kalliimmassa kunnassa tarve on hieman suurempi, ja kirkon jäsenyys kasvattaa sitä vielä lisää. Nettotavoitteesta bruttopalkkaan pääsee suoraan bruttopalkkalaskurilla, joka tekee saman käänteisen laskennan.` },
    ],
    body: (h) => `
<h2>Keskimääräinen prosentti ja lisäeuron hinta</h2>
<p>Verokortin ${h.num(R.veroprosentti, 1)} prosenttia kertoo, kuinka suuri osa koko palkasta menee veroihin. Palkankorotusta arvioitaessa se on väärä mittari, koska korotus ei jakaudu kaikille euroille vaan osuu kokonaan ylimpään kerrokseen. ${h.eur(PALKKA)} kuukausipalkalla tuo kerros on monella tavalla kallis. Verotettava tulo, noin ${h.eur(R.verotettava)}, on ylittänyt rajan ${h.eur(PORRAS.alaraja)}, joten valtio ottaa lisäeurosta ${h.num(PORRAS.prosentti, 2)} %. Puhdas ansiotulo on työtulovähennyksen leikkausvyöhykkeellä ${h.eur(TT.pienenemisraja)} ja ${h.eur(TT.pienenemisen_ylaraja)} välissä, jolloin jokainen lisäeuro vie vähennyksestä ${h.num(TT.pienenemisprosentti)} senttiä. Päälle tulevat kunnallisvero, sairaanhoitomaksu ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)} %, päivärahamaksu ${h.num(V.paivarahamaksu_prosentti, 2)} %, työeläkemaksu ${h.num(V.tyoelakemaksu_prosentti, 2)} % ja työttömyysvakuutusmaksu ${h.num(V.tyottomyysvakuutusmaksu_prosentti, 2)} %. Maksut vähennetään verotettavasta tulosta, joten prosentteja ei voi suoraan laskea yhteen, mutta lopputulos on taulukossa: korotuksista jää käteen hieman yli puolet. Ilmiötä käsitellään laajemmin sivulla ${h.a('marginaalivero', 'marginaalivero')}.</p>
${h.table(['Korotus / kk', 'Lisää käteen / kk', 'Osuus korotuksesta', 'Uusi veroprosentti'], KOR.map((x) => [`+${h.eur(x.d)}`, h.eur(x.lisa, 2), h.pct(x.osuus), `${h.num(x.vp, 1)} %`]), `Lähtötaso ${h.eur(PALKKA)} kuukaudessa, Helsinki, ei kirkon jäsen, 2026`, ['l', 'r', 'r', 'r'])}
<h2>Bonus ja lisäprosentti</h2>
<p>Kertaluonteinen tulospalkkio maksetaan usein vuoden aikana niin, että palkat ylittävät verokortin tulorajan. Silloin työnantaja pidättää ylittävästä osasta lisäprosentin, joka on tällä palkalla ${h.num(LP, 1)} %. ${h.eur(BONUS)} bonuksesta pidätetään siis ${h.eur(BONUS_PIDATYS)} veroa, kun lopullinen lisävero on ${h.eur(BONUS_VERO)}. Lisäprosentti on suunniteltu juuri tätä tilannetta varten: se vastaa kutakuinkin rajaveroa, joten mittava jäännösvero tai palautus ei yleensä synny. Jos bonus on tiedossa jo alkuvuodesta, tulorajan voi nostaa OmaVerossa, jolloin koko vuoden prosentti nousee hieman eikä yksittäinen palkkapäivä kevene yllättäen.</p>
<h2>Korotuksen hinta työnantajalle</h2>
<p>Neuvottelupöydän toisella puolella korotus näyttää kalliimmalta kuin tilinauhassa. Työeläkemaksun työnantajan osuus on vuonna 2026 keskimäärin ${h.num(TA, 2)} % palkasta, joten jo ${h.eur(TARVE)} bruttokorotus lisää pelkkiä eläkemaksuja noin ${h.eur(TARVE * TA / 100)} kuukaudessa. Kun muistaa, että palkansaajalle jää korotuksesta käteen vain ${h.eur(TAVOITE)}, näkee, kuinka suuri kiila bruttokustannuksen ja käteen jäävän summan väliin syntyy. Siksi neuvottelutavoite kannattaa asettaa nettona ja muuntaa se bruttopalkaksi vasta lopuksi; ${h.a('bruttopalkka-laskuri', 'bruttopalkkalaskuri')} tekee muunnoksen kunnan ja kirkon jäsenyyden mukaan.</p>
<h2>Missä työtulovähennys on menossa</h2>
<p>${h.a('tyotulovahennys', 'Työtulovähennys')} on pudonnut enimmäismäärästä ${h.eur(TT.enimmaismaara)} jo ${h.num(R.tyotulovahennys)} euroon. Leikkaus jatkuu, kunnes puhdas ansiotulo saavuttaa ${h.eur(TT.pienenemisen_ylaraja)}, mikä vastaa noin ${h.eur((TT.pienenemisen_ylaraja + V.tulonhankkimisvahennys) / 12)} kuukausipalkkaa. Sen jälkeen vähennys pysyy samana ja rajavero kevenee hetkeksi, kunnes verotettava tulo ylittää valtion ylimmän portaan rajan ${h.eur(V.valtion_asteikko[4].alaraja)}. Mitä silloin tapahtuu, näkyy sivulla ${h.a('nettopalkka-5000', `nettopalkka ${h.eur(5000)}`)}. Kuntien prosentit löytyvät Verohallinnon ${h.src('vero_kunnat', 'kuntaluettelosta')}.</p>`,
  },
  en: {
    slug: 'net-salary-4000',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `Nearly half of each extra euro goes: what a raise or bonus is really worth at ${EN.eur(PALKKA)} a month.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: raises and bonuses`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: ${EN.eur(KK)} take-home and a ${EN.num(R.veroprosentti, 1)}% card, but a ${EN.pct(RAJA)} marginal rate. What a raise or bonus really adds to your pay.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `At four thousand a month, the rate on your tax card and the tax on your next euro tell very different stories.`,
    resume: `For a Helsinki resident, ${EN.eur(PALKKA)} gross a month means about ${EN.eur(KK)} net a month in 2026, with ${EN.num(R.veroprosentti, 1)}% printed on the tax card (verokortti). That average hides what happens to extra pay. Taxable income of roughly ${EN.eur(R.verotettava)} puts your top euros in the ${EN.num(PORRAS.prosentti, 2)}% state band, which begins at ${EN.eur(PORRAS.alaraja)}. The earned income tax credit (työtulovähennys), now ${EN.eur(R.tyotulovahennys)}, shrinks by ${EN.num(TT.pienenemisprosentti)} cents for every additional euro. Add Helsinki's ${EN.num(HKI, 2)}% municipal tax, the health care and daily allowance contributions, plus pension and unemployment insurance, and a ${EN.eur(100)} raise puts only ${EN.eur(KOR[0].lisa, 2)} in your pocket. Your marginal rate is about ${EN.pct(RAJA)}, nearly three times the card figure. Pay above the income limit on your card, such as a performance bonus, is withheld at the additional rate (lisäprosentti) of ${EN.num(LP, 1)}%. Negotiating a raise in Finland at this level, it pays to think in net terms.`,
    faqs: [
      { q: `How much of a raise do I keep on ${EN.eur(PALKKA)} a month in Finland?`, a: `About ${EN.eur(KOR[0].lisa, 2)} of a ${EN.eur(100)} monthly raise and ${EN.eur(KOR[2].lisa)} of a ${EN.eur(500)} raise. The whole increase is taxed at your top marginal rate: the ${EN.num(PORRAS.prosentti, 2)}% state band, municipal tax, the work credit taper and payroll contributions. A ${EN.eur(500)} raise would lift your card rate to ${EN.num(KOR[2].vp, 1)}%.` },
      { q: `Why was so much tax taken from my ${EN.eur(BONUS)} bonus?`, a: `Once your pay passes the income limit on your tax card, the employer uses the additional rate, here ${EN.num(LP, 1)}%, so ${EN.eur(BONUS_PIDATYS)} is withheld. The final tax on the bonus works out at ${EN.eur(BONUS_VERO)}, so the withholding is close to right. Pension and unemployment contributions come on top, leaving about ${EN.eur(BONUS_NETTO)} net.` },
      { q: `Is overtime worth it on a ${EN.eur(PALKKA)} salary in Finland?`, a: `Financially you keep a little over half. Overtime pay is salary, so the same ${EN.pct(RAJA)} marginal rate applies, and if it pushes you over your income limit it is withheld at ${EN.num(LP, 1)}%. If you expect regular overtime, order a revised tax card with a higher limit in MyTax (OmaVero) so withholding stays even across the year.` },
    ],
    body: (h) => `
<h2>Average rate versus the price of the next euro</h2>
<p>The ${h.num(R.veroprosentti, 1)}% on your card is an average over the whole salary. A raise does not spread across all your euros; it sits on top, where several charges overlap. Taxable income of about ${h.eur(R.verotettava)} has passed ${h.eur(PORRAS.alaraja)}, so the state takes ${h.num(PORRAS.prosentti, 2)}% of each new euro. Net earned income is inside the work credit taper zone between ${h.eur(TT.pienenemisraja)} and ${h.eur(TT.pienenemisen_ylaraja)}, which removes ${h.num(TT.pienenemisprosentti)} cents of credit per euro. Then come municipal tax, the ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)}% health care contribution, the ${h.num(V.paivarahamaksu_prosentti, 2)}% daily allowance contribution, the ${h.num(V.tyoelakemaksu_prosentti, 2)}% pension contribution and ${h.num(V.tyottomyysvakuutusmaksu_prosentti, 2)}% unemployment insurance. Because the contributions are deducted before tax, the percentages do not simply add up, so the table shows the engine's result instead: a little over half of each raise survives. If you are comparing a Finnish offer with a job abroad, compare net to net. More on this on the ${h.a('marginaalivero', 'marginal tax rate')} page.</p>
${h.table(['Raise / month', 'Extra net / month', 'Share kept', 'New card rate'], KOR.map((x) => [`+${h.eur(x.d)}`, h.eur(x.lisa, 2), h.pct(x.osuus), `${h.num(x.vp, 1)}%`]), `Starting from ${h.eur(PALKKA)} a month, Helsinki, no church membership, 2026`, ['l', 'r', 'r', 'r'])}
<h2>Bonuses and the additional rate</h2>
<p>Performance bonuses often push the year's pay past the income limit (tuloraja) on your card. The employer then withholds the additional rate, ${h.num(LP, 1)}% at this salary. On a ${h.eur(BONUS)} bonus that is ${h.eur(BONUS_PIDATYS)}, against a final extra tax of ${h.eur(BONUS_VERO)}. The additional rate is designed to track your marginal tax, so a large refund or residual tax rarely follows. If you know about the bonus early in the year, raise the limit in MyTax and the higher withholding is spread across all twelve payslips instead of one.</p>
<h2>How far the work credit has fallen</h2>
<p>The ${h.a('tyotulovahennys', 'earned income tax credit')} has dropped from its ${h.eur(TT.enimmaismaara)} maximum to ${h.eur(R.tyotulovahennys)}. It keeps falling until net earned income reaches ${h.eur(TT.pienenemisen_ylaraja)}, roughly a ${h.eur((TT.pienenemisen_ylaraja + V.tulonhankkimisvahennys) / 12)} monthly salary, and then stays flat. The marginal rate eases briefly after that, until taxable income crosses ${h.eur(V.valtion_asteikko[4].alaraja)} and the top state band takes over, as shown for ${h.a('nettopalkka-5000', `a ${h.eur(5000)} salary`)}. Municipal rates are in Vero's ${h.src('vero_kunnat', 'municipality list')}.</p>`,
  },
});
