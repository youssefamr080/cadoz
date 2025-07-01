const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestProducts() {
  try {
    console.log('🛍️ إضافة منتجات اختبارية للعرض ثلاثي الأبعاد...')
    
    const testProducts = [
      {
        name: "ساعة ذكية فاخرة",
        category: "اكسسوارات",
        subCategory: "ساعات",
        targetGender: "male",
        price: 450,
        description: "ساعة ذكية بتصميم أنيق",
        image: "/images/watch-luxury.jpg",
        inStock: true,
        width: 8,
        height: 8,
        depth: 2
      },
      {
        name: "نظارة شمسية عصرية",
        category: "اكسسوارات",
        subCategory: "نظارات شمسية",
        targetGender: "female",
        price: 280,
        description: "نظارة شمسية بإطار أنيق",
        image: "/images/sunglasses-modern.jpg",
        inStock: true,
        width: 15,
        height: 6,
        depth: 4
      },
      {
        name: "حقيبة يد جلدية",
        category: "حقائب",
        subCategory: "شنط يد",
        targetGender: "female",
        price: 650,
        description: "حقيبة يد من الجلد الطبيعي",
        image: "/images/handbag-leather.jpg",
        inStock: true,
        width: 25,
        height: 20,
        depth: 15
      },
      {
        name: "محفظة رجالية",
        category: "اكسسوارات",
        subCategory: "محافظ",
        targetGender: "male",
        price: 180,
        description: "محفظة جلدية أنيقة للرجال",
        image: "/images/wallet-men.jpg",
        inStock: true,
        width: 12,
        height: 9,
        depth: 2
      },
      {
        name: "عطر فرنسي فاخر",
        category: "عطور",
        subCategory: "عطور",
        targetGender: "unisex",
        price: 320,
        description: "عطر فرنسي بعبوة أنيقة",
        image: "/images/perfume-french.jpg",
        inStock: true,
        width: 6,
        height: 12,
        depth: 6
      },
      {
        name: "دبدوب طري للأطفال",
        category: "العاب",
        subCategory: "دباديب",
        targetGender: "children",
        price: 95,
        description: "دبدوب طري ومحبوب للأطفال",
        image: "/images/teddy-bear.jpg",
        inStock: true,
        width: 20,
        height: 25,
        depth: 15
      }
    ]
    
    for (const product of testProducts) {
      try {
        const created = await prisma.products.create({
          data: product
        })
        console.log(`✅ تمت إضافة: ${created.name} (${created.subCategory})`)
      } catch (error) {
        console.log(`⚠️ تخطي: ${product.name} (موجود مسبقاً)`)
      }
    }
    
    // إضافة حلويات أيضاً
    const testSweets = [
      {
        name: "شوكولاتة بلجيكية",
        category: "شوكولاتة",
        price: 45,
        description: "شوكولاتة بلجيكية فاخرة",
        image: "/images/chocolate-belgian.jpg",
        inStock: true,
        width: 10,
        height: 2,
        depth: 15
      },
      {
        name: "حلوى ملونة",
        category: "حلوى",
        price: 25,
        description: "حلوى ملونة لذيذة",
        image: "/images/candy-colorful.jpg",
        inStock: true,
        width: 8,
        height: 8,
        depth: 3
      }
    ]
    
    for (const sweet of testSweets) {
      try {
        const created = await prisma.sweets.create({
          data: sweet
        })
        console.log(`✅ تمت إضافة حلوى: ${created.name}`)
      } catch (error) {
        console.log(`⚠️ تخطي حلوى: ${sweet.name} (موجودة مسبقاً)`)
      }
    }
    
    console.log('\n🎉 تم الانتهاء من إضافة المنتجات الاختبارية!')
    
  } catch (error) {
    console.error('❌ خطأ:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

addTestProducts()
