const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBagsSize() {
  try {
    console.log('جاري فحص أحجام الشنط في قاعدة البيانات...')
    
    const bags = await prisma.bag.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        size: true,
        stock: true
      }
    })

    console.log(`\nتم العثور على ${bags.length} شنطة في قاعدة البيانات:\n`)

    const sizeGroups = {
      small: [],
      medium: [],
      large: [],
      noSize: []
    }

    bags.forEach(bag => {
      const size = bag.size?.toLowerCase() || ""
      
      if (size.includes("صغير") || size === "small" || 
          (!size && bag.price < 25)) {
        sizeGroups.small.push(bag)
      } else if (size.includes("متوسط") || size === "medium" || 
                (!size && bag.price >= 25 && bag.price <= 35)) {
        sizeGroups.medium.push(bag)
      } else if (size.includes("كبير") || size === "large" || 
                (!size && bag.price > 35)) {
        sizeGroups.large.push(bag)
      } else {
        sizeGroups.noSize.push(bag)
      }
    })

    console.log(`📦 الشنط الصغيرة (${sizeGroups.small.length}):`)
    sizeGroups.small.forEach(bag => {
      console.log(`  - ${bag.name} | السعر: ${bag.price} جنيه | الحجم: ${bag.size || 'غير محدد'} | المخزون: ${bag.stock}`)
    })

    console.log(`\n📦 الشنط المتوسطة (${sizeGroups.medium.length}):`)
    sizeGroups.medium.forEach(bag => {
      console.log(`  - ${bag.name} | السعر: ${bag.price} جنيه | الحجم: ${bag.size || 'غير محدد'} | المخزون: ${bag.stock}`)
    })

    console.log(`\n📦 الشنط الكبيرة (${sizeGroups.large.length}):`)
    sizeGroups.large.forEach(bag => {
      console.log(`  - ${bag.name} | السعر: ${bag.price} جنيه | الحجم: ${bag.size || 'غير محدد'} | المخزون: ${bag.stock}`)
    })

    if (sizeGroups.noSize.length > 0) {
      console.log(`\n⚠️  شنط بدون تصنيف واضح (${sizeGroups.noSize.length}):`)
      sizeGroups.noSize.forEach(bag => {
        console.log(`  - ${bag.name} | السعر: ${bag.price} جنيه | الحجم: ${bag.size || 'غير محدد'} | المخزون: ${bag.stock}`)
      })
    }

    // إحصائيات سريعة
    const availableBags = bags.filter(bag => bag.stock > 0)
    console.log(`\n📊 الإحصائيات:`)
    console.log(`   إجمالي الشنط: ${bags.length}`)
    console.log(`   الشنط المتاحة: ${availableBags.length}`)
    console.log(`   صغيرة متاحة: ${sizeGroups.small.filter(b => b.stock > 0).length}`)
    console.log(`   متوسطة متاحة: ${sizeGroups.medium.filter(b => b.stock > 0).length}`)
    console.log(`   كبيرة متاحة: ${sizeGroups.large.filter(b => b.stock > 0).length}`)

  } catch (error) {
    console.error('خطأ في فحص الشنط:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBagsSize()
