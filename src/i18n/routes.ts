import { makeRouter, type RouteDef } from './routes-core';
import { PAGES } from '../lib/guides';
export const LOCALES = ['fi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fi';
const R = (id: string, fi: string, en: string, noindex = false): RouteDef<Locale> => ({ id, paths: { fi: `/fi/${fi}/`, en: `/en/${en}/` }, ...(noindex ? { noindex } : {}) });
/** Ydinsivut. Laskuri- ja oppaat tulevat `src/content/pages/`-kansiosta (lib/guides.ts). */
const CORE: RouteDef<Locale>[] = [
  { id: 'home', paths: { fi: '/fi/', en: '/en/' } },
  R('method', 'laskentatapa', 'method'),
  R('about', 'tietoa', 'about'),
  R('widget', 'upota-laskuri', 'widget', true),
  R('contact', 'yhteystiedot', 'contact', true),
  R('editorial', 'toimitusperiaatteet', 'editorial-policy', true),
  R('privacy', 'tietosuoja', 'privacy', true),
  R('terms', 'kayttoehdot', 'legal-notice', true),
  R('cookies', 'evasteet', 'cookies', true),
];
export const ROUTES: RouteDef<Locale>[] = [
  CORE[0],
  ...PAGES.map((p) => R(p.id, p.fi.slug, p.en.slug)),
  ...CORE.slice(1),
];
export const { NOINDEX_PATHS, route, altPaths } = makeRouter(LOCALES, ROUTES);
