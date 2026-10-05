import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kansanelake, elakeNetto } from '../../lib/engine/elake';

const E = P.elake, K = E.kansanelake, T = E.takuuelake, AT = E.elakkeensaajan_asumistuki;
const TYOELAKKEET = [0, 100, 200, 300, 500, 700, 1000, 1300, 1700];
const RIVIT = TYOELAKKEET.map((te) => ({ te, y: kansanelake(te), p: kansanelake(te, { parisuhde: true }) }));
const netto = (brutto: number) => elakeNetto(brutto, 'Helsinki').kkNetto;
/** Täyteen kansaneläkkeeseen tarvittavat asumisvuodet (moottorin asumissuhde = 1). */
const TAYSI_V = K.asumisaika_vahintaan_v / kansanelake(0, { asumisvuodet: K.asumisaika_vahintaan_v }).asumissuhde;
const ASUMIS_TE = 300;
const ASUMIS = [K.asumisaika_vahintaan_v, 10, 20, 30, TAYSI_V].map((v) => ({ v, r: kansanelake(ASUMIS_TE, { asumisvuodet: v }) }));
const A10 = ASUMIS[1].r;
const E300 = kansanelake(ASUMIS_TE);
const NETTO_TAYSI = netto(T.taysi_kk);
const E1000 = kansanelake(1000);

