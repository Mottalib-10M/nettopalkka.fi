import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta, KUNNAT } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { asumistuki } from '../../lib/engine/asumistuki';
import { netto, MANNER } from '../../lib/esimerkit';

const OUL = kunta('Oulu');
const ALEMPIA = MANNER.filter((k) => k.kunta < OUL.kunta).length;
const SAMAT = MANNER.filter((k) => k.kunta === OUL.kunta).length;
const ORT_MAX = Math.max(...KUNNAT.map((k) => k.ort));
const ORT_MAX_N = KUNNAT.filter((k) => k.ort === ORT_MAX).length;

const KK = [2500, 3500, 5000];
const LAHI = ['Oulu', 'Kempele', 'Ii', 'Liminka', 'Muhos'];
const O35 = netto(3500, 'Oulu');
const KEMP_ERO = (netto(3500, 'Oulu').kkNettoTodellinen - netto(3500, 'Kempele').kkNettoTodellinen) * 12;
const T = (k: 'ei' | 'evl' | 'ort') => laskeVerot({ tulo: 42000, kunta: 'Oulu', kirkko: k });
const EVL42 = T('evl').kirkollisvero, ORT42 = T('ort').kirkollisvero;

const AT = P.asumistuki;
const L = AT.lammitys;
const lam = (a: number[], n: number) => a[0] + a[1] * (n - 1);
const ESIM = { aikuiset: 1, lapset: 0, tulot: 1100, vuokra: 330, vesiErikseen: true, lammitysErikseen: true };
const AT_POHJ = asumistuki({ kunta: 'Oulu', ...ESIM, lammitysalue: 'pohjoinen' });
const AT_PERUS = asumistuki({ kunta: 'Oulu', ...ESIM, lammitysalue: 'perus' });

