# Design system PaperTrade · direction « Terminal »

Référence unique pour l'interface. Les tokens vivent dans
[`src/app/globals.css`](../../src/app/globals.css) ; ce document explique d'où ils viennent.

## Intention

Un terminal de marché plutôt qu'une application grand public : dense, lisible, pensé pour le
clavier. L'objectif est aussi d'éviter les marqueurs des interfaces générées en série (palette
Tailwind par défaut, cartes arrondies partout, grilles d'icônes sur fond teinté, rangées de
statistiques).

Une première version suivait la palette « Fintech/Crypto » de la skill
[UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). Elle a été remplacée par
cette direction ; la skill a servi à cadrer la typographie et les règles d'accessibilité.

| Recommandation de la skill                     | Décision                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| Une seule police à chasse fixe (« Terminal CLI ») | Retenu                                                         |
| Tailles 12 / 14 / 16 px uniquement             | Retenu, plus 24 px pour le titre et le prix principal            |
| Pas de gras (il dénature les mono)             | Retenu : graisses 400 et 500, hiérarchie par la couleur et les capitales |
| JetBrains Mono                                 | Écarté : la police par défaut des interfaces « terminal » générées ; IBM Plex Mono à la place |
| Style « Data-Dense Dashboard »                 | Retenu : tableaux serrés, marges de 8 à 16 px                    |

## Couleurs

Ratios de contraste WCAG mesurés sur le fond de page (`bg`) et les en-têtes de panneau (`head`,
le fond le plus clair).

| Token         | Valeur    | Usage                                     | bg    | head  |
| ------------- | --------- | ----------------------------------------- | ----- | ----- |
| `bg`          | `#070707` | Fond de page                              |       |       |
| `panel`       | `#0E0E0E` | Corps des panneaux                        |       |       |
| `head`        | `#171717` | Barres de titre, pistes de jauge          |       |       |
| `hover`       | `#1C1C1C` | Survol des lignes                         |       |       |
| `line`        | `#2A2A2A` | Filets décoratifs                         |       |       |
| `line-strong` | `#737373` | Contours de champs et de boutons          | 4,25  | 3,78  |
| `fg`          | `#E8E4DA` | Texte principal (blanc cassé, moins dur)  | 15,87 | 14,12 |
| `muted`       | `#9B968A` | Libellés, texte secondaire                | 6,83  | 6,08  |
| `amber`       | `#FFAB2E` | Interface : titres, codes, focus, action  | 10,66 | 9,49  |
| `up`          | `#35D08A` | Hausse, achat                             | 10,11 | 9,00  |
| `down`        | `#FF6259` | Baisse, vente, actions destructives       | 6,85  | 6,10  |

Le vert et le rouge sont réservés aux variations et au sens des ordres. Tout ce qui est interactif
ou structurant est en ambre. Le texte sur fond ambre, vert ou rouge utilise `on-amber` (`#070707`,
au moins 6,8:1).

## Typographie

- **IBM Plex Mono** seule, en 400 et 500, chargée avec `next/font` (auto-hébergée, sans décalage).
- Libellés en capitales espacées (`caps`), jamais pour du texte courant.
- Chiffres tabulaires (`num`) : les prix en direct ne font pas bouger la mise en page.

## Composants

- **Panneau** ([`panel.tsx`](../../src/components/panel.tsx)) : barre de titre ambre en
  capitales, filets de 1 px, aucun arrondi ni ombre.
- **Ligne à points de conduite** (`Leader`) : « LIBELLÉ ........ valeur », dans un `<dl>`.
- **Boutons** ([`ui.ts`](../../src/components/ui.ts)) : rectangles pleins (ambre, vert, rouge) ou
  filaires, libellés en capitales.
- **Symboles** à la place des icônes : ▲ ▼ pour les variations, ● pour la connexion, ↕ pour le tri.
  Toujours `aria-hidden`, l'information est aussi donnée en texte.

## Clavier

- **Ligne de commande** : un code d'actif (`BTC`, `ethereum`, `BTC GO`) ou d'écran (`MKT`, `PORT`,
  `RANK`), puis Entrée. ⌘K ou Ctrl+K y place le curseur.
- **Touches de fonction** : F1 Marchés, F2 Portefeuille, F3 Classement.
- Aucun raccourci à touche unique imprimable (WCAG 2.1.4) : les raccourcis utilisent un
  modificateur ou une touche de fonction.

## Règles appliquées

- **Pas d'information par la couleur seule** : flèches et signes pour les variations, légende
  O/H/L/C sous le graphique, rangs écrits en chiffres.
- **Focus visible** : contour ambre de 2 px, lien d'évitement « Aller au contenu ».
- **Actions destructives** confirmées dans un `<dialog>` natif, focus sur « Annuler ».
- **Mouvement** : `prefers-reduced-motion` respecté (surlignage des prix, indicateur d'attente,
  pastille « En direct »).
- **Mobile** : vérifié à 375 px ; colonnes secondaires masquées, aucun défilement horizontal de la
  page.
