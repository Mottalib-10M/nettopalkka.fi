import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { ansiopaivaraha, yleistukiKk } from '../../lib/engine/paivaraha';
import { r2 } from '../../lib/engine/params';

const T = P.tyottomyys;
const K = T.enimmaiskesto;
const [S1, S2] = T.porrastus;
const KKPV = T.tyopaivia_kuukaudessa;
/** Koko kauden kertymä: täysi taso, 1. porras ja 2. porras päivien mukaan. */
const kertyma = (palkka: number, paivat: number) => {
  const a = ansiopaivaraha(palkka);
  return r2(a.taysiPv * S1.paivia + a.porras1Pv * (S2.paivia - S1.paivia) + a.porras2Pv * Math.max(0, paivat - S2.paivia));
};
const kkMaara = (paivat: number) => paivat / KKPV;
const A3 = ansiopaivaraha(3000);
const RIVIT = [2000, 3000, 4000, 5000].map((p) => ({ p, a: ansiopaivaraha(p), k300: kertyma(p, K.lyhyt), k400: kertyma(p, K.pitka) }));
const MATALA = T.tyj_taulukko.find((r) => r[0] === 1300)!;
const ERO = r2(kertyma(3000, K.pitka) - kertyma(3000, K.lyhyt));
const YT = yleistukiKk();
const VKO = T.paivia_viikossa;
const EK = P.elake.etuuskarttuma_prosentti_perusteesta.ansiopaivaraha, KP = P.elake.karttumaprosentti;
const ELAKE_V = r2(3000 * 12 * EK / 100 * KP / 100);
const K3 = kertyma(3000, K.pitka), YT400 = r2(T.yleistuki_pv * K.pitka);
const PIENET = T.tyj_taulukko.filter((r) => r[0] <= 1500);

