import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kuukausiNetto, laskeVerot } from '../../lib/engine/vero';
import { lomapaivat, lomaraha } from '../../lib/engine/loma';
import { vanhempainraha } from '../../lib/engine/paivaraha';

const V = P.vero;
const TT = V.tyotulovahennys;
const PALKKA = 3000;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const KK = R.netto / 12;
/** Työtulovähennyksen pieneneminen 35 000 euron puhtaan ansiotulon jälkeen. */
const TTV = [2800, 2900, 3000, 3200, 3400].map((kk) => ({ kk, v: laskeVerot({ tulo: kk * 12, kunta: 'Helsinki' }) }));
const LEIKKAUS = TT.enimmaismaara - R.tyotulovahennys;
/** Lomaraha täydeltä lomavuodelta (TES-esimerkki, 50 % lomapalkasta). */
const PV = lomapaivat(12);
const LR = lomaraha(PALKKA, PV);
const RL = kuukausiNetto(PALKKA, { kunta: 'Helsinki', lomaraha: LR.lomaraha });
const LR_NETTO = RL.netto - R.netto;
/** Vanhempainraha: Kela laskee vuositulon, johon lomaraha kuuluu. */
const VR = vanhempainraha(PALKKA * 12 + LR.lomaraha);
const VP = P.vanhempainraha;
/** Etäisyys valtion asteikon kolmanteen portaaseen. */
const PORRAS3 = V.valtion_asteikko[2];
const VALI = PORRAS3.alaraja - R.verotettava;

