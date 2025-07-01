const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function addSampleData() {
  console.log('إضافة بيانات تجريبية...')

  try {
    // إضافة منتجات مع الفئات الفرعية
    const products = [
      {
        name: "ساعة ذكية للرجال",
        description: "ساعة ذكية أنيقة",
        price: 299.99,
        category: "إكسسوارات",
        subCategory: "ساعات",
        targetGender: "male",
        image: "/images/watch-male.jpg",
        stock: 20
      },
      {
        name: "ساعة أنيقة للنساء", 
        description: "ساعة نسائية مميزة",
        price: 249.99,
        category: "إكسسوارات",
        subCategory: "ساعات", 
        targetGender: "female",
        image: "/images/watch-female.jpg",
        stock: 15
      },
      {
        name: "محفظة جلدية للرجال",
        description: "محفظة جلدية فاخرة",
        price: 89.99,
        category: "إكسسوارات",
        subCategory: "محافظ",
        targetGender: "male", 
        image: "/images/wallet-male.jpg",
        stock: 30
      },
      {
        name: "شنطة يد نسائية",
        description: "شنطة يد أنيقة",
        price: 199.99,
        category: "حقائب",
        subCategory: "شنط",
        targetGender: "female",
        image: "/images/bag-female.jpg",
        stock: 12
      },
      {
        name: "عطر رجالي فاخر",
        description: "عطر رجالي مميز",
        price: 159.99,
        category: "عطور",
        subCategory: "عطور",
        targetGender: "male",
        image: "/images/perfume-male.jpg",
        stock: 18
      },
      {
        name: "دبدوب كبير للأطفال",
        description: "دبدوب ناعم ومحبوب",
        price: 79.99,
        category: "ألعاب",
        subCategory: "دباديب",
        targetGender: "kids",
        image: "/images/teddy.jpg", 
        stock: 8
      }
    ]

    for (const product of products) {
      await prisma.product.create({
        data: product
      })
    }

    // إضافة حلويات
    const sweets = [
      {
        name: "شوكولاتة كادبوري",
        description: "شوكولاتة لذيذة بالحليب",
        price: 12.99,
        category: "شوكولاتة",
        image: "/images/chocolate.jpg",
        stock: 50
      },
      {
        name: "حلوى هاريبو",
        description: "حلوى جيلاتينية ملونة", 
        price: 8.99,
        category: "كاندي",
        image: "/images/candy.jpg",
        stock: 40
      },
      {
        name: "شيبس بطاطس",
        description: "شيبس مقرمش ولذيذ",
        price: 6.99,
        category: "شيبس",
        image: "/images/chips.jpg",
        stock: 60
      }
    ]

    for (const sweet of sweets) {
      await prisma.sweet.create({
        data: sweet
      })
    }

    // إضافة صناديق
    const boxes = [
      {
        name: "صندوق صغير",
        description: "صندوق صغير للهدايا البسيطة",
        price: 15.99,
        color: "أزرق",
        size: "صغير",
        material: "كرتون",
        width: 15,
        height: 10,
        depth: 8,
        image: "/images/box-small.jpg",
        stock: 25
      },
      {
        name: "صندوق متوسط",
        description: "صندوق متوسط للهدايا المتنوعة",
        price: 25.99,
        color: "أحمر", 
        size: "متوسط",
        material: "كرتون",
        width: 25,
        height: 18,
        depth: 15,
        image: "/images/box-medium.jpg",
        stock: 20
      },
      {
        name: "صندوق كبير",
        description: "صندوق كبير للهدايا الفاخرة",
        price: 39.99,
        color: "ذهبي",
        size: "كبير", 
        material: "كرتون مقوى",
        width: 35,
        height: 25,
        depth: 20,
        image: "/images/box-large.jpg",
        stock: 15
      }
    ]

    for (const box of boxes) {
      await prisma.box.create({
        data: box
      })
    }

    console.log('✅ تم إضافة البيانات التجريبية بنجاح!')
    console.log(`- ${products.length} منتجات`)
    console.log(`- ${sweets.length} حلويات`)
    console.log(`- ${boxes.length} صناديق`)

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleData()
