import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { tyoelakeArvio, kansanelake, elakeNetto, elakeIat, ikaKuukausina, type IkaKk } from '../../lib/engine/elake';

const E = P.elake, V = P.vero;
const VUOSI = 1975, PALKKA = 3500, ALOITUS = 24;
const arvio = (syntymavuosi: number, kkPalkka: number, aloitusIka = ALOITUS, lisaKk = 0) => {
  const iat = elakeIat(syntymavuosi);
  const t = tyoelakeArvio({ syntymavuosi, kkPalkka, aloitusIka, alkamisKk: ikaKuukausina(iat.alin) + lisaKk });
  const k = kansanelake(t.kkElake);
  const n = elakeNetto(k.yhteensa, 'Helsinki');
  return { iat, t, k, n };
};
const A = arvio(VUOSI, PALKKA);
const KORVAUS = A.t.kkElake / PALKKA * 100;
const PALKAT = [2000, 2500, 3500, 5000].map((p) => ({ p, ...arvio(VUOSI, p) }));
const VUODET = [1964, 1975, 1985, 1995].map((y) => ({ y, ...arvio(y, PALKKA) }));
const LYK = [0, 12, 24, 36].map((m) => ({ m, ...arvio(VUOSI, PALKKA, ALOITUS, m) }));
/** Ulkomailta muuttanut: Suomessa töihin 38-vuotiaana (syntynyt 1985, 4 000 €/kk). */
const MUUTTO = 38;
const EXPAT = arvio(1985, 4000, MUUTTO);
const OMA = arvio(1985, 4000, ALOITUS);
/** Työeläke.fi:n yksinkertaistettu esimerkki: 40 000 € vuosiansio × 1,5 % / 12. */
const VUOSIKARTTUMA = 40000 * E.karttumaprosentti / 100 / 12;
const KERROIN = E.elinaikakerroin_viimeisin;
const ikaFi = (i: IkaKk) => `${i[0]} v${i[1] ? ` ${i[1]} kk` : ''}`;
const ikaEn = (i: IkaKk) => `${i[0]} y${i[1] ? ` ${i[1]} m` : ''}`;

