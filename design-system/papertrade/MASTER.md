# Design system PaperTrade

Référence unique pour l'interface. Les tokens vivent dans
[`src/app/globals.css`](../../src/app/globals.css) ; ce document explique d'où ils viennent.

## Origine

Généré avec la skill [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) :

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto trading dashboard" \
  --design-system --variance 4 --motion 3 --density 8
```

| Recommandation              | Décision                                                                       |
| --------------------------- | ------------------------------------------------------------------------------ |
| Style « Minimalism & Swiss » | Retenu : grille, hiérarchie typographique, un seul accent                      |
| Palette « Fintech/Crypto »  | Retenue, contrastes vérifiés et deux teintes ajustées (voir plus bas)          |
| Typo Orbitron / Exo 2       | Écartée : trop « web3 » pour un public de recruteurs                           |
| Typo « Financial Trust »    | Retenue : IBM Plex Sans, plus Plex Mono pour les chiffres (« Dashboard Data ») |
| Accent violet `#8B5CF6`     | Écarté : un seul accent (or) en style Swiss ; la skill déconseille le violet IA |
| Pattern « Trust & Authority » | Écarté : logos clients et « Contact Sales » sans objet pour un simulateur     |
| Animations GSAP             | Écartées : transitions CSS de 150 à 200 ms, suffisantes au réglage `motion 3`  |

## Couleurs

Ratios de contraste WCAG mesurés sur le fond (`bg`) et les cartes (`surface`).

| Token           | Valeur    | Usage                                  | bg     | surface |
| --------------- | --------- | -------------------------------------- | ------ | ------- |
| `bg`            | `#0F172A` | Fond de page                           |        |         |
| `surface`       | `#222735` | Cartes                                 |        |         |
| `surface-2`     | `#272F42` | Survols, champs secondaires            |        |         |
| `border`        | `#334155` | Séparateurs décoratifs                 |        |         |
| `border-strong` | `#64748B` | Contours de champs et boutons          | 3,75   | 3,13    |
| `fg`            | `#F8FAFC` | Texte principal                        | 17,06  | 14,24   |
| `muted`         | `#94A3B8` | Texte secondaire                       | 6,96   | 5,81    |
| `primary`       | `#F59E0B` | Marque, action principale, focus       | 8,31   | 6,94    |
| `up`            | `#2BB3A4` | Texte en hausse                        | 6,87   | 5,74    |
| `down`          | `#F26D6A` | Texte en baisse                        | 6,10   | 5,09    |
| `up-strong`     | `#26A69A` | Bougies, bouton Acheter                |        |         |
| `down-strong`   | `#EF5350` | Bougies, bouton Vendre                 |        |         |

Les teintes `*-strong` viennent de la recommandation « Candlestick » de la skill (couleurs de
TradingView). Elles descendent sous 4,5:1 sur les cartes : elles servent aux remplissages, pas au
texte. Le texte sur l'or ou sur ces remplissages utilise `on-primary` (`#0F172A`, au moins 5:1).

## Typographie

- **IBM Plex Sans** (400 à 700) : interface. Base de 16 px, 14 px dans les tableaux de données.
- **IBM Plex Mono** avec chiffres tabulaires (`num`) : prix, quantités, montants. Les prix qui
  changent en direct ne font pas bouger la mise en page.
- Chargées avec `next/font` : auto-hébergées, sans décalage de mise en page.

## Icônes

[Phosphor](https://phosphoricons.com) (bibliothèque par défaut de la skill), en trait « regular »,
« fill » pour l'état actif. Importées une à une via [`src/components/icons.ts`](../../src/components/icons.ts).
Logos des cryptomonnaies : [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons)
(CC0), dans `public/crypto/`.

## Règles appliquées

- **Pas d'information par la couleur seule** : hausse/baisse avec flèche et signe, bougies doublées
  d'une légende O/H/L/C, rangs du classement en chiffres en plus des médailles.
- **Focus visible** : contour or de 2 px sur tous les éléments interactifs, lien d'évitement
  « Aller au contenu ».
- **Cibles** : 44 px pour les actions principales, 32 px minimum ailleurs (24 px requis sur le web).
- **Actions destructives** confirmées dans un `<dialog>` natif, focus sur « Annuler ».
- **Formulaire d'ordre** : libellé visible, validation immédiate du montant, message de résultat
  annoncé (`role="status"`) avec icône.
- **Chargement** : squelettes aux dimensions du contenu (`loading.tsx`), `aria-busy`.
- **Mouvement** : `prefers-reduced-motion` respecté (surlignage des prix, pastille « En direct »).
- **Mobile** : vérifié à 375 px, sans défilement horizontal de la page ; colonnes secondaires
  masquées dans les tableaux.
