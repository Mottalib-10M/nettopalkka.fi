import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, elaketulovahennys } from '../../lib/engine/vero';
import { elakeNetto } from '../../lib/engine/elake';
import { KALLEIN, HALVIN } from '../../lib/esimerkit';

const V = P.vero;
const ETV = P.elake.elaketulovahennys;
const LV = V.elaketulon_lisavero;
const SHM = V.sairaanhoitomaksu_muu_tulo_prosentti;
/** Piste, jossa eläketulovähennys loppuu: 22 500 € + jäljellä oleva vähennys / 19,6 %. */
const JALJELLA_RAJALLA = ETV.taysi - ETV.pienenemis_prosentti / 100 * (ETV.toinen_raja - ETV.taysi);
const NOLLA = ETV.toinen_raja + JALJELLA_RAJALLA / (ETV.toinen_pienenemis_prosentti / 100);
const elv = (t: number) => elaketulovahennys(t, t);
const vero = (t: number, kunta: string = 'Helsinki') => laskeVerot({ tulo: t, tulolaji: 'elake', kunta });
const N2000 = elakeNetto(2000, 'Helsinki');
const NK = elakeNetto(2000, KALLEIN.nimi), NH = elakeNetto(2000, HALVIN.nimi);
/** Vero.fi:n esimerkit: Helsinki, kirkon jäsen, vain eläketuloa. */
const ESIM = P.vero_esimerkit.elake.map(([t, v]) => ({ t, v, oma: laskeVerot({ tulo: t, tulolaji: 'elake', kunta: 'Helsinki', kirkko: 'evl' }) }));
const OSUU = ESIM.filter((e) => Math.abs(e.oma.verot - e.v) < 0.005).length;
/** Pienin vuosieläke (10 euron tarkkuudella), josta menee veroa Helsingissä ilman kirkkoa. */
const KYNNYS = (() => { let t = 0; while (vero(t).verot <= 0 && t < 30000) t += 10; return t; })();
const marg = (t: number) => (vero(t + 100).verot - vero(t).verot) / 100;
const PALKKA_VS = 24000;
const PE = vero(PALKKA_VS), PA = laskeVerot({ tulo: PALKKA_VS, kunta: 'Helsinki' });
const ERO_VS = PA.netto - PE.netto;
const N3000 = elakeNetto(3000, 'Helsinki');
const SUURI = ESIM[ESIM.length - 1];
const VERTAILU = [18000, 24000, 36000].map((t) => ({ t, e: vero(t), p: laskeVerot({ tulo: t, kunta: 'Helsinki' }) }));
const ELV_RIVIT = [10000, 15000, 20000, 22500, 30000, 40000];

