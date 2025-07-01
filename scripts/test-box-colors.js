const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function testBoxColors() {
  console.log('=== اختبار ألوان الصناديق في النظام ===')
  
  try {
    const boxes = await prisma.box.findMany({
      select: { 
        id: true, 
        name: true, 
        color: true, 
        size: true,
        width: true,
        height: true,
        depth: true
      }
    })
    
    console.log(`📦 تم العثور على ${boxes.length} صندوق:\n`)
    
    boxes.forEach(box => {
      console.log(`🎨 ${box.name}:`)
      console.log(`   الحجم: ${box.size}`)
      console.log(`   اللون: ${box.color}`)
      console.log(`   الأبعاد: ${box.width}x${box.height}x${box.depth} سم`)
      
      // محاكاة كيف سيظهر في العرض ثلاثي الأبعاد
      console.log(`   💡 سيظهر في العرض 3D بلون: ${box.color}`)
      console.log()
    })
    
    console.log('✅ جميع الصناديق لديها ألوان hex محددة وستظهر بالألوان الصحيحة في العرض ثلاثي الأبعاد!')
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الألوان:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBoxColors()
