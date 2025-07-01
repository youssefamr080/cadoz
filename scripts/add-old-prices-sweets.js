const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function addOldPrices() {
  console.log('🍬 بدء إضافة السعر القديم للحلويات...')

  try {
    // جلب جميع الحلويات التي لا تحتوي على old_price أو old_price = null
    const sweetsWithoutOldPrice = await prisma.sweet.findMany({
      where: {
        old_price: null
      }
    })

    console.log(`📊 عدد الحلويات التي تحتاج لسعر قديم: ${sweetsWithoutOldPrice.length}`)

    if (sweetsWithoutOldPrice.length === 0) {
      console.log('✅ جميع الحلويات لديها أسعار قديمة بالفعل!')
      return
    }

    // تحديث كل حلوى لإضافة السعر القديم
    for (const sweet of sweetsWithoutOldPrice) {
      const currentPrice = sweet.price
      // إضافة 20-30% كسعر قديم (المنتج كان أغلى سابقاً)
      const increasePercentage = 0.2 + Math.random() * 0.1 // بين 20% و 30%
      const oldPrice = Math.round((currentPrice * (1 + increasePercentage)) * 100) / 100

      await prisma.sweet.update({
        where: { id: sweet.id },
        data: { old_price: oldPrice }
      })

      console.log(`✅ ${sweet.name}: السعر الحالي ${currentPrice} ← السعر القديم ${oldPrice}`)
    }

    console.log('🎉 تم إضافة السعر القديم لجميع الحلويات بنجاح!')

    // إحصائيات نهائية
    const totalSweets = await prisma.sweet.count()
    const sweetsWithOldPrice = await prisma.sweet.count({
      where: {
        old_price: { not: null }
      }
    })

    console.log(`📊 إحصائيات نهائية:`)
    console.log(`   - إجمالي الحلويات: ${totalSweets}`)
    console.log(`   - الحلويات مع سعر قديم: ${sweetsWithOldPrice}`)
    console.log(`   - النسبة: ${Math.round((sweetsWithOldPrice / totalSweets) * 100)}%`)

  } catch (error) {
    console.error('❌ خطأ أثناء إضافة الأسعار القديمة:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addOldPrices()
