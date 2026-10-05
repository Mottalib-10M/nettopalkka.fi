import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kuukausiNetto } from '../../lib/engine/vero';
import { kunta } from '../../lib/engine/params';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { yleistukiKk } from '../../lib/engine/paivaraha';

const V = P.vero;
const PALKKA = 2000;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const HKI = kunta('Helsinki').kunta;
const KK = R.netto / 12;
/** Kunnallisvero ja sairaanhoitomaksu ennen kuin työtulovähennyksen ylijäämä vähennetään niistä. */
const KV0 = R.verotettava * HKI / 100;
const SHM0 = R.verotettava * V.sairaanhoitomaksu_palkka_prosentti / 100;
const YLI = R.tyotulovahennys - R.valtionveroEnnen;
const OSA = kuukausiNetto(PALKKA * 0.75, { kunta: 'Helsinki' });
const YT = yleistukiKk();

/** Asumistuki 2 000 euron bruttotuloilla eri ruokakunnissa. */
const AT = [
  { fi: 'Yksin asuva', en: 'Single adult', kunta: 'Helsinki', a: 1, l: 0, vuokra: 900 },
  { fi: 'Yksinhuoltaja, 1 lapsi', en: 'Single parent, 1 child', kunta: 'Helsinki', a: 1, l: 1, vuokra: 1000 },
  { fi: 'Yksinhuoltaja, 2 lasta', en: 'Single parent, 2 children', kunta: 'Tampere', a: 1, l: 2, vuokra: 950 },
  { fi: 'Pariskunta, 2 lasta, yksi palkka', en: 'Couple, 2 children, one wage', kunta: 'Pomarkku', a: 2, l: 2, vuokra: 900 },
].map((x) => ({ ...x, raja: tuloraja(x.kunta, x.a, x.l), tuki: asumistuki({ kunta: x.kunta, aikuiset: x.a, lapset: x.l, tulot: PALKKA, vuokra: x.vuokra }).tuki }));
const YH1 = AT[1];

