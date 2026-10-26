# Cahier des charges — Winter Arc

Oct 26, 2026 · @Max

## Contexte et vision

Winter Arc est une application web React, mobile-first, qui transforme un défi personnel de 90 jours (par défaut du 1er novembre au 31 janvier) en jeu de progression. L'utilisateur fixe ses objectifs, les coche chaque jour et gagne de l'XP, des niveaux et des badges.

Catégories de départ : Sport, Nutrition, Lecture, Temps d'écran. L'utilisateur peut en créer d'autres (sommeil, méditation, finances, etc.).

Utilisateur cible : une seule personne, usage quotidien sur téléphone, 30 secondes par jour pour valider sa journée.

### Règles pour Claude Code

- Lire ce document en entier avant d'écrire du code, puis proposer un plan avant la phase 1.
- Livrer phase par phase (voir dernière section) et s'arrêter à la fin de chaque phase pour validation.
- Ne jamais inventer de style : toute couleur, police ou rayon vient des tokens de la section Direction artistique.
- Si une règle de ce document est ambiguë, poser la question au lieu de deviner.
- Copier ce document à la racine du repo sous `SPEC.md` et le référencer dans `CLAUDE.md`.

## Stack technique et architecture

V1 100 % locale, sans backend ni compte : les données vivent dans le navigateur et l'app s'installe comme une PWA.

| Brique | Choix | Pourquoi |
| --- | --- | --- |
| Build | Vite + React 18 + TypeScript strict | Rapide, typé |
| Style | Tailwind CSS avec tokens custom (aucune couleur Tailwind par défaut) | Contrôle total du style |
| Composants | Composants maison, primitives Radix UI si besoin d'accessibilité | Pas de shadcn tel quel, pas de look générique |
| Animations | Framer Motion | Récompenses, level-up, transitions |
| État | Zustand avec middleware `persist` | Simple, persistance locale |
| Stockage | IndexedDB via `idb-keyval` | Survit aux sessions, plus robuste que localStorage |
| Dates | date-fns | Calcul des jours, streaks, semaines |
| Graphiques | Visx ou SVG fait main | Stylable à 100 %, pas de Chart.js par défaut |
| Icônes | Une seule librairie (Phosphor ou Lucide), un seul poids | Cohérence |
| PWA | vite-plugin-pwa | Installable sur l'écran d'accueil, hors ligne |
| Tests | Vitest + Testing Library | Logique de gamification testée |

### Arborescence

```
src/
  app/            routes, layout, providers
  features/
    arc/          création et réglages du Winter Arc
    goals/        objectifs et catégories
    checkin/      validation quotidienne
    gamification/ XP, niveaux, badges, boss (logique pure)
    stats/        historique et graphiques
  ui/             composants de base (Button, Card, ProgressRing…)
  theme/          tokens.css, typographie
  lib/            dates, stockage, utilitaires
```

Règle : toute la logique de gamification est faite de fonctions pures dans `features/gamification`, sans React, testées unitairement.

Evolution possible (hors V1) : synchronisation Supabase et notifications push.

## Modèle de données

Quatre entités suffisent : un Arc contient des Catégories, chaque Catégorie contient des Objectifs, et chaque jour produit des Check-ins.

