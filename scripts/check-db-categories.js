const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSweetsCategoriesFromDB() {
  try {
    console.log('🔍 فحص تصنيفات الحلويات في قاعدة البيانات...\n')
    
    // جلب جميع الحلويات مع التصنيفات
    const sweets = await prisma.sweet.findMany({
      where: {
        stock: {
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
        price: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    if (sweets.length === 0) {
      console.log('❌ لا توجد حلويات متاحة في قاعدة البيانات')
      return
    }

    // تجميع الحلويات حسب الفئة
    const categories = {}
    sweets.forEach(sweet => {
      const category = sweet.category || 'غير مصنف'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(sweet)
    })

    console.log(`📊 تم العثور على ${sweets.length} حلوى متاحة في ${Object.keys(categories).length} فئات:\n`)

    // عرض الفئات والحلويات
    Object.keys(categories).forEach(category => {
      const items = categories[category]
      console.log(`📁 ${category} (${items.length} عنصر):`)
      items.forEach(item => {
        console.log(`   - ${item.name} | ${item.price} جنيه | المخزون: ${item.stock}`)
      })
      console.log('')
    })

    // إحصائيات مفيدة
    const chocolateCount = categories['شوكولاتة']?.length || 0
    const candyCount = categories['كاندي']?.length || 0
    const chipsCount = categories['شيبس']?.length || 0
    const otherCount = sweets.length - chocolateCount - candyCount - chipsCount

    console.log('🎯 الإحصائيات:')
    console.log(`   شوكولاتة: ${chocolateCount} عنصر`)
    console.log(`   كاندي: ${candyCount} عنصر`)
    console.log(`   شيبس: ${chipsCount} عنصر`)
    console.log(`   فئات أخرى: ${otherCount} عنصر`)

    // التحقق من توفر الفئات المطلوبة
    console.log('\n✅ الفئات المطلوبة:')
    console.log(`   شوكولاتة: ${chocolateCount > 0 ? '✓ متوفرة' : '✗ غير متوفرة'}`)
    console.log(`   كاندي: ${candyCount > 0 ? '✓ متوفرة' : '✗ غير متوفرة'}`)
    console.log(`   شيبس: ${chipsCount > 0 ? '✓ متوفرة' : '✗ غير متوفرة'}`)

    if (otherCount > 0) {
      console.log(`\n⚠️ هناك ${otherCount} عنصر في فئات أخرى:`)
      Object.keys(categories).forEach(category => {
        if (!['شوكولاتة', 'كاندي', 'شيبس'].includes(category)) {
          console.log(`   - ${category}: ${categories[category].length} عنصر`)
        }
      })
    }

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkSweetsCategoriesFromDB()
