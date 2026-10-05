import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { kansanelake, elakeNetto, tyoelakeArvio, ikaKuukausina, type IkaKk } from '../../lib/engine/elake';

const E = P.elake;
const LYK = E.lykkayskorotus_prosentti_kk;
const KP = E.karttumaprosentti;
const KE_LYK = E.kansanelake.lykkays_prosentti_kk_1962_jalkeen;
const VAHV = E.elakeika_vahvistettu as Record<string, { alin: IkaKk; tavoite: IkaKk; ylin: number }>;
const V64 = VAHV['1964'];
const K64 = E.elinaikakerroin_viimeisin.arvo;
const T64 = ikaKuukausina(V64.tavoite) - ikaKuukausina(V64.alin);
const MAX_KK = V64.ylin * 12 - ikaKuukausina(V64.alin);
/** Esimerkki (sama kuin minilaskurin oletus): eläke alimmassa iässä 1 900 €/kk, palkka 3 000 €/kk. */
const EL = 1900, PALKKA = 3000;
const lyk = (kk: number) => {
  const korotus = EL * LYK / 100 * kk;
  const uusi = PALKKA * kk * KP / 100 / 12;
  const lisa = korotus + uusi;
  const menetetty = EL * kk;
  return { korotus, uusi, lisa, uusiEl: EL + lisa, menetetty, kuittausV: menetetty / lisa / 12 };
};
const L12 = lyk(12);
const RIVIT = [6, 12, 24, 36, MAX_KK];
const N_ALIN = elakeNetto(EL, 'Helsinki'), N_12 = elakeNetto(L12.uusiEl, 'Helsinki');
/** Pieni työeläke ja Kela: kansaneläke pienenee puolella työeläkkeen kasvusta (ilman kansaneläkkeen omaa lykkäystä). */
const NETTO_KUITTAUS = (N_ALIN.kkNetto * 12) / (N_12.kkNetto - N_ALIN.kkNetto) / 12;
const PIENI = 600;
/** Vuonna 1964 syntynyt, kertynyt 2 000 €/kk vuonna 2026, palkka 3 500 €/kk: eläke eri alkamisiässä (moottori). */
const AL = ikaKuukausina(V64.alin), TA = ikaKuukausina(V64.tavoite);
const IAT = [AL, TA, AL + 24, V64.ylin * 12].map((m) => ({ m, r: tyoelakeArvio({ syntymavuosi: 1964, kkPalkka: 3500, kertynyt: 2000, alkamisKk: m }) }));
const ika = (m: number, fi: boolean) => { const y = Math.floor(m / 12), k = m % 12; return fi ? (k ? `${y} v ${k} kk` : `${y} v`) : (k ? `${y} y ${k} m` : `${y}`); };
const KA = kansanelake(PIENI), KB = kansanelake(PIENI * (1 + 12 * LYK / 100));

