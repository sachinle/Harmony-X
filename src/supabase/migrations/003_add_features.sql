-- Migration: Add genres, device sessions, lyrics placeholder

-- Genre column on songs
ALTER TABLE songs ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT 'Pop';

-- Assign demo genres
UPDATE songs SET genre = 'Electronic' WHERE file_key IN ('song1', 'song_001');
UPDATE songs SET genre = 'Electronic' WHERE file_key IN ('song2', 'song_002');
UPDATE songs SET genre = 'Pop'        WHERE file_key IN ('song3', 'song_003');
UPDATE songs SET genre = 'Rock'       WHERE file_key IN ('song4', 'song_004');
UPDATE songs SET genre = 'Chill'      WHERE file_key IN ('song5', 'song_005');
UPDATE songs SET genre = 'Jazz'       WHERE file_key IN ('song_006');
-- Fallback for any remaining nulls
UPDATE songs SET genre = 'Pop' WHERE genre IS NULL;

-- Play count on songs (for stats)
ALTER TABLE songs ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;

-- Device sessions for multi-device sync
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

-- Index for fast device lookup
CREATE INDEX IF NOT EXISTS idx_device_sessions_user ON device_sessions(user_id);

-- Offline downloads tracking
CREATE TABLE IF NOT EXISTS offline_downloads (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   TEXT REFERENCES users(id) ON DELETE CASCADE,
  song_id   UUID REFERENCES songs(id) ON DELETE CASCADE,
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);
