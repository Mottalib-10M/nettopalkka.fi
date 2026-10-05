import { definePage } from '../../lib/guide-types';
import { P, FI, EN } from '../../lib/fmt';
import { ansiopaivaraha, yleistukiKk } from '../../lib/engine/paivaraha';
import { laskeVerot } from '../../lib/engine/vero';

const T = P.tyottomyys, K = T.enimmaiskesto;
const [S1, S2] = T.porrastus;
const TAITE_KK = T.taitekohta_kerroin * T.perusosa_pv;
const PALKKA = 3000;
const A = ansiopaivaraha(PALKKA);
/** Ennakonpidätys: etuuden veroprosentti, kuitenkin vähintään 25 % palkan verokortilla. */
const pidatys = (kk: number) => Math.max(T.ennakonpidatys_vahintaan, laskeVerot({ tulo: kk * 12, tulolaji: 'etuus', kunta: 'Helsinki' }).veroprosentti);
const PID = pidatys(A.taysiKk);
const NETTO = A.taysiKk * (1 - PID / 100);
const TYJ = T.tyj_taulukko.map(([palkka, taysi]) => ({ palkka, taysi, a: ansiopaivaraha(palkka) }));
const YT = yleistukiKk();
const A5000 = ansiopaivaraha(5000);
const PORRAS_EUR = A.taysiKk - A.porras2Kk;