```ts
type Arc = {
  id: string;
  name: string;            // "Winter Arc 2026"
  startDate: string;       // ISO, ex. 2026-11-01
  endDate: string;         // ISO, ex. 2027-01-31
  createdAt: string;
};

type Category = {
  id: string;
  name: string;            // "Sport", "Nutrition"…
  icon: string;            // nom d'icône de la librairie choisie
  colorToken: string;      // ex. "--cat-1", jamais une couleur en dur
  order: number;
  isDefault: boolean;      // true pour les 4 catégories de départ
};

type GoalType = "boolean" | "quantity" | "limit";
// boolean  : fait / pas fait (ex. "Pas de sucre ajouté")
// quantity : atteindre au moins X (ex. 10 000 pas, 20 pages)
// limit    : rester sous X (ex. temps d'écran < 2 h)

type Goal = {
  id: string;
  categoryId: string;
  title: string;
  type: GoalType;
  target?: number;         // requis pour quantity et limit
  unit?: string;           // "pages", "min", "pas", "verres"
  frequency: { kind: "daily" } | { kind: "weekly"; timesPerWeek: number } | { kind: "days"; days: number[] };
  difficulty: 1 | 2 | 3;   // facile / moyen / dur, pondère l'XP
  active: boolean;
  createdAt: string;
};

type CheckIn = {
  id: string;
  goalId: string;
  date: string;            // YYYY-MM-DD, une seule entrée par objectif et par jour
  value: number;           // 1/0 pour boolean, valeur saisie sinon
  completed: boolean;      // calculé selon type et target
  note?: string;
};

type PlayerState = {
  totalXp: number;
  unlockedBadges: { badgeId: string; date: string }[];
  freezeTokens: number;    // jokers de streak
};
```

Règles : `completed` est toujours recalculé à partir de `value`, jamais saisi. L'XP n'est pas stocké par check-in mais recalculé depuis l'historique, pour que modifier un jour passé reste cohérent. Prévoir un export/import JSON de toutes les données dans les réglages.

## Fonctionnalités

Le cœur de l'app tient en trois gestes : créer son Arc, cocher sa journée, voir sa progression.

### Onboarding (premier lancement uniquement)

1. Nommer son Arc et choisir les dates (par défaut 1er novembre → 31 janvier, 92 jours).
2. Choisir parmi les 4 catégories de départ, en ajouter si besoin.
3. Créer au moins un objectif par catégorie, avec des suggestions pré-remplies modifiables.
4. Écran de lancement animé : "Jour 1 / 92".

Suggestions par défaut :

| Catégorie | Objectif suggéré | Type | Cible |
| --- | --- | --- | --- |
| Sport | Entraînement | boolean | 5 fois / semaine |
| Sport | Pas | quantity | 8 000 pas / jour |
| Nutrition | Pas de sucre ajouté | boolean | chaque jour |
| Nutrition | Eau | quantity | 2 L / jour |
| Lecture | Pages lues | quantity | 20 pages / jour |
| Temps d'écran | Temps d'écran | limit | moins de 120 min / jour |

### Gestion des catégories et objectifs

- Créer, renommer, réordonner, archiver une catégorie (nom, icône, couleur parmi la palette du thème).
- Créer, modifier, mettre en pause ou archiver un objectif. Un objectif archivé garde son historique.
- Modifier la cible d'un objectif n'affecte que les jours suivants.

### Check-in quotidien

- L'écran Aujourd'hui liste les objectifs du jour, groupés par catégorie.
- Boolean : un tap pour valider, un second pour annuler.
- Quantity et limit : saisie rapide avec stepper (+/-) et champ numérique, barre de progression vers la cible.
- Feedback immédiat à chaque validation : XP gagné qui s'affiche, petite animation, vibration légère (`navigator.vibrate`) si dispo.
- Journée parfaite (100 % des objectifs) : animation dédiée et bonus XP.
- Possibilité de remplir les 2 jours précédents (oubli), pas au-delà ; aucun jour futur.
- Note optionnelle sur la journée (humeur, ressenti).

### Historique et statistiques

- Calendrier type heatmap sur toute la durée de l'Arc, intensité = % de complétion du jour.
- Par objectif : taux de réussite, streak actuel, meilleur streak, courbe des valeurs saisies.
- Par catégorie : taux de réussite sur 7 jours et sur l'Arc entier.

### Réglages

- Modifier l'Arc (nom, dates).
- Export / import JSON, réinitialisation avec double confirmation.
- Activer ou couper sons et vibrations.

## Gamification

Un Arc parfait de 92 jours doit mener autour du niveau 30 ; la régularité rapporte plus que les coups d'éclat, et on ne perd jamais d'XP.

### XP

