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
  
  