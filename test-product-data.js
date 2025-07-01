const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProductData() {
  try {
    console.log('🔍 فحص بيانات المنتجات والفئات الفرعية...')
    
    const products = await prisma.products.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
        subCategory: true,
        targetGender: true
      }
    })
    
    console.log('\n📊 عينة من المنتجات:')
    console.log('='.repeat(60))
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   الفئة: "${product.category}"`)
      console.log(`   الفئة الفرعية: "${product.subCategory}"`)
      console.log(`   الجنس المستهدف: "${product.targetGender}"`)
      console.log('')
    })
    
    // فحص الفئات الفرعية المختلفة
    const distinctSubCategories = await prisma.products.findMany({
      select: {
        subCategory: true,
        category: true
      },
      distinct: ['subCategory']
    })
    
    console.log('\n🏷️ الفئات الفرعية المختلفة:')
    console.log('='.repeat(40))
    distinctSubCategories.forEach(item => {
      console.log(`• "${item.subCategory}" (من فئة: "${item.category}")`)
    })
    
  } catch (error) {
    console.error('❌ خطأ:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductData()