export default definePage({
  id: 'oulu',
  group: 'kunnat',
  order: 60,
  tool: 'netto',
  toolPreset: { kunta: 'Oulu' },
  related: ['tampere', 'kuopio', 'asumistuki-laskuri', 'kuntavertailu'],
  sources: ['vero_kunnat', 'kela_asumistuki_laskenta'],
  fi: {
    slug: 'nettopalkka-oulu',
    nav: 'Oulu',
    card: 'Oulun 8,10 %:n vero, ortodoksien 2,25 % ja pohjoisen lämmityskulunormi asumistuessa.',
    title: 'Nettopalkka Oulu 2026: kunnallisvero 8,10 % ja lähikunnat',
    description: 'Nettopalkka Oulussa 2026: kunnallisvero 8,10 %, Kempele ja Ii 8,90 %. Laske käteen jäävä palkka ja katso, miten pohjoisen lämmitysnormi nostaa asumistukea.',
    h1: 'Nettopalkka Oulussa',
    intro: 'Laskuri käyttää Oulun kunnallis- ja kirkollisveroa: kirjoita bruttopalkka ja näet nettotulon.',
    resume: `Oulussa ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(O35.kkNettoTodellinen)} kuukaudessa ilman kirkollisveroa ja lomarahaa, ja verokortin prosentti on ${FI.p(O35.veroprosentti, 1)}. Oulun tuloveroprosentti on ${FI.p(OUL.kunta)}. Mannerkunnista ${ALEMPIA} verottaa kevyemmin, ja sama ${FI.p(OUL.kunta)} on käytössä ${SAMAT} kunnassa, muun muassa Jyväskylässä ja Kuopiossa, joten näissä kolmessa kaupungissa sama palkka tuottaa saman nettotulon. Oulun lähikunnat ovat kalliimpia: Kempele ja Ii perivät ${FI.p(kunta('Kempele').kunta)}, Liminka ja Muhos ${FI.p(kunta('Liminka').kunta)}. Evankelis-luterilainen kirkollisvero on Oulussa ${FI.p(OUL.evl)}, mutta ortodoksinen ${FI.p(OUL.ort)} on maan korkein. Asumistuessa Oulu kuuluu kuntaryhmään II, jossa yhden hengen asumismenojen katto on ${FI.eur(AT.enimmaisasumismenot.II[0])} kuukaudessa. Koska kaupunki on Pohjois-Pohjanmaalla, Kela hyväksyy erikseen maksettavaksi lämmitykseksi ${FI.eur(L.pohjoinen[0])} ensimmäiseltä ja ${FI.eur(L.pohjoinen[1])} jokaiselta seuraavalta henkilöltä, kun muualla Suomessa normi on ${FI.eur(L.perus[0])} ja ${FI.eur(L.perus[1])}.`,
    faqs: [
      { q: 'Mikä on Oulun veroprosentti vuonna 2026?', a: `Oulun kunnallisvero on ${FI.p(OUL.kunta)} vuonna 2026. Verokortin kokonaisprosentti riippuu palkasta: ${FI.eur(KK[0])} kuukausipalkalla se on ${FI.p(netto(KK[0], 'Oulu').veroprosentti, 1)}, ${FI.eur(KK[1])} palkalla ${FI.p(O35.veroprosentti, 1)} ja ${FI.eur(KK[2])} palkalla ${FI.p(netto(KK[2], 'Oulu').veroprosentti, 1)}, kun kirkkoon ei kuulu. Prosenttiin kuuluvat valtion vero, kunnallisvero, sairausvakuutusmaksut ja Yle-vero.` },
      { q: 'Paljonko ortodoksinen kirkollisvero Oulussa on?', a: `Oulun ortodoksisen seurakunnan kirkollisvero on ${FI.p(OUL.ort)}, mikä on Suomen korkein ortodoksinen prosentti; sama prosentti on ${ORT_MAX_N} kunnassa. ${FI.eur(42000)} vuosipalkalla se tekee noin ${FI.eur(ORT42)} vuodessa. Evankelis-luterilaisen seurakunnan jäsen maksaa samalla palkalla ${FI.eur(EVL42)}, koska prosentti on ${FI.p(OUL.evl)}.` },
      { q: 'Paljonko enemmän veroa maksaa Kempeleessä kuin Oulussa?', a: `Kempeleen tuloveroprosentti on ${FI.p(kunta('Kempele').kunta)} ja Oulun ${FI.p(OUL.kunta)}. ${FI.eur(3500)} kuukausipalkalla kempeleläinen maksaa noin ${FI.eur(KEMP_ERO)} vuodessa enemmän veroa. Kempele on lisäksi asumistuen kuntaryhmässä III, joten hyväksyttävien asumismenojen katto on yhdelle hengelle ${FI.eur(AT.enimmaisasumismenot.III[0])} Oulun ${FI.eur(AT.enimmaisasumismenot.II[0])} sijaan.` },
      { q: 'Paljonko lämmityskuluja Kela hyväksyy Oulussa asumistukeen?', a: `Jos lämmitys maksetaan vuokran lisäksi erikseen, Kela hyväksyy Pohjois-Pohjanmaalla, Kainuussa ja Lapissa ${FI.eur(L.pohjoinen[0])} kuukaudessa yhden hengen taloudelle ja ${FI.eur(L.pohjoinen[1])} lisää jokaista seuraavaa henkilöä kohden. Vesimaksuksi hyväksytään ${FI.eur(AT.vesimaksu_henkilo)} henkilöltä. Lämmitys ja vesi lasketaan vuokraan, ja summa on silti enintään kuntaryhmän katon suuruinen.` },
    ],
    body: (h) => `
<h2>Oulu ja lähikunnat</h2>
<p>Oulun ympäristössä kunnallisvero nousee, kun kaupungin rajan ylittää. Kempele ja Ii perivät ${h.pct(kunta('Kempele').kunta / 100, 2)}, Liminka ja Muhos jo ${h.pct(kunta('Liminka').kunta / 100, 2)}. Taulukko kertoo kuukauden nettopalkan kirkkoon kuulumattomalle ilman lomarahaa.</p>
${h.table(['Kotikunta', 'Kunnallisvero', `${h.eur(KK[0])}/kk brutto`, `${h.eur(KK[1])}/kk brutto`, `${h.eur(KK[2])}/kk brutto`], LAHI.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Oulun seudun nettopalkat kuukaudessa, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>${h.a('kuopio', 'Kuopiossa')} ja Jyväskylässä prosentti on täsmälleen sama kuin Oulussa, ja ${h.a('tampere', 'Tampereella')} ${h.pct(kunta('Tampere').kunta / 100, 2)}. Koko maan luvut ovat ${h.a('kuntavertailu', 'kuntavertailussa')}.</p>
<h2>Pohjoisen lämmitysnormi asumistuessa</h2>
<p>Kela ei hyväksy todellisia lämmityskuluja vaan kiinteän normin, ja se on alueittain erisuuruinen. Pohjois-Pohjanmaa, Kainuu ja Lappi saavat suurimman normin. Normi koskee vain asuntoja, joissa lämmitys maksetaan vuokran tai vastikkeen lisäksi erikseen.</p>
${h.table(['Henkilöitä', 'Pohjoinen (Oulu)', 'Itäinen', 'Muu Suomi'], [1, 2, 3, 4].map((n) => [n, h.eur(lam(L.pohjoinen, n)), h.eur(lam(L.itainen, n)), h.eur(lam(L.perus, n))]), 'Erikseen maksettavat lämmityskulut, jotka Kela hyväksyy asumistukeen, €/kk, 2026', ['l', 'r', 'r', 'r'])}
<p>Esimerkki: yksin asuvan oululaisen vuokra on ${h.eur(ESIM.vuokra)}, ja hän maksaa vedestä ja lämmityksestä erikseen. Bruttotulot ovat ${h.eur(ESIM.tulot)} kuukaudessa. Kela laskee asumismenoiksi ${h.eur(AT_POHJ.menot)} ja maksaa tukea ${h.eur(AT_POHJ.tuki, 2)}. Jos sama asunto olisi perusnormin alueella, menoiksi hyväksyttäisiin ${h.eur(AT_PERUS.menot)} ja tuki olisi ${h.eur(AT_PERUS.tuki, 2)}. Ero on pieni, ja se katoaa kokonaan, jos vuokra yltää jo valmiiksi ryhmän II kattoon. Lisätietoa ${h.src('kela_asumistuki_laskenta', 'Kelan sivulla tulojen ja menojen vaikutuksesta')}; laskelman voi tehdä ${h.a('asumistuki-laskuri', 'asumistukilaskurilla')}.</p>`,
  },
  en: {
    slug: 'net-salary-oulu',
    nav: 'Oulu',
    card: 'Oulu’s 8.10% tax, the 2.25% Orthodox rate and the northern heating allowance in Kela’s housing support.',
    title: 'Net Salary Oulu 2026: 8.10% Municipal Tax and Nearby Towns',
    description: 'Net salary in Oulu for 2026: municipal tax is 8.10%, Kempele and Ii 8.90%. Calculate your take-home pay and see how the northern heating norm lifts housing aid.',
    h1: 'Net salary in Oulu',
    intro: 'This calculator applies Oulu’s municipal and church tax: enter your gross salary to see net income.',
    resume: `In Oulu, a ${EN.eur(3500)} monthly salary leaves about ${EN.eur(O35.kkNettoTodellinen)} a month after tax in 2026, without church tax or holiday bonus, with a tax card (verokortti) rate of ${EN.p(O35.veroprosentti, 1)}. Oulu’s municipal tax is ${EN.p(OUL.kunta)}. ${ALEMPIA} mainland municipalities charge less, and the same ${EN.p(OUL.kunta)} applies in ${SAMAT} municipalities including Jyväskylä and Kuopio, so a given salary nets exactly the same in all three cities. The towns around Oulu cost more: Kempele and Ii charge ${EN.p(kunta('Kempele').kunta)}, Liminka and Muhos ${EN.p(kunta('Liminka').kunta)}. Lutheran church tax in Oulu is ${EN.p(OUL.evl)}, while the Orthodox rate of ${EN.p(OUL.ort)} is the highest in Finland. For Kela’s housing allowance, Oulu is in municipality group II, with a single-person cap of ${EN.eur(AT.enimmaisasumismenot.II[0])} a month on accepted housing costs. Because Oulu lies in North Ostrobothnia (Pohjois-Pohjanmaa), Kela accepts separately paid heating at ${EN.eur(L.pohjoinen[0])} for the first person and ${EN.eur(L.pohjoinen[1])} for each additional one, against ${EN.eur(L.perus[0])} and ${EN.eur(L.perus[1])} in most of the country.`,
    faqs: [
      { q: 'What tax rate will I pay on my salary in Oulu?', a: `Oulu’s municipal tax is ${EN.p(OUL.kunta)} for 2026. Your full tax card rate depends on pay: ${EN.p(netto(KK[0], 'Oulu').veroprosentti, 1)} at ${EN.eur(KK[0])} a month, ${EN.p(O35.veroprosentti, 1)} at ${EN.eur(KK[1])} and ${EN.p(netto(KK[2], 'Oulu').veroprosentti, 1)} at ${EN.eur(KK[2])}, outside the church. It bundles state tax, municipal tax, health insurance contributions and the Yle tax.` },
      { q: 'How high is Orthodox church tax in Oulu?', a: `Oulu’s Orthodox parish charges ${EN.p(OUL.ort)}, the highest Orthodox rate in Finland, applied in ${ORT_MAX_N} municipalities. On a ${EN.eur(42000)} salary that means about ${EN.eur(ORT42)} a year. A Lutheran member on the same salary pays ${EN.eur(EVL42)}, since the Lutheran rate is ${EN.p(OUL.evl)}. Non-members pay no church tax at all.` },
      { q: 'How much more tax would I pay living in Kempele instead of Oulu?', a: `Kempele charges ${EN.p(kunta('Kempele').kunta)} against Oulu’s ${EN.p(OUL.kunta)}. At ${EN.eur(3500)} a month that is about ${EN.eur(KEMP_ERO)} more tax a year. Kempele is also in housing allowance group III, where Kela accepts at most ${EN.eur(AT.enimmaisasumismenot.III[0])} of housing costs for one person instead of Oulu’s ${EN.eur(AT.enimmaisasumismenot.II[0])}.` },
      { q: 'What heating costs does Kela accept for housing allowance in Oulu?', a: `If you pay for heating on top of rent, Kela accepts ${EN.eur(L.pohjoinen[0])} a month for a one-person household in North Ostrobothnia, Kainuu and Lapland, plus ${EN.eur(L.pohjoinen[1])} for each extra person. Water is accepted at ${EN.eur(AT.vesimaksu_henkilo)} per person. Both are added to rent, and the total is still capped at the group II maximum.` },
    ],
    body: (h) => `
<h2>Oulu and its neighbours</h2>
<p>Around Oulu, municipal tax rises as soon as you cross the city line. Kempele and Ii charge ${h.pct(kunta('Kempele').kunta / 100, 2)}, Liminka and Muhos ${h.pct(kunta('Liminka').kunta / 100, 2)}. The table gives monthly net pay for someone outside the church, holiday bonus excluded.</p>
${h.table(['Home municipality', 'Municipal tax', `${h.eur(KK[0])} gross`, `${h.eur(KK[1])} gross`, `${h.eur(KK[2])} gross`], LAHI.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Monthly net pay in the Oulu area, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>${h.a('kuopio', 'Kuopio')} and Jyväskylä share Oulu’s exact rate, and ${h.a('tampere', 'Tampere')} charges ${h.pct(kunta('Tampere').kunta / 100, 2)}. All municipalities are in the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>The northern heating norm</h2>
<p>Kela does not reimburse your actual heating bill. It accepts a fixed amount (normi) that varies by region, and the three northern regions get the highest one. The norm only applies when heating is billed separately from the rent.</p>
${h.table(['People', 'North (Oulu)', 'East', 'Rest of Finland'], [1, 2, 3, 4].map((n) => [n, h.eur(lam(L.pohjoinen, n)), h.eur(lam(L.itainen, n)), h.eur(lam(L.perus, n))]), 'Separately paid heating accepted by Kela for housing allowance, € per month, 2026', ['l', 'r', 'r', 'r'])}
<p>Say you live alone in Oulu, pay ${h.eur(ESIM.vuokra)} rent plus separate water and heating, and earn ${h.eur(ESIM.tulot)} gross a month. Kela counts housing costs of ${h.eur(AT_POHJ.menot)} and pays ${h.eur(AT_POHJ.tuki, 2)}. In a region with the basic norm the same flat would count as ${h.eur(AT_PERUS.menot)} and give ${h.eur(AT_PERUS.tuki, 2)}. The difference is small and vanishes entirely once rent alone reaches the group II cap. See ${h.src('kela_asumistuki_laskenta', 'Kela’s page on income and costs')} or run the numbers in the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}.</p>`,
  },
});
