import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { vanhempainraha } from '../../lib/engine/paivaraha';
import { laskeVerot } from '../../lib/engine/vero';

const V = P.vanhempainraha;
const [R1, R2, R3] = V.rajat;
const [P1, P2, P3] = V.prosentit;
const VAH = V.vakuutusmaksuvahennys_prosentti / 100;
/** Kiintiön kokonaismäärä: korotetut päivät + loput tavallisella päivärahalla (kuten laskurissa). */
const kiintio = (r: ReturnType<typeof vanhempainraha>) => r.korotettuPv * V.korotetut_paivat_vanhempainraha + r.pv * (V.paivat_vanhempi - V.korotetut_paivat_vanhempainraha);
const VUODET = [20000, 30000, 40000, 50000, 60000, 80000, 100000];
const RIVIT = VUODET.map((y) => ({ y, r: vanhempainraha(y) }));
const KK = 3000, LR = 1500;
const ESIM = vanhempainraha(KK * 12 + LR);
const KELA = vanhempainraha(V.esimerkki_vuositulo.brutto);
/** Bruttovuositulot, joilla 9,07 %:n vähennyksen jälkeen ylitetään porrasrajat. */
const B2 = R2 / (1 - VAH), B3 = R3 / (1 - VAH), B1 = R1 / (1 - VAH);
/** Verot: vanhempainraha on etuustuloa; arvio koko vuoden päivärahasta (25 pv/kk). */
const VERO = laskeVerot({ tulo: ESIM.kk * 12, tulolaji: 'etuus', kunta: 'Helsinki' });

