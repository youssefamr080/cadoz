const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function updateDatabaseWithDimensions() {
  console.log('🔄 تحديث البيانات الموجودة بالأبعاد والألوان...')

  try {
    // جلب جميع المنتجات الموجودة
    const products = await prisma.product.findMany()
    console.log(`📦 تم العثور على ${products.length} منتج`)

    // تحديث كل منتج بالأبعاد حسب فئته
    for (const product of products) {
      const dimensions = getProductDimensions(product.subCategory, product.category)
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          width: dimensions.width,
          height: dimensions.height,
          depth: dimensions.depth,
          targetGender: getTargetGender(product.name, product.subCategory)
        }
      })
      
      console.log(`✅ تم تحديث: ${product.name} - ${dimensions.width}×${dimensions.height}×${dimensions.depth}`)
    }

    // جلب جميع الحلويات الموجودة
    const sweets = await prisma.sweet.findMany()
    console.log(`🍭 تم العثور على ${sweets.length} حلوى`)

    // تحديث كل حلوى بالأبعاد حسب فئتها
    for (const sweet of sweets) {
      const dimensions = getSweetDimensions(sweet.category)
      
      await prisma.sweet.update({
        where: { id: sweet.id },
        data: {
          width: dimensions.width,
          height: dimensions.height,
          depth: dimensions.depth
        }
      })
      
      console.log(`✅ تم تحديث: ${sweet.name} - ${dimensions.width}×${dimensions.height}×${dimensions.depth}`)
    }

    // جلب جميع الصناديق الموجودة
    const boxes = await prisma.box.findMany()
    console.log(`📦 تم العثور على ${boxes.length} صندوق`)

    // تحديث كل صندوق بالأبعاد والألوان
    for (const box of boxes) {
      const dimensions = getBoxDimensions(box.size)
      const colors = getBoxColors(box.size)
      
      await prisma.box.update({
        where: { id: box.id },
        data: {
          width: dimensions.width,
          height: dimensions.height,
          depth: dimensions.depth,
          color: colors.primary,
          material: getBoxMaterial(box.size)
        }
      })
      
      console.log(`✅ تم تحديث: ${box.name} - ${dimensions.width}×${dimensions.height}×${dimensions.depth} - ${colors.primary}`)
    }

    // جلب جميع الأكياس الموجودة
    const bags = await prisma.bag.findMany()
    console.log(`👜 تم العثور على ${bags.length} كيس`)

    // تحديث كل كيس
    for (const bag of bags) {
      await prisma.bag.update({
        where: { id: bag.id },
        data: {
          color: getBagColor(bag.name),
          material: "قماش فاخر"
        }
      })
      
      console.log(`✅ تم تحديث: ${bag.name}`)
    }

    console.log('\n🎉 تم تحديث جميع البيانات بنجاح!')

  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// دالة للحصول على أبعاد المنتجات حسب الفئة
function getProductDimensions(subCategory, category) {
  const dimensionsMap = {
    // فئات فرعية محددة
    "ساعات": { width: 4.5, height: 1.2, depth: 4.5 },
    "نظارات": { width: 14, height: 2, depth: 5 },
    "شنط": { width: 30, height: 25, depth: 12 },
    "محافظ": { width: 11, height: 1.5, depth: 9 },
    "اكسسوارات": { width: 8, height: 8, depth: 3 },
    "عطور": { width: 6, height: 12, depth: 6 },
    "ألعاب اطفال": { width: 15, height: 10, depth: 8 },
    "دباديب": { width: 20, height: 25, depth: 15 },
    
    // فئات عامة كبديل
    "إكسسوارات": { width: 8, height: 8, depth: 3 },
    "حقائب": { width: 25, height: 20, depth: 10 },
    "ألعاب": { width: 12, height: 12, depth: 8 },
    "عطور": { width: 6, height: 12, depth: 6 }
  }
  
  return dimensionsMap[subCategory] || dimensionsMap[category] || { width: 10, height: 10, depth: 5 }
}

// دالة للحصول على أبعاد الحلويات
function getSweetDimensions(category) {
  const dimensionsMap = {
    "شوكولاتة": { width: 10, height: 2, depth: 15 },
    "كاندي": { width: 8, height: 8, depth: 3 },
    "شيبس": { width: 6, height: 15, depth: 6 },
    "حلويات": { width: 8, height: 8, depth: 3 }
  }
  
  return dimensionsMap[category] || { width: 8, height: 8, depth: 3 }
}

// دالة للحصول على أبعاد الصناديق
function getBoxDimensions(size) {
  const dimensionsMap = {
    "صغير": { width: 15, height: 10, depth: 8 },
    "متوسط": { width: 25, height: 18, depth: 15 },
    "كبير": { width: 35, height: 25, depth: 20 }
  }
  
  return dimensionsMap[size] || { width: 20, height: 15, depth: 10 }
}

// دالة للحصول على ألوان الصناديق
function getBoxColors(size) {
  const colorsMap = {
    "صغير": { primary: "#3B82F6", name: "أزرق فاتح" },
    "متوسط": { primary: "#EF4444", name: "أحمر" },
    "كبير": { primary: "#F59E0B", name: "ذهبي" }
  }
  
  return colorsMap[size] || { primary: "#8B5CF6", name: "بنفسجي" }
}

// دالة للحصول على مواد الصناديق
function getBoxMaterial(size) {
  const materialMap = {
    "صغير": "كرتون عادي",
    "متوسط": "كرتون مقوى",
    "كبير": "كرتون فاخر مقوى"
  }
  
  return materialMap[size] || "كرتون"
}

// دالة لتحديد الجنس المستهدف
function getTargetGender(name, subCategory) {
  const nameLower = name.toLowerCase()
  
  // كلمات دلالية للرجال
  if (nameLower.includes('رجال') || nameLower.includes('رجالي') || nameLower.includes('men')) {
    return 'male'
  }
  
  // كلمات دلالية للنساء
  if (nameLower.includes('نساء') || nameLower.includes('نسائي') || nameLower.includes('women') || nameLower.includes('حريمي')) {
    return 'female'
  }
  
  // كلمات دلالية للأطفال
  if (nameLower.includes('أطفال') || nameLower.includes('طفل') || nameLower.includes('kids') || 
      subCategory === 'دباديب' || subCategory === 'ألعاب اطفال') {
    return 'kids'
  }
  
  return 'unisex'
}

// دالة للحصول على لون الكيس
function getBagColor(name) {
  const colors = ['#F472B6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
  return colors[Math.floor(Math.random() * colors.length)]
}

updateDatabaseWithDimensions()