export default definePage({
  id: 'ansiopaivarahan-kesto',
  group: 'tuet',
  order: 20,
  mini: 'porrastus',
  related: ['ansiosidonnainen-laskuri', 'tyossaoloehto', 'yleistuki', 'elakelaskuri'],
  sources: ['tyj_porrastus', 'finlex_tyottomyysturva', 'tyj_laskenta'],
  fi: {
    slug: 'ansiopaivarahan-kesto-ja-porrastus',
    nav: 'Ansiopäivärahan kesto',
    card: 'Montako päivää ansiopäivärahaa saat ja miten porrastus pienentää sitä matkan varrella.',
    title: `Ansiopäivärahan kesto 2026: ${K.lyhyt}, ${K.pitka} vai ${K.ikaantynyt} päivää`,
    description: `Ansiopäivärahan kesto 2026: ${K.lyhyt}, ${K.pitka} tai ${K.ikaantynyt} päivää työhistorian mukaan, ja porrastus laskee päivärahan ${S1.prosentti} %:iin ${S1.paivia} päivän ja ${S2.prosentti} %:iin ${S2.paivia} päivän jälkeen.`,
    h1: 'Ansiopäivärahan kesto ja porrastus',
    intro: 'Kassan maksama ansiopäiväraha on määräaikainen ja pienenee kahdessa portaassa ensimmäisten kuukausien jälkeen.',
    resume: `Ansiosidonnaista päivärahaa maksetaan enintään ${K.lyhyt} päivältä, jos olet ollut ${FI.num(17)} vuotta täytettyäsi työssä yhteensä enintään ${K.tyohistoria_raja_v} vuotta, ja ${K.pitka} päivältä, jos työhistoriaa on enemmän. ${K.ikaantynyt} päivää saa vain se, jonka työssäoloehto täyttyy ${K.ikaantynyt_ika} vuotta täytettyään ja jolla on vähintään viisi vuotta työtä viimeisen 20 vuoden ajalta. Päiviä maksetaan ${VKO} viikossa, joten ${K.lyhyt} päivää vastaa noin ${FI.num(kkMaara(K.lyhyt), 0)} ja ${K.pitka} päivää noin ${FI.num(kkMaara(K.pitka), 0)} kuukautta. Matkan varrella päiväraha pienenee: kun sitä on maksettu ${S1.paivia} päivältä, taso laskee ${S1.prosentti} prosenttiin täydestä, ja ${S2.paivia} päivän jälkeen ${S2.prosentti} prosenttiin. ${FI.eur(3000)} kuukausipalkalla tämä tarkoittaa ${FI.eur(A3.taysiKk)}, sitten ${FI.eur(A3.porras1Kk)} ja lopulta ${FI.eur(A3.porras2Kk)} kuukaudessa. Porrastus ei koskaan vie päivärahaa alle perusosan ${FI.eur(T.perusosa_pv, 2)} päivässä. Kun enimmäisaika täyttyy, Kelan yleistuki on seuraava tuki, sillä lisäpäiviä saavat enää vuosina 1957–1964 syntyneet.`,
    faqs: [
      { q: 'Milloin ansiopäiväraha porrastuu ensimmäisen kerran?', a: `Kun päivärahaa on maksettu ${S1.paivia} päivältä. Laskuri kulkee maksettujen päivien mukaan, ei kalenterin, joten ${VKO} päivän viikoilla ensimmäinen porras tulee vastaan noin kahden kuukauden kohdalla. Toinen porras tulee vastaan, kun maksettuja päiviä on ${S2.paivia}, eli noin kahdeksan kuukauden kohdalla. Molemmat portaat lasketaan alkuperäisestä täydestä päivärahasta.` },
      { q: 'Voiko porrastettu päiväraha jäädä peruspäivärahaa pienemmäksi?', a: `Ei voi. Porrastus pienentää päivärahaa ${S1.prosentti} ja ${S2.prosentti} prosenttiin täydestä, mutta alaraja on aina perusosa ${FI.eur(T.perusosa_pv, 2)} päivässä eli noin ${FI.eur(YT)} kuukaudessa. Esimerkiksi ${FI.eur(MATALA[0])} palkalla TYJ:n taulukko antaa täydeksi päivärahaksi ${FI.eur(MATALA[1])}, ja toisen portaan jälkeen summa pysähtyy ${FI.eur(MATALA[3])} tasolle.` },
      { q: 'Montako kuukautta 400 päivää ansiopäivärahaa kestää?', a: `Noin ${FI.num(kkMaara(K.pitka), 0)} kuukautta, kun olet koko ajan kokonaan työtön. Päivärahaa maksetaan ${VKO} päivältä viikossa, ja kuukaudessa on keskimäärin ${FI.num(KKPV, 1)} maksupäivää. Kassa laskee kuitenkin maksettuja päiviä eikä kalenteria, joten jokainen väliin jäävä työjakso siirtää kauden päättymistä myöhemmäksi. ${K.lyhyt} päivän kausi kestää vastaavasti noin ${FI.num(kkMaara(K.lyhyt), 0)} kuukautta.` },
      { q: 'Paljonko ansiopäivärahaa kertyy koko kauden aikana?', a: `${FI.eur(3000)} kuukausipalkalla ${K.pitka} päivän kausi tuo porrastus huomioiden yhteensä noin ${FI.eur(K3)} ennen veroja. Saman ajan yleistuki olisi ${FI.eur(YT400)}. Ero syntyy pääosin ensimmäisten kahdeksan kuukauden aikana, koska täysi taso ja ensimmäinen porras ovat selvästi yleistukea korkeampia. Oman summasi näet sivun minilaskurista, kun syötät palkan ja työvuodet.` },
      { q: 'Kuka saa 500 päivää ansiopäivärahaa?', a: `Se, jonka työssäoloehto täyttyy hänen täytettyään ${K.ikaantynyt_ika} vuotta ja jolla on työssäoloaikaa vähintään viisi vuotta viimeisen 20 vuoden aikana. Ikä ratkaistaan ehdon täyttymishetkellä, ei työttömäksi jäämisen päivänä. Muille enimmäisaika on ${K.pitka} päivää, jos työhistoriaa on yli ${K.tyohistoria_raja_v} vuotta, ja muuten ${K.lyhyt} päivää.` },
      { q: 'Kenellä on vielä oikeus työttömyysturvan lisäpäiviin?', a: `Vain vuosina 1957–1964 syntyneillä, jos muut ehdot täyttyvät. Vuonna 1965 tai sen jälkeen syntyneillä lisäpäiviä ei ole, joten heidän ansiopäivärahansa päättyy enimmäisajan täyttyessä riippumatta iästä. Sen jälkeen työtön voi hakea Kelasta yleistukea, joka on ${FI.eur(T.yleistuki_pv, 2)} päivässä ja keskimäärin ${FI.eur(YT)} kuukaudessa.` },
      { q: 'Alkaako ansiopäivärahan enimmäisaika joskus alusta?', a: `Alkaa, kun olet ollut töissä ${T.tyossaoloehto_kk} kuukautta ja saanut palkkaa vähintään ${FI.eur(T.tyossaoloehto_palkka_kk)} kuukaudessa. Silloin päiväraha lasketaan uudelleen uusista palkoista, porrastus nollautuu ja kausi alkaa täydestä tasosta. Uuden kauden alussa on taas ${T.omavastuupaivat} päivän omavastuuaika, jolta päivärahaa ei makseta. Lyhyemmät työjaksot eivät riitä nollaamiseen.` },
    ],
    body: (h) => `
<h2>Kolme enimmäisaikaa</h2>
<p>Enimmäiskesto riippuu siitä, kuinka pitkään olet ollut työelämässä ${h.num(17)} vuoden iän jälkeen. Raja on ${K.tyohistoria_raja_v} vuotta: enintään sen verran työtä kerryttänyt saa ${K.lyhyt} päivää, ja pidempi työura oikeuttaa ${K.pitka} päivään. Pisin ${K.ikaantynyt} päivän kausi on varattu niille, joiden työssäoloehto täyttyy ${K.ikaantynyt_ika} vuoden iässä tai myöhemmin ja joilla on vähintään viisi vuotta työtä viimeisen 20 vuoden ajalta.</p>
<p>Työvuodet lasketaan yhteen, eikä niiden tarvitse olla peräkkäisiä tai saman työnantajan palveluksessa. Kaksi kahden vuoden työsuhdetta eri yrityksissä ylittää siis ${K.tyohistoria_raja_v} vuoden rajan, vaikka välissä olisi ollut opiskelua tai työttömyyttä. Rajan ylittyminen kannattaa tarkistaa kassan päätöksestä, sillä ${K.pitka - K.lyhyt} päivän ero vastaa noin ${h.num(kkMaara(K.pitka - K.lyhyt), 1)} kuukauden päivärahaa alimman portaan tasolla.</p>
<p>Päivät ovat maksupäiviä. Kokonaan työttömälle päivärahaa maksetaan ${VKO} päivältä viikossa, joten ${K.lyhyt} päivää kuluu noin ${h.num(kkMaara(K.lyhyt), 1)} kuukaudessa ja ${K.pitka} päivää noin ${h.num(kkMaara(K.pitka), 1)} kuukaudessa. Kauden alussa on ${T.omavastuupaivat} päivän omavastuuaika, jolta päivärahaa ei makseta lainkaan.</p>
<h2>Porrastus kahdessa vaiheessa</h2>
<p>Porrastus tuli voimaan 2.9.2024. Täysi päiväraha maksetaan ${S1.paivia} ensimmäiseltä maksupäivältä. Sen jälkeen koko päiväraha on ${S1.prosentti} % täydestä, ja kun päiviä on kertynyt ${S2.paivia}, taso laskee ${S2.prosentti} prosenttiin. Prosentit lasketaan aina alkuperäisestä täydestä määrästä, eivät edellisestä portaasta. Perusosaa ei porrasteta, joten pienipalkkaisen päiväraha pysähtyy ${h.eur(T.perusosa_pv, 2)} päivätasolle.</p>
${h.table(['Palkka/kk', `Päivät 1–${S1.paivia}`, `${S1.paivia + 1}–${S2.paivia}`, `${S2.paivia + 1}–`, `Yhteensä ${K.lyhyt} pv`, `Yhteensä ${K.pitka} pv`], RIVIT.map((r) => [h.eur(r.p), h.eur(r.a.taysiKk), h.eur(r.a.porras1Kk), h.eur(r.a.porras2Kk), h.eur(r.k300), h.eur(r.k400)]), 'Ansiopäiväraha kuukaudessa porrastuksen eri vaiheissa ja koko kauden kertymä ennen veroja, 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Taulukon kuukausisummat vastaavat TYJ:n vuoden 2026 ansiopäivärahataulukkoa euron tarkkuudella. Viimeiset sarakkeet näyttävät, mitä koko kausi tuo yhteensä. ${h.eur(3000)} palkalla pidempi kausi tuo ${h.eur(ERO)} enemmän, koska kaikki lisäpäivät maksetaan alimman portaan tasolla.</p>
<h2>Porrastus päivätasolla</h2>
<p>Kassa maksaa päivärahan päivinä, joten porrastuksenkin näkee selvimmin päiväsummista. ${h.eur(3000)} kuukausipalkasta laskettu täysi päiväraha on ${h.eur(A3.taysiPv, 2)}. Ensimmäisen portaan jälkeen samalle päivälle maksetaan ${h.eur(A3.porras1Pv, 2)} ja toisen jälkeen ${h.eur(A3.porras2Pv, 2)}. Kuukausisummat syntyvät kertomalla päiväsumma luvulla ${h.num(KKPV, 1)}, joten ne vaihtelevat hieman kuukauden arkipäivien mukaan.</p>
<h2>Pienipalkkaisen porrastus</h2>
<p>Pienillä palkoilla porrastus puree vähemmän, koska perusosa toimii lattiana. TYJ:n taulukossa näkyy, miten nopeasti lattia tulee vastaan:</p>
${h.table(['Palkka/kk', 'Täysi', `${S1.prosentti} %`, `${S2.prosentti} %`], PIENET.map((r) => [h.eur(r[0]), h.eur(r[1]), h.eur(r[2]), h.eur(r[3])]), 'TYJ:n ansiopäivärahataulukko 2026, pienimmät palkat, euroa kuukaudessa', ['l', 'r', 'r', 'r'])}
<p>${h.eur(PIENET[0][0])} palkalla päiväraha on jo valmiiksi lähellä perusosaa, koska se voi olla enintään ${T.enintaan_prosentti_paivapalkasta} % päiväpalkasta. Molemmat portaat pysähtyvät siksi ${h.eur(PIENET[0][2])} tasolle. ${h.eur(PIENET[1][0])} palkalla ensimmäinen porras vie summan käytännössä lattiaan. Vasta ${h.eur(PIENET[2][0])} palkasta ylöspäin toinen porras pienentää päivärahaa vielä erikseen.</p>
<h2>Mitä porrastus tarkoittaa budjetille</h2>
<p>Suurin pudotus tulee jo kahden kuukauden kohdalla. ${h.eur(3000)} palkalla ensimmäisen portaan jälkeen kuukausitulo laskee ${h.eur(A3.taysiKk - A3.porras1Kk)}, ja toinen porras vie vielä ${h.eur(A3.porras1Kk - A3.porras2Kk)} lisää. Monelle ensimmäinen leikkaus osuu samaan aikaan, kun irtisanomisajan palkka ja lomakorvaus on jo käytetty. Jos maksat vuokraa yksin, tarkista tässä vaiheessa ${h.a('yleistuki', 'Kelan tuet')} ja asumistuen tuloraja, sillä pienempi päiväraha voi avata oikeuden asumistukeen.</p>
<p>Veroprosentti ei muutu porrastuksen myötä itsestään. Ansiopäivärahasta pidätetään vähintään ${T.ennakonpidatys_vahintaan} %, jos käytössä on palkkaa varten laskettu verokortti, ja moni maksaa porrastetusta päivärahasta silloin liikaa veroa. Uusi verokortti, jossa päiväraha on arvioitu koko vuoden tuloksi, korjaa pidätyksen vastaamaan pienentynyttä tuloa.</p>
<h2>Työ välissä: milloin laskuri nollautuu</h2>
<p>Lyhyet työjaksot eivät nollaa kautta. Jos teet töitä muutaman kuukauden ja jäät taas työttömäksi, jo maksetut päivät pysyvät laskurissa. Enimmäisaika alkaa alusta vasta, kun olet ollut ${T.tyossaoloehto_kk} kuukautta työssä ja palkka on ollut vähintään ${h.eur(T.tyossaoloehto_palkka_kk)} kuukaudessa. Silloin päiväraha lasketaan uudelleen uuden työn palkoista, ja kausi alkaa täydeltä tasolta. Ehdon laskutapa on selitetty sivulla ${h.a('tyossaoloehto', 'työssäoloehto')}.</p>
<h2>Kun päivät loppuvat</h2>
<p>Kun enimmäisaika täyttyy, vuonna 1965 tai myöhemmin syntynyt siirtyy Kelan yleistuelle, joka on ${h.eur(T.yleistuki_pv, 2)} päivässä eli sama kuin perusosa. Lisäpäivät koskevat enää vuosina 1957–1964 syntyneitä. Päivärahalta kertyy myös eläkettä, joten pitkä työttömyys näkyy ${h.a('elakelaskuri', 'eläkelaskelmassa')} pienempänä karttumana kuin työ, mutta ei nollana. Eläkettä kertyy ${h.num(KP, 1)} % vuodessa, mutta vain ${h.num(EK)} prosentista sitä palkkaa, jonka mukaan päiväraha on laskettu. ${h.eur(3000)} palkalla vuosi ansiopäivärahalla kasvattaa tulevaa eläkettä noin ${h.eur(ELAKE_V)} vuodessa, kun saman ajan työ olisi kerryttänyt ${h.eur(r2(3000 * 12 * KP / 100))}.</p>
<p>Oman palkkasi porrastetut summat saat ${h.a('ansiosidonnainen-laskuri', 'ansiopäivärahalaskurista')}. Lähteet: ${h.src('tyj_porrastus', 'TYJ, ansiopäivärahan porrastus')}, ${h.src('tyj_laskenta', 'TYJ, näin ansiopäiväraha lasketaan')} ja ${h.src('finlex_tyottomyysturva', 'työttömyysturvalaki 1290/2002')}.</p>`,
  },
  en: {
    slug: 'unemployment-allowance-duration',
    nav: 'Allowance duration',
    card: 'How many days of earnings-related allowance you get and how the step-down shrinks it.',
    title: 'Unemployment Allowance Duration 2026: Step-Down by Day',
    description: `Unemployment allowance duration 2026: ${K.lyhyt}, ${K.pitka} or ${K.ikaantynyt} days by work history. The allowance falls to ${S1.prosentti}% once ${S1.paivia} days are paid and to ${S2.prosentti}% from day ${S2.paivia + 1} on.`,
    h1: 'How long the earnings-related allowance lasts',
    intro: 'Your unemployment fund pays for a fixed number of days, and the amount drops twice along the way.',
    resume: `The earnings-related unemployment allowance (ansiopäiväraha) from a Finnish unemployment fund lasts ${K.lyhyt} paid days if you have worked a total of ${K.tyohistoria_raja_v} years or less since turning 17, and ${K.pitka} days with a longer work history. Only people who meet the employment condition at ${K.ikaantynyt_ika} or older, with at least five years of work in the past 20, get ${K.ikaantynyt} days. Payment covers ${VKO} days a week, so ${K.pitka} days is about ${EN.num(kkMaara(K.pitka), 0)} months of full unemployment. Since September 2024 the amount steps down twice: after ${S1.paivia} paid days you receive ${S1.prosentti}% of your original allowance, and after ${S2.paivia} days ${S2.prosentti}%. On a ${EN.eur(3000)} salary that means ${EN.eur(A3.taysiKk)}, then ${EN.eur(A3.porras1Kk)}, then ${EN.eur(A3.porras2Kk)} a month before tax. The step-down never pushes you below the base part of ${EN.eur(T.perusosa_pv, 2)} a day. When your days run out, Kela’s general support (yleistuki) takes over; extension days exist only for people born between 1957 and 1964.`,
    faqs: [
      { q: 'Does the unemployment allowance get cut after two months in Finland?', a: `Yes, after ${S1.paivia} paid days, which at ${VKO} days a week is roughly two months of full unemployment. From then on you get ${S1.prosentti}% of your original daily allowance, and after ${S2.paivia} paid days ${S2.prosentti}%. The second cut comes at around eight months. The base part of ${EN.eur(T.perusosa_pv, 2)} a day is never reduced.` },
      { q: 'Do I get 300 or 400 days of unemployment allowance?', a: `It depends on your total work history after age 17. With ${K.tyohistoria_raja_v} years or less you get ${K.lyhyt} days, about ${EN.num(kkMaara(K.lyhyt), 0)} months; with more, ${K.pitka} days. The fund counts years, not employers, so several short contracts add up the same way as one long job. Check the figure on your fund’s decision.` },
      { q: 'What happens when my 400 days of unemployment allowance end?', a: `Your fund stops paying and you can apply for Kela’s general support, ${EN.eur(T.yleistuki_pv, 2)} a day or about ${EN.eur(YT)} a month. People born in 1965 or later have no extension days. The fund period restarts only after ${T.tyossaoloehto_kk} months of work paying at least ${EN.eur(T.tyossaoloehto_palkka_kk)} a month each, with a new ${T.omavastuupaivat}-day waiting period.` },
      { q: 'Is a longer allowance period worth much if it is all paid at the lowest step?', a: `On ${EN.eur(3000)} a month, the ${K.pitka}-day period pays ${EN.eur(ERO)} more in total than the ${K.lyhyt}-day one, all of it at the ${S2.prosentti}% level of ${EN.eur(A3.porras2Kk)} a month. That is still well above the ${EN.eur(YT)} of general support, so the extra 100 days are worth roughly four and a half months of income.` },
    ],
    body: (h) => `
<h2>Which maximum applies to you</h2>
<p>The fund looks at how many years you have worked since your 17th birthday. Up to ${K.tyohistoria_raja_v} years gives ${K.lyhyt} paid days; more than that gives ${K.pitka}. The ${K.ikaantynyt}-day maximum is only for people whose employment condition is met at ${K.ikaantynyt_ika} or older and who have at least five years of work within the last 20. Years are added up across employers and need not be consecutive. For someone who moved to Finland mid-career, the Finnish work record is what the fund sees first, so ask your fund how earlier work abroad is treated.</p>
<p>Days are paid days, not calendar days. A fully unemployed member is paid for ${VKO} days a week, so ${K.lyhyt} days last about ${h.num(kkMaara(K.lyhyt), 1)} months and ${K.pitka} days about ${h.num(kkMaara(K.pitka), 1)} months. The first ${T.omavastuupaivat} days of each period are an unpaid waiting period (omavastuuaika).</p>
<h2>The two step-downs</h2>
<p>The step-down (porrastus) has applied since 2 September 2024. The first ${S1.paivia} paid days are at the full rate. After that the whole allowance is ${S1.prosentti}% of the original, and from day ${S2.paivia + 1} it is ${S2.prosentti}%. Both percentages are taken from the original full amount. The base part is protected, so a low earner’s allowance stops falling at ${h.eur(T.perusosa_pv, 2)} a day.</p>
${h.table(['Salary/month', `Days 1–${S1.paivia}`, `${S1.paivia + 1}–${S2.paivia}`, `${S2.paivia + 1} on`, `Total ${K.lyhyt} days`, `Total ${K.pitka} days`], RIVIT.map((r) => [h.eur(r.p), h.eur(r.a.taysiKk), h.eur(r.a.porras1Kk), h.eur(r.a.porras2Kk), h.eur(r.k300), h.eur(r.k400)]), 'Monthly allowance at each step and total over the period, before tax, 2026', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The monthly figures match the 2026 allowance table published by TYJ, the funds’ cooperation body, to the euro. The totals show the real value of the period: on ${h.eur(3000)} the extra 100 days add ${h.eur(ERO)}, all paid at the lowest step.</p>
<h2>The step-down in daily euros</h2>
<p>Funds pay per day, so the cleanest way to see the cut is the daily figure. A ${h.eur(3000)} monthly salary gives a full allowance of ${h.eur(A3.taysiPv, 2)} a day, then ${h.eur(A3.porras1Pv, 2)}, then ${h.eur(A3.porras2Pv, 2)}. Monthly totals are those daily sums multiplied by ${h.num(KKPV, 1)}, so a month with more weekdays pays slightly more.</p>
<h2>Low salaries hit the floor quickly</h2>
${h.table(['Salary/month', 'Full', `${S1.prosentti}%`, `${S2.prosentti}%`], PIENET.map((r) => [h.eur(r[0]), h.eur(r[1]), h.eur(r[2]), h.eur(r[3])]), 'TYJ allowance table 2026, lowest salaries, euros per month', ['l', 'r', 'r', 'r'])}
<p>At ${h.eur(PIENET[0][0])} the allowance is already capped at ${T.enintaan_prosentti_paivapalkasta}% of the daily wage, so both steps stop at the floor of ${h.eur(PIENET[0][2])}. At ${h.eur(PIENET[1][0])} the first step practically reaches it. Only from about ${h.eur(PIENET[2][0])} upward does the second step take a further bite. Part-time workers on low pay therefore lose far less to the step-down than the percentages suggest.</p>
<h2>Planning around the drops</h2>
<p>The biggest fall comes early. On ${h.eur(3000)} the first step takes ${h.eur(A3.taysiKk - A3.porras1Kk)} off your monthly income, and the second removes another ${h.eur(A3.porras1Kk - A3.porras2Kk)}. That often lands just as your notice-period pay and holiday compensation have been spent. If you rent alone, this is the moment to check Kela’s housing allowance and ${h.a('yleistuki', 'general support rules')}: a smaller allowance can bring you under the housing income limit.</p>
<p>Tax deserves a look too. If you use a tax card calculated for wages, at least ${T.ennakonpidatys_vahintaan}% is withheld from the allowance. After the step-downs that is often more than the year’s real tax, so a new tax card estimating the year’s real income keeps more money in your account each month instead of in next year’s refund.</p>
<h2>Short jobs do not reset the clock</h2>
<p>A few months of work in between does not restart the count: the days already paid stay on your record. A fresh period with a new full rate starts only after ${T.tyossaoloehto_kk} months of work paying at least ${h.eur(T.tyossaoloehto_palkka_kk)} each, and the allowance is then recalculated from the new salary. The rules for counting those months are on the ${h.a('tyossaoloehto', 'employment condition')} page.</p>
<h2>After the last day</h2>
<p>Once the maximum is reached, members born in 1965 or later move to Kela’s general support at ${h.eur(T.yleistuki_pv, 2)} a day, the same as the base part. Extension days (lisäpäivät) are limited to people born between 1957 and 1964. Time on the allowance still accrues earnings-related pension: ${h.num(KP, 1)}% a year on ${h.num(EK)}% of the salary behind your allowance. On ${h.eur(3000)}, a year of unemployment adds about ${h.eur(ELAKE_V)} to your annual pension, against ${h.eur(r2(3000 * 12 * KP / 100))} for a year of work. The ${h.a('elakelaskuri', 'pension calculator')} shows what that gap means at retirement.</p>
<p>Put your own salary into the ${h.a('ansiosidonnainen-laskuri', 'unemployment allowance calculator')}. Sources: ${h.src('tyj_porrastus', 'TYJ, step-down rules')}, ${h.src('tyj_laskenta', 'TYJ, how the allowance is calculated')} and ${h.src('finlex_tyottomyysturva', 'Unemployment Security Act 1290/2002')}.</p>`,
  },
});
