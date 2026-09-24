# blog-codex

Site Next.js minimaliste : une page d'accueil façon portfolio (`/`) et un blog alimenté par des fichiers Markdown (`/blog`).

## Structure du site

- `/` — page d'accueil (liens sociaux, Projects, Resume, Blog), inspirée de [koddeur-portfolio](https://github.com/koddeur/koddeur-portfolio).
- `/blog` — liste des articles.
- `/articles/[slug]` — un article.
- `/admin` — dashboard d'édition (protégé, voir plus bas).

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

## Authentification de l'admin

Le dashboard (`/admin`) est protégé par un mot de passe. Définissez ces variables d'environnement (voir `.env.example`) :

```bash
AUTH_SECRET=une-chaine-aleatoire-longue   # openssl rand -hex 32
ADMIN_PASSWORD=votre-mot-de-passe
```

Sans ces variables, la connexion échoue. La session est stockée dans un cookie signé et httpOnly valable 7 jours ; le bouton « Se déconnecter » dans l'admin le supprime.

## Contenu : éditer en local, puis pousser

L'hébergement actuel reconstruit l'application à partir de git à chaque déploiement : tout ce qui est écrit sur le disque du serveur (fichiers `content/`, images uploadées) est perdu au déploiement suivant s'il n'a pas été commité. Les articles et projets doivent donc être créés/modifiés via `/admin` **en local** (`npm run dev`), puis commités et poussés — ne pas éditer directement en production tant que ce n'est pas migré vers un stockage externe.

## Compteur de vues (Supabase)

Le nombre de vues par article est stocké dans Supabase plutôt que sur le disque du serveur : sur cet hébergement, le déploiement semble reconstruire l'application à chaque push (perte de tout fichier local, même en dehors du dossier du projet), donc seul un stockage externe survit de façon fiable aux redéploiements.

1. Créez un projet sur [supabase.com](https://supabase.com) (le plan gratuit suffit largement).
2. Dans l'éditeur SQL du projet, exécutez le contenu de `supabase/schema.sql` (crée la table `article_views` et la fonction d'incrément atomique).
3. Récupérez l'URL du projet et la clé **service_role** (Project Settings → API — pas la clé `anon`, celle-ci contourne les policies RLS et ne doit être utilisée que côté serveur).
4. Définissez ces variables d'environnement (local **et** Hostinger) :

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

Sans ces variables, `getViewCount`/`incrementViewCount` retombent silencieusement sur `0` au lieu de planter la page.

## Écrire un article

Le dashboard est disponible sur `/admin`. Il crée un nouveau fichier dans `content/articles/` avec les métadonnées suivantes : titre, description, date de création, mots-clés et contenu Markdown. Il détecte aussi les fichiers ajoutés directement dans ce dossier et permet de les modifier sans quitter l’interface.

Les articles sont automatiquement triés du plus récent au plus ancien.

### Ajouter un fichier manuellement

Créez un fichier dans `content/articles/` avec ce format :

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

Le fichier sera visible sur `/blog` et dans la liste d’édition du dashboard dès le rechargement de la page. Le champ `published` est optionnel (`true` par défaut si absent) ; mettez-le à `false` pour désactiver l’article sur le blog public tout en le gardant modifiable dans le dashboard.
