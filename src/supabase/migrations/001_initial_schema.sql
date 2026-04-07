-- supabase/migrations/001_initial_schema.sql

-- Users table (sync with Firebase)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Songs table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER NOT NULL, -- in seconds
  file_key TEXT NOT NULL, -- R2 key without quality suffix
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Playlist songs junction table
CREATE TABLE playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

-- Listening history
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_playlist_user ON playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist ON playlist_songs(playlist_id);
CREATE INDEX idx_history_user ON listening_history(user_id);
CREATE INDEX idx_history_played_at ON listening_history(played_at DESC);
CREATE INDEX idx_songs_search ON songs USING GIN(to_tsvector('english', title || ' ' || artist || ' ' || album));

-- Sample data insertion
INSERT INTO songs (title, artist, album, duration, file_key, cover_url) VALUES
('Midnight Dreams', 'The Wanderers', 'Night Sessions', 215, 'song_001', 'https://picsum.photos/300/300?random=1'),
('Urban Lights', 'Neon City', 'Metropolis', 198, 'song_002', 'https://picsum.photos/300/300?random=2'),
('Acoustic Journey', 'Sarah Mitchell', 'Simple Days', 243, 'song_003', 'https://picsum.photos/300/300?random=3'),
('Electronic Flow', 'Digital Beats', 'Frequency', 187, 'song_004', 'https://picsum.photos/300/300?random=4'),
('Rock Anthem', 'Thunder Road', 'Revolution', 234, 'song_005', 'https://picsum.photos/300/300?random=5'),
('Jazz Vibes', 'Smooth Collective', 'Late Night Jazz', 267, 'song_006', 'https://picsum.photos/300/300?random=6');