export default definePage({
  id: 'elakkeen-verotus',
  group: 'elake',
  order: 40,
  mini: 'elakevero',
  related: ['elakelaskuri', 'takuuelake-laskuri', 'sairausvakuutusmaksut', 'kuntavertailu'],
  sources: ['vero_elake_paatos', 'vero_esimerkit', 'finlex_tvl'],
  fi: {
    slug: 'elakkeen-verotus',
    nav: 'Eläkkeen verotus',
    card: 'Eläketulovähennys, sairaanhoitomaksu ja lisävero: paljonko eläkkeestä jää käteen vuonna 2026.',
    title: 'Eläkkeen verotus 2026: eläketulovähennys ja veroprosentti',
    description: `Eläkkeen verotus 2026: eläketulovähennys on enintään ${FI.eur(ETV.taysi)}, sairaanhoitomaksu ${FI.num(SHM, 2)} % ja yli ${FI.num(LV.raja)} euron vuosieläkkeestä peritään lisäveroa ${FI.num(LV.prosentti, 2)} %.`,
    h1: 'Eläkkeen verotus',
    intro: 'Eläke verotetaan ansiotulona, mutta omilla vähennyksillään: näin verot lasketaan ja näin paljon kuukausieläkkeestä jää.',
    resume: `Helsinkiläinen, jonka eläke on ${FI.eur(2000)} kuukaudessa ja joka ei kuulu kirkkoon, maksaa vuonna 2026 veroa ${FI.eur(N2000.kkVerot)} kuukaudessa, joten nettoeläke on ${FI.eur(N2000.kkNetto)} ja veroprosentti ${FI.num(N2000.veroprosentti, 1)}. Eläke on ansiotuloa, mutta sen verotus poikkeaa palkasta kolmella tavalla. Ensinnäkin eläkkeensaaja saa eläketulovähennyksen, joka on enintään ${FI.eur(ETV.taysi)} vuodessa. Se pienenee ${ETV.pienenemis_prosentti} prosentilla siitä puhtaasta ansiotulosta, joka ylittää ${FI.eur(ETV.taysi)}, ja ${FI.eur(ETV.toinen_raja)} ylittävältä osalta ${FI.num(ETV.toinen_pienenemis_prosentti, 1)} prosentilla, joten vähennys loppuu noin ${FI.eur(NOLLA)} kohdalla. Toiseksi eläkkeestä ei saa työtulovähennystä eikä siitä peritä työeläke-, työttömyysvakuutus- tai päivärahamaksua, mutta sairaanhoitomaksu on ${FI.num(SHM, 2)} %. Kolmanneksi yli ${FI.eur(LV.raja)} eläketulosta maksetaan ${FI.num(LV.prosentti, 2)} prosentin lisävero. Laskurimme toistaa Verohallinnon ${ESIM.length} julkaistua esimerkkiä sentilleen, joten sivun luvut ja minilaskurin tulos perustuvat täsmälleen samaan laskentaan kuin oma eläkeverokorttisi.`,
    faqs: [
      { q: 'Kuinka suuri eläke on kokonaan verotonta?', a: `Helsingissä ilman kirkollisveroa veroa alkaa kertyä vasta, kun eläke ylittää noin ${FI.eur(KYNNYS)} vuodessa eli ${FI.eur(KYNNYS / 12)} kuukaudessa. Sen alapuolella eläketulovähennys ${FI.eur(ETV.taysi)} ja perusvähennys ${FI.eur(V.perusvahennys.enimmaismaara)} vievät verotettavan tulon nollaan. Raja on sama kaikissa Manner-Suomen kunnissa, koska valtion- ja kunnallisvero lasketaan samasta verotettavasta tulosta.` },
      { q: 'Miksi eläkkeestä menee enemmän veroa kuin samasta palkasta?', a: `Palkansaaja saa työtulovähennyksen, joka pienentää veroja enimmillään ${FI.eur(V.tyotulovahennys.enimmaismaara)}, eikä sitä myönnetä eläkkeelle. Palkasta pidätetään kyllä työeläke- ja työttömyysvakuutusmaksut, mutta ${FI.eur(PALKKA_VS)} vuosituloilla palkansaajalle jää Helsingissä silti ${FI.eur(Math.abs(ERO_VS))} ${ERO_VS > 0 ? 'enemmän' : 'vähemmän'} käteen kuin eläkkeensaajalle. Pienillä eläkkeillä tilanne kääntyy, koska eläketulovähennys on suurempi.` },
      { q: 'Pieneneekö eläketulovähennys, jos teen töitä eläkkeellä?', a: `Pienenee. Vähennyksen pienentäminen lasketaan koko puhtaasta ansiotulosta, johon kuuluvat sekä eläke että palkka. Jos eläke on ${FI.eur(15000)} ja palkkaa tulee ${FI.eur(10000)} vuodessa, vähennys lasketaan ${FI.eur(25000)} tulosta, ja se on ${FI.eur(elaketulovahennys(15000, 25000))} pelkän eläkkeen ${FI.eur(elv(15000))} sijaan. Palkasta saat toki työtulovähennyksen.` },
      { q: 'Kenen pitää maksaa eläketulon lisäveroa?', a: `Lisävero koskee eläkkeensaajia, joiden eläketulo eläketulovähennyksen jälkeen ylittää ${FI.eur(LV.raja)} vuodessa. Koska vähennys on loppunut jo noin ${FI.eur(NOLLA)} kohdalla, raja on käytännössä ${FI.eur(LV.raja / 12)} kuukausieläke. Veroa on ${FI.num(LV.prosentti, 2)} % ylittävästä osasta: ${FI.eur(70000)} vuosieläkkeestä se tekee ${FI.eur(vero(70000).elaketulonLisavero)}.` },
      { q: 'Peritäänkö eläkkeestä Yle-veroa ja sairaanhoitomaksua?', a: `Kyllä. Yle-vero on ${FI.num(V.yle.prosentti, 1)} % puhtaan ansiotulon ${FI.eur(V.yle.tuloraja)} ylittävästä osasta, enintään ${FI.eur(V.yle.enimmaismaara)} vuodessa, eli täysi määrä täyttyy jo melko pienellä eläkkeellä. Sairaanhoitomaksu on eläkkeestä ${FI.num(SHM, 2)} % kunnallisverotuksen verotettavasta tulosta, kun palkasta se on ${FI.num(V.sairaanhoitomaksu_palkka_prosentti, 2)} %. Päivärahamaksua eläkkeestä ei peritä.` },
      { q: 'Paljonko veroa menee 3 000 euron kuukausieläkkeestä?', a: `Helsingissä ilman kirkollisveroa ${FI.eur(3000)} kuukausieläkkeen veroprosentti on vuonna 2026 ${FI.num(N3000.veroprosentti, 1)}, ja nettoeläke on ${FI.eur(N3000.kkNetto)} kuukaudessa. Eläketulovähennystä jää tällä tasolla enää ${FI.eur(N3000.elaketulovahennys)} vuodessa, ja perusvähennys on kokonaan poistunut. Kirkon jäsenellä ja kalliimman veroprosentin kunnassa netto on pienempi.` },
    ],
    body: (h) => `
<h2>Verotus vaihe vaiheelta</h2>
<p>Verohallinnon ${h.src('vero_elake_paatos', 'päätös eläkkeen ennakonpidätyksestä vuodelle 2026')} ja ${h.src('finlex_tvl', 'tuloverolain')} 100 § määräävät järjestyksen. Laskuri käy sen läpi samassa järjestyksessä:</p>
<ol>
<li>Vuoden eläke on puhdas ansiotulo; tulonhankkimisvähennystä ei tehdä.</li>
<li>Eläketulovähennys: ${h.eur(ETV.taysi)}, josta vähennetään ${ETV.pienenemis_prosentti} % ${h.eur(ETV.taysi)} ylittävästä tulosta ja ${h.num(ETV.toinen_raja)} euron jälkeen ${h.num(ETV.toinen_pienenemis_prosentti, 1)} %. Vähennys on sama valtion- ja kunnallisverotuksessa.</li>
<li>Perusvähennys ${h.eur(V.perusvahennys.enimmaismaara)}, joka pienenee ${V.perusvahennys.pienenemisprosentti} prosentilla ylittävästä tulosta. Se tehdään viimeisenä, ja sen jälkeen jäävä tulo on verotettava tulo sekä valtiolle että kunnalle.</li>
<li>Valtion tulovero asteikolla, kunnallisvero, mahdollinen kirkollisvero ja sairaanhoitomaksu ${h.num(SHM, 2)} %.</li>
<li>Yle-vero ja tarvittaessa eläketulon lisävero ${h.num(LV.prosentti, 2)} %.</li>
</ol>
<p>Vähennykset pyöristetään sentteihin ennen veron laskemista. Pieni yksityiskohta ratkaisee, osuuko tulos Verohallinnon esimerkkeihin sentilleen.</p>
<p>Listasta puuttuu kaksi palkansaajalle tuttua asiaa. Työtulovähennystä ei tehdä, koska eläke ei ole työtuloa, eikä eläkkeestä peritä työeläkemaksua ${h.num(V.tyoelakemaksu_prosentti, 2)} %, työttömyysvakuutusmaksua ${h.num(V.tyottomyysvakuutusmaksu_prosentti, 2)} % eikä päivärahamaksua ${h.num(V.paivarahamaksu_prosentti, 2)} %. Eläkkeensaaja ei siis maksa uutta eläkettä itselleen, mutta ei myöskään saa palkansaajan suurinta verohelpotusta. Nämä kaksi erää selittävät lähes kaikki erot eläkkeen ja palkan verotuksen välillä.</p>
<h2>Verohallinnon esimerkit toistettuina</h2>
<p>Verohallinto julkaisee ${h.src('vero_esimerkit', 'esimerkkitaulukon')} eläkkeen veroista helsinkiläiselle kirkon jäsenelle, jolla ei ole muita tuloja. Laskurimme tulos on vieressä: ${OSUU}/${ESIM.length} riviä täsmää sentilleen.</p>
${h.table(['Eläke vuodessa', 'Vero, vero.fi', 'Vero, laskuri', 'Eläketulovähennys', 'Veroprosentti'], ESIM.map((e) => [h.eur(e.t), h.eur(e.v, 2), h.eur(e.oma.verot, 2), h.eur(e.oma.elaketulovahennys, 2), `${h.num(e.oma.veroprosentti, 1)} %`]), 'Helsinki, evankelis-luterilainen kirkko, vuosi 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Eläketulovähennys eri tulotasoilla</h2>
<p>Vähennys on suurimmillaan pienillä eläkkeillä ja sulaa pois kahdessa vaiheessa. Ensimmäisellä välillä jokainen lisäeuro vie vähennyksestä ${ETV.pienenemis_prosentti} senttiä, toisella välillä ${h.num(ETV.toinen_pienenemis_prosentti, 1)} senttiä. Rajan ${h.eur(ETV.toinen_raja)} kohdalla vähennystä on jäljellä ${h.eur(JALJELLA_RAJALLA, 2)}. Kun tämä summa jaetaan ${h.num(ETV.toinen_pienenemis_prosentti, 1)} prosentilla ja tulos lisätään rajaan, saadaan nollakohta, noin ${h.eur(NOLLA)}. Sitä suuremmasta eläkkeestä ei enää tehdä eläketulovähennystä lainkaan, eikä perusvähennystäkään, joka on hävinnyt jo paljon aiemmin. Kuukausieläkkeenä nollakohta on noin ${h.eur(NOLLA / 12)}, eli selvästi keskimääräistä eläkettä suurempi: valtaosa eläkkeensaajista hyötyy vähennyksestä ainakin jonkin verran.</p>
${h.table(['Vuosieläke', 'Eläketulovähennys', 'Vero Helsingissä', 'Nettoeläke kuukaudessa'], ELV_RIVIT.map((t) => [h.eur(t), h.eur(elv(t)), h.eur(vero(t).verot), h.eur(vero(t).netto / 12)]), 'Ei kirkon jäsen, vain eläketuloa', ['l', 'r', 'r', 'r'])}
<p>Vähennyksen pieneneminen nostaa marginaaliveroa. Kun vuosieläke on ${h.eur(30000)}, seuraavasta sadasta eurosta menee veroa ${h.num(marg(30000) * 100, 0)} euroa; ${h.eur(45000)} eläkkeellä jo ${h.num(marg(45000) * 100, 0)} euroa. Tämä kannattaa tietää, jos harkitsee työskentelyä eläkkeen ohessa tai ${h.a('elakkeen-lykkaaminen', 'eläkkeen lykkäämistä')}: lykkäyskorotus nostaa bruttoeläkettä, mutta nettona siitä jää käteen selvästi vähemmän, kun korotus osuu vähennyksen pienenemisvyöhykkeelle.</p>
<p>Suurilla eläkkeillä eläketulovähennystä ei enää ole, ja lisävero tulee mukaan. Verohallinnon suurimmassa esimerkissä vuosieläke on ${h.eur(SUURI.t)}, ja veroa kertyy ${h.eur(SUURI.oma.verot, 2)}, josta eläketulon lisäveroa on ${h.eur(SUURI.oma.elaketulonLisavero, 2)}. Lisävero lasketaan vain ${h.eur(LV.raja)} ylittävästä osasta, joten se ei tee koko eläkkeestä kalliimpaa, vaan nostaa ylimmän tulokerroksen marginaaliveroa ${h.num(LV.prosentti, 2)} prosenttiyksiköllä.</p>
<h2>${h.eur(2000)} kuukausieläke osiin purettuna</h2>
<p>Alla on yhden eläkkeensaajan koko vuoden laskelma. Vuosieläke on ${h.eur(N2000.tulo)}, kotikunta Helsinki eikä kirkollisveroa. Taulukosta näkee, että valtion vero on suurin yksittäinen erä, vaikka eläke on keskitasoa pienempi, ja että vähennykset pienentävät verotettavaa tuloa yli neljänneksellä.</p>
${h.table(['Erä', 'Euroa vuodessa'], [
  ['Eläke', h.eur(N2000.tulo)],
  ['Eläketulovähennys', h.eur(N2000.elaketulovahennys, 2)],
  ['Perusvähennys', h.eur(N2000.perusvahennys, 2)],
  ['Verotettava tulo', h.eur(N2000.verotettava, 2)],
  ['Valtion tulovero', h.eur(N2000.valtionvero, 2)],
  ['Kunnallisvero', h.eur(N2000.kunnallisvero, 2)],
  ['Sairaanhoitomaksu', h.eur(N2000.sairaanhoitomaksu, 2)],
  ['Yle-vero', h.eur(N2000.yle, 2)],
  ['Verot yhteensä', h.eur(N2000.verot, 2)],
], 'Helsinki, ei kirkon jäsen, vuoden 2026 perusteet', ['l', 'r'])}
<h2>Eläke ja palkka samalla bruttotulolla</h2>
<p>Palkansaajalta pidätetään työeläke-, työttömyysvakuutus- ja päivärahamaksu, joita eläkkeestä ei peritä. Toisaalta palkansaaja saa työtulovähennyksen ja pienemmän sairaanhoitomaksun. Lopputulos riippuu tulotasosta, kuten taulukko näyttää.</p>
${h.table(['Vuositulo', 'Eläke: käteen', 'Palkka: käteen', 'Ero'], VERTAILU.map((r) => [h.eur(r.t), h.eur(r.e.netto), h.eur(r.p.netto), h.eur(r.e.netto - r.p.netto)]), 'Helsinki, ei kirkon jäsen; palkansaaja työikäinen, ei matkakuluja', ['l', 'r', 'r', 'r'])}
<p>Positiivinen ero tarkoittaa, että eläkkeensaajalle jää enemmän. Pienillä tuloilla suuri eläketulovähennys painaa enemmän kuin työtulovähennys, mutta vähennyksen pienetessä tilanne kääntyy palkansaajan eduksi.</p>
<h2>Kunta ratkaisee loput</h2>
<p>Sama ${h.eur(2000)} kuukausieläke tuottaa Manner-Suomen kalleimmassa kunnassa (${KALLEIN.nimi}) nettona ${h.eur(NK.kkNetto)} ja edullisimmassa (${HALVIN.nimi}) ${h.eur(NH.kkNetto)}, koska kunnallisvero vaihtelee ${h.num(HALVIN.kunta, 2)} prosentista ${h.num(KALLEIN.kunta, 2)} prosenttiin. Eläkkeellä muuttaminen voi siis näkyä tilillä enemmän kuin moni eläkkeen korotus. Kaikkien kuntien prosentit ovat ${h.a('kuntavertailu', 'kuntavertailussa')}.</p>
<h2>Pienet eläkkeet ja Kelan eläkkeet</h2>
<p>Täysi kansaneläke on ${h.eur(P.elake.kansanelake.yksin_kk, 2)} kuukaudessa eli ${h.eur(P.elake.kansanelake.yksin_kk * 12)} vuodessa, mikä jää selvästi verottoman rajan ${h.eur(KYNNYS)} alle. Pienen työeläkkeen ja kansaneläkkeen yhdistelmä on siksi usein kokonaan veroton. Kelan eläkkeiden määrät näet sivulta ${h.a('takuuelake-laskuri', 'kansaneläke ja takuueläke')}. Sairaanhoitomaksun ja päivärahamaksun ero palkan ja eläkkeen välillä on selitetty sivulla ${h.a('sairausvakuutusmaksut', 'sairausvakuutusmaksut')}.</p>
<p>Tärkein yksittäinen luku on eläketulovähennyksen nollakohta, noin ${h.eur(NOLLA)} vuodessa. Sen yläpuolella eläke verotetaan lähes kuin palkka, mutta ilman työtulovähennystä ja korkeammalla sairaanhoitomaksulla. ${h.a('elakelaskuri', 'Eläkelaskuri')} laskee koko eläkkeen verot samoilla säännöillä.</p>`,
  },
  en: {
    slug: 'pension-tax',
    nav: 'Pension tax',
    card: 'Pension income deduction, health care contribution and surtax: what your Finnish pension leaves after tax in 2026.',
    title: `Pension Tax 2026: ${EN.eur(ETV.taysi)} Pension Income Deduction Explained`,
    description: `Pension tax 2026: the pension income deduction is up to ${EN.eur(ETV.taysi)}, health care contribution ${EN.num(SHM, 2)}%, and pensions above ${EN.eur(LV.raja)} a year pay a ${EN.num(LV.prosentti, 2)}% surtax.`,
    h1: 'How pensions are taxed in Finland',
    intro: 'Pensions are taxed as earned income, but with their own deduction and contribution rules. Here is what that means for your monthly amount.',
    resume: `A pension of ${EN.eur(2000)} a month in Helsinki, with no church membership, carries ${EN.eur(N2000.kkVerot)} of tax a month in 2026, leaving ${EN.eur(N2000.kkNetto)} net at a withholding rate of ${EN.num(N2000.veroprosentti, 1)}%. Finland taxes pensions as earned income, but three things differ from a salary. First, pensioners get the pension income deduction (eläketulovähennys) of up to ${EN.eur(ETV.taysi)} a year. It shrinks by ${ETV.pienenemis_prosentti}% of net earned income above ${EN.eur(ETV.taysi)} and by ${EN.num(ETV.toinen_pienenemis_prosentti, 1)}% of income above ${EN.eur(ETV.toinen_raja)}, so it disappears at about ${EN.eur(NOLLA)}. Second, there is no earned income tax credit and no pension, unemployment or daily allowance contribution on a pension, while the health care contribution is ${EN.num(SHM, 2)}% rather than the ${EN.num(V.sairaanhoitomaksu_palkka_prosentti, 2)}% applied to wages. Third, pension income above ${EN.eur(LV.raja)} after the deduction carries a ${EN.num(LV.prosentti, 2)}% surtax. Our engine reproduces all ${ESIM.length} official Vero examples to the cent.`,
    faqs: [
      { q: 'At what amount does a Finnish pension start to be taxed?', a: `In Helsinki without church tax, the first euro of tax appears once the pension passes about ${EN.eur(KYNNYS)} a year, ${EN.eur(KYNNYS / 12)} a month. Below that, the pension income deduction and the ${EN.eur(V.perusvahennys.enimmaismaara)} basic deduction wipe out taxable income completely. The threshold is the same in every mainland municipality, because state and municipal tax share the same taxable base.` },
      { q: 'Is a pension taxed more heavily than a salary of the same size?', a: `Usually, yes, except for small pensions. Pensions get no earned income tax credit, worth up to ${EN.eur(V.tyotulovahennys.enimmaismaara)} for employees. At ${EN.eur(PALKKA_VS)} a year in Helsinki, an employee keeps ${EN.eur(Math.abs(ERO_VS))} ${ERO_VS > 0 ? 'more' : 'less'} than a pensioner even after paying pension and unemployment contributions. Lower down, the large pension income deduction tips the balance the other way.` },
      { q: 'Does working while retired reduce my pension income deduction?', a: `Yes. The reduction is based on your total net earned income, salary included. With ${EN.eur(15000)} of pension and ${EN.eur(10000)} of wages, the deduction is calculated on ${EN.eur(25000)} and comes to ${EN.eur(elaketulovahennys(15000, 25000))}, compared with ${EN.eur(elv(15000))} on the pension alone. The wages themselves do qualify for the earned income tax credit.` },
      { q: 'Who pays the Finnish pension income surtax?', a: `Anyone whose pension income, after the pension income deduction, exceeds ${EN.eur(LV.raja)} a year. Since the deduction has already run out at about ${EN.eur(NOLLA)}, that means a pension above ${EN.eur(LV.raja / 12)} a month. The surtax is ${EN.num(LV.prosentti, 2)}% of the excess; on ${EN.eur(70000)} a year it adds ${EN.eur(vero(70000).elaketulonLisavero)}.` },
      { q: 'How much tax will I pay on a €3,000 monthly pension in Finland?', a: `In Helsinki without church tax, a ${EN.eur(3000)} monthly pension has a withholding rate of ${EN.num(N3000.veroprosentti, 1)}% in 2026 and leaves ${EN.eur(N3000.kkNetto)} a month net. At this level only ${EN.eur(N3000.elaketulovahennys)} of pension income deduction is left and the basic deduction is gone entirely. Church membership or a higher-tax municipality lowers the net figure.` },
    ],
    body: (h) => `
<h2>The calculation, step by step</h2>
<p>The order comes from Vero’s ${h.src('vero_elake_paatos', '2026 withholding decision for pensions')} and section 100 of the ${h.src('finlex_tvl', 'Income Tax Act')}:</p>
<ol>
<li>The year’s pension is net earned income as it stands; there is no work-expense deduction.</li>
<li>Pension income deduction: ${h.eur(ETV.taysi)}, minus ${ETV.pienenemis_prosentti}% of income above ${h.eur(ETV.taysi)} and ${h.num(ETV.toinen_pienenemis_prosentti, 1)}% above ${h.eur(ETV.toinen_raja)}. One deduction serves both state and municipal tax.</li>
<li>Basic deduction (perusvähennys) of ${h.eur(V.perusvahennys.enimmaismaara)}, reduced by ${V.perusvahennys.pienenemisprosentti}% of income above that amount, applied last. What remains is taxable for both state and municipality.</li>
<li>State income tax on the progressive scale, municipal tax, church tax if you belong, and the ${h.num(SHM, 2)}% health care contribution.</li>
<li>Yle tax and, for large pensions, the ${h.num(LV.prosentti, 2)}% surtax.</li>
</ol>
<p>Each deduction is rounded to the cent before tax is applied, which is what makes the results match Vero’s published figures exactly.</p>
<h2>Vero’s own examples, side by side</h2>
<p>Vero publishes ${h.src('vero_esimerkit', 'example tax amounts')} for a Helsinki resident who belongs to the Lutheran church and has only pension income. ${OSUU} of ${ESIM.length} rows match our engine to the cent.</p>
${h.table(['Annual pension', 'Tax per vero.fi', 'Tax per our engine', 'Pension income deduction', 'Withholding rate'], ESIM.map((e) => [h.eur(e.t), h.eur(e.v, 2), h.eur(e.oma.verot, 2), h.eur(e.oma.elaketulovahennys, 2), `${h.num(e.oma.veroprosentti, 1)}%`]), 'Helsinki, Lutheran church member, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Where the deduction runs out</h2>
<p>The deduction melts away in two phases. Between ${h.eur(ETV.taysi)} and ${h.eur(ETV.toinen_raja)} each extra euro removes ${ETV.pienenemis_prosentti} cents of it; above that, ${h.num(ETV.toinen_pienenemis_prosentti, 1)} cents. At ${h.eur(ETV.toinen_raja)} exactly ${h.eur(JALJELLA_RAJALLA, 2)} is left; divide that by ${h.num(ETV.toinen_pienenemis_prosentti, 1)}% and add it to the threshold to find the zero point, about ${h.eur(NOLLA)} a year or ${h.eur(NOLLA / 12)} a month. That is well above the average pension, so most pensioners get at least part of the deduction.</p>
${h.table(['Annual pension', 'Deduction', 'Tax in Helsinki', 'Net per month'], ELV_RIVIT.map((t) => [h.eur(t), h.eur(elv(t)), h.eur(vero(t).verot), h.eur(vero(t).netto / 12)]), 'No church tax, pension income only', ['l', 'r', 'r', 'r'])}
<p>That phase-out raises the marginal rate. At ${h.eur(30000)} a year, the next ${h.eur(100)} of pension costs ${h.eur(marg(30000) * 100)} in tax; at ${h.eur(45000)}, ${h.eur(marg(45000) * 100)}. Worth knowing before you add part-time pay on top of a pension or defer to get a bigger one.</p>
<h2>A ${h.eur(2000)} monthly pension, line by line</h2>
<p>Here is a full year for one pensioner: ${h.eur(N2000.tulo)} of pension, living in Helsinki, no church tax. The deductions cut taxable income by more than a quarter, and state income tax is still the largest single item.</p>
${h.table(['Item', 'Euros per year'], [
  ['Pension', h.eur(N2000.tulo)],
  ['Pension income deduction', h.eur(N2000.elaketulovahennys, 2)],
  ['Basic deduction', h.eur(N2000.perusvahennys, 2)],
  ['Taxable income', h.eur(N2000.verotettava, 2)],
  ['State income tax', h.eur(N2000.valtionvero, 2)],
  ['Municipal tax', h.eur(N2000.kunnallisvero, 2)],
  ['Health care contribution', h.eur(N2000.sairaanhoitomaksu, 2)],
  ['Yle tax', h.eur(N2000.yle, 2)],
  ['Total tax', h.eur(N2000.verot, 2)],
], 'Helsinki, no church tax, 2026 rules', ['l', 'r'])}
<h2>Pension versus salary at the same gross</h2>
<p>Employees pay pension, unemployment and daily allowance contributions that pensioners do not, but they also get the earned income tax credit and a lower health care contribution. Which side comes out ahead depends on income.</p>
${h.table(['Annual income', 'Pension: net', 'Salary: net', 'Difference'], VERTAILU.map((r) => [h.eur(r.t), h.eur(r.e.netto), h.eur(r.p.netto), h.eur(r.e.netto - r.p.netto)]), 'Helsinki, no church tax; working-age employee, no commuting costs', ['l', 'r', 'r', 'r'])}
<p>A positive difference means the pensioner keeps more. At low incomes the large pension income deduction outweighs the employee’s credit; as it phases out, the balance swings towards the salary.</p>
<h2>Your municipality still matters</h2>
<p>The same ${h.eur(2000)} monthly pension nets ${h.eur(NK.kkNetto)} in ${KALLEIN.nimi} and ${h.eur(NH.kkNetto)} in ${HALVIN.nimi}, because municipal tax runs from ${h.num(HALVIN.kunta, 2)}% to ${h.num(KALLEIN.kunta, 2)}%. Compare all of them in the ${h.a('kuntavertailu', 'municipal tax table')}. The difference between wage and pension contributions is covered under ${h.a('sairausvakuutusmaksut', 'health insurance contributions')}.</p>
<h2>Small pensions</h2>
<p>A full Kela national pension (kansaneläke) is ${h.eur(P.elake.kansanelake.yksin_kk, 2)} a month, ${h.eur(P.elake.kansanelake.yksin_kk * 12)} a year, well under the ${h.eur(KYNNYS)} tax-free threshold, so a small earnings-related pension combined with it often attracts no tax at all; see ${h.a('takuuelake-laskuri', 'national and guarantee pension')}. The number to remember is the point where the pension income deduction hits zero, about ${h.eur(NOLLA)} a year. Above it, a pension is taxed like a salary without the earned income credit. The ${h.a('elakelaskuri', 'pension calculator')} applies these rules to your whole pension.</p>`,
  },
});
