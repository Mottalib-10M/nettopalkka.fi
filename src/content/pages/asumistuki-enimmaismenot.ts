import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { asumistuki, enimmaisasumismenot, type Kuntaryhma } from '../../lib/engine/asumistuki';

const A = P.asumistuki;
const E = A.enimmaisasumismenot;
const RYHMAT: Kuntaryhma[] = ['I', 'II', 'III', 'Ahvenanmaa'];
const HENK = [1, 2, 3, 4, 5, 6];
const L = A.lammitys;
const lammitys = (alue: keyof typeof L, n: number) => L[alue][0] + L[alue][1] * (n - 1);
const II_LISTA = A.kuntaryhma_II.join(', ');
const I_LISTA = A.kuntaryhma_I.join(', ');
const JK = A.esimerkit[0];
const JAAKKO = asumistuki({ kunta: JK.kunta, aikuiset: JK.aikuiset, lapset: JK.lapset, tulot: JK.tulot, vuokra: JK.menot });
const VUOKRA = 800, TULO = 1300;
const HKI = asumistuki({ kunta: 'Helsinki', aikuiset: 1, lapset: 0, tulot: TULO, vuokra: VUOKRA });
const TRE = asumistuki({ kunta: 'Tampere', aikuiset: 1, lapset: 0, tulot: TULO, vuokra: VUOKRA });
const PORI = asumistuki({ kunta: 'Pori', aikuiset: 1, lapset: 0, tulot: TULO, vuokra: VUOKRA });
const OSUUS = A.tukiprosentti;
const PERHE = { aikuiset: 2, lapset: 2, tulot: 2800, vuokra: 1300 };
const VANTAA = asumistuki({ kunta: 'Vantaa', ...PERHE });
const JKL = asumistuki({ kunta: 'Jyväskylä', ...PERHE });
const KAJ = asumistuki({ kunta: 'Kajaani', ...PERHE });
/** Kahden hengen talous Oulussa: vuokra + vesi ja lämmitys erikseen, pohjoinen lämmitysnormi. */
const OULU = asumistuki({ kunta: 'Oulu', aikuiset: 2, lapset: 0, tulot: 1900, vuokra: 520, vesiErikseen: true, lammitysErikseen: true, lammitysalue: 'pohjoinen' });

