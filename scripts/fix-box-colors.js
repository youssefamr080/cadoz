const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function fixBoxColors() {
  console.log('=== تصحيح ألوان الصناديق بناء على أسمائها ===')
  
  try {
    // تصحيحات محددة للصناديق
    const boxColorFixes = [
      {
        name: 'صندوق هدايا أزرق فاتح',
        correctColor: '#3B82F6' // أزرق فاتح
      },
      {
        name: 'صندوق هدايا وردي رومانسي',
        correctColor: '#EC4899' // وردي
      },
      {
        name: 'صندوق هدايا أسود أنيق',
        correctColor: '#1F2937' // أسود
      }
    ]
    
    for (const fix of boxColorFixes) {
      const box = await prisma.box.findFirst({
        where: { name: fix.name }
      })
      
      if (box) {
        await prisma.box.update({
          where: { id: box.id },
          data: { color: fix.correctColor }
        })
        console.log(`✅ تم تصحيح ${fix.name}: ${box.color} → ${fix.correctColor}`)
      }
    }
    
    // عرض النتائج النهائية
    console.log('\n--- الصناديق مع الألوان المصححة ---')
    const allBoxes = await prisma.box.findMany({
      select: { name: true, size: true, color: true }
    })
    
    allBoxes.forEach(box => {
      console.log(`📦 ${box.name} (${box.size}): ${box.color}`)
    })
    
    console.log('\n🎨 تم تصحيح ألوان الصناديق! الآن كل صندوق له اللون الصحيح في العرض ثلاثي الأبعاد.')
    
  } catch (error) {
    console.error('❌ خطأ في تصحيح الألوان:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixBoxColors()
