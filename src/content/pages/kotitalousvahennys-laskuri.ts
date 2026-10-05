import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kotitalousvahennys, kotitalousvahennysEsitys } from '../../lib/engine/kotitalous';

const K = P.kotitalousvahennys, NYT = K.voimassa, ES = K.esitys_2026_2027, OL = K.oljylammitys;
const SUMMAT = [600, 1000, 2000, 3000, 5000, 8000, 12000];
const RIVIT = SUMMAT.map((s) => ({
  s,
  y: kotitalousvahennys({ tyoYritys: s }).vahennys, ye: kotitalousvahennysEsitys({ tyoYritys: s }).vahennys,
  p: kotitalousvahennys({ tyoYritys: s, henkiloita: 2 }).vahennys, pe: kotitalousvahennysEsitys({ tyoYritys: s, henkiloita: 2 }).vahennys,
}));
const R3 = RIVIT[3];
/** Työn määrä, jolla enimmäismäärä täyttyy yhdellä hakijalla. */
const TAYSI_NYT = (NYT.enimmaismaara + NYT.omavastuu) / (NYT.yritys_prosentti / 100);
const TAYSI_ES = (ES.enimmaismaara + ES.omavastuu) / (ES.yritys_prosentti / 100);
/** vero.fi:n esimerkit: 600 € → 60 € ja 8 000 € → 1 600 € + puolisolle jäävä osa. */
const [[E1, E1V], [E2, E2V]] = K.esimerkit;
const E1_LASKURI = kotitalousvahennys({ tyoYritys: E1 }).vahennys;
const E2_BRUTTO = E2 * NYT.yritys_prosentti / 100 - NYT.omavastuu;
const PUOLISOLLE = E2_BRUTTO - E2V - NYT.omavastuu;
const PALKKA = 5000;
const PALKKA_V = kotitalousvahennys({ tyoYritys: 0, palkka: PALKKA }).vahennys;
const OLJY = 8000;
const OLJY_V = kotitalousvahennys({ tyoYritys: 0, oljy: OLJY }).vahennys;
/** Keittiöremontti: lasku 12 000 €, josta työn osuus 4 500 €. */
const REM_LASKU = 12000, REM_TYO = 4500;
const REM = kotitalousvahennys({ tyoYritys: REM_TYO }).vahennys, REM_ES = kotitalousvahennysEsitys({ tyoYritys: REM_TYO }).vahennys;
const fiPv = (iso: string) => iso.split('-').reverse().map(Number).join('.');
const enPv = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const pvFi = fiPv(ES.takautuvasti), pvEn = enPv(ES.takautuvasti);
/** Tilanne luettu (params-2026.json > retrieved_at). */
const TILA_FI = fiPv(P.retrieved_at), TILA_EN = enPv(P.retrieved_at);

