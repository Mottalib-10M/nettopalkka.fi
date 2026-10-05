import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kunta, KUNNAT } from '../../lib/engine/params';
import { laskeVerot } from '../../lib/engine/vero';
import { asumistuki, tuloraja } from '../../lib/engine/asumistuki';
import { netto, AHVENANMAAN_KUNTIA } from '../../lib/esimerkit';

const V = P.vero;
const ALENNUS = V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa;
const PV = V.ahvenanmaa_perusvahennys, PVM = V.perusvahennys;
const MEDIA = V.ahvenanmaa_mediamaksu;
const AH = KUNNAT.filter((k) => k.ahvenanmaa);
const AH_MIN = AH.reduce((a, b) => (b.kunta < a.kunta ? b : a));
const AH_MAX = AH.reduce((a, b) => (b.kunta > a.kunta ? b : a));
const MH = kunta('Maarianhamina');

const KK = [2500, 3500, 5000];
const VERTAA = ['Maarianhamina', 'Jomala', 'Lemland', 'Finström', AH_MAX.nimi, 'Helsinki'];
const M35 = netto(3500, 'Maarianhamina');
const H35 = netto(3500, 'Helsinki');
const ETU35 = (M35.kkNettoTodellinen - H35.kkNettoTodellinen) * 12;
const VOITTAA = AH.filter((k) => netto(3500, k.nimi).kkNettoTodellinen > H35.kkNettoTodellinen).length;

const VUOSI = 42000;
const m = laskeVerot({ tulo: VUOSI, kunta: 'Maarianhamina' });
const h_ = laskeVerot({ tulo: VUOSI, kunta: 'Helsinki' });

const A = P.asumistuki;
const AO = A.ahvenanmaa_perusomavastuu;
const AE = A.enimmaisasumismenot.Ahvenanmaa;
const YKSIN = { aikuiset: 1, lapset: 0, tulot: 1300, vuokra: 650 };
const AT_MH = asumistuki({ kunta: 'Maarianhamina', ...YKSIN });
const AT_HKI = asumistuki({ kunta: 'Helsinki', ...YKSIN });
const TR_MH = tuloraja('Maarianhamina', 1, 0);

const asteikko = V.valtion_asteikko.map((r, i, a) => ({ ala: r.alaraja, yla: i + 1 < a.length ? a[i + 1].alaraja : null, manner: r.prosentti, ah: Math.max(0, r.prosentti - ALENNUS) }));

