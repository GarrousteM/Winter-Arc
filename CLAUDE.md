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

_(à compléter au fil des validations)_
