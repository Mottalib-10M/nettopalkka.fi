import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { netto, MANNER, MEDIAANI } from '../../lib/esimerkit';

const LAH = kunta('Lahti');
const HKI = kunta('Helsinki');
const ALEMPIA = MANNER.filter((k) => k.kunta < LAH.kunta).length;
const M = P.vero.matkakulut;
const EHDOTUS = P.kotitalousvahennys.esitys_matkakulut_omavastuu;

const KK = [2500, 3500, 5000];
const PAIJAT = ['Lahti', 'Asikkala', 'Heinola', 'Hollola', 'Orimattila'];
const L35 = netto(3500, 'Lahti');

const VUOSI = 42000;
const LIPPU = 2400;
const KM = 50, PAIVAT = 200;
const AUTO = KM * 2 * PAIVAT * M.oma_auto_euroa_km;
const pohja = laskeVerot({ tulo: VUOSI, kunta: 'Lahti' });
const lippu = laskeVerot({ tulo: VUOSI, kunta: 'Lahti', matkakulut: LIPPU });
const auto = laskeVerot({ tulo: VUOSI, kunta: 'Lahti', matkakulut: AUTO });
const hki = laskeVerot({ tulo: VUOSI, kunta: 'Helsinki' });
const SAASTO_LIPPU = pohja.verot - lippu.verot;
const SAASTO_AUTO = pohja.verot - auto.verot;
const VAHENNYS_LIPPU = Math.min(M.enimmaismaara, Math.max(0, LIPPU - M.omavastuu));
const VAHENNYS_AUTO = Math.min(M.enimmaismaara, Math.max(0, AUTO - M.omavastuu));
const ERO_HKI = pohja.verot - hki.verot;

