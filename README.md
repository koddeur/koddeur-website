# koddeur-website

Site Next.js de koddeur : une page d'accueil façon portfolio (`/`), un blog Markdown bilingue FR/EN, une page projets et une page à propos, avec un dashboard d'admin pour tout gérer.

## Structure du site

- `/` — page d'accueil (liens sociaux, Projects, Resume, Blog).
- `/blog` — liste des articles (tags les plus populaires, tri par date ou par vues, filtre par tag).
- `/articles/[slug]` — un article (compteur de vues, contenu bilingue).
- `/projects` — liste des projets (statut en ligne/hors-ligne, lien du projet, lien GitHub).
- `/about` — profil, expériences, formation, CV téléchargeable (FR/EN).
- `/admin` et `/admin/projects` — dashboard d'édition (protégé, voir plus bas).
- Page 404 personnalisée : suggère les derniers articles ou projets selon l'URL demandée.

## Fonctionnalités transverses

- **Bilingue FR/EN** : un bouton dans l'en-tête bascule toute l'interface. Le contenu des articles/projets peut avoir une traduction dans un fichier `<slug>.en.md` à côté du fichier principal ; sans traduction, le contenu français est utilisé comme repli.
- **Thème clair/sombre**, mémorisé par visiteur.
- **Compteur de vues** par article, stocké dans Supabase (voir plus bas), une vue comptée par session de navigateur (pas à chaque rafraîchissement).
- **Favicon** rond généré à partir du logo via `next/og`.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Voir `.env.example` pour la liste complète. Sans elles, les fonctionnalités concernées ne plantent pas mais restent indisponibles (connexion admin impossible, vues toujours à `0`).

### Authentification de l'admin

Le dashboard (`/admin`) est protégé par un mot de passe :

```bash
AUTH_SECRET=une-chaine-aleatoire-longue   # openssl rand -hex 32
ADMIN_PASSWORD=votre-mot-de-passe
```

La session est stockée dans un cookie signé et httpOnly valable 7 jours ; le bouton « Se déconnecter » dans l'admin le supprime.

### Compteur de vues (Supabase)

L'hébergement actuel reconstruit l'application à partir de git à chaque déploiement, donc rien de ce qui est écrit sur le disque du serveur ne survit à un redéploiement. Le compteur de vues est stocké dans Supabase pour cette raison.

1. Créez un projet sur [supabase.com](https://supabase.com) (le plan gratuit suffit largement).
2. Dans l'éditeur SQL du projet, exécutez le contenu de `supabase/schema.sql` (crée la table `article_views` et la fonction d'incrément atomique).
3. Récupérez l'URL du projet et la clé **service_role** (Project Settings → API — pas la clé `anon`, celle-ci contourne les policies RLS et ne doit être utilisée que côté serveur).
4. Définissez ces variables (local **et** hébergeur) :

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

## Contenu : éditer en local, puis pousser

Toujours à cause de la reconstruction à chaque déploiement : les articles et projets doivent être créés/modifiés via `/admin` **en local** (`npm run dev`), puis commités et poussés — ne pas éditer directement en production, ces changements seraient perdus au déploiement suivant.

## Écrire un article

Le dashboard (`/admin`) crée un fichier dans `content/articles/` avec : titre, description, date de création, mots-clés, contenu Markdown, et statut publié/désactivé. Il détecte aussi les fichiers ajoutés directement dans ce dossier.

L'URL (`slug`) d'un article existant peut être modifiée depuis le dashboard ; le fichier (et sa traduction `.en.md` le cas échéant) est renommé et le compteur de vues Supabase migré automatiquement. **Attention** : renommer une URL casse tous les liens externes déjà partagés ou indexés vers l'ancienne URL (pas de redirection automatique).

Les articles sont automatiquement triés du plus récent au plus ancien.

### Ajouter un fichier manuellement

```md
---
title: "Un titre (50 caractères max)"
description: "Une description (300 caractères max)"
createdAt: "2026-08-29T10:00:00.000Z"
keywords: ["nextjs", "react"]
published: true
---

## Le contenu de l’article

Votre contenu Markdown (10 000 caractères maximum).
```

Le champ `published` est optionnel (`true` par défaut si absent) ; mettez-le à `false` pour désactiver l’article sur le blog public tout en le gardant modifiable dans le dashboard.

Pour une traduction anglaise, ajoutez `content/articles/<même-slug>.en.md` avec le même format (`title`, `description`, contenu) — les autres métadonnées (date, mots-clés, statut) restent celles du fichier français.

## Écrire un projet

Le dashboard (`/admin/projects`) crée un fichier dans `content/projects/` avec : nom, description, image, date, lien du projet (facultatif), lien GitHub (facultatif) et statut (`En ligne` / `Hors-ligne`).

```md
---
name: "Nom du projet"
date: "2026-08-29T00:00:00.000Z"
image: "/uploads/……png"
description: "Une petite description."
githubUrl: "https://github.com/…"
link: ""
status: "online"
---
```

`status` accepte `online` ou `closed`. Une traduction anglaise suit la même convention que les articles : `content/projects/<même-slug>.en.md` avec `name` et `description`.