export default definePage({
  id: 'nettopalkka-3000',
  group: 'palkka',
  order: 30,
  mini: 'nettoSumma',
  miniDefaults: { p: 3000 },
  related: ['nettopalkka-2500', 'nettopalkka-3500', 'lomaraha-laskuri', 'vanhempainpaivaraha-laskuri'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-3000',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Työtulovähennyksen leikkaus, lomarahan verotus ja vanhempainraha ${FI.eur(PALKKA)} kuukausipalkalla.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: lomaraha ja vanhempainraha`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: käteen ${FI.eur(KK)}, verokortissa ${FI.num(R.veroprosentti, 1)} %. Mitä lomarahasta jää käteen, ja paljonko vanhempainrahaa tällä palkalla maksetaan.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Kolmen tuhannen euron kohdalla työtulovähennys alkaa pienetä, ja kesän lomaraha verotetaan jo tuntuvasti.`,
    resume: `${FI.eur(PALKKA)} kuukausipalkasta jää helsinkiläiselle vuonna 2026 käteen keskimäärin ${FI.eur(KK)} kuussa, kun verokortin prosentti on ${FI.num(R.veroprosentti, 1)} % ja palkasta pidätetään lisäksi työeläke- ja työttömyysvakuutusmaksu. Vuositulo ${FI.eur(PALKKA * 12)} vie puhtaan ansiotulon ${FI.num(R.puhdasAnsiotulo)} euroon, eli juuri yli ${FI.eur(TT.pienenemisraja)} rajan, josta työtulovähennys alkaa pienetä ${FI.num(TT.pienenemisprosentti)} prosentilla. Leikkaus on tällä palkalla vasta ${FI.eur(LEIKKAUS)}, mutta jokainen lisäeuro kasvattaa sitä. Valtion asteikossa verotettava tulo, noin ${FI.eur(R.verotettava)}, on vielä ${FI.num(V.valtion_asteikko[1].prosentti, 2)} prosentin portaalla. Kesällä maksettava lomaraha, työehtosopimuksen tavallisella ${FI.num(P.vuosiloma.lomaraha_esimerkki_prosentti)} prosentilla ${FI.eur(LR.lomaraha)}, nostaa vuositulon ja verotetaan samalla kortilla; siitä jää käteen noin ${FI.eur(LR_NETTO)}. Perhevapaalle jäävä saisi Kelalta vanhempainrahaa ${FI.eur(VR.pv, 2)} arkipäivältä ja ensimmäisiltä päiviltä korotettuna ${FI.eur(VR.korotettuPv, 2)}. Vanhempainraha on veronalaista tuloa kuten palkkakin, ja sen ajalta kertyy myös työeläkettä.`,
    faqs: [
      { q: `Paljonko ${FI.eur(LR.lomaraha)} lomarahasta jää käteen ${FI.eur(PALKKA)} palkalla?`, a: `Noin ${FI.eur(LR_NETTO)}, eli ${FI.pct(LR_NETTO / LR.lomaraha)} bruttosummasta. Lomaraha nostaa vuositulon ${FI.num(PALKKA * 12 + LR.lomaraha)} euroon, ja koko korotus osuu ylimpään verotettavaan tuloon, jossa sekä valtionvero että työtulovähennyksen leikkaus purevat. Lisäksi lomarahasta pidätetään työeläke- ja työttömyysvakuutusmaksu. Lomaraha ei perustu lakiin vaan työehtosopimukseen, joten summa voi poiketa.` },
      { q: `Paljonko vanhempainrahaa saa ${FI.eur(PALKKA)} kuukausipalkalla?`, a: `Kela laskee vuositulon, ${FI.eur(PALKKA * 12 + LR.lomaraha)} lomarahan kanssa, ja vähentää siitä ${FI.num(VP.vakuutusmaksuvahennys_prosentti, 2)} %. Tuloksena on ${FI.eur(VR.pv, 2)} arkipäivältä, maanantaista lauantaihin. ${VP.korotetut_paivat_vanhempainraha} ensimmäiseltä vanhempainrahapäivältä ja raskausrahan ajalta korotettu määrä on ${FI.eur(VR.korotettuPv, 2)}. Päiväraha on veronalaista tuloa, ja Kela maksaa sen omalle tilillesi, ellei työnantaja maksa palkkaa vapaan ajalta.` },
      { q: `Kuinka lähellä ${FI.num(PORRAS3.prosentti, 2)} prosentin veroporras on ${FI.eur(PALKKA)} palkalla?`, a: `Hyvin lähellä. Verotettava tulo on noin ${FI.eur(R.verotettava)}, ja valtion asteikon seuraava porras alkaa ${FI.eur(PORRAS3.alaraja)} kohdalta. Väliin jää ${FI.eur(VALI)} vuodessa eli noin ${FI.eur(VALI / 12)} kuukaudessa. Kun palkka nousee tätä enemmän, ylittävästä osasta peritään valtionveroa ${FI.num(PORRAS3.prosentti, 2)} % aiemman ${FI.num(V.valtion_asteikko[1].prosentti, 2)} prosentin sijaan.` },
      { q: `Pieneneekö työtulovähennys jo ${FI.eur(PALKKA)} palkalla?`, a: `Pienenee hieman. Vähennys on täysimääräinen ${FI.eur(TT.enimmaismaara)}, kunnes puhdas ansiotulo ylittää ${FI.eur(TT.pienenemisraja)}. ${FI.eur(PALKKA)} palkalla puhdasta ansiotuloa on ${FI.eur(R.puhdasAnsiotulo)}, joten vähennystä leikataan ${FI.num(TT.pienenemisprosentti)} % ylittävästä osasta eli ${FI.eur(LEIKKAUS)}. ${FI.eur(3400)} palkalla leikkaus olisi jo ${FI.eur(TT.enimmaismaara - TTV[4].v.tyotulovahennys)}.` },
    ],
    body: (h) => `
<h2>Puhdas ansiotulo ylittää ${h.eur(TT.pienenemisraja)}</h2>
<p>Kolmen tuhannen euron kuukausipalkka on ensimmäinen palkkataso, jolla työtulovähennys alkaa kutistua. Vähennys lasketaan ${h.num(TT.prosentti)} prosenttina palkasta, kunnes se saavuttaa enimmäismäärän ${h.eur(TT.enimmaismaara)}, ja pysyy siinä niin kauan kuin puhdas ansiotulo jää alle ${h.eur(TT.pienenemisraja)}. Puhdas ansiotulo tarkoittaa palkkaa, josta on vähennetty tulonhankkimisvähennys ${h.eur(V.tulonhankkimisvahennys)} ja muut tulonhankkimiskulut. ${h.eur(PALKKA * 12)} vuosipalkalla se on ${h.eur(R.puhdasAnsiotulo)}, joten raja ylittyy ${h.num(R.puhdasAnsiotulo - TT.pienenemisraja)} eurolla ja vähennystä leikataan ${h.num(TT.pienenemisprosentti)} % tästä ylityksestä. Euromäärä, ${h.eur(LEIKKAUS)}, on vielä vaatimaton, mutta mekanismi kannattaa ymmärtää: jokainen tästä eteenpäin ansaittu euro maksaa paitsi kunnallis- ja valtionveron myös kaksi senttiä menetettyä vähennystä. Leikkaus jatkuu ylärajaan ${h.eur(TT.pienenemisen_ylaraja)} asti. Ammattiliiton jäsenmaksu tai työmatkakulut pienentävät puhdasta ansiotuloa ja voivat pitää vähennyksen kokonaan täytenä, mikä on hyvä syy ilmoittaa ne esitäytettyyn veroilmoitukseen. Vähennyksen säännöt on koottu sivulle ${h.a('tyotulovahennys', 'työtulovähennys')}.</p>
${h.table(['Kuukausipalkka', 'Puhdas ansiotulo', 'Työtulovähennys', 'Leikkaus', 'Veroprosentti'], TTV.map((x) => [h.eur(x.kk), h.eur(x.v.puhdasAnsiotulo), h.eur(x.v.tyotulovahennys), h.eur(TT.enimmaismaara - x.v.tyotulovahennys), `${h.num(x.v.veroprosentti, 1)} %`]), 'Vuositasolla, Helsinki, ei kirkon jäsen, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Lomaraha verotetaan ylimpänä eränä</h2>
<p>Täydestä lomanmääräytymisvuodesta kertyy ${h.num(PV)} lomapäivää. Kun lomapäivän palkka on kuukausipalkka jaettuna ${h.num(P.vuosiloma.lomakorvaus_jakaja_kk)}:llä, lomapalkka on ${h.eur(LR.lomapalkka)}, ja ${h.num(P.vuosiloma.lomaraha_esimerkki_prosentti)} prosentin lomaraha on ${h.eur(LR.lomaraha)}. Vuosilomalaki ei tunne lomarahaa, vaan se tulee työehtosopimuksesta, joten oman alan TES ratkaisee prosentin ja maksuajan. Verotuksessa lomaraha on tavallista palkkaa: se nostaa vuositulon, ja koska se tulee kaiken muun päälle, siitä maksetaan korkeimmat rajaverot. Käteen jää ${h.eur(LR_NETTO)}. Laske oma lomarahasi ${h.a('lomaraha-laskuri', 'lomarahalaskurilla')}.</p>
<h2>Seuraava veroporras odottaa</h2>
<p>Valtion asteikossa verotettava tulo on vielä ${h.num(V.valtion_asteikko[1].prosentti, 2)} prosentin portaalla, mutta raja ${h.eur(PORRAS3.alaraja)} on vain ${h.eur(VALI)} päässä. Jo noin ${h.eur(VALI / 12)} kuukausittainen korotus vie ylimmät eurot portaalle, jolla valtio perii ${h.num(PORRAS3.prosentti, 2)} %. Rajaveron hyppy ei koske koko palkkaa, vain rajan ylittävää osaa, joten nettopalkka ei koskaan laske korotuksen takia. Lomaraha kuitenkin nostaa verotettavan tulon ${h.num(RL.verotettava)} euroon, eli osa siitä verotetaan jo ylemmällä portaalla. Juuri siksi lomarahasta jää käteen suhteessa vähemmän kuin tavallisesta kuukausipalkasta.</p>
<h2>Vanhempainraha kolmen tuhannen palkalla</h2>
<p>Kela laskee vanhempainrahan vuositulosta, johon lomaraha kuuluu, ja vähentää palkkatulosta ensin ${h.num(VP.vakuutusmaksuvahennys_prosentti, 2)} %. Jäljelle jäävä ${h.eur(VR.vuositulo)} on alle rajan ${h.eur(VP.rajat[1])}, joten koko tulo korvataan ${h.num(VP.prosentit[0])} prosentilla ja jaetaan ${h.num(VP.jakaja)}:lla. Raskausrahan ${h.num(VP.raskausraha_paivat)} päivää ja vanhempainrahan ${h.num(VP.korotetut_paivat_vanhempainraha)} ensimmäistä päivää maksetaan korotettuina. Päiviä maksetaan ${h.num(VP.paivia_viikossa)} viikossa, joten kuukauteen osuu noin ${h.num(25)} maksupäivää. Tarkempi laskelma on ${h.a('vanhempainpaivaraha-laskuri', 'vanhempainrahalaskurissa')}. Vapaan aikana työeläkettä kertyy vanhempainrahasta, sillä eläkkeen perusteeksi luetaan ${h.num(P.elake.etuuskarttuma_prosentti_perusteesta.vanhempainraha)} % etuuden pohjana olevasta vuositulosta.</p>
${h.table(['Etuus', 'Euroa arkipäivältä', 'Noin kuukaudessa'], [
  ['Raskausraha ja korotetut päivät', h.eur(VR.korotettuPv, 2), h.eur(VR.korotettuPv * 25)],
  ['Vanhempainraha', h.eur(VR.pv, 2), h.eur(VR.kk)],
  ['Nykyinen bruttopalkka', '', h.eur(PALKKA)],
], `Vuositulo ${h.eur(PALKKA * 12 + LR.lomaraha)} lomarahan kanssa, ennen veroja, 2026`, ['l', 'r', 'r'])}`,
  },
  en: {
    slug: 'net-salary-3000',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `The earned income credit starts to shrink: holiday bonus tax and parental allowance at ${EN.eur(PALKKA)} a month.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: bonus and parental pay`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: ${EN.eur(KK)} take-home, ${EN.num(R.veroprosentti, 1)}% card rate, what survives of your summer holiday bonus and Kela's parental allowance.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `Three thousand a month is where Finland's work tax credit begins to taper and the summer bonus gets taxed hard.`,
    resume: `A monthly salary of ${EN.eur(PALKKA)} leaves around ${EN.eur(KK)} a month after tax and social contributions for a Helsinki resident in 2026, with a ${EN.num(R.veroprosentti, 1)}% rate on the tax card (verokortti). Annual pay of ${EN.eur(PALKKA * 12)} puts your net earned income at ${EN.eur(R.puhdasAnsiotulo)}, just past the ${EN.eur(TT.pienenemisraja)} point where the earned income tax credit (työtulovähennys) starts losing ${EN.num(TT.pienenemisprosentti)}% of the excess. The cut is only ${EN.eur(LEIKKAUS)} so far. Taxable income of about ${EN.eur(R.verotettava)} is still in the ${EN.num(V.valtion_asteikko[1].prosentti, 2)}% state band. Most collective agreements add a holiday bonus (lomaraha), typically ${EN.num(P.vuosiloma.lomaraha_esimerkki_prosentti)}% of holiday pay, which here is ${EN.eur(LR.lomaraha)} gross and about ${EN.eur(LR_NETTO)} net, because it lands on top of everything else. If you take family leave, Kela's parental allowance (vanhempainraha) on this income is ${EN.eur(VR.pv, 2)} per weekday, Monday to Saturday, and ${EN.eur(VR.korotettuPv, 2)} on the first, higher-rate days.`,
    faqs: [
      { q: `How much of a ${EN.eur(LR.lomaraha)} Finnish holiday bonus is left after tax?`, a: `About ${EN.eur(LR_NETTO)}, or ${EN.pct(LR_NETTO / LR.lomaraha)} of the gross amount, on a ${EN.eur(PALKKA)} salary. The bonus lifts annual income to ${EN.eur(PALKKA * 12 + LR.lomaraha)} and is taxed as your top slice, where state tax and the shrinking work credit both bite. Pension and unemployment contributions are also withheld from it. The bonus comes from your collective agreement, not the law, so check yours.` },
      { q: `What parental allowance does Kela pay on a ${EN.eur(PALKKA)} monthly salary?`, a: `Kela uses annual income, ${EN.eur(PALKKA * 12 + LR.lomaraha)} including holiday bonus, minus a ${EN.num(VP.vakuutusmaksuvahennys_prosentti, 2)}% contribution deduction. That gives ${EN.eur(VR.pv, 2)} per weekday. The ${VP.raskausraha_paivat} pregnancy allowance days and the first ${VP.korotetut_paivat_vanhempainraha} parental days are paid at ${EN.eur(VR.korotettuPv, 2)}. The allowance is taxable income, so plan for tax on it much as on salary.` },
      { q: `Does the earned income credit already shrink at ${EN.eur(PALKKA)} a month?`, a: `Slightly. It stays at its ${EN.eur(TT.enimmaismaara)} maximum until net earned income passes ${EN.eur(TT.pienenemisraja)}. At this salary net earned income is ${EN.eur(R.puhdasAnsiotulo)}, so ${EN.num(TT.pienenemisprosentti)}% of the excess, ${EN.eur(LEIKKAUS)}, is removed. At ${EN.eur(3400)} a month the reduction would reach ${EN.eur(TT.enimmaismaara - TTV[4].v.tyotulovahennys)}, and it keeps growing until ${EN.eur(TT.pienenemisen_ylaraja)}.` },
    ],
    body: (h) => `
<h2>The credit taper begins</h2>
<p>Finland's work tax credit is worth ${h.num(TT.prosentti)}% of your wages up to a ceiling of ${h.eur(TT.enimmaismaara)}, and it stays there while net earned income is below ${h.eur(TT.pienenemisraja)}. Net earned income is gross pay minus the automatic ${h.eur(V.tulonhankkimisvahennys)} work-expense deduction and any other expenses you claim. On ${h.eur(PALKKA * 12)} a year you land at ${h.eur(R.puhdasAnsiotulo)}, which is ${h.eur(R.puhdasAnsiotulo - TT.pienenemisraja)} over the line, so ${h.num(TT.pienenemisprosentti)}% of that overshoot is clawed back. The sum is small today, ${h.eur(LEIKKAUS)}, but it explains a hidden cost of every future raise: beyond this point, each extra euro pays state and municipal tax and also costs two cents of credit, up to ${h.eur(TT.pienenemisen_ylaraja)}. Trade union dues and commuting costs reduce net earned income and can keep the credit whole, so it is worth adding them to your pre-completed tax return (esitäytetty veroilmoitus). Details on the ${h.a('tyotulovahennys', 'earned income tax credit')} page.</p>
${h.table(['Monthly pay', 'Net earned income', 'Work credit', 'Taper', 'Card rate'], TTV.map((x) => [h.eur(x.kk), h.eur(x.v.puhdasAnsiotulo), h.eur(x.v.tyotulovahennys), h.eur(TT.enimmaismaara - x.v.tyotulovahennys), `${h.num(x.v.veroprosentti, 1)}%`]), 'Annual figures, Helsinki, no church membership, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Your summer bonus, taxed as the top slice</h2>
<p>A full holiday year earns ${h.num(PV)} days of leave. Holiday pay per day is the monthly salary divided by ${h.num(P.vuosiloma.lomakorvaus_jakaja_kk)}, so holiday pay totals ${h.eur(LR.lomapalkka)} and a ${h.num(P.vuosiloma.lomaraha_esimerkki_prosentti)}% bonus is ${h.eur(LR.lomaraha)}. The Annual Holidays Act does not create this bonus; your collective agreement (TES) does, and it decides the rate and when it is paid. For tax purposes it is ordinary salary on top of the rest, which is why only ${h.eur(LR_NETTO)} reaches you. Run your own numbers in the ${h.a('lomaraha-laskuri', 'holiday bonus calculator')}.</p>
<h2>One band away from ${h.num(PORRAS3.prosentti, 2)}%</h2>
<p>Your regular salary keeps taxable income about ${h.eur(VALI)} below the ${h.eur(PORRAS3.alaraja)} threshold of the next state band. The bonus closes that gap: with it, taxable income reaches ${h.eur(RL.verotettava)}, so part of the bonus is charged at ${h.num(PORRAS3.prosentti, 2)}% state tax instead of ${h.num(V.valtion_asteikko[1].prosentti, 2)}%. Only the slice above the threshold pays the higher rate, so a raise can never make you poorer, but it does mean a monthly raise of roughly ${h.eur(VALI / 12)} would put you in that band all year.</p>
<h2>Parental leave on this salary</h2>
<p>Kela's annual income includes the bonus and is reduced by ${h.num(VP.vakuutusmaksuvahennys_prosentti, 2)}% first. The result, ${h.eur(VR.vuositulo)}, is below ${h.eur(VP.rajat[1])}, so all of it is compensated at ${h.num(VP.prosentit[0])}% and divided by ${h.num(VP.jakaja)}. Payment covers ${h.num(VP.paivia_viikossa)} days a week, about ${h.num(25)} days in a month. Model different start dates in the ${h.a('vanhempainpaivaraha-laskuri', 'parental allowance calculator')}. Leave does not stop your pension from growing: the earnings-related pension counts ${h.num(P.elake.etuuskarttuma_prosentti_perusteesta.vanhempainraha)}% of the annual income behind the allowance as pensionable pay.</p>
${h.table(['Benefit', 'Per weekday', 'About per month'], [
  ['Pregnancy allowance and higher-rate days', h.eur(VR.korotettuPv, 2), h.eur(VR.korotettuPv * 25)],
  ['Parental allowance', h.eur(VR.pv, 2), h.eur(VR.kk)],
  ['Current gross salary', '', h.eur(PALKKA)],
], `Annual income ${h.eur(PALKKA * 12 + LR.lomaraha)} with holiday bonus, before tax, 2026`, ['l', 'r', 'r'])}`,
  },
});
