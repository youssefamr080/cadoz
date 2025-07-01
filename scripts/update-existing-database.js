const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function updateExistingDataWithDimensions() {
  console.log('تحديث البيانات الموجودة بالأبعاد...')

  try {
    // دالة للحصول على الأبعاد حسب الفئة الفرعية
    function getDimensionsBySubCategory(subCategory) {
      const dimensions = {
        // المنتجات العادية
        'watches': { width: 4.5, height: 1.2, depth: 4.5 },
        'wallets': { width: 11, height: 1.5, depth: 9 },
        'bags': { width: 30, height: 25, depth: 12 },
        'handbags': { width: 25, height: 20, depth: 10 },
        'accessories': { width: 8, height: 8, depth: 3 },
        'perfumes': { width: 6, height: 12, depth: 6 },
        'toys': { width: 15, height: 10, depth: 8 },
        'teddy': { width: 20, height: 25, depth: 15 },
        'sunglasses': { width: 14, height: 5, depth: 4 },
        
        // الحلويات
        'chocolate': { width: 10, height: 2, depth: 15 },
        'candy': { width: 8, height: 8, depth: 3 },
        'chips': { width: 6, height: 15, depth: 6 },
      }
      
      return dimensions[subCategory] || { width: 10, height: 10, depth: 5 }
    }

    // دالة للحصول على targetGender من category
    function getTargetGender(category) {
      switch(category) {
        case 'men': return 'male'
        case 'women': return 'female' 
        case 'kids': return 'kids'
        default: return 'unisex'
      }
    }

    // تحديث المنتجات الموجودة
    console.log('تحديث المنتجات...')
    const products = await prisma.product.findMany()
    
    for (const product of products) {
      const dimensions = getDimensionsBySubCategory(product.subCategory)
      const targetGender = getTargetGender(product.category)
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          width: dimensions.width,
          height: dimensions.height,
          depth: dimensions.depth,
          targetGender: targetGender
        }
      })
    }

    console.log(`✅ تم تحديث ${products.length} منتج`)

    // تحديث الحلويات الموجودة
    console.log('تحديث الحلويات...')
    const sweets = await prisma.sweet.findMany()
    
    for (const sweet of sweets) {
      const dimensions = getDimensionsBySubCategory(sweet.category)
      
      await prisma.sweet.update({
        where: { id: sweet.id },
        data: {
          width: dimensions.width,
          height: dimensions.height, 
          depth: dimensions.depth
        }
      })
    }

    console.log(`✅ تم تحديث ${sweets.length} حلوى`)

    // تحديث الصناديق الموجودة (إضافة ألوان وأبعاد واقعية)
    console.log('تحديث الصناديق...')
    const boxes = await prisma.box.findMany()
    
    const boxUpdates = [
      { size: 'صغير', width: 15, height: 10, depth: 8, color: 'أزرق' },
      { size: 'متوسط', width: 25, height: 18, depth: 15, color: 'أحمر' },
      { size: 'كبير', width: 35, height: 25, depth: 20, color: 'ذهبي' }
    ]

    for (const box of boxes) {
      // إيجاد التحديث المناسب حسب الحجم أو اسم الصندوق
      let updateData = boxUpdates.find(update => 
        box.size === update.size || 
        box.name.includes(update.size)
      )
      
      if (!updateData) {
        // افتراضي للصناديق غير المحددة
        updateData = { width: 20, height: 15, depth: 12, color: 'أبيض' }
      }
      
      await prisma.box.update({
        where: { id: box.id },
        data: {
          width: updateData.width,
          height: updateData.height,
          depth: updateData.depth,
          color: updateData.color || box.color
        }
      })
    }

    console.log(`✅ تم تحديث ${boxes.length} صندوق`)

    // إضافة بعض الأكياس إذا لم تكن موجودة
    const bagsCount = await prisma.bag.count()
    if (bagsCount === 0) {
      console.log('إضافة أكياس تجريبية...')
      const bags = [
        {
          name: "كيس هدايا أزرق",
          description: "كيس هدايا أنيق باللون الأزرق",
          price: 8.99,
          color: "أزرق",
          size: "متوسط",
          material: "ورق مقوى",
          image: "/images/bag-blue.jpg",
          stock: 30
        },
        {
          name: "كيس هدايا وردي", 
          description: "كيس هدايا جميل باللون الوردي",
          price: 8.99,
          color: "وردي",
          size: "متوسط", 
          material: "ورق مقوى",
          image: "/images/bag-pink.jpg",
          stock: 25
        }
      ]

      for (const bag of bags) {
        await prisma.bag.create({ data: bag })
      }
      
      console.log(`✅ تم إضافة ${bags.length} كيس`)
    }

    console.log('🎉 تم تحديث جميع البيانات بنجاح!')

  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingDataWithDimensions()
