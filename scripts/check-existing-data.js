const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function checkExistingData() {
  console.log('فحص البيانات الموجودة...')

  try {
    // فحص المنتجات
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        subCategory: true,
        price: true,
        width: true,
        height: true,
        depth: true,
        targetGender: true,
        stock: true
      },
      take: 10
    })

    console.log('\n📦 المنتجات الموجودة:')
    console.log(`العدد الإجمالي: ${products.length}`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   الفئة: ${product.category || 'غير محدد'}`)
      console.log(`   الفئة الفرعية: ${product.subCategory || 'غير محدد'}`)
      console.log(`   السعر: ${product.price} جنيه`)
      console.log(`   الأبعاد: ${product.width || 'غير محدد'} × ${product.height || 'غير محدد'} × ${product.depth || 'غير محدد'} سم`)
      console.log(`   الجنس المستهدف: ${product.targetGender || 'غير محدد'}`)
      console.log(`   المخزون: ${product.stock}`)
      console.log('   ---')
    })

    // فحص الحلويات
    const sweets = await prisma.sweet.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        width: true,
        height: true,
        depth: true,
        stock: true
      },
      take: 10
    })

    console.log('\n🍭 الحلويات الموجودة:')
    console.log(`العدد الإجمالي: ${sweets.length}`)
    sweets.forEach((sweet, index) => {
      console.log(`${index + 1}. ${sweet.name}`)
      console.log(`   الفئة: ${sweet.category}`)
      console.log(`   السعر: ${sweet.price} جنيه`)
      console.log(`   الأبعاد: ${sweet.width || 'غير محدد'} × ${sweet.height || 'غير محدد'} × ${sweet.depth || 'غير محدد'} سم`)
      console.log(`   المخزون: ${sweet.stock}`)
      console.log('   ---')
    })

    // فحص الصناديق
    const boxes = await prisma.box.findMany({
      select: {
        id: true,
        name: true,
        size: true,
        price: true,
        width: true,
        height: true,
        depth: true,
        color: true,
        stock: true
      },
      take: 10
    })

    console.log('\n📦 الصناديق الموجودة:')
    console.log(`العدد الإجمالي: ${boxes.length}`)
    boxes.forEach((box, index) => {
      console.log(`${index + 1}. ${box.name}`)
      console.log(`   الحجم: ${box.size || 'غير محدد'}`)
      console.log(`   اللون: ${box.color || 'غير محدد'}`)
      console.log(`   السعر: ${box.price} جنيه`)
      console.log(`   الأبعاد: ${box.width || 'غير محدد'} × ${box.height || 'غير محدد'} × ${box.depth || 'غير محدد'} سم`)
      console.log(`   المخزون: ${box.stock}`)
      console.log('   ---')
    })

  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkExistingData()
