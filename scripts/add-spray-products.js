const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function addSprayProducts() {
  console.log('=== إضافة منتجات السبراي المفقودة ===')
  
  try {
    // منتجات سبراي للرجال
    const menSprayProducts = [
      {
        name: 'سبراي رجالي منعش',
        description: 'سبراي رجالي برائحة منعشة ومميزة',
        price: 45.0,
        old_price: 55.0,
        category: 'رجالي',
        subCategory: 'سبراي',
        colors: ['أزرق', 'أسود'],
        width: 5,
        height: 15,
        depth: 5,
        stock: 20,
        inStock: true,
        image: '/images/image_fx_ (41).webp'
      },
      {
        name: 'سبراي رجالي رياضي',
        description: 'سبراي مثالي للرجال الرياضيين',
        price: 38.0,
        category: 'رجالي',
        subCategory: 'سبراي',
        colors: ['أخضر', 'أبيض'],
        width: 5,
        height: 15,
        depth: 5,
        stock: 15,
        inStock: true,
        image: '/images/image_fx_ (41).webp'
      }
    ]
    
    // منتجات سبراي للنساء
    const womenSprayProducts = [
      {
        name: 'سبراي نسائي زهري',
        description: 'سبراي نسائي برائحة الزهور الطبيعية',
        price: 42.0,
        old_price: 50.0,
        category: 'نسائي',
        subCategory: 'سبراي',
        colors: ['وردي', 'أبيض'],
        width: 5,
        height: 15,
        depth: 5,
        stock: 25,
        inStock: true,
        image: '/images/image_fx_ (42).webp'
      },
      {
        name: 'سبراي نسائي أنيق',
        description: 'سبراي نسائي أنيق للاستخدام اليومي',
        price: 48.0,
        category: 'نسائي',
        subCategory: 'سبراي',
        colors: ['ذهبي', 'فضي'],
        width: 5,
        height: 15,
        depth: 5,
        stock: 18,
        inStock: true,
        image: '/images/image_fx_ (42).webp'
      }
    ]
    
    // إضافة المنتجات للرجال
    for (const product of menSprayProducts) {
      await prisma.product.create({
        data: product
      })
      console.log(`✅ تم إضافة: ${product.name}`)
    }
    
    // إضافة المنتجات للنساء
    for (const product of womenSprayProducts) {
      await prisma.product.create({
        data: product
      })
      console.log(`✅ تم إضافة: ${product.name}`)
    }
    
    // فحص النتائج
    const sprayProducts = await prisma.product.findMany({
      where: { subCategory: 'سبراي' },
      select: { name: true, category: true, subCategory: true }
    })
    
    console.log(`\n🎉 تم إضافة ${sprayProducts.length} منتج سبراي بنجاح!`)
    sprayProducts.forEach(p => {
      console.log(`  - ${p.name} (${p.category})`)
    })
    
  } catch (error) {
    console.error('خطأ في إضافة المنتجات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSprayProducts()
