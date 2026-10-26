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

Validées en fin de phase 1 :

14. **Barre d'onglets** : libellés en Barlow 500, casse normale (le Cinzel capitales débordait à 375 px).
15. **Tailwind 3.4** conservé (alertes `npm audit` limitées à l'outillage de build).

Prises en phase 2 (à confirmer en revue) :

16. **Extensions du modèle** (`src/lib/types.ts`) : `Category.archived` ; `Goal.status` (`active` | `paused` | `archived`, remplace `active: boolean`), `Goal.order`, `Goal.step` (pas du stepper), `Goal.tag`, `Goal.targetHistory` ; `DayNote` ; `Preferences` (sons, vibrations).
17. **Changement de cible** : effectif dès aujourd'hui (le jour en cours prend la nouvelle cible), les jours passés gardent l'ancienne.
18. **Jours de la semaine** : numérotation ISO, 1 = lundi … 7 = dimanche.
19. **Durée minimale d'un Arc** : 8 jours (fin au moins 7 jours après le début).
20. **Archiver une catégorie** retire ses objectifs des écrans sans toucher à leur statut ni à leur historique ; la restaurer les fait revenir.

21. **Bleu hivernal** (demande de Max après la phase 2) : neutres bleutés (`--color-bg` #0B111A, surfaces #121B27 / #1A2534, fer froid #2A3A4E, neige #E6EDF3, brume #8E9DB0), ciel polaire `--color-sky` #13233A en dégradé bleu sur bleu en haut d'écran, `--color-frost-deep` #3B5F80 pour les ornements (entrelacs, runes au repos, graduations), neige en glace. L'or reste réservé aux actions et à l'XP.

Prises en phase 3 (à confirmer en revue) :

22. **Objectifs de l'onboarding** : ils existent dès le début de l'Arc (`createdAt` et première cible datés du premier jour), pour pouvoir rattraper un Arc commencé avant l'installation. Un objectif ajouté plus tard n'existe qu'à partir de sa création (sinon il casserait après coup des journées parfaites).
23. **Anneau du jour** : part des objectifs qui comptent et sont réussis (une quantité partielle n'est pas réussie, même si elle rapporte de l'XP).
24. **Décocher / vider un champ** supprime le check-in du jour.
25. **XP affiché en phase 3** : XP de base (objectifs, dépassement, journée parfaite). Multiplicateur de série, boss, streak et jokers arrivent avec le moteur complet en phase 4.

Prises en phase 4 (à confirmer en revue) :

26. **Série globale** : un jour sans objectif qui compte (ex. repos hebdomadaire) ne casse pas la série et la prolonge. La journée en cours ne casse jamais la série et ne consomme pas de joker.
27. **Multiplicateur** : calculé avec la série qui inclut le jour (le 7e jour consécutif est déjà à ×1,1). Il s'applique aux XP des objectifs, arrondi par jour ; bonus de dépassement, journée parfaite et boss restent hors multiplicateur.
28. **Joker** : jamais consommé si la série est à 0.
29. **Ordre des boss** : ordre de SPEC.md, Fenrir toujours sur la dernière semaine ; pour un Arc de plus de 13 semaines, les 12 premiers se répètent.
30. **PV des boss** : calculés avec les objectifs actuels (mettre en pause ou archiver un objectif change les PV).
31. **Récompenses** : l'état célébré (`PlayerState`) ne recule jamais ; plusieurs level-ups en attente fusionnent en un seul écran ; une journée parfaite n'est célébrée qu'une fois par jour et par session.
32. **Détox** : jours consécutifs où l'objectif `screen-time` est réussi, les jours où il n'est pas prévu sont ignorés. **Premier pas** : toute saisie, même partielle.

Prises en phase 5 (à confirmer en revue) :

33. **Taux de réussite d'un objectif** : jours prévus réussis / jours prévus écoulés (semaines au quota pour un hebdomadaire). Le jour ou la semaine en cours ne compte que s'il est déjà réussi.
34. **Taux d'une catégorie** : objectifs qui comptent chaque jour (règle des hebdomadaires de la décision 2), sur 7 jours glissants et sur l'Arc entier.
35. **Détail objectif** : un tap sur un objectif (Progression ou Objectifs) ouvre son détail ; l'édition et l'archivage se font depuis le détail.
36. **Heatmap** : une seule teinte (glace) en 5 paliers (`--heat-0` à `--heat-4`), liseré or pour une journée parfaite, flocon pour un joker. Courbes en SVG fait main (`src/ui/LineChart.tsx`).

Prises en phase 6 (à confirmer en revue) :

37. **Sauvegarde** : fichier `winter-arc-AAAA-MM-JJ.json` `{ app, schema, exportedAt, data }` ; l'import valide la forme, refuse une version plus récente et remplace tout après confirmation. Sur mobile, l'export passe par la feuille de partage si elle accepte les fichiers.
38. **Sons** : coup sourd (check), cor de guerre (level-up, version courte pour la journée parfaite), fracas (boss vaincu), coup sourd (badge). Jamais joués sans geste préalable de l'utilisateur.
39. **Neige de fond** sur les écrans à onglets (20 flocons, derrière le contenu), coupée si mouvement réduit.
40. **Hébergement** : GitHub Pages via `.github/workflows/deploy.yml` (vérifications puis publication à chaque fusion dans `main`, base `/<nom-du-repo>/`).

Direction « Saga gravée » (validée par Max après la phase 6) :

41. **Bouclier du jour** (variante A, choisie par Max) : le bord en or se remplit comme une jauge (objectifs réussis / objectifs à faire aujourd'hui), le compte « 4/5 objectifs » est gravé sur la bosse, le % et l'XP du jour sont écrits dessous ; les hebdomadaires en jour de repos sont signalés « facultatif ». Les planches de bois sont un simple décor.
42. **Bâton de comptage** sous « Jour X / N » dans l'en-tête des onglets : une encoche par jour, en or pour les jours écoulés, une marque par semaine.
43. **Cases à cocher en petits boucliers ronds** ; catégories marquées d'une **pierre runique** ; objectifs en liste séparée par des traits gravés (sans cartes).
44. **Boss gravé dans une pierre runique à bande-serpent** ; PV en **mur de 10 boucliers** (un bouclier entamé tient ; 8 à briser = 80 %). Nouveau rang dans une pierre à bande dorée.
45. **Cartes clés en fer riveté** (`IronCard`, token `--color-iron` #4A5664, décor uniquement). Symboles nordiques récupérés par des groupes extrémistes (valknut, roue solaire, Othala à empattements, Wolfsangel) exclus.

## Choix techniques

- Tailwind 3.4 avec `tailwind.config.ts` ; `colors`, `fontFamily`, `borderRadius`, `borderWidth`, `boxShadow` définis dans `theme` (pas `extend`) pour supprimer les valeurs par défaut.
- ESLint interdit les littéraux de couleur (`#hex`, `rgb()`, `hsl()`) hors tests et fichiers de config.
- Routage : React Router. Polices auto-hébergées via `@fontsource` (hors ligne).
- Store unique Zustand (`src/app/store.ts`) persisté dans IndexedDB (`src/lib/storage.ts`, repli mémoire). `RootGate` attend la réhydratation puis redirige vers `/bienvenue` tant qu'il n'y a pas d'Arc.
- Styleguide, onboarding et réglages chargés à la demande (`lazy`) ; bibliothèques découpées en chunks (`vite.config.ts`) pour un build sans warning.
- `hoverOnlyWhenSupported` : pas d'état de survol collé après un tap.
- PWA : `vite-plugin-pwa` (manifeste, service worker `autoUpdate`, précache de tous les fichiers dont les polices) : fonctionne en mode avion. Icônes dans `public/icons` (rune Hagalaz). Désactivée pour la démo `VITE_ROUTER=memory`.
- `VITE_BASE` fixe le chemin de publication (routeur : `basename` = `BASE_URL`).
- Coins coupés : classe `.notched` (clip-path piloté par `--n`) ; un calque intérieur décalé de p px utilise `--n: calc(var(--notch) - 0.586 * p)`.

## Commandes

- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run format`