export default definePage({
  id: 'ansiosidonnainen-laskuri',
  group: 'laskurit',
  order: 90,
  tool: 'ansiopaivaraha',
  related: ['ansiopaivarahan-kesto', 'tyossaoloehto', 'yleistuki', 'elakelaskuri'],
  sources: ['tyj_laskenta', 'tyj_porrastus', 'tyj_taulukko', 'finlex_tyottomyysturva'],
  fi: {
    slug: 'ansiosidonnainen-paivaraha',
    nav: 'Ansiosidonnainen päiväraha',
    card: 'Ansiosidonnainen työttömyyspäiväraha palkasta, porrastus, enimmäiskesto ja käteen jäävä määrä.',
    title: 'Ansiosidonnainen päiväraha 2026: laskuri ja porrastus',
    description: `Ansiosidonnainen päiväraha 2026: laske työttömyyskassan päiväraha, porrastus ja kesto palkastasi TYJ:n kaavalla. ${FI.eur(PALKKA)} palkalla noin ${FI.eur(A.taysiKk)} kuussa.`,
    h1: 'Ansiosidonnaisen päivärahan laskuri',
    intro: 'Syötä keskimääräinen bruttopalkkasi, työhistoria ja ikä, niin näet päivärahan, sen porrastuksen ja enimmäiskeston.',
    resume: `Vuonna 2026 ${FI.eur(PALKKA)} kuukausipalkalla ansiosidonnainen päiväraha on ${FI.eur(A.taysiPv, 2)} päivässä eli noin ${FI.eur(A.taysiKk)} kuukaudessa ennen veroja. Se muodostuu perusosasta ${FI.eur(T.perusosa_pv, 2)} päivässä ja ansio-osasta, joka on ${FI.p(T.ansio_osa_prosentti, 0)} päiväpalkan ja perusosan erotuksesta. Kun kuukausipalkka ylittää taitekohdan ${FI.eur(TAITE_KK, 2)}, ylittävältä osalta ansio-osa on vain ${FI.p(T.ansio_osa_yli_taitekohdan, 0)}. Päiväpalkka saadaan, kun palkasta vähennetään ${FI.p(T.vahennettava_prosentti)} ja tulos jaetaan luvulla ${FI.num(T.tyopaivia_kuukaudessa, 1)}. Päiväraha porrastuu: ${S1.paivia} maksupäivän jälkeen se on ${FI.p(S1.prosentti, 0)} ja ${S2.paivia} päivän jälkeen ${FI.p(S2.prosentti, 0)} alkuperäisestä, mutta ei koskaan perusosaa pienempi. Ennen ensimmäistä maksupäivää on ${T.omavastuupaivat} päivän omavastuuaika, ja päivärahaa maksetaan ${T.paivia_viikossa} päivältä viikossa. Laskuri käyttää työttömyyskassojen yhteisjärjestön TYJ:n laskentatapaa ja toistaa sen vuoden 2026 taulukon euron tarkkuudella. Ansiopäivärahaa saa vain työttömyyskassan jäsen, joka täyttää työssäoloehdon; muut saavat Kelan yleistukea, joka on perusosan suuruinen ja jää ${FI.eur(PALKKA)} palkkaan verrattuna selvästi pienemmäksi.`,
    faqs: [
      { q: 'Paljonko ansiosidonnaista saa 3 000 euron palkalla?', a: `Täysi päiväraha on ${FI.eur(A.taysiPv, 2)} päivässä eli noin ${FI.eur(A.taysiKk)} kuukaudessa bruttona. ${S1.paivia} maksupäivän jälkeen se laskee noin ${FI.eur(A.porras1Kk)} tasolle ja ${S2.paivia} päivän jälkeen ${FI.eur(A.porras2Kk)} tasolle kuukaudessa. Verojen jälkeen alussa jää noin ${FI.eur(NETTO)}, kun pidätys on ${FI.num(PID, 0)} %. Palkkana käytetään työssäoloehdon kuukausien keskimääräistä bruttopalkkaa ilman lomarahaa.` },
      { q: 'Milloin ansiopäiväraha porrastuu pienemmäksi?', a: `Kun päivärahaa on maksettu ${S1.paivia} päivältä, se on ${FI.p(S1.prosentti, 0)} alkuperäisestä, ja ${S2.paivia} maksupäivän jälkeen ${FI.p(S2.prosentti, 0)}. Viiden päivän maksuviikoilla ensimmäinen porras tulee noin kahden ja toinen noin kahdeksan kuukauden kohdalla. Perusosaa ${FI.eur(T.perusosa_pv, 2)} ei porrasteta. ${FI.eur(PALKKA)} palkalla porrastus pienentää päivärahaa lopulta noin ${FI.eur(PORRAS_EUR)} kuukaudessa.` },
      { q: 'Kuinka monta päivää ansiosidonnaista maksetaan?', a: `Enintään ${K.lyhyt} päivää, jos olet ollut ${P.elake.karttuma_ika.alkaa} vuotta täytettyäsi töissä enintään ${K.tyohistoria_raja_v} vuotta, ja ${K.pitka} päivää, jos työhistoriaa on enemmän. ${K.ikaantynyt} päivää maksetaan, jos työssäoloehto täyttyi ${K.ikaantynyt_ika} vuotta täytettyäsi ja sinulla on laissa vaadittu määrä työhistoriaa viime vuosilta. Laskuri valitsee keston syöttämäsi työhistorian ja iän mukaan.` },
      { q: 'Paljonko ansiosidonnaisesta päivärahasta menee veroa?', a: `Päiväraha on veronalaista tuloa. Jos käytät palkkaa varten tehtyä verokorttia, kassa pidättää vähintään ${FI.p(T.ennakonpidatys_vahintaan, 0)}, vaikka palkan prosentti olisi pienempi. Laskuri laskee etuuden veroprosentin koko vuoden päivärahasta ja käyttää vähintään tätä rajaa: ${FI.eur(PALKKA)} palkan päivärahasta pidätetään ${FI.num(PID, 0)} %. Erillinen etuuden verokortti voi antaa tarkemman prosentin.` },
      { q: 'Mitä saan työttömänä, jos en kuulu työttömyyskassaan?', a: `Kelan yleistukea, joka korvasi peruspäivärahan ja työmarkkinatuen ${T.yleistuki_alkaen.split('-').reverse().map(Number).join('.')} alkaen. Se on ${FI.eur(T.yleistuki_pv, 2)} päivässä eli keskimäärin ${FI.eur(YT, 2)} kuukaudessa, saman verran kuin ansiopäivärahan perusosa. ${FI.eur(PALKKA)} palkalla kassan jäsen saisi siis noin ${FI.eur(A.taysiKk - YT)} kuukaudessa enemmän ennen porrastusta. Kassan jäsenmaksut voi vähentää verotuksessa, joten jäsenyyden todellinen hinta on maksua pienempi.` },
    ],
    body: (h) => `
<h2>Laskuri ja TYJ:n taulukko 2026</h2>
<p>Laskuri käyttää ${h.src('tyj_laskenta', 'TYJ:n julkaisemaa laskentatapaa')}. Taulukossa on sen tulos rinnakkain ${h.src('tyj_taulukko', 'TYJ:n vuoden 2026 ansiopäivärahataulukon')} kanssa sekä porrastetut kuukausimäärät. Pienellä palkalla katto ${h.num(T.enintaan_prosentti_paivapalkasta)} % päiväpalkasta rajoittaa päivärahaa, ja porrastetut määrät jäävät perusosan tasolle ${h.eur(YT, 2)}.</p>
${h.table(['Palkka/kk', 'Täysi (laskuri)', 'Täysi (TYJ)', `${S1.prosentti} %`, `${S2.prosentti} %`], TYJ.map((x) => [h.eur(x.palkka), h.eur(x.a.taysiKk), h.eur(x.taysi), h.eur(x.a.porras1Kk), h.eur(x.a.porras2Kk)]), 'Ansiopäiväraha kuukaudessa bruttona, vuosi 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>Laskentakaava vaihe vaiheelta</h2>
<ol>
<li><strong>Päiväpalkka:</strong> työssäoloehdon kuukausien bruttopalkat ilman lomarahaa ja lomakorvausta, vähennettynä ${h.num(T.vahennettava_prosentti, 2)} %:lla, jaettuna ${h.num(T.tyopaivia_kuukaudessa, 1)} työpäivällä kuukautta kohden. ${h.eur(PALKKA)} palkasta päiväpalkka on ${h.eur(A.paivapalkka, 2)}.</li>
<li><strong>Perusosa:</strong> ${h.eur(T.perusosa_pv, 2)} päivässä kaikille.</li>
<li><strong>Ansio-osa:</strong> ${h.num(T.ansio_osa_prosentti)} % päiväpalkan ja perusosan erotuksesta. Taitekohdan ${h.eur(TAITE_KK, 2)} kuukaudessa ylittävältä osalta ${h.num(T.ansio_osa_yli_taitekohdan)} %.</li>
<li><strong>Katto:</strong> enintään ${h.num(T.enintaan_prosentti_paivapalkasta)} % päiväpalkasta, kuitenkin vähintään perusosa.</li>
<li><strong>Kuukausi:</strong> päiväraha × ${h.num(T.tyopaivia_kuukaudessa, 1)}.</li>
</ol>
<p>Taitekohta selittää, miksi suurituloisen päiväraha kasvaa hitaasti: ${h.eur(5000)} palkalla täysi päiväraha on ${h.eur(A5000.taysiKk)} kuukaudessa, eli alle puolet palkasta. Laskukaavassa ei ole lapsikorotuksia.</p>
<h2>Paljonko palkasta korvataan</h2>
<p>Korvausaste laskee palkan noustessa. Pienillä palkoilla perusosa nostaa päivärahan suhteellisesti korkeaksi, ja ${h.num(T.enintaan_prosentti_paivapalkasta)} prosentin katto tulee vastaan. Taitekohdan jälkeen jokaisesta lisäeurosta korvataan enää ${h.num(T.ansio_osa_yli_taitekohdan)} senttiä. Taulukon luvuista näkee, että ${h.eur(2000)} palkasta täysi päiväraha on ${h.num(TYJ[3].a.taysiKk / 2000 * 100)} %, ${h.eur(PALKKA)} palkasta ${h.num(A.taysiKk / PALKKA * 100)} % ja ${h.eur(5000)} palkasta ${h.num(A5000.taysiKk / 5000 * 100)} %, ennen veroja ja porrastusta. Porrastus pienentää osuutta vielä ${h.num(S1.paivia)} ja ${h.num(S2.paivia)} maksupäivän jälkeen.</p>
<h2>Oikeus päivärahaan</h2>
<ul>
<li><strong>Kassan jäsenyys:</strong> ansiopäivärahaa maksaa työttömyyskassa jäsenilleen.</li>
<li><strong>Työssäoloehto:</strong> ${h.num(T.tyossaoloehto_kk)} kuukautta työtä, jolloin kuukausi lasketaan täydeksi vähintään ${h.eur(T.tyossaoloehto_palkka_kk)} palkalla ja puolikkaaksi ${h.eur(T.tyossaoloehto_puolikas_kk)} palkalla. Tarkemmin sivulla ${h.a('tyossaoloehto', 'työssäoloehto')}.</li>
<li><strong>Omavastuuaika:</strong> ${h.num(T.omavastuupaivat)} päivää ilman korvausta päivärahakauden alussa.</li>
<li><strong>Kesto:</strong> ${h.num(K.lyhyt)}, ${h.num(K.pitka)} tai ${h.num(K.ikaantynyt)} päivää; porrastus ja kesto käydään läpi sivulla ${h.a('ansiopaivarahan-kesto', 'ansiopäivärahan kesto ja porrastus')}.</li>
</ul>
<p>Laskuri ei tunne soviteltua päivärahaa osa-aikatyön ajalta eikä muiden etuuksien vaikutusta. Kassa laskee tarkan määrän tulorekisterin palkkatiedoista. Säännöt ovat ${h.src('finlex_tyottomyysturva', 'työttömyysturvalaissa')} ja porrastus ${h.src('tyj_porrastus', 'TYJ:n porrastussivulla')}. Ilman kassan jäsenyyttä työtön saa ${h.a('yleistuki', 'yleistukea')}. Ansiopäivärahakaudelta karttuu myös työeläkettä, ks. ${h.a('elakelaskuri', 'eläkelaskuri')}.</p>`,
  },
  en: {
    slug: 'unemployment-allowance-calculator',
    nav: 'Unemployment allowance calculator',
    card: 'Finland’s earnings-related unemployment allowance from your salary, with step-downs, duration and take-home pay.',
    title: 'Unemployment Benefit Finland 2026: Earnings-Related Pay',
    description: `Unemployment benefit Finland 2026: calculate the earnings-related allowance your kassa pays, using the TYJ formula. ${EN.eur(PALKKA)} salary gives about ${EN.eur(A.taysiKk)} a month.`,
    h1: 'Finnish earnings-related unemployment allowance calculator',
    intro: 'Enter your average gross salary, work history and age to see the allowance, its step-downs and how long it lasts.',
    resume: `In 2026 an employee who earned ${EN.eur(PALKKA)} a month gets an earnings-related unemployment allowance (ansiosidonnainen päiväraha) of ${EN.eur(A.taysiPv, 2)} a day, about ${EN.eur(A.taysiKk)} a month before tax. It has a basic part of ${EN.eur(T.perusosa_pv, 2)} a day plus an earnings part of ${EN.p(T.ansio_osa_prosentti, 0)} of the difference between your daily wage and the basic part; above the break point of ${EN.eur(TAITE_KK, 2)} a month, the earnings part drops to ${EN.p(T.ansio_osa_yli_taitekohdan, 0)}. The daily wage is your salary minus ${EN.p(T.vahennettava_prosentti)}, divided by ${EN.num(T.tyopaivia_kuukaudessa, 1)}. The allowance steps down to ${EN.p(S1.prosentti, 0)} after ${S1.paivia} paid days and to ${EN.p(S2.prosentti, 0)} after ${S2.paivia}, but never below the basic part. There is a ${T.omavastuupaivat}-day waiting period, and it is paid for ${T.paivia_viikossa} days a week. You must be a member of an unemployment fund (työttömyyskassa) and meet the employment condition; otherwise Kela pays the general support (yleistuki). The calculator follows the method of TYJ, the unemployment funds’ joint body, and matches its 2026 table to the euro.`,
    faqs: [
      { q: 'How much unemployment benefit do I get in Finland on a €3,000 salary?', a: `The full allowance is ${EN.eur(A.taysiPv, 2)} a day, about ${EN.eur(A.taysiKk)} a month gross. After ${S1.paivia} paid days it falls to about ${EN.eur(A.porras1Kk)} and after ${S2.paivia} to ${EN.eur(A.porras2Kk)} a month. At first about ${EN.eur(NETTO)} remains after ${EN.num(PID, 0)}% withholding. Your fund uses the average gross pay over the qualifying months, without holiday bonus.` },
      { q: 'When does the Finnish earnings-related allowance step down?', a: `After ${S1.paivia} paid days it is ${EN.p(S1.prosentti, 0)} of the original amount, and after ${S2.paivia} days ${EN.p(S2.prosentti, 0)}. With five paid days a week that is roughly two and eight months in. The basic part of ${EN.eur(T.perusosa_pv, 2)} is never reduced. On a ${EN.eur(PALKKA)} salary the step-downs eventually cost about ${EN.eur(PORRAS_EUR)} a month.` },
      { q: 'How long is earnings-related unemployment allowance paid?', a: `Up to ${K.lyhyt} days if you have worked no more than ${K.tyohistoria_raja_v} years since age ${P.elake.karttuma_ika.alkaa}, and ${K.pitka} days with a longer history. It is ${K.ikaantynyt} days if you met the employment condition at ${K.ikaantynyt_ika} or older and have the recent work history the law requires. The calculator picks the duration from the work history and age you enter.` },
      { q: 'What tax rate applies to the earnings-related allowance?', a: `The allowance is taxable. If you give your fund the tax card made for wages, it withholds at least ${EN.p(T.ennakonpidatys_vahintaan, 0)}, even when your salary rate is lower. The calculator works out the benefit tax rate on a full year of allowance and applies at least that floor: ${EN.num(PID, 0)}% on the allowance from a ${EN.eur(PALKKA)} salary. A separate tax card for benefits can give a more accurate rate.` },
      { q: 'What do I get if I am not a member of an unemployment fund?', a: `Kela’s general support (yleistuki), which replaced the basic unemployment allowance and labour market subsidy from ${new Date(T.yleistuki_alkaen).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. It is ${EN.eur(T.yleistuki_pv, 2)} a day, about ${EN.eur(YT, 2)} a month, the same as the basic part. On a ${EN.eur(PALKKA)} salary, a fund member would get roughly ${EN.eur(A.taysiKk - YT)} a month more before step-downs.` },
    ],
    body: (h) => `
<h2>The calculator against TYJ’s 2026 table</h2>
<p>The calculator follows ${h.src('tyj_laskenta', 'TYJ’s published method')}. Below, its result sits next to ${h.src('tyj_taulukko', 'TYJ’s 2026 allowance table')}, with the stepped-down monthly amounts. On a low salary the ${h.num(T.enintaan_prosentti_paivapalkasta)}% cap on the daily wage limits the allowance, and the stepped amounts bottom out at the basic part, ${h.eur(YT, 2)}.</p>
${h.table(['Salary/month', 'Full (calculator)', 'Full (TYJ)', `${S1.prosentti}%`, `${S2.prosentti}%`], TYJ.map((x) => [h.eur(x.palkka), h.eur(x.a.taysiKk), h.eur(x.taysi), h.eur(x.a.porras1Kk), h.eur(x.a.porras2Kk)]), 'Earnings-related allowance per month, gross, 2026', ['l', 'r', 'r', 'r', 'r'])}
<h2>The formula step by step</h2>
<ol>
<li><strong>Daily wage:</strong> gross pay over the qualifying months, excluding holiday bonus and holiday compensation, minus ${h.num(T.vahennettava_prosentti, 2)}%, divided by ${h.num(T.tyopaivia_kuukaudessa, 1)} working days per month. On ${h.eur(PALKKA)} that is ${h.eur(A.paivapalkka, 2)}.</li>
<li><strong>Basic part:</strong> ${h.eur(T.perusosa_pv, 2)} a day for everyone.</li>
<li><strong>Earnings part:</strong> ${h.num(T.ansio_osa_prosentti)}% of the daily wage above the basic part; ${h.num(T.ansio_osa_yli_taitekohdan)}% on pay above the ${h.eur(TAITE_KK, 2)} monthly break point.</li>
<li><strong>Cap:</strong> at most ${h.num(T.enintaan_prosentti_paivapalkasta)}% of the daily wage, but never less than the basic part.</li>
<li><strong>Monthly figure:</strong> daily allowance × ${h.num(T.tyopaivia_kuukaudessa, 1)}.</li>
</ol>
<p>The break point is why high earners see a modest allowance: on ${h.eur(5000)} the full allowance is ${h.eur(A5000.taysiKk)} a month, less than half the salary. The formula has no child increases.</p>
<h2>Who qualifies</h2>
<ul>
<li><strong>Fund membership:</strong> the allowance is paid by your unemployment fund to its members. Membership fees are deductible in your taxation.</li>
<li><strong>Employment condition (työssäoloehto):</strong> ${h.num(T.tyossaoloehto_kk)} months of work, where a month counts in full with at least ${h.eur(T.tyossaoloehto_palkka_kk)} of pay and as a half month with ${h.eur(T.tyossaoloehto_puolikas_kk)}. See the ${h.a('tyossaoloehto', 'employment condition')} page.</li>
<li><strong>Waiting period:</strong> ${h.num(T.omavastuupaivat)} unpaid days at the start.</li>
<li><strong>Duration:</strong> ${h.num(K.lyhyt)}, ${h.num(K.pitka)} or ${h.num(K.ikaantynyt)} days; covered on ${h.a('ansiopaivarahan-kesto', 'duration and step-down')}.</li>
</ul>
<p>The tool does not model the adjusted allowance for part-time work or other benefits. Your fund calculates the exact amount from Incomes Register wage data. The rules are in the ${h.src('finlex_tyottomyysturva', 'Unemployment Security Act')} and the step-down on ${h.src('tyj_porrastus', 'TYJ’s step-down page')}. Without a fund you get ${h.a('yleistuki', 'yleistuki')}. Pension keeps accruing while you receive the allowance; see the ${h.a('elakelaskuri', 'pension calculator')}.</p>`,
  },
});