export default definePage({
  id: 'elakkeen-lykkaaminen',
  group: 'elake',
  order: 60,
  mini: 'lykkays',
  related: ['elakeika', 'elinaikakerroin', 'elakelaskuri', 'osittainen-vanhuuselake'],
  sources: ['tyoelake_ika', 'finlex_tyel', 'kela_vanhuuselake'],
  fi: {
    slug: 'elakkeen-lykkaaminen',
    nav: 'Eläkkeen lykkääminen',
    card: 'Lykkäyskorotus, uusi karttuma ja se, kuinka monessa vuodessa myöhempi eläköityminen maksaa itsensä takaisin.',
    title: `Eläkkeen lykkääminen 2026: lykkäyskorotus ${FI.num(LYK, 1)} % kuukaudessa`,
    description: `Eläkkeen lykkääminen 2026: jokainen kuukausi alimman eläkeiän jälkeen korottaa työeläkettä ${FI.num(LYK, 1)} %, vuodessa ${FI.num(LYK * 12, 1)} %, ja työstä kertyy lisäksi ${FI.num(KP, 1)} % palkasta.`,
    h1: 'Eläkkeen lykkääminen',
    intro: 'Laske, paljonko eläke kasvaa, kun jatkat töissä alimman eläkeiän yli, ja milloin lykkäys on tuottanut menetetyt kuukaudet takaisin.',
    resume: `Työeläke kasvaa ${FI.num(LYK, 1)} % jokaiselta kuukaudelta, jolla lykkäät eläkkeen alkamista alimman vanhuuseläkeiän yli, eli vuoden lykkäys tuo ${FI.num(LYK * 12, 1)} prosentin pysyvän korotuksen. Korotus lasketaan siitä eläkkeestä, joka on kertynyt eläkkeen alkamista edeltävän kuukauden loppuun, ja lykkäyksen aikana palkasta kertyy lisäksi uutta eläkettä ${FI.num(KP, 1)} %. Jos alimmassa iässä alkava eläke olisi ${FI.eur(EL)} kuukaudessa ja jatkat vuoden ${FI.eur(PALKKA)} palkalla, eläke nousee noin ${FI.eur(L12.uusiEl)} kuukaudessa. Vuoden ajalta jää kuitenkin saamatta ${FI.eur(L12.menetetty)} eläkettä, ja sen kuittaaminen suuremmalla eläkkeellä kestää noin ${FI.num(L12.kuittausV, 1)} vuotta, kun verot ja indeksit jätetään huomiotta. Tavoite-eläkeikä on rakennettu niin, että lykkäyskorotus juuri kumoaa elinaikakertoimen: vuonna 1964 syntyneellä se vaatii ${T64} kuukautta. Kelan kansaneläkettä korotetaan vastaavasti ${FI.num(KE_LYK, 1)} % kuukaudessa, jos olet syntynyt vuonna 1962 tai myöhemmin. Korotusta voi kerryttää ylimpään eläkeikään asti, ja se säilyy eläkkeessä koko eläkeajan.`,
    faqs: [
      { q: 'Paljonko eläke kasvaa, jos jatkan töissä vuoden yli alimman eläkeiän?', a: `Kahdessatoista kuukaudessa lykkäyskorotus on ${FI.num(LYK * 12, 1)} %. Jos eläke alimmassa iässä olisi ${FI.eur(EL)}, korotus on ${FI.eur(L12.korotus, 2)} kuukaudessa, ja ${FI.eur(PALKKA)} palkasta kertyy vuodessa lisäksi ${FI.eur(L12.uusi, 2)}. Eläke on siis noin ${FI.eur(L12.uusiEl)} eli ${FI.pct(L12.lisa / EL, 1)} suurempi, ja ero säilyy koko eläkeajan.` },
      { q: 'Kuinka monta vuotta kestää, että eläkkeen lykkääminen kannattaa?', a: `Vuoden lykkäys maksaa ${FI.eur(L12.menetetty)} saamatta jäänyttä eläkettä ja tuo ${FI.eur(L12.lisa)} kuukaudessa lisää, joten kuittaus kestää noin ${FI.num(L12.kuittausV, 1)} vuotta. Laskelmasta puuttuvat verot, indeksit ja lykkäysvuoden palkka. Jos et olisi työskennellyt lainkaan, vertailu on juuri tämä; jos palkka olisi tullut joka tapauksessa, lykkäyksen etu on suurempi.` },
      { q: 'Korotetaanko myös Kelan kansaneläkettä, jos lykkään sitä?', a: `Korotetaan. Kela korottaa vanhuuseläkettä ${FI.num(KE_LYK, 1)} % jokaiselta lykkäyskuukaudelta, jos olet syntynyt vuonna 1962 tai myöhemmin. Kansaneläke kuitenkin pienenee, kun työeläke kasvaa: puolet täyden kansaneläkkeen tulorajan ylittävästä työeläkkeestä vähennetään. Siksi työeläkkeen lykkääminen kasvattaa pienen eläkkeen saajan kokonaiseläkettä vähemmän kuin prosentista voisi päätellä.` },
      { q: 'Kannattaako eläkkeen alkua siirtää vain kuukaudella tai kahdella?', a: `Lyhytkin siirto näkyy. Kaksi kuukautta tuo ${FI.num(2 * LYK, 1)} prosentin korotuksen, ${FI.eur(EL)} eläkkeellä ${FI.eur(EL * 2 * LYK / 100, 2)} kuukaudessa loppuiäksi, ja palkasta kertyy lisäksi pieni määrä uutta eläkettä. Jos ajoitat eläkkeen alun esimerkiksi vuodenvaihteeseen, jo muutaman kuukauden siirto kasvattaa eläkettä pysyvästi. Korotus lasketaan täysistä kuukausista, joten päivämäärällä kuukauden sisällä ei ole merkitystä.` },
      { q: 'Onko lykkäyskorotukselle jokin yläraja?', a: `Erillistä kattoa ei ole, mutta lykkäys päättyy ylimpään eläkeikään. Vuonna 1964 syntyneellä väli alimmasta ${V64.alin[0]} vuoden iästä ylimpään ${V64.ylin} vuoteen on ${MAX_KK} kuukautta, mikä tekee enimmillään ${FI.num(MAX_KK * LYK, 0)} prosentin korotuksen. Uutta karttumaa palkasta tulee ${E.karttuma_ika.paattyy}-vuotiaaksi asti, joten koko lykkäysajan työ kasvattaa eläkettä kahta reittiä samanaikaisesti.` },
      { q: 'Kannattaako eläkettä lykätä, jos työeläke on pieni?', a: `Hyöty jää pienemmäksi. Jos ${FI.eur(PIENI)} työeläke kasvaa vuoden lykkäyksellä ${FI.eur(PIENI * 12 * LYK / 100, 2)}, kansaneläke pienenee samalla ${FI.eur(KA.kansanelake - KB.kansanelake, 2)}, ja kokonaiseläke nousee vain ${FI.eur(KB.yhteensa - KA.yhteensa, 2)} kuukaudessa. Kansaneläkkeen oma ${FI.num(KE_LYK, 1)} prosentin lykkäyskorotus voi paikata eroa, jos lykkäät myös sitä, mutta pienellä eläkkeellä lykkäys on harvoin rahallisesti paras ratkaisu.` },
    ],
    body: (h) => `
<h2>Mistä lykkäyskorotus lasketaan</h2>
<p>${h.src('finlex_tyel', 'Työntekijän eläkelain')} mukaan vanhuuseläkettä korotetaan ${h.num(LYK, 1)} prosenttia jokaiselta kuukaudelta, jolta eläkkeen alkamisaikaa lykätään alimman vanhuuseläkeiän täyttämistä seuraavaa kalenterikuukautta myöhemmäksi. Korotus kohdistuu eläkkeeseen, joka on kertynyt eläkkeen alkamista edeltävän kuukauden loppuun. Lykkäyksen aikana palkasta kertyvä uusi eläke, ${h.num(KP, 1)} % vuosiansioista, lisätään erikseen.</p>
<p>Laskenta alkaa siis vasta kuukauden viiveellä. Jos olet syntynyt maaliskuussa ja täytät alimman eläkeikäsi maaliskuussa, eläke voi alkaa aikaisintaan huhtikuun alusta ilman korotusta. Ensimmäinen ${h.num(LYK, 1)} prosentin korotus tulee, kun eläke alkaa toukokuussa, ja jokainen seuraava kuukausi lisää yhtä paljon. Päivämäärän kannattaa tarkistaa ennen kuin sopii viimeisestä työpäivästä.</p>
<p>Lykkäyskorotus ei ole kertaluonteinen bonus vaan pysyvä prosenttikorotus, joka seuraa eläkettä loppuun asti ja tarkistetaan vuosittain työeläkeindeksillä kuten muukin eläke. Siksi sen arvo riippuu siitä, kuinka monta vuotta eläkettä lopulta maksetaan.</p>
<h2>Lykkäys taulukkona</h2>
<p>Esimerkissä eläke alimmassa iässä olisi ${h.eur(EL)} kuukaudessa ja palkka lykkäyksen aikana ${h.eur(PALKKA)}. Viimeinen sarake kertoo, montako vuotta suurempi eläke tarvitsee kuitatakseen lykkäyksen aikana saamatta jääneen eläkkeen.</p>
${h.table(['Lykkäys', 'Korotus', 'Uutta karttumaa', 'Eläke lykkäyksen jälkeen', 'Saamatta jäänyt eläke', 'Kuittausaika'], RIVIT.map((kk) => { const r = lyk(kk); return [`${h.num(kk)} kk`, `${h.num(kk * LYK, 1)} %`, h.eur(r.uusi), h.eur(r.uusiEl), h.eur(r.menetetty), `${h.num(r.kuittausV, 1)} v`]; }), 'Ennen veroja ja indeksejä; viimeinen rivi vuonna 1964 syntyneen enimmäislykkäys', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Kuittausaika on taulukon jokaisella rivillä sama, koska sekä menetetty eläke että korotus kasvavat suoraan lykkäyskuukausien määrän mukana. Todellisuudessa palkka ja indeksit muuttavat lukua hieman. Ratkaisevaa on siis se, kuinka pitkään odotat eläkkeen kestävän, ei se, lykkäätkö vuoden vai kolme. Pidempi lykkäys vain kasvattaa panoksia molempiin suuntiin.</p>
<h2>Verot syövät osan korotuksesta</h2>
<p>Helsingissä ilman kirkollisveroa ${h.eur(EL)} bruttoeläkkeestä jää käteen ${h.eur(N_ALIN.kkNetto)}. Vuoden lykkäyksen jälkeinen ${h.eur(L12.uusiEl)} tuottaa nettona ${h.eur(N_12.kkNetto)}, eli brutto kasvaa ${h.eur(L12.lisa)} mutta netto ${h.eur(N_12.kkNetto - N_ALIN.kkNetto)}. Lykkäyskorotus osuu ylimpään tulokerrokseen, jossa ${h.a('elakkeen-verotus', 'eläketulovähennyksen')} pieneneminen nostaa marginaaliveroa. Toisaalta myös saamatta jäänyt eläke olisi ollut verotettavaa. Nettoluvuilla laskettuna vuoden aikana menetetään ${h.eur(N_ALIN.kkNetto * 12)} nettoeläkettä, ja se kuittaantuu ${h.eur(N_12.kkNetto - N_ALIN.kkNetto)} kuukausittaisella lisällä noin ${h.num(NETTO_KUITTAUS, 1)} vuodessa. Verot siis pidentävät kuittausaikaa jonkin verran, koska menetetty eläke olisi verotettu keskimääräisellä ja korotus verotetaan marginaaliverolla.</p>
<h2>Tavoite-eläkeikä: lykkäys elinaikakerrointa vastaan</h2>
<p>Vuonna 1964 syntyneen elinaikakerroin ${h.num(K64, 5)} pienentää alkavaa eläkettä noin ${h.num((1 - K64) * 100, 1)} %. Tavoite-eläkeikä ${V64.tavoite[0]} v ${V64.tavoite[1]} kk on ${T64} kuukautta alimman iän jälkeen, ja tuo lykkäys korottaa eläkettä ${h.num(T64 * LYK, 1)} %. Kerroin kerrotaan ensin ja korotus sen jälkeen, joten tavoiteiässä eläke on jo hieman kertoimetonta eläkettä suurempi. Vuosittaiset tavoiteiät ovat sivulla ${h.a('elakeika', 'eläkeikä')} ja kertoimet sivulla ${h.a('elinaikakerroin', 'elinaikakerroin')}.</p>
<h2>Esimerkki: vuonna 1964 syntynyt eri alkamisiässä</h2>
<p>Eläkelaskurin moottori laskee alla olevan esimerkin. Vuonna 1964 syntyneelle on vuoden 2026 alussa kertynyt ${h.eur(2000)} kuukausieläkettä, ja hän ansaitsee ${h.eur(3500)} kuukaudessa. Taulukko näyttää kuukausieläkkeen neljässä eri iässä, kun elinaikakerroin ${h.num(K64, 5)}, lykkäyskorotus ja uusi karttuma on otettu huomioon.</p>
${h.table(['Eläke alkaa', 'Kertynyt ennen kerrointa', 'Lykkäyskorotus', 'Kuukausieläke'], IAT.map(({ m, r }) => [ika(m, true), h.eur(r.ennenKerrointa), h.eur(r.lykkays), h.eur(r.kkElake)]), 'Tämän päivän rahassa, ennen veroja', ['l', 'r', 'r', 'r'])}
<p>Tavoite-eläkeiässä kuukausieläke on ${h.eur(IAT[1].r.kkElake - IAT[0].r.kkElake)} suurempi kuin alimmassa iässä, ja ylimpään eläkeikään jatkettaessa ero kasvaa ${h.eur(IAT[3].r.kkElake - IAT[0].r.kkElake)}:n. Suurin osa erosta tulee lykkäyskorotuksesta, ei uudesta karttumasta: viiden vuoden lisätyö kasvattaa kertymää ennen kerrointa ${h.eur(IAT[3].r.ennenKerrointa - IAT[0].r.ennenKerrointa)}, mutta korotus tuo ${h.eur(IAT[3].r.lykkays)}.</p>
<h2>Milloin lykkääminen ei kannata</h2>
<p>Lykkäys on kannattava silloin, kun eläkettä ehditään maksaa kauan. Jos terveys on heikko tai työ käy raskaaksi, kuittausaika voi jäädä saavuttamatta, ja ${h.a('osittainen-vanhuuselake', 'osittainen eläke')} tai eläkkeelle siirtyminen alimmassa iässä on järkevämpi valinta. Pienen työeläkkeen saajalle lykkäys tuo vähemmän, koska kansaneläke pienenee työeläkkeen kasvaessa. Myös verotus leikkaa korotusta, kuten edellä näkyy. Lykkääminen on vahvimmillaan, kun työ maistuu, palkka on hyvä ja kertynyt eläke on keskitasoa suurempi. Päätöstä ei tarvitse tehdä kerralla: jokainen lisäkuukausi on erillinen valinta, ja korotus kertyy niin kauan kuin eläkkeen alkamista siirretään, kuitenkin enintään ylimpään eläkeikään.</p>
<h2>Kela ja pienet eläkkeet</h2>
<p>${h.src('kela_vanhuuselake', 'Kelan kansaneläkettä')} voi myös lykätä: vuonna 1962 tai myöhemmin syntyneen eläkettä korotetaan ${h.num(KE_LYK, 1)} % kuukaudessa. Kansaneläke kuitenkin pienenee puolella siitä, millä työeläke ylittää ${h.eur(E.kansanelake.vahentamaton_raja_kk, 2)} kuukaudessa. Esimerkiksi ${h.eur(PIENI)} työeläke tuottaa yksin asuvalle kansaneläkettä ${h.eur(KA.kansanelake, 2)}. Kun työeläke kasvaa vuoden lykkäyksellä, kansaneläkettä maksetaan enää ${h.eur(KB.kansanelake, 2)}, jos sitä ei lykätä. Kokonaiseläke nousee vain ${h.eur(KB.yhteensa - KA.yhteensa, 2)}.</p>
<p>Vertailun vastakohta on ${h.a('osittainen-vanhuuselake', 'osittainen varhennettu vanhuuseläke')}, jossa sama ${h.num(LYK, 1)} % kuukaudessa vähennetään eikä lisätä. ${h.a('elakelaskuri', 'Eläkelaskurissa')} voit valita eläkkeen alkamisiän ja nähdä lykkäyksen vaikutuksen omilla luvuillasi.</p>`,
  },
  en: {
    slug: 'deferring-pension',
    nav: 'Deferring your pension',
    card: 'The deferral increase, extra accrual and how many years it takes for retiring later to pay for itself.',
    title: `Deferring Your Pension 2026: ${EN.num(LYK, 1)}% Increase Per Month Waited`,
    description: `Deferring your pension 2026: each month past your earliest retirement age adds ${EN.num(LYK, 1)}% to the earnings-related pension, ${EN.num(LYK * 12, 1)}% a year, plus new accrual on pay.`,
    h1: 'Deferring your Finnish pension',
    intro: 'See how much your pension grows if you keep working past your earliest retirement age, and when the deferral has paid back the months you skipped.',
    resume: `Each month you postpone your earnings-related pension beyond your earliest retirement age raises it by ${EN.num(LYK, 1)}%, so a year’s deferral means a permanent ${EN.num(LYK * 12, 1)}% increase (lykkäyskorotus). The increase applies to the pension accrued up to the end of the month before it starts, and while you keep working your salary accrues new pension at ${EN.num(KP, 1)}% on top. With a pension of ${EN.eur(EL)} a month at your earliest age and a year more on ${EN.eur(PALKKA)} a month, you would retire on about ${EN.eur(L12.uusiEl)}. The catch is the ${EN.eur(L12.menetetty)} of pension you did not draw that year; the larger pension needs about ${EN.num(L12.kuittausV, 1)} years to earn it back, ignoring tax and indexation. The target retirement age is set so that deferral exactly cancels the life expectancy coefficient: ${T64} months for people born in 1964. Kela raises the national pension by ${EN.num(KE_LYK, 1)}% per month of deferral for anyone born in 1962 or later. Deferral can run until the upper retirement age.`,
    faqs: [
      { q: 'How much bigger is my Finnish pension if I work one more year?', a: `Twelve months of deferral add ${EN.num(LYK * 12, 1)}%. On a pension of ${EN.eur(EL)} that is ${EN.eur(L12.korotus, 2)} a month, and a ${EN.eur(PALKKA)} salary accrues another ${EN.eur(L12.uusi, 2)}. Your pension becomes about ${EN.eur(L12.uusiEl)}, ${EN.pct(L12.lisa / EL, 1)} higher, for the rest of your life. The increase is indexed each year like the rest of the pension.` },
      { q: 'How long until deferring my pension pays off?', a: `A one-year deferral skips ${EN.eur(L12.menetetty)} of pension and adds ${EN.eur(L12.lisa)} a month, so the break-even is around ${EN.num(L12.kuittausV, 1)} years. That leaves out tax, indexation and the salary you earned during the year. If you would have stopped working anyway, this is the fair comparison; if the pay would have come regardless, deferral looks better.` },
      { q: 'Does delaying my pension by just a month or two make a difference?', a: `Yes, every month counts. Two months add ${EN.num(2 * LYK, 1)}%, which on a ${EN.eur(EL)} pension is ${EN.eur(EL * 2 * LYK / 100, 2)} a month for life, plus a little new accrual from your salary. Timing the start around a year-end therefore raises your pension permanently, even if only slightly.` },
      { q: 'Is there a maximum deferral increase?', a: `There is no separate cap, but deferral ends at the upper retirement age. For someone born in 1964, from the earliest age of ${V64.alin[0]} to the upper age of ${V64.ylin} is ${MAX_KK} months, a maximum increase of ${EN.num(MAX_KK * LYK, 0)}%. New accrual from salary continues until age ${E.karttuma_ika.paattyy}.` },
      { q: 'Does deferring help if my earnings-related pension is small?', a: `Less than the percentage suggests. If a ${EN.eur(PIENI)} earnings-related pension grows by ${EN.eur(PIENI * 12 * LYK / 100, 2)} after a year, the Kela national pension falls by ${EN.eur(KA.kansanelake - KB.kansanelake, 2)}, so your total rises by only ${EN.eur(KB.yhteensa - KA.yhteensa, 2)} a month. Deferring the national pension as well earns its own ${EN.num(KE_LYK, 1)}% per month.` },
    ],
    body: (h) => `
<h2>What the increase is based on</h2>
<p>The ${h.src('finlex_tyel', 'Employees Pensions Act')} raises an old-age pension by ${h.num(LYK, 1)}% for each month its start is postponed beyond the calendar month after you reach your earliest retirement age. The increase is calculated on what you had accrued by the end of the month before the pension starts; new accrual from salary during the deferral, ${h.num(KP, 1)}% of annual earnings, is added separately.</p>
<p>It is a permanent percentage, not a one-off bonus. It stays with the pension and is indexed every year like the rest of it, so its real value depends on how many years you end up drawing the pension.</p>
<h2>Deferral in numbers</h2>
<p>The example assumes a pension of ${h.eur(EL)} a month at your earliest age and a salary of ${h.eur(PALKKA)} while you defer. The last column shows how long the higher pension takes to make up for the pension you did not draw.</p>
${h.table(['Deferral', 'Increase', 'New accrual', 'Pension after', 'Pension not drawn', 'Break-even'], RIVIT.map((kk) => { const r = lyk(kk); return [`${h.num(kk)} mo`, `${h.num(kk * LYK, 1)}%`, h.eur(r.uusi), h.eur(r.uusiEl), h.eur(r.menetetty), `${h.num(r.kuittausV, 1)} y`]; }), 'Before tax and indexation; last row is the maximum for the 1964 cohort', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Break-even is the same on every row, because both the pension you skip and the increase you earn grow in direct proportion to the months deferred; real pay rises and indexation shift it only slightly. The real question is how long you expect to draw the pension, not on deferring one year rather than three.</p>
<h2>After tax</h2>
<p>In Helsinki without church tax, ${h.eur(EL)} gross leaves ${h.eur(N_ALIN.kkNetto)} net. After a year’s deferral, ${h.eur(L12.uusiEl)} gross leaves ${h.eur(N_12.kkNetto)}: the gross gain of ${h.eur(L12.lisa)} becomes ${h.eur(N_12.kkNetto - N_ALIN.kkNetto)} net, because the increase lands in your top slice of income where the ${h.a('elakkeen-verotus', 'pension income deduction')} is being phased out. The pension you skipped would have been taxed too, but at your average rate, while the increase is taxed at the margin. On net figures you forgo ${h.eur(N_ALIN.kkNetto * 12)} and gain ${h.eur(N_12.kkNetto - N_ALIN.kkNetto)} a month, a break-even of about ${h.num(NETTO_KUITTAUS, 1)} years.</p>
<h2>Target age: deferral against the coefficient</h2>
<p>For the 1964 cohort the life expectancy coefficient of ${h.num(K64, 5)} trims about ${h.num((1 - K64) * 100, 1)}%. The target age of ${V64.tavoite[0]} years ${V64.tavoite[1]} months is ${T64} months after the earliest age, worth ${h.num(T64 * LYK, 1)}%. Because the coefficient is applied first and the increase on top, the pension at the target age ends up slightly above the uncut amount. Ages by cohort are on ${h.a('elakeika', 'retirement age')}; coefficients on ${h.a('elinaikakerroin', 'life expectancy coefficient')}.</p>
<h2>One person, four start ages</h2>
<p>Our pension engine works through a single case: someone born in 1964 with ${h.eur(2000)} a month accrued at the start of 2026 and a salary of ${h.eur(3500)}. The table applies the ${h.num(K64, 5)} coefficient, the deferral increase and new accrual.</p>
${h.table(['Pension starts at', 'Accrued before coefficient', 'Deferral increase', 'Monthly pension'], IAT.map(({ m, r }) => [ika(m, false), h.eur(r.ennenKerrointa), h.eur(r.lykkays), h.eur(r.kkElake)]), 'In today’s money, before tax', ['l', 'r', 'r', 'r'])}
<p>At the target age the pension is ${h.eur(IAT[1].r.kkElake - IAT[0].r.kkElake)} a month higher than at the earliest age; working to the upper age adds ${h.eur(IAT[3].r.kkElake - IAT[0].r.kkElake)}. Most of that comes from the deferral increase (${h.eur(IAT[3].r.lykkays)}), not from five extra years of accrual (${h.eur(IAT[3].r.ennenKerrointa - IAT[0].r.ennenKerrointa)} before the coefficient).</p>
<p>Deferral is a bet on a long retirement. If your health is poor or the job is wearing you down, retiring at the earliest age or taking a ${h.a('osittainen-vanhuuselake', 'partial early pension')} may serve you better. It pays best when you enjoy the work, earn well and have an above-average pension already accrued.</p>
<h2>Kela and small pensions</h2>
<p>The ${h.src('kela_vanhuuselake', 'Kela national pension')} can be deferred too, at ${h.num(KE_LYK, 1)}% a month for those born in 1962 or later. But it shrinks by half of any earnings-related pension above ${h.eur(E.kansanelake.vahentamaton_raja_kk, 2)} a month. A single person with ${h.eur(PIENI)} of earnings-related pension gets ${h.eur(KA.kansanelake, 2)} from Kela; after a year’s deferral of the earnings-related part only, Kela pays ${h.eur(KB.kansanelake, 2)} and the total rises by just ${h.eur(KB.yhteensa - KA.yhteensa, 2)}.</p>
<p>The mirror image is the ${h.a('osittainen-vanhuuselake', 'partial early pension')}, where the same ${h.num(LYK, 1)}% per month is deducted instead of added. The ${h.a('elakelaskuri', 'pension calculator')} lets you set your own start age and see the effect.</p>`,
  },
});
