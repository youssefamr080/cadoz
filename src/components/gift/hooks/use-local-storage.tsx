"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // تهيئة الحالة بقيمة افتراضية
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // قراءة القيمة المخزنة من localStorage عند التحميل الأولي
  useEffect(() => {
    try {
      if (typeof window === "undefined") return

      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  // تحديث القيمة في localStorage عند تغيير الحالة
  const setValue = (value: T) => {
    try {
      if (typeof window === "undefined") return

      // تحديث الحالة
      setStoredValue(value)

      // تحديث localStorage
      window.localStorage.setItem(key, JSON.stringify(value))

      // إطلاق حدث مخصص للتزامن بين علامات التبويب
      const event = new StorageEvent("storage", {
        key,
        newValue: JSON.stringify(value),
        storageArea: localStorage,
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

