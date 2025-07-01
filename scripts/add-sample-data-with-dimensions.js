const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function addSampleDataWithDimensions() {
  console.log('إضافة بيانات تجريبية مع الأبعاد...')

  try {
    // إضافة منتجات بأبعاد
    const products = [
      {
        name: "ساعة ذكية للرجال",
        description: "ساعة ذكية أنيقة للرجال",
        price: 299.99,
        category: "إكسسوارات",
        subCategory: "ساعات",
        targetGender: "male",
        width: 4.5,
        height: 1.2,
        depth: 4.5,
        weight: 85,
        image: "/images/watch-male.jpg",
        stock: 20
      },
      {
        name: "ساعة أنيقة للنساء",
        description: "ساعة نسائية أنيقة ومميزة",
        price: 249.99,
        category: "إكسسوارات", 
        subCategory: "ساعات",
        targetGender: "female",
        width: 3.5,
        height: 0.8,
        depth: 3.5,
        weight: 60,
        image: "/images/watch-female.jpg",
        stock: 15
      },
      {
        name: "محفظة جلدية للرجال",
        description: "محفظة جلدية فاخرة للرجال",
        price: 89.99,
        category: "إكسسوارات",
        subCategory: "محافظ",
        targetGender: "male",
        width: 11,
        height: 1.5,
        depth: 9,
        weight: 120,
        image: "/images/wallet-male.jpg",
        stock: 30
      },
      {
        name: "شنطة يد نسائية",
        description: "شنطة يد أنيقة للنساء",
        price: 199.99,
        category: "حقائب",
        subCategory: "شنط",
        targetGender: "female",
        width: 30,
        height: 25,
        depth: 12,
        weight: 400,
        image: "/images/bag-female.jpg",
        stock: 12
      },
      {
        name: "دبدوب كبير للأطفال",
        description: "دبدوب ناعم ومحبوب للأطفال",
        price: 79.99,
        category: "ألعاب",
        subCategory: "دباديب",
        targetGender: "kids",
        width: 20,
        height: 25,
        depth: 15,
        weight: 300,
        image: "/images/teddy.jpg",
        stock: 8
      }
    ]

    for (const product of products) {
      await prisma.product.create({
        data: product
      })
    }

    // إضافة حلويات بأبعاد
    const sweets = [
      {
        name: "شوكولاتة كادبوري",
        description: "شوكولاتة لذيذة بالحليب",
        price: 12.99,
        category: "شوكولاتة",
        width: 10,
        height: 2,
        depth: 15,
        weight: 100,
        image: "/images/chocolate.jpg",
        stock: 50
      },
      {
        name: "حلوى هاريبو",
        description: "حلوى جيلاتينية ملونة",
        price: 8.99,
        category: "كاندي",
        width: 8,
        height: 8,
        depth: 3,
        weight: 75,
        image: "/images/candy.jpg",
        stock: 40
      },
      {
        name: "شيبس بطاطس",
        description: "شيبس مقرمش ولذيذ",
        price: 6.99,
        category: "شيبس",
        width: 6,
        height: 15,
        depth: 6,
        weight: 50,
        image: "/images/chips.jpg",
        stock: 60
      }
    ]

    for (const sweet of sweets) {
      await prisma.sweet.create({
        data: sweet
      })
    }

    // إضافة صناديق بأبعاد
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
        maxWeight: 500,
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
        maxWeight: 1200,
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
        maxWeight: 2000,
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

addSampleDataWithDimensions()
