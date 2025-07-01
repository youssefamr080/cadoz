const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function fixMainCategories() {
  console.log('=== إصلاح الفئات الرئيسية النهائي ===')
  
  try {
    // 1. إصلاح المنتجات التي فئتها الرئيسية ليست من الفئات المطلوبة
    console.log('\n--- إصلاح الفئات الرئيسية للمنتجات ---')
    
    const wrongCategories = await prisma.product.findMany({
      where: {
        category: {
          notIn: ['رجالي', 'نسائي', 'أطفال']
        }
      }
    })
    
    console.log(`وجد ${wrongCategories.length} منتج بفئات رئيسية خاطئة`)
    
    for (const product of wrongCategories) {
      let newCategory = 'رجالي' // افتراضي
      
      // تحديد الفئة بناء على الفئة الفرعية أو اسم المنتج
      if (product.subCategory) {
        const subCat = product.subCategory.toLowerCase()
        if (subCat.includes('أطفال') || subCat.includes('دباديب') || product.name?.includes('أطفال')) {
          newCategory = 'أطفال'
        } else if (product.name?.includes('نسائي') || product.name?.includes('السيدات') || 
                  subCat.includes('حقائب يد') || (subCat.includes('ملابس') && product.name?.includes('نسائي'))) {
          newCategory = 'نسائي'
        } else {
          newCategory = 'رجالي'
        }
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: { category: newCategory }
      })
      
      console.log(`تم تحديث ${product.name}: ${product.category} → ${newCategory}`)
    }
    
    // 2. عرض الإحصائيات النهائية
    console.log('\n=== الإحصائيات النهائية ===')
    
    const allProducts = await prisma.product.findMany({
      select: { category: true, subCategory: true }
    })
    
    const mainCategories = [...new Set(allProducts.map(p => p.category))].sort()
    const subCategories = [...new Set(allProducts.map(p => p.subCategory))].sort()
    
    console.log('الفئات الرئيسية النهائية:', mainCategories)
    console.log('الفئات الفرعية النهائية:', subCategories)
    
    // عدد المنتجات لكل فئة رئيسية
    const categoryCount = {}
    allProducts.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
    })
    
    console.log('\nتوزيع المنتجات حسب الفئة الرئيسية:')
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count} منتج`)
    })
    
    console.log('\n=== تم الانتهاء بنجاح ===')
    
  } catch (error) {
    console.error('خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixMainCategories()
