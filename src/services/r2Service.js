// src/services/r2Service.js
import axios from 'axios'

// Get signed URL for audio file from backend
export const getSignedAudioUrl = async (fileKey, quality = '128') => {
  try {
    // Replace with your actual signing endpoint
    const response = await axios.get(`${import.meta.env.VITE_R2_API_URL}/sign`, {
      params: {
        key: `${fileKey}_${quality}.mp3`,
      },
    })
    return response.data.url
  } catch (error) {
    console.error('Failed to get signed URL:', error)
    return null
  }
}

// Quality presets mapping
export const QUALITY_PRESETS = {
  '32': { bitrate: 32, label: 'Low (32 kbps)', dataSaver: true },
  '64': { bitrate: 64, label: 'Medium (64 kbps)', dataSaver: true },
  '128': { bitrate: 128, label: 'High (128 kbps)', dataSaver: false },
  '320': { bitrate: 320, label: 'Very High (320 kbps)', dataSaver: false },
}

export const getOptimalQuality = (networkSpeed, userPreference, isDataSaverMode) => {
  if (isDataSaverMode) return '32'
  if (userPreference !== 'auto') return userPreference
  
  // Auto quality based on network speed (Mbps)
  if (networkSpeed < 0.5) return '32'
  if (networkSpeed < 1.5) return '64'
  if (networkSpeed < 5) return '128'
  return '320'
}