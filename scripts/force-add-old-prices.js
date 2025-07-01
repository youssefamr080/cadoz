const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function addOldPricesForce() {
  console.log('🍬 بدء إضافة السعر القديم لجميع الحلويات...')

  try {
    // جلب جميع الحلويات
    const allSweets = await prisma.sweet.findMany()

    console.log(`📊 سيتم تحديث ${allSweets.length} حلوى`)

    // تحديث كل حلوى
    for (const sweet of allSweets) {
      const currentPrice = sweet.price
      // إضافة 20-30% كسعر قديم (المنتج كان أغلى سابقاً)
      const increasePercentage = 0.2 + Math.random() * 0.1 // بين 20% و 30%
      const oldPrice = Math.round((currentPrice * (1 + increasePercentage)) * 100) / 100

      await prisma.sweet.update({
        where: { id: sweet.id },
        data: { old_price: oldPrice }
      })

      console.log(`✅ ${sweet.name}: ${currentPrice} جنيه ← ${oldPrice} جنيه (خصم ${Math.round(((oldPrice - currentPrice) / oldPrice) * 100)}%)`)
    }

    console.log('\n🎉 تم إضافة السعر القديم لجميع الحلويات بنجاح!')

    // تحقق نهائي
    const updatedSweets = await prisma.sweet.findMany({
      where: { old_price: { not: null } }
    })

    console.log(`\n📊 النتيجة النهائية:`)
    console.log(`   - الحلويات مع سعر قديم: ${updatedSweets.length}`)
    console.log(`   - إجمالي الحلويات: ${allSweets.length}`)

  } catch (error) {
    console.error('❌ خطأ أثناء إضافة الأسعار القديمة:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addOldPricesForce()
