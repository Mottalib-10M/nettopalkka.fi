import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, valtionAsteikko } from '../../lib/engine/vero';

const V = P.vero;
const AS = V.valtion_asteikko;
const ALIN = AS[0].prosentti, YLIN = AS[AS.length - 1];
const AHV = V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa;
const T = 45000;
const TV = valtionAsteikko(T);
const TV_AH = valtionAsteikko(T, true);
const TRAJA = [...AS].reverse().find((x) => T > x.alaraja)!;

/** Puolitushaku: pienin vuosipalkka (Helsinki), jolla ehto täyttyy. */
const haku = (ehto: (tulo: number) => boolean) => { let lo = 0, hi = 200000; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (ehto(m)) hi = m; else lo = m; } return Math.ceil(hi / 100) * 100; };
const ALKAA = haku((t) => laskeVerot({ tulo: t, kunta: 'Helsinki' }).valtionvero > 0);
const YLIN_PALKKA = haku((t) => laskeVerot({ tulo: t, kunta: 'Helsinki' }).verotettava > YLIN.alaraja);
const ESIM = [30000, 50000, 80000].map((t) => ({ t, r: laskeVerot({ tulo: t, kunta: 'Helsinki' }) }));
const E50 = ESIM[1].r;
const LEVEYS = AS.slice(0, -1).map((x, i) => ({ ...x, yla: AS[i + 1].alaraja, max: (AS[i + 1].alaraja - x.alaraja) * x.prosentti / 100 }));
const PO = V.paaomatulovero;
const AH50 = laskeVerot({ tulo: 50000, kunta: 'Maarianhamina' });

