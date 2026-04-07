# Harmony X - Offline-First Music Streaming Platform

## 🚀 Overview

Harmony X is a production-ready music streaming web application with offline-first architecture, adaptive streaming, and smart caching. Built for users in bandwidth-constrained environments.

## ✨ Features

- **Offline-First**: Cache songs for offline playback with intelligent eviction
- **Adaptive Streaming**: Auto-adjusts quality based on network speed (32-320 kbps)
- **Smart Caching**: Automatically caches most played songs
- **Cross-Device Sync**: Playlists and history sync across devices
- **PWA Support**: Install as native app on any device
- **Spotify-Inspired UI**: Premium dark theme with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit
- **Backend**: Supabase (PostgreSQL + Auth API)
- **Authentication**: Firebase Auth
- **Storage**: Cloudflare R2 + CDN
- **PWA**: Workbox + Vite PWA Plugin
- **Caching**: IndexedDB + Cache API

## 📦 Installation

### Prerequisites

- Node.js 18+
- Supabase account
- Firebase project
- Cloudflare R2 bucket

### Environment Setup

Create `.env` file in client directory:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_R2_API_URL=your_signing_api_url