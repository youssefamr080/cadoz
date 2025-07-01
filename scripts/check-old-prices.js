const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function checkOldPrices() {
  console.log('🔍 فحص الأسعار القديمة في قاعدة البيانات...')

  try {
    // جلب جميع الحلويات مع تفاصيل كاملة
    const allSweets = await prisma.sweet.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        old_price: true,
        category: true,
        stock: true
      }
    })

    console.log(`📊 إجمالي الحلويات: ${allSweets.length}`)

    allSweets.forEach((sweet, index) => {
      console.log(`\n${index + 1}. ${sweet.name}`)
      console.log(`   السعر الحالي: ${sweet.price}`)
      console.log(`   السعر القديم: ${sweet.old_price === null ? 'NULL' : sweet.old_price}`)
      console.log(`   الفئة: ${sweet.category}`)
      console.log(`   المخزون: ${sweet.stock}`)
    })

    // إحصائيات
    const withOldPrice = allSweets.filter(s => s.old_price !== null)
    const withoutOldPrice = allSweets.filter(s => s.old_price === null)

    console.log(`\n📊 الإحصائيات:`)
    console.log(`   - مع سعر قديم: ${withOldPrice.length}`)
    console.log(`   - بدون سعر قديم: ${withoutOldPrice.length}`)

    if (withoutOldPrice.length > 0) {
      console.log(`\n🔧 الحلويات التي تحتاج سعر قديم:`)
      withoutOldPrice.forEach(sweet => {
        console.log(`   - ${sweet.name}`)
      })
    }

  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOldPrices()
