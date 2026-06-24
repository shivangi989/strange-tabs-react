// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'strange_tabs_analytics'

const defaultStats = {
  totalSaves: 0,
  totalRestores: 0,
  sessionRestoreCounts: {}, // { sessionId: count }
  lastActive: null
}

export const useAnalytics = () => {
  const [stats, setStats] = useState(defaultStats)

  useEffect(() => {
    // Load from chrome.storage.local on mount
    const load = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get(STORAGE_KEY, (result) => {
            if (result[STORAGE_KEY]) {
              setStats(result[STORAGE_KEY])
            }
          })
        } else {
          // fallback for dev
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) setStats(JSON.parse(raw))
        }
      } catch (err) {
        console.error('[analytics] load failed:', err)
      }
    }
    load()
  }, [])

  const persist = (newStats) => {
    setStats(newStats)
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [STORAGE_KEY]: newStats })
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats))
      }
    } catch (err) {
      console.error('[analytics] save failed:', err)
    }
  }

  const trackSave = () => {
    const updated = {
      ...stats,
      totalSaves: stats.totalSaves + 1,
      lastActive: new Date().toISOString()
    }
    persist(updated)
  }

  const trackRestore = (sessionId) => {
    const updated = {
      ...stats,
      totalRestores: stats.totalRestores + 1,
      lastActive: new Date().toISOString(),
      sessionRestoreCounts: {
        ...stats.sessionRestoreCounts,
        [sessionId]: (stats.sessionRestoreCounts[sessionId] || 0) + 1
      }
    }
    persist(updated)
  }

  const getMostRestored = (sessions) => {
    if (!sessions.length) return null
    return sessions.reduce((best, s) => {
      const count = stats.sessionRestoreCounts[s.id] || 0
      const bestCount = stats.sessionRestoreCounts[best?.id] || 0
      return count > bestCount ? s : best
    }, sessions[0])
  }

  return { stats, trackSave, trackRestore, getMostRestored }
}