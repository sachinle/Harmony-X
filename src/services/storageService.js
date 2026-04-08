import { supabase } from './supabase'

const AUDIO_BUCKET = 'audio'

/**
 * Get public URL for an audio file from Supabase Storage.
 * Files are named: {fileKey}_{quality}.mp3  (e.g. song1_128.mp3)
 */
/**
 * Returns the best available audio URL for a song.
 * Priority: direct audio_url (if provided) → Supabase Storage constructed URL
 */
export const getAudioUrl = (fileKey, quality = '128', audioUrl = null) => {
  if (audioUrl) return audioUrl
  if (!fileKey) return null
  const { data } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(`${fileKey}_${quality}.mp3`)
  return data.publicUrl
}

export const QUALITY_OPTIONS = [
  { value: '32',  label: 'Low (32 kbps)',       dataSaver: true  },
  { value: '64',  label: 'Medium (64 kbps)',     dataSaver: true  },
  { value: '128', label: 'High (128 kbps)',      dataSaver: false },
  { value: '320', label: 'Very High (320 kbps)', dataSaver: false },
]

export const getOptimalQuality = (networkSpeed, isDataSaverMode) => {
  if (isDataSaverMode) return '32'
  if (networkSpeed < 0.5) return '32'
  if (networkSpeed < 1.5) return '64'
  if (networkSpeed < 5)   return '128'
  return '320'
}
