import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { kunta } from '../../lib/engine/params';

const V = P.vero;
const LA = V.lisaprosenttiasteikko;
const ALIN = LA[0].prosentti, YLIN = LA[LA.length - 1].prosentti;
const TRE = kunta('Tampere');
const MAX = V.ennakonpidatys_enimmais_prosentti;

/** Pidätys vuodessa: perusprosentti tulorajaan asti, lisäprosentti ylittävään osaan. */
const pidatys = (raja: number, tulo: number) => {
  const r = laskeVerot({ tulo: raja, kunta: 'Tampere' });
  const lp = lisaprosentti(r);
  const pid = Math.min(raja, tulo) * r.veroprosentti / 100 + Math.max(0, tulo - raja) * lp / 100;
  const lopullinen = laskeVerot({ tulo, kunta: 'Tampere' }).verot;
  return { r, lp, pid, lopullinen, ero: pid - lopullinen };
};

// Pääesimerkki: tuloraja 36 000 €, todellinen palkka 40 000 € (minilaskurin oletus).
const A = pidatys(36000, 40000);
const ASTE = [...LA].reverse().find((x) => A.r.verotettava > x.alaraja) ?? LA[0];
// Kolme ylitystilannetta.
const TAP = [
  { raja: 36000, tulo: 40000 },
  { raja: 30000, tulo: 60000 },
  { raja: V.oletuspalkkatulo['21_65'], tulo: 60000 },
].map((x) => ({ ...x, ...pidatys(x.raja, x.tulo) }));
const OL = TAP[2];
const SARJA = [25000, 45000, 55000, 70000].map((t) => { const r = laskeVerot({ tulo: t, kunta: 'Tampere' }); return { t, vp: r.veroprosentti, lp: lisaprosentti(r) }; });
const AK = laskeVerot({ tulo: 36000, kunta: 'Tampere', kirkko: 'evl' });
const LAK = lisaprosentti(AK, 'evl');

