class AudioService {
  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'metadata'
    this.listeners = new Map()
    this.currentQuality = '128'
    this.networkSpeed = 0
    this.isDataSaverMode = false
    this.setupEventListeners()
  }
  
  setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => this.emit('timeupdate', this.audio.currentTime))
    this.audio.addEventListener('ended', () => this.emit('ended'))
    this.audio.addEventListener('canplay', () => this.emit('canplay'))
    this.audio.addEventListener('waiting', () => this.emit('buffering', true))
    this.audio.addEventListener('playing', () => this.emit('buffering', false))
    this.audio.addEventListener('durationchange', () => this.emit('duration', this.audio.duration))
    this.audio.addEventListener('error', () => {
      this.emit('buffering', false)
      this.emit('play', false)
      const err = this.audio.error
      const msg = err ? `Audio error (code ${err.code}): ${err.message}` : 'Audio failed to load'
      console.error(msg, this.audio.src)
      this.emit('error', msg)
    })
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event).add(callback)
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) this.listeners.get(event).delete(callback)
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data))
    }
  }
  
  async loadSong(url, autoPlay = false) {
    this.audio.src = url
    this.audio.load()
    if (autoPlay) await this.play()
  }
  
  async play() {
    try {
      await this.audio.play()
      this.emit('play', true)
      return true
    } catch (error) {
      console.error('Playback error:', error)
      return false
    }
  }
  
  pause() {
    this.audio.pause()
    this.emit('play', false)
  }
  
  seekTo(time) {
    if (time >= 0 && time <= this.audio.duration) this.audio.currentTime = time
  }
  
  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume))
    this.emit('volume', volume)
  }
  
  getCurrentTime() { return this.audio.currentTime }
  getDuration() { return this.audio.duration }
  isPlaying() { return !this.audio.paused }
  setPlaybackRate(rate) { this.audio.playbackRate = rate }
  
  async switchQuality(newQuality, currentSongUrl, currentTime) {
    if (this.currentQuality === newQuality) return
    const wasPlaying = this.isPlaying()
    const wasTime = currentTime
    this.currentQuality = newQuality
    const newUrl = currentSongUrl.replace(`_${this.currentQuality}_`, `_${newQuality}_`)
    await this.loadSong(newUrl, false)
    if (wasPlaying) {
      this.seekTo(wasTime)
      await this.play()
    }
  }
  
  measureNetworkSpeed() {
    const startTime = Date.now()
    fetch('/test-image.jpg?cache=' + Date.now(), { mode: 'no-cors' })
      .then(() => {
        const duration = Date.now() - startTime
        this.networkSpeed = (50000 / duration) * 8 / 1000 // Mbps
        this.emit('networkSpeed', this.networkSpeed)
      })
      .catch(() => { this.networkSpeed = 1 })
  }
  
  setDataSaverMode(enabled) {
    this.isDataSaverMode = enabled
    this.emit('dataSaverChanged', enabled)
  }
  
  getOptimalQuality() {
    if (this.isDataSaverMode) return '32'
    if (this.networkSpeed < 0.5) return '32'
    if (this.networkSpeed < 1.5) return '64'
    if (this.networkSpeed < 5) return '128'
    return '320'
  }
}

export const audioService = new AudioService()