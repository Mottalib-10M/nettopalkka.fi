import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';

const E = P.elake;
const KP = E.karttumaprosentti;
const IKA = E.karttuma_ika;
const ET = E.etuuskarttuma_prosentti_perusteesta;
const KHT = E.kotihoidon_tuki_laskennallinen_kk;
const MAKSU = E.tyel_maksu_2026;
const KERROIN = E.elinaikakerroin_viimeisin.arvo;
/** Kuukausieläke yhden vuoden ansioista (€/kk). */
const kk = (vuosiansio: number) => vuosiansio * KP / 100 / 12;
const ESIM = 40000;
const ESIM_KK = kk(ESIM);
const PALKKA3000 = kk(3000 * 12);
const ETUUSPOHJA = 30000;
const etuusKk = (osuus: number) => kk(ETUUSPOHJA * osuus / 100);
const KHT_VUOSI = kk(KHT * 12);
const PALKAT = [24000, 30000, 40000, 50000, 70000];
const TYONANTAJALLE = ET.vanhempainraha - 100;
const ylinIka = E.ylin_elakeika_1962_jalkeen;
/** Kolme uraa 3 500 €/kk palkalla: tasainen, perhevapaa + työttömyys, osa-aika. */
const URA_KK = 3500, URA_V = 40;
const URA_A = kk(URA_KK * 12) * URA_V;
const URA_B = kk(URA_KK * 12) * (URA_V - 3) + kk(URA_KK * 12 * ET.vanhempainraha / 100) * 1 + kk(URA_KK * 12 * ET.ansiopaivaraha / 100) * 2;
const URA_C = kk(URA_KK * 12) * (URA_V - 10) + kk(URA_KK * 12 * 0.6) * 10;

