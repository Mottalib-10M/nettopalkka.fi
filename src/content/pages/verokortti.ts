import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { laskeVerot, lisaprosentti } from '../../lib/engine/vero';
import { kunta } from '../../lib/engine/params';

const V = P.vero;
const TRE = kunta('Tampere').kunta;
const KORO = V.palkkatulon_korotus_ennakonpidatyksessa_prosentti;
const MAX = V.ennakonpidatys_enimmais_prosentti;
const OLETUS = V.oletuspalkkatulo['21_65'];
const OLETUS_NUORI = V.oletuspalkkatulo.alle21;
/** Ikärajat luetaan parametrien avaimista (alle21, 21_65), ei kirjoiteta käsin. */
const NUORI_IKA = Number(Object.keys(V.oletuspalkkatulo).find((k) => k.startsWith('alle'))!.replace(/\D/g, ''));
const VANHA_IKA = Number(Object.keys(V.oletuspalkkatulo).find((k) => k.includes('_'))!.split('_')[1]);

// Esimerkki 1: palkansaaja Tampereella, vuositulo 42 000 €.
const F = laskeVerot({ tulo: 42000, kunta: 'Tampere' });
const LF = lisaprosentti(F);
// Esimerkki 2: viimeksi vahvistettu palkka 37 000 € korotetaan ennakonpidätyksessä.
const VAHV = 37000;
const POHJA = VAHV * (1 + KORO / 100);
const K = laskeVerot({ tulo: POHJA, kunta: 'Tampere' });
const LK = lisaprosentti(K);
// Esimerkki 3: oletusverokortti (15 000 €), vaikka todellinen palkka on 42 000 €.
const O = laskeVerot({ tulo: OLETUS, kunta: 'Tampere' });
const LO = lisaprosentti(O);
const OPID = OLETUS * O.veroprosentti / 100 + (F.tulo - OLETUS) * LO / 100;
const OERO = OPID - F.verot;
// Taulukko: kolme tulotasoa.
const FK = laskeVerot({ tulo: 42000, kunta: 'Tampere', kirkko: 'evl' });
const FH = laskeVerot({ tulo: 42000, kunta: 'Helsinki' });
const TRE_EVL = kunta('Tampere').evl, HKI = kunta('Helsinki').kunta;
const RIVIT = [30000, 42000, 60000].map((t) => { const r = laskeVerot({ tulo: t, kunta: 'Tampere' }); return { t, r, lp: lisaprosentti(r) }; });

