/**
 * تقسيم المصفوفة إلى مجموعات بحجم محدد
 * @param array المصفوفة المراد تقسيمها
 * @param chunkSize حجم كل مجموعة (افتراضيًا 10)
 * @returns مصفوفة من المصفوفات، كل منها بحجم محدد
 */
export const chunkArray = <T,>(array: T[], chunkSize = 10): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * ترتيب المصفوفة بشكل عشوائي
 * @param array المصفوفة المراد ترتيبها
 * @returns نسخة مرتبة عشوائيًا من المصفوفة
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

/**
 * تصفية المصفوفة بناءً على خاصية معينة
 * @param array المصفوفة المراد تصفيتها
 * @param property اسم الخاصية
 * @param value القيمة المطلوبة
 * @returns مصفوفة مصفاة
 */
export const filterArrayByProperty = <T, K extends keyof T>(array: T[], property: K, value: T[K]): T[] => {
  return array.filter((item) => item[property] === value)
}

/**
 * تجميع المصفوفة حسب خاصية معينة
 * @param array المصفوفة المراد تجميعها
 * @param property اسم الخاصية
 * @returns كائن يحتوي على مجموعات
 */
export const groupArrayByProperty = <T,>(array: T[], property: keyof T): Record<string, T[]> => {
  return array.reduce(
    (acc, item) => {
      const key = String(item[property])
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<string, T[]>,
  )
}

