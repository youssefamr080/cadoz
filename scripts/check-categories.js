const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    console.log('=== فحص فئات المنتجات ===')
    const products = await prisma.product.findMany({
      select: { id: true, name: true, category: true, subCategory: true, targetGender: true }
    })
    
    const categories = [...new Set(products.map(p => p.category))]
    const subCategories = [...new Set(products.map(p => p.subCategory))]
    
    console.log('الفئات الرئيسية:', categories)
    console.log('الفئات الفرعية:', subCategories)
    
    console.log('\nعينة من المنتجات:')
    products.slice(0, 5).forEach(p => {
      console.log(`- ${p.name}: category="${p.category}", subCategory="${p.subCategory}", target="${p.targetGender}"`)
    })
    
    console.log('\n=== فحص فئات الحلويات ===')
    const sweets = await prisma.sweet.findMany({
      select: { id: true, name: true, category: true }
    })
    
    const sweetCategories = [...new Set(sweets.map(s => s.category))]
    console.log('فئات الحلويات:', sweetCategories)
    
    console.log('\nعينة من الحلويات:')
    sweets.slice(0, 3).forEach(s => {
      console.log(`- ${s.name}: category="${s.category}"`)
    })
    
    console.log('\n=== فحص الصناديق ===')
    const boxes = await prisma.box.findMany({
      select: { id: true, name: true, size: true, color: true, width: true, height: true, depth: true }
    })
    
    console.log('عدد الصناديق:', boxes.length)
    boxes.forEach(b => {
      console.log(`- ${b.name}: حجم="${b.size}", لون="${b.color}", أبعاد=${b.width}x${b.height}x${b.depth}`)
    })
    
  } catch (error) {
    console.error('❌ خطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories()
