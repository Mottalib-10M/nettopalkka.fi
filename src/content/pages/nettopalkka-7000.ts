import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kuukausiNetto } from '../../lib/engine/vero';
import { vanhempainraha } from '../../lib/engine/paivaraha';
import { tyoelakeArvio } from '../../lib/engine/elake';

const V = P.vero;
const PALKKA = 7000;
const R = kuukausiNetto(PALKKA, { kunta: 'Helsinki' });
const KK = R.netto / 12;
const KIRKKO = kuukausiNetto(PALKKA, { kunta: 'Helsinki', kirkko: 'evl' });
const YLIN = V.valtion_asteikko[V.valtion_asteikko.length - 1];
/** Rajavero: sadan euron korotuksesta jäävä osuus. */
const KOR = (kuukausiNetto(PALKKA + 100, { kunta: 'Helsinki' }).netto - R.netto) / 12;
const RAJA = 1 - KOR / 100;
/** Yle-vero saavuttaa enimmäismäärän tällä puhtaalla ansiotulolla. */
const YLE_KATTO = V.yle.tuloraja + V.yle.enimmaismaara / (V.yle.prosentti / 100);
/** Vanhempainraha kolmessa osassa: 70 %, 40 % ja 25 % vuositulon osista, jaettuna 300:lla. */
const VP = P.vanhempainraha;
const VR = vanhempainraha(PALKKA * 12);
const [, R2, R3] = VP.rajat;
const OSAT = [
  { ala: 0, yla: R2, pros: VP.prosentit[0] },
  { ala: R2, yla: R3, pros: VP.prosentit[1] },
  { ala: R3, yla: VR.vuositulo, pros: VP.prosentit[2] },
].map((o) => ({ ...o, pv: (o.pros / 100) * Math.max(0, Math.min(VR.vuositulo, o.yla) - o.ala) / VP.jakaja }));
/** Työeläkkeen karttuma vuodessa ilman lomarahaa. */
const EL = tyoelakeArvio({ syntymavuosi: 1985, kkPalkka: PALKKA, kuukausiaVuodessa: 12 });
const KARTTUMA_KK = EL.karttumaVuodessa / 12;
const LISAVERO = V.elaketulon_lisavero;

const rivit = (l: 'fi' | 'en') => {
  const t = (fi: string, en: string) => (l === 'fi' ? fi : en);
  return [
    { n: t('Valtion tulovero', 'State income tax'), v: R.valtionvero },
    { n: t('Kunnallisvero, Helsinki', 'Municipal tax, Helsinki'), v: R.kunnallisvero },
    { n: t('Sairaanhoitomaksu', 'Health care contribution'), v: R.sairaanhoitomaksu },
    { n: t('Päivärahamaksu', 'Daily allowance contribution'), v: R.paivarahamaksu },
    { n: t('Yle-vero', 'Yle tax'), v: R.yle },
    { n: t('Työeläkemaksu', 'Pension contribution'), v: R.tyoelakemaksu },
    { n: t('Työttömyysvakuutusmaksu', 'Unemployment insurance'), v: R.tyottomyysvakuutusmaksu },
    { n: t('Kaikki pidätykset', 'All deductions'), v: R.pidatykset },
    { n: t('Nettotulo', 'Net income'), v: R.netto },
  ];
};

