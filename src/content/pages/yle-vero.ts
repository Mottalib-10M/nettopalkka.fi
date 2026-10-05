import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot } from '../../lib/engine/vero';

const V = P.vero;
const Y = V.yle;
const MM = V.ahvenanmaa_mediamaksu;
const THV = V.tulonhankkimisvahennys;
/** Yle-vero puhtaista ansio- ja pääomatuloista (sama kaava kuin moottorissa ja minilaskurissa). */
const yle = (puhdas: number) => Math.min(Y.enimmaismaara, Math.max(0, (Y.prosentti / 100) * (puhdas - Y.tuloraja)));
const KATTO = Y.tuloraja + Y.enimmaismaara / (Y.prosentti / 100);
const PALKKA_ALKAA = Y.tuloraja + THV;
const PALKKA_KATTO = KATTO + THV;

const P16 = laskeVerot({ tulo: 16000 });
const P18 = laskeVerot({ tulo: 18000 });
const P20 = laskeVerot({ tulo: 20000 });
const E18 = laskeVerot({ tulo: 18000, tulolaji: 'elake' });
const ET18 = laskeVerot({ tulo: 18000, tulolaji: 'etuus' });
const MAA = laskeVerot({ tulo: 30000, kunta: 'Maarianhamina' });
const HKI30 = laskeVerot({ tulo: 30000 });
// Palkka ja pääomatulo yhdessä: pääomatulo lisätään puhtaaseen ansiotuloon Yle-veron pohjassa.
const PK_PALKKA = 14000, PK_PAAOMA = 4000;
const PK_ILMAN = yle(PK_PALKKA - THV), PK_KANSSA = yle(PK_PALKKA - THV + PK_PAAOMA);
const TASOT = [14000, 16000, 18000, 20000, 22000, 30000].map((t) => ({ t, v: laskeVerot({ tulo: t }) }));