| Événement | XP |
| --- | --- |
| Objectif facile validé (difficulté 1) | 10 |
| Objectif moyen validé (difficulté 2) | 20 |
| Objectif dur validé (difficulté 3) | 30 |
| Quantity atteint partiellement | XP × (valeur / cible), plafonné à 100 % ; rien sous 50 % |
| Quantity dépassé de 50 % ou plus | +5 bonus |
| Journée parfaite (100 % des objectifs du jour) | +50 |
| Boss de la semaine vaincu | +150 |

Multiplicateur de série globale (jours consécutifs à 80 % de complétion ou plus) : ×1,1 dès 7 jours, ×1,25 dès 14 jours, ×1,5 dès 30 jours. Il s'applique à l'XP des objectifs, pas aux bonus.

### Niveaux et rangs

Niveau atteint quand `totalXp >= 25 × (niveau − 1)²` : niveau 2 à 25 XP, niveau 10 à 2 025 XP, niveau 30 à 21 025 XP.

| Niveaux | Rang | Sens |
| --- | --- | --- |
| 1 à 4 | Thrall | L'esclave, celui qui n'a encore rien prouvé |
| 5 à 9 | Karl | L'homme libre |
| 10 à 14 | Drengr | Le guerrier courageux et honorable |
| 15 à 19 | Huscarl | Le garde d'élite du jarl |
| 20 à 24 | Jarl | Le chef de clan |
| 25 et plus | Einherjar | Le guerrier élu du Valhalla |

Chaque level-up déclenche un écran plein dédié ; un changement de rang déclenche une animation plus marquée.

### Streaks et jokers

- Un streak par objectif (jours ou semaines consécutifs réussis selon sa fréquence) et un streak global.
- Joker de gel : 1 gagné tous les 7 jours de streak global, 3 maximum. Il est consommé automatiquement pour sauver le streak global sur un jour raté.
- Un streak cassé n'enlève rien d'autre ; message d'encouragement neutre, jamais culpabilisant.

### Boss de la semaine

Le Winter Arc est présenté comme le Fimbulvetr, le grand hiver qui précède le Ragnarök. Chaque lundi apparaît un boss dont les PV égalent l'XP maximal possible de la semaine. Chaque XP gagné lui inflige des dégâts. Il est vaincu si 80 % de ses PV sont retirés avant dimanche minuit.

| Semaine | Boss | Qui c'est |
| --- | --- | --- |
| 1 | Draugr | Mort-vivant qui garde les tombes |
| 2 | Mara | Esprit qui écrase les dormeurs |
| 3 | Troll des glaces | Brute des montagnes gelées |
| 4 | Hrungnir | Géant au cœur de pierre |
| 5 | Thrym | Roi des géants du gel |
| 6 | Garm | Chien ensanglanté qui garde l'entrée de Hel |
| 7 | Sköll | Loup qui chasse le soleil |
| 8 | Hati | Loup qui chasse la lune |
| 9 | Ymir | Premier géant, né de la glace |
| 10 | Nidhögg | Dragon qui ronge les racines d'Yggdrasil |
| 11 | Hel | Reine du royaume des morts |
| 12 | Jörmungandr | Serpent qui encercle le monde |
| 13 | Fenrir | Le loup du Ragnarök, boss final |

Illustrations fournies plus tard : prévoir des placeholders au style de la DA (silhouette gravée et nom en Cinzel).

### Badges

| Badge | Condition |
| --- | --- |
| Premier pas | Premier check-in |
| Semaine de fer | 7 jours de streak global |
| Un mois sans faillir | 30 jours de streak global |
| Parfait x10 | 10 journées parfaites |
| Rat de bibliothèque | 500 pages lues au total |
| Détox | 14 jours consécutifs sous la limite de temps d'écran |
| Machine | 50 entraînements validés |
| Tueur de boss | 5 boss vaincus |
| Mi-parcours | Atteindre le jour 46 |
| Arc complété | Atteindre le dernier jour avec au moins 70 % de complétion globale |