export default definePage({
  id: 'nettopalkka-7000',
  group: 'palkka',
  order: 70,
  mini: 'nettoSumma',
  miniDefaults: { p: 7000 },
  related: ['nettopalkka-5000', 'marginaalivero', 'bruttopalkka-laskuri', 'elakkeen-verotus'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'nettopalkka-7000',
    nav: `Nettopalkka ${FI.eur(PALKKA)}`,
    card: `Hyvätuloisen verot erä erältä: ${FI.eur(PALKKA)} kuukausipalkan pidätykset, vanhempainraha ja eläkekarttuma.`,
    title: `Nettopalkka ${FI.eur(PALKKA)} 2026: hyvätuloisen verot eriteltynä`,
    description: `Nettopalkka ${FI.eur(PALKKA)} kuussa 2026: käteen ${FI.eur(KK)}, verokortissa ${FI.num(R.veroprosentti, 1)} %. Kaikki verot ja maksut eriteltyinä, vanhempainrahan ylin porras sekä eläkekarttuma.`,
    h1: `Nettopalkka ${FI.eur(PALKKA)} kuukaudessa`,
    intro: `Seitsemän tuhannen euron palkalla jokainen asteikko on jo ylimmillään, ja Kelan etuudet korvaavat palkasta yhä pienemmän osan.`,
    resume: `${FI.eur(PALKKA)} kuukausipalkasta jää helsinkiläiselle vuonna 2026 käteen keskimäärin ${FI.eur(KK)} kuussa, eli noin ${FI.pct(R.netto / R.tulo)} bruttopalkasta, ja verokortin prosentti on ${FI.num(R.veroprosentti, 1)} %. Vuositulo ${FI.eur(PALKKA * 12)} on kaikilla mittareilla huipputasoa: verotettavaa tuloa on noin ${FI.eur(R.verotettava)}, ja lisäeurosta valtio ottaa ylimmän portaan ${FI.num(YLIN.prosentti, 2)} %. Rajaveroaste on Helsingissä noin ${FI.pct(RAJA)}, sama kuin viiden tuhannen euron palkalla, koska asteikko ei enää jyrkkene eikä työtulovähennys pienene. Yle-vero on ollut enimmäismäärässään ${FI.eur(V.yle.enimmaismaara)} jo paljon pienemmästä tulosta lähtien. Kelan vanhempainrahassa vuositulo ylittää rajan ${FI.eur(R3)}, jonka yli menevästä osasta korvataan enää ${FI.num(VP.prosentit[2])} %, joten päiväraha on ${FI.eur(VR.pv, 2)} arkipäivältä. Työeläkettä kertyy jokaiselta vuodelta noin ${FI.eur(KARTTUMA_KK, 2)} kuukaudessa, sillä karttuma lasketaan koko palkasta, ja se on yksi harvoista eristä, joka kasvaa suoraan palkan mukana.`,
    faqs: [
      { q: `Paljonko ${FI.eur(PALKKA)} palkasta jää kirkon jäsenelle?`, a: `Helsingissä evankelis-luterilaisen seurakunnan jäsenelle jää keskimäärin ${FI.eur(KIRKKO.netto / 12)} kuukaudessa, ja verokortin prosentti on ${FI.num(KIRKKO.veroprosentti, 1)} %. Kirkollisveroa kertyy ${FI.eur(KIRKKO.kirkollisvero)} vuodessa. Kirkollisvero lasketaan samasta verotettavasta tulosta kuin kunnallisvero, joten sen euromäärä kasvaa suoraan palkan mukana ilman portaita tai kattoa. Seurakunnan prosentti vaihtelee kunnittain.` },
      { q: `Paljonko työeläkettä ${FI.eur(PALKKA)} kuukausipalkka kerryttää vuodessa?`, a: `Eläkettä karttuu ${FI.num(P.elake.karttumaprosentti, 1)} % vuoden ansioista, joten ${FI.eur(PALKKA * 12)} palkasta kertyy ${FI.eur(EL.karttumaVuodessa)} vuotuista eläkettä eli ${FI.eur(KARTTUMA_KK, 2)} kuukaudessa. Lomaraha ja bonukset kasvattavat karttumaa samalla prosentilla. Eläkkeen alkaessa kertynyt summa kerrotaan elinaikakertoimella, joka on vuonna 1964 syntyneillä ${FI.num(P.elake.elinaikakerroin_viimeisin.arvo, 5)}.` },
      { q: `Paljonko vanhempainrahaa maksetaan ${FI.eur(PALKKA)} kuukausipalkalla?`, a: `${FI.eur(VR.pv, 2)} arkipäivältä. Kelan laskema vuositulo on vakuutusmaksuvähennyksen jälkeen ${FI.eur(VR.vuositulo)}. Siitä ${FI.eur(R2)} asti korvataan ${FI.num(VP.prosentit[0])} %, rajojen ${FI.eur(R2)} ja ${FI.eur(R3)} väliltä ${FI.num(VP.prosentit[1])} % ja loput ${FI.num(VP.prosentit[2])} %, ja summa jaetaan ${FI.num(VP.jakaja)}:lla. Korotettuina päivinä päiväraha on ${FI.eur(VR.korotettuPv, 2)}.` },
      { q: `Miksi rajavero on ${FI.eur(PALKKA)} palkalla sama kuin ${FI.eur(5000)} palkalla?`, a: `Molemmilla palkoilla lisäeuro osuu valtion ylimmälle ${FI.num(YLIN.prosentti, 2)} prosentin portaalle, työtulovähennys on jo vakiintunut ja Yle-vero on katossa. Jäljelle jäävät tasaprosenttiset kunnallisvero ja maksut, joten lisäeurosta jää Helsingissä noin ${FI.num(KOR, 0)} senttiä. Keskimääräinen veroprosentti kuitenkin nousee edelleen, kun yhä suurempi osa palkasta osuu ylimmälle portaalle.` },
    ],
    body: (h) => `
<h2>Mihin ${h.eur(PALKKA * 12)} vuodessa menee</h2>
<p>Hyvätuloisen palkkalaskelmassa mikään erä ei ole enää pieni. Taulukko purkaa ${h.eur(PALKKA)} kuukausipalkan kaikki pidätykset vuositasolle. Valtion tulovero on suurin yksittäinen erä, ja se on jo selvästi kunnallisveroa suurempi, vaikka Helsingin kunnallisveroprosentti on maan matalimpia. Tämä johtuu siitä, että ${h.eur(R.verotettava - YLIN.alaraja)} verotettavasta tulosta on ylimmällä portaalla ja verotetaan ${h.num(YLIN.prosentti, 2)} prosentilla. Työeläkemaksu ${h.num(V.tyoelakemaksu_prosentti, 2)} % on kolmanneksi suurin erä, ja se peritään koko palkasta samalla prosentilla. Kaikista pidätyksistä veroja ovat valtion- ja kunnallisvero, sairaanhoitomaksu, päivärahamaksu ja Yle-vero; eläke- ja työttömyysvakuutusmaksu ovat vakuutusmaksuja, jotka kerryttävät omaa turvaa. Pyöristyksen takia tilinauhan netto on ${h.eur(R.kkNetto, 2)}, ja erotus palautuu verotuksessa. Bruttopalkan, jolla haluttu nettosumma toteutuu, voi laskea takaperin ${h.a('bruttopalkka-laskuri', 'bruttopalkkalaskurilla')}.</p>
${h.table(['Erä', 'Vuodessa', 'Kuukaudessa', 'Osuus palkasta'], rivit('fi').map((x) => [x.n, h.eur(x.v), h.eur(x.v / 12), h.pct(x.v / R.tulo)]), `${h.eur(PALKKA)} kuukausipalkka, Helsinki, ei kirkon jäsen, 2026`, ['l', 'r', 'r', 'r'])}
<h2>Yle-vero ja rajavero katossa</h2>
<p>Yle-vero on ${h.num(V.yle.prosentti, 1)} % siitä puhtaasta ansiotulosta, joka ylittää ${h.eur(V.yle.tuloraja)}, mutta enintään ${h.eur(V.yle.enimmaismaara)}. Enimmäismäärä täyttyy jo noin ${h.eur(YLE_KATTO)} vuositulolla, joten tällä palkalla se on vain pyöristysvirhe: ${h.eur(V.yle.enimmaismaara)} on alle ${h.pct(V.yle.enimmaismaara / R.tulo, 2)} vuosipalkasta. Manner-Suomessa Yle-vero ei riipu kotikunnasta, joten se on kaikille hyvätuloisille täsmälleen sama euromäärä; Ahvenanmaalla sen tilalla peritään mediamaksu ${h.eur(V.ahvenanmaa_mediamaksu.maara)}. Rajavero ei myöskään enää nouse: sadan euron korotuksesta jää ${h.eur(KOR, 2)}, sama osuus kuin viiden tuhannen euron palkalla. Lisäeuron hinta selitetään sivulla ${h.a('marginaalivero', 'marginaalivero')}.</p>
<h2>Vanhempainraha ylimmällä portaalla</h2>
<p>Kelan vanhempainraha on porrastettu kuten tulovero, mutta toisin päin: mitä suurempi vuositulo, sitä pienempi osa siitä korvataan. ${h.eur(PALKKA)} palkalla vuositulo vakuutusmaksuvähennyksen ${h.num(VP.vakuutusmaksuvahennys_prosentti, 2)} % jälkeen on ${h.eur(VR.vuositulo)}, ja se ulottuu kaikkiin kolmeen osaan. Päiväraha on ${h.eur(VR.pv, 2)} eli noin ${h.eur(VR.kk)} kuukaudessa, mikä on reilusti alle puolet bruttopalkasta. Jos työnantaja maksaa palkkaa osalta vapaata, Kela maksaa päivärahan sen ajan työnantajalle, joten kannattaa tarkistaa oman työehtosopimuksen ja työsopimuksen ehdot.</p>
${h.table(['Vuositulon osa', 'Korvausprosentti', 'Euroa päivässä'], OSAT.map((o) => [`${h.eur(o.ala)} – ${h.eur(o.yla)}`, `${h.num(o.pros)} %`, h.eur(o.pv, 2)]).concat([['Yhteensä', '', h.eur(VR.pv, 2)]]), `Vanhempainraha ${h.eur(PALKKA)} kuukausipalkalla, 2026`, ['l', 'r', 'r'])}
<h2>Eläke kertyy koko palkasta</h2>
<p>Työeläkettä karttuu ${h.num(P.elake.karttumaprosentti, 1)} % vuoden ansioista, joten ${h.eur(PALKKA * 12)} vuosipalkka kasvattaa tulevaa eläkettä ${h.eur(KARTTUMA_KK, 2)} kuukaudessa jokaiselta vuodelta ennen elinaikakerrointa. Pitkä ura tällä tasolla johtaa eläkkeeseen, jota verotetaan aikanaan ansiotulona; vuotuisen eläketulon ${h.eur(LISAVERO.raja)} ylittävästä osasta peritään lisäksi ${h.num(LISAVERO.prosentti, 2)} prosentin lisävero. Eläketulon verotus on selitetty sivulla ${h.a('elakkeen-verotus', 'eläkkeen verotus')}, ja kuntien prosentit löytyvät Verohallinnon ${h.src('vero_kunnat', 'taulukosta')}.</p>`,
  },
  en: {
    slug: 'net-salary-7000',
    nav: `Net salary ${EN.eur(PALKKA)}`,
    card: `A high earner's payslip line by line: tax, contributions, parental allowance and pension on ${EN.eur(PALKKA)} a month.`,
    title: `Net salary ${EN.eur(PALKKA)} Finland 2026: high earner breakdown`,
    description: `Net salary on ${EN.eur(PALKKA)} a month in Finland 2026: ${EN.eur(KK)} take-home, ${EN.num(R.veroprosentti, 1)}% card rate, every tax line, the top parental allowance band and the pension you build.`,
    h1: `Net salary on ${EN.eur(PALKKA)} a month in Finland`,
    intro: `At seven thousand a month every Finnish scale is at its top, and Kela benefits replace an ever smaller share of your pay.`,
    resume: `A senior salary of ${EN.eur(PALKKA)} a month leaves about ${EN.eur(KK)} a month in Helsinki in 2026, roughly ${EN.pct(R.netto / R.tulo)} of gross pay, with a ${EN.num(R.veroprosentti, 1)}% withholding rate on your tax card (verokortti). At ${EN.eur(PALKKA * 12)} a year you are well inside the top state band: taxable income is around ${EN.eur(R.verotettava)}, and each extra euro pays ${EN.num(YLIN.prosentti, 2)}% to the state. Your marginal rate in Helsinki is about ${EN.pct(RAJA)}, identical to a ${EN.eur(5000)} salary, because the scale has no further steps, the earned income credit has stopped shrinking and the Yle tax hit its ${EN.eur(V.yle.enimmaismaara)} ceiling long ago. Family leave is where the difference with home-country systems may surprise you: Kela's parental allowance (vanhempainraha) replaces only ${EN.num(VP.prosentit[2])}% of annual income above ${EN.eur(R3)}, so the daily rate is ${EN.eur(VR.pv, 2)}. Each year at this pay adds about ${EN.eur(KARTTUMA_KK, 2)} a month to your future earnings-related pension, since accrual applies to the full salary.`,
    faqs: [
      { q: `What is take-home pay on ${EN.eur(PALKKA)} a month for a church member in Helsinki?`, a: `About ${EN.eur(KIRKKO.netto / 12)} a month, with a ${EN.num(KIRKKO.veroprosentti, 1)}% card rate. Church tax adds ${EN.eur(KIRKKO.kirkollisvero)} a year. It is levied on the same taxable income as municipal tax, at a flat parish rate, so the euro amount grows in step with your salary rather than through bands.` },
      { q: `What Kela parental allowance will I get on a ${EN.eur(PALKKA)} salary?`, a: `${EN.eur(VR.pv, 2)} per weekday, Monday to Saturday. Kela works from annual income of ${EN.eur(VR.vuositulo)} after the contribution deduction, replacing ${EN.num(VP.prosentit[0])}% up to ${EN.eur(R2)}, ${EN.num(VP.prosentit[1])}% between ${EN.eur(R2)} and ${EN.eur(R3)} and ${EN.num(VP.prosentit[2])}% above, divided by ${EN.num(VP.jakaja)}. The higher-rate days at the start of leave pay ${EN.eur(VR.korotettuPv, 2)}.` },
      { q: `Why is the marginal rate on ${EN.eur(PALKKA)} a month the same as on ${EN.eur(5000)}?`, a: `At both salaries each extra euro lands in the ${EN.num(YLIN.prosentti, 2)}% top state band, the earned income credit is already fixed and the Yle tax is capped. What remains are flat municipal tax and contributions, so about ${EN.num(KOR, 0)} cents of each extra euro stays with you in Helsinki. Your average rate still climbs as more of your pay sits in the top band.` },
    ],
    body: (h) => `
<h2>Every line on an ${h.eur(PALKKA * 12)} payslip</h2>
<p>If you have relocated to Finland for a senior role, this is the table to check your first payslip against. It turns every deduction on a ${h.eur(PALKKA)} monthly salary into annual and monthly euros. State income tax is the largest single item and clearly bigger than municipal tax, even though Helsinki's municipal rate is among the lowest in the country, because ${h.eur(R.verotettava - YLIN.alaraja)} of your taxable income sits in the ${h.num(YLIN.prosentti, 2)}% top band. The ${h.num(V.tyoelakemaksu_prosentti, 2)}% pension contribution comes third and is charged on the whole salary at the same rate. Pension and unemployment premiums are insurance that builds your own cover; the rest are taxes. Because the card rate is rounded up, your payslip shows ${h.eur(R.kkNetto, 2)} net and the difference returns as a refund. To work backwards from a net figure you want, use the ${h.a('bruttopalkka-laskuri', 'gross salary calculator')}.</p>
${h.table(['Item', 'Per year', 'Per month', 'Share of gross'], rivit('en').map((x) => [x.n, h.eur(x.v), h.eur(x.v / 12), h.pct(x.v / R.tulo)]), `${h.eur(PALKKA)} a month, Helsinki, no church membership, 2026`, ['l', 'r', 'r', 'r'])}
<h2>Capped charges and a flat marginal rate</h2>
<p>The Yle tax is ${h.num(V.yle.prosentti, 1)}% of net earned income above ${h.eur(V.yle.tuloraja)}, capped at ${h.eur(V.yle.enimmaismaara)}, a ceiling reached at about ${h.eur(YLE_KATTO)} a year. Your marginal rate has also stopped rising: ${h.eur(KOR, 2)} of a ${h.eur(100)} raise reaches you, the same share as at five thousand a month. See ${h.a('marginaalivero', 'marginal tax rate')} for the breakdown.</p>
<h2>Parental allowance in three slices</h2>
<p>Kela's parental allowance is banded like income tax, in reverse: the more you earn, the smaller the share replaced. After the ${h.num(VP.vakuutusmaksuvahennys_prosentti, 2)}% deduction your annual income is ${h.eur(VR.vuositulo)}, which spans all three slices. The daily rate of ${h.eur(VR.pv, 2)}, about ${h.eur(VR.kk)} a month, is well under half your gross pay, so check if your collective agreement or contract continues salary for part of the leave; in that case Kela pays the allowance to your employer.</p>
${h.table(['Slice of annual income', 'Replacement', 'Per day'], OSAT.map((o) => [`${h.eur(o.ala)} – ${h.eur(o.yla)}`, `${h.num(o.pros)}%`, h.eur(o.pv, 2)]).concat([['Total', '', h.eur(VR.pv, 2)]]), `Parental allowance on ${h.eur(PALKKA)} a month, 2026`, ['l', 'r', 'r'])}
<h2>Pension on the full salary</h2>
<p>Earnings-related pension accrues at ${h.num(P.elake.karttumaprosentti, 1)}% of each year's earnings, so ${h.eur(PALKKA * 12)} adds ${h.eur(KARTTUMA_KK, 2)} a month to your future pension for every year, before the life expectancy coefficient. Pension is later taxed as earned income, and annual pension income above ${h.eur(LISAVERO.raja)} also pays a ${h.num(LISAVERO.prosentti, 2)}% additional tax; see ${h.a('elakkeen-verotus', 'pension tax')}. Municipal rates are in Vero's ${h.src('vero_kunnat', 'rate table')}.</p>`,
  },
});