export default definePage({
  id: 'vanhempainpaivaraha-laskuri',
  group: 'laskurit',
  order: 100,
  tool: 'vanhempainpaivaraha',
  related: ['lomaraha-laskuri', 'asumistuki-laskuri', 'nettopalkka-3000'],
  sources: ['kela_vanhempainvapaa', 'kela_vuositulot'],
  fi: {
    slug: 'vanhempainpaivaraha',
    nav: 'Vanhempainpäiväraha',
    card: 'Kelan vanhempainraha arkipäivältä ja kuukaudessa vuositulojen mukaan, korotettu jakso mukaan lukien.',
    title: 'Vanhempainpäiväraha 2026: laskuri, kaava ja korotettu jakso',
    description: `Vanhempainpäiväraha 2026: laske Kelan vanhempainraha omista vuosituloistasi. ${FI.eur(KK)} kuukausipalkalla saat noin ${FI.eur(ESIM.pv, 2)} arkipäivältä, ${FI.eur(ESIM.kk)} kuukaudessa.`,
    h1: 'Vanhempainpäivärahalaskuri 2026',
    intro: 'Syötä kuukausipalkka ja vuoden lomaraha, niin laskuri arvioi vanhempainrahasi arkipäivältä, kuukaudessa ja koko kiintiöltä.',
    resume: `Vuonna 2026 vanhempainraha on ${FI.p(P1, 0)} vuositulosta jaettuna luvulla ${V.jakaja}, kun vuositulo vakuutusmaksuvähennyksen jälkeen on ${FI.eur(R1)}–${FI.eur(R2)}: ${FI.eur(KK)} kuukausipalkalla ja ${FI.eur(LR)} lomarahalla saat noin ${FI.eur(ESIM.pv, 2)} arkipäivältä eli noin ${FI.eur(ESIM.kk)} kuukaudessa. Kela vähentää palkkatulosta ensin ${FI.p(V.vakuutusmaksuvahennys_prosentti)} vakuutusmaksuvähennyksen. Rajan ${FI.eur(R2)} ylittävästä tulosta korvataan ${FI.p(P2, 0)} ja rajan ${FI.eur(R3)} ylittävästä ${FI.p(P3, 0)}, joten suurituloisen korvausaste jää selvästi pienemmäksi. Pienin päiväraha on ${FI.eur(V.vahimmais_pv, 2)}. Vanhempainrahan ${V.korotetut_paivat_vanhempainraha} ensimmäistä arkipäivää maksetaan korotettuna, enintään ${FI.p(V.korotettu_prosentti, 0)} vuosituloista, ja raskausraha ${V.raskausraha_paivat} arkipäivältä samoin korotettuna. Rahaa maksetaan ${V.paivia_viikossa} arkipäivältä viikossa, ja lasta kohden päiviä on ${V.paivat_yhteensa}, kummallekin vanhemmalle ${V.paivat_vanhempi}, joista ${V.luovutettavissa} voi luovuttaa toiselle. Laskuri arvioi myös koko oman kiintiösi summan: esimerkkitapauksessa noin ${FI.eur(kiintio(ESIM))} ennen veroja. Vanhempainraha on veronalaista tuloa, joten käteen jää vähemmän.`,
    faqs: [
      { q: 'Paljonko vanhempainrahaa saa 3 000 euron kuukausipalkalla?', a: `Jos lomaraha on ${FI.eur(LR)}, vuositulo on ${FI.eur(KK * 12 + LR)} ja vakuutusmaksuvähennyksen jälkeen ${FI.eur(ESIM.vuositulo)}. Päiväraha on ${FI.p(P1, 0)} × ${FI.eur(ESIM.vuositulo)} / ${V.jakaja} = ${FI.eur(ESIM.pv, 2)} arkipäivältä, ja ${V.korotetut_paivat_vanhempainraha} ensimmäiseltä päivältä ${FI.eur(ESIM.korotettuPv, 2)}. Kuukaudessa se tekee noin ${FI.eur(ESIM.kk)} ennen veroja, kun kuukaudessa on noin 25 arkipäivää.` },
      { q: 'Mikä on vanhempainrahan vähimmäismäärä vuonna 2026?', a: `${FI.eur(V.vahimmais_pv, 2)} arkipäivältä. Sitä maksetaan, jos vuositulosi vakuutusmaksuvähennyksen jälkeen on enintään ${FI.eur(R1)} tai sinulla ei ole tuloja lainkaan, esimerkiksi opiskelijana. Bruttopalkkana raja on noin ${FI.eur(B1)} vuodessa. Korotetunkin päivärahan vähimmäismäärä on sama, kun vuositulo on enintään ${FI.eur(V.korotettu_raja_ala)}.` },
      { q: 'Miksi vanhempainraha on alussa suurempi kuin myöhemmin?', a: `Vanhempainrahan ${V.korotetut_paivat_vanhempainraha} ensimmäistä arkipäivää maksetaan korotettuna, enintään ${FI.p(V.korotettu_prosentti, 0)} vuosituloista jaettuna luvulla ${V.jakaja}. Raskausrahaa maksetaan samalla korotetulla tasolla ${V.raskausraha_paivat} arkipäivältä. Esimerkiksi ${FI.eur(KK)} kuukausipalkalla korotettu päiväraha on ${FI.eur(ESIM.korotettuPv, 2)} ja tavallinen ${FI.eur(ESIM.pv, 2)}, joten ensimmäinen maksu voi olla selvästi myöhempiä suurempi.` },
      { q: 'Montako vanhempainrahapäivää kummallekin vanhemmalle on?', a: `Lasta kohden päiviä on yhteensä ${V.paivat_yhteensa} arkipäivää, ja kummankin vanhemman oma kiintiö on ${V.paivat_vanhempi} päivää. Omasta kiintiöstä voi luovuttaa toiselle vanhemmalle enintään ${V.luovutettavissa} arkipäivää. Arkipäiviä ovat maanantaista lauantaihin, joten ${V.paivat_vanhempi} päivää vastaa noin ${FI.num(V.paivat_vanhempi / V.paivia_viikossa, 0)} viikkoa. Raskausraha ${V.raskausraha_paivat} päivältä tulee näiden lisäksi.` },
      { q: 'Paljonko vanhempainrahasta menee veroa?', a: `Vanhempainraha on veronalaista tuloa, ja Kela pidättää veron verokortin mukaan. Etuustulosta ei peritä työeläke- eikä työttömyysvakuutusmaksua, mutta sairaanhoitomaksu on ${FI.p(P.vero.sairaanhoitomaksu_muu_tulo_prosentti)}. Jos saisit ${FI.eur(ESIM.kk)} kuukaudessa koko vuoden, veroprosentti olisi Helsingissä noin ${FI.num(VERO.veroprosentti, 1)} %. Todellinen vero riippuu saman vuoden palkkatuloista.` },
    ],
    body: (h) => `
<h2>Vanhempainraha eri vuosituloilla</h2>
<p>Taulukossa on päiväraha bruttovuositulon mukaan. Vuositulo tarkoittaa palkkaa ja lomarahaa ennen veroja; laskuri tekee vakuutusmaksuvähennyksen ${h.num(V.vakuutusmaksuvahennys_prosentti, 2)} % itse. Kuukausi on arvio, jossa on 25 arkipäivää. Oma kiintiö on ${h.num(V.paivat_vanhempi)} päivää, joista ${h.num(V.korotetut_paivat_vanhempainraha)} korotettuna.</p>
${h.table(['Vuositulo (brutto)', 'Korotettu/pv', 'Päiväraha/pv', 'Kuukausi', 'Oma kiintiö yht.'], RIVIT.map((x) => [h.eur(x.y), h.eur(x.r.korotettuPv, 2), h.eur(x.r.pv, 2), h.eur(x.r.kk), h.eur(kiintio(x.r))]), 'Kelan vanhempainraha 2026, ennen veroja', ['l', 'r', 'r', 'r', 'r'])}
<p>Taulukko näyttää korvausasteen laskun. ${h.eur(RIVIT[1].y)} vuosituloilla päiväraha on noin ${h.num(RIVIT[1].r.kk * 12 / RIVIT[1].y * 100)} % palkasta, mutta ${h.eur(RIVIT[6].y)} tuloilla enää ${h.num(RIVIT[6].r.kk * 12 / RIVIT[6].y * 100)} %. Taitteet osuvat bruttona noin ${h.eur(B2)} ja ${h.eur(B3)} vuosituloihin.</p>
<h2>Kelan kaava 2026</h2>
${h.table(['Vuositulo vähennyksen jälkeen', 'Päiväraha arkipäivältä'], [
  [`enintään ${h.eur(R1)}`, h.eur(V.vahimmais_pv, 2)],
  [`${h.eur(R1)}–${h.eur(R2)}`, `${h.num(P1 / 100, 1)} × vuositulo / ${V.jakaja}`],
  [`${h.eur(R2)}–${h.eur(R3)}`, `${h.num(P1 / 100 * R2 / V.jakaja, 2)} + ${h.num(P2 / 100, 1)} × (vuositulo − ${h.eur(R2)}) / ${V.jakaja}`],
  [`yli ${h.eur(R3)}`, `${h.num(P1 / 100 * R2 / V.jakaja + P2 / 100 * (R3 - R2) / V.jakaja, 2)} + ${h.num(P3 / 100, 2)} × (vuositulo − ${h.eur(R3)}) / ${V.jakaja}`],
], 'Vanhempainraha vuosituloista, Kela 2026', ['l', 'l'])}
<p>Kela laskee vuositulon edellisten 12 kalenterikuukauden ajalta niin, että tarkastelujakson ja päivärahan alun väliin jää yksi kalenterikuukausi. Lomaraha kuuluu vuosituloon. Kelan vuositulo-ohjeen esimerkissä ${h.eur(V.esimerkki_vuositulo.brutto)} vuosituloista saadaan noin ${h.eur(V.esimerkki_vuositulo.pv_noin)} arkipäivältä; laskuri antaa samasta tulosta ${h.eur(KELA.pv, 2)}. Kaava ja rajat ovat ${h.src('kela_vuositulot', 'Kelan sivulla vuosituloista ja laskukaavoista')}.</p>
<h2>Kuinka paljon palkasta korvataan</h2>
<p>Moni yllättyy, kun vanhempainraha jää selvästi nettopalkkaa pienemmäksi. Syitä on kolme: palkasta tehdään ensin ${h.num(V.vakuutusmaksuvahennys_prosentti, 2)} prosentin vähennys, korvausprosentti on enintään ${h.num(P1)} ja korkeammat tulot korvataan vain ${h.num(P2)} tai ${h.num(P3)} prosentin osuudella. Päiväraha maksetaan arkipäiviltä, mutta kuukauden arkipäivien määrä vaihtelee, joten kuukausisumma heiluu hieman. Korotettu jakso nostaa ensimmäisten viikkojen tuloa, ja sen jälkeen taso laskee pysyvästi.</p>
<h2>Päivät ja niiden jakaminen</h2>
<ul>
<li><strong>Raskausraha</strong> ${h.num(V.raskausraha_paivat)} arkipäivältä korotettuna ennen laskettua aikaa.</li>
<li><strong>Vanhempainraha</strong> ${h.num(V.paivat_yhteensa)} arkipäivää lasta kohden, ${h.num(V.paivat_vanhempi)} kummallekin vanhemmalle.</li>
<li><strong>Luovutus:</strong> omasta kiintiöstä enintään ${h.num(V.luovutettavissa)} arkipäivää toiselle vanhemmalle.</li>
<li><strong>Maksupäivät:</strong> ${h.num(V.paivia_viikossa)} arkipäivää viikossa, maanantaista lauantaihin.</li>
</ul>
<p>Laskuri ei tunne yrittäjän YEL-tuloa, jonka vuositulosta vakuutusmaksuvähennystä ei tehdä, eikä tilanteita, joissa työnantaja maksaa palkkaa vapaan ajalta. Kela tekee päätöksen tulorekisterin tiedoista. Lisää ${h.src('kela_vanhempainvapaa', 'Kelan vanhempainvapaasivulla')}. Lomarahan suuruuden voi tarkistaa ${h.a('lomaraha-laskuri', 'lomarahalaskurilla')}, ja perheen asumiskulujen tukea ${h.a('asumistuki-laskuri', 'asumistukilaskurilla')}. Palkan nettomäärää voi verrata sivulla ${h.a('nettopalkka-3000', 'nettopalkka 3 000 euron palkasta')}.</p>`,
  },
  en: {
    slug: 'parental-allowance-calculator',
    nav: 'Parental allowance calculator',
    card: 'Kela’s parental allowance per working day and per month from your annual income, including the raised first days.',
    title: 'Parental Allowance Finland 2026: Kela Calculator and Formula',
    description: `Parental allowance Finland 2026: calculate Kela’s vanhempainraha from your annual income. A ${EN.eur(KK)} monthly salary gives about ${EN.eur(ESIM.pv, 2)} for each working day.`,
    h1: 'Finnish parental allowance calculator 2026',
    intro: 'Enter your monthly salary and yearly holiday bonus to estimate your parental allowance per working day, per month and for your whole quota.',
    resume: `In 2026 Kela’s parental allowance (vanhempainraha) is ${EN.p(P1, 0)} of your annual income divided by ${V.jakaja}, when that income, after a deduction for insurance contributions, is between ${EN.eur(R1)} and ${EN.eur(R2)}: on a ${EN.eur(KK)} monthly salary with a ${EN.eur(LR)} holiday bonus you get about ${EN.eur(ESIM.pv, 2)} per working day, roughly ${EN.eur(ESIM.kk)} a month. Kela first takes ${EN.p(V.vakuutusmaksuvahennys_prosentti)} off your wages. Income above ${EN.eur(R2)} is replaced at ${EN.p(P2, 0)} and above ${EN.eur(R3)} at ${EN.p(P3, 0)}, so high earners see a much lower replacement rate. The minimum is ${EN.eur(V.vahimmais_pv, 2)} a day. The first ${V.korotetut_paivat_vanhempainraha} working days of parental allowance are paid at a raised rate of up to ${EN.p(V.korotettu_prosentti, 0)} of income, and so is the pregnancy allowance (raskausraha) for ${V.raskausraha_paivat} working days. The allowance is paid for ${V.paivia_viikossa} working days a week; each child brings ${V.paivat_yhteensa} days, ${V.paivat_vanhempi} for each parent, of which ${V.luovutettavissa} can be transferred to the other. The calculator also totals your own quota: about ${EN.eur(kiintio(ESIM))} before tax in this example.`,
    faqs: [
      { q: 'How much parental allowance will I get in Finland on €3,000 a month?', a: `With a ${EN.eur(LR)} holiday bonus your annual income is ${EN.eur(KK * 12 + LR)}, or ${EN.eur(ESIM.vuositulo)} after the insurance deduction. The allowance is ${EN.p(P1, 0)} × ${EN.eur(ESIM.vuositulo)} / ${V.jakaja} = ${EN.eur(ESIM.pv, 2)} per working day, and ${EN.eur(ESIM.korotettuPv, 2)} for the first ${V.korotetut_paivat_vanhempainraha} days. That is about ${EN.eur(ESIM.kk)} a month before tax, counting roughly 25 working days a month.` },
      { q: 'What is the minimum Kela parental allowance in 2026?', a: `${EN.eur(V.vahimmais_pv, 2)} per working day. You get it if your annual income after the insurance deduction is at most ${EN.eur(R1)}, or if you have no income at all, for example as a student. In gross salary terms the limit is about ${EN.eur(B1)} a year. The raised allowance has the same minimum when annual income is at most ${EN.eur(V.korotettu_raja_ala)}.` },
      { q: 'Why is my first parental allowance payment higher?', a: `The first ${V.korotetut_paivat_vanhempainraha} working days of parental allowance are paid at a raised rate of up to ${EN.p(V.korotettu_prosentti, 0)} of annual income divided by ${V.jakaja}. Pregnancy allowance uses the same raised rate for ${V.raskausraha_paivat} working days. On a ${EN.eur(KK)} salary the raised rate is ${EN.eur(ESIM.korotettuPv, 2)} a day against ${EN.eur(ESIM.pv, 2)} afterwards, so the first payment can be noticeably larger.` },
      { q: 'How many parental leave days does each parent get in Finland?', a: `Each child gives ${V.paivat_yhteensa} working days of parental allowance, with ${V.paivat_vanhempi} days in each parent’s own quota. You can transfer up to ${V.luovutettavissa} working days of your quota to the other parent. Working days run Monday to Saturday, so ${V.paivat_vanhempi} days is about ${EN.num(V.paivat_vanhempi / V.paivia_viikossa, 0)} weeks. The ${V.raskausraha_paivat} days of pregnancy allowance come on top.` },
      { q: 'Is the Finnish parental allowance taxed?', a: `Yes, it is taxable income and Kela withholds tax according to your tax card. No pension or unemployment insurance contribution is taken from a benefit, but the health care contribution is ${EN.p(P.vero.sairaanhoitomaksu_muu_tulo_prosentti)}. If you received ${EN.eur(ESIM.kk)} a month for a full year, your rate in Helsinki would be about ${EN.num(VERO.veroprosentti, 1)}%. Your real tax depends on your salary in the same year.` },
    ],
    body: (h) => `
<h2>Parental allowance by annual income</h2>
<p>The table shows the allowance by gross annual income, meaning salary plus holiday bonus before tax; the calculator applies the ${h.num(V.vakuutusmaksuvahennys_prosentti, 2)}% insurance deduction itself. A month is estimated at 25 working days. Your own quota is ${h.num(V.paivat_vanhempi)} days, ${h.num(V.korotetut_paivat_vanhempainraha)} of them at the raised rate.</p>
${h.table(['Annual income (gross)', 'Raised/day', 'Allowance/day', 'Month', 'Own quota total'], RIVIT.map((x) => [h.eur(x.y), h.eur(x.r.korotettuPv, 2), h.eur(x.r.pv, 2), h.eur(x.r.kk), h.eur(kiintio(x.r))]), 'Kela parental allowance 2026, before tax', ['l', 'r', 'r', 'r', 'r'])}
<p>The replacement rate falls as income rises. On ${h.eur(RIVIT[1].y)} a year the allowance replaces about ${h.num(RIVIT[1].r.kk * 12 / RIVIT[1].y * 100)}% of pay; on ${h.eur(RIVIT[6].y)}, only ${h.num(RIVIT[6].r.kk * 12 / RIVIT[6].y * 100)}%. In gross terms the bends sit at about ${h.eur(B2)} and ${h.eur(B3)} a year.</p>
<h2>Kela’s 2026 formula</h2>
${h.table(['Annual income after deduction', 'Allowance per working day'], [
  [`up to ${h.eur(R1)}`, h.eur(V.vahimmais_pv, 2)],
  [`${h.eur(R1)}–${h.eur(R2)}`, `${h.num(P1 / 100, 1)} × income / ${V.jakaja}`],
  [`${h.eur(R2)}–${h.eur(R3)}`, `${h.num(P1 / 100 * R2 / V.jakaja, 2)} + ${h.num(P2 / 100, 1)} × (income − ${h.eur(R2)}) / ${V.jakaja}`],
  [`over ${h.eur(R3)}`, `${h.num(P1 / 100 * R2 / V.jakaja + P2 / 100 * (R3 - R2) / V.jakaja, 2)} + ${h.num(P3 / 100, 2)} × (income − ${h.eur(R3)}) / ${V.jakaja}`],
], 'Parental allowance from annual income, Kela 2026', ['l', 'l'])}
<p>Kela looks at the previous 12 calendar months, leaving one calendar month between that period and the start of the allowance. Holiday bonus counts as income. In Kela’s own annual income example, ${h.eur(V.esimerkki_vuositulo.brutto)} gives about ${h.eur(V.esimerkki_vuositulo.pv_noin)} per working day; the calculator gives ${h.eur(KELA.pv, 2)}. The formula and limits are on ${h.src('kela_vuositulot', 'Kela’s annual income and formulas page')}.</p>
<h2>Days and how to share them</h2>
<ul>
<li><strong>Pregnancy allowance</strong> for ${h.num(V.raskausraha_paivat)} working days at the raised rate before the due date.</li>
<li><strong>Parental allowance</strong> for ${h.num(V.paivat_yhteensa)} working days per child, ${h.num(V.paivat_vanhempi)} per parent.</li>
<li><strong>Transfer:</strong> up to ${h.num(V.luovutettavissa)} working days of your quota to the other parent.</li>
<li><strong>Paid days:</strong> ${h.num(V.paivia_viikossa)} working days a week, Monday to Saturday.</li>
</ul>
<p>The calculator ignores self-employed YEL income, on which no insurance deduction is made, and periods when your employer pays salary during leave. Kela decides from Incomes Register data; more on ${h.src('kela_vanhempainvapaa', 'Kela’s parental leave page')}. You can check your holiday bonus with the ${h.a('lomaraha-laskuri', 'holiday bonus calculator')} and family housing support with the ${h.a('asumistuki-laskuri', 'housing allowance calculator')}. For take-home pay on a salary, see ${h.a('nettopalkka-3000', 'net pay from €3,000')}.</p>`,
  },
});
