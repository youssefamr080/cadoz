import { notificationSounds } from "./notification-sounds"

export class SoundManager {
  private static sounds: { [key: string]: HTMLAudioElement } = {}
  private static isMuted: boolean = false
  private static volume: number = 0.4

  static init() {
    // تهيئة الأصوات مع التحميل المسبق
    Object.entries(notificationSounds).forEach(([type, path]) => {
      this.sounds[type] = new Audio(path)
      this.sounds[type].preload = "auto"
      this.sounds[type].volume = this.volume
    })

    // استعادة إعدادات الصوت من التخزين المحلي
    try {
      const savedSettings = localStorage.getItem("toastSoundSettings")
      if (savedSettings) {
        const { isMuted, volume } = JSON.parse(savedSettings)
        this.isMuted = isMuted
        this.volume = volume
        this.updateAllVolumes()
      }
    } catch (error) {
      console.warn("Could not restore sound settings:", error)
    }
  }

  static play(type: "success" | "error" | "warning" | "info") {
    if (this.isMuted || !this.sounds[type]) return

    // إيقاف أي صوت حالي
    Object.values(this.sounds).forEach(sound => {
      sound.pause()
      sound.currentTime = 0
    })

    // تشغيل الصوت الجديد
    this.sounds[type].play().catch(error => {
      console.warn(`Could not play ${type} sound:`, error)
    })
  }

  static setMuted(muted: boolean) {
    this.isMuted = muted
    this.saveSettings()
  }

  static toggleMute() {
    this.isMuted = !this.isMuted
    this.saveSettings()
    return this.isMuted
  }

  static setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.updateAllVolumes()
    this.saveSettings()
  }

  private static updateAllVolumes() {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume
    })
  }

  private static saveSettings() {
    try {
      localStorage.setItem("toastSoundSettings", JSON.stringify({
        isMuted: this.isMuted,
        volume: this.volume
      }))
    } catch (error) {
      console.warn("Could not save sound settings:", error)
    }
  }

  static getSettings() {
    return {
      isMuted: this.isMuted,
      volume: this.volume
    }
  }
}