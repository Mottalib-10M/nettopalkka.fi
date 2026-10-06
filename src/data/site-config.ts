/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://nettopalkka.fi";
export const SITE_NAMES: Record<string, string> = {"fi": "Nettopalkka", "en": "Nettopalkka"};
export const LANG_TAGS: Record<string, string> = {"fi": "fi-FI", "en": "en-FI"};
export const OG_LOCALES: Record<string, string> = {"fi": "fi_FI", "en": "en_GB"};
export const LOCALE_TAG = 'fi-FI';
/** Format des nombres par langue : en-FI mélangerait virgule décimale et séparateur anglais, on prend en-GB. */
export const LOCALE_BY_LANG: Record<string, string> = { fi: 'fi-FI', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-05';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"fi": "Riippumaton julkaisija: palkan, verotuksen, eläkkeen ja Kelan tukien laskurit Suomeen", "en": "Independent publisher of Finnish pay, tax, pension and Kela benefit calculators"};
export const AUTHOR_DESC: Record<string, string> = {"fi": "Radif Partners laskee suomalaisen palkan, veron, eläkkeen ja Kelan tuet vuoden 2026 perusteilla: valtion veroasteikko, 308 kunnan ja seurakunnan veroprosentit Verohallinnon päätöksestä, työeläkkeen karttuminen ja elinaikakerroin, kansaneläke, takuueläke, asumistuki ja ansiopäiväraha. Veromoottori toistaa Verohallinnon julkaisemat esimerkkiverot sentilleen.", "en": "Radif Partners computes Finnish pay, tax, pension and Kela benefits on 2026 rules: the state tax scale, the municipal and parish rates of all 308 municipalities from Vero’s decision, earnings-related pension accrual and the life expectancy coefficient, national and guarantee pension, housing allowance and unemployment allowance. The tax engine reproduces Vero’s published sample taxes to the cent."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"fi": ["Nettopalkka ja palkan verotus", "Veroprosentti ja verokortti", "Kunnallisvero ja kirkollisvero", "Työeläke ja eläkeikä", "Kansaneläke ja takuueläke", "Yleinen asumistuki", "Ansiosidonnainen työttömyyspäiväraha", "Kotitalousvähennys", "Lomaraha ja vuosiloma"], "en": ["Net salary and wage taxation in Finland", "Finnish tax card and withholding rate", "Municipal and church tax in Finland", "Earnings-related pension and retirement age", "Kela national and guarantee pension", "Kela general housing allowance", "Earnings-related unemployment allowance", "Household tax credit", "Holiday pay and holiday bonus"]};
export const CONTACT_EMAIL = "contact@nettopalkka.fi";
export const THEME_COLOR = '#002F6C';
export const LOGO_SYMBOL = '€';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime de consentement : 'opt-in' = rien avant l'accord (UE, Suisse) ;
 *  'notice' = mesure d'audience active avec information préalable et retrait (CA, AU). */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif). Vide = aucun traceur ni bandeau. */
export const CLARITY_ID = 'ytm6gzugxu';
export const INDEXNOW_KEY = '87430bce550d3b08d4cb552f1e29bf3e';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "VAT",
  vatNumber: '',
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
