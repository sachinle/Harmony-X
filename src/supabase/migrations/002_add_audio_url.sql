-- Migration: Add direct audio_url column to songs
-- This allows songs to use direct audio URLs instead of requiring
-- files to be uploaded to Supabase Storage.

ALTER TABLE songs ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Update existing songs with free demo audio from SoundHelix
-- These are royalty-free MP3s suitable for development/demo use.
-- Replace with your actual audio file URLs when deploying to production.

UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' WHERE file_key = 'song1';
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' WHERE file_key = 'song2';
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' WHERE file_key = 'song3';
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' WHERE file_key = 'song4';
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' WHERE file_key = 'song5';

-- Also handles the song_001 format used in the initial migration
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' WHERE file_key = 'song_001' AND audio_url IS NULL;
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' WHERE file_key = 'song_002' AND audio_url IS NULL;
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' WHERE file_key = 'song_003' AND audio_url IS NULL;
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' WHERE file_key = 'song_004' AND audio_url IS NULL;
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' WHERE file_key = 'song_005' AND audio_url IS NULL;
UPDATE songs SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' WHERE file_key = 'song_006' AND audio_url IS NULL;
