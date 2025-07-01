const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateSweetsWithCategories() {
  try {
    console.log('جاري تحديث تصنيفات الحلويات...')

    // شوكولاتة
    const chocolateUpdates = [
      { name: 'شوكولاتة', category: 'شوكولاتة' },
      { name: 'كيت كات', category: 'شوكولاتة' },
      { name: 'سنيكرز', category: 'شوكولاتة' },
      { name: 'مارس', category: 'شوكولاتة' },
      { name: 'تويكس', category: 'شوكولاتة' },
      { name: 'كادبوري', category: 'شوكولاتة' },
      { name: 'نوتيلا', category: 'شوكولاتة' },
      { name: 'ferrero', category: 'شوكولاتة' },
      { name: 'galaxy', category: 'شوكولاتة' },
      { name: 'toblerone', category: 'شوكولاتة' },
      { name: 'lindt', category: 'شوكولاتة' }
    ]

    // كاندي
    const candyUpdates = [
      { name: 'كاندي', category: 'كاندي' },
      { name: 'هاريبو', category: 'كاندي' },
      { name: 'حلوى', category: 'كاندي' },
      { name: 'جيلي', category: 'كاندي' },
      { name: 'مصاص', category: 'كاندي' },
      { name: 'علكة', category: 'كاندي' },
      { name: 'سكاكر', category: 'كاندي' },
      { name: 'منتوس', category: 'كاندي' },
      { name: 'tic tac', category: 'كاندي' },
      { name: 'gummy', category: 'كاندي' },
      { name: 'lollipop', category: 'كاندي' }
    ]

    // شيبس
    const chipsUpdates = [
      { name: 'شيبس', category: 'شيبس' },
      { name: 'بطاطس', category: 'شيبس' },
      { name: 'مقرمش', category: 'شيبس' },
      { name: 'دوريتوس', category: 'شيبس' },
      { name: 'ليز', category: 'شيبس' },
      { name: 'تشيتوس', category: 'شيبس' },
      { name: 'برينجلز', category: 'شيبس' },
      { name: 'كريسبي', category:'شيبس' },
      { name: 'pringles', category: 'شيبس' },
      { name: 'lays', category: 'شيبس' },
      { name: 'cheetos', category: 'شيبس' }
    ]

    let updatedCount = 0

    // تحديث الشوكولاتة
    for (const item of chocolateUpdates) {
      const result = await prisma.sweet.updateMany({
        where: {
          name: {
            contains: item.name,
            mode: 'insensitive'
          }
        },
        data: {
          category: item.category
        }
      })
      updatedCount += result.count
      if (result.count > 0) {
        console.log(`✓ تم تحديث ${result.count} من منتجات ${item.name} إلى فئة ${item.category}`)
      }
    }

    // تحديث الكاندي
    for (const item of candyUpdates) {
      const result = await prisma.sweet.updateMany({
        where: {
          name: {
            contains: item.name,
            mode: 'insensitive'
          }
        },
        data: {
          category: item.category
        }
      })
      updatedCount += result.count
      if (result.count > 0) {
        console.log(`✓ تم تحديث ${result.count} من منتجات ${item.name} إلى فئة ${item.category}`)
      }
    }

    // تحديث الشيبس
    for (const item of chipsUpdates) {
      const result = await prisma.sweet.updateMany({
        where: {
          name: {
            contains: item.name,
            mode: 'insensitive'
          }
        },
        data: {
          category: item.category
        }
      })
      updatedCount += result.count
      if (result.count > 0) {
        console.log(`✓ تم تحديث ${result.count} من منتجات ${item.name} إلى فئة ${item.category}`)
      }
    }

    // التحقق من النتائج
    const chocolateCount = await prisma.sweet.count({
      where: { category: 'شوكولاتة', stock: { gt: 0 } }
    })
    
    const candyCount = await prisma.sweet.count({
      where: { category: 'كاندي', stock: { gt: 0 } }
    })
    
    const chipsCount = await prisma.sweet.count({
      where: { category: 'شيبس', stock: { gt: 0 } }
    })

    const uncategorizedCount = await prisma.sweet.count({
      where: { 
        category: { not: { in: ['شوكولاتة', 'كاندي', 'شيبس'] } },
        stock: { gt: 0 }
      }
    })

    console.log(`\n📊 النتائج النهائية:`)
    console.log(`   شوكولاتة متاحة: ${chocolateCount}`)
    console.log(`   كاندي متاح: ${candyCount}`)
    console.log(`   شيبس متاح: ${chipsCount}`)
    console.log(`   غير مصنف: ${uncategorizedCount}`)
    console.log(`   إجمالي التحديثات: ${updatedCount}`)

    // إذا كان هناك عناصر غير مصنفة، نصنفها كحلويات عامة
    if (uncategorizedCount > 0) {
      const uncategorized = await prisma.sweet.findMany({
        where: { 
          category: { not: { in: ['شوكولاتة', 'كاندي', 'شيبس'] } },
          stock: { gt: 0 }
        }
      })

      console.log(`\n⚠️ عناصر غير مصنفة (${uncategorizedCount}):`)
      uncategorized.forEach(sweet => {
        console.log(`   - ${sweet.name} (الفئة الحالية: ${sweet.category})`)
      })

      // تصنيف العناصر غير المصنفة كـ "كاندي" افتراضياً
      await prisma.sweet.updateMany({
        where: { 
          category: { not: { in: ['شوكولاتة', 'كاندي', 'شيبس'] } }
        },
        data: {
          category: 'كاندي'
        }
      })
      console.log(`✓ تم تصنيف العناصر غير المصنفة كـ "كاندي"`)
    }

    console.log('\n🎉 تم إنجاز تصنيف الحلويات بنجاح!')

  } catch (error) {
    console.error('❌ خطأ في تحديث تصنيفات الحلويات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSweetsWithCategories()
