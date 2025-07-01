const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

// تعريف الفئات الصحيحة
const MAIN_CATEGORIES = {
  'men': 'رجالي',
  'women': 'نسائي', 
  'kids': 'أطفال',
  'unisex': 'رجالي' // افتراضي للمنتجات المختلطة
}

const SUB_CATEGORIES = {
  'watches': 'ساعات',
  'wallets': 'محافظ',
  'bags': 'شنط',
  'sunglasses': 'نظارات شمسية',
  'perfumes': 'عطور',
  'accessories': 'اكسسوارات',
  'toys': 'ألعاب',
  'clothing': 'ملابس',
  'handbags': 'حقائب يد',
  'teddy': 'دباديب',
  'kids-toys': 'ألعاب أطفال'
}

// أبعاد افتراضية حسب الفئة الفرعية
const DEFAULT_DIMENSIONS = {
  'ساعات': { width: 8, height: 8, depth: 2 },
  'محافظ': { width: 12, height: 9, depth: 2 },
  'شنط': { width: 25, height: 20, depth: 15 },
  'نظارات شمسية': { width: 15, height: 6, depth: 4 },
  'عطور': { width: 6, height: 12, depth: 6 },
  'اكسسوارات': { width: 10, height: 10, depth: 3 },
  'ألعاب': { width: 15, height: 15, depth: 10 },
  'ملابس': { width: 30, height: 40, depth: 5 },
  'حقائب يد': { width: 20, height: 15, depth: 10 },
  'دباديب': { width: 20, height: 25, depth: 15 },
  'ألعاب أطفال': { width: 15, height: 15, depth: 10 }
}

async function fixCategoriesFinal() {
  console.log('=== بدء إصلاح الفئات النهائي ===')
  
  try {
    // 1. إصلاح فئات المنتجات
    console.log('\n--- إصلاح فئات المنتجات ---')
    
    const products = await prisma.product.findMany()
    console.log(`وجد ${products.length} منتج`)
    
    let updatedProducts = 0
    
    for (const product of products) {
      const updates = {}
      let needsUpdate = false
      
      // تحديد الفئة الرئيسية بناء على target
      if (product.target && MAIN_CATEGORIES[product.target]) {
        updates.category = MAIN_CATEGORIES[product.target]
        needsUpdate = true
      } else if (product.category === 'إكسسوارات') {
        // إذا كانت الفئة إكسسوارات، نحدد بناء على نوع المنتج
        if (product.name && product.name.includes('رجالي')) {
          updates.category = 'رجالي'
        } else if (product.name && product.name.includes('نسائي')) {
          updates.category = 'نسائي'
        } else {
          updates.category = 'رجالي' // افتراضي
        }
        needsUpdate = true
      }
      
      // إصلاح الفئة الفرعية إذا كانت بالإنجليزية
      if (product.subCategory === 'clothing') {
        updates.subCategory = 'ملابس'
        needsUpdate = true
      }
      
      // تحديث الأبعاد إذا لم تكن موجودة
      if (!product.width || !product.height || !product.depth) {
        const dimensions = DEFAULT_DIMENSIONS[product.subCategory] || DEFAULT_DIMENSIONS['اكسسوارات']
        updates.width = dimensions.width
        updates.height = dimensions.height
        updates.depth = dimensions.depth
        needsUpdate = true
      }
      
      // إضافة ألوان افتراضية إذا لم تكن موجودة
      if (!product.colors || product.colors.length === 0) {
        updates.colors = ['متعدد الألوان']
        needsUpdate = true
      }
      
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        })
        updatedProducts++
      }
    }
    
    console.log(`تم تحديث ${updatedProducts} منتج`)
    
    // 2. التأكد من فئات الحلويات
    console.log('\n--- فحص فئات الحلويات ---')
    const sweets = await prisma.sweet.findMany()
    console.log(`وجد ${sweets.length} حلوى`)
    
    let updatedSweets = 0
    
    for (const sweet of sweets) {
      const updates = {}
      let needsUpdate = false
      
      // تحديث الأبعاد إذا لم تكن موجودة
      if (!sweet.width || !sweet.height || !sweet.depth) {
        updates.width = 8
        updates.height = 8
        updates.depth = 3
        needsUpdate = true
      }
      
      if (needsUpdate) {
        await prisma.sweet.update({
          where: { id: sweet.id },
          data: updates
        })
        updatedSweets++
      }
    }
    
    console.log(`تم تحديث ${updatedSweets} حلوى`)
    
    // 3. فحص الصناديق
    console.log('\n--- فحص الصناديق ---')
    const boxes = await prisma.box.findMany()
    console.log(`وجد ${boxes.length} صندوق`)
    
    // 4. إظهار الإحصائيات النهائية
    console.log('\n=== الإحصائيات النهائية ===')
    
    const finalProducts = await prisma.product.findMany({
      select: { category: true, subCategory: true }
    })
    
    const mainCategories = [...new Set(finalProducts.map(p => p.category))].sort()
    const subCategories = [...new Set(finalProducts.map(p => p.subCategory))].sort()
    
    console.log('الفئات الرئيسية النهائية:', mainCategories)
    console.log('الفئات الفرعية النهائية:', subCategories)
    
    console.log('\n=== تم الانتهاء بنجاح ===')
    
  } catch (error) {
    console.error('خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCategoriesFinal()