export default definePage({
  id: 'nettopalkka-2000',
  group: 'palkka',
  order: 10,
  mini: 'nettoSumma',
  miniDefaults: { p: 2000 },
  related: ['nettopalkka-2500', 'perusvahennys', 'asumistuki-tulot', 'yleistuki'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-2000',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Pienen palkan verotus: työtulovähennys, perusvähennys ja asumistuki ${FI.eur(PALKKA)} kuukausipalkalla.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: pieni vero ja asumistuki`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: käteen noin ${FI.eur(KK)}, veroprosentti ${FI.num(R.veroprosentti, 1)} %. Katso, miksi valtionveroa ei jää lainkaan ja milloin Kelan asumistukea voi saada.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Kahden tuhannen euron palkalla vähennykset tekevät suurimman työn, ja Kelan tuet voivat vielä täydentää tuloa.`,
    resume: `${FI.eur(PALKKA)} bruttopalkasta jää vuonna 2026 helsinkiläiselle käteen keskimäärin ${FI.eur(KK)} kuukaudessa, ja verokortin ennakonpidätysprosentti on vain ${FI.num(R.veroprosentti, 1)} %. Näin pieni prosentti johtuu kahdesta vähennyksestä. Työtulovähennys on täysimääräinen ${FI.eur(R.tyotulovahennys)}, mikä ylittää koko valtion tuloveron, joten valtionveroa ei makseta lainkaan ja ylimenevä osa pienentää kunnallisveroa ja sairaanhoitomaksua. Perusvähennys on yhä voimassa ${FI.eur(R.perusvahennys)} suuruisena eli se pienentää verotettavaa tuloa edelleen, koska vuotuinen ${FI.eur(PALKKA * 12)} jää sen poistumisrajan alle. Suurin palkasta tehtävä pidätys ei siksi ole vero vaan työeläkemaksu ${FI.p(V.tyoelakemaksu_prosentti)} ja työttömyysvakuutusmaksu ${FI.p(V.tyottomyysvakuutusmaksu_prosentti)}. Kelan yleinen asumistuki ei yleensä kuulu yksin asuvalle tällä palkalla, sillä yhden hengen ruokakunnan tuloraja on Helsingissä ${FI.eur(AT[0].raja)} kuussa, mutta yksinhuoltajalle samasta palkasta voi jäädä tukea, ${FI.eur(YH1.tuki, 2)} kuukaudessa ${FI.eur(YH1.vuokra)} vuokralla. Lapsiperheen tuloraja on aina korkeampi, koska jokainen lapsi kasvattaa omavastuuttoman tulon osuutta.`,
    faqs: [
      { q: `Miksi ${FI.eur(PALKKA)} palkasta ei mene valtionveroa?`, a: `Verotettavaa tuloa jää noin ${FI.eur(R.verotettava)}, josta valtion asteikon mukainen vero olisi ${FI.eur(R.valtionveroEnnen)}. Työtulovähennys, ${FI.p(V.tyotulovahennys.prosentti, 0)} palkasta mutta enintään ${FI.eur(V.tyotulovahennys.enimmaismaara)}, vähennetään ensin juuri valtionverosta, joten se kuittaa veron kokonaan. Ylimenevä ${FI.eur(YLI)} siirtyy kunnallisveroon ja sairaanhoitomaksuun niiden suhteessa.` },
      { q: `Saako ${FI.eur(PALKKA)} kuussa tienaava yksinhuoltaja asumistukea?`, a: `Usein saa. Kela laskee perusomavastuun bruttotuloista, ja yhden aikuisen ja yhden lapsen ruokakunnan tuloraja on Helsingissä ${FI.eur(YH1.raja)} kuukaudessa. ${FI.eur(PALKKA)} palkalla ja ${FI.eur(YH1.vuokra)} vuokralla tukea jää ${FI.eur(YH1.tuki, 2)} kuussa. Lomaraha ja ylityökorvaukset lasketaan tuloiksi, joten vuoden keskiarvo voi nostaa omavastuuta.` },
      { q: `Paljonko osa-aikatyöstä jää käteen, jos täysi palkka olisi ${FI.eur(PALKKA)}?`, a: `Kolmen neljäsosan työajalla bruttopalkka on ${FI.eur(PALKKA * 0.75)}, ja siitä jää Helsingissä käteen noin ${FI.eur(OSA.netto / 12)} kuukaudessa. Veroprosentti putoaa ${FI.num(OSA.veroprosentti, 1)} prosenttiin, koska perusvähennys kasvaa tulon pienentyessä. Työeläke- ja työttömyysvakuutusmaksu pidätetään kuitenkin samalla prosentilla jokaisesta eurosta, joten niiden osuus kaikista pidätyksistä kasvaa, kun tunteja on vähemmän.` },
      { q: `Kannattaako ${FI.eur(PALKKA)} palkalla tilata uusi verokortti?`, a: `Vain jos tulot muuttuvat. Jos vuoden ansiot jäävät ${FI.eur(PALKKA * 12)} tasolle, ${FI.num(R.veroprosentti, 1)} prosentin kortti pidättää lähes oikean määrän, ja pyöristys ylöspäin palauttaa pienen erotuksen veronpalautuksena. Toisen työn tai kesän lisätuntien takia tuloraja kannattaa nostaa, ettei ylittävästä osasta pidätetä lisäprosenttia.` },
    ],
    body: (h) => `
<h2>Kun vähennys on suurempi kuin vero</h2>
<p>Pienen palkan verotuksessa ratkaisee järjestys. Verohallinto laskee ensin valtion tuloveron verotettavasta tulosta, joka on ${h.eur(PALKKA)} kuukausipalkalla noin ${h.eur(R.verotettava)} vuodessa, ja saa tulokseksi ${h.eur(R.valtionveroEnnen)}. Sen jälkeen työtulovähennys vähennetään juuri tästä verosta. Koska vähennys on täysi ${h.eur(R.tyotulovahennys)}, valtionvero häviää palkkalaskelmalta kokonaan ja ${h.eur(YLI)} jää yli. Tämä ylijäämä ei katoa, vaan sillä pienennetään kunnallisveroa ja sairaanhoitomaksua samassa suhteessa kuin ne on määrätty. Lopputulos näkyy verokortissa: prosentti on ${h.num(R.veroprosentti, 1)} %, vaikka kunnallisveroprosentti yksinään on Helsingissä ${h.num(HKI, 2)} %. Pidätysten suurin osa ei siis mene verottajalle vaan eläkevakuutukseen ja työttömyysturvaan, joiden prosentit eivät jousta tulon mukaan. Sama mekanismi koskee kaikkia, joiden vuositulo jää noin kahteenkymmeneenviiteen tuhanteen euroon; kunnallisveron taso määrää, kuinka paljon ylijäämää jää käytettäväksi.</p>
${h.table(['Erä vuodessa', 'Ennen työtulovähennystä', 'Lopullinen'], [
  ['Valtion tulovero', h.eur(R.valtionveroEnnen), h.eur(R.valtionvero)],
  [`Kunnallisvero (${h.num(HKI, 2)} %)`, h.eur(KV0), h.eur(R.kunnallisvero)],
  ['Sairaanhoitomaksu', h.eur(SHM0), h.eur(R.sairaanhoitomaksu)],
  ['Päivärahamaksu', h.eur(R.paivarahamaksu), h.eur(R.paivarahamaksu)],
  ['Yle-vero', h.eur(R.yle), h.eur(R.yle)],
  ['Työtulovähennys', '', `−${h.eur(R.tyotulovahennys)}`],
], `${h.eur(PALKKA * 12)} vuosipalkka, Helsinki, ei kirkon jäsen, 2026`, ['l', 'r', 'r'])}
<h2>Perusvähennys vielä mukana</h2>
<p>Toinen pientä palkkaa suojaava vähennys on ${h.a('perusvahennys', 'perusvähennys')}. Sen enimmäismäärä on ${h.eur(V.perusvahennys.enimmaismaara)}, ja se pienenee ${h.num(V.perusvahennys.pienenemisprosentti)} prosentilla siitä osasta tuloa, joka ylittää saman rajan. Tällä palkalla vähennystä on jäljellä ${h.eur(R.perusvahennys)}, joten se laskee verotettavaa tuloa sekä kunnallis- että valtionverotuksessa. Vähennys myönnetään automaattisesti, eikä sitä tarvitse hakea OmaVerossa. Muutaman sadan euron korotus syö sitä nopeasti, mikä selittää, miksi seuraavalla palkkatasolla veroprosentti nousee jyrkemmin kuin tulo.</p>
<h2>Asumistuki ruokakunnan koon mukaan</h2>
<p>Kelan yleisessä asumistuessa tulot katsotaan bruttona, eikä palkasta tehdä enää erillistä ansiotulovähennystä. Tuki on ${h.num(P.asumistuki.tukiprosentti)} % hyväksyttävien asumismenojen ja perusomavastuun erotuksesta, eikä alle ${h.eur(P.asumistuki.pienin_maksettava)} tukea makseta. Ratkaisevaa on ruokakunnan koko: sama palkka, joka sulkee yksin asuvan tuen ulkopuolelle, jättää lapsiperheelle selvän summan. Tarkemmat rajat ovat sivulla ${h.a('asumistuki-tulot', 'asumistuki ja tulot')}.</p>
${h.table(['Ruokakunta', 'Kunta', 'Vuokra', 'Tuloraja / kk', 'Asumistuki / kk'], AT.map((x) => [x.fi, x.kunta, h.eur(x.vuokra), h.eur(x.raja), h.eur(x.tuki, 2)]), `Bruttotulot ${h.eur(PALKKA)} kuukaudessa, vesi ja lämpö vuokrassa, 2026`, ['l', 'l', 'r', 'r', 'r'])}
<h2>Osa-aikatyö ja työttömyysturva</h2>
<p>Moni ${h.eur(PALKKA)} palkka on osa-aikaisen tai tuntipalkkaisen työn tulos. Työttömyysturvan työssäoloehtoon kelpaa kuukausi, jona palkkaa on maksettu vähintään ${h.eur(P.tyottomyys.tyossaoloehto_palkka_kk)}, joten tämä palkkataso kerryttää ehtoa täysinä kuukausina. Jos työ loppuu ennen kuin ehto täyttyy, Kelan ${h.a('yleistuki', 'yleistuki')} on ${h.eur(P.tyottomyys.yleistuki_pv, 2)} päivässä eli keskimäärin ${h.eur(YT, 2)} kuukaudessa ennen veroja. Se on alle puolet nykyisestä nettopalkasta, mikä kannattaa tietää ennen kuin vaihtaa pysyvästä työstä määräaikaiseen. Yleistuesta maksetaan veroa samalla tavalla kuin palkasta, joten käteen jäävä summa on vielä pienempi. Verokortin kunnallisveroprosentit löytyvät Verohallinnon ${h.src('vero_kunnat', 'kuntien veroprosenttitaulukosta')}.</p>`,
  },
  en: {
    slug: 'net-salary-2000',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `Low-wage taxation in Finland: earned income credit, basic deduction and housing allowance at ${EN.eur(PALKKA)} a month.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: low tax, Kela support`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: about ${EN.eur(KK)} take-home and a ${EN.num(R.veroprosentti, 1)}% tax card. See why no state tax is due and which families still get Kela help.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `At this wage, deductions do most of the work, and a Kela benefit may still top up a family budget.`,
    resume: `A gross salary of ${EN.eur(PALKKA)} a month leaves about ${EN.eur(KK)} a month in your account in Helsinki in 2026, and your tax card (verokortti) shows a withholding rate of just ${EN.num(R.veroprosentti, 1)}%. That low figure has a simple cause: the earned income tax credit (työtulovähennys) of ${EN.eur(R.tyotulovahennys)} is larger than the entire state income tax you would owe, so state tax drops to zero and the leftover credit trims your municipal tax and health care contribution. On top of that, the basic deduction (perusvähennys) is still worth ${EN.eur(R.perusvahennys)} on ${EN.eur(PALKKA * 12)} a year. What actually comes off your payslip is mostly social insurance: the pension contribution of ${EN.p(V.tyoelakemaksu_prosentti)} and unemployment insurance of ${EN.p(V.tyottomyysvakuutusmaksu_prosentti)}. A single person living alone usually earns too much for Kela's general housing allowance (yleinen asumistuki), because the Helsinki limit for one is ${EN.eur(AT[0].raja)} a month, yet a single parent on the same pay paying ${EN.eur(YH1.vuokra)} rent can still receive ${EN.eur(YH1.tuki, 2)}.`,
    faqs: [
      { q: `Why does my Finnish payslip show no state tax on ${EN.eur(PALKKA)} a month?`, a: `Your taxable income is around ${EN.eur(R.verotettava)} a year, which would produce ${EN.eur(R.valtionveroEnnen)} of state tax. The earned income credit, ${EN.p(V.tyotulovahennys.prosentti, 0)} of wages capped at ${EN.eur(V.tyotulovahennys.enimmaismaara)}, is subtracted from state tax before anything else, so it cancels it. The remaining ${EN.eur(YLI)} of credit is then spread over municipal tax and the health care contribution.` },
      { q: `Can a single parent earning ${EN.eur(PALKKA)} gross get housing allowance from Kela?`, a: `Often yes. Kela uses gross income, and for one adult with one child in Helsinki the cut-off is ${EN.eur(YH1.raja)} a month. With ${EN.eur(PALKKA)} of pay and ${EN.eur(YH1.vuokra)} rent the allowance comes to ${EN.eur(YH1.tuki, 2)} a month. Holiday bonus and overtime count as income, so a high summer month can raise the yearly average Kela uses.` },
      { q: `How much is take-home pay on a 75% part-time contract worth ${EN.eur(PALKKA)} full-time?`, a: `Three quarters of the hours means ${EN.eur(PALKKA * 0.75)} gross, which leaves roughly ${EN.eur(OSA.netto / 12)} a month in Helsinki. Your withholding rate falls to ${EN.num(OSA.veroprosentti, 1)}% because the basic deduction grows as income shrinks. Pension and unemployment contributions stay at the same percentage on every euro, so they take a larger share of the deductions.` },
    ],
    body: (h) => `
<h2>The credit that outgrows the tax</h2>
<p>For someone new to Finnish payroll, the striking thing about ${h.eur(PALKKA)} a month is how little income tax there is. Vero works out state income tax first, on taxable income of about ${h.eur(R.verotettava)} a year, and arrives at ${h.eur(R.valtionveroEnnen)}. The earned income credit is then applied against that state tax. At full size it is ${h.eur(R.tyotulovahennys)}, so state tax is wiped out and ${h.eur(YLI)} is left unused. Finnish law does not waste that surplus: it reduces municipal tax and the health care contribution in proportion to their size. That is why your tax card reads ${h.num(R.veroprosentti, 1)}% even though Helsinki's municipal rate alone is ${h.num(HKI, 2)}%. Most of what leaves your gross pay goes to your earnings-related pension and unemployment cover, two contributions charged at a flat rate however little you earn. If you moved from a country with a high personal allowance, this pattern will feel familiar; the difference is that here it is delivered through credits rather than a tax-free band.</p>
${h.table(['Annual item', 'Before the credit', 'After the credit'], [
  ['State income tax', h.eur(R.valtionveroEnnen), h.eur(R.valtionvero)],
  [`Municipal tax (${h.num(HKI, 2)}%)`, h.eur(KV0), h.eur(R.kunnallisvero)],
  ['Health care contribution', h.eur(SHM0), h.eur(R.sairaanhoitomaksu)],
  ['Daily allowance contribution', h.eur(R.paivarahamaksu), h.eur(R.paivarahamaksu)],
  ['Yle tax', h.eur(R.yle), h.eur(R.yle)],
  ['Earned income credit', '', `−${h.eur(R.tyotulovahennys)}`],
], `${h.eur(PALKKA * 12)} a year, Helsinki, no church membership, 2026`, ['l', 'r', 'r'])}
<h2>A basic deduction that is about to vanish</h2>
<p>The ${h.a('perusvahennys', 'basic deduction')} starts at ${h.eur(V.perusvahennys.enimmaismaara)} and shrinks by ${h.num(V.perusvahennys.pienenemisprosentti)} cents for every euro of income above that amount. On this salary ${h.eur(R.perusvahennys)} remains. A raise of a few hundred euros a month removes it entirely, which is why the next pay level sees the withholding rate climb faster than the salary itself.</p>
<h2>Housing allowance depends on who lives with you</h2>
<p>Kela pays ${h.num(P.asumistuki.tukiprosentti)}% of the gap between accepted housing costs and a household's own share, worked out from gross income, and nothing below ${h.eur(P.asumistuki.pienin_maksettava)} a month. Household size is what moves the result. The same pay that rules out a single tenant leaves a meaningful sum for a family. Thresholds by household are explained on ${h.a('asumistuki-tulot', 'housing allowance and income')}.</p>
${h.table(['Household', 'Municipality', 'Rent', 'Income limit / month', 'Allowance / month'], AT.map((x) => [x.en, x.kunta, h.eur(x.vuokra), h.eur(x.raja), h.eur(x.tuki, 2)]), `Gross income ${h.eur(PALKKA)} a month, water and heating included in rent, 2026`, ['l', 'l', 'r', 'r', 'r'])}
<h2>If the contract ends</h2>
<p>Each month paid at least ${h.eur(P.tyottomyys.tyossaoloehto_palkka_kk)} counts in full towards the employment condition for unemployment benefit, so this wage builds entitlement at full speed. Until you meet it, the fallback is Kela's ${h.a('yleistuki', 'general support (yleistuki)')} of ${h.eur(P.tyottomyys.yleistuki_pv, 2)} a day, around ${h.eur(YT, 2)} a month before tax, under half your current take-home. Municipal rates for your own tax card are listed in Vero's ${h.src('vero_kunnat', 'municipal tax rate table')}.</p>`,
  },
});

