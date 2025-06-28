import { PrismaClient } from './generated/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 بدء إنشاء البيانات التجريبية...')

  // حذف البيانات الموجودة
  console.log('🗑️ حذف البيانات الموجودة...')
  await prisma.product.deleteMany({})
  await prisma.box.deleteMany({})
  await prisma.bag.deleteMany({})
  await prisma.sweet.deleteMany({})

  // منتجات الرجال
  console.log('👨 إنشاء منتجات الرجال...')
  const menProducts = []
  
  // ساعات الرجال
  for (let i = 0; i < 15; i++) {
    menProducts.push({
      name: `ساعة رجالية ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 500, max: 15000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 600, max: 18000 }) : undefined,
      image: "/images/watch section.png",
      category: "men",
      subCategory: "watches",
      brand: faker.helpers.arrayElement(["Rolex", "Omega", "TAG Heuer", "Casio", "Citizen"]),
      tags: ["ساعات", "رجالي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // محافظ الرجال
  for (let i = 0; i < 15; i++) {
    menProducts.push({
      name: `محفظة رجالية ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 200, max: 8000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 300, max: 10000 }) : undefined,
      image: "/images/men wallet.png",
      category: "men",
      subCategory: "wallets",
      brand: faker.helpers.arrayElement(["Louis Vuitton", "Gucci", "Prada", "Coach", "Michael Kors"]),
      tags: ["محافظ", "رجالي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // نظارات الرجال
  for (let i = 0; i < 15; i++) {
    menProducts.push({
      name: `نظارة رجالية ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 300, max: 12000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 400, max: 15000 }) : undefined,
      image: "/images/men sunglasses.png",
      category: "men",
      subCategory: "sunglasses",
      brand: faker.helpers.arrayElement(["Ray-Ban", "Oakley", "Persol", "Tom Ford", "Aviator"]),
      tags: ["نظارات", "رجالي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // عطور الرجال
  for (let i = 0; i < 15; i++) {
    menProducts.push({
      name: `عطر رجالي ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 400, max: 20000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 500, max: 25000 }) : undefined,
      image: "/images/men perfum section.png",
      category: "men",
      subCategory: "perfumes",
      brand: faker.helpers.arrayElement(["Chanel", "Dior", "Versace", "Hugo Boss", "Armani"]),
      tags: ["عطور", "رجالي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // منتجات النساء
  console.log('👩 إنشاء منتجات النساء...')
  const womenProducts = []

  // ساعات النساء
  for (let i = 0; i < 15; i++) {
    womenProducts.push({
      name: `ساعة نسائية ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 400, max: 12000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 500, max: 15000 }) : undefined,
      image: "/images/women watch.png",
      category: "women",
      subCategory: "watches",
      brand: faker.helpers.arrayElement(["Cartier", "Tiffany", "Pandora", "Daniel Wellington", "Michael Kors"]),
      tags: ["ساعات", "نسائي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // محافظ النساء
  for (let i = 0; i < 15; i++) {
    womenProducts.push({
      name: `محفظة نسائية ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 250, max: 10000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 350, max: 12000 }) : undefined,
      image: "/images/women wallets.png",
      category: "women",
      subCategory: "wallets",
      brand: faker.helpers.arrayElement(["Louis Vuitton", "Chanel", "Gucci", "Prada", "Coach"]),
      tags: ["محافظ", "نسائي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // نظارات النساء
  for (let i = 0; i < 15; i++) {
    womenProducts.push({
      name: `نظارة نسائية ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 350, max: 15000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 450, max: 18000 }) : undefined,
      image: "/images/women sunglasses.png",
      category: "women",
      subCategory: "sunglasses",
      brand: faker.helpers.arrayElement(["Ray-Ban", "Chanel", "Dior", "Prada", "Versace"]),
      tags: ["نظارات", "نسائي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // عطور النساء
  for (let i = 0; i < 15; i++) {
    womenProducts.push({
      name: `عطر نسائي ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 500, max: 25000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 600, max: 30000 }) : undefined,
      image: "/images/women perfume.png",
      category: "women",
      subCategory: "perfumes",
      brand: faker.helpers.arrayElement(["Chanel", "Dior", "Versace", "Tom Ford", "Yves Saint Laurent"]),
      tags: ["عطور", "نسائي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // اكسسوارات النساء
  for (let i = 0; i < 15; i++) {
    womenProducts.push({
      name: `اكسسوار نسائي ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 150, max: 5000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 200, max: 6000 }) : undefined,
      image: "/images/women Accessories.png",
      category: "women",
      subCategory: "accessories",
      brand: faker.helpers.arrayElement(["Tiffany", "Pandora", "Swarovski", "Kate Spade", "Coach"]),
      tags: ["اكسسوارات", "نسائي", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // منتجات الأطفال
  console.log('👶 إنشاء منتجات الأطفال...')
  const kidsProducts = []

  // ساعات الأطفال
  for (let i = 0; i < 10; i++) {
    kidsProducts.push({
      name: `ساعة أطفال ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 100, max: 2000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 150, max: 2500 }) : undefined,
      image: "/images/kids watch.png",
      category: "kids",
      subCategory: "watches",
      brand: faker.helpers.arrayElement(["Casio Kids", "Disney", "Cartoon Network", "Marvel", "Frozen"]),
      tags: ["ساعات", "أطفال", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // ألعاب الأطفال
  for (let i = 0; i < 20; i++) {
    kidsProducts.push({
      name: `لعبة أطفال ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 50, max: 3000 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 80, max: 3500 }) : undefined,
      image: "/images/kids toys.png",
      category: "kids",
      subCategory: "toys",
      brand: faker.helpers.arrayElement(["LEGO", "Barbie", "Hot Wheels", "Fisher-Price", "Playmobil"]),
      tags: ["ألعاب", "أطفال", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // ملابس الأطفال
  for (let i = 0; i < 15; i++) {
    kidsProducts.push({
      name: `ملابس أطفال ${faker.commerce.productAdjective()}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 80, max: 1500 }),
      old_price: faker.datatype.boolean() ? faker.number.int({ min: 120, max: 2000 }) : undefined,
      image: "/images/kids fur.png",
      category: "kids",
      subCategory: "clothing",
      brand: faker.helpers.arrayElement(["Carter's", "H&M Kids", "Zara Kids", "Gap Kids", "Nike Kids"]),
      tags: ["ملابس", "أطفال", faker.commerce.productAdjective()],
      stock: faker.number.int({ min: 5, max: 50 }),
      inStock: true,
      rating: parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      best_seller: faker.datatype.boolean({ probability: 0.2 }),
      trending: faker.datatype.boolean({ probability: 0.3 }),
      new_arrival: faker.datatype.boolean({ probability: 0.25 }),
      sale: faker.datatype.boolean({ probability: 0.4 }),
      colors: [faker.color.human(), faker.color.human()],
      discountPercentage: faker.number.int({ min: 5, max: 25 })
    })
  }

  // إنشاء جميع المنتجات
  console.log('📦 إنشاء المنتجات في قاعدة البيانات...')
  const allProducts = [...menProducts, ...womenProducts, ...kidsProducts]
  
  for (const product of allProducts) {
    await prisma.product.create({
      data: product,
    })
  }

  // إنشاء الصناديق
  console.log('📦 إنشاء الصناديق...')
  const boxes = [
    {
      name: "صندوق هدايا فاخر ذهبي",
      description: "صندوق هدايا أنيق باللون الذهبي مع تفاصيل فاخرة",
      price: 50,
      image: "/images/box.png",
      color: "ذهبي",
      size: "كبير",
      material: "كرتون مقوى"
    },
    {
      name: "صندوق هدايا كلاسيكي أحمر",
      description: "صندوق هدايا تقليدي باللون الأحمر مع شريط ذهبي",
      price: 35,
      image: "/images/box.png",
      color: "أحمر",
      size: "متوسط",
      material: "كرتون مقوى"
    },
    {
      name: "صندوق هدايا أزرق فاتح",
      description: "صندوق هدايا عصري باللون الأزرق الفاتح",
      price: 40,
      image: "/images/box.png",
      color: "أزرق فاتح",
      size: "متوسط",
      material: "كرتون مقوى"
    },
    {
      name: "صندوق هدايا وردي رومانسي",
      description: "صندوق هدايا رومانسي باللون الوردي مع زخارف قلوب",
      price: 45,
      image: "/images/box.png",
      color: "وردي",
      size: "متوسط",
      material: "كرتون مقوى"
    },
    {
      name: "صندوق هدايا أسود أنيق",
      description: "صندوق هدايا أنيق باللون الأسود مع لمسة عصرية",
      price: 55,
      image: "/images/box.png",
      color: "أسود",
      size: "كبير",
      material: "كرتون مقوى"
    }
  ]

  for (const box of boxes) {
    await prisma.box.create({
      data: box,
    })
  }

  // إنشاء الأكياس
  console.log('👜 إنشاء الأكياس...')
  const bags = [
    {
      name: "كيس هدايا فاخر ذهبي",
      description: "كيس هدايا أنيق مع حبال ذهبية وتصميم فاخر",
      price: 25,
      image: "/images/hand bag.png",
      color: "ذهبي",
      size: "كبير",
      material: "ورق مقوى"
    },
    {
      name: "كيس هدايا كلاسيكي أحمر",
      description: "كيس هدايا تقليدي باللون الأحمر مع مقابض قوية",
      price: 20,
      image: "/images/hand bag.png",
      color: "أحمر",
      size: "متوسط",
      material: "ورق مقوى"
    },
    {
      name: "كيس هدايا أزرق عصري",
      description: "كيس هدايا عصري باللون الأزرق مع تصميم حديث",
      price: 22,
      image: "/images/hand bag.png",
      color: "أزرق",
      size: "متوسط",
      material: "ورق مقوى"
    },
    {
      name: "كيس هدايا وردي رومانسي",
      description: "كيس هدايا رومانسي باللون الوردي مع شرائط حريرية",
      price: 28,
      image: "/images/hand bag.png",
      color: "وردي",
      size: "متوسط",
      material: "ورق مقوى"
    },
    {
      name: "كيس هدايا أبيض أنيق",
      description: "كيس هدايا أنيق باللون الأبيض مع لمسة نظيفة",
      price: 18,
      image: "/images/hand bag.png",
      color: "أبيض",
      size: "صغير",
      material: "ورق مقوى"
    }
  ]

  for (const bag of bags) {
    await prisma.bag.create({
      data: bag,
    })
  }

  // إنشاء الحلويات
  console.log('🍭 إنشاء الحلويات...')
  const sweets = [
    {
      name: "شوكولاتة فاخرة مشكلة",
      description: "مجموعة متنوعة من الشوكولاتة الفاخرة بنكهات مختلفة",
      price: 80,
      image: "/images/chocolates.png",
      category: "شوكولاتة",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "حلوى جيلي ملونة",
      description: "حلوى جيلي بألوان زاهية ونكهات فواكه طبيعية",
      price: 35,
      image: "/images/candy.png",
      category: "كاندي",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "شيبس شوكولاتة كريسبي",
      description: "شيبس شوكولاتة مقرمشة بطعم لذيذ ومميز",
      price: 45,
      image: "/images/chips.png",
      category: "حلويات أخرى",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "شوكولاتة داكنة فاخرة",
      description: "شوكولاتة داكنة عالية الجودة بنسبة كاكاو 70%",
      price: 95,
      image: "/images/chocolates.png",
      category: "شوكولاتة",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "حلوى مطاطية بالفواكه",
      description: "حلوى مطاطية طبيعية بنكهات الفواكه الاستوائية",
      price: 40,
      image: "/images/candy.png",
      category: "كاندي",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "شوكولاتة بيضاء كريمية",
      description: "شوكولاتة بيضاء ناعمة وكريمية بطعم الفانيليا",
      price: 70,
      image: "/images/chocolates.png",
      category: "شوكولاتة",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "حلوى صلبة بالنعناع",
      description: "حلوى صلبة منعشة بطعم النعناع الطبيعي",
      price: 25,
      image: "/images/candy.png",
      category: "كاندي",
      stock: faker.number.int({ min: 5, max: 30 })
    },
    {
      name: "شيبس كراميل مقرمش",
      description: "شيبس كراميل مقرمش بطعم الزبدة والعسل",
      price: 50,
      image: "/images/chips.png",
      category: "حلويات أخرى",
      stock: faker.number.int({ min: 5, max: 30 })
    }
  ]

  for (const sweet of sweets) {
    await prisma.sweet.create({
      data: sweet,
    })
  }

  console.log('✅ تم إنشاء البيانات التجريبية بنجاح!')
  console.log(`📊 تم إنشاء:`)
  console.log(`   - ${allProducts.length} منتج`)
  console.log(`   - ${boxes.length} صندوق`)
  console.log(`   - ${bags.length} كيس`)
  console.log(`   - ${sweets.length} نوع حلويات`)
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إنشاء البيانات:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
