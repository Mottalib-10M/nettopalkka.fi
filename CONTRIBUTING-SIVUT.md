# Ajouter ou réécrire une page (Nettopalkka)

Notice pour les agents qui écrivent ou prolongent le site. À lire en entier avant d'écrire une ligne, avec
`~/Documents/GitHub/RECETTE-SITE.md` (§0, §4.1, §6, §7, §9.3, §11, §17.4, §21, §26).

## Principe

Une page = **un fichier** `src/content/pages/<id>.ts`. Il porte les deux langues (`fi` pour la Finlande, `en` pour
un expatrié qui travaille en Finlande), la FAQ, les sources, le mini-simulateur ou l'outil, et le maillage. Le cœur
le lit seul : routes (`src/i18n/routes.ts`), menus et pied de page (`src/i18n/nav.ts`), sitemap, hreflang, schémas
`Article`, `WebPage`, `FAQPage`, `BreadcrumbList`, cartes « pages liées ». **Aucun fichier du cœur ne se modifie pour
ajouter une page.**

Modèles (copier la structure, **jamais les phrases**) :

| Type | Modèle |
|---|---|
| Page outil (calculateur complet en tête) | `src/content/pages/veroprosenttilaskuri.ts` |
| Guide avec mini-simulateur | `src/content/pages/verokortti.ts` |
| Page par montant | `src/content/pages/nettopalkka-3000.ts` |
| Page de commune (outil prérempli) | `src/content/pages/helsinki.ts` |

## La règle d'or : aucun chiffre à la main

- **Valeurs légales** (taux, seuils, montants) : `src/data/params-2026.json`, lues via `P` (`import { P, FI, EN } from '../../lib/fmt'`)
  dans le chapeau, la FAQ et les titres, via `h.P` dans le corps. Taux communaux : `kunta('Tampere').kunta`
  (`src/lib/engine/params.ts`), jamais « 7,60 » écrit à la main.
- **Résultats** (net, impôt, allocation, pension) : le moteur `src/lib/engine/` (`laskeVerot`, `kuukausiNetto`,
  `tyoelakeArvio`, `kansanelake`, `elakeNetto`, `asumistuki`, `ansiopaivaraha`, `vanhempainraha`, `kotitalousvahennys`,
  `lomaraha`…), calculés en tête de fichier puis insérés. Exemples prêts : `src/lib/esimerkit.ts`.
- **Format** : `FI.eur / FI.num / FI.p` (pourcentage déjà en %, ex. `FI.p(7.3)` → « 7,30 % ») ou `EN.…`, et dans
  le corps `h.eur / h.num / h.pct`. Jamais `toFixed`, jamais « 3 000 » tapé.
- Une valeur nouvelle va d'abord dans `params-2026.json` avec sa source dans `sources`. **Un chiffre qu'on n'a pas lu sur une
  source officielle (vero.fi, kela.fi, etk.fi, tyoelake.fi, finlex.fi, tyj.fi, tyosuojelu.fi, stat.fi) ne se publie pas.**
  Pas de date de versement, de délai ou de procédure inventés.

## Les champs

| Champ | Règle |
|---|---|
| `id` | = nom du fichier. Liens : `h.a('<id>', 'texte')`. Un id inconnu reste du texte simple (et le test échoue). |
| `group` | `laskurit`, `vero`, `palkka`, `kunnat`, `elake`, `tuet` (colonne du menu). |
| `order` | Place dans le groupe, par pas de 10. |
| `tool` | Pages outil seulement : `netto`, `brutto`, `veroprosentti`, `verolaskuri`, `kunnat`, `elake`, `kansanelake`, `asumistuki`, `kotitalous`, `ansiopaivaraha`, `vanhempainpaivaraha`, `lomaraha`. `toolPreset` : `{ kunta: 'Tampere' }` (outil `netto` ou `asumistuki`), `{ palkka: 3000 }`. |
| `mini` | Guides et montants : nom d'un fichier de `src/lib/minis/`. `miniDefaults` fixe ses valeurs (`{ p: 3000 }`). `<!--mini:kind-->` dans le corps en insère un second. |
| `related` | 3 à 6 ids existants. |
| `sources` | au moins 2 clés de `params-2026.json > sources`. |

### Texte par langue

| Champ | Règle |
|---|---|
| `slug` | minuscules, tirets, sans année ; seules les pages par montant portent un nombre. |
| `nav`, `card` | libellé de menu ; une phrase pour les cartes. |
| `title` | **50 à 60 caractères**, avec 2026, terme-clé en tête (jamais pays, « Laskuri/Calculator », question ou rubrique en premier), sans tiret cadratin. Compter avec python. |
| `description` | **150 à 160 caractères**, avec 2026 et un chiffre. |
| `h1` | sans année. |
| `intro` | une phrase. |
| `resume` | **UN** paragraphe d'au moins **120 mots**, citable seul, chiffres et règle dedans, première phrase = la réponse (§21). Le finnois a des mots longs : viser 125–150 mots finnois. |
| `faqs` | 4 à 8 vraies questions (3 à 8 pour outils et montants), réponses de **40 à 90 mots** avec chiffre, condition et source. Une question n'existe qu'une fois sur tout le site, deux langues comprises. |
| `body` | `(h) => \`…\`` : `h2`, `h3`, `p`, `ul`, `ol`, `h.table(...)`, `h.src('<clé>', 'texte')`. Guides : au moins **1 100 mots** avec `resume` et FAQ ; outils 450 ; montants 650. |

