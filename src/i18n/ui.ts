import type { Locale } from './routes';
const fi = {
  updatedOn: 'Päivitetty', editorialPolicy: 'Toimitusperiaatteet', contactLabel: 'Yhteystiedot', reviewedBy: 'Tarkistanut',
  skipToContent: 'Siirry sisältöön', mainNav: 'Päävalikko', breadcrumbLabel: 'Murupolku', breadcrumbHome: 'Etusivu', menuOpen: 'Avaa valikko',
  faqTitle: 'Usein kysyttyä', relatedCalculators: 'Liittyvät laskurit ja sivut', sourcesTitle: 'Lähteet', writtenBy: 'Kirjoittanut',
  asOf: 'Luvut', lastUpdated: 'tarkistettu', footerValidated: 'Verot tarkistettu Verohallinnon vuoden 2026 esimerkeistä', footerBrowser: 'Laskee vain selaimessasi · tietoja ei lähetetä · maksuton',
  footerDisclaimer: 'Radif Partnersin riippumaton sivusto. Emme ole Verohallinto, Kela, Eläketurvakeskus, työttömyyskassa emmekä työnantaja. Tulokset ovat arvioita vuoden 2026 virallisista arvoista, eivätkä ne korvaa verokorttia, päätöstä tai neuvontaa.', footerPopular: '', notFound: 'Sivua ei löytynyt.',
  readMore: 'Lue lisää',
};
const en: typeof fi = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related calculators and pages', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Figures', lastUpdated: 'checked on', footerValidated: 'Taxes checked against the Finnish Tax Administration’s 2026 examples', footerBrowser: 'Runs only in your browser · no data sent · free',
  footerDisclaimer: 'Independent site by Radif Partners. We are not Vero (the Tax Administration), Kela, the Finnish Centre for Pensions, an unemployment fund or an employer. Each result is an estimate only, based on official 2026 values, and does not replace your tax card, an official decision or advice.', footerPopular: '', notFound: 'Page not found.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : fi; }
