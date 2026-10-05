/**
 * Minilaskurien rekisteri (RECETTE §9.3): yksi tiedosto aihetta kohden `lib/minis/<kind>.ts`, ladataan
 * automaattisesti. Jokainen tiedosto vie `default`: (lang) => MiniSpec ja kutsuu sivuston moottoria, ei omaa laskentaa.
 */
import type { MiniSpec } from './mini-types';
export type Lang = 'fi' | 'en';
type Factory = (l: Lang) => MiniSpec;
const mods = import.meta.glob<{ default: Factory }>(['./minis/*.ts', '!./minis/_*.ts'], { eager: true });
export const MINIS: Record<string, Factory> = Object.fromEntries(
  Object.entries(mods).map(([f, m]) => [f.split('/').pop()!.replace(/\.ts$/, ''), m.default]),
);
export function getSpec(kind: string, lang: string): MiniSpec {
  const f = MINIS[kind];
  if (!f) throw new Error(`Tuntematon minilaskuri: ${kind} (luo src/lib/minis/${kind}.ts)`);
  return f(lang === 'en' ? 'en' : 'fi');
}