## Ton et langue

- **Finnois** : naturel, comme un journaliste économique finlandais (Helsingin Sanomat, Kauppalehti), pas une traduction.
  Termes officiels : verokortti, ennakonpidätys, tuloraja, lisäprosentti, kunnallisvero, työtulovähennys, perusvähennys,
  sairaanhoitomaksu, päivärahamaksu, työeläkemaksu, työttömyysvakuutusmaksu, Yle-vero, kuntaryhmä, perusomavastuu,
  ansiopäiväraha, yleistuki, työssäoloehto, lomaraha, lomakorvaus, elinaikakerroin, takuueläke. Le chiffre d'abord.
- **Anglais** : pour quelqu'un qui travaille en Finlande depuis peu (permis de travail, premier verokortti, Kela, kassa),
  pas une traduction ; le terme finnois entre parenthèses à la première occurrence (tax card (verokortti)). Montants en euros,
  format `€1,234`.
- Interdits : tiret cadratin « — », « on tärkeää huomata », « it's important to note », « dive into », « whether you're… »,
  enchaînements « lisäksi / myös / moreover » en série, triplets systématiques, conclusion qui résume, émojis.
- **Unicité** (§6) : `check-unique` compare toutes les pages (chiffres neutralisés, seuil 30 %). Écrire ce qui n'appartient
  qu'à ce sujet (sa règle, son cas limite, son vocabulaire) ; aucune phrase reprise d'une autre page, ni d'une langue à l'autre.
- **Pas de réseau** (§6.5) : aucun lien vers un autre site du portefeuille (`_trame/domaines-ovh.txt`). Liens externes : seulement
  les sources officielles via `h.src`.

## Contrôles

```bash
cd ~/Documents/GitHub/a-publier/Mottalib-10M/fi-laskurit
export NODE_PATH=$(npm root -g):$PWD/node_modules
PAGE_FILES=<id> npx vitest run tests/pages.test.ts   # une page
npx vitest run                                        # tous les tests (moteurs : exemples Vero, Kela, TYJ)
npm run build                                         # avec typo-nbsp et check-snippets (bloquant)
python3 scripts/check-seo.py . ; python3 scripts/check-trame.py . ; python3 scripts/check-unique.py dist
python3 scripts/check-simulateurs.py . ; python3 scripts/check-hreflang.py . ; python3 scripts/check-anglais.py .
python3 scripts/check-regles.py . ; python3 scripts/check-portefeuille.py .
node scripts/check-sources.mjs . ; node scripts/check-legal.mjs . ; node scripts/typo-nbsp.mjs dist --check
node scripts/check-contraste.mjs dist ; node scripts/check-saisie.mjs dist --max=60 ; node scripts/check-nombres.mjs dist
node scripts/check-layout.mjs dist > /tmp/layout-fi.log 2>&1 &   # long : en arrière-plan
```

Les scripts de `scripts/` sont des copies de `~/Documents/GitHub/_trame/_template/scripts/` ; si la trame est plus récente,
les recopier. Arrêter un serveur par son port (`lsof -ti tcp:<port> | xargs kill`), jamais `pkill -f` avec un motif court.

## Données et mise à jour annuelle

- `src/data/params-2026.json` : toutes les valeurs, chacune avec `_lahde` et les URL dans `sources`.
- `src/data/kunnat-2026.json` : 308 communes × taux communal, évangélique-luthérien, orthodoxe, drapeau Åland. Rejouable :
  `python3 scripts/fi/build-kunnat.py 2027` après avoir ajouté l'URL de la décision Vero de l'année dans `DECISIONS`.
- Tests moteurs (`src/lib/engine/*.test.ts`) : 24 exemples Vero (palkka, etuus, eläke), 14 exemples Kela kansaneläke /
  takuueläke, 10 lignes du tableau TYJ, exemples Kela asumistuki et tulorajat, exemples vero.fi kotitalousvähennys.
  Nouveau millésime : nouveau `params-2027.json`, remplacer les exemples, faire passer les tests.
- Points à surveiller : âge de retraite et elinaikakerroin de la cohorte 1965 (décrets attendus fin octobre et fin novembre
  2026) ; vote de la hausse du kotitalousvähennys (40 % / 15 % / 2 100 €) et de la franchise de transport à 800 €.

## Ce qu'on ne fait pas

- Pas de dépôt GitHub, pas de push, pas de DNS sans validation de l'éditeur.
- Ne pas toucher à `_trame` ni à la RECETTE : les suggestions vont dans le compte rendu.
- Pas de publicité activée ; aucun lien vers un autre site du portefeuille.
- Aucune personne nommée : l'éditeur est Radif Partners.