Les badges sont définis dans un fichier de config (`badges.ts`) : id, nom, description, icône, fonction de condition. En ajouter un ne doit demander aucune autre modification.

## Écrans et navigation

Quatre onglets dans une barre de navigation basse, plus l'onboarding et les écrans de récompense en plein écran.

| Écran | Accès | Contenu principal |
| --- | --- | --- |
| Aujourd'hui | Onglet 1 (écran d'accueil) | En-tête "Jour 23 / 92", anneau de progression du jour, niveau + barre d'XP, streak global, liste des objectifs à cocher par catégorie |
| Progression | Onglet 2 | Heatmap de l'Arc, stats par catégorie et par objectif, courbes |
| Trophées | Onglet 3 | Boss de la semaine (PV restants), rang actuel, grille des badges (débloqués en couleur, verrouillés en silhouette avec condition visible) |
| Objectifs | Onglet 4 | Catégories et objectifs : création, édition, ordre, archivage |
| Réglages | Icône dans l'en-tête | Arc, export/import, sons et vibrations, réinitialisation |
| Détail objectif | Tap sur un objectif dans Progression ou Objectifs | Historique, streaks, taux de réussite, édition |
| Onboarding | Premier lancement | 4 étapes décrites dans Fonctionnalités |
| Level-up / badge / boss vaincu | Déclenché par un événement | Plein écran animé, fermeture par tap |

Règles d'ergonomie : l'écran Aujourd'hui doit permettre de valider toute sa journée sans changer d'écran ni scroller plus de deux fois. Zones tactiles de 44 px minimum. Les écrans de récompense s'empilent en file s'il y en a plusieurs à la suite (ex. badge puis level-up).

## Direction artistique

Le style est défini par moi ; Claude Code l'applique strictement via des tokens et n'improvise aucun choix visuel.

### À remplir avant de lancer Claude Code

| Élément | Ma valeur |
| --- | --- |
| Ambiance en 3 mots | Nordique, gravé, austère |
| Références visuelles | Menus de God of War Ragnarök et Valheim, pierres runiques scandinaves, fer forgé, fjords sous la neige, aurores boréales |
| Mode | Sombre uniquement (nuit polaire) |
| Couleur de fond | `#0E1116` nuit polaire |
| Couleur de surface (cartes) | `#171C24` pierre sombre ; surface surélevée `#1F2630` |
| Bordures (couleur) | `#2C3542` fer froid |
| Couleur de texte principal / secondaire | `#E8ECEF` neige / `#8C98A6` brume |
| Couleur d'accent (actions, XP) | `#C8A44D` or viking ; accent secondaire `#8FC7E0` glace (streaks, jokers de gel) |
| Couleurs des catégories | Sport `#B5462E` braise · Nutrition `#7A8F5A` lichen · Lecture `#5E8FB0` fjord · Temps d'écran `#A8B4C0` givre · extra 1 `#A0703C` cuir · extra 2 `#6B5B95` crépuscule |
| Couleurs succès / alerte | `#7FB685` aurore verte / `#D9822B` torche |
| Police des titres | Cinzel (600 à 900), en capitales espacées |
| Police du texte | Barlow (400 et 500) |
| Police des chiffres (compteurs, XP) | Barlow Condensed (700), chiffres tabulaires |
| Rayon des coins | 2 px : formes taillées, presque droites |
| Bordures | Fines (1 px) ; double filet avec coins coupés (`clip-path`) sur les cartes clés : niveau, boss, badges |
| Ombres | Aucune ombre portée ; profondeur par les bordures et les nuances de surface |
| Textures et motifs | Grain de pierre très léger en fond (SVG inline, opacité ≤ 4 %), entrelacs nordiques en séparateurs, runes de l'Elder Futhark en décor uniquement |
| Iconographie | Icônes au trait épais et anguleux ; badges en forme de pierres runiques ou de boucliers ronds |
| Style d'animation | Sec et lourd : impact court au check (200 ms, léger tremblement), runes qui s'illuminent en or au level-up, neige fine en fond désactivée si `prefers-reduced-motion` |
| Sons | Oui, discrets et désactivables : coup sourd sur bouclier au check, cor de guerre au level-up, fracas au boss vaincu |

