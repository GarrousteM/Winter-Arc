# Winter Arc

Application web React mobile-first (PWA, 100 % locale) qui transforme un défi de 92 jours en jeu de progression.

**La spécification de référence est [`SPEC.md`](./SPEC.md). La lire en entier avant toute modification.**

## Règles de travail

- Livrer phase par phase (voir « Phases » dans `SPEC.md`) et s'arrêter à la fin de chaque phase pour validation.
- Aucune couleur, police ou rayon en dur : tout passe par `src/theme/tokens.css` (palette Tailwind par défaut désactivée).
- Respecter la liste des interdits de la section « Direction artistique ».
- Toute la logique de gamification vit dans `src/features/gamification` en fonctions pures, sans React, testées avec Vitest.
- Tous les textes d'interface sont en français et centralisés dans `copy.ts`.
- TypeScript strict, pas de `any`, ESLint + Prettier sans warning.
- Si une règle de `SPEC.md` est ambiguë, poser la question au lieu de deviner. Les décisions prises sont consignées ci-dessous.

## Décisions prises

Validées le 2026-10-26 :

1. **Calendrier des boss** : semaines du lundi au dimanche. Le 1er novembre 2026 (dimanche) est un jour « prologue » sans boss, ses XP comptent. Pour d'autres dates, la première semaine partielle a un boss aux PV réduits d'autant.
2. **Objectifs hebdomadaires** : affichés chaque jour ; ils comptent dans le % du jour seulement s'ils sont cochés ce jour-là ou si le quota de la semaine n'est plus atteignable sans eux. Leur streak se compte en semaines.
3. **Objectifs « limit »** : il faut une saisie pour qu'ils comptent ; sans saisie = non fait.
4. **PV du boss** : somme de l'XP max des objectifs prévus dans la semaine + 7 × 50 (journées parfaites). Sans multiplicateur, sans bonus de dépassement, sans le +150 du boss. Tout XP gagné (multiplicateur compris) inflige des dégâts.
5. **Historique des cibles** : `Goal.targetHistory: { from: string; target: number }[]` (écart assumé au modèle de SPEC.md).
6. **Note du jour** : entité `DayNote { date: string; text: string }`.
7. **Badges liés à un objectif** : champ invisible `Goal.tag` (`reading-pages`, `screen-time`, `workout`) qui survit au renommage.
8. **Polices** : Barlow Condensed est une variante de Barlow → 2 familles (Cinzel + Barlow).
9. **Couleurs de catégorie** : uniquement filets, pastilles et icônes, jamais de texte. Crépuscule (`#6B5B95`) reste décoratif (contraste < 3 sur les cartes).
10. **Icônes** : Phosphor, poids Bold uniquement (`IconContext`), noms suffixés `…Icon`.
11. **Sons** : synthétisés via Web Audio API (phase 6), remplaçables par des fichiers plus tard.
12. **Courbe d'XP** : formule de SPEC.md conservée telle quelle.
13. **Git** : une branche par phase (`phase-N-…`), PR en fin de phase.

## Choix techniques

- Tailwind 3.4 avec `tailwind.config.ts` ; `colors`, `fontFamily`, `borderRadius`, `borderWidth`, `boxShadow` définis dans `theme` (pas `extend`) pour supprimer les valeurs par défaut.
- ESLint interdit les littéraux de couleur (`#hex`, `rgb()`, `hsl()`) hors tests et fichiers de config.
- Routage : React Router. Polices auto-hébergées via `@fontsource` (hors ligne).
- Coins coupés : classe `.notched` (clip-path piloté par `--n`) ; un calque intérieur décalé de p px utilise `--n: calc(var(--notch) - 0.586 * p)`.

## Commandes

- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run format`
