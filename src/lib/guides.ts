/** Sivurekisteri: jokainen `src/content/pages/`-tiedosto ladataan tässä. */
import type { PageDef, Group } from './guide-types';

const mods = import.meta.glob<{ default: PageDef }>('../content/pages/*.ts', { eager: true });

export const PAGES: PageDef[] = Object.entries(mods)
  .map(([file, m]) => {
    const g = m.default;
    const base = file.split('/').pop()!.replace(/\.ts$/, '');
    if (g.id !== base) throw new Error(`${file}: id « ${g.id} » ei vastaa tiedostonimeä`);
    return g;
  })
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export const GROUPS: Group[] = ['laskurit', 'vero', 'palkka', 'kunnat', 'elake', 'tuet'];
export const pageById = (id: string) => PAGES.find((p) => p.id === id);
