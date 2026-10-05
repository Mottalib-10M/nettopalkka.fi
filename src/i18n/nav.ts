import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  fi: { home: 'Nettopalkka kunnittain', method: 'Laskentatapa', about: 'Tietoa sivustosta', widget: 'Upota laskuri', contact: 'Yhteystiedot', editorial: 'Toimitusperiaatteet', privacy: 'Tietosuoja', terms: 'Käyttöehdot ja julkaisija', cookies: 'Evästeet' },
  en: { home: 'Net pay by municipality', method: 'Calculation method', about: 'About this site', widget: 'Embed a calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
const GROUP_LABEL: Record<Locale, Record<Group, string>> = {
  fi: { laskurit: 'Laskurit', vero: 'Verotus', palkka: 'Palkka summittain', kunnat: 'Kunnat', elake: 'Eläke', tuet: 'Kela ja työttömyys' },
  en: { laskurit: 'Calculators', vero: 'Tax', palkka: 'Salary by amount', kunnat: 'Municipalities', elake: 'Pension', tuet: 'Kela and unemployment' },
};
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? pageById(id)?.[lang].nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return (['laskurit', 'vero', 'palkka', 'kunnat', 'elake', 'tuet'] as Group[]).map((g) => ({ label: GROUP_LABEL[lang][g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [...navCategories(lang), { label: lang === 'fi' ? 'Sivusto' : 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