export default definePage({
  id: 'takuuelake-laskuri',
  group: 'laskurit',
  order: 60,
  tool: 'kansanelake',
  related: ['elakelaskuri', 'elakkeen-verotus', 'keskimaarainen-elake', 'asumistuki-laskuri'],
  sources: ['kela_vanhuuselake', 'kela_takuuelake', 'kela_elaketaulukot', 'kela_indeksi'],
  fi: {
    slug: 'kansanelake-ja-takuuelake',
    nav: 'Kansaneläke ja takuueläke',
    card: 'Kelan kansaneläke ja takuueläke työeläkkeen, parisuhteen ja Suomessa asuttujen vuosien mukaan.',
    title: 'Takuueläke ja kansaneläke 2026: laskuri ja tulorajat',
    description: `Takuueläke ja kansaneläke 2026: laske Kelan eläkkeet työeläkkeesi ja asumisaikasi mukaan. Täysi takuueläke on ${FI.eur(T.taysi_kk, 2)}, kansaneläke ${FI.eur(K.yksin_kk, 2)} yksin asuvalle.`,
    h1: 'Kansaneläke- ja takuueläkelaskuri',
    intro: 'Syötä työeläkkeesi bruttona, parisuhde ja Suomessa asutut vuodet, niin näet Kelan eläkkeet ja kokonaiseläkkeen.',
    resume: `Vuonna 2026 kaikkien eläkkeiden yhteismäärä nousee Kelan takuueläkkeen ansiosta vähintään ${FI.eur(T.taysi_kk, 2)} kuukaudessa, kun olet asunut Suomessa vähintään ${K.asumisaika_vahintaan_v} vuotta. Täysi kansaneläke on ${FI.eur(K.yksin_kk, 2)} yksin asuvalle ja ${FI.eur(K.parisuhde_kk, 2)} avio- tai avoliitossa olevalle. Siitä vähennetään puolet siitä määrästä, jolla työeläkkeet ylittävät ${FI.eur(K.vahentamaton_raja_kk, 2)} kuukaudessa, joten kansaneläke loppuu, kun työeläke ylittää ${FI.eur(K.yla_raja_yksin_kk, 2)} yksin tai ${FI.eur(K.yla_raja_pari_kk, 2)} parisuhteessa. Takuueläke täydentää loput: se on ${FI.eur(T.taysi_kk, 2)} vähennettynä kaikilla muilla eläkkeillä bruttona, kansaneläke mukaan lukien, ja sitä maksetaan, kun eläkkeet ovat yhteensä enintään ${FI.eur(T.tuloraja_kk, 2)}. Alle ${FI.eur(T.pienin_maksettava_kk, 2)} eriä ei makseta. Esimerkiksi ${FI.eur(ASUMIS_TE)} työeläkkeellä yksin asuva saa ${FI.eur(E300.kansanelake, 2)} kansaneläkettä ja ${FI.eur(E300.takuuelake, 2)} takuueläkettä. Kelan eläkkeitä korotettiin kansaneläkeindeksin mukaan ${FI.p(E.indeksit.korotus_prosentti, 1)} vuoden alussa. Laskuri ottaa huomioon myös lyhyen asumisajan, joka pienentää kansaneläkettä mutta ei takuueläkettä, ja näyttää lopuksi kokonaiseläkkeen verojen jälkeen valitsemassasi kunnassa.`,
    faqs: [
      { q: 'Paljonko takuueläke on vuonna 2026?', a: `Täysi takuueläke on ${FI.eur(T.taysi_kk, 2)} kuukaudessa. Siitä vähennetään kaikki muut eläkkeesi bruttona, myös Kelan kansaneläke ja ulkomailta maksettavat eläkkeet. Takuueläkettä saa, jos eläkkeet ovat yhteensä enintään ${FI.eur(T.tuloraja_kk, 2)} kuukaudessa, ja alle ${FI.eur(T.pienin_maksettava_kk, 2)} määrää ei makseta. Kun työeläkettä ei ole lainkaan, yksin asuva saa ${FI.eur(RIVIT[0].y.kansanelake, 2)} kansaneläkettä ja ${FI.eur(RIVIT[0].y.takuuelake, 2)} takuueläkettä.` },
      { q: 'Kuinka suuri työeläke vie kansaneläkkeen kokonaan?', a: `Yksin asuvalla kansaneläke loppuu, kun työeläkkeet ylittävät ${FI.eur(K.yla_raja_yksin_kk, 2)} kuukaudessa, ja parisuhteessa olevalla raja on ${FI.eur(K.yla_raja_pari_kk, 2)}. Laskukaava on täysi kansaneläke miinus puolet ${FI.eur(K.vahentamaton_raja_kk, 2)} ylittävästä työeläkkeestä. ${FI.eur(1000)} työeläkkeellä yksin asuvalle jää ${FI.eur(E1000.kansanelake, 2)} kansaneläkettä, joten kokonaiseläke on ${FI.eur(E1000.yhteensa, 2)}.` },
      { q: 'Saako takuueläkettä, jos on asunut Suomessa vain kymmenen vuotta?', a: `Saa, kun Suomessa asuttua aikaa on vähintään ${K.asumisaika_vahintaan_v} vuotta. Lyhyt asumisaika pienentää kansaneläkettä suhteessa asuttuun aikaan, mutta takuueläke paikkaa vajeen. Kymmenen vuoden asumisajalla ja ${FI.eur(ASUMIS_TE)} työeläkkeellä kansaneläke on laskurin mukaan ${FI.eur(A10.kansanelake, 2)} ja takuueläke ${FI.eur(A10.takuuelake, 2)}, eli eläkkeet nousevat silti ${FI.eur(A10.yhteensa, 2)} kuukaudessa.` },
      { q: 'Pienentävätkö palkka tai puolison tulot takuueläkettä?', a: `Eivät pienennä. Kelan mukaan takuueläkkeeseen vaikuttavat vain omat eläkkeesi. Ansiotulot, pääomatulot, omaisuus ja puolison eläkkeet tai muut tulot eivät vähennä sitä. Puoliso vaikuttaa vain kansaneläkkeeseen, jonka täysi määrä on parisuhteessa ${FI.eur(K.parisuhde_kk, 2)} eikä ${FI.eur(K.yksin_kk, 2)}. Takuueläkkeen täysi määrä on sama kaikille.` },
      { q: 'Maksetaanko täydestä takuueläkkeestä veroa?', a: `Käytännössä ei. Kun kaikki eläkkeet ovat yhteensä ${FI.eur(T.taysi_kk, 2)} kuukaudessa, eläketulovähennys ${FI.eur(E.elaketulovahennys.taysi)} vuodessa ja perusvähennys vievät verotettavan tulon nollaan, ja laskurin mukaan Helsingissä käteen jää ${FI.eur(NETTO_TAYSI, 2)}. Veroa alkaa kertyä vasta suuremmasta kokonaiseläkkeestä, ja ${FI.eur(E1000.yhteensa, 2)} eläkkeestä jää käteen ${FI.eur(netto(E1000.yhteensa), 2)}.` },
    ],
    body: (h) => `
<h2>Kelan eläkkeet työeläkkeen mukaan</h2>
<p>Taulukon luvut ovat laskurin tuloksia täydellä asumisajalla. Yksin asuvan sarakkeissa on myös nettoeläke Helsingissä, kun henkilö ei kuulu kirkkoon. Parisuhteessa kansaneläkkeen täysi määrä on pienempi, mutta takuueläke tasaa kokonaiseläkkeen samaan ${h.eur(T.taysi_kk, 2)} vähimmäistasoon.</p>
${h.table(['Työeläke/kk', 'Kansaneläke', 'Takuueläke', 'Yhteensä', 'Netto', 'Parisuhteessa yht.'], RIVIT.map((x) => [h.eur(x.te), h.eur(x.y.kansanelake, 2), h.eur(x.y.takuuelake, 2), h.eur(x.y.yhteensa, 2), h.eur(netto(x.y.yhteensa), 2), h.eur(x.p.yhteensa, 2)]), 'Yksin asuva, täysi asumisaika, Kelan 2026 määrät', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Taulukosta näkyy kaksi kynnystä. Alle ${h.eur(K.vahentamaton_raja_kk, 2)} työeläke ei pienennä kansaneläkettä lainkaan. Sen yläpuolella jokainen työeläke-euro vie kansaneläkkeestä 50 senttiä, ja takuueläke kuroo eron umpeen, kunnes kokonaiseläke ylittää takuueläkkeen tason. Siitä eteenpäin työeläkkeen kasvu nostaa kokonaiseläkettä puolella eurolla jokaista euroa kohden, kunnes kansaneläke loppuu.</p>
<h2>Suomessa asutut vuodet</h2>
<p>Kansaneläkkeen saa täysimääräisenä, jos Suomessa asuttua aikaa on vähintään ${h.num(K.tayden_asumisaikasuhde * 100)} % laskenta-ajasta, mikä tarkoittaa noin ${h.num(TAYSI_V, 1)} vuotta. Lyhyempi asumisaika suhteuttaa kansaneläkkeen. Takuueläkettä ei suhteuteta, joten se täydentää pienen kansaneläkkeen samaan tasoon. Tällä on merkitystä erityisesti aikuisena Suomeen muuttaneille.</p>
${h.table(['Asuttu Suomessa', 'Kansaneläke', 'Takuueläke', 'Yhteensä'], ASUMIS.map((x) => [`${h.num(x.v, x.v % 1 ? 1 : 0)} v`, h.eur(x.r.kansanelake, 2), h.eur(x.r.takuuelake, 2), h.eur(x.r.yhteensa, 2)]), `Työeläke ${h.eur(ASUMIS_TE)}/kk, yksin asuva`, ['l', 'r', 'r', 'r'])}
<p>Laskurin asumisvuosikenttään syötetään Suomessa asuttu aika ennen eläkettä. Ulkomailta maksettava eläke kirjoitetaan työeläkkeen kenttään, koska sekin pienentää takuueläkettä. Asumisaikaa koskevat ehdot ovat ${h.src('kela_vanhuuselake', 'Kelan vanhuuseläkesivulla')}.</p>
<h2>Kenelle ja mistä iästä</h2>
<p>Ennen vuotta 1965 syntyneet voivat saada Kelan vanhuuseläkettä ${h.num(K.ika_ennen_1965)} vuoden iästä. Myöhemmin syntyneillä ikäraja on sama kuin työeläkkeen alin vanhuuseläkeikä. Jos lykkäät Kelan eläkkeen alkua, vuonna 1962 tai myöhemmin syntyneen eläkettä korotetaan ${h.num(K.lykkays_prosentti_kk_1962_jalkeen, 1)} % jokaiselta lykkäyskuukaudelta; laskuri ei tee tätä korotusta. Takuueläkkeen ehdot ja esimerkit ovat ${h.src('kela_takuuelake', 'Kelan takuueläkesivulla')} ja kaikki määrät ${h.src('kela_elaketaulukot', 'Kelan eläketaulukoissa 2026')}.</p>
<h2>Asumiskulut eläkkeellä</h2>
<p>Pienellä eläkkeellä vuokra on usein suurin meno. Eläkkeensaajat eivät saa yleistä asumistukea vaan Kelan eläkkeensaajan asumistukea, joka on ${h.num(AT.osuus * 100)} % hyväksytyistä asumismenoista omavastuun jälkeen. Työikäisten ruokakuntien tuki lasketaan ${h.a('asumistuki-laskuri', 'asumistukilaskurilla')}. Kokonaiseläkkeen arvio työuran perusteella löytyy ${h.a('elakelaskuri', 'eläkelaskurista')}, verotus sivulta ${h.a('elakkeen-verotus', 'eläkkeen verotus')} ja vertailu muiden eläkkeisiin sivulta ${h.a('keskimaarainen-elake', 'keskimääräinen eläke')}.</p>`,
  },
  en: {
    slug: 'national-and-guarantee-pension',
    nav: 'National and guarantee pension',
    card: 'Kela’s national pension and guarantee pension based on your work pension, relationship and years in Finland.',
    title: 'Guarantee Pension Finland 2026: Kela National Pension Tool',
    description: `Guarantee pension Finland 2026: work out Kela’s national and guarantee pensions from your work pension. Full guarantee pension ${EN.eur(T.taysi_kk, 2)}, national ${EN.eur(K.yksin_kk, 2)}.`,
    h1: 'Kela national and guarantee pension calculator',
    intro: 'Enter your gross earnings-related pension, relationship status and years lived in Finland to see your Kela pensions and total.',
    resume: `In 2026 Kela’s guarantee pension (takuueläke) lifts your total pension to at least ${EN.eur(T.taysi_kk, 2)} a month, provided you have lived in Finland for at least ${K.asumisaika_vahintaan_v} years. The full national pension (kansaneläke) is ${EN.eur(K.yksin_kk, 2)} if you live alone and ${EN.eur(K.parisuhde_kk, 2)} if you are married or cohabiting. It is reduced by half of whatever your work pensions exceed ${EN.eur(K.vahentamaton_raja_kk, 2)} a month, so it stops once your work pension passes ${EN.eur(K.yla_raja_yksin_kk, 2)} (single) or ${EN.eur(K.yla_raja_pari_kk, 2)} (couple). The guarantee pension fills the remaining gap: ${EN.eur(T.taysi_kk, 2)} minus all your other pensions before tax, national pension included, payable when your pensions total no more than ${EN.eur(T.tuloraja_kk, 2)}. Amounts under ${EN.eur(T.pienin_maksettava_kk, 2)} are not paid. With a ${EN.eur(ASUMIS_TE)} work pension, a single person gets ${EN.eur(E300.kansanelake, 2)} of national pension and ${EN.eur(E300.takuuelake, 2)} of guarantee pension. For anyone who moved to Finland as an adult the residence rule matters most: a short stay cuts the national pension, but not the guarantee pension.`,
    faqs: [
      { q: 'How much is the Finnish guarantee pension in 2026?', a: `The full guarantee pension is ${EN.eur(T.taysi_kk, 2)} a month. Kela deducts all your other pensions before tax, including the national pension and pensions paid from abroad. You qualify if your pensions total at most ${EN.eur(T.tuloraja_kk, 2)} a month, and amounts under ${EN.eur(T.pienin_maksettava_kk, 2)} are not paid. With no work pension at all, a single person receives ${EN.eur(RIVIT[0].y.kansanelake, 2)} of national pension and ${EN.eur(RIVIT[0].y.takuuelake, 2)} of guarantee pension.` },
      { q: 'At what work pension does the Kela national pension stop?', a: `For a single person it stops when work pensions exceed ${EN.eur(K.yla_raja_yksin_kk, 2)} a month; for someone in a relationship the limit is ${EN.eur(K.yla_raja_pari_kk, 2)}. The formula is the full national pension minus half of the work pension above ${EN.eur(K.vahentamaton_raja_kk, 2)}. With ${EN.eur(1000)} of work pension a single person still gets ${EN.eur(E1000.kansanelake, 2)}, for a total of ${EN.eur(E1000.yhteensa, 2)}.` },
      { q: 'Can I get a guarantee pension after only ten years in Finland?', a: `Yes, once you have lived in Finland for at least ${K.asumisaika_vahintaan_v} years. A short residence period reduces the national pension in proportion to the time lived here, but the guarantee pension makes up the difference. With ten years and a ${EN.eur(ASUMIS_TE)} work pension the calculator gives ${EN.eur(A10.kansanelake, 2)} of national pension and ${EN.eur(A10.takuuelake, 2)} of guarantee pension: ${EN.eur(A10.yhteensa, 2)} in total.` },
      { q: 'Does a salary or my spouse’s income reduce the guarantee pension?', a: `No. According to Kela, only your own pensions count. Earned income, capital income, assets and your spouse’s pensions or other income do not reduce it. Your relationship affects only the national pension, whose full amount is ${EN.eur(K.parisuhde_kk, 2)} for a couple instead of ${EN.eur(K.yksin_kk, 2)}. The full guarantee pension is the same for everyone.` },
      { q: 'Is the full guarantee pension taxed in Finland?', a: `In practice, no. When all your pensions add up to ${EN.eur(T.taysi_kk, 2)} a month, the pension income deduction of ${EN.eur(E.elaketulovahennys.taysi)} a year and the basic deduction bring taxable income to zero; in Helsinki the calculator leaves ${EN.eur(NETTO_TAYSI, 2)} in your pocket. Tax starts on larger totals: ${EN.eur(E1000.yhteensa, 2)} leaves ${EN.eur(netto(E1000.yhteensa), 2)} after tax.` },
    ],
    body: (h) => `
<h2>Kela pensions by work pension</h2>
<p>These are the calculator’s results with full residence. The single person’s columns include net pension in Helsinki without church tax. For a couple the full national pension is lower, but the guarantee pension lifts the total to the same ${h.eur(T.taysi_kk, 2)} floor.</p>
${h.table(['Work pension', 'National', 'Guarantee', 'Total', 'Net', 'Couple total'], RIVIT.map((x) => [h.eur(x.te), h.eur(x.y.kansanelake, 2), h.eur(x.y.takuuelake, 2), h.eur(x.y.yhteensa, 2), h.eur(netto(x.y.yhteensa), 2), h.eur(x.p.yhteensa, 2)]), 'Single person, full residence, Kela 2026 amounts', ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Two thresholds stand out. A work pension below ${h.eur(K.vahentamaton_raja_kk, 2)} does not touch the national pension at all. Above it, each euro of work pension removes 50 cents of national pension and the guarantee pension closes the gap until your total passes the guarantee level. From there, each extra euro of work pension raises your total by only half a euro until the national pension runs out.</p>
<h2>Years lived in Finland</h2>
<p>You get the full national pension if you have lived in Finland for at least ${h.num(K.tayden_asumisaikasuhde * 100)}% of the qualifying period, which works out at about ${h.num(TAYSI_V, 1)} years. Less time means a proportional national pension. The guarantee pension is not prorated, so it tops a small national pension up to the same level, which is why it matters so much to people who moved to Finland as adults.</p>
${h.table(['Lived in Finland', 'National', 'Guarantee', 'Total'], ASUMIS.map((x) => [`${h.num(x.v, x.v % 1 ? 1 : 0)} years`, h.eur(x.r.kansanelake, 2), h.eur(x.r.takuuelake, 2), h.eur(x.r.yhteensa, 2)]), `Work pension ${h.eur(ASUMIS_TE)}/month, single`, ['l', 'r', 'r', 'r'])}
<p>Enter your years of residence before retirement in the calculator. Put any pension from abroad in the work pension field, because it also reduces the guarantee pension. Residence conditions are on ${h.src('kela_vanhuuselake', 'Kela’s old-age pension page')}.</p>
<h2>Who qualifies and from what age</h2>
<p>People born before 1965 can draw Kela’s old-age pension from age ${h.num(K.ika_ennen_1965)}; for later cohorts the age matches the lowest retirement age for earnings-related pensions. If you were born in 1962 or later and defer the start, Kela raises the pension by ${h.num(K.lykkays_prosentti_kk_1962_jalkeen, 1)}% per month of deferral; the calculator does not apply this increase. Conditions and examples are on ${h.src('kela_takuuelake', 'Kela’s guarantee pension page')}, and every amount in ${h.src('kela_elaketaulukot', 'Kela’s 2026 pension tables')}. Kela pensions rose by ${h.num(E.indeksit.korotus_prosentti, 1)}% at the start of 2026 under the ${h.src('kela_indeksi', 'national pension index')}.</p>
<h2>Housing costs in retirement</h2>
<p>On a small pension, rent is often the largest cost. Pensioners do not get the general housing allowance but Kela’s housing allowance for pensioners, which covers ${h.num(AT.osuus * 100)}% of accepted housing costs after a deductible. Working-age households can use the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}. To estimate your work pension from your career, use the ${h.a('elakelaskuri', 'pension calculator')}; tax details are on ${h.a('elakkeen-verotus', 'pension tax')} and comparisons on ${h.a('keskimaarainen-elake', 'average pension in Finland')}.</p>`,
  },
});