export default definePage({
  id: 'verokortti',
  group: 'vero',
  order: 10,
  mini: 'verokortti',
  related: ['veroprosenttilaskuri', 'tuloraja', 'muutosverokortti', 'veronpalautus'],
  sources: ['vero_ennakonpidatys', 'vero_verokortti_en', 'vero_veroperusteet'],
  fi: {
    slug: 'verokortti',
    nav: 'Verokortti',
    card: 'Veroprosentti, tuloraja ja lisäprosentti: mistä verokortin luvut tulevat ja milloin ne menevät pieleen.',
    title: 'Verokortti 2026: veroprosentti, tuloraja ja lisäprosentti',
    description: `Verokortti 2026: näin Verohallinto laskee veroprosentin, tulorajan ja lisäprosentin, miksi palkkaa korotetaan ${FI.p(KORO, 1)} ja mitä oletusverokortti tarkoittaa.`,
    h1: 'Verokortti: kolme lukua, jotka ratkaisevat palkkasi pidätyksen',
    intro: 'Mitä verokortin veroprosentti, tuloraja ja lisäprosentti tarkoittavat, ja miten Verohallinto ne laskee vuodelle 2026.',
    resume: `Verokortti kertoo työnantajalle kolme lukua: veroprosentin, tulorajan ja lisäprosentin. Vuonna 2026 tamperelainen, jonka palkka on ${FI.eur(F.tulo)} vuodessa ja joka ei kuulu kirkkoon, saa verokorttiin veroprosentin ${FI.num(F.veroprosentti, 1)} % ja lisäprosentin ${FI.num(LF, 1)} %. Veroprosentilla pidätetään jokaisesta palkanmaksusta niin kauan kuin vuoden palkat pysyvät tulorajan alla; tulorajan ylittävästä osasta pidätetään lisäprosentti. Verohallinto laskee vuoden 2026 kortin viimeksi päättyneen verotuksen tiedoista ja korottaa siinä vahvistettua palkkatuloa ${FI.num(KORO, 1)} prosentilla, joten kortti olettaa palkan nousevan. Jos huomioon otettavat tulot ovat enintään ${FI.eur(OLETUS)}, prosentti lasketaan ${FI.eur(OLETUS)} oletuspalkkatulolle, ja alle ${NUORI_IKA}-vuotiaalle aiemmin palkkaa saaneelle ${FI.eur(OLETUS_NUORI)} tulolle. Prosentti pyöristetään ylöspäin puolen prosenttiyksikön tarkkuudella, eikä se voi ylittää ${FI.num(MAX)} prosenttia. Kortti on voimassa koko vuoden tai siihen asti, kun tilaat OmaVerosta uuden. Työeläke- ja työttömyysvakuutusmaksua prosentti ei sisällä, vaan ne pidätetään palkasta erikseen.`,
    faqs: [
      { q: 'Miksi verokorttini tuloraja on suurempi kuin palkkani?', a: `Verohallinto ottaa pohjaksi viimeksi päättyneessä verotuksessa vahvistetun palkkatulon ja korottaa sitä ${FI.num(KORO, 1)} prosentilla. Jos vahvistettu palkka oli ${FI.eur(VAHV)}, vuoden 2026 kortti lasketaan noin ${FI.eur(POHJA)} tulolle, ja tamperelaiselle prosentiksi tulee ${FI.num(K.veroprosentti, 1)} %. Jos palkkasi ei noussut, raja on väljä mutta prosentti silti lähellä oikeaa, joten korttia ei tarvitse vaihtaa pelkästään tämän takia.` },
      { q: `Mikä on oletusverokortti ja sen ${FI.eur(OLETUS)} tuloraja?`, a: `Kun aiempia palkkatuloja ei ole tai ne ovat enintään ${FI.eur(OLETUS)}, ${NUORI_IKA}–${VANHA_IKA}-vuotiaan prosentit lasketaan ${FI.eur(OLETUS)} oletuspalkkatulolle. Tampereella se tarkoittaa veroprosenttia ${FI.num(O.veroprosentti, 1)} % ja lisäprosenttia ${FI.num(LO, 1)} %. Kortti sopii kesätyöhön, mutta kokoaikatyössä lisäprosentti alkaa nopeasti, ja pidätys poikkeaa todellisesta verosta. Silloin kannattaa tilata OmaVerosta kortti, jonka tulorajana on koko vuoden 2026 arvioitu palkka.` },
      { q: `Voiko verokortin veroprosentti olla yli ${FI.num(MAX)}?`, a: `Ei voi. Verohallinnon päätöksen mukaan sekä ennakonpidätysprosentti että lisäprosentti ovat enintään ${FI.num(MAX, 1)} %. Jos sivutulojen ottaminen mukaan nostaisi prosentin tätä suuremmaksi, niitä ei lasketa verokorttiin, vaan niistä määrätään erikseen maksettava ennakkovero. Palkansaajalla raja tulee vastaan lähinnä silloin, kun pieneen palkkaan yhdistyy suuri määrä muuta veronalaista tuloa.` },
      { q: 'Lasketaanko lomaraha ja luontoisedut verokortin tulorajaan?', a: `Lasketaan. Päätöksen mukaan tulorajaan luetaan ennakonpidätyksen alainen palkka kokonaisuudessaan, myös luontoisedut kuten puhelin- tai autoetu, ja lomaraha on palkkaa. Jos arvioit tulorajan vain ${FI.num(12)} kuukausipalkan perusteella, raja voi ylittyä kesällä, ja loppuvuoden palkoista pidätetään lisäprosentti, esimerkiksi ${FI.eur(F.tulo)} palkalla Tampereella ${FI.num(LF, 1)} %. Lisää siis arvioon lomaraha ja edut.` },
      { q: 'Kuinka kauan vuoden 2026 verokortti on voimassa?', a: `Vuoden 2026 verokortti tulee voimaan tammikuun alussa ja on voimassa koko kalenterivuoden tai siihen asti, kun tilaat uuden. Tuloraja on laskettu kaikille ${FI.num(12)} kuukaudelle, joten se ei nollaudu kesken vuoden. Uuden kortin voi tilata milloin tahansa, kun tulot tai vähennykset muuttuvat, ja seuraavan vuoden kortti tulee automaattisesti vuodenvaihteessa.` },
    ],
    body: (h) => `
<h2>Kolme lukua yhdellä kortilla</h2>
<p>Palkkalaskelmalla näkyy yleensä vain yksi prosentti, mutta verokortissa niitä on kaksi ja lisäksi euromäärä. Veroprosentti on perusprosentti, jolla työnantaja pidättää jokaisesta palkasta. Tuloraja on se vuoden palkkasumma, johon asti perusprosentti riittää. Lisäprosentti koskee vain tulorajan ylittävää osaa, ja se on aina vähintään kaksi prosenttiyksikköä perusprosenttia korkeampi, koska progressio kiristää veroa juuri viimeisistä euroista.</p>
${h.table(['Vuositulo (tuloraja)', 'Veroprosentti', 'Lisäprosentti', 'Verot vuodessa'],
  RIVIT.map(({ t, r, lp }) => [h.eur(t), `${h.num(r.veroprosentti, 1)} %`, `${h.num(lp, 1)} %`, h.eur(r.verot)]),
  `Tampere (kunnallisvero ${h.num(TRE, 2)} %), ei kirkon jäsen, vuoden 2026 perusteet`, ['l', 'r', 'r', 'r'])}
<p>Taulukon lisäprosentit ovat korkeita, koska ne lasketaan Verohallinnon erillisestä asteikosta, johon lisätään kunnan prosentti ja sairausvakuutusmaksut. Kun tuloraja on arvioitu oikein, lisäprosenttia ei käytetä lainkaan. Sen tehtävä on varmistaa, ettei ennakoitua suurempi tulo jää alipidätetyksi. Miten ylitys käytännössä lasketaan, näkyy sivulla ${h.a('tuloraja', 'tuloraja ja lisäprosentti')}.</p>

<h2>Mistä Verohallinto saa luvut</h2>
<p>Automaattisesti lähetetty kortti ei perustu kuluvan vuoden palkkaan, koska sitä ei vielä tiedetä. Pohjana on viimeksi päättynyt verotus tai sen oikaisu, ja jos olet muuttanut korttiasi edellisenä vuonna, käytetään muutoksen tietoja. Vahvistettua palkkatuloa korotetaan ${h.num(KORO, 1)} prosentilla. Esimerkiksi ${h.eur(VAHV)} vahvistetusta palkasta tulee ${h.eur(POHJA)} laskentapohja, ja Tampereella se antaa veroprosentiksi ${h.num(K.veroprosentti, 1)} % ja lisäprosentiksi ${h.num(LK, 1)} %.</p>
<p>Kaikkea vahvistettua tuloa ei oleteta toistuvaksi. Päätöksen mukaan laskennasta jätetään pois esimerkiksi osakepalkkiot, työsuhdeoptiot, henkilöstörahastosta nostetut osuudet ja puun myyntitulot. Verohallinto kertoo samaa vero.fi-sivullaan: satunnaisia tuloja ei lasketa mukaan. Ne tiedot, joihin oma korttisi perustuu, löytyvät OmaVerosta ennakkoperinnän päätökseltä. Jos sieltä puuttuu jotain olennaista tai mukana on kertaluonteinen erä, kortti kannattaa korjata heti tammikuussa.</p>
<p>Vähennyksistä mukaan tulevat valmiiksi lasketut: ${h.eur(V.tulonhankkimisvahennys)} tulonhankkimisvähennys, edellisen verotuksen työmatkakulut ${h.eur(V.matkakulut.omavastuu)} omavastuun ylittävältä osalta, ${h.a('perusvahennys', 'perusvähennys')} ja ${h.a('tyotulovahennys', 'työtulovähennys')}. Ammattiliiton ja työttömyyskassan jäsenmaksuja ei oteta ennakonpidätyksessä huomioon, vaikka ne vähennetään lopullisessa verotuksessa. Siksi liiton jäsenen kortti on yleensä hieman ylimitoitettu. Samoin jäävät pois kotitalousvähennys ja muut verosta tehtävät vähennykset, joita ei ole valmiiksi laskettu, ellei niitä ilmoita itse uutta korttia tilatessa.</p>

<h2>Oletusverokortti ja ensimmäinen työpaikka</h2>
<p>Jos huomioon otettavia palkkatuloja ei ole tai ne jäävät enintään ${h.eur(OLETUS)}, ${h.num(NUORI_IKA)}–${h.num(VANHA_IKA)}-vuotiaan verokortti lasketaan ${h.eur(OLETUS)} oletuspalkkatulolle. Nuorelle, joka on alle ${h.num(NUORI_IKA)}-vuotiaana jo saanut palkkaa, oletus on ${h.eur(OLETUS_NUORI)}. Matalalla tulolla perus- ja työtulovähennys syövät lähes koko veron, joten veroprosentti on pieni. Tampereella ${h.eur(OLETUS)} oletuskortin prosentit ovat ${h.num(O.veroprosentti, 1)} % ja ${h.num(LO, 1)} %.</p>
<p>Ongelma syntyy, kun oletuskortilla tekee kokoaikatyötä. Jos palkka on ${h.eur(F.tulo)}, ensimmäiset ${h.eur(OLETUS)} pidätetään perusprosentilla ja loput ${h.eur(F.tulo - OLETUS)} lisäprosentilla. Vuoden pidätys olisi noin ${h.eur(OPID)}, kun lopullinen vero on ${h.eur(F.verot)}. Erotus ${h.eur(Math.abs(OERO))} ${OERO > 0 ? 'palautuu vasta seuraavana vuonna' : 'jää jäännösveroksi'}. Oikealla arviolla kortti olisi ${h.num(F.veroprosentti, 1)} % ja raja ${h.eur(F.tulo)}, jolloin kuukausipalkasta jää käteen enemmän heti.</p>

<h2>Kotikunta ja kirkko muuttavat prosenttia</h2>
<p>Sama palkka ei tuota samaa korttia kaikkialla. Valtion vero ja sairausvakuutusmaksut ovat koko Manner-Suomessa yhtä suuret, mutta kunnallisvero lasketaan verovuoden kotikunnan prosentilla. ${h.eur(F.tulo)} palkalla tamperelaisen prosentti on ${h.num(F.veroprosentti, 1)} %, helsinkiläisen ${h.num(FH.veroprosentti, 1)} %, koska Helsingin kunnallisvero on ${h.num(HKI, 2)} % ja Tampereen ${h.num(TRE, 2)} %. Evankelisluterilaisen seurakunnan jäsenyys lisää Tampereella ${h.num(TRE_EVL, 2)} prosenttiyksikön kirkollisveron verotettavasta tulosta, ja kortille tulee silloin ${h.num(FK.veroprosentti, 1)} %. Kotikunta ja seurakunta näkyvät OmaVerossa ennakkoperinnän päätöksellä. Jos niissä on virhe, esimerkiksi muuton jälkeen väestötietojärjestelmän tieto on vanha, prosentti on laskettu väärän kunnan mukaan, ja se kannattaa tarkistaa ennen kuin pidätyksiä ehtii kertyä monta kuukautta. Laskurissa kunnan voi vaihtaa ja nähdä eron euroina.</p>

<h2>Pyöristys ja enimmäisprosentti</h2>
<p>Verohallinto laskee verojen ja maksujen yhteismäärän osuuden tulosta ja pyöristää sen ylöspäin seuraavaan puoleen prosenttiin. Tamperelaisen ${h.eur(F.tulo)} palkansaajan tarkka veroaste on ${h.num(F.veroaste * 100, 2)} %, mutta kortille tulee ${h.num(F.veroprosentti, 1)} %. Pyöristyksen takia lähes jokainen palkansaaja saa pienen veronpalautuksen, vaikka mikään ei muuttuisi. Ylin mahdollinen prosentti on ${h.num(MAX, 1)}, ja sama katto koskee lisäprosenttia.</p>

<h2>Mitä veroprosenttiin kuuluu</h2>
<ul>
<li>valtion tulovero ${h.a('valtion-tuloveroasteikko', 'progressiivisen asteikon')} mukaan, työtulovähennyksellä pienennettynä</li>
<li>kunnallisvero kotikunnan prosentilla ja kirkollisvero, jos kuulut seurakuntaan</li>
<li>sairaanhoitomaksu ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)} % ja päivärahamaksu ${h.num(V.paivarahamaksu_prosentti, 2)} %, kun palkka on vähintään ${h.eur(V.paivarahamaksu_tuloraja)}</li>
<li>Yle-vero, enintään ${h.eur(V.yle.enimmaismaara)} vuodessa</li>
</ul>
<p>Prosentin ulkopuolelle jäävät työntekijän työeläkemaksu ${h.num(V.tyoelakemaksu_prosentti, 2)} % ja työttömyysvakuutusmaksu ${h.num(V.tyottomyysvakuutusmaksu_prosentti, 2)} %. Työnantaja pidättää ne erikseen, minkä vuoksi palkkalaskelman vähennykset ovat aina suuremmat kuin kortin prosentti antaisi olettaa.</p>

<h2>Kun kortti ei enää vastaa tuloja</h2>
<p>Palkankorotus, toinen työpaikka, työttömyys tai perhevapaa muuttavat vuoden tuloja, ja automaattinen kortti jää jälkeen. Uuden kortin voi tilata OmaVerossa milloin tahansa vuoden aikana, ja laskennassa otetaan huomioon jo maksetut palkat ja niistä pidätetyt verot. Esimerkki kesken vuoden tehtävästä muutoksesta on sivulla ${h.a('muutosverokortti', 'muutosverokortti')}, ja oman prosentin voi laskea ${h.a('veroprosenttilaskuri', 'veroprosenttilaskurilla')}. Jos pidätys silti poikkeaa lopullisesta verosta, ero tasataan ${h.a('veronpalautus', 'veronpalautuksena tai jäännösverona')}.</p>
<p>Lähteet: ${h.src('vero_ennakonpidatys')}; ${h.src('vero_veroperusteet')}.</p>`,
  },
  en: {
    slug: 'tax-card',
    nav: 'Tax card',
    card: 'Withholding rate, income limit and additional rate: where the numbers on a Finnish tax card come from.',
    title: 'Tax Card 2026 in Finland: Rate, Income Limit, Extra Rate',
    description: `Tax card 2026 for people working in Finland: how Vero sets your withholding rate, income limit and additional rate, the ${EN.p(KORO, 1)} uplift and the default card.`,
    h1: 'The Finnish tax card, line by line',
    intro: 'What the withholding rate, income limit and additional rate on your 2026 tax card (verokortti) mean, and how Vero arrives at them.',
    resume: `A Finnish tax card (verokortti) gives your employer three numbers: a withholding rate (veroprosentti), an income limit (tuloraja) and an additional rate (lisäprosentti). In 2026 someone in Tampere earning ${EN.eur(F.tulo)} a year, outside the church, gets a withholding rate of ${EN.num(F.veroprosentti, 1)}% and an additional rate of ${EN.num(LF, 1)}%. Every payday the base rate applies until your earnings for the calendar year reach the income limit; anything above it is withheld at the additional rate. Vero, the Finnish Tax Administration, builds the automatic 2026 card from your last completed tax assessment and raises the wages it found there by ${EN.p(KORO, 1)}. With no Finnish wage history, or wages of ${EN.eur(OLETUS)} or less, the card is computed on a default income of ${EN.eur(OLETUS)}. Rates are rounded up to the next half point and can never exceed ${EN.num(MAX)}%. The card runs for the whole year unless you order a new one in MyTax (OmaVero). Your pension and unemployment insurance contributions are deducted on top of the card rate.`,
    faqs: [
      { q: 'Why is the income limit on my Finnish tax card higher than what I earn?', a: `Vero starts from the wages confirmed in your last completed assessment and adds ${EN.p(KORO, 1)} on the assumption that pay rises. Confirmed wages of ${EN.eur(VAHV)} become a base of about ${EN.eur(POHJA)}, which in Tampere means a rate of ${EN.num(K.veroprosentti, 1)}%. A generous limit is harmless as long as the rate itself is right, so it is not a reason to change the card on its own.` },
      { q: `I just moved to Finland: why does my tax card show a ${EN.eur(OLETUS)} limit?`, a: `With no Finnish wages on record, or ${EN.eur(OLETUS)} at most, Vero computes the card for a default income of ${EN.eur(OLETUS)} if you are aged ${NUORI_IKA} to ${VANHA_IKA}. In Tampere that gives ${EN.num(O.veroprosentti, 1)}% and an additional rate of ${EN.num(LO, 1)}%. On a full-time salary you cross that limit within months, so order a card with your real expected 2026 income instead.` },
      { q: 'Do I need a Finnish personal identity code to get a tax card?', a: `Yes. Vero’s guidance for people arriving to work says you need a Finnish personal identity code (henkilötunnus) to apply for the card. Service points may not be able to issue it on the spot, so apply as early as you can. Until then, check with payroll which rate they will apply to your first payslips, and correct it in MyTax as soon as the card exists.` },
      { q: `Can the withholding rate on a tax card go above ${EN.num(MAX)}%?`, a: `No. Under Vero’s 2026 decision both the base rate and the additional rate are capped at ${EN.num(MAX, 1)}%. If adding side income would push the rate above the cap, that income is left off the card and you are billed separately through prepayments of tax (ennakkovero). For an ordinary employee the cap only matters when a small salary sits next to large other taxable income.` },
      { q: 'Does my holiday bonus count towards the income limit?', a: `It does. The decision counts all wages subject to withholding, including taxable benefits such as a company phone or car, and the holiday bonus (lomaraha) is wages. If you set the limit at ${EN.num(12)} times your monthly pay, you may cross it in summer and see the rest of the year withheld at the additional rate, ${EN.num(LF, 1)}% on ${EN.eur(F.tulo)} in Tampere.` },
    ],
    body: (h) => `
<h2>Three numbers, one card</h2>
<p>Your payslip usually shows a single percentage, yet the card itself holds two rates and a euro amount. Think of the income limit as a budget: while your cumulative 2026 pay stays below it, payroll uses the base rate. The moment a payment takes you past it, the slice above the limit is withheld at the additional rate. That rate sits at least two points above the base rate, because Finnish state tax is progressive and the last euros you earn are taxed hardest.</p>
${h.table(['Annual income (limit)', 'Base rate', 'Additional rate', 'Tax for the year'],
  RIVIT.map(({ t, r, lp }) => [h.eur(t), `${h.num(r.veroprosentti, 1)}%`, `${h.num(lp, 1)}%`, h.eur(r.verot)]),
  `Tampere (municipal tax ${h.num(TRE, 2)}%), not a church member, 2026 rules`, ['l', 'r', 'r', 'r'])}
<p>The additional rates look steep because they come from a separate Vero scale, with your municipal rate and health insurance contributions added on top. If your limit is accurate, the additional rate is never used. Its job is to stop unexpected extra income from being under-withheld. The page on the ${h.a('tuloraja', 'income limit and additional rate')} works through what happens when you go over.</p>

<h2>Where Vero gets your numbers</h2>
<p>The card that arrives automatically for January cannot know your 2026 pay. It is built from your most recent completed assessment or a correction to it, or from any change you made to your card during the previous year. Confirmed wages are scaled up by ${h.num(KORO, 1)}%. Confirmed pay of ${h.eur(VAHV)} turns into a base of ${h.eur(POHJA)}, which in Tampere produces a ${h.num(K.veroprosentti, 1)}% rate and a ${h.num(LK, 1)}% additional rate.</p>
<p>One-off income is stripped out first. Vero’s decision lists share rewards, employee stock options, payouts from a personnel fund and timber sales among the items not expected to recur. The figures your own card rests on are shown in MyTax on the prepayment decision (ennakkoperinnän päätös). If a large bonus from last year is missing, fine; if a one-off sale has slipped in, correct the card in January rather than waiting for a refund.</p>
<p>Some deductions are built in: the automatic ${h.eur(V.tulonhankkimisvahennys)} work-expense deduction, last year’s commuting costs above ${h.eur(V.matkakulut.omavastuu)}, the ${h.a('perusvahennys', 'basic deduction')} and the ${h.a('tyotulovahennys', 'earned income tax credit')}. Trade union and unemployment fund (kassa) fees are ignored at withholding stage even though they reduce your final tax, so union members are usually withheld a little too much.</p>

<h2>The default card for newcomers</h2>
<p>Most people who move to Finland for work have no Finnish wages on file. If income Vero can take into account is ${h.eur(OLETUS)} or less, the card is calculated on a default wage of ${h.eur(OLETUS)} for anyone aged ${h.num(NUORI_IKA)} to ${h.num(VANHA_IKA)}, or ${h.eur(OLETUS_NUORI)} for younger workers who have had some pay. At that level the deductions wipe out most of the tax, so the base rate is tiny: ${h.num(O.veroprosentti, 1)}% in Tampere, with an additional rate of ${h.num(LO, 1)}%.</p>
<p>Now picture a software developer on ${h.eur(F.tulo)} a year using that default card. The first ${h.eur(OLETUS)} is withheld at the base rate, the remaining ${h.eur(F.tulo - OLETUS)} at the additional rate, for roughly ${h.eur(OPID)} withheld across the year. The real tax bill is ${h.eur(F.verot)}, so ${h.eur(Math.abs(OERO))} ${OERO > 0 ? 'comes back only after the assessment the following year' : 'falls due later as residual tax'}. With an accurate estimate the card would read ${h.num(F.veroprosentti, 1)}% with a ${h.eur(F.tulo)} limit, and the money stays in your monthly pay.</p>

<h2>Rounding and the ceiling</h2>
<p>Vero divides your total taxes and contributions by your income and rounds the result up to the next half percent. The Tampere example above has an exact tax ratio of ${h.num(F.veroaste * 100, 2)}%, printed on the card as ${h.num(F.veroprosentti, 1)}%. That rounding alone explains why most employees get a small refund in a year where nothing changed. No card rate, base or additional, can exceed ${h.num(MAX, 1)}%.</p>

<h2>What the percentage covers</h2>
<ul>
<li>state income tax on the ${h.a('valtion-tuloveroasteikko', 'progressive scale')}, reduced by the earned income credit</li>
<li>municipal tax at your home municipality’s rate, plus church tax if you are a member</li>
<li>the health care contribution of ${h.num(V.sairaanhoitomaksu_palkka_prosentti, 2)}% and the daily allowance contribution of ${h.num(V.paivarahamaksu_prosentti, 2)}% once wages reach ${h.eur(V.paivarahamaksu_tuloraja)}</li>
<li>the Yle public broadcasting tax, capped at ${h.eur(V.yle.enimmaismaara)}</li>
</ul>
<p>Outside the card rate are your pension contribution of ${h.num(V.tyoelakemaksu_prosentti, 2)}% and unemployment insurance of ${h.num(V.tyottomyysvakuutusmaksu_prosentti, 2)}%. Payroll takes them separately, which is why total deductions on a Finnish payslip are always higher than the rate on the card.</p>

<h2>When the card stops fitting</h2>
<p>A raise, a second job, a gap between contracts or parental leave all change your annual income, and the automatic card falls out of step. You can order a new card in MyTax at any point in the year; the new rate accounts for what has already been paid and withheld. A mid-year example is on the ${h.a('muutosverokortti', 'revised tax card')} page, and the ${h.a('veroprosenttilaskuri', 'tax rate calculator')} gives you the figure to enter. Whatever difference remains is settled through a ${h.a('veronpalautus', 'tax refund or residual tax')}.</p>
<p>Sources: ${h.src('vero_ennakonpidatys')}; ${h.src('vero_veroperusteet')}; ${h.src('vero_verokortti_en')}.</p>`,
  },
});