export default definePage({
  id: 'elakelaskuri',
  group: 'laskurit',
  order: 50,
  tool: 'elake',
  related: ['elakeika', 'elinaikakerroin', 'tyoelakkeen-karttuminen', 'takuuelake-laskuri', 'elakkeen-verotus'],
  sources: ['tyoelake_maara', 'tyoelake_ika', 'etk_elinaikakerroin', 'kela_vanhuuselake', 'vero_elake_paatos'],
  fi: {
    slug: 'elakelaskuri',
    nav: 'Eläkelaskuri',
    card: 'Arvio työeläkkeestä, Kelan eläkkeistä ja eläkkeen nettomäärästä verojen jälkeen.',
    title: 'Eläkelaskuri 2026: työeläke, Kelan eläke ja nettoeläke',
    description: `Eläkelaskuri 2026: arvioi työeläkkeesi, Kelan kansaneläke ja takuueläke sekä eläke verojen jälkeen. ${FI.eur(PALKKA)} palkasta tulee noin ${FI.eur(A.n.kkNetto)} nettoeläke kuussa.`,
    h1: 'Eläkelaskuri: paljonko eläkettä saan käteen',
    intro: 'Syötä syntymävuosi, nykyinen palkka ja työuran alku, niin näet eläkkeesi bruttona ja verojen jälkeen.',
    resume: `Vuonna ${VUOSI} syntynyt, joka on ansainnut ${FI.eur(PALKKA)} kuukaudessa ${ALOITUS}-vuotiaasta asti, saa tämän päivän rahassa noin ${FI.eur(A.t.kkElake)} työeläkettä kuukaudessa ja Helsingissä asuvana noin ${FI.eur(A.n.kkNetto)} verojen jälkeen. Työeläke on silloin noin ${FI.num(KORVAUS, 0)} % viimeisestä palkasta, eikä Kelan eläkettä tällä tasolla enää makseta. Laskuri kerryttää eläkettä ${FI.p(E.karttumaprosentti, 1)} vuosiansioista jokaiselta työvuodelta, kertoo summan elinaikakertoimella ${FI.num(KERROIN.arvo, 5)} ja lisää ${FI.p(E.lykkayskorotus_prosentti_kk, 1)} lykkäyskorotuksen jokaiselta kuukaudelta, jonka jatkat alimman eläkeiän yli. Sen jälkeen se tarkistaa, kuuluuko sinulle Kelan kansaneläkettä tai takuueläkettä, ja laskee verot eläketulona: eläketulovähennys ${FI.eur(E.elaketulovahennys.taysi)}, sairaanhoitomaksu ${FI.p(V.sairaanhoitomaksu_muu_tulo_prosentti)} eikä työeläke- tai työttömyysvakuutusmaksua. Työeläkeotteen ja työeläkelaitosten arviot ovat bruttosummia ilman Kelan eläkettä, joten tämä laskuri vastaa kysymykseen, paljonko eläkkeestä todella jää käyttöön. Tarkin tulos syntyy, kun syötät jo kertyneen eläkkeen työeläkeotteelta, koska silloin laskurin ei tarvitse arvata aiempia palkkojasi ja palkattomia jaksojasi.`,
    faqs: [
      { q: 'Paljonko eläkettä saan 3 500 euron kuukausipalkalla?', a: `Jos olet syntynyt ${VUOSI}, aloitit työt ${ALOITUS}-vuotiaana ja palkka pysyy samana, työeläke on alimmassa eläkeiässä (${ikaFi(A.iat.alin)}, ennuste) noin ${FI.eur(A.t.kkElake)} kuukaudessa tämän päivän rahassa. Kelan eläkettä ei tällä työeläkkeellä makseta. Helsingissä verojen jälkeen jää noin ${FI.eur(A.n.kkNetto)}. Lyhyempi työura tai palkattomat jaksot pienentävät summaa.` },
      { q: 'Kannattaako eläkelaskuriin syöttää kertynyt eläke työeläkeotteelta?', a: `Kannattaa. Ilman sitä laskuri olettaa, että olet tehnyt töitä aloitusiästä lähtien nykyisellä palkallasi, mikä yliarvioi eläkettä, jos palkkasi oli alussa pienempi tai välissä oli opiskelua. Työeläkeote näyttää tähän mennessä ansaitun eläkkeen euroina kuukaudessa. Laskuri lisää siihen ${FI.p(E.karttumaprosentti, 1)} nykyisistä vuosiansioista jokaiselta jäljellä olevalta työvuodelta.` },
      { q: 'Näyttääkö eläkelaskuri, paljonko lykkääminen nostaa eläkettä?', a: `Näyttää: valitse eläkkeelle jäämisen ajankohta kentästä Eläkkeelle. Kaksi asiaa kasvattaa eläkettä: alimmassa iässä kertynyt eläke saa ${FI.p(E.lykkayskorotus_prosentti_kk, 1)} lykkäyskorotuksen jokaiselta kuukaudelta, ja palkasta kertyy edelleen uutta eläkettä. Esimerkissämme vuoden lykkäys nostaa työeläkkeen tasolta ${FI.eur(LYK[0].t.kkElake)} tasolle ${FI.eur(LYK[1].t.kkElake)} ja kolmen vuoden lykkäys tasolle ${FI.eur(LYK[3].t.kkElake)} kuukaudessa. Korotus on pysyvä.` },
      { q: 'Kertyykö Suomen eläkettä ulkomailla tehdystä työstä?', a: `Ei kerry. Suomen työeläke karttuu vain Suomessa vakuutetusta työstä, ja ulkomaan työvuosilta eläke haetaan kyseisestä maasta. Jos olet syntynyt 1985, muutit Suomeen ${MUUTTO}-vuotiaana ja ansaitset ${FI.eur(4000)}, työeläke on noin ${FI.eur(EXPAT.t.kkElake)}, kun koko uran Suomessa tehneellä se olisi ${FI.eur(OMA.t.kkElake)}. Kelan kansaneläke riippuu Suomessa asutuista vuosista.` },
      { q: 'Paljonko eläkkeestä menee veroa Helsingissä?', a: `${FI.eur(A.k.yhteensa)} kuukausieläkkeestä verot ovat noin ${FI.eur(A.n.kkVerot)} kuukaudessa, kun et kuulu kirkkoon. Eläkettä verotetaan kevyemmin kuin samansuuruista palkkaa pienillä tuloilla, koska eläketulovähennys on enintään ${FI.eur(E.elaketulovahennys.taysi)} vuodessa. Toisaalta työtulovähennystä ei saa, ja sairaanhoitomaksu on ${FI.p(V.sairaanhoitomaksu_muu_tulo_prosentti)} palkan ${FI.p(V.sairaanhoitomaksu_palkka_prosentti)} sijaan.` },
    ],
    body: (h) => `
<h2>Eläke eri palkoilla</h2>
<p>Taulukossa on sama henkilö neljällä eri palkalla: syntynyt ${VUOSI}, työt alkaneet ${ALOITUS}-vuotiaana, eläkkeelle alimmassa eläkeiässä, asuu yksin Helsingissä eikä kuulu kirkkoon. Summat ovat tämän päivän rahassa.</p>
${h.table(['Palkka/kk', 'Työeläke', 'Kelan eläkkeet', 'Brutto yhteensä', 'Netto'], PALKAT.map((x) => [h.eur(x.p), h.eur(x.t.kkElake), h.eur(x.k.kansanelake + x.k.takuuelake), h.eur(x.k.yhteensa), h.eur(x.n.kkNetto)]), `Syntynyt ${VUOSI}, eläkkeelle ${ikaFi(A.iat.alin)}`, ['l', 'r', 'r', 'r', 'r'])}
<p>Pienellä palkalla Kelan kansaneläke täydentää työeläkettä: se pienenee puolella siitä, mitä työeläkkeet ylittävät ${h.eur(E.kansanelake.vahentamaton_raja_kk, 2)} kuukaudessa, ja loppuu, kun työeläke ylittää ${h.eur(E.kansanelake.yla_raja_yksin_kk, 2)}. Takuueläkkeen ja kansaneläkkeen yhteispelin näet ${h.a('takuuelake-laskuri', 'kansaneläke- ja takuueläkelaskurista')}.</p>
<h2>Miten työeläke lasketaan</h2>
<p>Työeläke.fi tiivistää laskutavan näin: vuosiansiot kerrotaan ${h.num(E.karttumaprosentti, 1)} prosentilla ja elinaikakertoimella, ja tulos jaetaan kahdellatoista. Esimerkiksi ${h.eur(40000)} vuosiansio kerryttää ennen kerrointa ${h.eur(VUOSIKARTTUMA)} kuukausieläkettä jokaiselta työvuodelta. Eläkettä karttuu ${h.num(E.karttuma_ika.alkaa)}–${h.num(E.karttuma_ika.paattyy)}-vuotiaana, ja vuodesta 2026 karttuma on kaikille ikäryhmille sama. Lisää ${h.src('tyoelake_maara', 'Työeläke.fi:n sivulla työeläkkeen määrästä')}.</p>
<p>Laskuri olettaa, että vuosiansiot ovat kaksitoista ja puoli kuukausipalkkaa, eli lomaraha on puolen kuukauden palkka, ja että palkka pysyy samana tämän päivän rahassa. Todellisuudessa palkkakerroin korottaa kertynyttä eläkettä työuran aikana ja työeläkeindeksi eläkkeelle jäämisen jälkeen, joten euromäärät ovat tämän päivän ostovoimaa.</p>
<h2>Eläkeikä ja elinaikakerroin syntymävuoden mukaan</h2>
${h.table(['Syntymävuosi', 'Alin eläkeikä', 'Työeläke', 'Netto'], VUODET.map((x) => [String(x.y), `${ikaFi(x.iat.alin)}${x.iat.vahvistettu ? '' : ' (ennuste)'}`, h.eur(x.t.kkElake), h.eur(x.n.kkNetto)]), `Palkka ${h.eur(PALKKA)}/kk, työt alkaneet ${ALOITUS}-vuotiaana`, ['l', 'l', 'r', 'r'])}
<p>Eläkeikä on vahvistettu vuoteen 1964 asti syntyneille. Myöhemmin syntyneiden ikä sidotaan elinajanodotteeseen, ja laskuri käyttää ${h.src('tyoelake_ika', 'Työeläke.fi:n ennustetta')}. Elinaikakerroin on vahvistettu samoin vuoteen 1964 asti: ${h.src('etk_elinaikakerroin', `vuonna 1964 syntyneillä se on ${h.num(KERROIN.arvo, 5)}`)}, ja laskuri käyttää samaa arvoa myöhemmille ikäluokille, koska uutta ei vielä ole. Pidempi työura nostaa eläkettä nuoremmilla, vaikka eläkeikä nousee.</p>
<h2>Lykkääminen kannattaa euroissa</h2>
${h.table(['Eläkkeelle', 'Työeläke', 'Josta lykkäyskorotus', 'Netto'], LYK.map((x) => [x.m ? `+${x.m} kk` : 'alimmassa iässä', h.eur(x.t.kkElake), h.eur(x.t.lykkays), h.eur(x.n.kkNetto)]), `Syntynyt ${VUOSI}, palkka ${h.eur(PALKKA)}/kk`, ['l', 'r', 'r', 'r'])}
<p>Lykkäyskorotus lasketaan alimmassa iässä kertyneestä eläkkeestä, ja lisävuosien palkasta kertyy uutta eläkettä erikseen. Lisää ${h.a('elakeika', 'eläkeiästä')} ja ${h.a('elinaikakerroin', 'elinaikakertoimesta')}.</p>
<h2>Mitä laskuri ei tee</h2>
<p>Se ei tunne palkattomia jaksoja, joilta eläkettä kertyy etuuden perusteella, eikä ulkomaan eläkkeitä. Kelan eläke lasketaan oletuksella, että olet asunut Suomessa koko aikuisikäsi; muussa tapauksessa kansaneläke suhteutetaan asumisaikaan. Verot lasketaan ${h.src('vero_elake_paatos', 'Verohallinnon vuoden 2026 eläkepäätöksen')} perusteilla, ja niiden erittely on sivulla ${h.a('elakkeen-verotus', 'eläkkeen verotus')}. Tarkempi kuva karttumasta on sivulla ${h.a('tyoelakkeen-karttuminen', 'työeläkkeen karttuminen')}.</p>`,
  },
  en: {
    slug: 'pension-calculator',
    nav: 'Pension calculator',
    card: 'Your Finnish earnings-related pension, Kela pensions and net pension after tax.',
    title: 'Pension Calculator Finland 2026: Your Net Monthly Pension',
    description: `Pension calculator Finland 2026: estimate your earnings-related pension, Kela pensions and what is left after tax. A ${EN.eur(PALKKA)} salary gives about ${EN.eur(A.n.kkNetto)} net.`,
    h1: 'Finnish pension calculator 2026',
    intro: 'Enter your year of birth, current salary and the age you started working to see your pension before and after tax.',
    resume: `Someone born in ${VUOSI} who has earned ${EN.eur(PALKKA)} a month since age ${ALOITUS} can expect about ${EN.eur(A.t.kkElake)} a month of earnings-related pension (työeläke) in today’s money, and about ${EN.eur(A.n.kkNetto)} after tax when living in Helsinki, roughly ${EN.num(KORVAUS, 0)}% of the final salary. The calculator accrues ${EN.p(E.karttumaprosentti, 1)} of annual earnings for each working year, multiplies the total by the life expectancy coefficient (elinaikakerroin) of ${EN.num(KERROIN.arvo, 5)} and adds a ${EN.p(E.lykkayskorotus_prosentti_kk, 1)} deferral increase for every month you keep working past your earliest retirement age. It then checks whether Kela’s national pension (kansaneläke) or guarantee pension (takuueläke) applies and taxes the total as pension income, with the pension income deduction of up to ${EN.eur(E.elaketulovahennys.taysi)} and a ${EN.p(V.sairaanhoitomaksu_muu_tulo_prosentti)} health care contribution. Your pension record (työeläkeote) and pension providers show gross earnings-related pension only, without Kela or tax, so this tool answers the practical question: what will actually reach your account. Enter the accrued amount from your record for the best estimate.`,
    faqs: [
      { q: 'How much pension will I get in Finland on a €3,500 salary?', a: `If you were born in ${VUOSI}, started at ${ALOITUS} and your pay stays the same, your earnings-related pension at the earliest age (${ikaEn(A.iat.alin)}, forecast) is about ${EN.eur(A.t.kkElake)} a month in today’s money. No Kela pension is paid on top at that level. In Helsinki about ${EN.eur(A.n.kkNetto)} remains after tax. A shorter career or unpaid gaps lower the figure.` },
      { q: 'Where do I find my accrued pension to enter in the calculator?', a: `On your pension record (työeläkeote), which you can view through Työeläke.fi. It shows the pension earned so far in euros per month. Without it, the calculator assumes you worked on today’s salary from your starting age, which overstates the result if you earned less early on. It then adds ${EN.p(E.karttumaprosentti, 1)} of current annual earnings for every remaining year.` },
      { q: 'How much does my pension grow if I retire a year later?', a: `Two things raise it: the pension accrued at your earliest age gets a ${EN.p(E.lykkayskorotus_prosentti_kk, 1)} increase for each month of deferral, and your salary keeps accruing new pension. In our example one extra year lifts the earnings-related pension from ${EN.eur(LYK[0].t.kkElake)} to ${EN.eur(LYK[1].t.kkElake)} a month, and three years to ${EN.eur(LYK[3].t.kkElake)}. The increase is permanent.` },
      { q: 'Do my working years abroad count towards a Finnish pension?', a: `Not towards the Finnish earnings-related pension: it accrues only from work insured in Finland, and you claim pension for foreign years from each country. Someone born in 1985 who starts in Finland at ${MUUTTO} on ${EN.eur(4000)} gets about ${EN.eur(EXPAT.t.kkElake)}, against ${EN.eur(OMA.t.kkElake)} for a full Finnish career from ${ALOITUS}. Kela’s national pension depends on years lived in Finland.` },
      { q: 'How much tax will I pay on my pension in Helsinki?', a: `On a total pension of ${EN.eur(A.k.yhteensa)} a month, tax is about ${EN.eur(A.n.kkVerot)} a month with no church membership. Small pensions are taxed more lightly than the same wage thanks to the pension income deduction of up to ${EN.eur(E.elaketulovahennys.taysi)} a year. On the other hand there is no earned income credit, and the health care contribution is ${EN.p(V.sairaanhoitomaksu_muu_tulo_prosentti)} instead of ${EN.p(V.sairaanhoitomaksu_palkka_prosentti)}.` },
    ],
    body: (h) => `
<h2>Pension at different salaries</h2>
<p>The table follows one person at four salary levels: born in ${VUOSI}, working since ${ALOITUS}, retiring at the earliest age, living alone in Helsinki, no church tax. Amounts are in today’s money.</p>
${h.table(['Salary/month', 'Work pension', 'Kela pensions', 'Gross total', 'Net'], PALKAT.map((x) => [h.eur(x.p), h.eur(x.t.kkElake), h.eur(x.k.kansanelake + x.k.takuuelake), h.eur(x.k.yhteensa), h.eur(x.n.kkNetto)]), `Born ${VUOSI}, retiring at ${ikaEn(A.iat.alin)}`, ['l', 'r', 'r', 'r', 'r'])}
<p>On a low salary, Kela’s national pension tops up the earnings-related one. It is cut by half of whatever your work pensions exceed ${h.eur(E.kansanelake.vahentamaton_raja_kk, 2)} a month and stops once they pass ${h.eur(E.kansanelake.yla_raja_yksin_kk, 2)}. The ${h.a('takuuelake-laskuri', 'national and guarantee pension calculator')} shows how the two Kela pensions interact.</p>
<h2>How the earnings-related pension is built</h2>
<p>Työeläke.fi sums it up simply: multiply annual earnings by ${h.num(E.karttumaprosentti, 1)}% and the life expectancy coefficient, then divide by twelve. A year on ${h.eur(40000)} therefore adds ${h.eur(VUOSIKARTTUMA)} a month of pension before the coefficient. Pension accrues from age ${h.num(E.karttuma_ika.alkaa)} to ${h.num(E.karttuma_ika.paattyy)}, at the same rate for every age group since 2026; see ${h.src('tyoelake_maara', 'Työeläke.fi on pension amounts')}.</p>
<p>The calculator treats a year’s earnings as twelve and a half monthly salaries, counting the holiday bonus as half a month, and keeps your salary constant in today’s money. In reality the wage coefficient revalues your accrued pension during your career and the pension index raises it after retirement, so read the results as today’s purchasing power.</p>
<h2>Retirement age and coefficient by year of birth</h2>
${h.table(['Born', 'Earliest age', 'Work pension', 'Net'], VUODET.map((x) => [String(x.y), `${ikaEn(x.iat.alin)}${x.iat.vahvistettu ? '' : ' (forecast)'}`, h.eur(x.t.kkElake), h.eur(x.n.kkNetto)]), `Salary ${h.eur(PALKKA)}/month, working since ${ALOITUS}`, ['l', 'l', 'r', 'r'])}
<p>Retirement ages are confirmed for people born up to 1964; for later cohorts the age is linked to life expectancy, and the tool uses the ${h.src('tyoelake_ika', 'Työeläke.fi forecast')}. The coefficient is also confirmed only up to 1964, ${h.src('etk_elinaikakerroin', `${h.num(KERROIN.arvo, 5)} for that cohort`)}, and the tool applies it to younger cohorts until new values are set. Younger people end up with more pension despite a later retirement age because their careers are longer.</p>
<h2>Deferring pays in euros</h2>
${h.table(['Retire', 'Work pension', 'Of which deferral increase', 'Net'], LYK.map((x) => [x.m ? `+${x.m} months` : 'earliest age', h.eur(x.t.kkElake), h.eur(x.t.lykkays), h.eur(x.n.kkNetto)]), `Born ${VUOSI}, salary ${h.eur(PALKKA)}/month`, ['l', 'r', 'r', 'r'])}
<p>The deferral increase is calculated on the pension accrued at your earliest age; wages earned in the extra years add new pension on top. More on ${h.a('elakeika', 'retirement age')} and the ${h.a('elinaikakerroin', 'life expectancy coefficient')}.</p>
<h2>What the calculator leaves out</h2>
<p>It does not model unpaid periods, during which pension accrues on benefits, or foreign pensions. Kela’s pension assumes you have lived in Finland all your adult life; if you moved here later, the national pension is reduced in proportion to your years of residence. Tax follows ${h.src('vero_elake_paatos', 'Vero’s 2026 pension withholding decision')}, broken down on the ${h.a('elakkeen-verotus', 'pension tax')} page, and accrual rules are explained in ${h.a('tyoelakkeen-karttuminen', 'how pension accrues')}.</p>`,
  },
});