// Kuukausittainen kertymä: 3 000 € kuukausipalkka ja lomaraha kesäkuussa, tuloraja 12 × palkka.
const KK = 3000;
const LR = KK * P.vuosiloma.lomaraha_esimerkki_prosentti / 100;
const KRAJA = KK * 12;
const KR = laskeVerot({ tulo: KRAJA, kunta: 'Tampere' });
const KLP = lisaprosentti(KR);
const KUUT = ['tammikuu', 'helmikuu', 'maaliskuu', 'huhtikuu', 'toukokuu', 'kesäkuu', 'heinäkuu', 'elokuu', 'syyskuu', 'lokakuu', 'marraskuu', 'joulukuu'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const KESAKUU = 5;
const YLITYSKK = (() => { let c = 0; for (let m = 0; m < 12; m++) { c += KK + (m === KESAKUU ? LR : 0); if (c > KRAJA) return m; } return 11; })();
const KYLI = KK * 12 + LR - KRAJA;
const KLISA = KYLI * (KLP - KR.veroprosentti) / 100;

export default definePage({
  id: 'tuloraja',
  group: 'vero',
  order: 20,
  mini: 'lisaprosentti',
  related: ['verokortti', 'muutosverokortti', 'veroprosenttilaskuri', 'veronpalautus'],
  sources: ['vero_ennakonpidatys', 'vero_veroperusteet'],
  fi: {
    slug: 'tuloraja-ja-lisaprosentti',
    nav: 'Tuloraja ja lisäprosentti',
    card: 'Mitä tapahtuu, kun vuoden palkat ylittävät verokortin tulorajan, ja milloin lisäprosentti jättää jäännösveroa.',
    title: 'Tuloraja ja lisäprosentti 2026: kun verokortin raja ylittyy',
    description: `Tuloraja ja lisäprosentti 2026: tulorajan ylittävästä palkasta pidätetään lisäprosentti, jonka asteikko on ${FI.num(ALIN, 2)}–${FI.num(YLIN)} % plus kunnallisvero. Laskuesimerkit.`,
    h1: 'Tuloraja ylittyy: näin lisäprosentti toimii',
    intro: 'Verokortin tuloraja on vuoden palkkasumma, jonka jälkeen pidätys vaihtuu lisäprosenttiin. Katso, paljonko se maksaa ja milloin korttia kannattaa muuttaa.',
    resume: `Kun vuoden 2026 palkat ylittävät verokortin tulorajan, työnantaja pidättää ylittävästä osasta lisäprosentin, ei veroprosenttia. Tamperelaisella, jonka tuloraja on ${FI.eur(36000)} ja veroprosentti ${FI.num(A.r.veroprosentti, 1)} %, lisäprosentti on ${FI.num(A.lp, 1)} %: jos palkkaa kertyykin ${FI.eur(40000)}, ylimenevistä ${FI.eur(4000)} euroista pidätetään ${FI.eur(4000 * A.lp / 100)}. Koko vuoden pidätys on silloin ${FI.eur(A.pid)}, kun lopullinen vero on ${FI.eur(A.lopullinen)}, joten ${A.ero >= 0 ? `noin ${FI.eur(A.ero)} palautuu verotuksessa` : `noin ${FI.eur(-A.ero)} jää jäännösveroksi`}. Lisäprosentti lasketaan Verohallinnon omasta asteikosta, jossa valtion osuus on verotettavan tulon mukaan ${FI.num(ALIN, 2)}–${FI.num(YLIN, 2)} %, ja siihen lisätään kunnallisvero, kirkollisvero sekä sairaanhoito- ja päivärahamaksu. Tulos pyöristetään puolen prosenttiyksikön tarkkuudella, ja se on aina vähintään kaksi prosenttiyksikköä veroprosenttia suurempi, enintään ${FI.num(MAX)} %. Pieni ylitys ei siis yleensä vaadi uutta verokorttia, mutta jos raja on asetettu paljon todellista palkkaa alemmas, kortti kannattaa muuttaa.`,
    faqs: [
      { q: 'Mitä tapahtuu, kun verokortin tuloraja ylittyy?', a: `Mitään ilmoitusta ei tule: työnantaja vain vaihtaa pidätyksen lisäprosenttiin siitä palkanmaksusta alkaen, jolla vuoden palkkasumma menee rajan yli. Tampereella ${FI.eur(36000)} tulorajalla se tarkoittaa ${FI.num(A.lp, 1)} % ylimenevästä osasta. Perusprosentti ei muutu, ja jo maksetut palkat jäävät ennalleen. Uuden vuoden kortissa raja alkaa taas nollasta.` },
      { q: 'Pitääkö uusi verokortti tilata, jos tuloraja ylittyy?', a: `Ei välttämättä. Jos ylitys on pieni, lisäprosentti pidättää yleensä hieman liikaa, ja ero palautuu: ${FI.eur(4000)} ylityksellä Tampereella noin ${FI.eur(Math.abs(A.ero))}. Uusi kortti on paikallaan, kun ylitys on suuri tai raja on oletustulon tasolla, koska silloin lisäprosentti voi jäädä liian pieneksi ja tuloksena on jäännösvero.` },
      { q: 'Miksi lisäprosentti on niin paljon suurempi kuin veroprosentti?', a: `Veroprosentti on keskimääräinen vero koko vuoden tulosta, ja vähennykset painavat sitä alas. Lisäprosentti kuvaa sitä, mitä viimeisistä euroista menee: valtion osuus otetaan asteikolta, jonka välit ovat ${FI.num(ALIN, 2)}–${FI.num(YLIN, 2)} %, ja päälle tulee kunnallisvero ja maksut ilman vähennyksiä. Siksi ${FI.num(A.r.veroprosentti, 1)} % kortin rinnalla voi olla ${FI.num(A.lp, 1)} % lisäprosentti.` },
      { q: 'Saanko lisäprosentilla liikaa pidätetyn veron takaisin?', a: `Saat. Lisäprosentti on vain ennakonpidätys, ja lopullinen vero lasketaan verotuksessa koko vuoden todellisista tuloista. Jos pidätyksiä kertyi enemmän kuin vero, erotus maksetaan veronpalautuksena; jos vähemmän, se peritään jäännösverona. Esimerkiksi ${FI.eur(36000)} rajalla ja ${FI.eur(40000)} palkalla Tampereella pidätys on ${FI.eur(A.pid)} ja vero ${FI.eur(A.lopullinen)}.` },
      { q: 'Kuuluuko kirkollisvero lisäprosenttiin?', a: `Kuuluu, jos olet seurakunnan jäsen. Päätöksen mukaan asteikon prosenttiin lisätään kunnan ja seurakunnan tuloveroprosentti. Tampereella evankelisluterilaisen ${FI.eur(36000)} kortin veroprosentti on ${FI.num(AK.veroprosentti, 1)} % ja lisäprosentti ${FI.num(LAK, 1)} %, kun kirkkoon kuulumattomalla ne ovat ${FI.num(A.r.veroprosentti, 1)} % ja ${FI.num(A.lp, 1)} %. Sairaanhoito- ja päivärahamaksu lisätään vain, jos niitä tuloistasi lasketaan.` },
      { q: 'Lasketaanko tulorajaan bruttopalkka vai nettopalkka?', a: `Bruttopalkka. Tulorajaan kertyy ennakonpidätyksen alainen palkka ennen veroja ja työntekijän maksuja, ja mukaan luetaan luontoisedut ja lomaraha. Jos kuukausipalkkasi on ${FI.eur(KK)} ja käteen jää selvästi vähemmän, tulorajan pitää silti olla vähintään ${FI.eur(KRAJA)} plus lomaraha. Nettopalkan perusteella arvioitu raja ylittyy jo syksyllä, ja loppuvuosi pidätetään lisäprosentilla.` },
      { q: 'Mikä tuloraja ilmoitetaan, kun aloitan työt kesken vuoden?', a: `Tuloraja kattaa koko kalenterivuoden, ei vain uuden työsuhteen kuukausia. Ilmoita siis kaikki vuonna 2026 saadut ja vielä saatavat palkat ja etuudet yhteensä, myös ennen aloitusta maksetut. Jos ilmoitat vain uuden työn palkan, aiemmat tulot syövät rajasta osan, ja raja ylittyy loppuvuodesta. Esimerkiksi Tampereella ${FI.eur(36000)} rajan lisäprosentti on ${FI.num(A.lp, 1)} %.` },
    ],
    body: (h) => `
<h2>Ylitys pidätetään eri prosentilla</h2>
<p>Tuloraja ei ole katto vaan vaihtopiste. Työnantaja laskee vuoden alusta kertynyttä palkkaa ja käyttää veroprosenttia, kunnes summa saavuttaa kortin rajan. Sen palkanmaksun kohdalla, jolla raja ylittyy, palkka jaetaan kahteen osaan: rajaan asti perusprosentti, yli menevästä lisäprosentti. Siitä eteenpäin koko loppuvuoden palkat pidätetään lisäprosentilla. Tuloraja koskee koko kalenterivuotta, joten tammikuun alussa laskuri alkaa alusta uuden kortin mukaan.</p>

<h2>Miten lisäprosentti lasketaan</h2>
<p>Lisäprosentin pohja on Verohallinnon päätöksen erillinen asteikko. Siitä valitaan väli, joka vastaa tulorajan mukaista verotettavaa tuloa, ja välin prosenttiin lisätään kotikunnan tuloveroprosentti, seurakunnan prosentti jäsenille sekä sairaanhoitomaksu ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)} % ja päivärahamaksu ${h.num(V.paivarahamaksu_prosentti, 2)} %, jos niitä tuloista lasketaan.</p>
${h.table(['Verotettava tulo vähintään', 'Asteikon prosentti'],
  LA.map((x, i) => [i === 0 ? h.eur(0) : h.eur(x.alaraja), `${h.num(x.prosentti, 2)} %`]),
  'Valtionverotuksen lisäprosenttiasteikko 2026 (ennen kunnan ja seurakunnan prosenttia)', ['l', 'r'])}
<p>Esimerkiksi tamperelaisen ${h.eur(36000)} tulorajan verotettava tulo on ${h.eur(A.r.verotettava)}, joten asteikolta tulee ${h.num(ASTE.prosentti, 2)} %. Siihen lisätään Tampereen kunnallisvero ${h.num(TRE.kunta, 2)} %, sairaanhoitomaksu ja päivärahamaksu, ja summa pyöristetään puolen prosenttiyksikön tarkkuudella ${h.num(A.lp, 1)} prosenttiin. Lopuksi tarkistetaan sääntö, jonka mukaan lisäprosentti on vähintään kaksi prosenttiyksikköä perusprosenttia korkeampi. Ahvenanmaalla asteikon prosentteja alennetaan ${h.num(V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa, 2)} prosenttiyksiköllä samaan tapaan kuin valtion verossa.</p>

<p>Koska asteikon väli valitaan tulorajan perusteella, lisäprosentti nousee rajan mukana portaittain. Tampereella kirkkoon kuulumattoman ${h.eur(SARJA[0].t)} kortin lisäprosentti on ${h.num(SARJA[0].lp, 1)} %, ${h.eur(SARJA[1].t)} kortin ${h.num(SARJA[1].lp, 1)} %, ${h.eur(SARJA[2].t)} kortin ${h.num(SARJA[2].lp, 1)} % ja ${h.eur(SARJA[3].t)} kortin ${h.num(SARJA[3].lp, 1)} %. Veroprosentit ovat samoilla tuloilla ${SARJA.map((x) => h.num(x.vp, 1)).join(', ')} %. Ero kertoo, kuinka paljon jyrkemmin viimeisiä euroja verotetaan kuin tuloa keskimäärin. Pienituloisella väli on suurin, koska perus- ja työtulovähennys painavat keskimääräisen veron lähelle nollaa, mutta vähennykset eivät enää kasva, kun tulo nousee.</p>

<h2>Kolme ylitystä, kolme lopputulosta</h2>
<p>Lisäprosentti on suunniteltu niin, että pienet ylitykset pidätetään mieluummin yläkanttiin. Kun raja on kaukana todellisesta tulosta, tulos voi kääntyä toisin päin. Taulukossa on kirkkoon kuulumaton tamperelainen kolmella eri kortilla.</p>
${h.table(['Tuloraja', 'Todellinen palkka', 'Prosentit', 'Pidätys', 'Lopullinen vero', 'Ero'],
  TAP.map((x) => [h.eur(x.raja), h.eur(x.tulo), `${h.num(x.r.veroprosentti, 1)} / ${h.num(x.lp, 1)} %`, h.eur(x.pid), h.eur(x.lopullinen), `${x.ero >= 0 ? 'palautus' : 'jäännösvero'} ${h.eur(Math.abs(x.ero))}`]),
  'Veroprosentti / lisäprosentti, Tampere, vuoden 2026 perusteet', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Kahdessa ensimmäisessä tapauksessa raja on arvioitu liian matalaksi, mutta lisäprosentti on niin korkea, että vuoden pidätys riittää. Kolmas rivi on oletusverokortti: raja on ${h.eur(OL.raja)}, ja sen pohjalta laskettu lisäprosentti ${h.num(OL.lp, 1)} % on liian pieni ${h.eur(OL.tulo)} vuosipalkalle, jonka viimeisiä euroja verotetaan paljon kovemmin. ${OL.ero < 0 ? `Vajaus ${h.eur(-OL.ero)} tulee maksettavaksi jäännösverona seuraavana vuonna.` : `Ero ${h.eur(OL.ero)} palautuu.`} Tilanteeseen joutuu helposti ensimmäisenä Suomen-vuonna, kun kortti on laskettu oletustulolle eikä kukaan ole päivittänyt sitä.</p>

<h2>Kuukausi kuukaudelta: lomaraha vie yli</h2>
<p>Tavallisin tapa ylittää raja on huomaamaton. Kuukausipalkka on ${h.eur(KK)}, ja tulorajaksi on ilmoitettu ${h.eur(KRAJA)} eli kaksitoista kuukausipalkkaa. Kesäkuussa maksetaan lomaraha, esimerkiksi ${h.num(P.vuosiloma.lomaraha_esimerkki_prosentti)} % kuukausipalkasta eli ${h.eur(LR)}. Sen jälkeen kertymä on koko ajan lomarahan verran edellä, ja raja ylittyy ${KUUT[YLITYSKK]}n palkassa. Ylittävä osa, ${h.eur(KYLI)}, pidätetään ${h.num(KLP, 1)} prosentilla perusprosentin ${h.num(KR.veroprosentti, 1)} sijaan, mikä vie palkasta ${h.eur(KLISA)} enemmän kuin oikealla rajalla. Summa palautuu verotuksessa, mutta joulukuun nettopalkka on pienempi kuin muina kuukausina. Kun tulorajaan lisää lomarahan ja mahdolliset luontoisedut heti kortin tilausvaiheessa, tätä ei tapahdu.</p>
<p>Sama kortti ilmoitetaan myös etuuksien maksajille, joten tuloraja kattaa palkan lisäksi ennakonpidätyksen alaiset etuudet. Jos vuoteen mahtuu työttömyysjakso tai vanhempainvapaa, palkka ja etuus kerryttävät samaa rajaa.</p>

<h2>Uusi kortti vai ei?</h2>
<ul>
<li><strong>Ylitys on muutama tuhat euroa</strong> ja kortti perustuu omaan arvioosi: anna lisäprosentin hoitaa asia. Ero tasaantuu verotuksessa, yleensä palautuksena.</li>
<li><strong>Kortti on oletustulolle</strong> tai raja on alle puolet todellisesta palkasta: tilaa ${h.a('muutosverokortti', 'muutosverokortti')}, jotta loppuvuoden pidätys vastaa veroa.</li>
<li><strong>Tiedät jo alkuvuonna palkankorotuksesta, lomarahasta tai bonuksesta</strong>: nosta rajaa heti, niin perusprosentti pysyy oikeana eikä lisäprosenttia tarvita.</li>
</ul>
<p>Rajan nostaminen muuttaa yleensä myös veroprosenttia, koska suurempi tulo nostaa keskimääräistä veroa. Uuden prosentin ja rajan voi laskea ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurilla')}, ja koko kortin rakenne on selitetty sivulla ${h.a('verokortti', 'verokortti')}. Jos pidätys jää vajaaksi, ${h.a('veronpalautus', 'jäännösvero')} erääntyy seuraavan vuoden puolella.</p>
<p>Lähteet: ${h.src('vero_ennakonpidatys')}; ${h.src('vero_veroperusteet')}.</p>`,
  },
  en: {
    slug: 'income-limit-additional-rate',
    nav: 'Income limit and additional rate',
    card: 'What happens once your pay passes the income limit on your tax card, and when the additional rate leaves you owing tax.',
    title: 'Income Limit and Additional Rate 2026: Going Over the Limit',
    description: `Income limit 2026: once your pay passes the limit on your Finnish tax card, the excess is withheld at the additional rate, ${EN.num(ALIN, 2)}% to ${EN.num(YLIN)}% plus local tax.`,
    h1: 'Going over your income limit: how the additional rate works',
    intro: 'The income limit (tuloraja) is the annual pay total after which withholding switches to the additional rate (lisäprosentti). Here is what that costs and when to change your card.',
    resume: `When your 2026 pay passes the income limit (tuloraja) printed on your tax card, your employer withholds the excess at the additional rate (lisäprosentti), not the base rate. A Tampere resident with a ${EN.eur(36000)} limit and a ${EN.num(A.r.veroprosentti, 1)}% base rate has an additional rate of ${EN.num(A.lp, 1)}%: if pay actually reaches ${EN.eur(40000)}, the extra ${EN.eur(4000)} is withheld at ${EN.eur(4000 * A.lp / 100)}. Total withholding for the year comes to ${EN.eur(A.pid)} against a final tax of ${EN.eur(A.lopullinen)}, so ${A.ero >= 0 ? `about ${EN.eur(A.ero)} comes back as a refund` : `about ${EN.eur(-A.ero)} is owed as residual tax`}. The additional rate starts from a separate Vero scale running from ${EN.num(ALIN, 2)}% to ${EN.num(YLIN, 2)}% depending on taxable income, then adds municipal tax, church tax for members and the health insurance contributions. It is rounded to the half point, always sits at least two points above the base rate and never tops ${EN.num(MAX)}%. A small overshoot rarely needs a new card; a limit set far below your real pay usually does.`,
    faqs: [
      { q: 'What happens when I go over the income limit on my tax card?', a: `Nothing is sent to you. Payroll simply switches to the additional rate from the payment that takes your cumulative pay past the limit. With a ${EN.eur(36000)} limit in Tampere that means ${EN.num(A.lp, 1)}% on everything above it for the rest of the year. Earlier payslips are not reworked, and the count restarts with the next year’s card.` },
      { q: 'Should I order a new tax card after exceeding the income limit?', a: `Not necessarily. On a modest overshoot the additional rate tends to withhold a little too much, and the difference is refunded: about ${EN.eur(Math.abs(A.ero))} on a ${EN.eur(4000)} overshoot in Tampere. Order a revised card if you are on the ${EN.eur(OL.raja)} default limit or far above your limit, because then the additional rate can fall short and leave residual tax.` },
      { q: 'Why is the additional rate so much higher than my base rate?', a: `The base rate is your average tax over the whole year, pulled down by deductions. The additional rate approximates the tax on your last euros: the state element comes from a scale of ${EN.num(ALIN, 2)}% to ${EN.num(YLIN, 2)}%, and municipal tax and contributions are added with no deductions. That is how a ${EN.num(A.r.veroprosentti, 1)}% card can carry a ${EN.num(A.lp, 1)}% additional rate.` },
      { q: 'Is tax withheld at the additional rate refunded if it was too much?', a: `Yes. The additional rate is only a prepayment; your actual tax is fixed in the annual assessment on your real income for the year. Any surplus withheld comes back as a refund, any shortfall is collected as residual tax. With a ${EN.eur(36000)} limit and ${EN.eur(40000)} of pay in Tampere, ${EN.eur(A.pid)} is withheld against tax of ${EN.eur(A.lopullinen)}.` },
    ],
    body: (h) => `
<h2>A switch point, not a ceiling</h2>
<p>Newcomers often read the income limit as the most they are allowed to earn. It is nothing of the kind. Payroll tracks your cumulative gross pay from 1 January and applies the base rate until that running total reaches the limit. The payment that crosses it is split: the part up to the limit at the base rate, the part above at the additional rate. Every later payment that year is withheld at the additional rate in full. Because the limit covers the calendar year, the counter resets with your new card in January.</p>

<h2>How Vero builds the additional rate</h2>
<p>Vero’s withholding decision contains its own additional-rate scale. The bracket matching the taxable income behind your limit gives the state element; Vero then adds your municipal rate, your parish rate if you belong to the church, the health care contribution (${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)}%) and the daily allowance contribution (${h.num(V.paivarahamaksu_prosentti, 2)}%) where those apply to your income.</p>
${h.table(['Taxable income from', 'Scale rate'],
  LA.map((x, i) => [i === 0 ? h.eur(0) : h.eur(x.alaraja), `${h.num(x.prosentti, 2)}%`]),
  '2026 state additional-rate scale, before municipal and parish rates', ['l', 'r'])}
<p>Take the ${h.eur(36000)} limit in Tampere. Taxable income at that level is ${h.eur(A.r.verotettava)}, which lands in the ${h.num(ASTE.prosentti, 2)}% bracket. Add Tampere’s ${h.num(TRE.kunta, 2)}% municipal rate and the two contributions, round to the half point, and the card shows ${h.num(A.lp, 1)}%. A final check ensures the result is at least two points above the base rate. On the Åland Islands the scale is lowered by ${h.num(V.ahvenanmaa_asteikon_alennus_prosenttiyksikkoa, 2)} points, mirroring the state tax reduction there.</p>

<p>Because the bracket is picked from your limit, the additional rate climbs in steps as the limit rises. For a Tampere employee outside the church it is ${h.num(SARJA[0].lp, 1)}% on a ${h.eur(SARJA[0].t)} card and ${h.num(SARJA[3].lp, 1)}% on a ${h.eur(SARJA[3].t)} card, while the base rates are ${h.num(SARJA[0].vp, 1)}% and ${h.num(SARJA[3].vp, 1)}%. The gap is widest for low earners, whose deductions push average tax close to zero but stop growing once income rises.</p>

<h2>Three overshoots compared</h2>
<p>The design leans towards over-withholding when you slip slightly past the limit. When the limit is far from reality, the outcome can flip. The table shows a Tampere employee outside the church on three different cards.</p>
${h.table(['Limit', 'Actual pay', 'Rates', 'Withheld', 'Final tax', 'Difference'],
  TAP.map((x) => [h.eur(x.raja), h.eur(x.tulo), `${h.num(x.r.veroprosentti, 1)} / ${h.num(x.lp, 1)}%`, h.eur(x.pid), h.eur(x.lopullinen), `${x.ero >= 0 ? 'refund' : 'owed'} ${h.eur(Math.abs(x.ero))}`]),
  'Base rate / additional rate, Tampere, 2026 rules', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>In the first two rows the limit is too low, but the additional rate is high enough to cover the year. The third row is the default card that many people get on arrival: a ${h.eur(OL.raja)} limit whose additional rate of ${h.num(OL.lp, 1)}% was set for a low income. On a ${h.eur(OL.tulo)} salary, where the top euros are taxed far more heavily, ${OL.ero < 0 ? `withholding falls ${h.eur(-OL.ero)} short and that amount arrives as residual tax the following year` : `the difference of ${h.eur(OL.ero)} is refunded`}. If you are on that card, fix it now rather than at assessment time.</p>

<h2>Month by month: the holiday bonus tips you over</h2>
<p>Most people cross the limit without noticing. Say you earn ${h.eur(KK)} a month and gave twelve months of pay, ${h.eur(KRAJA)}, as your limit. In June the holiday bonus (lomaraha) arrives, for instance ${h.num(P.vuosiloma.lomaraha_esimerkki_prosentti)}% of monthly pay, or ${h.eur(LR)}. Your running total is now ahead of plan, and the limit is crossed with the ${MONTHS[YLITYSKK]} salary. The ${h.eur(KYLI)} above it is withheld at ${h.num(KLP, 1)}% instead of ${h.num(KR.veroprosentti, 1)}%, taking ${h.eur(KLISA)} more from that payslip. You get it back after the assessment, but the payslip is visibly smaller. Including the holiday bonus and any taxable benefits when you set the limit avoids this.</p>
<p>Benefit payers receive the same card, so the limit covers taxable benefits as well as wages. A spell of unemployment or parental leave counts towards the same running total.</p>

<h2>Change the card or leave it?</h2>
<ul>
<li><strong>You are a few thousand euros over</strong> a limit you set yourself: let the additional rate run. The assessment evens it out, usually in your favour.</li>
<li><strong>You are on the default card</strong>, or your real pay is more than double the limit: order a ${h.a('muutosverokortti', 'revised tax card')} so the rest of the year is withheld correctly.</li>
<li><strong>You already know about a raise, holiday bonus or signing bonus</strong>: raise the limit straight away, so the base rate stays right and the additional rate never kicks in.</li>
</ul>
<p>Raising the limit normally nudges the base rate up too, since higher income lifts your average tax. The ${h.a('veroprosenttilaskuri', 'tax rate calculator')} gives the new pair of numbers, and the ${h.a('verokortti', 'tax card guide')} explains every line on the card. If withholding still falls short, the ${h.a('veronpalautus', 'residual tax')} is due in the following year.</p>
<p>Sources: ${h.src('vero_ennakonpidatys')}; ${h.src('vero_veroperusteet')}.</p>`,
  },
});