export default definePage({
  id: 'ahvenanmaa',
  group: 'kunnat',
  order: 100,
  tool: 'netto',
  toolPreset: { kunta: 'Maarianhamina' },
  related: ['valtion-tuloveroasteikko', 'yle-vero', 'kuntavertailu', 'helsinki'],
  sources: ['vero_ennakonpidatys', 'vero_kunnat'],
  fi: {
    slug: 'ahvenanmaan-verotus',
    nav: 'Ahvenanmaa',
    card: 'Ahvenanmaan oma verotus: alennettu valtion asteikko, 17–20 %:n kunnallisvero, mediamaksu ja asumistuki 80 %.',
    title: 'Ahvenanmaan verotus 2026: valtion vero, kunnat ja mediamaksu',
    description: 'Ahvenanmaan verotus 2026: valtion asteikko 12,64 yksikköä kevyempi, kunnallisvero 17,00–19,70 %, mediamaksu 128 € Yle-veron tilalla. Laske nettopalkka.',
    h1: 'Ahvenanmaan verotus ja nettopalkka',
    intro: 'Laskuri on asetettu Maarianhaminaan, ja se käyttää Ahvenanmaan omia vähennyksiä ja asteikkoa.',
    resume: `Maarianhaminassa ${FI.eur(3500)} kuukausipalkasta jää vuonna 2026 käteen noin ${FI.eur(M35.kkNettoTodellinen)} kuukaudessa ilman kirkollisveroa ja lomarahaa, eli noin ${FI.eur(ETU35)} vuodessa enemmän kuin Helsingissä, vaikka Maarianhaminan kunnallisvero on ${FI.p(MH.kunta)} ja Helsingin vain ${FI.p(kunta('Helsinki').kunta)}. Selitys on valtion tuloverossa: kun kotikunta on Ahvenanmaalla, valtion ansiotuloveroasteikon jokaista prosenttia alennetaan ${FI.num(ALENNUS, 2)} prosenttiyksiköllä, jolloin alimman portaan prosentti putoaa nollaan. Maakunnan ${AHVENANMAAN_KUNTIA} kunnan tuloveroprosentit vaihtelevat välillä ${FI.p(AH_MIN.kunta)} (Maarianhamina) ja ${FI.p(AH_MAX.kunta)} (${AH_MAX.nimi}). Kunnallisverotuksen perusvähennys on Ahvenanmaalla ${FI.eur(PV.enimmaismaara)}, ja se pienenee ${FI.num(PV.pienenemisprosentti, 1)} prosentilla ylimenevästä tulosta, kun mantereella luvut ovat ${FI.eur(PVM.enimmaismaara)} ja ${FI.num(PVM.pienenemisprosentti)} %. Yle-veroa ahvenanmaalainen ei maksa, vaan ${FI.eur(MEDIA.maara)} suuruisen mediamaksun, kun tulot ylittävät ${FI.eur(MEDIA.tuloraja)}. Yleinen asumistuki on Ahvenanmaalla ${FI.num(A.ahvenanmaa_tukiprosentti)} % hyväksyttävistä menoista, ei ${FI.num(A.tukiprosentti)} % kuten muualla.`,
    faqs: [
      { q: 'Miksi Ahvenanmaalla jää käteen enemmän kuin Helsingissä?', a: `Koska valtion tuloveroasteikon prosentit ovat Ahvenanmaalla ${FI.num(ALENNUS, 2)} prosenttiyksikköä pienemmät. ${FI.eur(VUOSI)} vuosipalkalla maarianhaminalaisen valtionvero on ${FI.eur(m.valtionvero)}, helsinkiläisen ${FI.eur(h_.valtionvero)}. Kunnallisvero on Maarianhaminassa suurempi, ${FI.eur(m.kunnallisvero)} vastaan ${FI.eur(h_.kunnallisvero)}, mutta verot ovat yhteensä ${FI.eur(m.verot)} ja Helsingissä ${FI.eur(h_.verot)}.` },
      { q: 'Mikä on Ahvenanmaan mediamaksu?', a: `Ahvenanmaalla asuva ei maksa Yle-veroa. Sen tilalla on Ahvenanmaan mediamaksu, ${FI.eur(MEDIA.maara)} vuodessa, jos puhtaan ansio- ja pääomatulon yhteismäärä ylittää ${FI.eur(MEDIA.tuloraja)}. Maksu koskee vähintään 18-vuotiaita, ja se on kiinteä, kun mantereen Yle-vero on ${FI.num(V.yle.prosentti, 1)} % tulorajan ylittävästä osasta, enintään ${FI.eur(V.yle.enimmaismaara)}.` },
      { q: 'Paljonko on Ahvenanmaan kuntien veroprosentti 2026?', a: `Ahvenanmaan ${AHVENANMAAN_KUNTIA} kunnan tuloveroprosentit ovat vuonna 2026 välillä ${FI.p(AH_MIN.kunta)} (${AH_MIN.nimi}) ja ${FI.p(AH_MAX.kunta)} (${AH_MAX.nimi}). Prosentit ovat moninkertaiset mantereen kuntiin verrattuna, mutta valtion asteikon alennus kompensoi suurimman osan erosta. Kunnallisvero lasketaan Ahvenanmaan omalla perusvähennyksellä, joka on ${FI.eur(PV.enimmaismaara)} ja pienenee hitaammin kuin mantereella.` },
      { q: 'Paljonko asumistukea Ahvenanmaalla saa?', a: `Ahvenanmaalla tuki on ${FI.num(A.ahvenanmaa_tukiprosentti)} % hyväksyttävistä asumismenoista perusomavastuun jälkeen, ja perusomavastuu lasketaan kertoimella ${FI.num(AO.kerroin, 2)}. Yhden hengen menojen katto on ${FI.eur(AE[0])}. Esimerkiksi ${FI.eur(YKSIN.tulot)} tuloilla ja ${FI.eur(YKSIN.vuokra)} vuokralla tuki on ${FI.eur(AT_MH.tuki, 2)} kuukaudessa, ja yksin asuvan tuki loppuu noin ${FI.eur(TR_MH)} tuloihin.` },
    ],
    body: (h) => `
<h2>Valtion asteikko Ahvenanmaalla</h2>
<p>Tuloverolain mukaan Ahvenanmaalla asuvan valtion ansiotulovero lasketaan asteikolla, jonka prosentit ovat ${h.num(ALENNUS, 2)} prosenttiyksikköä pienemmät kuin mantereella. Tulorajat ovat samat. Työtulovähennys vähennetään tästä pienemmästä verosta, ja pienillä ja keskituloilla valtionveroa ei jää lainkaan.</p>
${h.table(['Verotettava tulo', 'Manner-Suomi', 'Ahvenanmaa'], asteikko.map((r) => [r.yla ? `${h.eur(r.ala)}–${h.eur(r.yla)}` : `yli ${h.eur(r.ala)}`, h.pct(r.manner / 100, 2), h.pct(r.ah / 100, 2)]), 'Valtion ansiotuloveroasteikon rajaveroprosentit 2026', ['l', 'r', 'r'])}
<p>Mantereen asteikko kokonaisuudessaan on sivulla ${h.a('valtion-tuloveroasteikko', 'valtion tuloveroasteikko')}.</p>
<h2>Maarianhamina, maaseutukunnat ja Helsinki</h2>
${h.table(['Kotikunta', 'Kunta-%', `${h.eur(KK[0])}/kk`, `${h.eur(KK[1])}/kk`, `${h.eur(KK[2])}/kk`], VERTAA.map((n) => [n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Kuukausinetto Ahvenanmaan kunnissa ja Helsingissä 2026, ei kirkollisveroa', ['l', 'r', 'r', 'r', 'r'])}
<p>Maakunnan matalimman ja korkeimman prosentin välillä on ${h.num(AH_MAX.kunta - AH_MIN.kunta, 2)} prosenttiyksikköä, ja se näkyy nettopalkassa. ${h.eur(KK[1])} kuukausipalkalla maakunnan ${AHVENANMAAN_KUNTIA} kunnasta ${VOITTAA} jättää käteen enemmän kuin Helsinki; korkeimman prosentin kunnissa Helsinki on jo edellä. Mantereen kuntien prosentit ovat ${h.a('kuntavertailu', 'kuntavertailussa')}.</p>
<h2>Erot vähennyksissä ja maksuissa</h2>
<ul>
<li>Perusvähennys kunnallisverotuksessa: ${h.eur(PV.enimmaismaara)}, pienenee ${h.num(PV.pienenemisprosentti, 1)} %:lla (mantereella ${h.eur(PVM.enimmaismaara)} ja ${h.num(PVM.pienenemisprosentti)} %). Koska pieneneminen on hitaampaa, vähennystä riittää korkeammille tuloille: ${h.eur(VUOSI)} palkalla Maarianhaminassa ${h.eur(m.perusvahennys)}, Helsingissä ${h.eur(h_.perusvahennys)}.</li>
<li>Mediamaksu ${h.eur(MEDIA.maara)} Yle-veron sijaan (ks. ${h.a('yle-vero', 'Yle-vero')}).</li>
<li>Työmatkakuluilla on Ahvenanmaan kunnallisverotuksessa omat omavastuu- ja enimmäismääränsä, ja maakunnassa on oma vuokrakuluvähennys, jota ennakonpidätyksen laskennassa ei huomioida.</li>
<li>Sairausvakuutusmaksut, työeläkemaksu ja työttömyysvakuutusmaksu ovat samat kuin mantereella.</li>
</ul>
<p>Säännöt ovat ${h.src('vero_ennakonpidatys', 'Verohallinnon ennakonpidätyspäätöksessä vuodelle 2026')}, kuntien prosentit ${h.src('vero_kunnat', 'kuntien ja seurakuntien tuloveroprosenttien päätöksessä')}.</p>
<h2>Asumistuki: ${h.num(A.ahvenanmaa_tukiprosentti)} % ja oma kaava</h2>
<p>Kela maksaa Ahvenanmaalla ${h.num(A.ahvenanmaa_tukiprosentti)} % hyväksyttävien asumismenojen ja perusomavastuun erotuksesta. Perusomavastuu on ${h.num(AO.kerroin, 2)} × [tulot − (${h.eur(AO.perus)} + ${h.eur(AO.aikuinen)} × aikuiset + ${h.eur(AO.lapsi)} × lapset)]. Enimmäisasumismenot ovat ${h.eur(AE[0])}, ${h.eur(AE[1])}, ${h.eur(AE[2])} ja ${h.eur(AE[3])} yhdestä neljään henkeen. Yksin asuvalle, jonka tulot ovat ${h.eur(YKSIN.tulot)} ja vuokra ${h.eur(YKSIN.vuokra)}, tuki on Maarianhaminassa ${h.eur(AT_MH.tuki, 2)} ja Helsingissä ${h.eur(AT_HKI.tuki, 2)}.</p>`,
  },
  en: {
    slug: 'aland-tax',
    nav: 'Åland',
    card: 'Åland’s own tax rules: a reduced state scale, 17–20% municipal tax, the media fee and an 80% housing allowance.',
    title: 'Åland Tax 2026: State Tax, Municipal Rates and Media Fee',
    description: 'Åland tax for 2026: state tax scale 12.64 points lower, municipal tax 17.00–19.70%, a €128 media fee instead of Yle tax. Calculate your take-home pay in Åland.',
    h1: 'Åland tax and net salary',
    intro: 'The calculator is set to Mariehamn (Maarianhamina) and applies Åland’s own deductions and tax scale.',
    resume: `In Mariehamn (Maarianhamina), a ${EN.eur(3500)} monthly salary leaves about ${EN.eur(M35.kkNettoTodellinen)} a month after tax in 2026, excluding church tax and holiday bonus, roughly ${EN.eur(ETU35)} a year more than in Helsinki, even though Mariehamn’s municipal tax is ${EN.p(MH.kunta)} against Helsinki’s ${EN.p(kunta('Helsinki').kunta)}. The reason is state income tax. If your home municipality is in the Åland Islands (Ahvenanmaa), every rate in the state earned income scale is cut by ${EN.num(ALENNUS, 2)} percentage points, which takes the bottom bracket to zero. Municipal rates in Åland’s ${AHVENANMAAN_KUNTIA} municipalities run from ${EN.p(AH_MIN.kunta)} in Mariehamn to ${EN.p(AH_MAX.kunta)} in ${AH_MAX.nimi}. For municipal tax, Åland applies its own basic deduction (perusvähennys) of ${EN.eur(PV.enimmaismaara)}, reduced by ${EN.num(PV.pienenemisprosentti, 1)}% of income above that amount, instead of the mainland ${EN.eur(PVM.enimmaismaara)} and ${EN.num(PVM.pienenemisprosentti)}%. You pay no Yle tax; instead there is a flat ${EN.eur(MEDIA.maara)} media fee once income passes ${EN.eur(MEDIA.tuloraja)}. Kela’s general housing allowance covers ${EN.num(A.ahvenanmaa_tukiprosentti)}% of accepted costs in Åland, not ${EN.num(A.tukiprosentti)}% as on the mainland.`,
    faqs: [
      { q: 'Why is take-home pay higher in Åland than in Helsinki?', a: `Because the state income tax scale is ${EN.num(ALENNUS, 2)} points lower in Åland. On ${EN.eur(VUOSI)} a year, state tax is ${EN.eur(m.valtionvero)} in Mariehamn and ${EN.eur(h_.valtionvero)} in Helsinki. Municipal tax is higher in Mariehamn, ${EN.eur(m.kunnallisvero)} against ${EN.eur(h_.kunnallisvero)}, but total tax comes to ${EN.eur(m.verot)} versus ${EN.eur(h_.verot)} in Helsinki.` },
      { q: 'What is the Åland media fee and who pays it?', a: `Residents of Åland pay no Yle tax. Instead they pay the Åland media fee, a flat ${EN.eur(MEDIA.maara)} a year, if their combined net earned and capital income exceeds ${EN.eur(MEDIA.tuloraja)}. It applies from age 18. On the mainland, Yle tax is ${EN.num(V.yle.prosentti, 1)}% of income above its threshold, capped at ${EN.eur(V.yle.enimmaismaara)}.` },
      { q: 'What are the municipal tax rates in Åland for 2026?', a: `The ${AHVENANMAAN_KUNTIA} Åland municipalities charge between ${EN.p(AH_MIN.kunta)} (${AH_MIN.nimi === 'Maarianhamina' ? 'Mariehamn' : AH_MIN.nimi}) and ${EN.p(AH_MAX.kunta)} (${AH_MAX.nimi}) in 2026, far above any mainland municipality. Municipal tax is calculated with Åland’s own basic deduction of ${EN.eur(PV.enimmaismaara)}, which phases out more slowly than the mainland version, so more income stays deductible as pay rises.` },
      { q: 'How much housing allowance can I get in Åland?', a: `In Åland Kela pays ${EN.num(A.ahvenanmaa_tukiprosentti)}% of accepted housing costs minus the basic deductible, which uses a factor of ${EN.num(AO.kerroin, 2)} instead of ${EN.num(A.perusomavastuu.kerroin, 1)}. The cap for one person is ${EN.eur(AE[0])} a month. With ${EN.eur(YKSIN.tulot)} of income and ${EN.eur(YKSIN.vuokra)} rent, a single person gets ${EN.eur(AT_MH.tuki, 2)}, and support ends at about ${EN.eur(TR_MH)} of monthly income.` },
    ],
    body: (h) => `
<h2>The state tax scale in Åland</h2>
<p>Under the Income Tax Act, state earned income tax for an Åland resident is calculated on a scale whose rates are ${h.num(ALENNUS, 2)} points below the mainland’s. The income bands are the same. The earned income tax credit is then taken off this smaller tax, so on low and middle incomes no state tax remains at all.</p>
${h.table(['Taxable income', 'Mainland Finland', 'Åland'], asteikko.map((r) => [r.yla ? `${h.eur(r.ala)}–${h.eur(r.yla)}` : `over ${h.eur(r.ala)}`, h.pct(r.manner / 100, 2), h.pct(r.ah / 100, 2)]), 'Marginal rates of the 2026 state earned income tax scale', ['l', 'r', 'r'])}
<p>The full mainland scale is explained on the ${h.a('valtion-tuloveroasteikko', 'state income tax scale')} page.</p>
<h2>Mariehamn, the rural municipalities and Helsinki</h2>
${h.table(['Home municipality', 'Rate', `${h.eur(KK[0])}/month`, `${h.eur(KK[1])}/month`, `${h.eur(KK[2])}/month`], VERTAA.map((n) => [n === 'Maarianhamina' ? 'Mariehamn' : n, h.pct(kunta(n).kunta / 100, 2), ...KK.map((x) => h.eur(netto(x, n).kkNettoTodellinen))]), 'Monthly net pay in Åland municipalities and Helsinki, 2026, no church tax', ['l', 'r', 'r', 'r', 'r'])}
<p>The ${h.num(AH_MAX.kunta - AH_MIN.kunta, 2)}-point spread between Mariehamn and ${AH_MAX.nimi} shows up clearly in net pay. At ${h.eur(KK[1])} a month, ${VOITTAA} of the ${AHVENANMAAN_KUNTIA} Åland municipalities leave you with more than Helsinki; in the highest-rate ones, Helsinki pulls ahead. Mainland rates are in the ${h.a('kuntavertailu', 'municipal tax comparison')}.</p>
<h2>Different deductions and fees</h2>
<ul>
<li>Basic deduction in municipal tax: ${h.eur(PV.enimmaismaara)}, reduced by ${h.num(PV.pienenemisprosentti, 1)}% (mainland ${h.eur(PVM.enimmaismaara)} and ${h.num(PVM.pienenemisprosentti)}%). Because it shrinks more slowly, it still helps at higher incomes: on ${h.eur(VUOSI)} it is ${h.eur(m.perusvahennys)} in Mariehamn and ${h.eur(h_.perusvahennys)} in Helsinki.</li>
<li>A ${h.eur(MEDIA.maara)} media fee replaces the ${h.a('yle-vero', 'Yle tax')}.</li>
<li>Commuting costs have their own deductible and ceiling in Åland municipal tax, and Åland has a rent deduction that is ignored when the withholding rate is calculated.</li>
<li>Health insurance, pension and unemployment insurance contributions are the same as on the mainland.</li>
</ul>
<p>The rules are set out in ${h.src('vero_ennakonpidatys', 'Vero’s 2026 withholding decision')}, the municipal rates in ${h.src('vero_kunnat', 'its decision on municipal and parish tax rates')}.</p>
<h2>Housing allowance: ${h.num(A.ahvenanmaa_tukiprosentti)}% and its own formula</h2>
<p>In Åland, Kela pays ${h.num(A.ahvenanmaa_tukiprosentti)}% of the gap between accepted housing costs and the basic deductible. The deductible is ${h.num(AO.kerroin, 2)} × [income − (${h.eur(AO.perus)} + ${h.eur(AO.aikuinen)} × adults + ${h.eur(AO.lapsi)} × children)]. Caps are ${h.eur(AE[0])}, ${h.eur(AE[1])}, ${h.eur(AE[2])} and ${h.eur(AE[3])} for one to four people. A single person on ${h.eur(YKSIN.tulot)} paying ${h.eur(YKSIN.vuokra)} rent gets ${h.eur(AT_MH.tuki, 2)} in Mariehamn and ${h.eur(AT_HKI.tuki, 2)} in Helsinki.</p>`,
  },
});
