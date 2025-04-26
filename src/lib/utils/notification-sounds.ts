"use client"

const notificationSounds = {
  success: "/sounds/click.mp3",    // صوت خفيف للنجاح
  error: "/sounds/open.mp3",       // صوت مميز للأخطاء
  warning: "/sounds/message.mp3",  // صوت تنبيه للتحذيرات
  info: "/sounds/message.mp3"      // نفس صوت الرسالة للمعلومات
}

let soundInitialized = false

export function initNotificationSounds() {
  if (soundInitialized) return
  
  // تحميل مسبق للأصوات لتحسين الأداء
  Object.entries(notificationSounds).forEach(([type, path]) => {
    const audio = new Audio(path)
    audio.preload = "auto"
    audio.volume = 0.4
  })
  
  soundInitialized = true
}

export { notificationSounds }