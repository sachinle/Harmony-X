import { useState, useEffect } from 'react'

export const useNetworkQuality = () => {
  const [networkSpeed, setNetworkSpeed] = useState(10) // Mbps
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    // Measure speed by downloading a small file
    const measureSpeed = async () => {
      const startTime = Date.now()
      const testUrl = `https://www.cloudflare.com/cdn-cgi/trace?cache=${Date.now()}`
      try {
        const response = await fetch(testUrl, { cache: 'no-store' })
        const data = await response.text()
        const duration = Date.now() - startTime
        const fileSize = data.length // bytes
        const speedMbps = (fileSize * 8) / (duration * 1000)
        setNetworkSpeed(Math.min(20, Math.max(0.1, speedMbps)))
      } catch (error) {
        console.warn('Speed measurement failed', error)
      }
    }

    measureSpeed()
    const interval = setInterval(measureSpeed, 30000) // every 30 sec

    // Detect connection type via Network Information API
    if ('connection' in navigator) {
      const conn = navigator.connection
      setConnectionType(conn.effectiveType || 'unknown')
      const updateType = () => setConnectionType(conn.effectiveType)
      conn.addEventListener('change', updateType)
      return () => conn.removeEventListener('change', updateType)
    }

    return () => clearInterval(interval)
  }, [])

  return { networkSpeed, connectionType }
}