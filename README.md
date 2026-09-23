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