export default definePage({
  id: 'tyoelakkeen-karttuminen',
  group: 'elake',
  order: 30,
  mini: 'karttuma',
  related: ['elakelaskuri', 'tyoelakemaksu', 'elinaikakerroin', 'ansiosidonnainen-laskuri'],
  sources: ['tyoelake_maara', 'finlex_tyel', 'etk_maksut'],
  fi: {
    slug: 'tyoelakkeen-karttuminen',
    nav: 'Työeläkkeen karttuminen',
    card: 'Paljonko eläkettä kertyy vuoden palkasta, työttömyydestä, perhevapaasta ja sairauslomasta.',
    title: `Työeläkkeen karttuminen 2026: ${FI.num(KP, 1)} % palkasta ${IKA.alkaa}–${IKA.paattyy}-vuotiaana`,
    description: `Työeläkkeen karttuminen 2026: eläkettä kertyy ${FI.num(KP, 1)} % vuosiansioista. ${FI.num(ESIM)} euron vuosipalkka tuo ${FI.num(ESIM_KK)} €/kk. Työttömyys, perhevapaa ja sairausaika kerryttävät.`,
    h1: 'Työeläkkeen karttuminen',
    intro: 'Laske, paljonko yksi työvuosi kasvattaa kuukausieläkettäsi ja mitä kertyy niiltä ajoilta, kun palkkaa ei makseta.',
    resume: `Työeläkettä kertyy vuonna 2026 ${FI.num(KP, 1)} % vuosiansioista kaikille ${IKA.alkaa}–${IKA.paattyy}-vuotiaille, joten ${FI.eur(ESIM)} vuosipalkka kasvattaa tulevaa eläkettä ${FI.eur(ESIM_KK)} kuukaudessa. Laskutapa on Työeläke.fi:n oma yksinkertaistus: vuosiansiot kerrotaan karttumaprosentilla ja elinaikakertoimella, ja tulos jaetaan kahdellatoista. Karttuma on vuodesta 2026 alkaen sama kaikenikäisille, sillä ikääntyneiden työntekijöiden korotettu karttuma päättyi vuoden 2025 lopussa. Pohjana on koko bruttopalkka: työntekijän oma työeläkemaksu, vuonna 2026 ${FI.num(MAKSU.tyontekija, 2)} %, ei pienennä eläkkeen perusteena olevaa ansiota. Eläkettä kertyy myös palkattomilta ajoilta. Ansiopäivärahan ajalta pohjana on ${ET.ansiopaivaraha} % päivärahan perusteena olevasta palkasta, vanhempainrahan ajalta ${ET.vanhempainraha} %, sairauspäivärahan ajalta ${ET.sairauspaivaraha} % ja muun muassa kuntoutusrahan ajalta ${ET.muut} %. Alle kolmevuotiasta kotona hoitavalle kertyy eläkettä laskennallisesta ${FI.eur(KHT, 2)} kuukausitulosta. Yrittäjällä karttuminen alkaa vasta ${IKA.alkaa + 1}-vuotiaana. Palkansaajalle jo ensimmäinen kesätyö kerryttää eläkettä, vaikka summa on alussa vain muutamia euroja kuukaudessa.`,
    faqs: [
      { q: 'Paljonko eläkettä kertyy 3 000 euron kuukausipalkasta vuodessa?', a: `Kahdentoista kuukauden palkka ${FI.eur(3000 * 12)} kerryttää ${FI.num(KP, 1)} prosentilla ${FI.eur(PALKKA3000)} kuukausieläkettä jokaista työvuotta kohti. Kymmenessä vuodessa kertymä on ${FI.eur(PALKKA3000 * 10)} kuukaudessa, ennen elinaikakerrointa ja indeksitarkistuksia. Jos vuoteen kuuluu muitakin eläkkeen perusteena olevia palkanosia, ne kasvattavat summaa samassa suhteessa, koska karttuma lasketaan kaikista työansioista.` },
      { q: 'Kertyykö eläkettä työttömyyden aikana?', a: `Kertyy, jos saat ansiosidonnaista päivärahaa. Eläkkeen pohjaksi lasketaan ${ET.ansiopaivaraha} % päivärahan perusteena olevasta palkasta, ja siitä kertyy ${FI.num(KP, 1)} %. Jos päivärahan pohjapalkka on ${FI.eur(ETUUSPOHJA)} vuodessa, vuosi työttömänä tuo ${FI.eur(etuusKk(ET.ansiopaivaraha), 2)} kuukausieläkettä. Karttuma koskee päivärahaa, joka on saatu alimman vanhuuseläkeiän täyttämiskuukauden loppuun mennessä.` },
      { q: 'Kerryttääkö vanhempainraha enemmän eläkettä kuin palkka?', a: `Kyllä, jos raha maksetaan sinulle itsellesi. Vanhempainrahan ajalta eläkettä kertyy ${ET.vanhempainraha} prosentista sen perusteena olevasta vuositulosta eli enemmän kuin tavallisesta palkasta. Jos työnantaja maksaa palkkaa vapaan ajalta ja saa etuuden itselleen, kertyy palkasta normaalisti ja etuudesta vain ${TYONANTAJALLE} %. Sama sääntö koskee raskaus- ja erityisraskausrahaa, joten koko vanhempainvapaa kerryttää eläkettä tavallista palkkaa paremmin.` },
      { q: 'Kertyykö eläkettä, kun hoidan lasta kotona kotihoidon tuella?', a: `Kertyy. Alle kolmevuotiasta lastaan hoitavalle vanhemmalle, jolla ei ole palkkaa, eläke karttuu kiinteästä ${FI.eur(KHT, 2)} kuukausitulosta vuoden 2026 tasossa. Vuoden kotihoito kerryttää siis noin ${FI.eur(KHT_VUOSI, 2)} kuukausieläkettä. Summa on pieni, mutta se täyttää aukkoa, joka muuten jäisi työuraan. Laskennallinen tulo on kaikille sama riippumatta siitä, paljonko ansaitsit ennen kotiin jäämistä.` },
      { q: 'Kerryttääkö sairausloma työeläkettä?', a: `Kerryttää. Niin kauan kuin työnantaja maksaa sairausajan palkkaa, palkka kerryttää eläkettä tavalliseen tapaan. Kun siirryt Kelan sairauspäivärahalle, eläkkeen pohjana on ${ET.sairauspaivaraha} % päivärahan perusteena olevista ansioista. Esimerkiksi ${FI.eur(ETUUSPOHJA)} vuosiansioilla vuoden sairauspäivärahakausi kerryttää ${FI.eur(etuusKk(ET.sairauspaivaraha), 2)} kuukausieläkettä, mikä on noin kaksi kolmasosaa saman vuoden palkan karttumasta.` },
      { q: 'Saavatko ikääntyneet työntekijät edelleen suuremman karttuman?', a: `Eivät enää. Vuosina 2017–2025 tietyn ikäisille kertyi korotettua karttumaa, ja heiltä perittiin myös suurempaa työeläkemaksua. Vuodesta 2026 alkaen sekä karttuma ${FI.num(KP, 1)} % että työntekijän maksu ${FI.num(MAKSU.tyontekija, 2)} % ovat samat kaikille ${IKA.alkaa}–${IKA.paattyy}-vuotiaille. Jo aiemmin kertynyt korotettu eläke säilyy ennallaan, eikä uudistus pienennä sitä takautuvasti.` },
    ],
    body: (h) => `
<h2>Laskukaava yhdellä rivillä</h2>
<p>Työeläke.fi:n ${h.src('tyoelake_maara', 'oman ohjeen')} mukaan kuukausieläke syntyy näin: vuosiansiot × ${h.num(KP, 1)} % × elinaikakerroin ÷ 12. Esimerkkinä ${h.eur(ESIM)} × ${h.num(KP, 1)} % ÷ 12 = ${h.eur(ESIM_KK)} kuukaudessa. ${h.src('finlex_tyel', 'Työntekijän eläkelaissa')} sama asia sanotaan lyhyemmin: eläkettä karttuu ${h.num(KP, 1)} prosenttia kunkin vuoden eläkkeen perusteena olevista työansioista.</p>
${h.table(['Vuosipalkka', 'Yhdestä vuodesta', 'Kymmenestä vuodesta', 'Neljästäkymmenestä vuodesta'], PALKAT.map((p) => [h.eur(p), `${h.eur(kk(p), 2)}/kk`, `${h.eur(kk(p) * 10)}/kk`, `${h.eur(kk(p) * 40)}/kk`]), 'Kertymä ennen elinaikakerrointa, palkka pysyy samana, ei indeksointia', ['l', 'r', 'r', 'r'])}
<p>Taulukko on tarkoituksella yksinkertainen. Todellisuudessa aiempien vuosien ansiot tarkistetaan palkkakertoimella, ja eläkkeen alkaessa koko kertymä kerrotaan ${h.a('elinaikakerroin', 'elinaikakertoimella')}, vuonna 1964 syntyneillä ${h.num(KERROIN, 5)}. Neljänkymmenen vuoden ura ${h.eur(ESIM)} vuosipalkalla tuottaa siis noin ${h.eur(kk(ESIM) * 40 * KERROIN)} kuukaudessa, jos eläke alkaa alimmassa eläkeiässä.</p>
<p>Taulukon luvut ovat siksikin varovaisia, että eläkkeen perusteena olevat vanhat ansiot tarkistetaan ennen eläkkeen alkamista palkkakertoimella, jonka arvo vuonna 2026 on ${h.num(E.indeksit.palkkakerroin, 3)}. Kahdenkymmenen vuoden takainen ${h.eur(ESIM)} palkka ei siis jää eläkelaskelmaan nimellisarvoisena, vaan sen ostovoima pidetään suunnilleen ajan tasalla. Siksi omaa kertymää kannattaa verrata nykyrahassa eikä vanhoissa palkkakuiteissa näkyvissä euroissa.</p>
<h2>Kenelle ja mistä iästä</h2>
<p>Palkansaajalle eläkettä kertyy ${IKA.alkaa} vuoden iästä alkaen ${IKA.paattyy} vuoden ikään asti; yrittäjällä alaraja on ${IKA.alkaa + 1} vuotta. Vuonna 1962 tai myöhemmin syntyneillä ylin vanhuuseläkeikä on ${ylinIka} vuotta. Karttumaa ei rajoita kansalaisuus eikä asumisaika: jokainen Suomessa maksettu, työeläkevakuutettu palkkaeuro kerryttää eläkettä, vaikka työskentelisit maassa vain lyhyen aikaa.</p>
<p>Ennen vuotta 2005 eläkettä alkoi kertyä vasta ${IKA.alkaa + 6}-vuotiaana, ja vuosina 2005–2016 ${IKA.alkaa + 1} vuoden iästä. Nuorena tehdyt kesätyöt ovat siis nykyisin osa eläkettä, mikä näkyy erityisesti niillä, joiden ura alkoi 2010-luvulla.</p>
<h2>Palkattomat ajat: mitä kertyy etuuksista</h2>
<p>Kun palkka katkeaa sairauden, työttömyyden tai lapsen syntymän vuoksi, eläke ei pysähdy kokonaan. Karttuma lasketaan etuuden perusteena olevasta ansiosta, mutta vain tietystä osuudesta. Taulukon esimerkissä etuuden pohjana on ${h.eur(ETUUSPOHJA)} vuodessa ja etuutta maksetaan koko vuoden.</p>
${h.table(['Etuus', 'Osuus perusteesta', 'Eläkettä vuodesta'], [
  ['Ansiosidonnainen päiväraha', `${ET.ansiopaivaraha} %`, `${h.eur(etuusKk(ET.ansiopaivaraha), 2)}/kk`],
  ['Raskaus- ja vanhempainraha', `${ET.vanhempainraha} %`, `${h.eur(etuusKk(ET.vanhempainraha), 2)}/kk`],
  ['Sairauspäiväraha', `${ET.sairauspaivaraha} %`, `${h.eur(etuusKk(ET.sairauspaivaraha), 2)}/kk`],
  ['Kuntoutusraha, aikuiskoulutustuki ym.', `${ET.muut} %`, `${h.eur(etuusKk(ET.muut), 2)}/kk`],
  ['Kotihoidon tuki (laskennallinen tulo)', `${h.eur(KHT, 2)}/kk`, `${h.eur(KHT_VUOSI, 2)}/kk`],
], `Karttuma ${h.num(KP, 1)} % etuuden pohjasta, vuosi 2026`, ['l', 'r', 'r'])}
<p>Vanhempainrahan ${ET.vanhempainraha} prosentin osuus on ainoa, joka ylittää palkan. Se koskee aikaa, jolloin etuus maksetaan vanhemmalle itselleen; jos työnantaja maksaa palkkaa ja saa etuuden, kertymä etuudesta on ${TYONANTAJALLE} % ja palkasta kertyy tavalliseen tapaan. Ansiopäivärahasta kertyy vain alimman vanhuuseläkeiän täyttämiskuukauden loppuun asti. Päivärahan suuruuden voit arvioida ${h.a('ansiosidonnainen-laskuri', 'ansiosidonnaisen päivärahan laskurilla')}.</p>
<p>Etuuksien ajalta kertyvä eläke maksetaan vain, jos olet uran aikana ansainnut palkkaa tai yrittäjätuloa vähintään laissa säädetyn vähimmäismäärän. Raja on euromääräinen, ja se tarkistetaan vuosittain indeksillä.</p>
<h2>Kolme työuraa samalla palkalla</h2>
<p>Karttuman vaikutus näkyy parhaiten, kun verrataan uria, joissa palkka on sama mutta elämä erilainen. Kaikissa kolmessa esimerkissä kuukausipalkka on ${h.eur(URA_KK)} ja ura kestää ${h.num(URA_V)} vuotta; luvut ovat ennen elinaikakerrointa ja ilman indeksejä.</p>
<ul>
<li><strong>Yhtäjaksoinen ura:</strong> ${h.num(URA_V)} vuotta täyttä palkkaa kerryttää ${h.eur(URA_A)} kuukaudessa.</li>
<li><strong>Vuosi vanhempainrahalla ja kaksi vuotta ansiosidonnaisella:</strong> ${h.eur(URA_B)} kuukaudessa. Vanhempainvuosi kerryttää enemmän kuin työvuosi, mutta työttömyysvuodet vähemmän, joten ero yhtäjaksoiseen uraan jää ${h.eur(URA_A - URA_B)} kuukauteen.</li>
<li><strong>Kymmenen vuotta osa-aikatyötä ${h.pct(0.6, 0)} palkalla:</strong> ${h.eur(URA_C)} kuukaudessa. Osa-aikavuodet kerryttävät eläkettä suoraan palkan suhteessa, eikä osa-aikaisuudesta seuraa muuta rangaistusta.</li>
</ul>
<p>Esimerkit osoittavat, ettei lyhyt perhevapaa tai työttömyysjakso romahduta eläkettä. Useimmilla etuusjaksoilla eläkkeen pohja on kolme neljäsosaa tai kaksi kolmasosaa palkasta, ja vanhempainrahalla jopa palkkaa suurempi, joten muutaman vuoden katkos näkyy kuukausieläkkeessä kymmeninä euroina eikä satoina. Suurin vaikutus on pitkillä jaksoilla, joilta ei ole palkkaa eikä mitään taulukossa mainittua etuutta.</p>
<h2>Monta työnantajaa, sivutyöt ja keikat</h2>
<p>Karttuma lasketaan kaikista vuoden eläkkeen perusteena olevista työansioista, joten jokainen työsuhde kerryttää eläkettä erikseen. Päätyön rinnalla tehty iltavuoro, kesätyö tai lyhyt määräaikainen pesti kasvattaa eläkettä samalla ${h.num(KP, 1)} prosentilla kuin päätyö. Kahdesta ${h.eur(1500)} kuukausipalkasta kertyy siis täsmälleen sama eläke kuin yhdestä ${h.eur(3000)} palkasta, eli ${h.eur(PALKKA3000)} kuukaudessa jokaiselta vuodelta.</p>
<p>Alimman eläkeiän jälkeen tehty työ kerryttää edelleen ${h.num(KP, 1)} %, ja lisäksi eläke kasvaa lykkäyskorotuksella, jos sen alkamista siirretään. Laskelma on sivulla ${h.a('elakkeen-lykkaaminen', 'eläkkeen lykkääminen')}.</p>
<h2>Maksu ja karttuma ovat eri asioita</h2>
<p>Työntekijän ${h.a('tyoelakemaksu', 'työeläkemaksu')} on vuonna 2026 ${h.num(MAKSU.tyontekija, 2)} % palkasta ja työnantajan maksu keskimäärin ${h.num(MAKSU.tyonantaja_keskimaarin, 2)} %, yhteensä ${h.num(MAKSU.yhteensa, 2)} % (${h.src('etk_maksut', 'Eläketurvakeskus')}). Maksut rahoittavat nykyisiä eläkkeitä ja rahastoja, mutta oma karttumasi ei riipu siitä, paljonko juuri sinusta maksettiin. Vuoden 2017 uudistuksessa lopetettiin myös työntekijän maksun vähentäminen eläkkeen perusteena olevasta palkasta, joten koko bruttopalkka kerryttää eläkettä.</p>
<p>Omaa kertymääsi kannattaa seurata työeläkeotteelta: siihen on koottu kaikki työsuhteet ja etuusjaksot, ja kertyneen eläkkeen määrän voi syöttää suoraan ${h.a('elakelaskuri', 'eläkelaskuriin')}.</p>`,
  },
  en: {
    slug: 'pension-accrual',
    nav: 'Pension accrual',
    card: 'How much pension a year of work, unemployment, parental leave or sick leave adds in Finland.',
    title: `Pension Accrual 2026: ${EN.num(KP, 1)}% of Pay Each Year From Age ${IKA.alkaa}`,
    description: `Pension accrual 2026: Finnish earnings-related pension builds at ${EN.num(KP, 1)}% of annual pay, so ${EN.eur(ESIM)} earns ${EN.eur(ESIM_KK)} a month for life. Benefit periods count as well.`,
    h1: 'How Finnish earnings-related pension accrues',
    intro: 'See what one year of salary adds to your future monthly pension, and what still accrues when you are not being paid.',
    resume: `In 2026 every employee aged ${IKA.alkaa} to ${IKA.paattyy} in Finland earns pension at ${EN.num(KP, 1)}% of annual earnings, so a year on ${EN.eur(ESIM)} adds ${EN.eur(ESIM_KK)} to your future monthly earnings-related pension (työeläke). That is the official shortcut published by Työeläke.fi: multiply annual pay by ${EN.num(KP, 1)}% and by the life expectancy coefficient, then divide by twelve. The rate is now the same at every age, because the higher accrual that older employees used to get ended with 2025. Your whole gross salary counts; the ${EN.num(MAKSU.tyontekija, 2)}% employee pension contribution withheld from your pay does not reduce the earnings base. Pension also keeps building when pay stops. During earnings-related unemployment allowance it accrues on ${ET.ansiopaivaraha}% of the wage behind the allowance, during parental allowance on ${ET.vanhempainraha}%, during sickness allowance on ${ET.sairauspaivaraha}%, and on ${ET.muut}% for rehabilitation and similar benefits. A parent caring for a child under three at home on child home care allowance accrues on a notional ${EN.eur(KHT, 2)} a month.`,
    faqs: [
      { q: 'Do I earn a Finnish pension if I only work here for two years?', a: `Yes. There is no minimum stay for the earnings-related pension: insured pay from age ${IKA.alkaa} counts from the first month. Two years on ${EN.eur(ESIM)} add about ${EN.eur(ESIM_KK * 2)} a month to your pension, before the life expectancy coefficient. The Kela national pension is different and needs at least ${E.kansanelake.asumisaika_vahintaan_v} years of residence after age 16.` },
      { q: 'Does unemployment benefit from a kassa add to my pension?', a: `Earnings-related unemployment allowance from an unemployment fund (työttömyyskassa) does. Pension accrues at ${EN.num(KP, 1)}% on ${ET.ansiopaivaraha}% of the wage your allowance is based on. With a wage base of ${EN.eur(ETUUSPOHJA)} a year, twelve months unemployed adds ${EN.eur(etuusKk(ET.ansiopaivaraha), 2)} to your monthly pension, provided the allowance was paid before the end of the month you reach your earliest retirement age.` },
      { q: 'Why does parental leave earn more pension than working?', a: `Because the law counts ${ET.vanhempainraha}% of the annual income behind your pregnancy or parental allowance when the allowance is paid to you. That deliberately exceeds normal pay to soften the career gap. If your employer keeps paying salary and receives the allowance instead, your salary accrues as usual and only ${TYONANTAJALLE}% of the allowance base is added.` },
      { q: 'Does long sick leave lower my Finnish pension?', a: `Less than you might fear. While your employer pays sick pay, that salary accrues pension normally. Once you move to Kela sickness allowance, accrual continues on ${ET.sairauspaivaraha}% of the earnings behind the allowance. With ${EN.eur(ETUUSPOHJA)} of annual earnings, a full year on sickness allowance still adds ${EN.eur(etuusKk(ET.sairauspaivaraha), 2)} to your monthly pension.` },
      { q: 'Is the employee pension contribution deducted before my pension is calculated?', a: `No. That rule ended in the 2017 reform. Your full gross salary is the earnings base, even though ${EN.num(MAKSU.tyontekija, 2)}% is withheld from each payslip as your pension contribution. The contribution is a separate matter: it is deductible in your taxation and funds the system, while your own accrual is always ${EN.num(KP, 1)}% of insured earnings.` },
    ],
    body: (h) => `
<h2>One year of pay, in euros of pension</h2>
<p>The formula on ${h.src('tyoelake_maara', 'Työeläke.fi')} is annual pay × ${h.num(KP, 1)}% × life expectancy coefficient ÷ 12. The ${h.src('finlex_tyel', 'Employees Pensions Act')} states the rule as accrual of ${h.num(KP, 1)}% on each year’s pensionable earnings. The table leaves out the coefficient and indexation so you can see the raw build-up.</p>
${h.table(['Annual salary', 'From 1 year', 'From 10 years', 'From 40 years'], PALKAT.map((p) => [h.eur(p), `${h.eur(kk(p), 2)}/mo`, `${h.eur(kk(p) * 10)}/mo`, `${h.eur(kk(p) * 40)}/mo`]), 'Accrued pension before the life expectancy coefficient, flat salary', ['l', 'r', 'r', 'r'])}
<p>In real life, earnings from earlier years are revalued with a wage coefficient before the pension starts, and the total is then multiplied by your cohort’s ${h.a('elinaikakerroin', 'life expectancy coefficient')} (${h.num(KERROIN, 5)} for people born in 1964). Forty years on ${h.eur(ESIM)} therefore comes to roughly ${h.eur(kk(ESIM) * 40 * KERROIN)} a month at the earliest retirement age.</p>
<p>That is also why the table understates real pensions: old earnings are revalued with the wage coefficient (palkkakerroin), ${h.num(E.indeksit.palkkakerroin, 3)} in 2026, so a salary from twenty years ago is not frozen at its nominal value when your pension is calculated.</p>
<h2>A short career in Finland still counts</h2>
<p>Many people who move to Finland for work assume a few years will not matter. They do, in proportion: accrual is linear, so three years on ${h.eur(50000)} add ${h.eur(kk(50000) * 3)} a month for the rest of your life, before the coefficient. Nationality and residence play no role for the earnings-related part; insured pay is all that counts. Employees accrue from age ${IKA.alkaa}; self-employed people from ${IKA.alkaa + 1}. Accrual ends at ${IKA.paattyy}, and the upper retirement age for anyone born in 1962 or later is ${ylinIka}.</p>
<h2>When you are not being paid</h2>
<p>Pension keeps accruing during many benefit periods, but on a fixed share of the income the benefit is based on. The example assumes a benefit base of ${h.eur(ETUUSPOHJA)} a year, paid for a full year.</p>
${h.table(['Benefit', 'Share of base', 'Pension from one year'], [
  ['Earnings-related unemployment allowance', `${ET.ansiopaivaraha}%`, `${h.eur(etuusKk(ET.ansiopaivaraha), 2)}/mo`],
  ['Pregnancy and parental allowance', `${ET.vanhempainraha}%`, `${h.eur(etuusKk(ET.vanhempainraha), 2)}/mo`],
  ['Sickness allowance', `${ET.sairauspaivaraha}%`, `${h.eur(etuusKk(ET.sairauspaivaraha), 2)}/mo`],
  ['Rehabilitation, adult education allowance and similar', `${ET.muut}%`, `${h.eur(etuusKk(ET.muut), 2)}/mo`],
  ['Child home care allowance (notional income)', `${h.eur(KHT, 2)}/mo`, `${h.eur(KHT_VUOSI, 2)}/mo`],
], `Accrual at ${h.num(KP, 1)}%, 2026 levels`, ['l', 'r', 'r'])}
<p>Pension from unpaid periods is paid only if your career earnings reach a small statutory minimum, an amount set in euros and indexed each year. To estimate the allowance itself, use the ${h.a('ansiosidonnainen-laskuri', 'unemployment allowance calculator')}.</p>
<h2>Three careers on the same salary</h2>
<p>Holding pay at ${h.eur(URA_KK)} a month for ${h.num(URA_V)} years, the accrued monthly pension before the coefficient comes out as follows. An unbroken career gives ${h.eur(URA_A)}. Swap one year for parental allowance and two years for earnings-related unemployment allowance and you get ${h.eur(URA_B)}, only ${h.eur(URA_A - URA_B)} less, because the parental year actually earns more than a working year. Ten years part-time at ${h.pct(0.6, 0)} of the salary gives ${h.eur(URA_C)}. Accrual is linear, so part-time years simply count in proportion.</p>
<p>Holding two jobs works the same way: each employer’s insured pay accrues separately, and two ${h.eur(1500)} jobs earn exactly the pension of one ${h.eur(3000)} job, ${h.eur(PALKKA3000)} a month per year. Work after your earliest retirement age still accrues at ${h.num(KP, 1)}%, and postponing the pension adds a deferral increase on top; see ${h.a('elakkeen-lykkaaminen', 'deferring your pension')}.</p>
<h2>Contribution versus accrual</h2>
<p>Your ${h.a('tyoelakemaksu', 'pension contribution')} in 2026 is ${h.num(MAKSU.tyontekija, 2)}% of pay; employers pay ${h.num(MAKSU.tyonantaja_keskimaarin, 2)}% on average, ${h.num(MAKSU.yhteensa, 2)}% in total according to the ${h.src('etk_maksut', 'Finnish Centre for Pensions')}. The money funds current pensions and buffer funds. Your own accrual is defined by the ${h.num(KP, 1)}% rule, not by how much was paid in for you. From 2017 to 2025 some age groups paid a higher contribution and earned a higher rate; both differences are gone from 2026, and anything accrued at the old higher rate is kept.</p>
<p>Your pension record (työeläkeote) lists every employment and benefit period with the pension accrued so far. Check it after changing jobs, and enter the accrued amount in the ${h.a('elakelaskuri', 'pension calculator')} for a projection to your retirement age.</p>`,
  },
});
