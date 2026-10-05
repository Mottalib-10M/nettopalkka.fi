import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { asumistuki, tuloraja, kuntaryhma } from '../../lib/engine/asumistuki';

const A = P.asumistuki, O = A.perusomavastuu, M = A.enimmaisasumismenot, VA = A.varallisuus;
const [JAAKKO, EINO] = A.esimerkit;
const tulos = (e: (typeof A.esimerkit)[number]) => asumistuki({ kunta: e.kunta, aikuiset: e.aikuiset, lapset: e.lapset, tulot: e.tulot, vuokra: e.menot });
const J = tulos(JAAKKO), EE = tulos(EINO);
/** Esimerkkikunnat: yksi kustakin kuntaryhmästä. */
const KUNNAT_A = [
  { nimi: 'Helsinki', fi: 'I (Helsinki)', en: 'I (Helsinki)' },
  { nimi: 'Tampere', fi: 'II (Tampere)', en: 'II (Tampere)' },
  { nimi: 'Kajaani', fi: 'III (esim. Kajaani)', en: 'III (e.g. Kajaani)' },
];
const VUOKRA = 700;
const TULOT = [0, 800, 1000, 1200, 1400];
const TUKI = TULOT.map((t) => ({ t, r: KUNNAT_A.map((k) => asumistuki({ kunta: k.nimi, aikuiset: 1, lapset: 0, tulot: t, vuokra: VUOKRA }).tuki) }));
const T1000 = TUKI[2].r;
const RUOKAKUNNAT = [
  { a: 1, l: 0, fi: '1 aikuinen', en: '1 adult' },
  { a: 2, l: 0, fi: '2 aikuista', en: '2 adults' },
  { a: 1, l: 1, fi: '1 aikuinen ja 1 lapsi', en: '1 adult, 1 child' },
  { a: 2, l: 2, fi: '2 aikuista ja 2 lasta', en: '2 adults, 2 children' },
];
const RAJAT = RUOKAKUNNAT.map((r) => ({ ...r, v: KUNNAT_A.map((k) => tuloraja(k.nimi, r.a, r.l)) }));
const PERUS1 = O.perus + O.aikuinen;
const L = A.lammitys;

