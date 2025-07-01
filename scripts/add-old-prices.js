const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addOldPriceToSweets() {
  try {
    console.log('🔧 جاري إضافة السعر القديم للحلويات...\n')

    // جلب جميع الحلويات
    const sweets = await prisma.sweet.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        old_price: true,
        category: true,
        stock: true
      }
    })

    console.log(`📊 تم العثور على ${sweets.length} حلوى في قاعدة البيانات\n`)

    let updatedCount = 0

    for (const sweet of sweets) {
      // إذا لم يكن هناك سعر قديم، أضف واحد
      if (!sweet.old_price) {
        // حساب السعر القديم (السعر الحالي + 20-30%)
        const discountPercentage = Math.random() * 0.1 + 0.2 // بين 20% و 30%
        const oldPrice = Math.round(sweet.price * (1 + discountPercentage))
        
        await prisma.sweet.update({
          where: { id: sweet.id },
          data: { old_price: oldPrice }
        })

        console.log(`✅ ${sweet.name} | السعر: ${sweet.price} جنيه | السعر القديم: ${oldPrice} جنيه | الفئة: ${sweet.category}`)
        updatedCount++
      } else {
        console.log(`⏭️ ${sweet.name} | لديه سعر قديم بالفعل: ${sweet.old_price} جنيه`)
      }
    }

    console.log(`\n📈 تم تحديث ${updatedCount} منتج بسعر قديم`)
    console.log(`⏭️ تم تخطي ${sweets.length - updatedCount} منتج (لديهم سعر قديم بالفعل)`)

    // عرض إحصائيات الفئات
    const chocolateCount = sweets.filter(s => s.category === 'شوكولاتة').length
    const candyCount = sweets.filter(s => s.category === 'كاندي').length
    const chipsCount = sweets.filter(s => s.category === 'شيبس').length
    const otherCount = sweets.length - chocolateCount - candyCount - chipsCount

    console.log(`\n📊 إحصائيات الفئات:`)
    console.log(`   🍫 شوكولاتة: ${chocolateCount} منتج`)
    console.log(`   🍭 كاندي: ${candyCount} منتج`)
    console.log(`   🥨 شيبس: ${chipsCount} منتج`)
    console.log(`   📦 فئات أخرى: ${otherCount} منتج`)

    if (otherCount > 0) {
      console.log(`\n⚠️ فئات أخرى موجودة:`)
      const otherCategories = [...new Set(sweets.filter(s => !['شوكولاتة', 'كاندي', 'شيبس'].includes(s.category)).map(s => s.category))]
      otherCategories.forEach(cat => {
        const count = sweets.filter(s => s.category === cat).length
        console.log(`   - ${cat}: ${count} منتج`)
      })
    }

    console.log(`\n🎉 تم إنجاز إضافة الأسعار القديمة بنجاح!`)

  } catch (error) {
    console.error('❌ خطأ في إضافة الأسعار القديمة:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
addOldPriceToSweets()