export default definePage({
  id: 'kotitalousvahennys-laskuri',
  group: 'laskurit',
  order: 80,
  tool: 'kotitalous',
  related: ['verolaskuri', 'veronpalautus', 'matkakulut'],
  sources: ['vero_kotitalous', 'vero_kotitalous_esitys', 'finlex_tvl'],
  fi: {
    slug: 'kotitalousvahennys',
    nav: 'Kotitalousvähennys',
    card: 'Kotitalousvähennys remontista, siivouksesta ja hoivasta voimassa olevan lain ja korotusesityksen mukaan.',
    title: 'Kotitalousvähennys 2026: laskuri, enimmäismäärä ja korotus',
    description: `Kotitalousvähennys 2026: laske vähennys remontista ja siivouksesta. Nyt ${FI.p(NYT.yritys_prosentti, 0)} työstä, enintään ${FI.eur(NYT.enimmaismaara)} henkilöä kohden; esitys nostaisi sen ${FI.eur(ES.enimmaismaara)} tasolle.`,
    h1: 'Kotitalousvähennyslaskuri 2026',
    intro: 'Syötä laskun työn osuus ja mahdollinen itse maksettu palkka, niin näet vähennyksen nykyisellä lailla ja korotusesityksen mukaan.',
    resume: `Vuonna 2026 kotitalousvähennys on ${FI.p(NYT.yritys_prosentti, 0)} yritykseltä ostetun työn arvonlisäverollisesta hinnasta, josta vähennetään ${FI.eur(NYT.omavastuu)} omavastuu, ja enintään ${FI.eur(NYT.enimmaismaara)} henkilöä kohden vuodessa: ${FI.eur(R3.s)} remonttityöstä saat ${FI.eur(R3.y)} vähennystä. Itse palkatun työntekijän palkasta ja sivukuluista vähennys on ${FI.p(NYT.palkka_prosentti, 0)}. Enimmäismäärä täyttyy, kun työn osuus on ${FI.eur(TAYSI_NYT)}. Hallitus on esittänyt vähennykseen määräaikaista korotusta vuosille 2026 ja 2027: ${FI.p(ES.yritys_prosentti, 0)} työstä, ${FI.p(ES.palkka_prosentti, 0)} palkasta ja enimmäismäärä ${FI.eur(ES.enimmaismaara)}, omavastuu ennallaan. Esitystä ei ole hyväksytty ${TILA_FI} mennessä, mutta hyväksyttynä se koskisi ${pvFi} alkaen maksettuja kuluja, jolloin sama ${FI.eur(R3.s)} toisi ${FI.eur(R3.ye)}. Laskuri näyttää molemmat luvut rinnakkain. Puolisot saavat kumpikin oman vähennyksensä, oman omavastuunsa ja oman enimmäismääränsä, kun he maksavat työn yhdessä. Vähennys tehdään suoraan veroista, joten se pienentää maksettavaa veroa euro eurolta, kunhan veroja on vähintään vähennyksen verran.`,
    faqs: [
      { q: 'Paljonko kotitalousvähennystä saa 3 000 euron remontista?', a: `Jos laskun työn osuus arvonlisäveroineen on ${FI.eur(R3.s)}, vähennys on ${FI.p(NYT.yritys_prosentti, 0)} × ${FI.eur(R3.s)} − ${FI.eur(NYT.omavastuu)} = ${FI.eur(R3.y)}. Tarvikkeet ja matkakulut eivät kuulu työn osuuteen. Jos korotusesitys hyväksytään, vähennys olisi ${FI.eur(R3.ye)}. Puolisoiden kesken jaettuna kummankin oma ${FI.eur(NYT.omavastuu)} omavastuu pienentää yhteisen vähennyksen tasolle ${FI.eur(R3.p)}.` },
      { q: 'Millä työn määrällä kotitalousvähennyksen enimmäismäärä täyttyy?', a: `Voimassa olevalla lailla ${FI.eur(TAYSI_NYT)} työn osuudella, koska ${FI.p(NYT.yritys_prosentti, 0)} siitä on ${FI.eur(NYT.enimmaismaara + NYT.omavastuu)} ja omavastuun jälkeen jää ${FI.eur(NYT.enimmaismaara)}. Korotusesityksen mukaan raja olisi ${FI.eur(TAYSI_ES)}. Sen ylittävästä työstä ei saa yksin enempää, mutta jos puoliso osallistuu maksuun, hänellä on oma enimmäismääränsä.` },
      { q: 'Onko kotitalousvähennyksen korotus jo voimassa vuonna 2026?', a: `Ei ole vielä. Hallituksen esitys nostaisi vähennyksen osuuden työstä tasolle ${FI.p(ES.yritys_prosentti, 0)} ja enimmäismäärän tasolle ${FI.eur(ES.enimmaismaara)} vuosiksi 2026 ja 2027, mutta Verohallinnon sivu näyttää yhä ${FI.p(NYT.yritys_prosentti, 0)} ja ${FI.eur(NYT.enimmaismaara)}. Jos laki hyväksytään, korotettu vähennys koskee ${pvFi} alkaen maksettuja kuluja, joten tämän vuoden laskut kannattaa säilyttää.` },
      { q: 'Saavatko molemmat puolisot oman kotitalousvähennyksen samasta työstä?', a: `Saavat, kun kumpikin maksaa osan. Verohallinnon esimerkissä ${FI.eur(E2)} työstä laskettu ${FI.eur(E2_BRUTTO)} ylittää yhden hengen enimmäismäärän, joten toinen puoliso saa ${FI.eur(E2V)} ja toinen ${FI.eur(PUOLISOLLE)} oman omavastuunsa jälkeen. Laskuri jakaa kulut puolisoiden kesken tasan, mikä antaa samasta laskusta ${FI.eur(RIVIT[5].p)}.` },
      { q: 'Paljonko vähennystä saa öljylämmityksestä luopumisesta?', a: `Öljylämmityksen vaihtamisesta toiseen lämmitysmuotoon vähennys on ${FI.p(OL.yritys_prosentti, 0)} työn osuudesta yritykseltä ostettuna ja ${FI.p(OL.palkka_prosentti, 0)} palkasta, enintään ${FI.eur(OL.enimmaismaara)} henkilöä kohden vuosina ${OL.vuodet}. Muusta kotitaloustyöstä enimmäismäärään saa sisältyä enintään ${FI.eur(NYT.enimmaismaara)}. Esimerkiksi ${FI.eur(OLJY)} työn osuudesta saa ${FI.eur(OLJY_V)}.` },
    ],
    body: (h) => `
<h2>Vähennys eri laskun suuruuksilla</h2>
<p>Taulukossa on työn osuus arvonlisäveroineen ja vähennys sekä voimassa olevalla lailla että korotusesityksen mukaan. Puolisoiden sarakkeissa kulut on jaettu tasan, ja kumpikin vähentää oman ${h.eur(NYT.omavastuu)} omavastuunsa.</p>
${h.table(['Työn osuus', 'Yksi hakija', 'Esitys', 'Puolisot', 'Puolisot, esitys'], RIVIT.map((x) => [h.eur(x.s), h.eur(x.y), h.eur(x.ye), h.eur(x.p), h.eur(x.pe)]), 'Kotitalousvähennys 2026, yritykseltä ostettu työ', ['r', 'r', 'r', 'r', 'r'])}
<p>Pienillä laskuilla puolisoiden kannattaa harkita, kumpi maksaa: kaksi omavastuuta syö vähennyksestä enemmän kuin yksi. ${h.eur(RIVIT[1].s)} siivouslaskusta yksi hakija saa ${h.eur(RIVIT[1].y)}, mutta puoliksi maksettuna vähennystä jää yhteensä ${h.eur(RIVIT[1].p)}. Suurilla remonteilla tilanne kääntyy, koska kahdella hakijalla on kaksi enimmäismäärää.</p>
<h2>Verohallinnon esimerkit</h2>
<p>Laskuri toistaa ${h.src('vero_kotitalous', 'Verohallinnon sivun')} esimerkit: ${h.eur(E1)} työstä vähennys on ${h.eur(E1_LASKURI)} (Verohallinto: ${h.eur(E1V)}), ja ${h.eur(E2)} työstä yksi hakija saa enimmäismäärän ${h.eur(E2V)}. Itse palkatusta työntekijästä vähennys lasketaan palkasta ja työnantajan sivukuluista: ${h.eur(PALKKA)} kokonaiskuluista se on ${h.eur(PALKKA_V)}.</p>
<h2>Esimerkki: keittiöremontti</h2>
<p>Remonttiyrityksen ${h.eur(REM_LASKU)} laskussa on kaapistot, kodinkoneet ja työ. Vähennyksen pohjaksi kelpaa vain työn osuus, tässä ${h.eur(REM_TYO)} arvonlisäveroineen, joten pyydä yritystä erittelemään se laskuun. Yksin maksettuna vähennys on ${h.eur(REM)}, ja korotusesityksen mukaan se olisi ${h.eur(REM_ES)}. Jos puolisot maksavat laskun puoliksi, vähennystä tulee ${h.eur(kotitalousvahennys({ tyoYritys: REM_TYO, henkiloita: 2 }).vahennys)}. Tarvikkeista ja kodinkoneista ei saa vähennystä lainkaan, vaikka ne ostettaisiin samalta yritykseltä.</p>
<h2>Mistä työstä vähennyksen saa</h2>
<ul>
<li><strong>Kotitalous- ja hoivatyö</strong> kotona, kuten siivous ja hoiva.</li>
<li><strong>Asunnon kunnossapito ja remontti:</strong> vähennyksen saa vain työn osuudesta, ei tarvikkeista eikä matkakuluista.</li>
<li><strong>Tieto- ja viestintätekniikan asennus ja neuvonta</strong> kotona.</li>
<li><strong>Öljylämmityksestä luopuminen</strong> korotetulla ${h.num(OL.yritys_prosentti)} prosentin vähennyksellä vuosina ${OL.vuodet}.</li>
</ul>
<p>Vähennyksen perusteet ovat ${h.src('finlex_tvl', 'tuloverolain')} 127 a–127 f §:ssä. Korotusesityksen sisältö on kerrottu ${h.src('vero_kotitalous_esitys', 'Verohallinnon tiedotteessa')}; sama esitys pienentäisi työmatkakulujen omavastuun ${h.eur(K.esitys_matkakulut_omavastuu)} euroon (ks. ${h.a('matkakulut', 'matkakulujen vähennys')}).</p>
<h2>Miten vähennys näkyy veroissa</h2>
<p>Kotitalousvähennys pienentää veroja, ei verotettavaa tuloa. Jos vähennystä ei merkitty verokorttiin, se palautuu veronpalautuksena verotuksen valmistuttua. Vähennys hyödyttää vain, jos veroja on maksettavana vähintään sen verran; pienituloisella koko summa ei aina mahdu veroihin. Kokonaisvaikutuksen palautukseen voi laskea ${h.a('verolaskuri', 'verolaskurilla')}, ja palautuksen syyt on selitetty sivulla ${h.a('veronpalautus', 'veronpalautus ja jäännösvero')}.</p>`,
  },
  en: {
    slug: 'household-tax-credit',
    nav: 'Household tax credit',
    card: 'Finland’s household tax credit for renovation, cleaning and care, under current law and the proposed increase.',
    title: 'Household Tax Credit Finland 2026: Kotitalousvähennys Tool',
    description: `Household tax credit Finland 2026: work out your kotitalousvähennys for renovation or cleaning. ${EN.p(NYT.yritys_prosentti, 0)} of labour, max ${EN.eur(NYT.enimmaismaara)} per person; proposal: ${EN.eur(ES.enimmaismaara)}.`,
    h1: 'Finnish household tax credit calculator 2026',
    intro: 'Enter the labour share of your invoice and any wages you paid yourself to see the credit under current law and under the proposed increase.',
    resume: `In 2026 the Finnish household tax credit (kotitalousvähennys) is ${EN.p(NYT.yritys_prosentti, 0)} of the labour cost, VAT included, of work bought from a company, minus a ${EN.eur(NYT.omavastuu)} deductible, up to ${EN.eur(NYT.enimmaismaara)} per person per year: ${EN.eur(R3.s)} of renovation labour gives you ${EN.eur(R3.y)} off your taxes. If you employ someone directly, the credit is ${EN.p(NYT.palkka_prosentti, 0)} of wages plus employer contributions. You reach the cap with ${EN.eur(TAYSI_NYT)} of labour. The government has proposed a temporary increase for 2026 and 2027, to ${EN.p(ES.yritys_prosentti, 0)} of labour, ${EN.p(ES.palkka_prosentti, 0)} of wages and a ${EN.eur(ES.enimmaismaara)} cap, with the deductible unchanged. As of ${TILA_EN} it has not been passed; if it is, it will apply to costs paid from ${pvEn}, and the same ${EN.eur(R3.s)} would give ${EN.eur(R3.ye)}. The calculator shows both figures side by side. Spouses who pay for the work together each get their own credit, deductible and cap. The credit comes straight off your taxes, euro for euro, as long as you pay at least that much tax.`,
    faqs: [
      { q: 'How much household tax credit do I get on a €3,000 renovation in Finland?', a: `If the labour share of the invoice, VAT included, is ${EN.eur(R3.s)}, the credit is ${EN.p(NYT.yritys_prosentti, 0)} × ${EN.eur(R3.s)} − ${EN.eur(NYT.omavastuu)} = ${EN.eur(R3.y)}. Materials and travel do not count. If the proposed increase passes, it would be ${EN.eur(R3.ye)}. Split between spouses, each person’s ${EN.eur(NYT.omavastuu)} deductible brings the combined credit down to ${EN.eur(R3.p)}.` },
      { q: 'How much labour do I need to reach the household credit cap?', a: `Under current law, ${EN.eur(TAYSI_NYT)} of labour: ${EN.p(NYT.yritys_prosentti, 0)} of it is ${EN.eur(NYT.enimmaismaara + NYT.omavastuu)}, which leaves ${EN.eur(NYT.enimmaismaara)} after the deductible. Under the proposal the threshold would be ${EN.eur(TAYSI_ES)}. Beyond that a single claimant gets nothing more, but a spouse who shares the cost has a cap of their own.` },
      { q: 'Has the household credit increase for 2026 been approved?', a: `Not yet. The government proposal would raise the credit to ${EN.p(ES.yritys_prosentti, 0)} of labour and the cap to ${EN.eur(ES.enimmaismaara)} for 2026 and 2027, but Vero’s page still shows ${EN.p(NYT.yritys_prosentti, 0)} and ${EN.eur(NYT.enimmaismaara)}. If it becomes law, the higher credit covers costs paid from ${pvEn}, so keep this year’s invoices.` },
      { q: 'Can both spouses claim the household credit for the same job?', a: `Yes, if each pays part of it. In Vero’s example, ${EN.eur(E2)} of labour produces ${EN.eur(E2_BRUTTO)}, above one person’s cap, so one spouse gets ${EN.eur(E2V)} and the other ${EN.eur(PUOLISOLLE)} after their own deductible. The calculator splits costs equally between spouses, which gives ${EN.eur(RIVIT[5].p)} for the same invoice.` },
      { q: 'What is the credit for replacing oil heating in Finland?', a: `For switching away from oil heating, the credit is ${EN.p(OL.yritys_prosentti, 0)} of labour bought from a company and ${EN.p(OL.palkka_prosentti, 0)} of wages, up to ${EN.eur(OL.enimmaismaara)} per person in ${OL.vuodet}. Other household work can make up at most ${EN.eur(NYT.enimmaismaara)} of that cap. For example, ${EN.eur(OLJY)} of labour gives ${EN.eur(OLJY_V)}.` },
    ],
    body: (h) => `
<h2>The credit at different invoice sizes</h2>
<p>The table shows the labour share including VAT and the credit under current law and under the proposal. In the spouse columns costs are split equally and each subtracts their own ${h.eur(NYT.omavastuu)} deductible.</p>
${h.table(['Labour', 'One claimant', 'Proposal', 'Spouses', 'Spouses, proposal'], RIVIT.map((x) => [h.eur(x.s), h.eur(x.y), h.eur(x.ye), h.eur(x.p), h.eur(x.pe)]), 'Household tax credit 2026, work bought from a company', ['r', 'r', 'r', 'r', 'r'])}
<p>On small invoices, decide who pays: two deductibles eat more of the credit than one. On ${h.eur(RIVIT[1].s)} of cleaning one claimant gets ${h.eur(RIVIT[1].y)}, but split down the middle the couple keeps only ${h.eur(RIVIT[1].p)}. On a big renovation it flips, because two claimants have two caps.</p>
<h2>Vero’s own examples</h2>
<p>The calculator matches the examples on ${h.src('vero_kotitalous', 'Vero’s page')}: ${h.eur(E1)} of labour gives ${h.eur(E1_LASKURI)} (Vero: ${h.eur(E1V)}), and ${h.eur(E2)} gives one claimant the full ${h.eur(E2V)}. If you employ someone directly, the credit is based on wages and employer costs: ${h.eur(PALKKA)} in total costs gives ${h.eur(PALKKA_V)}.</p>
<h2>Example: a kitchen renovation</h2>
<p>A contractor’s ${h.eur(REM_LASKU)} invoice covers cabinets, appliances and labour. Only the labour counts, here ${h.eur(REM_TYO)} including VAT, so ask the company to itemise it. Paid by one person, the credit is ${h.eur(REM)}; under the proposal it would be ${h.eur(REM_ES)}. Split between spouses it comes to ${h.eur(kotitalousvahennys({ tyoYritys: REM_TYO, henkiloita: 2 }).vahennys)}.</p>
<h2>Which work qualifies</h2>
<ul>
<li><strong>Household and care work</strong> at home, such as cleaning and care.</li>
<li><strong>Maintenance and renovation</strong> of your home: labour only, not materials or travel.</li>
<li><strong>Installing and advising on IT equipment</strong> at home.</li>
<li><strong>Replacing oil heating</strong>, at the higher ${h.num(OL.yritys_prosentti)}% rate in ${OL.vuodet}.</li>
</ul>
<p>The legal basis is sections 127 a–127 f of the ${h.src('finlex_tvl', 'Income Tax Act')}. The proposal is described in ${h.src('vero_kotitalous_esitys', 'Vero’s press release')}; the same bill would cut the commuting own share to ${h.eur(K.esitys_matkakulut_omavastuu)} (see the ${h.a('matkakulut', 'commuting deduction')}).</p>
<h2>How the credit shows up in your taxes</h2>
<p>The credit reduces tax, not taxable income. If it was not on your tax card, it comes back as a refund once your assessment is done. It only helps if you pay at least that much tax, so on a low income part of it can go unused. The ${h.a('verolaskuri', 'tax refund calculator')} shows the effect on your refund, and ${h.a('veronpalautus', 'tax refund and residual tax')} explains the rest.</p>`,
  },
});
