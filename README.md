# Winter Arc

Défi de 92 jours transformé en jeu de progression. PWA React, 100 % locale (aucun serveur, aucun compte).

Spécification : [`SPEC.md`](./SPEC.md) · règles et décisions : [`CLAUDE.md`](./CLAUDE.md).

## Développement

```sh
npm install
npm run dev        # /styleguide pour les tokens et composants
npm test           # moteur de gamification, statistiques, store, sauvegarde
npm run lint && npm run typecheck && npm run build
```

## Installer sur son téléphone

L'app est publiée sur GitHub Pages à chaque fusion dans `main` (workflow `.github/workflows/deploy.yml`).
Une seule fois : dans le repo GitHub, **Settings → Pages → Build and deployment → Source : GitHub Actions**.
Adresse : `https://<utilisateur>.github.io/Winter-Arc/`.

- **iPhone (Safari)** : Partager → « Sur l'écran d'accueil ».
- **Android (Chrome)** : menu ⋮ → « Installer l'application ».

Après la première ouverture, l'app fonctionne en mode avion. Les données restent sur l'appareil :
Réglages → Exporter (JSON) pour les sauvegarder ou changer de téléphone.