export default definePage({
  id: 'asumistuki-laskuri',
  group: 'laskurit',
  order: 70,
  tool: 'asumistuki',
  related: ['asumistuki-enimmaismenot', 'asumistuki-tulot', 'yleistuki', 'kuntavertailu'],
  sources: ['kela_yleinen_asumistuki', 'kela_asumistuki_laskenta', 'finlex_asumistuki'],
  fi: {
    slug: 'asumistuki-laskuri',
    nav: 'Asumistukilaskuri',
    card: 'Kelan yleinen asumistuki kuukaudessa kunnan, vuokran, ruokakunnan ja bruttotulojen mukaan.',
    title: 'Asumistukilaskuri 2026: yleinen asumistuki ja tulorajat',
    description: `Asumistukilaskuri 2026: laske Kelan yleinen asumistuki vuokrasta, tuloista ja kunnasta. Yksin asuvan tuloraja Helsingissä noin ${FI.eur(RAJAT[0].v[0])} kuussa bruttona.`,
    h1: 'Asumistukilaskuri: yleinen asumistuki 2026',
    intro: 'Valitse kunta, syötä vuokra, ruokakunnan koko ja bruttotulot, niin laskuri arvioi Kelan maksaman asumistuen.',
    resume: `Yleinen asumistuki on vuonna 2026 ${FI.p(A.tukiprosentti, 0)} siitä, kuinka paljon hyväksytyt asumismenot ylittävät tuloista lasketun perusomavastuun: Kelan omassa esimerkissä turkulainen ${JAAKKO.nimi}, jonka bruttotulot ovat ${FI.eur(JAAKKO.tulot)} ja vuokra ${FI.eur(JAAKKO.menot)} kuukaudessa, saa tukea ${FI.eur(J.tuki, 2)}. Vuokrasta hyväksytään vain kuntaryhmän enimmäismäärä, Turussa yhdelle hengelle ${FI.eur(J.enimmais)}, joten kallis vuokra ei kasvata tukea rajan yli. Perusomavastuu on ${FI.num(O.kerroin, 1)} × [tulot − (${FI.num(O.perus)} + ${FI.num(O.aikuinen)} × aikuiset + ${FI.num(O.lapsi)} × lapset)], ja tulot lasketaan aina bruttona. Kuntaryhmiä on kolme: ryhmään I kuuluvat Helsinki, Espoo, Kauniainen ja Vantaa, ryhmään II ${A.kuntaryhma_II.length} muuta kaupunkia ja ryhmään III muut kunnat. Ahvenanmaalla tuki on ${FI.p(A.ahvenanmaa_tukiprosentti, 0)} ja omavastuu lasketaan omalla kaavallaan. Alle ${FI.eur(A.pienin_maksettava)} tukea ei makseta. Asumistuki on verotonta, mutta sitä ei saa omistusasuntoon, ja opiskelijat saavat asumislisän opintotuen kautta. Laskuri tekee saman laskelman ja näyttää ruokakuntasi tulorajan.`,
    faqs: [
      { q: 'Paljonko asumistukea saa 1 000 euron bruttotuloilla?', a: `Yksin asuva, jonka vuokra on ${FI.eur(VUOKRA)} kuukaudessa ja vesi maksetaan vuokrassa, saa laskurin mukaan Helsingissä ${FI.eur(T1000[0], 2)}, Tampereella ${FI.eur(T1000[1], 2)} ja kuntaryhmän III kunnassa ${FI.eur(T1000[2], 2)} kuukaudessa. Ero johtuu enimmäisasumismenoista, jotka ovat yhdelle hengelle ${FI.eur(M.I[0])}, ${FI.eur(M.II[0])} ja ${FI.eur(M.III[0])}. Tulot tarkoittavat bruttotuloja ennen veroja.` },
      { q: 'Mikä on yleisen asumistuen tuloraja yksin asuvalle?', a: `Laskurin mukaan noin ${FI.eur(RAJAT[0].v[0])} kuukaudessa kuntaryhmässä I, ${FI.eur(RAJAT[0].v[1])} ryhmässä II ja ${FI.eur(RAJAT[0].v[2])} ryhmässä III, bruttona. Raja on tulo, jolla tuki putoaa alle ${FI.eur(A.pienin_maksettava)} minimin, kun asumismenot ovat enimmäismäärän suuruiset. Jos vuokrasi on enimmäismäärää pienempi, raja tulee vastaan aiemmin.` },
      { q: 'Saako opiskelija yleistä asumistukea vuokra-asuntoon?', a: `Yleensä ei. Opiskelijan asumista tuetaan opintotuen asumislisällä, ja laki rajaa asumislisään oikeutetut yleisen asumistuen ulkopuolelle. Poikkeuksia on: tuen voi saada esimerkiksi, jos asut lapsesi kanssa, opiskelet muun tuen kuin opintotuen turvin tai opintotukikuukautesi ovat loppuneet. Suomeen opiskelemaan tulleet eivät voi kuulua ruokakuntaan eivätkä saada asumistukea.` },
      { q: 'Pienentävätkö säästöt yleistä asumistukea?', a: `Pienentävät, jos niitä on paljon. Kun omaisuus velkojen jälkeen ylittää ${FI.eur(VA.raja_yksi)} yhden aikuisen tai ${FI.eur(VA.raja_useampi)} useamman aikuisen ruokakunnassa, ${FI.p(VA.osuus, 0)} ylittävästä osasta lisätään vuositulona tuloihin. Talletuksista vähennetään ensin ${FI.eur(VA.kayttovara_henkilo)} käyttövaroja henkilöä kohden. Jos omaisuutta on vähintään ${FI.eur(VA.este)}, tukeen ei ole oikeutta lainkaan.` },
      { q: 'Voiko yleistä asumistukea saada omistusasuntoon?', a: `Ei voi. Kelan mukaan tukea saa vain vuokra-asuntoon, asumisoikeusasuntoon tai osaomistusasuntoon. Asumisoikeusasunnossa menona hyväksytään käyttövastike, mutta lainan korkoja ei hyväksytä missään näistä. Erikseen maksettavista menoista hyväksytään vesi ${FI.eur(A.vesimaksu_henkilo)} henkilöä kohden kuukaudessa ja lämmitys alueen normin mukaan, mutta sähkö, autopaikka, sauna ja netti jäävät ulkopuolelle.` },
    ],
    body: (h) => `
<h2>Kelan esimerkit laskurilla</h2>
<p>Laskuri toistaa Kelan omat esimerkit sentilleen. Ensimmäisessä esimerkissä (${JAAKKO.nimi}) vuokra ylittää kuntaryhmän enimmäismäärän, joten menoina hyväksytään vain ${h.eur(J.enimmais)}. Hänen perusomavastuunsa on ${h.num(O.kerroin, 1)} × (${h.eur(JAAKKO.tulot)} − ${h.eur(PERUS1)}) = ${h.eur(J.perusomavastuu, 2)}, ja tuki ${h.num(A.tukiprosentti / 100, 1)} × (${h.eur(J.hyvaksytyt)} − ${h.eur(J.perusomavastuu, 2)}) = ${h.eur(J.tuki, 2)}. ${EINO.nimi} asuvat kahdestaan, joten heidän enimmäismääränsä on ${h.eur(EE.enimmais)} ja tuki ${h.eur(EE.tuki, 2)}.</p>
${h.table(['Esimerkki', 'Tulot/kk', 'Menot/kk', 'Hyväksytty', 'Omavastuu', 'Tuki'], [JAAKKO, EINO].map((e, i) => { const r = i ? EE : J; return [`${e.nimi}, ${e.kunta}`, h.eur(e.tulot), h.eur(e.menot), h.eur(r.hyvaksytyt), h.eur(r.perusomavastuu, 2), h.eur(r.tuki, 2)]; }), 'Kelan esimerkit, laskettu laskurin moottorilla, vuosi 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>Tuki tulojen ja kuntaryhmän mukaan</h2>
<p>Alla yksin asuva, jonka vuokra on ${h.eur(VUOKRA)} kuukaudessa vesi mukaan lukien. Jokainen lisäeuro bruttotuloja nostaa omavastuuta ${h.num(O.kerroin * 100)} senttiä ja pienentää tukea ${h.num(O.kerroin * A.tukiprosentti)} senttiä.</p>
${h.table(['Bruttotulot/kk', ...KUNNAT_A.map((k) => k.fi)], TUKI.map((x) => [h.eur(x.t), ...x.r.map((v) => h.eur(v, 2))]), `Yksin asuva, vuokra ${h.eur(VUOKRA)}/kk`, ['l', 'r', 'r', 'r'])}
<p>Kuntaryhmän näet laskurin kuntakentän alta. Ryhmään II kuuluvat ${A.kuntaryhma_II.join(', ')}. Enimmäismäärät koko taulukkona ovat sivulla ${h.a('asumistuki-enimmaismenot', 'asumistuen enimmäisasumismenot')}.</p>
<h2>Tulorajat eri ruokakunnille</h2>
<p>Laskurin tulorajat ovat samat kuin Kelan julkaisemat tulorajat. Ne pätevät, kun asumismenot ovat vähintään kuntaryhmän enimmäismäärän suuruiset.</p>
${h.table(['Ruokakunta', ...KUNNAT_A.map((k) => k.fi)], RAJAT.map((r) => [r.fi, ...r.v.map((v) => h.eur(v))]), 'Suurin bruttotulo/kk, jolla tukea vielä maksetaan, kun menot ovat enimmäismäärän suuruiset', ['l', 'r', 'r', 'r'])}
<p>Tulot otetaan huomioon bruttona: palkat, lomarahat, ylityökorvaukset, ansiopäiväraha ja yleistuki sekä pääomatulot. Korot ja osingot lasketaan, jos ne ylittävät ${h.eur(A.korot_osingot_huomiotta_kk, 2)} kuukaudessa henkilöä kohden. Lapsilisä, toimeentulotuki, elatustuki ja opintolaina eivät vaikuta. Tulojen vaikutus on selitetty tarkemmin sivulla ${h.a('asumistuki-tulot', 'asumistuki ja tulot')}.</p>
<h2>Mitä asumismenoiksi hyväksytään</h2>
<ul>
<li>Vuokra tai asumisoikeusasunnon käyttövastike ilman sähkön osuutta.</li>
<li>Erikseen maksettava vesi ${h.eur(A.vesimaksu_henkilo)} henkilöä kohden kuukaudessa.</li>
<li>Erikseen maksettava lämmitys: ${h.eur(L.perus[0])} yhdeltä hengeltä ja ${h.eur(L.perus[1])} jokaiselta seuraavalta; ${A.lammitys_alueet.itainen} ${h.eur(L.itainen[0])} + ${h.eur(L.itainen[1])}; ${A.lammitys_alueet.pohjoinen} ${h.eur(L.pohjoinen[0])} + ${h.eur(L.pohjoinen[1])}.</li>
<li>Ei hyväksytä: sähkö, sauna, pesutupa, autopaikka, internet ja kalustemaksut.</li>
</ul>
<h2>Hakeminen ja muutokset</h2>
<p>Kela päättää tuesta hakemuksen perusteella, ja tukea voi saada takautuvasti enintään ${h.num(A.takautuvasti_kk)} kuukaudelta. Ilmoita Kelalle, jos ruokakunnan tulot nousevat vähintään ${h.eur(A.muutosilmoitus.nousu)} tai laskevat ${h.eur(A.muutosilmoitus.lasku)} kuukaudessa. Työttömän tulona otetaan huomioon esimerkiksi ${h.a('yleistuki', 'yleistuki')}. Säännöt ovat ${h.src('kela_asumistuki_laskenta', 'Kelan laskentasivulla')}, ${h.src('kela_yleinen_asumistuki', 'Kelan asumistukisivulla')} ja ${h.src('finlex_asumistuki', 'laissa yleisestä asumistuesta')}.</p>`,
  },
  en: {
    slug: 'housing-allowance-calculator',
    nav: 'Housing allowance calculator',
    card: 'Kela’s general housing allowance per month by municipality, rent, household size and gross income.',
    title: 'Housing Allowance Calculator Finland 2026: Kela Asumistuki',
    description: `Housing allowance calculator Finland 2026: estimate Kela’s general housing allowance from rent, income and town. Single in Helsinki: up to ${EN.eur(RAJAT[0].v[0])} gross.`,
    h1: 'Finnish housing allowance calculator 2026',
    intro: 'Choose your municipality, enter rent, household size and gross income, and the calculator estimates Kela’s housing allowance.',
    resume: `Kela’s general housing allowance (yleinen asumistuki) in 2026 pays ${EN.p(A.tukiprosentti, 0)} of the amount by which your accepted housing costs exceed a basic deductible (perusomavastuu) worked out from your income: in Kela’s own example, ${JAAKKO.nimi} in Turku, with ${EN.eur(JAAKKO.tulot)} of gross income and ${EN.eur(JAAKKO.menot)} rent a month, gets ${EN.eur(J.tuki, 2)}. Only rent up to your municipality group’s maximum counts, ${EN.eur(J.enimmais)} for one person in Turku, so a pricier flat does not raise the allowance past that cap. The deductible is ${EN.num(O.kerroin, 1)} × [income − (${EN.num(O.perus)} + ${EN.num(O.aikuinen)} × adults + ${EN.num(O.lapsi)} × children)], always on gross income. There are three municipality groups: Helsinki, Espoo, Kauniainen and Vantaa in group I, ${A.kuntaryhma_II.length} other cities in group II and the rest in group III. In Åland the rate is ${EN.p(A.ahvenanmaa_tukiprosentti, 0)}. Amounts under ${EN.eur(A.pienin_maksettava)} are not paid. The allowance is tax-free, but owner-occupied homes are excluded, and students are normally covered by the housing supplement of student aid instead.`,
    faqs: [
      { q: 'How much housing allowance do I get in Finland on €1,000 a month?', a: `A single person paying ${EN.eur(VUOKRA)} rent with water included gets, per the calculator, ${EN.eur(T1000[0], 2)} in Helsinki, ${EN.eur(T1000[1], 2)} in Tampere and ${EN.eur(T1000[2], 2)} in a group III municipality each month. The gap comes from the maximum accepted costs for one person: ${EN.eur(M.I[0])}, ${EN.eur(M.II[0])} and ${EN.eur(M.III[0])}. Income means gross income before tax.` },
      { q: 'What is the housing allowance income limit for a single person?', a: `About ${EN.eur(RAJAT[0].v[0])} a month gross in group I, ${EN.eur(RAJAT[0].v[1])} in group II and ${EN.eur(RAJAT[0].v[2])} in group III, according to the calculator. That is the income at which the allowance falls below the ${EN.eur(A.pienin_maksettava)} minimum when housing costs are at the cap. If your rent is below the cap, you hit the limit sooner.` },
      { q: 'Can international students get Kela’s general housing allowance?', a: `No. Kela states that students who came to Finland to study cannot belong to a household for the allowance or receive it. Finnish students are normally covered by the housing supplement of student aid instead, with exceptions such as living with your child or having used up your student aid months. Students in Finland on a residence permit for studies should budget without it.` },
      { q: 'Do my savings reduce the housing allowance?', a: `Only if they are substantial. When net assets exceed ${EN.eur(VA.raja_yksi)} for a one-adult household or ${EN.eur(VA.raja_useampi)} with more adults, ${EN.p(VA.osuus, 0)} of the excess is added to your annual income. ${EN.eur(VA.kayttovara_henkilo)} per person of bank deposits is deducted first as everyday money. With ${EN.eur(VA.este)} or more in assets, you are not entitled at all.` },
      { q: 'Which costs besides rent count towards the allowance?', a: `Water paid separately counts as ${EN.eur(A.vesimaksu_henkilo)} per person per month, and separate heating at a fixed regional amount, starting at ${EN.eur(L.perus[0])} for one person. Electricity, sauna, laundry room, parking, internet and furniture fees do not count. If electricity is included in your rent, Kela removes its share. Loan interest on a right-of-occupancy or part-ownership home is never accepted.` },
    ],
    body: (h) => `
<h2>Kela’s examples run through the calculator</h2>
<p>The calculator reproduces Kela’s published cases. ${JAAKKO.nimi}’s rent exceeds his group’s cap, so only ${h.eur(J.enimmais)} is accepted. His deductible is ${h.num(O.kerroin, 1)} × (${h.eur(JAAKKO.tulot)} − ${h.eur(PERUS1)}) = ${h.eur(J.perusomavastuu, 2)}, and the allowance ${h.num(A.tukiprosentti / 100, 1)} × (${h.eur(J.hyvaksytyt)} − ${h.eur(J.perusomavastuu, 2)}) = ${h.eur(J.tuki, 2)}. ${EINO.nimi} are a couple, so their cap is ${h.eur(EE.enimmais)} and their allowance ${h.eur(EE.tuki, 2)}.</p>
${h.table(['Example', 'Income', 'Costs', 'Accepted', 'Deductible', 'Allowance'], [JAAKKO, EINO].map((e, i) => { const r = i ? EE : J; return [`${e.nimi}, ${e.kunta}`, h.eur(e.tulot), h.eur(e.menot), h.eur(r.hyvaksytyt), h.eur(r.perusomavastuu, 2), h.eur(r.tuki, 2)]; }), 'Kela’s examples computed by this calculator’s engine, 2026, per month', ['l', 'r', 'r', 'r', 'r', 'r'])}
<h2>Allowance by income and municipality group</h2>
<p>Below is a single person paying ${h.eur(VUOKRA)} a month, water included. Each extra euro of gross income adds ${h.num(O.kerroin * 100)} cents to the deductible and takes ${h.num(O.kerroin * A.tukiprosentti)} cents off the allowance.</p>
${h.table(['Gross income/month', ...KUNNAT_A.map((k) => k.en)], TUKI.map((x) => [h.eur(x.t), ...x.r.map((v) => h.eur(v, 2))]), `Single person, rent ${h.eur(VUOKRA)}/month`, ['l', 'r', 'r', 'r'])}
<p>The calculator shows your group under the municipality field. Group II covers ${A.kuntaryhma_II.join(', ')}. All the caps by household size are on the ${h.a('asumistuki-enimmaismenot', 'maximum housing costs')} page.</p>
<h2>Income limits by household</h2>
<p>These limits match the ones Kela publishes. They apply when your housing costs are at or above the cap for your group.</p>
${h.table(['Household', ...KUNNAT_A.map((k) => k.en)], RAJAT.map((r) => [r.en, ...r.v.map((v) => h.eur(v))]), 'Highest gross income per month that still gives an allowance, with costs at the cap', ['l', 'r', 'r', 'r'])}
<p>Income is counted gross: wages, holiday bonuses, overtime, earnings-related unemployment allowance, the general support (${h.a('yleistuki', 'yleistuki')}) and capital income. Interest and dividends count above ${h.eur(A.korot_osingot_huomiotta_kk, 2)} a month per person. Child benefit, social assistance, child maintenance support and student loans do not. More on the ${h.a('asumistuki-tulot', 'income limits')} page.</p>
<h2>Applying and reporting changes</h2>
<p>Kela decides on application, and you can get the allowance backdated by at most ${h.num(A.takautuvasti_kk)} month. Tell Kela if your household income rises by ${h.eur(A.muutosilmoitus.nousu)} or falls by ${h.eur(A.muutosilmoitus.lasku)} a month or more. The rules are on ${h.src('kela_asumistuki_laskenta', 'Kela’s calculation page')}, ${h.src('kela_yleinen_asumistuki', 'Kela’s housing allowance page')} and in the ${h.src('finlex_asumistuki', 'General Housing Allowance Act')}.</p>`,
  },
});