Toutes ces valeurs vont dans `src/theme/tokens.css` sous forme de variables CSS, branchées dans `tailwind.config` ; la palette Tailwind par défaut est désactivée.

### Interdits (anti look "app générée par IA")

- Pas de dégradés violet-bleu ou violet-rose, pas de glassmorphism, pas de lueurs néon par défaut.
- Pas d'Inter, Roboto ou police système utilisée par défaut si une autre police est définie.
- Pas d'emojis dans l'interface ; uniquement les icônes de la librairie choisie.
- Pas de cartes toutes identiques avec ombre douce et coins arrondis à 16 px partout.
- Pas de shadcn/ui avec son thème d'origine, pas de composants qui ressemblent à un template SaaS.
- Pas de texte de remplissage motivant générique ("Tu peux le faire !") : les textes sont listés dans un fichier `copy.ts` que je relis.
- Pas plus de 2 polices.
- Pas de Viking cartoon : ni casques à cornes, ni personnages mignons, ni clipart.
- Pas de police runique ou gothique pour le texte courant ; les runes restent décoratives et jamais porteuses d'information.

### Attendus

- Hiérarchie typographique forte : les chiffres clés (jour, XP, niveau) sont grands et lisibles d'un coup d'œil.
- Animations courtes (150 à 300 ms) sur les interactions, plus longues seulement sur les récompenses.
- Respect de `prefers-reduced-motion`.
- Contrastes WCAG AA minimum.
- Avant d'implémenter les écrans, Claude Code crée une page `/styleguide` qui montre tous les tokens et composants de base, pour validation.

## Exigences, livraison et acceptation

La V1 se livre en 6 phases ; chacune se termine par une démo que je valide avant la suivante.

### Exigences non fonctionnelles

- Mobile-first (375 px de référence), utilisable jusqu'au desktop.
- Fonctionne hors ligne une fois installée ; aucune donnée envoyée à l'extérieur.
- Ouverture de l'écran Aujourd'hui en moins de 1 seconde sur un téléphone récent.
- Interface en français ; textes centralisés dans `copy.ts`.
- TypeScript sans `any`, ESLint et Prettier configurés, aucun warning à la build.
- Les jours sont calculés dans le fuseau local de l'appareil.

### Phases

1. Setup : Vite, TypeScript, Tailwind branché sur les tokens, page `/styleguide` avec les composants de base. Validation du style.
2. Données : modèle, store Zustand persistant, onboarding, gestion des catégories et objectifs.
3. Check-in : écran Aujourd'hui complet, saisie des 3 types d'objectifs, rattrapage des 2 jours précédents.
4. Gamification : moteur XP, niveaux, rangs, streaks, jokers, badges, boss, écrans de récompense. Tests unitaires du moteur.
5. Progression : heatmap, statistiques, détail objectif.
6. Finitions : PWA, export/import, réglages, animations, audit accessibilité et performance.

### Critères d'acceptation

- [ ] Je peux créer mon Arc et 8 objectifs en moins de 3 minutes.
- [ ] Je valide toute ma journée depuis l'écran Aujourd'hui en moins de 30 secondes.
- [ ] Modifier un check-in d'hier recalcule correctement XP, niveau et streaks.
- [ ] Les tests couvrent le calcul d'XP, de niveau, de streak, de joker et de boss.
- [ ] Aucune couleur, police ou rayon en dur dans les composants : tout passe par les tokens.
- [ ] Aucun élément de la liste des interdits n'apparaît dans l'app.
- [ ] L'app s'installe sur iPhone et Android et fonctionne en mode avion.
- [ ] Un export JSON réimporté sur un autre appareil restitue l'état à l'identique.
