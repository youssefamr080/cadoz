const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function updateExistingDataWithDimensions() {
  console.log('تحديث البيانات الموجودة بالأبعاد...')

  try {
    // تحديث المنتجات (الساعات الرجالية)
    const products = await prisma.product.findMany({
      where: { 
        category: 'men',
        subCategory: 'watches'
      }
    })

    console.log(`تحديث ${products.length} ساعة رجالية...`)
    
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          category: "إكسسوارات",
          subCategory: "ساعات", 
          targetGender: "male",
          width: 4.5,      // عرض الساعة
          height: 1.2,     // سماكة الساعة
          depth: 4.5,      // عمق الساعة
        }
      })
    }

    // إضافة منتجات متنوعة أخرى
    const newProducts = [
      {
        name: "محفظة جلدية رجالية فاخرة",
        description: "محفظة جلدية أنيقة للرجال",
        price: 150,
        category: "إكسسوارات",
        subCategory: "محافظ",
        targetGender: "male", 
        width: 11,
        height: 1.5,
        depth: 9,
        image: "/images/wallet-male.jpg",
        stock: 25
      },
      {
        name: "شنطة يد نسائية أنيقة",
        description: "شنطة يد عصرية للنساء",
        price: 280,
        category: "حقائب",
        subCategory: "شنط",
        targetGender: "female",
        width: 30,
        height: 25, 
        depth: 12,
        image: "/images/bag-female.jpg",
        stock: 15
      },
      {
        name: "نظارات شمسية رجالية",
        description: "نظارات شمسية عصرية للرجال",
        price: 120,
        category: "إكسسوارات",
        subCategory: "نظارات",
        targetGender: "male",
        width: 14,
        height: 5,
        depth: 15,
        image: "/images/glasses-male.jpg",
        stock: 20
      },
      {
        name: "عطر رجالي فاخر",
        description: "عطر رجالي بعبير مميز",
        price: 200,
        category: "عطور",
        subCategory: "عطور",
        targetGender: "male",
        width: 6,
        height: 12,
        depth: 6,
        image: "/images/perfume-male.jpg",
        stock: 18
      },
      {
        name: "دبدوب كبير للأطفال",
        description: "دبدوب ناعم ومحبوب",
        price: 90,
        category: "ألعاب",
        subCategory: "دباديب",
        targetGender: "kids",
        width: 20,
        height: 25,
        depth: 15,
        image: "/images/teddy.jpg",
        stock: 12
      },
      {
        name: "لعبة تعليمية للأطفال",
        description: "لعبة تعليمية ممتعة",
        price: 65,
        category: "ألعاب",
        subCategory: "ألعاب اطفال",
        targetGender: "kids",
        width: 15,
        height: 10,
        depth: 15,
        image: "/images/toy-kids.jpg",
        stock: 20
      },
      {
        name: "اكسسوار نسائي أنيق",
        description: "اكسسوار جميل للنساء",
        price: 75,
        category: "إكسسوارات",
        subCategory: "اكسسوارات",
        targetGender: "female",
        width: 8,
        height: 8,
        depth: 3,
        image: "/images/accessory-female.jpg",
        stock: 30
      }
    ]

    console.log('إضافة منتجات جديدة متنوعة...')
    for (const product of newProducts) {
      await prisma.product.create({ data: product })
    }

    // تحديث الحلويات بالأبعاد
    const sweets = await prisma.sweet.findMany()
    
    console.log(`تحديث ${sweets.length} حلوى بالأبعاد...`)
    
    for (const sweet of sweets) {
      let dimensions = { width: 8, height: 3, depth: 12 } // أبعاد افتراضية
      
      // أبعاد مخصصة حسب النوع
      if (sweet.category === 'شوكولاتة') {
        dimensions = { width: 10, height: 2, depth: 15 }
      } else if (sweet.category === 'كاندي') {
        dimensions = { width: 8, height: 8, depth: 3 }
      } else if (sweet.category === 'شيبس') {
        dimensions = { width: 6, height: 15, depth: 6 }
      }
      
      await prisma.sweet.update({
        where: { id: sweet.id },
        data: dimensions
      })
    }

    // تحديث الصناديق بالأبعاد
    const boxes = await prisma.box.findMany()
    
    console.log(`تحديث ${boxes.length} صندوق بالأبعاد...`)
    
    for (const box of boxes) {
      let dimensions = { width: 25, height: 18, depth: 15 } // أبعاد افتراضية متوسطة
      
      // أبعاد مخصصة حسب الحجم
      if (box.size === 'صغير') {
        dimensions = { width: 15, height: 10, depth: 8 }
      } else if (box.size === 'متوسط') {
        dimensions = { width: 25, height: 18, depth: 15 }
      } else if (box.size === 'كبير') {
        dimensions = { width: 35, height: 25, depth: 20 }
      }
      
      await prisma.box.update({
        where: { id: box.id },
        data: dimensions
      })
    }

    console.log('✅ تم تحديث جميع البيانات بنجاح!')
    console.log(`- تم تحديث ${products.length} منتج موجود`)
    console.log(`- تم إضافة ${newProducts.length} منتج جديد`)
    console.log(`- تم تحديث ${sweets.length} حلوى`)
    console.log(`- تم تحديث ${boxes.length} صندوق`)

  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateExistingDataWithDimensions()