export default definePage({
  id: 'yle-vero',
  group: 'vero',
  order: 80,
  mini: 'yle',
  related: ['veroprosenttilaskuri', 'kirkollisvero', 'sairausvakuutusmaksut', 'ahvenanmaa'],
  sources: ['vero_ennakonpidatys', 'vero_veroperusteet'],
  fi: {
    slug: 'yle-vero',
    nav: 'Yle-vero',
    card: 'Yle-vero 2026: tuloraja, enimmäismäärä ja palkka, jolla katto täyttyy.',
    title: `Yle-vero 2026: ${FI.p(Y.prosentti, 1)} tuloista, enintään ${FI.eur(Y.enimmaismaara)} vuodessa`,
    description: `Yle-vero 2026 on ${FI.p(Y.prosentti, 1)} puhtaiden ansio- ja pääomatulojen ${FI.eur(Y.tuloraja)} ylittävästä osasta, enintään ${FI.eur(Y.enimmaismaara)}. Katso, millä palkalla vuoden enimmäismäärä täyttyy.`,
    h1: 'Yle-vero eli yleisradiovero',
    intro: 'Yle-vero rahoittaa Yleisradion, ja sen määrä riippuu vain tuloistasi, ei siitä, omistatko television.',
    resume: `Yle-vero on vuonna 2026 ${FI.p(Y.prosentti, 1)} puhtaiden ansio- ja pääomatulojen yhteismäärästä siltä osin kuin se ylittää ${FI.eur(Y.tuloraja)}, ja vero on enintään ${FI.eur(Y.enimmaismaara)} vuodessa. Enimmäismäärä täyttyy, kun puhtaat tulot ovat ${FI.eur(KATTO)}. Palkansaajalla puhdas ansiotulo on bruttopalkka vähennettynä vähintään ${FI.eur(THV)} tulonhankkimisvähennyksellä, joten ensimmäinen Yle-veroeuro syntyy noin ${FI.eur(PALKKA_ALKAA)} vuosipalkalla ja koko ${FI.eur(Y.enimmaismaara)} täyttyy noin ${FI.eur(PALKKA_KATTO)} vuosipalkalla. Esimerkiksi ${FI.eur(18000)} vuodessa ansaitseva maksaa Yle-veroa ${FI.eur(P18.yle, 2)} ja ${FI.eur(20000)} ansaitseva ${FI.eur(P20.yle, 2)}. Kaikki tätä suuremmat tulot maksavat saman ${FI.eur(Y.enimmaismaara)}, joten Yle-vero on suhteessa tuloihin raskain niille, joiden tulot ovat juuri katon tuntumassa. Yle-vero sisältyy verokortin veroprosenttiin, joten erillistä laskua ei tule. Ahvenanmaalla Yle-veroa ei peritä; sen tilalla on maakunnan mediamaksu ${FI.eur(MM.maara)}, kun puhtaat tulot ylittävät ${FI.eur(MM.tuloraja)}. Kotikunta ei mantereella vaikuta Yle-veroon, eikä television omistaminen tai puuttuminen muuta sitä.`,
    faqs: [
      { q: 'Millä tuloilla Yle-veroa ei tarvitse maksaa ollenkaan?', a: `Yle-veroa ei peritä, jos puhtaat ansio- ja pääomatulosi ovat yhteensä enintään ${FI.eur(Y.tuloraja)} vuodessa. Palkansaajalla se tarkoittaa noin ${FI.eur(PALKKA_ALKAA)} bruttopalkkaa, koska palkasta vähennetään ensin ${FI.eur(THV)} tulonhankkimisvähennys. Eläkkeestä tai Kelan etuudesta tätä vähennystä ei tehdä, joten eläkeläisellä raja on tasan ${FI.eur(Y.tuloraja)}. Alaikäisiltä Yle-veroa ei peritä tuloista riippumatta.` },
      { q: 'Paljonko Yle-veroa eläkeläinen maksaa?', a: `Saman kaavan mukaan kuin palkansaaja: ${FI.p(Y.prosentti, 1)} puhtaiden tulojen ${FI.eur(Y.tuloraja)} ylittävästä osasta. ${FI.eur(18000)} vuodessa eläkettä saava maksaa ${FI.eur(E18.yle, 2)}, kun samansuuruisesta palkasta Yle-veroa menee ${FI.eur(P18.yle, 2)}. Ero johtuu tulonhankkimisvähennyksestä, jota eläkkeestä ei tehdä. Eläketulovähennys ei pienennä Yle-veron pohjaa.` },
      { q: 'Vaikuttavatko osingot ja vuokratulot Yle-veroon?', a: `Vaikuttavat. Yle-veron pohja on puhtaiden ansiotulojen ja puhtaiden pääomatulojen summa. Jos palkkasi on ${FI.eur(PK_PALKKA)} ja saat lisäksi ${FI.eur(PK_PAAOMA)} puhdasta vuokratuloa, Yle-vero nousee ${FI.eur(PK_ILMAN, 2)} eurosta ${FI.eur(PK_KANSSA, 2)} euroon. Pääomatulosta ei pidätetä Yle-veroa palkan yhteydessä, joten erotus tulee maksettavaksi verotuksessa, ellei sitä ole maksettu ennakkona.` },
      { q: 'Maksavatko molemmat puolisot oman Yle-veronsa?', a: `Maksavat. Yle-vero on henkilökohtainen, eikä kotitalouden koolla tai yhteisellä asunnolla ole merkitystä. Jos molemmat puolisot ansaitsevat yli ${FI.eur(PALKKA_KATTO)} vuodessa, perhe maksaa Yle-veroa yhteensä ${FI.eur(2 * Y.enimmaismaara)}. Jos toinen puolisoista on kotona ilman omia tuloja, hän ei maksa Yle-veroa lainkaan.` },
      { q: 'Peritäänkö Yle-vero myös työttömyyspäivärahasta?', a: `Peritään. Työttömyysetuus, sairauspäiväraha ja vanhempainraha ovat ansiotuloa, joten ne kuuluvat Yle-veron pohjaan samalla tavalla kuin palkka. Etuudesta ei tehdä tulonhankkimisvähennystä, joten ${FI.eur(18000)} vuodessa etuutta saava maksaa Yle-veroa ${FI.eur(ET18.yle, 2)}. Etuuden maksaja pidättää Yle-veron verokortin prosentin mukana, joten erillistä maksua ei yleensä tarvita.` },
      { q: 'Paljonko Yle-vero on kuukaudessa?', a: `Enimmillään ${FI.eur(Y.enimmaismaara / 12, 2)} kuukaudessa, koska vuoden enimmäismäärä on ${FI.eur(Y.enimmaismaara)}. Tämä koskee kaikkia, joiden puhtaat tulot ylittävät ${FI.eur(KATTO)}. Pienemmillä tuloilla summa on vähemmän: ${FI.eur(18000)} vuosipalkalla noin ${FI.eur(P18.yle / 12, 2)} kuukaudessa. Kuukausierää ei näe palkkalaskelmalla erikseen, koska se on osa verokortin veroprosenttia.` },
      { q: 'Voiko Yle-verosta vapautua, jos ei katso Yleä?', a: `Ei voi. Yle-vero on tuloihin perustuva vero, eikä sen määrään vaikuta, onko taloudessa televisiota, radiota tai nettiyhteyttä. Ainoat keinot maksaa vähemmän ovat pienet tulot tai asuminen Ahvenanmaalla, jossa veron korvaa maakunnan oma mediamaksu ${FI.eur(MM.maara)}. Vähennyksiä, jotka pienentävät puhdasta ansiotuloa, kuten työmatkakulut, voi kuitenkin hyödyntää myös Yle-veron osalta.` },
    ],
    body: (h) => `
<h2>Laskukaava yhdellä rivillä</h2>
<p>Yle-vero lasketaan kaavalla: (puhtaat ansiotulot + puhtaat pääomatulot − ${h.eur(Y.tuloraja)}) × ${h.num(Y.prosentti, 1)} %, enintään ${h.eur(Y.enimmaismaara)}. Laki ei porrasta veroa, vaan jokainen tulorajan ylittävä euro maksaa saman ${h.num(Y.prosentti, 1)} senttiä, kunnes katto tulee vastaan. Katon jälkeen lisätulot eivät enää kasvata Yle-veroa lainkaan, minkä vuoksi suurituloisen ja keskituloisen Yle-vero on täsmälleen sama. Arvot perustuvat Verohallinnon ${h.src('vero_ennakonpidatys', 'ennakonpidätyspäätökseen vuodelle 2026')} ja sivuun ${h.src('vero_veroperusteet', 'veroperusteet 2026')}.</p>
${h.table(['Vuosipalkka', 'Puhdas ansiotulo', 'Yle-vero', 'Kaikki verot', 'Yle-veron osuus veroista'], TASOT.map(({ t, v }) => [h.eur(t), h.eur(v.puhdasAnsiotulo), h.eur(v.yle, 2), h.eur(v.verot, 2), v.verot > 0 ? h.pct(v.yle / v.verot, 0) : '–']), 'Helsinki, ei kirkon jäsen, vuosi 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>Taulukon pienimmillä palkoilla Yle-vero on suurin osa koko verosta tai jopa ainoa vero, koska työtulovähennys nollaa valtionveron ja kunnallisverosta jää vähän jäljelle. ${h.eur(16000)} palkalla verot ovat yhteensä ${h.eur(P16.verot, 2)}, ja siitä Yle-veroa on ${h.eur(P16.yle, 2)}. Kun palkka kasvaa, kunnallisvero ja valtionvero ohittavat sen nopeasti, ja ${h.eur(30000)} palkalla Yle-vero on enää pieni osa kokonaisuudesta.</p>
<h2>Kenen tuloista vero peritään</h2>
<p>Yle-veroa maksavat täysi-ikäiset luonnolliset henkilöt, jotka ovat Suomessa yleisesti verovelvollisia. Se peritään samassa verotuksessa kuin tulovero: palkansaajalla verokortin prosenttiin on laskettu arvio vuoden Yle-verosta, ja eläkkeen tai etuuden maksaja pidättää sen samalla tavalla. Lopullinen summa vahvistuu verotuksessa, jossa mukaan tulevat myös pääomatulot ja vähennykset.</p>
<p>Eri tulolajit kohtelevat Yle-veroa hieman eri tavoin. Palkasta vähennetään tulonhankkimisvähennys, joten palkansaajan raja on bruttona ${h.eur(PALKKA_ALKAA)}. Eläkkeestä ja Kelan etuuksista vastaavaa vähennystä ei ole: ${h.eur(18000)} eläkkeestä Yle-vero on ${h.eur(E18.yle, 2)} ja yhtä suuresta etuudesta ${h.eur(ET18.yle, 2)}, kun palkasta se on ${h.eur(P18.yle, 2)}. Eläketulovähennys ja perusvähennys tehdään vasta myöhemmin kunnallisverotuksessa, joten ne eivät pienennä Yle-veroa.</p>
<h2>Ensimmäinen työvuosi ja kesätyö</h2>
<p>Yle-vero lasketaan vuoden todellisista tuloista, ei kuukausipalkan perusteella. Siksi kesätyöntekijä tai keväällä työelämään siirtyvä valmistunut maksaa usein vähemmän kuin kuukausipalkka antaisi olettaa. Jos ${h.eur(3000)} kuukausipalkkaa maksetaan vain viideltä kuukaudelta, vuositulo on ${h.eur(15000)}, ja puhtaat tulot jäävät alle ${h.eur(Y.tuloraja)} rajan: Yle-veroa ei tule lainkaan, vaikka sama palkka koko vuodelta täyttäisi katon moninkertaisesti. Verokortin prosentti voi silti sisältää Yle-veroa, jos tuloraja on arvioitu suuremmaksi, ja liika pidätys palautuu verotuksessa.</p>
<h2>Rajatulon kohdalla</h2>
<p>Tulovälillä ${h.eur(PALKKA_ALKAA)}–${h.eur(PALKKA_KATTO)} bruttopalkkaa Yle-vero nostaa marginaaliveroa ${h.num(Y.prosentti, 1)} prosenttiyksiköllä: jokaisesta lisäeurosta menee ${h.num(Y.prosentti, 1)} senttiä Yle-veroon ennen muita veroja ja maksuja. Katon jälkeen tämä osuus poistuu kokonaan. Vaikutus on pieni verrattuna kunnallisveroon, mutta osa-aikatyötä tekevälle se on yksi syy, miksi ensimmäiset tuhat euroa rajan yli tuntuvat kalliilta.</p>
<h2>Vähennykset, jotka pienentävät Yle-veroa</h2>
<p>Yle-veron pohja on puhdas tulo, joten kaikki puhtaaseen ansiotuloon kohdistuvat vähennykset pienentävät myös sitä. Tärkein niistä on työmatkakulujen vähennys: ${h.eur(h.P.vero.matkakulut.omavastuu)} omavastuun ylittävät kulut vähennetään ennen Yle-veron laskemista. Samoin vaikuttavat ammattiliiton ja työttömyyskassan jäsenmaksut. Sen sijaan työeläkemaksu, työttömyysvakuutusmaksu ja päivärahamaksu vähennetään vasta puhtaasta ansiotulosta, eivätkä ne siksi muuta Yle-veroa. Pienituloiselle jo ${h.eur(100)} lisävähennys voi tarkoittaa ${h.eur(100 * Y.prosentti / 100, 2)} pienempää Yle-veroa, mutta katon yläpuolella vähennykset eivät siihen vaikuta.</p>
<h2>Pääomatulot nostavat pohjaa</h2>
<p>Osingot, vuokratulot ja luovutusvoitot lasketaan mukaan Yle-veron pohjaan puhtaana pääomatulona. Palkan yhteydessä niistä ei pidätetä mitään, joten opiskelija tai osa-aikatyöntekijä voi yllättyä: ${h.eur(PK_PALKKA)} palkalla Yle-vero on ${h.eur(PK_ILMAN, 2)}, mutta kun mukaan tulee ${h.eur(PK_PAAOMA)} puhdasta vuokratuloa, vero on ${h.eur(PK_KANSSA, 2)}. Jos pääomatuloja on paljon, ennakkoveron tai lisäennakon maksaminen OmaVerossa välttää jäännösveron.</p>
<h2>Ahvenanmaan mediamaksu</h2>
<p>${h.a('ahvenanmaa', 'Ahvenanmaalla')} asuva ei maksa Yle-veroa. Maakunta perii sen sijaan oman mediamaksunsa, joka on kiinteä ${h.eur(MM.maara)}, kun puhtaat tulot ylittävät ${h.eur(MM.tuloraja)}. Maksu ei kasva tulojen mukana asteittain vaan tulee kerralla täysimääräisenä. Maarianhaminassa ${h.eur(30000)} palkalla mediamaksu on ${h.eur(MAA.yle)}, kun Helsingissä Yle-vero on samalla palkalla ${h.eur(HKI30.yle)}. Muiden verojen erot Ahvenanmaan ja mantereen välillä ovat paljon suuremmat, ja ne näkyvät ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurissa')}, kun valitset kotikunnaksi ahvenanmaalaisen kunnan.</p>
<p>Yle-veron rinnalla palkasta menevät myös ${h.a('sairausvakuutusmaksut', 'sairausvakuutusmaksut')} ja kirkon jäsenillä ${h.a('kirkollisvero', 'kirkollisvero')}. Toisin kuin ne, Yle-vero ei riipu kotikunnasta eikä kirkon jäsenyydestä. Kaksi samaa palkkaa saavaa työkaveria maksaa siis aina saman Yle-veron, vaikka toinen asuisi Kauniaisissa ja toinen Kemiönsaarella, ja vaikka heidän verokorttiensa prosentit poikkeaisivat toisistaan useita prosenttiyksiköitä.</p>`,
  },
  en: {
    slug: 'yle-tax',
    nav: 'Yle tax',
    card: 'The 2026 Yle tax: who pays it, the income threshold and the salary at which the cap applies.',
    title: `Yle tax 2026: Finland’s broadcasting tax, capped at ${EN.eur(Y.enimmaismaara)}`,
    description: `Yle tax 2026: ${EN.p(Y.prosentti, 1)} of net earned and capital income above ${EN.eur(Y.tuloraja)}, capped at ${EN.eur(Y.enimmaismaara)}. See the salary that hits the cap and how Åland’s media fee differs.`,
    h1: 'Yle tax: the Finnish public broadcasting tax',
    intro: 'Everyone with enough income pays the Yle tax (Yle-vero), which funds the national broadcaster whether or not you watch it.',
    resume: `The Yle tax (Yle-vero) in 2026 is ${EN.p(Y.prosentti, 1)} of your combined net earned and capital income above ${EN.eur(Y.tuloraja)}, and never more than ${EN.eur(Y.enimmaismaara)} a year. You reach the cap at ${EN.eur(KATTO)} of net income. For an employee, net income means gross pay minus at least the ${EN.eur(THV)} work-expense deduction, so the tax starts at about ${EN.eur(PALKKA_ALKAA)} of annual salary and is maxed out from about ${EN.eur(PALKKA_KATTO)}. Someone earning ${EN.eur(18000)} pays ${EN.eur(P18.yle, 2)}; at ${EN.eur(20000)} it is ${EN.eur(P20.yle, 2)}; above that everybody pays the same flat ${EN.eur(Y.enimmaismaara)}. There is no bill in the post: the tax is part of the withholding rate on your tax card (verokortti), and the final amount is settled in your annual assessment. It replaced the old TV licence, so owning a television makes no difference. In Åland the Yle tax is not charged; residents there pay the province’s own media fee of ${EN.eur(MM.maara)} once net income exceeds ${EN.eur(MM.tuloraja)}.`,
    faqs: [
      { q: 'Do I have to pay Yle tax if I do not own a TV?', a: `Yes. The Yle tax depends only on your income, not on any device, so a household without a television pays exactly the same. It is charged to every adult taxed as a Finnish resident whose net earned and capital income exceeds ${EN.eur(Y.tuloraja)}. The only people who escape it are those under that threshold, minors and residents of Åland, who pay a ${EN.eur(MM.maara)} media fee instead.` },
      { q: 'At what salary does the Yle tax reach its maximum?', a: `At about ${EN.eur(PALKKA_KATTO)} of gross annual salary. The cap of ${EN.eur(Y.enimmaismaara)} is reached at ${EN.eur(KATTO)} of net income, and an employee’s net income is gross pay minus the ${EN.eur(THV)} work-expense deduction. Commuting costs above ${EN.eur(V.matkakulut.omavastuu)} or union fees lower net income further, which pushes that salary point slightly higher.` },
      { q: 'Does my rental or dividend income count for the Yle tax?', a: `Yes. The base adds net capital income to net earned income. With ${EN.eur(PK_PALKKA)} of salary your Yle tax is ${EN.eur(PK_ILMAN, 2)}; add ${EN.eur(PK_PAAOMA)} of net rental income and it becomes ${EN.eur(PK_KANSSA, 2)}. Nothing is withheld on capital income through your payslip, so the difference shows up in your assessment unless you paid it in advance.` },
      { q: 'Is the Yle tax charged per person or per household?', a: `Per person. Each adult with enough income pays their own Yle tax, so a couple both earning over ${EN.eur(PALKKA_KATTO)} pays ${EN.eur(2 * Y.enimmaismaara)} between them. A spouse with no income of their own pays nothing, and the size of your flat or family does not matter at all.` },
      { q: 'I only worked in Finland for part of the year: how much Yle tax do I owe?', a: `Only your Finnish taxable income for that year counts. If you started in September on ${EN.eur(3500)} a month, four months make ${EN.eur(14000)}, and net income stays under ${EN.eur(Y.tuloraja)}: no Yle tax at all. Your tax card may still have withheld some, based on the income limit you gave, and the excess comes back as a refund.` },
      { q: 'Is a pensioner’s Yle tax calculated differently?', a: `The formula is the same, but a pension gets no work-expense deduction, so it is slightly more expensive than a salary of the same size. A pension of ${EN.eur(18000)} gives ${EN.eur(E18.yle, 2)} of Yle tax, against ${EN.eur(P18.yle, 2)} on ${EN.eur(18000)} of wages. The pension income deduction applies later and does not lower the Yle tax base.` },
    ],
    body: (h) => `
<h2>The formula</h2>
<p>Take your net earned income, add your net capital income, subtract ${h.eur(Y.tuloraja)} and multiply by ${h.num(Y.prosentti, 1)}%. If the result exceeds ${h.eur(Y.enimmaismaara)}, you pay ${h.eur(Y.enimmaismaara)}. That is the whole calculation, set out in ${h.src('vero_ennakonpidatys', 'Vero’s 2026 withholding decision')} and summarised on ${h.src('vero_veroperusteet', 'Vero’s tax bases page')}. There are no brackets: each euro between the threshold and ${h.eur(KATTO)} costs ${h.num(Y.prosentti, 1)} cents, and every euro above it costs nothing.</p>
${h.table(['Annual salary', 'Net earned income', 'Yle tax', 'All taxes', 'Yle share of taxes'], TASOT.map(({ t, v }) => [h.eur(t), h.eur(v.puhdasAnsiotulo), h.eur(v.yle, 2), h.eur(v.verot, 2), v.verot > 0 ? h.pct(v.yle / v.verot, 0) : '–']), 'Helsinki, no church membership, 2026', ['l', 'r', 'r', 'r', 'r'])}
<p>On small salaries the Yle tax is a large slice of your total tax, sometimes nearly all of it, because the earned income credit cancels state tax and most of municipal tax. At ${h.eur(16000)} total tax is ${h.eur(P16.verot, 2)}, of which ${h.eur(P16.yle, 2)} is Yle tax. By ${h.eur(30000)} the flat ${h.eur(Y.enimmaismaara)} has become a minor item.</p>
<h2>How it is collected</h2>
<p>Most people never see a separate Yle bill. Vero includes an estimate of your Yle tax in the withholding rate printed on your tax card, so your employer deducts it in instalments with the rest of your tax. Pension and benefit payers do the same. The exact amount is fixed in the annual assessment, where capital income and deductions are added. If you arrived in Finland part way through the year, only the income taxed in Finland counts, which often keeps newcomers under the cap in their first year.</p>
<p>Salary, pensions and benefits are treated slightly differently. Wages get the ${h.eur(THV)} work-expense deduction, so the threshold in gross terms is ${h.eur(PALKKA_ALKAA)}. Pensions and Kela benefits do not: ${h.eur(18000)} of pension gives ${h.eur(E18.yle, 2)} and the same amount of benefit ${h.eur(ET18.yle, 2)}, against ${h.eur(P18.yle, 2)} on wages. The basic deduction and the pension income deduction come later in the calculation and leave the Yle tax untouched.</p>
<h2>What lowers it</h2>
<p>Anything that reduces net earned income reduces the Yle tax too, as long as you are below the cap. The commuting deduction is the usual one: costs above the ${h.eur(h.P.vero.matkakulut.omavastuu)} own share come off before the Yle tax is worked out. Union and unemployment fund fees work the same way. Your pension, unemployment and daily allowance contributions, by contrast, are deducted only after net income has been fixed, so they do not change it. Below the cap, each extra ${h.eur(100)} of deductions saves ${h.eur(100 * Y.prosentti / 100, 2)} of Yle tax.</p>
<h2>Capital income</h2>
<p>Dividends, rent and capital gains count as net capital income and are added to the base. Nothing is withheld on them through your salary, which surprises students and part-time workers with investments: on ${h.eur(PK_PALKKA)} of salary the Yle tax is ${h.eur(PK_ILMAN, 2)}, but ${h.eur(PK_PAAOMA)} of net rental income on top lifts it to ${h.eur(PK_KANSSA, 2)}. Paying additional prepayment (lisäennakko) in MyTax (OmaVero) avoids residual tax later.</p>
<h2>Åland: a media fee instead</h2>
<p>Residents of ${h.a('ahvenanmaa', 'Åland')} pay no Yle tax. The province charges its own media fee, a flat ${h.eur(MM.maara)} once net income exceeds ${h.eur(MM.tuloraja)}, with no gradual phase-in. In Mariehamn a ${h.eur(30000)} salary carries a ${h.eur(MAA.yle)} media fee, compared with ${h.eur(HKI30.yle)} of Yle tax in Helsinki.</p>
<p>Next to the Yle tax, your payslip also carries ${h.a('sairausvakuutusmaksut', 'health insurance contributions')} and, for members, ${h.a('kirkollisvero', 'church tax')}. Unlike those, the Yle tax is identical in every mainland municipality. The ${h.a('veroprosenttilaskuri', 'tax rate calculator')} shows it as a separate line.</p>`,
  },
});