export default definePage({
  id: 'lahti',
  group: 'kunnat',
  order: 90,
  tool: 'netto',
  toolPreset: { kunta: 'Lahti' },
  related: ['helsinki', 'tampere', 'kuntavertailu', 'matkakulut'],
  sources: ['vero_kunnat', 'vero_ennakonpidatys'],
  fi: {
    slug: 'nettopalkka-lahti',
    nav: 'Lahti',
    card: 'Lahden 8,60 %:n vero, edullisemmat naapurit ja pääkaupunkiseudulle pendelöivän matkakuluvähennys.',
    title: 'Nettopalkka Lahti 2026: kunnallisvero 8,60 % ja työmatkat',
    description: 'Nettopalkka Lahdessa 2026: kunnallisvero 8,60 %, Hollola 8,30 % ja Asikkala 8,10 %. Laske palkka ja katso, paljonko työmatkavähennys palauttaa pendelöijälle.',
    h1: 'Nettopalkka Lahdessa',
    intro: 'Lahteen asetettu laskuri: anna bruttopalkka ja matkakulut, niin näet nettotulon ja veroprosentin.',
    resume: `Lahdessa ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(L35.kkNettoTodellinen)} kuukaudessa ilman kirkollisveroa, lomarahaa ja matkakuluja, ja verokortin prosentti on ${FI.p(L35.veroprosentti, 1)}. Lahden tuloveroprosentti on ${FI.p(LAH.kunta)}, joten se on hieman maan mediaanikunnan ${FI.p(MEDIAANI)} alapuolella mutta korkeampi kuin naapureissa Hollolassa, Heinolassa ja Asikkalassa. Mannerkunnista ${ALEMPIA} verottaa Lahtea kevyemmin. Helsingin ${FI.p(HKI.kunta)} prosenttiin verrattuna lahtelainen maksaa ${FI.eur(VUOSI)} vuosipalkasta ${FI.eur(ERO_HKI)} enemmän veroa. Pääkaupunkiseudulle pendelöivä voi kuitenkin vähentää asunnon ja työpaikan väliset matkakulut siltä osin kuin ne ylittävät ${FI.eur(M.omavastuu)} omavastuun, enintään ${FI.eur(M.enimmaismaara)} vuodessa. Jos matkat maksavat vuodessa ${FI.eur(LIPPU)}, vähennys on ${FI.eur(VAHENNYS_LIPPU)} ja verot pienenevät ${FI.eur(SAASTO_LIPPU)}. Evankelis-luterilainen kirkollisvero on Lahdessa ${FI.p(LAH.evl)}. Verohallinto ottaa edellisen verotuksen matkakulut huomioon jo verokortin prosentissa.`,
    faqs: [
      { q: 'Paljonko Lahden kunnallisvero on vuonna 2026?', a: `Lahden kunnan tuloveroprosentti on ${FI.p(LAH.kunta)} vuonna 2026. Naapureista Asikkala perii ${FI.p(kunta('Asikkala').kunta)}, Heinola ${FI.p(kunta('Heinola').kunta)} ja Hollola ${FI.p(kunta('Hollola').kunta)}, Orimattila puolestaan ${FI.p(kunta('Orimattila').kunta)}. ${FI.eur(3500)} kuukausipalkalla lahtelaisen verokortin prosentti on ${FI.p(L35.veroprosentti, 1)}, jos ei kuulu kirkkoon eikä vähennä matkakuluja.` },
      { q: 'Paljonko Lahdesta Helsinkiin pendelöivä saa matkakuluvähennystä?', a: `Vähennys on vuoden matkakulut miinus ${FI.eur(M.omavastuu)} omavastuu, enintään ${FI.eur(M.enimmaismaara)}. Jos vuoden matkakulut ovat ${FI.eur(LIPPU)}, vähennys on ${FI.eur(VAHENNYS_LIPPU)}, ja ${FI.eur(VUOSI)} vuosipalkalla verot pienenevät noin ${FI.eur(SAASTO_LIPPU)}. Vähennys tehdään ansiotulosta, joten säästö riippuu omasta rajaveroprosentista eikä ole koko vähennyksen suuruinen.` },
      { q: 'Paljonko oman auton työmatkoista saa vähentää Lahdessa?', a: `Kun vähennys lasketaan oman auton käytön mukaan, Verohallinto käyttää ${FI.num(M.oma_auto_euroa_km, 2)} euroa kilometriltä. Esimerkiksi ${KM} kilometrin työmatka suuntaansa ${PAIVAT} päivänä tekee ${FI.eur(AUTO)}, josta vähennykseksi jää ${FI.eur(VAHENNYS_AUTO)} omavastuun jälkeen. ${FI.eur(VUOSI)} vuosipalkalla verot pienenevät noin ${FI.eur(SAASTO_AUTO)}. Viikonloppumatkoja ei lasketa.` },
      { q: 'Muuttuuko matkakulujen omavastuu vuonna 2026?', a: `Vuoden 2026 voimassa oleva omavastuu on ${FI.eur(M.omavastuu)}. Hallitus on esittänyt sen alentamista ${FI.eur(EHDOTUS)} euroon, mutta esitystä ei ollut hyväksytty lokakuun alkuun 2026 mennessä. Jos muutos hyväksytään, pendelöijän vähennys kasvaa ${FI.eur(M.omavastuu - EHDOTUS)}. Tämä laskuri käyttää voimassa olevaa ${FI.eur(M.omavastuu)} omavastuuta.` },
    ],
    body: (h) => `
<h2>Lahti verottaa enemmän kuin naapurinsa</h2>
<p>Päijät-Hämeen keskuskaupunki erottuu seudullaan korkeammalla prosentilla. Asikkalan ${h.pct(kunta('Asikkala').kunta / 100, 2)} on ${h.num(LAH.kunta - kunta('Asikkala').kunta, 2)} prosenttiyksikköä Lahtea pienempi, ja vain Orimattila perii taulukon kunnista enemmän. Luvut ovat kuukausinettoja ilman kirkollisveroa, lomarahaa ja matkakulujen vähennystä.</p>
${h.table(['Kunta', 'Veroprosentti', `${h.eur(KK[0])} brutto`, `${h.eur(KK[1])} brutto`, `${h.eur(KK[2])} brutto`], PAIJAT.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Kuukauden nettopalkka Lahdessa ja lähikunnissa 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Pendelöijän laskelma: Lahti ja Helsinki</h2>
<p>Lahden ja ${h.a('helsinki', 'Helsingin')} kunnallisveron ero on ${h.num(LAH.kunta - HKI.kunta, 2)} prosenttiyksikköä. Helsingissä asuva ei yleensä saa matkakuluista vähennystä, jos ne jäävät omavastuun alle, mutta Lahdesta pendelöivän kulut ylittävät sen helposti. Taulukossa on ${h.eur(VUOSI)} vuosipalkka eri tilanteissa.</p>
${h.table(['Tilanne', 'Matkakulut / v', 'Vähennys', 'Verot / v', 'Netto / kk'], [['Helsinki, ei vähennystä', h.eur(0), h.eur(0), h.eur(hki.verot), h.eur(hki.netto / 12)], ['Lahti, ei vähennystä', h.eur(0), h.eur(0), h.eur(pohja.verot), h.eur(pohja.netto / 12)], ['Lahti, junalla tai bussilla', h.eur(LIPPU), h.eur(VAHENNYS_LIPPU), h.eur(lippu.verot), h.eur(lippu.netto / 12)], [`Lahti, omalla autolla ${KM} km`, h.eur(AUTO), h.eur(VAHENNYS_AUTO), h.eur(auto.verot), h.eur(auto.netto / 12)]], `${h.eur(VUOSI)} vuosipalkka, ei kirkon jäsen, 2026`, ['l', 'r', 'r', 'r', 'r'])}
<p>Vähennys pienentää puhdasta ansiotuloa, joten se alentaa sekä valtion veroa että kunnallisveroa. ${h.src('vero_ennakonpidatys', 'Verohallinnon ennakonpidätyspäätöksen')} mukaan verokortin prosentti lasketaan edellisen vuoden verotuksessa vahvistetuilla matkakuluilla. Ensimmäisenä pendelöintivuonna kannattaa siksi tilata muutosverokortti ja ilmoittaa arvioidut kulut. Vähennyksen ehdot ovat ${h.a('matkakulut', 'matkakulujen vähennyksen sivulla')}, ja muiden kuntien prosentit ${h.a('kuntavertailu', 'kuntavertailussa')} ja ${h.src('vero_kunnat', 'Verohallinnon päätöksessä')}.</p>`,
  },
  en: {
    slug: 'net-salary-lahti',
    nav: 'Lahti',
    card: 'Lahti’s 8.60% tax, cheaper neighbours and the commuting deduction for those who work in the capital region.',
    title: 'Net Salary Lahti 2026: 8.60% Tax and Commuting Deduction',
    description: 'Net salary in Lahti for 2026: municipal tax 8.60%, Hollola 8.30%, Asikkala 8.10%. Calculate your pay and how much the commuting deduction gives back each year.',
    h1: 'Net salary in Lahti',
    intro: 'Calculator set to Lahti: enter gross pay and travel costs to see net income and your tax rate.',
    resume: `A ${EN.eur(3500)} monthly salary leaves a Lahti resident about ${EN.eur(L35.kkNettoTodellinen)} a month after tax in 2026, before any church tax, holiday bonus or travel deduction, with a tax card (verokortti) rate of ${EN.p(L35.veroprosentti, 1)}. Lahti’s municipal tax is ${EN.p(LAH.kunta)}: a little below the median municipality’s ${EN.p(MEDIAANI)}, but above neighbouring Hollola, Heinola and Asikkala. ${ALEMPIA} mainland municipalities tax less than Lahti. Compared with Helsinki’s ${EN.p(HKI.kunta)}, a Lahti resident on ${EN.eur(VUOSI)} a year pays ${EN.eur(ERO_HKI)} more tax. If you commute to a job in the capital region, though, you can deduct home-to-work travel costs (matkakulut) above a ${EN.eur(M.omavastuu)} deductible, up to ${EN.eur(M.enimmaismaara)} a year. With ${EN.eur(LIPPU)} of travel costs, the deduction is ${EN.eur(VAHENNYS_LIPPU)} and your tax falls by ${EN.eur(SAASTO_LIPPU)}. Lutheran church tax in Lahti is ${EN.p(LAH.evl)}. Vero builds last year’s confirmed travel costs into your withholding rate, so a new commuter should not wait for the annual refund.`,
    faqs: [
      { q: 'What is the municipal tax rate in Lahti for 2026?', a: `Lahti charges ${EN.p(LAH.kunta)} in 2026. Nearby, Asikkala charges ${EN.p(kunta('Asikkala').kunta)}, Heinola ${EN.p(kunta('Heinola').kunta)}, Hollola ${EN.p(kunta('Hollola').kunta)} and Orimattila ${EN.p(kunta('Orimattila').kunta)}. On ${EN.eur(3500)} a month, a Lahti tax card shows ${EN.p(L35.veroprosentti, 1)} for someone outside the church who claims no travel costs.` },
      { q: 'How much tax do I save commuting from Lahti to Helsinki?', a: `You deduct annual travel costs minus the ${EN.eur(M.omavastuu)} deductible, up to ${EN.eur(M.enimmaismaara)}. With ${EN.eur(LIPPU)} of costs the deduction is ${EN.eur(VAHENNYS_LIPPU)}, and on ${EN.eur(VUOSI)} a year your tax drops by about ${EN.eur(SAASTO_LIPPU)}. It is a deduction from income, not from tax, so the saving depends on your marginal rate.` },
      { q: 'Can I deduct driving my own car from Lahti to work?', a: `When the deduction is based on your own car, Vero uses ${EN.num(M.oma_auto_euroa_km, 2)} euros per kilometre. A ${KM} km trip each way on ${PAIVAT} days comes to ${EN.eur(AUTO)}, leaving ${EN.eur(VAHENNYS_AUTO)} after the deductible. On ${EN.eur(VUOSI)} a year that cuts tax by about ${EN.eur(SAASTO_AUTO)}. Weekend trips home do not count as commuting.` },
      { q: 'Is the commuting deductible changing in 2026?', a: `The deductible in force for 2026 is ${EN.eur(M.omavastuu)}. The government has proposed lowering it to ${EN.eur(EHDOTUS)}, but the proposal had not been passed by early October 2026. If it is, a commuter’s deduction grows by ${EN.eur(M.omavastuu - EHDOTUS)}. This calculator uses the ${EN.eur(M.omavastuu)} deductible currently in force.` },
    ],
    body: (h) => `
<h2>Lahti taxes more than its neighbours</h2>
<p>The main city of Päijät-Häme stands out in its area with a higher rate. Asikkala’s ${h.pct(kunta('Asikkala').kunta / 100, 2)} is ${h.num(LAH.kunta - kunta('Asikkala').kunta, 2)} points below Lahti, and of the towns in the table only Orimattila charges more. Figures are monthly net pay without church tax, holiday bonus or a travel deduction.</p>
${h.table(['Municipality', 'Tax rate', `${h.eur(KK[0])} gross`, `${h.eur(KK[1])} gross`, `${h.eur(KK[2])} gross`], PAIJAT.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Monthly net pay in Lahti and nearby municipalities, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>The commuter’s sums: Lahti against Helsinki</h2>
<p>Lahti’s municipal tax is ${h.num(LAH.kunta - HKI.kunta, 2)} points above ${h.a('helsinki', 'Helsinki')}. Someone living in Helsinki rarely gets a travel deduction, because short city trips stay under the deductible, while a commuter from Lahti clears it easily. The table shows a ${h.eur(VUOSI)} salary in different set-ups.</p>
${h.table(['Situation', 'Travel costs / yr', 'Deduction', 'Tax / yr', 'Net / month'], [['Helsinki, no deduction', h.eur(0), h.eur(0), h.eur(hki.verot), h.eur(hki.netto / 12)], ['Lahti, no deduction', h.eur(0), h.eur(0), h.eur(pohja.verot), h.eur(pohja.netto / 12)], ['Lahti, by train or bus', h.eur(LIPPU), h.eur(VAHENNYS_LIPPU), h.eur(lippu.verot), h.eur(lippu.netto / 12)], [`Lahti, own car ${KM} km`, h.eur(AUTO), h.eur(VAHENNYS_AUTO), h.eur(auto.verot), h.eur(auto.netto / 12)]], `${h.eur(VUOSI)} annual salary, no church membership, 2026`, ['l', 'r', 'r', 'r', 'r'])}
<p>The deduction lowers your net earned income, so it reduces both state and municipal tax. Under ${h.src('vero_ennakonpidatys', 'Vero’s withholding decision')}, your tax card rate uses the travel costs confirmed in last year’s assessment. In your first commuting year, order a revised tax card (muutosverokortti) and enter your estimated costs. The conditions are on the ${h.a('matkakulut', 'commuting deduction page')}; every municipal rate is in the ${h.a('kuntavertailu', 'municipal tax comparison')} and ${h.src('vero_kunnat', 'Vero’s official list')}.</p>`,
  },
});
