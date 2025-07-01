const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

// الفئات الصحيحة كما هي في التصميم
const CORRECT_CATEGORIES = {
  'رجالي': 'men',
  'نسائي': 'women', 
  'أطفال': 'kids'
}

const CORRECT_SUB_CATEGORIES = {
  // للرجال
  'ساعات': 'watches',
  'محافظ': 'wallets',
  'عطور': 'perfumes',
  'شنط يد': 'handbags',
  'نظارات شمسية': 'sunglasses',
  'سبراي': 'spray',
  
  // للنساء
  'إكسسوارات': 'accessories',
  
  // للأطفال
  'العاب اطفال': 'toys',
  'دباديب': 'teddy-bears',
  'ساعات اطفال': 'watches',
}

// أبعاد افتراضية حسب الفئة الفرعية الصحيحة
const DEFAULT_DIMENSIONS = {
  'ساعات': { width: 8, height: 8, depth: 2 },
  'محافظ': { width: 12, height: 9, depth: 2 },
  'عطور': { width: 6, height: 12, depth: 6 },
  'شنط يد': { width: 25, height: 20, depth: 15 },
  'نظارات شمسية': { width: 15, height: 6, depth: 4 },
  'سبراي': { width: 5, height: 15, depth: 5 },
  'إكسسوارات': { width: 10, height: 10, depth: 3 },
  'العاب اطفال': { width: 15, height: 15, depth: 10 },
  'دباديب': { width: 20, height: 25, depth: 15 },
  'ساعات اطفال': { width: 6, height: 6, depth: 1.5 }
}

async function fixCategoriesCorrect() {
  console.log('=== بدء تصحيح الفئات حسب التصميم الصحيح ===')
  
  try {
    // 1. إصلاح فئات المنتجات
    console.log('\n--- تصحيح فئات المنتجات ---')
    
    const products = await prisma.product.findMany()
    console.log(`وجد ${products.length} منتج`)
    
    let updatedProducts = 0
    
    for (const product of products) {
      const updates = {}
      let needsUpdate = false
      
      // تصحيح الفئة الفرعية
      let correctedSubCategory = null
      
      // مطابقة الفئات الفرعية الحالية مع الصحيحة
      if (product.subCategory) {
        const currentSub = product.subCategory.toLowerCase().trim()
        
        if (currentSub.includes('ساعات') || currentSub === 'watches') {
          // تحديد إذا كانت ساعات أطفال أم عادية
          if (product.category === 'أطفال' || product.name?.includes('أطفال') || product.name?.includes('طفل')) {
            correctedSubCategory = 'ساعات اطفال'
          } else {
            correctedSubCategory = 'ساعات'
          }
        } else if (currentSub.includes('محافظ') || currentSub === 'wallets') {
          correctedSubCategory = 'محافظ'
        } else if (currentSub.includes('عطور') || currentSub === 'perfumes') {
          correctedSubCategory = 'عطور'
        } else if (currentSub.includes('شنط') || currentSub.includes('حقائب') || currentSub === 'handbags' || currentSub === 'bags') {
          correctedSubCategory = 'شنط يد'
        } else if (currentSub.includes('نظارات') || currentSub === 'sunglasses') {
          correctedSubCategory = 'نظارات شمسية'
        } else if (currentSub.includes('اكسسوارات') || currentSub === 'accessories') {
          correctedSubCategory = 'إكسسوارات'
        } else if (currentSub.includes('ألعاب') || currentSub === 'toys') {
          correctedSubCategory = 'العاب اطفال'
        } else if (currentSub.includes('دباديب') || currentSub === 'teddy') {
          correctedSubCategory = 'دباديب'
        } else if (currentSub.includes('ملابس') || currentSub === 'clothing') {
          // الملابس غير موجودة في التصميم، سنحولها لإكسسوارات
          correctedSubCategory = 'إكسسوارات'
        } else {
          // افتراضي
          correctedSubCategory = 'إكسسوارات'
        }
      } else {
        correctedSubCategory = 'إكسسوارات'
      }
      
      if (correctedSubCategory !== product.subCategory) {
        updates.subCategory = correctedSubCategory
        needsUpdate = true
      }
      
      // تصحيح الفئة الرئيسية بناء على الفئة الفرعية والاسم
      let correctedCategory = product.category
      
      if (correctedSubCategory === 'العاب اطفال' || correctedSubCategory === 'دباديب' || correctedSubCategory === 'ساعات اطفال') {
        correctedCategory = 'أطفال'
      } else if (correctedSubCategory === 'إكسسوارات' || product.name?.includes('نسائي') || product.name?.includes('السيدات')) {
        correctedCategory = 'نسائي'
      } else if (product.name?.includes('رجالي') || product.name?.includes('الرجال')) {
        correctedCategory = 'رجالي'
      } else {
        // افتراضي بناء على الفئة الفرعية
        if (['ساعات', 'محافظ', 'عطور', 'شنط يد', 'نظارات شمسية', 'سبراي'].includes(correctedSubCategory)) {
          // يمكن أن تكون للرجال أو النساء، نحدد بناء على الاسم
          if (product.name?.includes('نسائي') || product.name?.includes('السيدات')) {
            correctedCategory = 'نسائي'
          } else {
            correctedCategory = 'رجالي' // افتراضي
          }
        }
      }
      
      if (correctedCategory !== product.category) {
        updates.category = correctedCategory
        needsUpdate = true
      }
      
      // تحديث الأبعاد حسب الفئة الفرعية الجديدة
      const defaultDims = DEFAULT_DIMENSIONS[correctedSubCategory] || DEFAULT_DIMENSIONS['إكسسوارات']
      
      if (!product.width || !product.height || !product.depth) {
        updates.width = defaultDims.width
        updates.height = defaultDims.height
        updates.depth = defaultDims.depth
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
        
        if (updates.category || updates.subCategory) {
          console.log(`تم تحديث ${product.name}: ${product.category}/${product.subCategory} → ${updates.category || product.category}/${updates.subCategory || product.subCategory}`)
        }
      }
    }
    
    console.log(`تم تحديث ${updatedProducts} منتج`)
    
    // 2. عرض الإحصائيات النهائية
    console.log('\n=== الإحصائيات النهائية ===')
    
    const finalProducts = await prisma.product.findMany({
      select: { category: true, subCategory: true }
    })
    
    const mainCategories = [...new Set(finalProducts.map(p => p.category))].sort()
    const subCategories = [...new Set(finalProducts.map(p => p.subCategory))].sort()
    
    console.log('الفئات الرئيسية النهائية:', mainCategories)
    console.log('الفئات الفرعية النهائية:', subCategories)
    
    // عدد المنتجات لكل فئة
    const categoryCount = {}
    const subCategoryCount = {}
    
    finalProducts.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
      subCategoryCount[p.subCategory] = (subCategoryCount[p.subCategory] || 0) + 1
    })
    
    console.log('\nتوزيع المنتجات حسب الفئة الرئيسية:')
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count} منتج`)
    })
    
    console.log('\nتوزيع المنتجات حسب الفئة الفرعية:')
    Object.entries(subCategoryCount).forEach(([cat, count]) => {
      console.log(`- ${cat}: ${count} منتج`)
    })
    
    console.log('\n=== تم الانتهاء بنجاح ===')
    
  } catch (error) {
    console.error('خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCategoriesCorrect()
