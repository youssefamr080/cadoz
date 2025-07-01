const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function unifyCategoriesToArabic() {
  console.log('توحيد الفئات إلى العربية...')

  try {
    // تحديث الفئات الرئيسية (categories) - الجنس
    const categoryMapping = {
      'men': 'رجالي',
      'women': 'نسائي', 
      'kids': 'أطفال',
      'children': 'أطفال',
      'male': 'رجالي',
      'female': 'نسائي',
      'unisex': 'رجالي ونسائي'
    }

    // تحديث الفئات الفرعية (subCategories) - نوع المنتج
    const subCategoryMapping = {
      'watches': 'ساعات',
      'wallets': 'محافظ',
      'sunglasses': 'نظارات',
      'bags': 'شنط',
      'handbags': 'شنط',
      'accessories': 'إكسسوارات',
      'perfumes': 'عطور',
      'toys': 'ألعاب أطفال',
      'teddy': 'دباديب',
      'teddies': 'دباديب',
      'jewelry': 'مجوهرات',
      'belts': 'أحزمة'
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

      // إضافة الأبعاد الافتراضية حسب الفئة الفرعية
      if (product.subCategory || updates.subCategory) {
        const subCat = updates.subCategory || product.subCategory
        const dimensions = getDefaultDimensions(subCat)
        
        if (!product.width) updates.width = dimensions.width
        if (!product.height) updates.height = dimensions.height  
        if (!product.depth) updates.depth = dimensions.depth
      }

      // تطبيق التحديثات إذا كانت هناك تغييرات
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

    const sweetCategoryMapping = {
      'chocolate': 'شوكولاتة',
      'candy': 'كاندي',
      'chips': 'شيبس',
      'biscuits': 'بسكويت',
      'gum': 'علكة'
    }

    for (const sweet of sweets) {
      const updates = {}
      
      // تحديث فئة الحلوى
      if (sweet.category && sweetCategoryMapping[sweet.category]) {
        updates.category = sweetCategoryMapping[sweet.category]
      }

      // إضافة الأبعاد الافتراضية حسب نوع الحلوى
      const category = updates.category || sweet.category
      const dimensions = getSweetDimensions(category)
      
      if (!sweet.width) updates.width = dimensions.width
      if (!sweet.height) updates.height = dimensions.height
      if (!sweet.depth) updates.depth = dimensions.depth

      // تطبيق التحديثات
      if (Object.keys(updates).length > 0) {
        await prisma.sweet.update({
          where: { id: sweet.id },
          data: updates
        })
        console.log(`تم تحديث الحلوى: ${sweet.name}`)
      }
    }

    // تحديث الصناديق بألوان وأبعاد
    const boxes = await prisma.box.findMany()
    console.log(`تم العثور على ${boxes.length} صندوق`)

    for (const box of boxes) {
      const updates = {}
      
      // إضافة أبعاد افتراضية حسب الحجم
      if (!box.width || !box.height || !box.depth) {
        const dimensions = getBoxDimensions(box.size)
        if (!box.width) updates.width = dimensions.width
        if (!box.height) updates.height = dimensions.height
        if (!box.depth) updates.depth = dimensions.depth
      }

      // تطبيق التحديثات
      if (Object.keys(updates).length > 0) {
        await prisma.box.update({
          where: { id: box.id },
          data: updates
        })
        console.log(`تم تحديث الصندوق: ${box.name}`)
      }
    }

    console.log('✅ تم توحيد جميع الفئات إلى العربية بنجاح!')

  } catch (error) {
    console.error('❌ خطأ في توحيد الفئات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// دالة للحصول على الأبعاد الافتراضية للمنتجات حسب الفئة الفرعية
function getDefaultDimensions(subCategory) {
  const dimensions = {
    'ساعات': { width: 4.5, height: 1.2, depth: 4.5 },
    'محافظ': { width: 11, height: 1.5, depth: 9 },
    'نظارات': { width: 14, height: 5, depth: 4 },
    'شنط': { width: 30, height: 25, depth: 12 },
    'إكسسوارات': { width: 8, height: 8, depth: 3 },
    'عطور': { width: 6, height: 12, depth: 6 },
    'ألعاب أطفال': { width: 15, height: 10, depth: 8 },
    'دباديب': { width: 20, height: 25, depth: 15 },
    'مجوهرات': { width: 5, height: 3, depth: 5 },
    'أحزمة': { width: 120, height: 1, depth: 5 }
  }
  
  return dimensions[subCategory] || { width: 10, height: 10, depth: 5 }
}

// دالة للحصول على الأبعاد الافتراضية للحلويات
function getSweetDimensions(category) {
  const dimensions = {
    'شوكولاتة': { width: 10, height: 2, depth: 15 },
    'كاندي': { width: 8, height: 8, depth: 3 },
    'شيبس': { width: 6, height: 15, depth: 6 },
    'بسكويت': { width: 12, height: 3, depth: 8 },
    'علكة': { width: 4, height: 1, depth: 6 }
  }
  
  return dimensions[category] || { width: 8, height: 8, depth: 3 }
}

// دالة للحصول على أبعاد الصناديق حسب الحجم
function getBoxDimensions(size) {
  const dimensions = {
    'صغير': { width: 15, height: 10, depth: 8 },
    'متوسط': { width: 25, height: 18, depth: 15 },
    'كبير': { width: 35, height: 25, depth: 20 },
    'small': { width: 15, height: 10, depth: 8 },
    'medium': { width: 25, height: 18, depth: 15 },
    'large': { width: 35, height: 25, depth: 20 }
  }
  
  return dimensions[size] || { width: 20, height: 15, depth: 10 }
}

unifyCategoriesToArabic()
