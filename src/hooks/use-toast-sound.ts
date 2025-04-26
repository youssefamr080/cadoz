"use client"

import { useEffect, useCallback, useState } from 'react'
import { SoundManager } from '../lib/utils/sound-manager'
import { initNotificationSounds } from '../lib/utils/notification-sounds'

export function useToastSound() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('toastSoundSettings')
      return settings ? JSON.parse(settings).isMuted : false
    }
    return false
  })

  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('toastSoundSettings')
      return settings ? JSON.parse(settings).volume : 0.4
    }
    return 0.4
  })

  useEffect(() => {
    initNotificationSounds()
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev
      SoundManager.setMuted(newValue)
      return newValue
    })
  }, [])

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume)
    SoundManager.setVolume(newVolume)
  }, [])

  return {
    isMuted,
    volume,
    toggleMute,
    updateVolume
  }
}