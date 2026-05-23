# 🎵 AURA — Your Musical Identity

> Réseau social musical dark & premium inspiré de Spotify, TikTok et Discord

---

## ✨ Aperçu

AURA est une application web complète permettant aux utilisateurs d'exprimer leur identité musicale. Partage ta musique du moment, affiche ton **aura** colorée, suis d'autres artistes et construis ta bibliothèque personnelle.

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Un projet Supabase → [app.supabase.com](https://app.supabase.com)
- Un serveur web local (ex: Live Server VS Code, ou `npx serve`)

### 2. Installation

```bash
# Clone ou extrait le ZIP
cd aura/

# Lance un serveur local (Python)
python3 -m http.server 8080
# ou avec Node
npx serve .
```

### 3. Configuration Supabase

**a) Crée un projet Supabase**

**b) Exécute le schéma SQL**
- Va dans `SQL Editor` → `New query`
- Copie-colle le contenu de `supabase/schema.sql`
- Clique **Run**

**c) Configure les clés API**

Copie `.env.example` en `.env` et remplis tes clés :
```
SUPABASE_URL=https://XXXXXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Ensuite, modifie `js/supabase-config.js` :
```js
const SUPABASE_URL     = 'https://XXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...';
```

**d) Active le Storage bucket**
- Va dans `Storage` → `New bucket`
- Nom : `media` — coche **Public**

### 4. Ouvre l'app
```
http://localhost:8080/pages/login.html
```

---

## 📁 Structure du projet

```
aura/
├── assets/
│   ├── images/          Ressources visuelles
│   └── icons/           Icônes custom
├── css/
│   ├── variables.css    Variables globales & reset
│   ├── components.css   Composants réutilisables
│   ├── auth.css         Pages login/register
│   ├── home.css         Feed principal
│   ├── profile.css      Page profil
│   ├── upload.css       Création de post
│   ├── search.css       Recherche & explore
│   ├── playlist.css     Bibliothèque & playlists
│   └── settings.css     Réglages
├── js/
│   ├── supabase-config.js  Configuration Supabase
│   ├── auth.js             Authentification
│   ├── db.js               API base de données
│   ├── player.js           Lecteur audio (Howler.js)
│   ├── layout.js           Layout partagé (sidebar, topbar, player)
│   └── utils.js            Utilitaires (toast, format, helpers)
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── profile.html
│   ├── upload.html
│   ├── search.html
│   ├── playlist.html
│   └── settings.html
├── supabase/
│   └── schema.sql       Schéma complet (tables, RLS, triggers, fonctions)
├── .env.example
└── README.md
```

---

## 🎨 Design System

| Élément | Valeur |
|---------|--------|
| Background principal | `#050508` |
| Accent violet | `#7c3aed` |
| Accent bleu électrique | `#2563eb` |
| Police display | Syne (Google Fonts) |
| Police corps | DM Sans (Google Fonts) |
| Radius cards | `16px` |
| Style global | Dark glassmorphism + néon |

---

## 🎵 Moods disponibles

| Mood | Couleur | Ambiance |
|------|---------|----------|
| 🌑 Dark | `#818cf8` | Sombre, introspectif |
| ❄️ Chill | `#06b6d4` | Relaxant, lo-fi |
| 🔥 Rage | `#ef4444` | Intense, énergie |
| 🎯 Focus | `#a78bfa` | Concentration, travail |
| 💜 Love | `#ec4899` | Romantique, doux |
| 💪 Gym | `#f59e0b` | Motivation, sport |
| ⭐ Night | `#c4b5fd` | Nocturne, mystérieux |

---

## 🗄️ Tables Supabase

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs étendus |
| `posts` | Posts musicaux |
| `songs` | Catalogue de morceaux |
| `likes` | Likes sur les posts |
| `comments` | Commentaires |
| `follows` | Relations follower/following |
| `playlists` | Playlists utilisateurs |
| `playlist_songs` | Morceaux dans les playlists |
| `moods` | Statistiques des moods trending |

---

## 🔐 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- Les utilisateurs ne peuvent modifier que leurs propres données
- Les posts/playlists privés sont cachés aux autres
- Les uploads sont restreints aux dossiers autorisés (`avatars/`, `covers/`, `audio/`)

---

## 📦 Librairies utilisées

| Lib | CDN | Usage |
|-----|-----|-------|
| Supabase JS v2 | jsDelivr | Auth, DB, Storage, Realtime |
| Howler.js v2 | cdnjs | Lecteur audio |
| Font Awesome 6 | cdnjs | Icônes |
| Google Fonts | fonts.google.com | Syne + DM Sans |

---

## ⚡ Fonctionnalités

- [x] Authentification complète (register, login, logout, session persistante)
- [x] Création de profil automatique après inscription
- [x] Feed musical avec filtrage par mood
- [x] Création de posts (titre, artiste, couverture, audio, caption, mood)
- [x] Lecteur audio intégré (Howler.js + visualizer animé)
- [x] Système de likes (optimistic UI)
- [x] Commentaires en temps réel
- [x] Système de follows/unfollow
- [x] Page profil complète (avatar, bannière, stats, posts en grille)
- [x] Modification du profil (photo, bio, mood, aura)
- [x] Playlists (créer, voir, ajouter/retirer morceaux)
- [x] Recherche (utilisateurs, playlists, musiques)
- [x] Page Explorer avec moods et suggestions
- [x] Réglages complets
- [x] Responsive mobile + desktop
- [x] Bottom navbar mobile
- [x] Sidebar desktop avec navigation

---

## 🧪 Mode démo

Sans configuration Supabase, l'app fonctionne partiellement en mode démo avec des données simulées pour les posts, trending, et suggestions.

---

## 📄 Licence

MIT — Libre d'utilisation pour projets personnels et commerciaux.

---

*Built with ❤️ — AURA v1.0.0*
