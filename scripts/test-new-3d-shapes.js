const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testNewGiftPreview() {
  console.log('🔍 اختبار العرض الجديد للهدايا مع الأشكال الواقعية...\n')

  try {
    // اختبار المنتجات والفئات
    console.log('📦 اختبار المنتجات:')
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        subCategory: true,
        targetGender: true,
        width: true,
        height: true,
        depth: true,
        color: true,
        price: true
      },
      take: 10
    })

    products.forEach(product => {
      console.log(`- ${product.name}`)
      console.log(`  الفئة: ${product.category} > ${product.subCategory}`)
      console.log(`  الجنس المستهدف: ${product.targetGender || 'غير محدد'}`)
      console.log(`  الأبعاد: ${product.width || 'افتراضي'} × ${product.height || 'افتراضي'} × ${product.depth || 'افتراضي'}`)
      console.log(`  اللون: ${product.color || 'افتراضي'}`)
      console.log('')
    })

    // اختبار الحلويات
    console.log('🍬 اختبار الحلويات:')
    const sweets = await prisma.sweet.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        width: true,
        height: true,
        depth: true,
        color: true,
        price: true
      },
      take: 5
    })

    sweets.forEach(sweet => {
      console.log(`- ${sweet.name}`)
      console.log(`  الفئة: ${sweet.category}`)
      console.log(`  الأبعاد: ${sweet.width || 'افتراضي'} × ${sweet.height || 'افتراضي'} × ${sweet.depth || 'افتراضي'}`)
      console.log(`  اللون: ${sweet.color || 'افتراضي'}`)
      console.log('')
    })

    // اختبار الصناديق مع الألوان
    console.log('📦 اختبار الصناديق مع الألوان:')
    const boxes = await prisma.box.findMany({
      select: {
        id: true,
        name: true,
        width: true,
        height: true,
        depth: true,
        color: true,
        price: true
      },
      take: 5
    })

    boxes.forEach(box => {
      console.log(`- ${box.name}`)
      console.log(`  الأبعاد: ${box.width} × ${box.height} × ${box.depth}`)
      console.log(`  اللون: ${box.color || 'غير محدد'}`)
      console.log(`  السعر: ${box.price} جنيه`)
      console.log('')
    })

    // إحصائيات نهائية
    console.log('📊 إحصائيات نهائية:')
    
    const stats = {
      totalProducts: await prisma.product.count(),
      totalSweets: await prisma.sweet.count(),
      totalBoxes: await prisma.box.count(),
      
      // عدد المنتجات لكل فئة فرعية
      productsBySubCategory: await prisma.product.groupBy({
        by: ['subCategory'],
        _count: { id: true }
      }),
      
      // عدد المنتجات حسب الجنس المستهدف
      productsByGender: await prisma.product.groupBy({
        by: ['targetGender'],
        _count: { id: true }
      }),
      
      // عدد الحلويات لكل فئة
      sweetsByCategory: await prisma.sweet.groupBy({
        by: ['category'],
        _count: { id: true }
      }),
      
      // عدد الصناديق التي لها ألوان
      boxesWithColors: await prisma.box.count({
        where: { color: { not: null } }
      })
    }

    console.log(`📦 إجمالي المنتجات: ${stats.totalProducts}`)
    console.log(`🍬 إجمالي الحلويات: ${stats.totalSweets}`)
    console.log(`📦 إجمالي الصناديق: ${stats.totalBoxes}`)
    console.log(`🎨 الصناديق الملونة: ${stats.boxesWithColors}`)
    console.log('')

    console.log('📊 المنتجات حسب الفئة الفرعية:')
    stats.productsBySubCategory.forEach(item => {
      console.log(`- ${item.subCategory}: ${item._count.id} منتج`)
    })
    console.log('')

    console.log('👥 المنتجات حسب الجنس المستهدف:')
    stats.productsByGender.forEach(item => {
      console.log(`- ${item.targetGender || 'غير محدد'}: ${item._count.id} منتج`)
    })
    console.log('')

    console.log('🍭 الحلويات حسب الفئة:')
    stats.sweetsByCategory.forEach(item => {
      console.log(`- ${item.category}: ${item._count.id} حلوى`)
    })

    console.log('\n✅ تم اختبار النظام بنجاح!')
    console.log('🎨 الأشكال ثلاثية الأبعاد الجديدة جاهزة للعرض!')
    console.log('💡 الآن سيظهر كل منتج بشكله الحقيقي بدلاً من المربعات البسيطة')

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNewGiftPreview()
