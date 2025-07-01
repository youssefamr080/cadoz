const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function finalSystemCheck() {
  console.log('=== فحص النظام النهائي ===')
  
  try {
    // 1. فحص الفئات الرئيسية
    console.log('\n--- فحص الفئات الرئيسية ---')
    const products = await prisma.product.findMany({
      select: { category: true, subCategory: true }
    })
    
    const mainCategories = [...new Set(products.map(p => p.category))].sort()
    console.log('الفئات الرئيسية الموجودة:', mainCategories)
    
    const expectedMainCategories = ['أطفال', 'رجالي', 'نسائي']
    const isMainCategoriesCorrect = expectedMainCategories.every(cat => mainCategories.includes(cat)) &&
                                   mainCategories.every(cat => expectedMainCategories.includes(cat))
    
    console.log('✅ الفئات الرئيسية صحيحة:', isMainCategoriesCorrect ? 'نعم' : 'لا')
    
    // 2. فحص الفئات الفرعية
    console.log('\n--- فحص الفئات الفرعية ---')
    const subCategories = [...new Set(products.map(p => p.subCategory))].sort()
    console.log('الفئات الفرعية الموجودة:', subCategories)
    
    const expectedSubCategories = [
      'ساعات', 'محافظ', 'عطور', 'شنط يد', 'نظارات شمسية', 'سبراي', 'إكسسوارات',
      'العاب اطفال', 'دباديب', 'ساعات اطفال'
    ]
    
    const isSubCategoriesCorrect = expectedSubCategories.every(cat => subCategories.includes(cat))
    console.log('✅ الفئات الفرعية الصحيحة موجودة:', isSubCategoriesCorrect ? 'نعم' : 'لا')
    
    // إظهار الفئات الفرعية المفقودة أو الزائدة
    const missingSubCategories = expectedSubCategories.filter(cat => !subCategories.includes(cat))
    const extraSubCategories = subCategories.filter(cat => !expectedSubCategories.includes(cat))
    
    if (missingSubCategories.length > 0) {
      console.log('❌ فئات فرعية مفقودة:', missingSubCategories)
    }
    
    if (extraSubCategories.length > 0) {
      console.log('⚠️ فئات فرعية إضافية (قد تحتاج مراجعة):', extraSubCategories)
    }
    
    // 3. فحص توزيع المنتجات
    console.log('\n--- توزيع المنتجات ---')
    const categoryCount = {}
    const subCategoryCount = {}
    
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
      subCategoryCount[p.subCategory] = (subCategoryCount[p.subCategory] || 0) + 1
    })
    
    console.log('توزيع الفئات الرئيسية:')
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} منتج`)
    })
    
    console.log('توزيع الفئات الفرعية:')
    Object.entries(subCategoryCount).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count} منتج`)
    })
    
    // 4. فحص الحلويات
    console.log('\n--- فحص الحلويات ---')
    const sweets = await prisma.sweet.findMany({
      select: { category: true }
    })
    
    const sweetCategories = [...new Set(sweets.map(s => s.category))].sort()
    console.log('فئات الحلويات:', sweetCategories)
    
    // 5. فحص الصناديق
    console.log('\n--- فحص الصناديق ---')
    const boxes = await prisma.box.findMany({
      select: { size: true, color: true }
    })
    
    console.log(`عدد الصناديق: ${boxes.length}`)
    
    // 6. فحص عينة من المنتجات للتأكد من الأبعاد
    console.log('\n--- فحص عينة من المنتجات ---')
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: { name: true, category: true, subCategory: true, width: true, height: true, depth: true, colors: true }
    })
    
    sampleProducts.forEach(product => {
      const hasColors = product.colors && product.colors.length > 0
      const hasDimensions = product.width && product.height && product.depth
      console.log(`${product.name}: ${product.category}/${product.subCategory} | أبعاد: ${hasDimensions ? '✅' : '❌'} | ألوان: ${hasColors ? '✅' : '❌'}`)
    })
    
    // 7. ملخص النتائج
    console.log('\n=== ملخص النتائج ===')
    const allChecksPass = isMainCategoriesCorrect && isSubCategoriesCorrect && missingSubCategories.length === 0
    
    if (allChecksPass) {
      console.log('🎉 جميع الفحوصات نجحت! النظام جاهز للاستخدام.')
    } else {
      console.log('⚠️ هناك بعض المشاكل التي تحتاج إصلاح.')
    }
    
    console.log(`📊 إجمالي المنتجات: ${products.length}`)
    console.log(`🍬 إجمالي الحلويات: ${sweets.length}`)
    console.log(`📦 إجمالي الصناديق: ${boxes.length}`)
    
  } catch (error) {
    console.error('خطأ في الفحص:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finalSystemCheck()
