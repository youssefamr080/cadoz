const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function unifyCategoriesToArabic() {
  console.log('توحيد الفئات باللغة العربية...')

  try {
    // خريطة تحويل الفئات الرئيسية للعربية
    const categoryMapping = {
      'men': 'رجالي',
      'women': 'نسائي', 
      'kids': 'أطفال',
      'إكسسوارات': 'إكسسوارات',
      'حقائب': 'حقائب',
      'عطور': 'عطور',
      'ألعاب': 'ألعاب'
    }

    // خريطة تحويل الفئات الفرعية للعربية
    const subCategoryMapping = {
      'wallets': 'محافظ',
      'watches': 'ساعات',
      'sunglasses': 'نظارات شمسية',
      'bags': 'حقائب',
      'handbags': 'حقائب يد',
      'perfumes': 'عطور',
      'toys': 'ألعاب',
      'teddy': 'دباديب',
      'accessories': 'اكسسوارات',
      'ساعات': 'ساعات',
      'محافظ': 'محافظ',
      'شنط': 'حقائب يد',
      'دباديب': 'دباديب',
      'عطور': 'عطور',
      'ألعاب اطفال': 'ألعاب أطفال',
      'اكسسوارات': 'اكسسوارات',
      'نظارات': 'نظارات شمسية'
    }

    // تحديث المنتجات
    const products = await prisma.product.findMany()
    console.log(`تم العثور على ${products.length} منتج`)

    for (const product of products) {
      const updates = {}
      
      // تحديث الفئة الرئيسية
      if (product.category && categoryMapping[product.category]) {
        updates.category = categoryMapping[product.category]
      }
      
      // تحديث الفئة الفرعية  
      if (product.subCategory && subCategoryMapping[product.subCategory]) {
        updates.subCategory = subCategoryMapping[product.subCategory]
      }

      // إضافة الأبعاد حسب الفئة الفرعية
      if (product.subCategory) {
        const dimensions = getDefaultDimensions(subCategoryMapping[product.subCategory] || product.subCategory)
        if (!product.width) updates.width = dimensions.width
        if (!product.height) updates.height = dimensions.height 
        if (!product.depth) updates.depth = dimensions.depth
      }

      // تطبيق التحديثات
      if (Object.keys(updates).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        })
        console.log(`تم تحديث المنتج: ${product.name}`)
      }
    }

    // تحديث الحلويات
    const sweets = await prisma.sweet.findMany()
    console.log(`تم العثور على ${sweets.length} حلوى`)

    for (const sweet of sweets) {
      const updates = {}
      
      // توحيد أسماء فئات الحلويات
      const sweetCategoryMapping = {
        'chocolate': 'شوكولاتة',
        'candy': 'حلوى',
        'chips': 'شيبس',
        'شوكولاتة': 'شوكولاتة',
        'كاندي': 'حلوى',
        'حلوى': 'حلوى',
        'شيبس': 'شيبس'
      }

      if (sweet.category && sweetCategoryMapping[sweet.category]) {
        updates.category = sweetCategoryMapping[sweet.category]
      }

      // إضافة الأبعاد للحلويات
      if (sweet.category) {
        const dimensions = getSweetDimensions(sweetCategoryMapping[sweet.category] || sweet.category)
        if (!sweet.width) updates.width = dimensions.width
        if (!sweet.height) updates.height = dimensions.height
        if (!sweet.depth) updates.depth = dimensions.depth
      }

      if (Object.keys(updates).length > 0) {
        await prisma.sweet.update({
          where: { id: sweet.id },
          data: updates
        })
        console.log(`تم تحديث الحلوى: ${sweet.name}`)
      }
    }

    // تحديث الصناديق
    const boxes = await prisma.box.findMany()
    console.log(`تم العثور على ${boxes.length} صندوق`)

    for (const box of boxes) {
      const updates = {}
      
      // إضافة أبعاد للصناديق التي لا تحتوي على أبعاد
      if (!box.width || !box.height || !box.depth) {
        const boxDimensions = getBoxDimensions(box.size || 'متوسط')
        if (!box.width) updates.width = boxDimensions.width
        if (!box.height) updates.height = boxDimensions.height
        if (!box.depth) updates.depth = boxDimensions.depth
      }

      if (Object.keys(updates).length > 0) {
        await prisma.box.update({
          where: { id: box.id },
          data: updates
        })
        console.log(`تم تحديث الصندوق: ${box.name}`)
      }
    }

    console.log('✅ تم توحيد جميع الفئات باللغة العربية بنجاح!')

  } catch (error) {
    console.error('❌ خطأ في توحيد الفئات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// دالة الحصول على الأبعاد الافتراضية للمنتجات
function getDefaultDimensions(subCategory) {
  const dimensions = {
    'ساعات': { width: 4.5, height: 1.2, depth: 4.5 },
    'نظارات شمسية': { width: 14, height: 5, depth: 4 },
    'حقائب يد': { width: 30, height: 25, depth: 12 },
    'محافظ': { width: 11, height: 1.5, depth: 9 },
    'اكسسوارات': { width: 8, height: 8, depth: 3 },
    'عطور': { width: 6, height: 12, depth: 6 },
    'ألعاب أطفال': { width: 15, height: 10, depth: 8 },
    'دباديب': { width: 20, height: 25, depth: 15 }
  }
  
  return dimensions[subCategory] || { width: 10, height: 10, depth: 5 }
}

// دالة الحصول على الأبعاد الافتراضية للحلويات
function getSweetDimensions(category) {
  const dimensions = {
    'شوكولاتة': { width: 10, height: 2, depth: 15 },
    'حلوى': { width: 8, height: 8, depth: 3 },
    'شيبس': { width: 6, height: 15, depth: 6 }
  }
  
  return dimensions[category] || { width: 8, height: 8, depth: 3 }
}

// دالة الحصول على أبعاد الصناديق
function getBoxDimensions(size) {
  const dimensions = {
    'صغير': { width: 15, height: 10, depth: 8 },
    'متوسط': { width: 25, height: 18, depth: 15 },
    'كبير': { width: 35, height: 25, depth: 20 }
  }
  
  return dimensions[size] || { width: 25, height: 18, depth: 15 }
}

unifyCategoriesToArabic()