export default definePage({
  id: 'asumistuki-enimmaismenot',
  group: 'tuet',
  order: 40,
  mini: 'enimmais',
  related: ['asumistuki-laskuri', 'asumistuki-tulot', 'helsinki', 'tampere'],
  sources: ['kela_asumistuki_laskenta', 'finlex_asumistuki'],
  fi: {
    slug: 'asumistuen-enimmaisasumismenot',
    nav: 'Enimmäisasumismenot',
    card: 'Kuinka suuren vuokran Kela hyväksyy asumistukeen kunnassasi ja talouden koon mukaan.',
    title: 'Asumistuen enimmäisasumismenot 2026 kuntaryhmittäin',
    description: `Asumistuen enimmäisasumismenot 2026: yksin asuvalle ${FI.eur(E.I[0])} Helsingissä, ${FI.eur(E.II[0])} II-ryhmän kaupungeissa ja ${FI.eur(E.III[0])} muualla. Vesi- ja lämmitysnormit sekä kuntalista.`,
    h1: 'Asumistuen enimmäisasumismenot',
    intro: 'Kela korvaa vuokrasta vain kunnan ja ruokakunnan koon mukaisen enimmäismäärän, loput maksat itse.',
    resume: `Yksin asuvalle Kela hyväksyy yleiseen asumistukeen vuonna 2026 enintään ${FI.eur(E.I[0])} asumismenoja kuukaudessa Helsingissä, Espoossa, Kauniaisissa ja Vantaalla, ${FI.eur(E.II[0])} II-kuntaryhmän ${A.kuntaryhma_II.length} kunnassa, kuten Tampereella, Turussa ja Oulussa, sekä ${FI.eur(E.III[0])} muissa Manner-Suomen kunnissa. Kuntaryhmiä on nykyään kolme, ja Ahvenanmaalla on oma taulukkonsa, jossa yksin asuvan raja on ${FI.eur(E.Ahvenanmaa[0])}. Neljän hengen taloudessa rajat ovat ${FI.eur(E.I[3])}, ${FI.eur(E.II[3])} ja ${FI.eur(E.III[3])}, ja jokainen lisähenkilö nostaa niitä ${FI.eur(E.I[4])}, ${FI.eur(E.II[4])} tai ${FI.eur(E.III[4])}. Tuki on ${OSUUS} % hyväksytyistä menoista perusomavastuun jälkeen, joten enimmäismäärän ylittävä vuokra jää kokonaan omaksi kuluksi. Erikseen maksettavasta vedestä hyväksytään ${FI.eur(A.vesimaksu_henkilo)} henkeä kohti, ja lämmityksestä ${FI.eur(L.perus[0])} ensimmäiseltä ja ${FI.eur(L.perus[1])} jokaiselta seuraavalta henkilöltä; Itä- ja Pohjois-Suomessa normi on korkeampi. Sähköä, autopaikkaa, saunaa ja internetiä ei hyväksytä asumismenoksi, joten ne kannattaa jättää pois, kun vertaat omaa vuokraasi kuntasi rajaan.`,
    faqs: [
      { q: 'Paljonko vuokraa Kela hyväksyy Helsingissä asumistukeen?', a: `Vuonna 2026 I-kuntaryhmän katto on yksin asuvalla ${FI.eur(E.I[0])}, kahden hengen taloudella ${FI.eur(E.I[1])}, kolmen hengen ${FI.eur(E.I[2])} ja neljän hengen ${FI.eur(E.I[3])} kuukaudessa. Sama raja koskee Espoota, Kauniaista ja Vantaata. Jos yksin asuvan vuokra on ${FI.eur(VUOKRA)}, Kela laskee tuen ${FI.eur(E.I[0])} mukaan, ja ${FI.eur(VUOKRA - E.I[0])} jää kokonaan vuokralaisen maksettavaksi.` },
      { q: 'Mihin asumistuen kuntaryhmään Tampere kuuluu?', a: `Tampere kuuluu II-kuntaryhmään yhdessä ${A.kuntaryhma_II.length - 1} muun kunnan kanssa, joihin kuuluvat muun muassa Turku, Oulu, Jyväskylä, Kuopio ja Lahti. Yksin asuvan enimmäisasumismenot ovat siellä ${FI.eur(E.II[0])} kuukaudessa. Ryhmät on lueteltu asumistukilain 10 §:ssä, ja kaikki listan ulkopuoliset Manner-Suomen kunnat kuuluvat III-ryhmään.` },
      { q: 'Voiko sähkölaskun laskea asumistuen asumismenoihin?', a: `Ei voi. Kela ei hyväksy sähkömaksua asumismenoksi, ja jos sähkö sisältyy vuokraan, sen osuus vähennetään vuokrasta ennen laskelmaa. Samoin hylätään sauna-, pesutupa-, autopaikka- ja internetmaksut sekä käyttö- ja kalustemaksut. Hyväksyttäviä ovat vuokran lisäksi vain erikseen maksettavat vesimaksut, ${FI.eur(A.vesimaksu_henkilo)} henkeä kohti, ja lämmityskulut normin mukaan.` },
      { q: 'Kannattaako muuttaa kalliimpaan asuntoon, jos saa asumistukea?', a: `Vain enimmäismäärään asti. Kela korvaa ${OSUUS} % hyväksytyistä menoista, mutta jokainen euro rajan yli on kokonaan omaa rahaa. Tampereella yksin asuvan raja on ${FI.eur(E.II[0])}: jos vuokra nousee siitä ${FI.eur(100)}, tuki ei kasva lainkaan. Rajan alapuolella ${FI.eur(100)} kalliimpi vuokra nostaa tukea ${FI.eur(OSUUS)}, ja ${FI.eur(100 - OSUUS)} jää maksettavaksi itse.` },
      { q: 'Vaikuttaako alivuokralainen asumistukeeni?', a: `Vaikuttaa. Alivuokralaisen maksama vuokra vähennetään hyväksyttävistä asumismenoistasi ennen kuin niitä verrataan enimmäismäärään. Jos maksat ${FI.eur(900)} vuokraa ja alivuokralainen maksaa sinulle ${FI.eur(350)}, Kela lähtee liikkeelle ${FI.eur(550)} menoista. Vähennys tehdään ennen enimmäismäärää, joten se pienentää tukea vain, jos jäljelle jäävät menot jäävät rajan alle.` },
      { q: 'Miksi Ahvenanmaalla on omat asumistuen enimmäismäärät?', a: `Ahvenanmaalla sovelletaan omaa taulukkoa ja omaa laskentatapaa. Yksin asuvan raja on ${FI.eur(E.Ahvenanmaa[0])} ja neljän hengen ${FI.eur(E.Ahvenanmaa[3])}. Tuki on siellä enintään ${A.ahvenanmaa_tukiprosentti} % hyväksytyistä menoista Manner-Suomen ${OSUUS} prosentin sijaan, ja perusomavastuun kertoimet ovat erilaiset, joten samoilla tuloilla ja vuokralla tuki on usein suurempi kuin III-ryhmän kunnassa.` },
      { q: 'Miksi vammaisen henkilön taloudessa raja on suurempi?', a: `Jos ruokakuntaan kuuluu vammainen henkilö, joka tarvitsee tavallista enemmän asuintilaa, Kela hyväksyy asumismenot yhtä henkilöä suuremman talouden mukaan. Kahden hengen talous Helsingissä saa silloin kolmen hengen rajan ${FI.eur(E.I[2])} tavallisen ${FI.eur(E.I[1])} sijaan, eli ${FI.eur(E.I[2] - E.I[1])} enemmän hyväksyttyjä menoja kuukaudessa.` },
    ],
    body: (h) => `
<h2>Enimmäismäärät 2026</h2>
<p>Asumistukilaki määrää, että tuki lasketaan hyväksyttävistä mutta enintään laissa säädetyn suuruisista asumismenoista. Enimmäismäärä riippuu kahdesta asiasta: kuntaryhmästä ja siitä, montako henkeä ruokakuntaan kuuluu.</p>
${h.table(['Henkilöitä', 'I-ryhmä', 'II-ryhmä', 'III-ryhmä', 'Ahvenanmaa'], HENK.map((n) => [h.num(n), ...RYHMAT.map((r) => h.eur(enimmaisasumismenot(r, n)))]), 'Enimmäisasumismenot euroa kuukaudessa, 2026 (Kela)', ['l', 'r', 'r', 'r', 'r'])}
<p>Neljää henkeä suuremmissa talouksissa jokainen lisähenkilö nostaa rajaa ryhmästä riippuen ${h.eur(E.I[4])}, ${h.eur(E.II[4])}, ${h.eur(E.III[4])} tai Ahvenanmaalla ${h.eur(E.Ahvenanmaa[4])}. Taulukon viisi- ja kuusihenkiset rivit on laskettu tällä säännöllä.</p>
<h2>Kolme kuntaryhmää</h2>
<p>Vanhoissa ohjeissa puhutaan vielä neljästä kuntaryhmästä, joissa Helsinki oli omana ryhmänään. Voimassa oleva laki tuntee kolme ryhmää. I-ryhmään kuuluvat ${I_LISTA}. II-ryhmä on lueteltu laissa nimeltä: ${II_LISTA}. III-ryhmään kuuluvat kaikki muut Manner-Suomen kunnat, esimerkiksi Pori, Vaasa, Kotka ja Mikkeli.</p>
<p>Ryhmä ratkaisee paljon. Sama ${h.eur(VUOKRA)} yksiö ja sama ${h.eur(TULO)} bruttotulo tuottavat Helsingissä ${h.eur(HKI.tuki, 2)} asumistukea, Tampereella ${h.eur(TRE.tuki, 2)} ja Porissa ${h.eur(PORI.tuki, 2)} kuukaudessa. Ero johtuu yksinomaan siitä, kuinka suuri osa vuokrasta hyväksytään: ${h.eur(HKI.hyvaksytyt)}, ${h.eur(TRE.hyvaksytyt)} ja ${h.eur(PORI.hyvaksytyt)}. Tulojen vaikutus on kaikissa kolmessa sama, perusomavastuu ${h.eur(HKI.perusomavastuu, 2)}.</p>
<h2>Lapsiperheen rajat</h2>
<p>Perheen koko nostaa rajaa, mutta ei samassa suhteessa kuin vuokrat. Kahden aikuisen ja kahden lapsen perhe, jonka bruttotulot ovat ${h.eur(PERHE.tulot)} ja vuokra ${h.eur(PERHE.vuokra)}, saa Vantaalla hyväksytyksi ${h.eur(VANTAA.hyvaksytyt)} menoja ja asumistukea ${h.eur(VANTAA.tuki, 2)} kuukaudessa. Jyväskylässä raja on ${h.eur(JKL.enimmais)} ja tuki ${h.eur(JKL.tuki, 2)}, Kajaanissa raja ${h.eur(KAJ.enimmais)} ja tuki ${h.eur(KAJ.tuki, 2)}. Perusomavastuu on kaikissa sama ${h.eur(VANTAA.perusomavastuu, 2)}, koska tulot ja perheen koko ovat samat. Ero syntyy taas kuntaryhmästä: kun vuokra ylittää rajan, jokainen kunta korvaa vain oman kattonsa mukaan.</p>
<h2>Vesi ja lämmitys normin mukaan</h2>
<p>Kun vesi tai lämmitys maksetaan vuokran päälle erikseen, Kela ei katso todellista laskua vaan käyttää kiinteää normia. Vettä hyväksytään ${h.eur(A.vesimaksu_henkilo)} henkeä kohti kuukaudessa. Lämmityksen normi riippuu alueesta: Etelä-Savossa, Pohjois-Savossa ja Pohjois-Karjalassa se on hieman korkeampi, ja Pohjois-Pohjanmaalla, Kainuussa ja Lapissa korkein.</p>
${h.table(['Henkilöitä', 'Vesi', 'Lämmitys, muu Suomi', 'Itä-Suomi', 'Pohjois-Suomi'], [1, 2, 3, 4].map((n) => [h.num(n), h.eur(A.vesimaksu_henkilo * n), h.eur(lammitys('perus', n)), h.eur(lammitys('itainen', n)), h.eur(lammitys('pohjoinen', n))]), 'Erikseen maksettavat vesi- ja lämmitysnormit euroa kuukaudessa, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Normit lisätään vuokraan ennen kuin summaa verrataan enimmäismäärään, joten ne eivät nosta kattoa. Kaksi aikuista oululaisessa rivitaloasunnossa, vuokra ${h.eur(520)} ja vesi sekä lämmitys erikseen, saa hyväksyttäviksi menoiksi ${h.eur(OULU.menot)}, mutta raja on ${h.eur(OULU.enimmais)}. ${h.eur(1900)} yhteistuloilla tuki on ${h.eur(OULU.tuki, 2)} kuukaudessa.</p>
<h2>Mitä ei hyväksytä</h2>
<ul>
<li>Sähkömaksu. Jos sähkö sisältyy vuokraan, sen osuus vähennetään vuokrasta.</li>
<li>Saunamaksu, pesutupamaksu ja autopaikkamaksu.</li>
<li>Internetliittymän maksu.</li>
<li>Käyttö- ja kalustemaksut kalustetussa asunnossa.</li>
<li>Asumisoikeusasunnon ja osaomistusasunnon lainojen korot; näissä asunnoissa hyväksytään käyttövastike tai vuokra sekä vesi ja lämmitys normin mukaan.</li>
</ul>
<p>Omistusasuntoon yleistä asumistukea ei saa lainkaan. Asumisoikeusasunnossa menoiksi lasketaan käyttövastike, mutta asumisoikeusmaksua varten otetun lainan korkoja ei. Osaomistusasunnossa hyväksytään vuokra, mutta osuuden ostoa varten otetun lainan korot jäävät laskelman ulkopuolelle. Vuokra-asunnossa alivuokralaisen maksama vuokra vähennetään menoista.</p>
<h2>Esimerkki Kelan laskelmasta</h2>
<p>Kela käyttää omana esimerkkinään ${JK.nimi.replace('Jaakko', 'Jaakkoa')}, joka asuu yksin ${JK.kunta.replace('Turku', 'Turussa')}. Vuokra on ${h.eur(JK.menot)}, mutta II-ryhmän yksin asuvan raja on ${h.eur(JAAKKO.enimmais)}. Tulot ovat ${h.eur(JK.tulot)} kuukaudessa, joten perusomavastuu on ${h.eur(JAAKKO.perusomavastuu, 2)}. Tuki on ${OSUUS} % erotuksesta ${h.eur(JAAKKO.enimmais)} miinus ${h.eur(JAAKKO.perusomavastuu, 2)}, eli ${h.eur(JAAKKO.tuki, 2)} kuukaudessa. Moottorimme tuottaa saman summan sentilleen. Tulojen vaikutus selitetään sivulla ${h.a('asumistuki-tulot', 'asumistuki ja tulot')}.</p>
<h2>Miten rajat päivittyvät</h2>
<p>Laki kirjaa enimmäismäärät lokakuun 2017 hintatasossa ja tarkistaa ne joka vuoden alussa elinkustannusindeksin mukaan. Vuoden 2026 eurot ovat Kelan julkaisemia. Vuokrankorotus, joka ylittää indeksin, valuu siis suoraan vuokralaisen maksettavaksi niillä, joiden vuokra on jo rajalla. Toisessa päässä on alaraja: jos laskettu tuki jää alle ${h.eur(A.pienin_maksettava)} kuukaudessa, sitä ei makseta lainkaan. Maksettu asumistuki on verotonta tuloa, joten se ei nosta verokortin prosenttia eikä näy verotuksessa. Kokeile omaa kuntaasi sivun minilaskurilla tai koko laskelmaa ${h.a('asumistuki-laskuri', 'asumistukilaskurissa')}. Paikalliset vuokratasot löydät esimerkiksi sivuilta ${h.a('helsinki', 'Helsinki')} ja ${h.a('tampere', 'Tampere')}.</p>
<p>Lähteet: ${h.src('kela_asumistuki_laskenta', 'Kela, miten tulot ja menot vaikuttavat')} ja ${h.src('finlex_asumistuki', 'laki yleisestä asumistuesta 938/2014')}.</p>`,
  },
  en: {
    slug: 'housing-allowance-maximum-costs',
    nav: 'Housing allowance caps',
    card: 'The highest rent Kela accepts for the housing allowance in your town, by household size.',
    title: 'Housing Allowance Maximum Costs 2026 by Municipality',
    description: `Housing allowance maximum costs 2026: Kela accepts at most ${EN.eur(E.I[0])} of rent for one person in Helsinki, ${EN.eur(E.II[0])} in Tampere or Turku and ${EN.eur(E.III[0])} elsewhere. Full table.`,
    h1: 'Maximum housing costs for the housing allowance',
    intro: 'Kela only counts rent up to a cap set by municipality and household size; the rest is on you.',
    resume: `For Kela’s general housing allowance (yleinen asumistuki) in 2026, a single person’s housing costs are accepted up to ${EN.eur(E.I[0])} a month in Helsinki, Espoo, Kauniainen and Vantaa, ${EN.eur(E.II[0])} in the ${A.kuntaryhma_II.length} group II municipalities such as Tampere, Turku, Oulu and Jyväskylä, and ${EN.eur(E.III[0])} everywhere else on the mainland. Åland has its own scale, starting at ${EN.eur(E.Ahvenanmaa[0])}. A family of four is capped at ${EN.eur(E.I[3])}, ${EN.eur(E.II[3])} or ${EN.eur(E.III[3])}. The allowance is ${OSUUS}% of accepted costs minus an income-based deductible, so every euro of rent above the cap comes entirely out of your own pocket. If water and heating are billed separately, Kela adds fixed amounts rather than your actual bills: ${EN.eur(A.vesimaksu_henkilo)} of water per person and ${EN.eur(L.perus[0])} of heating for the first person plus ${EN.eur(L.perus[1])} for each additional one, a little more in eastern and northern Finland. Electricity, parking, sauna, laundry and internet are never accepted. For many newcomers renting in Helsinki, the cap rather than income is what limits the allowance.`,
    faqs: [
      { q: 'What is the maximum rent for housing allowance in Helsinki?', a: `In 2026 the group I caps are ${EN.eur(E.I[0])} for a single tenant, ${EN.eur(E.I[1])} for a couple, ${EN.eur(E.I[2])} for a household of three and ${EN.eur(E.I[3])} for a household of four, identical in Espoo, Kauniainen and Vantaa. Renting a ${EN.eur(VUOKRA)} studio alone means ${EN.eur(VUOKRA - E.I[0])} a month is outside the calculation and paid fully by you.` },
      { q: 'Which housing allowance group is Turku in?', a: `Turku is in group II, along with Tampere, Oulu, Jyväskylä, Kuopio, Lahti and ${A.kuntaryhma_II.length - 6} other municipalities named in section 10 of the Housing Allowance Act. The cap for one person there is ${EN.eur(E.II[0])} a month, and ${EN.eur(E.II[1])} for a couple. Any mainland municipality not on the group I or II lists is in group III.` },
      { q: 'My rent includes electricity. Does Kela count the whole rent?', a: `No. Kela removes the electricity share from the rent before comparing it with the cap, because electricity is not an accepted housing cost. The same goes for parking, sauna, laundry room, internet and furniture fees in a furnished flat. Only rent and separately billed water (${EN.eur(A.vesimaksu_henkilo)} per person) and heating at Kela’s flat rates count.` },
      { q: 'Will a more expensive flat get me more housing allowance?', a: `Only up to the cap. Below it, ${EN.eur(100)} more rent raises the allowance by ${EN.eur(OSUUS)} and costs you ${EN.eur(100 - OSUUS)}. Above it, the allowance stays flat and you pay the whole difference. In Tampere a single person reaches the cap at ${EN.eur(E.II[0])}, so moving from a ${EN.eur(E.II[0])} flat to one at ${EN.eur(E.II[0] + 150)} brings no extra support at all.` },
      { q: 'I sublet a room to a flatmate. How does Kela treat that?', a: `The rent your subtenant pays you is subtracted from your accepted housing costs. If your rent is ${EN.eur(900)} and the subtenant pays ${EN.eur(350)}, Kela starts from ${EN.eur(550)}. Because the deduction comes before the cap, it only lowers your allowance when the remaining costs fall below the cap for your town.` },
    ],
    body: (h) => `
<h2>The 2026 caps</h2>
<p>The Housing Allowance Act says support is calculated from accepted housing costs, but only up to a maximum set in the law. That maximum depends on the municipality group and the number of people in the household.</p>
${h.table(['People', 'Group I', 'Group II', 'Group III', 'Åland'], HENK.map((n) => [h.num(n), ...RYHMAT.map((r) => h.eur(enimmaisasumismenot(r, n)))]), 'Maximum accepted housing costs, euros per month, 2026 (Kela)', ['l', 'r', 'r', 'r', 'r'])}
<p>Beyond four people, each extra person adds ${h.eur(E.I[4])} in group I, ${h.eur(E.II[4])} in group II, ${h.eur(E.III[4])} in group III and ${h.eur(E.Ahvenanmaa[4])} in Åland. The five and six person rows apply that rule.</p>
<h2>Which group your town is in</h2>
<p>Older guides and forum posts describe four groups with Helsinki on its own. The act in force today has three. Group I is ${I_LISTA}. Group II is a named list: ${II_LISTA}. Group III covers every other mainland municipality, including Pori, Vaasa, Kotka and Mikkeli.</p>
<p>The group can matter more than your salary. The same ${h.eur(VUOKRA)} studio and the same ${h.eur(TULO)} gross income produce ${h.eur(HKI.tuki, 2)} of allowance in Helsinki, ${h.eur(TRE.tuki, 2)} in Tampere and ${h.eur(PORI.tuki, 2)} in Pori. Income is treated identically in all three, with a deductible of ${h.eur(HKI.perusomavastuu, 2)}; the gap comes entirely from how much rent is accepted: ${h.eur(HKI.hyvaksytyt)}, ${h.eur(TRE.hyvaksytyt)} and ${h.eur(PORI.hyvaksytyt)}.</p>
<h2>Families: caps rise, but slowly</h2>
<p>A larger household gets a higher cap, though not one that keeps pace with family-sized rents. Two adults and two children with ${h.eur(PERHE.tulot)} of gross income and ${h.eur(PERHE.vuokra)} rent receive ${h.eur(VANTAA.tuki, 2)} a month in Vantaa, ${h.eur(JKL.tuki, 2)} in Jyväskylä and ${h.eur(KAJ.tuki, 2)} in Kajaani. The deductible is ${h.eur(VANTAA.perusomavastuu, 2)} in all three; what differs is the cap: ${h.eur(VANTAA.enimmais)}, ${h.eur(JKL.enimmais)} and ${h.eur(KAJ.enimmais)}.</p>
<h2>Water and heating at flat rates</h2>
<p>When water or heating is billed on top of rent, Kela ignores your actual bill and uses a fixed rate. Water is ${h.eur(A.vesimaksu_henkilo)} per person per month. Heating depends on the region: a little higher in Etelä-Savo, Pohjois-Savo and Pohjois-Karjala, and highest in Pohjois-Pohjanmaa, Kainuu and Lapland.</p>
${h.table(['People', 'Water', 'Heating, most of Finland', 'East', 'North'], [1, 2, 3, 4].map((n) => [h.num(n), h.eur(A.vesimaksu_henkilo * n), h.eur(lammitys('perus', n)), h.eur(lammitys('itainen', n)), h.eur(lammitys('pohjoinen', n))]), 'Flat rates for separately billed water and heating, euros per month, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>These amounts are added to the rent before the cap is applied; they do not raise the cap. A couple in Oulu paying ${h.eur(520)} rent with water and heating billed separately reaches ${h.eur(OULU.menot)} of costs against a cap of ${h.eur(OULU.enimmais)}. With ${h.eur(1900)} of combined gross income, they receive ${h.eur(OULU.tuki, 2)} a month.</p>
<h2>Costs Kela never accepts</h2>
<ul>
<li>Electricity, including the share built into an all-inclusive rent.</li>
<li>Sauna, laundry room and parking space fees.</li>
<li>Internet connection fees.</li>
<li>Usage or furniture fees for a furnished flat.</li>
<li>Loan interest on a right-of-occupancy (asumisoikeus) or part-ownership (osaomistus) flat; for these, Kela accepts the maintenance charge or rent plus water and heating at the flat rates.</li>
</ul>
<p>An owner-occupied home gets no general housing allowance at all, whatever its costs.</p>
<h2>Kela’s own worked example</h2>
<p>Kela’s plain-language guide follows ${JK.nimi}, who lives alone in ${JK.kunta} and pays ${h.eur(JK.menot)} in rent. The group II cap for one person is ${h.eur(JAAKKO.enimmais)}. His income of ${h.eur(JK.tulot)} a month gives a deductible of ${h.eur(JAAKKO.perusomavastuu, 2)}, so the allowance is ${OSUUS}% of ${h.eur(JAAKKO.enimmais)} minus ${h.eur(JAAKKO.perusomavastuu, 2)}: ${h.eur(JAAKKO.tuki, 2)} a month. Our engine reproduces that to the cent. How income shapes the deductible is explained under ${h.a('asumistuki-tulot', 'housing allowance and income')}.</p>
<h2>How the caps are updated</h2>
<p>The act states the caps at the October 2017 price level and adjusts them every January by the cost-of-living index; the 2026 euro amounts are those published by Kela. If your landlord raises the rent faster than the index and you are already at the cap, the whole increase is yours to pay. Test your own town with the mini calculator above, or run the full ${h.a('asumistuki-laskuri', 'housing allowance calculator')}. Local salary pages such as ${h.a('helsinki', 'Helsinki')} and ${h.a('tampere', 'Tampere')} show what take-home pay looks like next to these caps.</p>
<p>Sources: ${h.src('kela_asumistuki_laskenta', 'Kela, how income and costs affect the allowance')} and ${h.src('finlex_asumistuki', 'Housing Allowance Act 938/2014')}.</p>`,
  },
});
