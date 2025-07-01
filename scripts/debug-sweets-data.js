const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function debugSweetsData() {
  try {
    console.log('🔍 تحليل بيانات الحلويات في قاعدة البيانات...\n')

    // جلب جميع الحلويات
    const allSweets = await prisma.sweet.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
        price: true,
        old_price: true
      },
      orderBy: { category: 'asc' }
    })

    console.log(`📊 إجمالي الحلويات: ${allSweets.length}`)

    // الحلويات المتاحة فقط
    const availableSweets = allSweets.filter(s => s.stock > 0)
    console.log(`✅ الحلويات المتاحة (stock > 0): ${availableSweets.length}`)
    console.log(`❌ الحلويات غير المتاحة (stock = 0): ${allSweets.length - availableSweets.length}\n`)

    if (availableSweets.length === 0) {
      console.log('⚠️ لا توجد حلويات متاحة في المخزون!')
      console.log('💡 يجب تحديث المخزون لبعض المنتجات\n')
    }

    // تجميع حسب الفئات
    const categories = {}
    availableSweets.forEach(sweet => {
      const cat = sweet.category || 'غير مصنف'
      if (!categories[cat]) {
        categories[cat] = []
      }
      categories[cat].push(sweet)
    })

    console.log(`📁 الفئات الموجودة (${Object.keys(categories).length}):`)
    Object.keys(categories).forEach(cat => {
      const items = categories[cat]
      console.log(`   ${cat}: ${items.length} منتج متاح`)
    })

    console.log('\n🔍 تفاصيل كل فئة:\n')

    // عرض تفاصيل كل فئة
    Object.keys(categories).forEach(cat => {
      const items = categories[cat]
      console.log(`📂 ${cat} (${items.length} منتج):`)
      items.forEach(item => {
        const oldPriceText = item.old_price ? ` | السعر القديم: ${item.old_price} جنيه` : ' | بدون سعر قديم'
        console.log(`   - ${item.name} | ${item.price} جنيه${oldPriceText} | المخزون: ${item.stock}`)
      })
      console.log('')
    })

    // فحص الفئات المطلوبة
    const requiredCategories = ['شوكولاتة', 'كاندي', 'شيبس']
    console.log('✅ فحص الفئات المطلوبة:')
    requiredCategories.forEach(reqCat => {
      const count = categories[reqCat]?.length || 0
      const status = count > 0 ? '✓ متوفرة' : '✗ غير متوفرة'
      console.log(`   ${reqCat}: ${count} منتج ${status}`)
    })

    // فحص الفئات الأخرى
    const otherCategories = Object.keys(categories).filter(cat => !requiredCategories.includes(cat))
    if (otherCategories.length > 0) {
      console.log('\n⚠️ فئات أخرى موجودة:')
      otherCategories.forEach(cat => {
        console.log(`   ${cat}: ${categories[cat].length} منتج`)
      })
    }

    // اقتراحات للإصلاح
    console.log('\n💡 اقتراحات للإصلاح:')

    // فحص الأسعار القديمة
    const withOldPrice = availableSweets.filter(s => s.old_price).length
    const withoutOldPrice = availableSweets.length - withOldPrice
    
    console.log(`\n💰 إحصائيات الأسعار:`)
    console.log(`   - منتجات مع سعر قديم: ${withOldPrice}`)
    console.log(`   - منتجات بدون سعر قديم: ${withoutOldPrice}`)
    
    if (withoutOldPrice > 0) {
      console.log(`   ⚠️ يجب إضافة السعر القديم لـ ${withoutOldPrice} منتج`)
      console.log(`   💡 استخدم: node scripts/add-old-prices-sweets.js`)
    }
    
    if (availableSweets.length === 0) {
      console.log('   1. قم بتحديث المخزون (stock) لبعض المنتجات')
    }
    
    const missingCategories = requiredCategories.filter(cat => !categories[cat] || categories[cat].length === 0)
    if (missingCategories.length > 0) {
      console.log(`   2. أضف منتجات للفئات المفقودة: ${missingCategories.join(', ')}`)
    }
    
    if (otherCategories.length > 0) {
      console.log('   3. قم بتصنيف المنتجات ذات الفئات الأخرى إلى الفئات المطلوبة')
    }

    console.log('\n🎯 للاختبار في الواجهة:')
    console.log('   1. انتقل إلى صفحة اختيار الحلويات')
    console.log('   2. تحقق من ظهور العدادات في التبويبات')
    console.log('   3. جرب التنقل بين الفئات المختلفة')

  } catch (error) {
    console.error('❌ خطأ في تحليل البيانات:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugSweetsData()