export default definePage({
  id: 'valtion-tuloveroasteikko',
  group: 'vero',
  order: 40,
  mini: 'asteikko',
  related: ['tyotulovahennys', 'perusvahennys', 'marginaalivero', 'veroprosenttilaskuri'],
  sources: ['vero_asteikko', 'vero_ennakonpidatys', 'finlex_tvl'],
  fi: {
    slug: 'valtion-tuloveroasteikko',
    nav: 'Valtion tuloveroasteikko',
    card: 'Vuoden 2026 viisi tuloluokkaa, vero kunkin alarajalla ja miten asteikkoa luetaan oikein.',
    title: 'Valtion tuloveroasteikko 2026: tuloluokat ja vero rajoilla',
    description: `Valtion tuloveroasteikko 2026: viisi tuloluokkaa ${FI.num(ALIN, 2)} prosentista ${FI.num(YLIN.prosentti, 2)} prosenttiin, vero kunkin luokan alarajalla, laskuesimerkit ja Ahvenanmaan alennus.`,
    h1: 'Valtion tuloveroasteikko 2026',
    intro: 'Asteikko kertoo, paljonko valtion tuloveroa menee verotettavasta ansiotulosta ennen työtulovähennystä. Näin sitä luetaan.',
    resume: `Valtion tuloveroasteikossa on vuonna 2026 viisi tuloluokkaa: verotettavasta ansiotulosta menee ${FI.num(ALIN, 2)} % ensimmäiseen rajaan ${FI.eur(AS[1].alaraja)} asti, ja ylin prosentti ${FI.num(YLIN.prosentti, 2)} % koskee ${FI.eur(YLIN.alaraja)} ylittävää osaa. Asteikkoa luetaan aina kahdella luvulla: vero tuloluokan alarajalla plus luokan prosentti alarajan ylittävästä osasta. Esimerkiksi ${FI.eur(T)} verotettavasta tulosta valtion vero on ${FI.eur(TRAJA.vero_alarajalla, 2)} + ${FI.num(TRAJA.prosentti, 2)} % ${FI.eur(T - TRAJA.alaraja)} eurosta eli ${FI.eur(TV, 2)}. Luku on vero ennen työtulovähennystä, joka pienentää ensisijaisesti juuri valtion veroa, ja verotettava tulo on palkka vähennysten jälkeen. Siksi helsinkiläinen palkansaaja maksaa valtion tuloveroa vasta noin ${FI.eur(ALKAA)} vuosipalkasta alkaen, ja ylin ${FI.num(YLIN.prosentti, 2)} prosentin luokka alkaa noin ${FI.eur(YLIN_PALKKA)} palkasta. Korkeampaan luokkaan siirtyminen ei koskaan pienennä nettopalkkaa, koska suurempi prosentti koskee vain rajan ylittävää osaa. Ahvenanmaalla jokaista asteikon prosenttia alennetaan ${FI.num(AHV, 2)} prosenttiyksiköllä, joten ensimmäinen luokka on siellä verovapaa.`,
    faqs: [
      { q: 'Mikä on valtion tuloveron ylin prosentti vuonna 2026?', a: `Ylin prosentti on ${FI.num(YLIN.prosentti, 2)} %, ja se koskee verotettavan ansiotulon ${FI.eur(YLIN.alaraja)} ylittävää osaa. Rajalla veroa on kertynyt ${FI.eur(YLIN.vero_alarajalla, 2)}. Kun mukaan lasketaan kunnallisvero, maksut ja työtulovähennyksen pieneneminen, ansiotulon marginaalivero on korkeampi kuin pelkkä asteikon prosentti. Palkansaajalla ylin luokka alkaa noin ${FI.eur(YLIN_PALKKA)} vuosipalkasta.` },
      { q: 'Lasketaanko valtion vero bruttopalkasta?', a: `Ei lasketa. Asteikko koskee verotettavaa ansiotuloa, joka saadaan, kun palkasta vähennetään tulonhankkimisvähennys ${FI.eur(V.tulonhankkimisvahennys)}, työntekijän maksut ja perusvähennys. ${FI.eur(50000)} palkasta Helsingissä verotettavaa tuloa jää ${FI.eur(E50.verotettava)}, ja asteikon mukainen vero on ${FI.eur(E50.valtionveroEnnen)} ennen työtulovähennystä. Bruttopalkkaan asteikkoa soveltamalla vero arvioituisi selvästi liian suureksi.` },
      { q: 'Laskeeko nettopalkka, jos tulot nousevat seuraavaan tuloluokkaan?', a: `Ei laske. Korkeampi prosentti koskee vain rajan ylittävää osaa, ei koko tuloa. Jos verotettava tulo nousee ${FI.eur(AS[2].alaraja)} rajan yli sadalla eurolla, vain se sata euroa verotetaan valtion verossa ${FI.num(AS[2].prosentti, 2)} prosentilla edellisen luokan ${FI.num(AS[1].prosentti, 2)} prosentin sijaan. Nettotulo kasvaa aina, kun bruttotulo kasvaa, vaikka viimeisten eurojen verotus kiristyy.` },
      { q: 'Paljonko valtion tuloveroa Ahvenanmaalla maksetaan?', a: `Ahvenanmaalla asteikon jokaista prosenttia alennetaan ${FI.num(AHV, 2)} prosenttiyksiköllä. Ensimmäinen tuloluokka on siellä nollaprosenttinen ja ylin ${FI.num(YLIN.prosentti - AHV, 2)} %. ${FI.eur(T)} verotettavasta tulosta valtion vero on ${FI.eur(TV_AH)} eli ${FI.eur(TV - TV_AH)} vähemmän kuin mantereella. Ahvenanmaan kunnallisverot ovat kuitenkin korkeammat, joten kokonaisvero ei pienene samassa suhteessa.` },
      { q: 'Miksi palkkalaskelmassa ei näy valtion veroa erikseen?', a: `Työnantaja pidättää yhden prosentin verokortin mukaan, ja siihen on yhdistetty valtion vero, kunnallisvero, kirkollisvero ja maksut. Valtion veron osuuden näet vasta verotuspäätöksestä. ${FI.eur(50000)} palkalla Helsingissä valtion vero on työtulovähennyksen jälkeen ${FI.eur(E50.valtionvero)} ja kunnallisvero ${FI.eur(E50.kunnallisvero)}, joten valtion osuus on suurempi kuin kunnan.` },
      { q: 'Onko valtion tuloveroasteikko sama palkalle ja eläkkeelle?', a: `On. Palkka, eläke ja veronalaiset etuudet ovat kaikki ansiotuloa, ja ne lasketaan yhteen ennen kuin valtion asteikkoa sovelletaan. Eläkkeensaajalla verotettavaa tuloa pienentää eläketulovähennys, mutta työtulovähennystä ei eläkkeestä saa. Lisäksi ${FI.eur(V.elaketulon_lisavero.raja)} ylittävästä eläketulosta peritään ${FI.num(V.elaketulon_lisavero.prosentti, 2)} %:n lisävero asteikon päälle. Eläkkeen verotus on koottu omalle sivulleen, koska vähennykset muuttavat lopputulosta paljon.` },
    ],
    body: (h) => `
<h2>Asteikko 2026</h2>
${h.table(['Verotettava ansiotulo', 'Vero alarajalla', 'Prosentti ylittävästä osasta', 'Ahvenanmaalla'],
  AS.map((x, i) => [i + 1 < AS.length ? `${h.eur(x.alaraja)}–${h.eur(AS[i + 1].alaraja)}` : `${h.eur(x.alaraja)} –`, h.eur(x.vero_alarajalla, 2), `${h.num(x.prosentti, 2)} %`, `${h.num(Math.max(0, x.prosentti - AHV), 2)} %`]),
  'Tuloverolaki, vuoden 2026 asteikko; Ahvenanmaan sarake: prosentit alennettuina', ['l', 'r', 'r', 'r'])}
<p>Asteikossa on viisi riviä, ja jokaisella rivillä on kaksi lukua. Vero alarajalla on se kiinteä summa, joka edellisistä tuloluokista on jo kertynyt. Prosentti koskee vain tuloa, joka ylittää rivin alarajan. Oman verotettavan tulon valtionvero lasketaan siis yhdellä kertolaskulla ja yhdellä yhteenlaskulla: etsi rivi, jonka alaraja on lähinnä tuloasi alapuolella, kerro alarajan ylittävä osa rivin prosentilla ja lisää rivin kiinteä vero. Ensimmäisellä rivillä kiinteää osaa ei ole.</p>

<h2>Esimerkki: ${h.eur(T)} verotettavaa tuloa</h2>
<p>${h.eur(T)} osuu riville, jonka alaraja on ${h.eur(TRAJA.alaraja)}. Alarajan vero on ${h.eur(TRAJA.vero_alarajalla, 2)}, ja ylittävästä ${h.eur(T - TRAJA.alaraja)} osasta menee ${h.num(TRAJA.prosentti, 2)} % eli ${h.eur((T - TRAJA.alaraja) * TRAJA.prosentti / 100, 2)}. Yhteensä valtion vero ennen vähennyksiä on ${h.eur(TV, 2)}, mikä on ${h.num(TV / T * 100, 2)} % tulosta. Keskimääräinen prosentti on aina selvästi pienempi kuin rivin prosentti, koska alemmat tuloluokat verotetaan kevyemmin. Tämä ero on progressiivisen asteikon ydin, ja se selittää, miksi naapurin ${h.num(TRAJA.prosentti, 2)} prosentin luokka ei tarkoita, että hän maksaisi valtiolle niin suuren osan koko palkastaan.</p>
<p>Asteikosta näkee myös, mitä seuraava tuhat euroa maksaa. Jos verotettava tulo nousee ${h.eur(T)} eurosta ${h.eur(T + 1000)} euroon, valtion vero kasvaa ${h.eur(valtionAsteikko(T + 1000) - TV, 2)}, eli täsmälleen rivin prosentin verran. Työtulovähennyksen pieneneminen ja kunnallisvero lisäävät tähän vielä oman osansa, joten palkansaajan todellinen lisävero on suurempi.</p>

<h2>Mistä alarajan vero tulee</h2>
<p>Kiinteät summat eivät ole erillisiä päätöksiä vaan juokseva summa. Jokaisen tuloluokan täysi vero on luokan leveys kerrottuna sen prosentilla, ja seuraavan rivin alarajan vero on edellisen rivin kiinteä summa plus tämä luku. Kun asteikkoa muutetaan, rajat ja prosentit päätetään tuloverolaissa, ja kiinteät summat seuraavat niistä.</p>
${h.table(['Tuloluokka', 'Leveys', 'Prosentti', 'Täysi vero luokasta'],
  LEVEYS.map((x) => [`${h.eur(x.alaraja)}–${h.eur(x.yla)}`, h.eur(x.yla - x.alaraja), `${h.num(x.prosentti, 2)} %`, h.eur(x.max, 2)]),
  'Neljä alinta tuloluokkaa; summat kumuloituvat seuraavan rivin alarajan veroksi', ['l', 'r', 'r', 'r'])}
<p>Taulukosta näkee, että kaksi keskimmäistä tuloluokkaa ovat kapeita mutta prosentiltaan jyrkkiä. Siksi valtion vero kasvaa nopeasti, kun verotettava tulo nousee ${h.eur(AS[2].alaraja)} yli, ja keskimääräinen veroprosentti kasvaa tällä tulovälillä tuntuvasti jokaisella palkankorotuksella.</p>

<h2>Mitä asteikko ei koske</h2>
<p>Asteikko koskee kaikkea ansiotuloa yhdessä: palkka, eläke ja veronalaiset etuudet, kuten työttömyyspäiväraha, lasketaan yhteen ennen kuin asteikkoa sovelletaan. Pääomatulot, kuten osingot, vuokratulot ja luovutusvoitot, verotetaan erikseen kiinteällä prosentilla: ${h.num(PO.prosentti)} % ${h.eur(PO.raja)} asti ja ${h.num(PO.ylempi_prosentti)} % sen ylittävästä osasta. Ennakonpidätyksessä Verohallinto käyttää samaa ansiotuloasteikkoa veroprosentin laskemiseen, mutta lisäprosentti tulee erillisestä asteikosta, joka on kuvattu sivulla ${h.a('tuloraja', 'tuloraja ja lisäprosentti')}.</p>

<h2>Palkasta valtion veroon</h2>
<p>Asteikko ei ole sama asia kuin palkan veroprosentti. Palkasta vähennetään ensin tulonhankkimisvähennys, työeläke-, työttömyysvakuutus- ja päivärahamaksu sekä ${h.a('perusvahennys', 'perusvähennys')}, ja vasta jäljelle jäävään summaan sovelletaan asteikkoa. Sen jälkeen asteikon verosta vähennetään ${h.a('tyotulovahennys', 'työtulovähennys')}, joka on palkansaajalla enimmillään ${h.eur(V.tyotulovahennys.enimmaismaara)}. Taulukko näyttää ketjun kolmella palkalla.</p>
${h.table(['Vuosipalkka', 'Verotettava tulo', 'Asteikon vero', 'Työtulovähennys', 'Valtion vero', 'Osuus palkasta'],
  ESIM.map(({ t, r }) => [h.eur(t), h.eur(r.verotettava), h.eur(r.valtionveroEnnen), h.eur(r.tyotulovahennys), h.eur(r.valtionvero), `${h.num(r.valtionvero / t * 100, 1)} %`]),
  'Helsinki, ei kirkon jäsen, vuoden 2026 perusteet', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Pienellä palkalla työtulovähennys kattaa lähes koko asteikon veron, ja jos se on suurempi kuin valtion vero, ylimenevä osa vähennetään kunnallisverosta ja maksuista. Siksi Helsingissä valtion veroa jää maksettavaksi vasta noin ${h.eur(ALKAA)} vuosipalkasta alkaen. Suurilla tuloilla työtulovähennys on jo pienentynyt, ja valtion vero kasvaa nopeasti.</p>

<h2>Missä palkassa ylin luokka alkaa</h2>
<p>Ylin ${h.num(YLIN.prosentti, 2)} prosentin luokka alkaa ${h.eur(YLIN.alaraja)} verotettavasta tulosta. Koska vähennykset ja maksut pienentävät verotettavaa tuloa, raja ylittyy palkansaajalla vasta noin ${h.eur(YLIN_PALKKA)} vuosipalkalla. Rajan yli menevästä eurosta valtio ottaa ${h.num(YLIN.prosentti, 2)} senttiä, ja sen päälle tulevat kunnallisvero, mahdollinen kirkollisvero ja sairaanhoitomaksu. Kokonaiskuva viimeisten eurojen verotuksesta on sivulla ${h.a('marginaalivero', 'marginaalivero')}.</p>

<h2>Ahvenanmaa</h2>
<p>Ahvenanmaalla kotikuntansa omaaville asteikon prosentteja alennetaan ${h.num(AHV, 2)} prosenttiyksiköllä. Ensimmäisen luokan ${h.num(ALIN, 2)} % putoaa nollaan, joten valtion veroa alkaa kertyä vasta ${h.eur(AS[1].alaraja)} verotettavan tulon jälkeen. Maarianhaminassa ${h.eur(50000)} palkasta asteikon vero on ${h.eur(AH50.valtionveroEnnen)}, ja työtulovähennyksen jälkeen valtion veroa jää ${h.eur(AH50.valtionvero)}; vastaavasti kunnallisvero on suurempi kuin mantereella. Ahvenanmaalla myös perusvähennys on kunnallisverotuksessa erilainen, ${h.eur(V.ahvenanmaa_perusvahennys.enimmaismaara)}, ja Yle-veron sijaan peritään ${h.eur(V.ahvenanmaa_mediamaksu.maara)} mediamaksu. Ahvenanmaan erityispiirteet on koottu sivulle ${h.a('ahvenanmaa', 'Ahvenanmaan verotus')}.</p>
<p>Lähteet: ${h.src('vero_asteikko')}; ${h.src('finlex_tvl')}; ${h.src('vero_ennakonpidatys')}.</p>`,
  },
  en: {
    slug: 'state-income-tax-scale',
    nav: 'State income tax scale',
    card: 'The five 2026 brackets of Finnish state income tax, the tax at each threshold and how to read the table.',
    title: 'State Income Tax Scale 2026: Brackets, Rates and Tax Owed',
    description: `State income tax scale 2026 in Finland: five brackets from ${EN.num(ALIN, 2)}% to ${EN.num(YLIN.prosentti, 2)}%, the tax due at each threshold, worked examples and the lower Åland rates.`,
    h1: 'Finnish state income tax scale 2026',
    intro: 'The state scale sets how much income tax goes to the central government on your taxable earned income, before the earned income credit. Here is how to use it.',
    resume: `Finland’s 2026 state income tax scale (valtion tuloveroasteikko) has five brackets. Taxable earned income up to ${EN.eur(AS[1].alaraja)} is taxed at ${EN.num(ALIN, 2)}%, and the top rate of ${EN.num(YLIN.prosentti, 2)}% applies to the part above ${EN.eur(YLIN.alaraja)}. Each line of the table gives a fixed amount of tax at the bracket floor plus a rate on the income above that floor. On ${EN.eur(T)} of taxable income, state tax is ${EN.eur(TRAJA.vero_alarajalla, 2)} plus ${EN.num(TRAJA.prosentti, 2)}% of ${EN.eur(T - TRAJA.alaraja)}, or ${EN.eur(TV, 2)} in total. That figure comes before the earned income tax credit, which is set against state tax first, and taxable income is salary after deductions, not gross pay. In practice an employee in Helsinki pays no state income tax at all until a salary of about ${EN.eur(ALKAA)}, and the top bracket only starts around ${EN.eur(YLIN_PALKKA)} of salary. Moving into a higher bracket never reduces take-home pay, because the higher rate only touches the slice above the threshold. In the Åland Islands every rate is cut by ${EN.num(AHV, 2)} points, which makes the first bracket tax-free.`,
    faqs: [
      { q: 'What is the top rate of Finnish state income tax in 2026?', a: `The top rate is ${EN.num(YLIN.prosentti, 2)}%, charged on taxable earned income above ${EN.eur(YLIN.alaraja)}. By that threshold ${EN.eur(YLIN.vero_alarajalla, 2)} of state tax has already built up. Municipal tax, contributions and the tapering of the earned income credit come on top, so your real marginal rate is well above the scale figure alone. For an employee the top bracket starts around ${EN.eur(YLIN_PALKKA)} of salary.` },
      { q: 'Is Finnish state income tax charged on my gross salary?', a: `No. The scale applies to taxable earned income: salary minus the ${EN.eur(V.tulonhankkimisvahennys)} work-expense deduction, your employee contributions and the basic deduction. On ${EN.eur(50000)} of salary in Helsinki that leaves ${EN.eur(E50.verotettava)} taxable, and scale tax of ${EN.eur(E50.valtionveroEnnen)} before the earned income credit is taken off. Applying the scale to gross pay overstates the bill.` },
      { q: 'Will I take home less if a raise moves me into the next tax bracket?', a: `No. The higher rate applies only to the euros above the threshold, never to your whole income. If taxable income goes ${EN.eur(100)} past the ${EN.eur(AS[2].alaraja)} threshold, just that ${EN.eur(100)} is taxed at ${EN.num(AS[2].prosentti, 2)}% instead of ${EN.num(AS[1].prosentti, 2)}% in state tax. Gross up, net up, every time, even though each extra euro is taxed a little harder than the last.` },
      { q: 'How much state income tax do you pay on the Åland Islands?', a: `Every rate on the scale is lowered by ${EN.num(AHV, 2)} points for Åland residents. The first bracket therefore drops to zero and the top one to ${EN.num(YLIN.prosentti - AHV, 2)}%. On ${EN.eur(T)} of taxable income, Åland state tax is ${EN.eur(TV_AH)}, which is ${EN.eur(TV - TV_AH)} less than on the mainland, though Åland municipal rates are higher.` },
    ],
    body: (h) => `
<h2>The 2026 scale</h2>
${h.table(['Taxable earned income', 'Tax at lower limit', 'Rate on the excess', 'Åland rate'],
  AS.map((x, i) => [i + 1 < AS.length ? `${h.eur(x.alaraja)} to ${h.eur(AS[i + 1].alaraja)}` : `${h.eur(x.alaraja)} and above`, h.eur(x.vero_alarajalla, 2), `${h.num(x.prosentti, 2)}%`, `${h.num(Math.max(0, x.prosentti - AHV), 2)}%`]),
  'Income Tax Act, 2026 scale; Åland column shows the reduced rates', ['l', 'r', 'r', 'r'])}
<p>If you come from a country where tax tables list a single rate per income band, the Finnish layout takes a moment to read. The second column is a running total: the tax already owed on all the lower brackets. The third column is the rate on the part of your income above that row’s floor. So the calculation is always the same: pick the row whose lower limit sits just below your taxable income, apply its rate to the excess, and add the fixed amount. The first row has no fixed amount.</p>

<h2>Worked example: ${h.eur(T)} of taxable income</h2>
<p>${h.eur(T)} falls in the row starting at ${h.eur(TRAJA.alaraja)}. The fixed tax at that floor is ${h.eur(TRAJA.vero_alarajalla, 2)}; the ${h.eur(T - TRAJA.alaraja)} above it is taxed at ${h.num(TRAJA.prosentti, 2)}%, adding ${h.eur((T - TRAJA.alaraja) * TRAJA.prosentti / 100, 2)}. State tax before credits is ${h.eur(TV, 2)}, an average of ${h.num(TV / T * 100, 2)}% of the taxable amount. Your bracket rate and your average rate are different things, and in Finland the gap between them is wide because the lower brackets are taxed lightly.</p>

<h2>Where the fixed amounts come from</h2>
<p>The second column is not a separate decision but a running total. The full tax for each band is its width times its rate, and the next row’s fixed amount is the previous one plus that figure. Parliament sets the thresholds and rates in the Income Tax Act; the fixed amounts follow automatically.</p>
${h.table(['Band', 'Width', 'Rate', 'Full tax for the band'],
  LEVEYS.map((x) => [`${h.eur(x.alaraja)} to ${h.eur(x.yla)}`, h.eur(x.yla - x.alaraja), `${h.num(x.prosentti, 2)}%`, h.eur(x.max, 2)]),
  'The four lower bands; each total rolls into the next floor', ['l', 'r', 'r', 'r'])}
<p>The two middle bands are narrow but steep, which is why state tax climbs fast once taxable income passes ${h.eur(AS[2].alaraja)}.</p>

<h2>What the scale does not cover</h2>
<p>All earned income is pooled before the scale is applied: salary, pension and taxable benefits such as unemployment allowance. Capital income, including dividends, rent and capital gains, sits outside it and is taxed at a flat ${h.num(PO.prosentti)}% up to ${h.eur(PO.raja)} and ${h.num(PO.ylempi_prosentti)}% above. Vero uses the same earned income scale to set your tax card rate, but the additional rate comes from a separate scale explained on the ${h.a('tuloraja', 'income limit page')}.</p>

<h2>From salary to state tax</h2>
<p>Expats often apply the scale straight to their gross salary and overestimate their tax. The scale starts after several deductions: the work-expense deduction, your pension, unemployment and daily allowance contributions, and the ${h.a('perusvahennys', 'basic deduction')}. Only then is the scale applied, and afterwards the ${h.a('tyotulovahennys', 'earned income tax credit')}, up to ${h.eur(V.tyotulovahennys.enimmaismaara)}, comes off the result.</p>
${h.table(['Annual salary', 'Taxable income', 'Scale tax', 'Earned income credit', 'State tax', 'Share of salary'],
  ESIM.map(({ t, r }) => [h.eur(t), h.eur(r.verotettava), h.eur(r.valtionveroEnnen), h.eur(r.tyotulovahennys), h.eur(r.valtionvero), `${h.num(r.valtionvero / t * 100, 1)}%`]),
  'Helsinki, not a church member, 2026 rules', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>At lower salaries the credit swallows almost all of the scale tax; any part of the credit left over is taken off municipal tax and contributions instead. That is why state tax only starts to bite around ${h.eur(ALKAA)} of salary in Helsinki. Higher up, the credit has tapered and state tax grows quickly.</p>

<h2>Where the top bracket begins</h2>
<p>The ${h.num(YLIN.prosentti, 2)}% bracket begins at ${h.eur(YLIN.alaraja)} of taxable income, which for an employee means a salary of roughly ${h.eur(YLIN_PALKKA)}. Each euro above that line costs ${h.num(YLIN.prosentti, 2)} cents in state tax alone, before municipal tax, church tax if any and the health care contribution. The ${h.a('marginaalivero', 'marginal tax rate')} page adds all of these up.</p>

<h2>The Åland Islands</h2>
<p>Residents of Åland have every scale rate reduced by ${h.num(AHV, 2)} points. The ${h.num(ALIN, 2)}% first bracket disappears, so state tax only begins above ${h.eur(AS[1].alaraja)} of taxable income. In Mariehamn a ${h.eur(50000)} salary produces scale tax of ${h.eur(AH50.valtionveroEnnen)} and, after the earned income credit, ${h.eur(AH50.valtionvero)} of state tax, while municipal tax there is correspondingly higher. More on the islands’ rules in ${h.a('ahvenanmaa', 'Åland taxation')}.</p>
<p>Sources: ${h.src('vero_asteikko')}; ${h.src('finlex_tvl')}; ${h.src('vero_ennakonpidatys')}.</p>`,
  },
});
