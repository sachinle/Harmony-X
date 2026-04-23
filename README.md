# Harmony X 🎵

> A production-ready, offline-first music streaming platform — Spotify-inspired UI built with React 19, Firebase Auth, Supabase, and Capacitor for Android.

---

## Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Features](#-features)
4. [Project Structure](#-project-structure)
5. [Environment Variables](#-environment-variables)
6. [Database Schema](#-database-schema)
7. [Supabase Storage](#-supabase-storage)
8. [Setup & Installation](#-setup--installation)
9. [Development Commands](#-development-commands)
10. [Production Build](#-production-build)
11. [Android (Capacitor) Build](#-android-capacitor-build)
12. [Routes](#-routes)
13. [Redux State](#-redux-state)
14. [Authentication Flow](#-authentication-flow)
15. [Audio Playback Architecture](#-audio-playback-architecture)
16. [PWA & Offline Support](#-pwa--offline-support)
17. [Deployment](#-deployment)
18. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

**Harmony X** is a full-stack music streaming web app (also packaged as an Android APK via Capacitor). It replicates the core Spotify experience: browse songs, build playlists, like tracks, search by genre, stream audio, and work fully offline.

- **App ID:** `com.harmonyx.app`
- **Version:** `1.0.0`
- **Framework:** React 19 + Vite
- **Database:** Supabase (PostgreSQL)
- **Auth:** Firebase Authentication
- **Audio Storage:** Supabase Storage (bucket: `audio`)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS |
| State Management | Redux Toolkit + React-Redux |
| Authentication | Firebase Auth (Email/Password + Google OAuth) |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage (`audio` bucket — public) |
| Mobile | Capacitor 8 (Android) |
| PWA | Vite Plugin PWA + Workbox |
| Offline Cache | IndexedDB (`idb`) + Service Worker Cache API |
| Analytics | Vercel Analytics |
| UI Icons | Lucide React |
| Notifications | React Hot Toast |
| Router | React Router DOM v7 |

---

## ✨ Features

- 🎵 **Stream audio** from Supabase Storage with adaptive quality (32 / 128 / 320 kbps)
- 🔍 **Search** songs by title, artist, album with genre category browsing
- ❤️ **Like songs** — synced to Supabase `liked_songs` table per user
- 📁 **Playlists** — create, delete, add/remove songs; stored in Supabase
- 🕐 **Listening history** — auto-tracked, deduplicated, shown on Home
- 🔄 **Repeat / Shuffle** — full playback controls with next/previous
- 🔊 **Volume & Seek** — slider controls, buffering indicator
- 📱 **PWA** — installable on desktop/mobile, offline-first
- 📴 **Offline mode** — cached songs play without internet
- 🌐 **Multi-device sync** — device sessions stored in Supabase
- 🤖 **Android APK** — Capacitor wraps the web app natively
- 🔐 **Account Settings** — change display name, change password
- 🎨 **Pixel-perfect dark UI** — Spotify color palette, smooth animations

---

## 📁 Project Structure

```
harmony-x/
├── android/                    # Capacitor Android project
├── assets/                     # Static assets (icons, splash)
├── dist/                       # Production build output
├── public/                     # Public assets served by Vite
├── src/
│   ├── components/
│   │   ├── Navbar/             # Top navigation bar
│   │   ├── Sidebar/            # Left sidebar (desktop)
│   │   ├── Player/             # Bottom audio player bar
│   │   ├── SongCard/           # Song tile with hover play + like
│   │   ├── Playlist/           # Playlist card component
│   │   ├── Queue/              # Playback queue panel
│   │   ├── Modals/             # Add-to-playlist modal
│   │   ├── Toast/              # Toast notification wrapper
│   │   ├── Loader/             # Loading spinner
│   │   ├── Navigation/         # Mobile bottom nav
│   │   ├── OfflineBanner/      # Offline indicator banner
│   │   ├── PullToRefresh/      # Mobile pull-to-refresh
│   │   ├── Devices/            # Connected devices panel
│   │   └── UserAvatar/         # User avatar + initials fallback
│   ├── hooks/
│   │   ├── useAudioPlayer.js   # Core audio playback hook
│   │   ├── useDeviceSync.js    # Multi-device sync via Supabase Realtime
│   │   ├── useNetworkQuality.js # Network speed detector → quality setting
│   │   ├── useOfflineSync.js   # IndexedDB offline cache management
│   │   ├── useOnlineStatus.js  # Online/offline event listener
│   │   └── useToast.js         # Toast helper hook
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx       # Login page (email + Google)
│   │   │   └── Signup.jsx      # Signup page
│   │   ├── Home.jsx            # Greeting + recent songs + playlists
│   │   ├── Search.jsx          # Search bar + genre categories
│   │   ├── Library.jsx         # All user playlists
│   │   ├── LikedSongs.jsx      # Liked songs page
│   │   ├── PlaylistDetails.jsx # Playlist track list
│   │   ├── NowPlaying.jsx      # Full-screen now playing (mobile)
│   │   └── Account.jsx         # Account settings
│   ├── routes/
│   │   ├── AppRouter.jsx       # React Router v7 route definitions
│   │   └── ProtectedRoute.jsx  # Auth guard wrapper
│   ├── services/
│   │   ├── supabase.js         # All Supabase DB queries
│   │   ├── storageService.js   # Supabase Storage public URL builder
│   │   ├── audioService.js     # HTML5 Audio singleton + event emitter
│   │   ├── firebase.js         # Firebase app + auth initialization
│   │   ├── cacheService.js     # IndexedDB audio cache service
│   │   ├── api.js              # Axios API helper (if needed)
│   │   └── r2Service.js        # Legacy R2 service (unused)
│   ├── store/
│   │   ├── index.js            # Redux store setup
│   │   └── slices/
│   │       ├── playerSlice.js  # Audio player state
│   │       ├── userSlice.js    # Authenticated user state
│   │       ├── playlistSlice.js # Songs + search results
│   │       └── librarySlice.js # Playlists + liked songs
│   ├── styles/                 # Global CSS overrides
│   ├── utils/                  # Utility helpers (format time, etc.)
│   ├── App.jsx                 # Root app component + layout
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind base + custom styles
├── src/supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_add_audio_url.sql
│       └── 003_add_features.sql
├── .env                        # Environment variables (git-ignored)
├── capacitor.config.json       # Capacitor config
├── index.html                  # HTML entry point
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root (never commit this file):

```env
# ─── Firebase ────────────────────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ─── Supabase ────────────────────────────────────────────────────────────────
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ─── Google OAuth (Capacitor Android) ────────────────────────────────────────
VITE_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
VITE_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
```

> **Where to find these values:**
> - **Firebase:** [Firebase Console](https://console.firebase.google.com) → Project Settings → General → Your apps
> - **Supabase URL & Anon Key:** [Supabase Dashboard](https://supabase.com/dashboard) → Project → Settings → API
> - **Google Client IDs:** [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

---

## 🗄 Database Schema

Run all migration files in order via **Supabase SQL Editor** (`supabase.com/dashboard → SQL Editor`).

---

### Migration 001 — Initial Schema

```sql
-- src/supabase/migrations/001_initial_schema.sql

-- Users table (synced from Firebase Auth)
CREATE TABLE users (
  id         TEXT PRIMARY KEY,          -- Firebase UID
  name       TEXT,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  artist     TEXT NOT NULL,
  album      TEXT,
  duration   INTEGER NOT NULL,          -- seconds
  file_key   TEXT NOT NULL,             -- Storage key, e.g. "song_001"
  cover_url  TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playlist ↔ Song junction
CREATE TABLE playlist_songs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id     UUID REFERENCES songs(id) ON DELETE CASCADE,
  position    INTEGER DEFAULT 0,
  added_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Listening history
CREATE TABLE listening_history (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   TEXT REFERENCES users(id) ON DELETE CASCADE,
  song_id   UUID REFERENCES songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_playlist_user        ON playlists(user_id);
CREATE INDEX idx_playlist_songs       ON playlist_songs(playlist_id);
CREATE INDEX idx_history_user         ON listening_history(user_id);
CREATE INDEX idx_history_played_at    ON listening_history(played_at DESC);
CREATE INDEX idx_songs_search         ON songs
  USING GIN(to_tsvector('english', title || ' ' || artist || ' ' || coalesce(album, '')));
```

---

### Migration 002 — Add `audio_url` Column

```sql
-- src/supabase/migrations/002_add_audio_url.sql
-- Allows direct audio URL override per song (optional — app uses Supabase Storage by default)

ALTER TABLE songs ADD COLUMN IF NOT EXISTS audio_url TEXT;
```

---

### Migration 003 — Add Genres, Play Count, Device Sessions, Offline Downloads

```sql
-- src/supabase/migrations/003_add_features.sql

ALTER TABLE songs ADD COLUMN IF NOT EXISTS genre      TEXT DEFAULT 'Pop';
ALTER TABLE songs ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

-- Multi-device sync sessions
CREATE TABLE IF NOT EXISTS device_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  device_id    TEXT NOT NULL,
  device_name  TEXT NOT NULL,
  song_data    JSONB,
  is_playing   BOOLEAN DEFAULT false,
  current_time FLOAT DEFAULT 0,
  volume       FLOAT DEFAULT 0.7,
  last_seen    TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Offline download tracking
CREATE TABLE IF NOT EXISTS offline_downloads (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   TEXT REFERENCES users(id) ON DELETE CASCADE,
  song_id   UUID REFERENCES songs(id) ON DELETE CASCADE,
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_device_sessions_user ON device_sessions(user_id);
```

---

### Migration 004 — Liked Songs *(run manually)*

```sql
-- src/supabase/migrations/004_liked_songs.sql

CREATE TABLE IF NOT EXISTS liked_songs (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  TEXT NOT NULL,
  song_id  UUID REFERENCES songs(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

-- Disable RLS (app uses Firebase UID for user isolation at query level)
ALTER TABLE liked_songs DISABLE ROW LEVEL SECURITY;
```

---

### Full Table Reference

| Table | Primary Key | Key Columns | Notes |
|---|---|---|---|
| `users` | `id TEXT` (Firebase UID) | `name`, `email` | Upserted on every login |
| `songs` | `id UUID` | `title`, `artist`, `file_key`, `cover_url`, `genre`, `duration` | `file_key` used to build Supabase Storage URL |
| `playlists` | `id UUID` | `user_id`, `name` | FK → `users.id` |
| `playlist_songs` | `id UUID` | `playlist_id`, `song_id`, `position` | Junction table, unique constraint |
| `listening_history` | `id UUID` | `user_id`, `song_id`, `played_at` | Queried deduped by song on Home page |
| `liked_songs` | `id UUID` | `user_id TEXT`, `song_id UUID` | Unique per user+song |
| `device_sessions` | `id UUID` | `user_id`, `device_id`, `song_data JSONB` | Realtime sync |
| `offline_downloads` | `id UUID` | `user_id`, `song_id` | Tracks IndexedDB cache |

---

## 🗃 Supabase Storage

**Bucket name:** `audio`  
**Visibility:** Public (no signed URLs needed)

### File naming convention

```
{file_key}_{quality}.mp3
```

**Examples:**

| `file_key` | Quality | Filename in bucket |
|---|---|---|
| `song_001` | 128 kbps | `song_001_128.mp3` |
| `song_001` | 32 kbps | `song_001_32.mp3` |
| `song_001` | 320 kbps | `song_001_320.mp3` |

### Public URL pattern

```
https://<project-ref>.supabase.co/storage/v1/object/public/audio/{file_key}_{quality}.mp3
```

### How to upload songs

1. Go to **Supabase Dashboard → Storage → audio bucket**
2. Upload files named exactly as `{file_key}_{quality}.mp3`
3. Insert a row into the `songs` table with the matching `file_key`
4. The app auto-builds the URL via `storageService.js`

### Quality tiers (adaptive)

| Quality | Bitrate | When used |
|---|---|---|
| `32` | 32 kbps | Data Saver mode ON, or very slow network |
| `128` | 128 kbps | Default (Wi-Fi / good mobile) |
| `320` | 320 kbps | High Quality mode (user toggle) |

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Supabase** project (free tier works)
- A **Firebase** project with Authentication enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Harmony-X.git
cd Harmony-X
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

```bash
cp .env.example .env
# Then fill in all values — see Environment Variables section above
```

### 4. Run database migrations

Open [Supabase SQL Editor](https://supabase.com/dashboard) and run each file in order:

```
src/supabase/migrations/001_initial_schema.sql
src/supabase/migrations/002_add_audio_url.sql
src/supabase/migrations/003_add_features.sql
src/supabase/migrations/004_liked_songs.sql   ← create this file manually (see above)
```

### 5. Configure Firebase Authentication

In the [Firebase Console](https://console.firebase.google.com):

1. Enable **Email/Password** sign-in method
2. Enable **Google** sign-in method
3. Add your domain (`localhost`, your Vercel URL) to **Authorized domains**

### 6. Create Supabase Storage bucket

1. Go to **Supabase Dashboard → Storage**
2. Create a bucket named exactly `audio`
3. Set it to **Public**
4. Upload MP3 files using the naming format: `{file_key}_{quality}.mp3`

---

## 💻 Development Commands

```bash
# Start development server (hot reload, localhost:5173)
npm run dev

# Lint source files
npm run lint

# Preview production build locally (localhost:4173)
npm run preview
```

---

## 🏗 Production Build

```bash
# Build for production (outputs to /dist)
npm run build

# Preview the production build
npm run preview
```

The build generates a fully optimized static bundle in `dist/`:
- Code-split chunks per route
- Hashed asset filenames for long-term caching
- Service Worker registered for PWA offline support
- Bundle size optimized via Rollup tree-shaking

---

## 📱 Android (Capacitor) Build

### Prerequisites

- **Android Studio** installed
- **Java JDK 17+**
- `ANDROID_HOME` environment variable set

### Build steps

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets to the Android project
npx cap sync android

# 3. Open in Android Studio (then Build → Generate Signed APK)
npx cap open android

# ── OR build APK from CLI ──

# Debug APK
cd android && ./gradlew assembleDebug

# Release APK (requires keystore)
cd android && ./gradlew assembleRelease
```

### APK output location

```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk
```

### Capacitor app config

| Property | Value |
|---|---|
| App ID | `com.harmonyx.app` |
| App Name | `Harmony X` |
| Web Dir | `dist` |
| Splash BG | `#121212` |
| Status Bar | Dark, `#121212` |
| Auth Providers | `google.com`, `password` |

---

## 🗺 Routes

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `Home.jsx` | ✅ | Greeting, recent songs, playlists |
| `/search` | `Search.jsx` | ✅ | Search bar + genre categories |
| `/library` | `Library.jsx` | ✅ | All user playlists |
| `/liked` | `LikedSongs.jsx` | ✅ | Liked tracks |
| `/playlist/:id` | `PlaylistDetails.jsx` | ✅ | Playlist track list |
| `/account` | `Account.jsx` | ✅ | Account settings |
| `/profile` | `Account.jsx` | ✅ | Profile (same as account) |
| `/login` | `Login.jsx` | ❌ | Login page |
| `/signup` | `Signup.jsx` | ❌ | Signup page |

---

## 🗂 Redux State

### `playerSlice`

```js
{
  currentSong: null,          // Current song object from DB
  currentPlaylist: [],        // Active playlist array
  currentIndex: -1,           // Index in currentPlaylist
  isPlaying: false,
  volume: 0.8,
  progress: 0,                // 0–1 playback position
  duration: 0,                // seconds
  repeatMode: 'off',          // 'off' | 'all' | 'one'
  isShuffled: false,
  quality: '128',             // '32' | '128' | '320'
  isDataSaverMode: false,
  isBuffering: false
}
```

**Key actions:**
- `playSongFromPlaylist({ song, playlist, index })` — play a song with full context
- `nextSong()` / `previousSong()` — navigate playlist
- `setProgress(n)`, `setVolume(n)`, `toggleRepeat()`, `toggleShuffle()`

### `librarySlice`

```js
{
  playlists: [],              // User's playlists
  likedSongs: [],             // Full liked song objects
  likedSongIds: [],           // Just IDs for fast lookup
  isLoading: false
}
```

### `userSlice`

```js
{
  uid: null,                  // Firebase UID
  email: null,
  displayName: null,
  photoURL: null,
  isLoading: false
}
```

### `playlistSlice`

```js
{
  songs: [],                  // All songs from DB
  searchResults: [],
  recentSearches: [],
  isLoading: false
}
```

---

## 🔐 Authentication Flow

```
User opens app
    │
    ├─ Firebase onAuthStateChanged fires
    │       │
    │       ├─ No user → redirect to /login
    │       │
    │       └─ User logged in
    │               │
    │               ├─ dispatch setUser(firebaseUser)
    │               ├─ upsertUser(uid, email, name) → Supabase users table
    │               ├─ fetchLikedSongIds(uid)       → Redux likedSongIds
    │               └─ fetchUserPlaylists(uid)      → Redux playlists
    │
Login page
    ├─ Email/Password → signInWithEmailAndPassword (Firebase)
    └─ Google OAuth   → GoogleAuthProvider (Firebase)
                              │
                              └─ upsertUser called → ensures row in Supabase
```

> **Important:** Firebase UID is used as the `user_id TEXT` (not UUID) in all Supabase tables. There is no Supabase Auth — only Firebase Auth.

---

## 🔊 Audio Playback Architecture

```
SongCard / PlaylistDetails clicked
    │
    └─ dispatch(playSongFromPlaylist({ song, playlist, index }))
            │
            ├─ Redux: currentSong, currentPlaylist, currentIndex set
            │
            └─ useAudioPlayer hook reacts to currentSong change
                    │
                    ├─ storageService.getAudioUrl(file_key, quality)
                    │     → https://<supabase>.co/storage/v1/object/public/audio/{file_key}_{quality}.mp3
                    │
                    ├─ audioService.loadSong(url, autoplay=true)
                    │     → HTML5 <audio> element
                    │
                    ├─ onEnded → dispatch(nextSong()) or repeat
                    └─ progress/duration → dispatch(setProgress/setDuration)
```

**`audioService.js`** is a singleton class wrapping a single `<audio>` element. It exposes:
- `loadSong(url, autoplay)`
- `play()`, `pause()`, `seekTo(seconds)`, `setVolume(0-1)`
- Event subscriptions: `on('timeupdate' | 'ended' | 'buffering' | ...)`

---

## 📶 PWA & Offline Support

The app uses **Vite Plugin PWA** with Workbox for caching:

| Cache | Strategy | TTL |
|---|---|---|
| App Shell (JS/CSS/HTML) | Precache | Perpetual |
| Audio files (MP3) | Cache First | 60 days |
| Cover art / images | Cache First | 30 days |
| Supabase REST API | Network First | 24 hours |
| Supabase Storage audio | Cache First | 60 days |

> When offline, the `OfflineBanner` component shows a notice and previously cached songs continue to play.

---

## 🚀 Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all `.env` variables to Vercel's **Environment Variables** settings.

### Netlify

```bash
npm run build
# Drag the /dist folder to Netlify Drop, or use CLI:
npx netlify-cli deploy --prod --dir=dist
```

Set `_redirects` in `/public`:
```
/*  /index.html  200
```

### Self-hosted (Nginx)

```bash
npm run build

# Copy dist/ to your server, then Nginx config:
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 🔧 Troubleshooting

### Songs not playing

1. Check that audio files exist in Supabase Storage bucket `audio`
2. Verify file names match pattern: `{file_key}_{quality}.mp3`
3. Confirm bucket is set to **Public**
4. Check browser console for CORS errors
5. Verify `VITE_SUPABASE_URL` is correct in `.env`

### Liked songs not saving

Run migration `004_liked_songs.sql` in Supabase SQL Editor (table may not exist).

### Google Sign-In fails on Android

1. Add your Android app's SHA-1 fingerprint to Firebase project
2. Ensure `google-services.json` is in `android/app/`
3. Set `VITE_GOOGLE_ANDROID_CLIENT_ID` in `.env`

### Auth redirects to login even when logged in

Firebase takes time to restore session. The app shows a loading spinner while `onAuthStateChanged` fires — if it stays stuck, check `VITE_FIREBASE_*` env vars.

### Build fails: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Capacitor sync fails

```bash
npm run build          # must build first
npx cap sync android   # then sync
```

---

## 📝 Notes

- **Row Level Security (RLS)** is disabled on all tables — the app uses Firebase UID filtering at the query level via Supabase JS client.
- **`users` table** uses `TEXT` primary key (Firebase UID), not UUID. Do not change this.
- **Audio quality** selection respects `isDataSaverMode` (forces 32kbps) and `useNetworkQuality` hook (auto-selects based on connection speed).
- **Google Services JSON** (`android/app/google-services.json`) is git-ignored — download it from Firebase Console → Project Settings → Android app.

---

## 👤 Author

**Sachin Immanuel**  
📧 sachinimmanuel2006@gmail.com

---

*Built with ❤️ using React, Supabase, and Firebase*
