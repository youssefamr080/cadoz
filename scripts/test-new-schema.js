const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function testNewSchema() {
  try {
    console.log('🧪 اختبار النماذج الجديدة...\n');

    // 1. اختبار إضافة حلوى جديدة
    console.log('1. إضافة حلوى جديدة...');
    const sweet = await prisma.sweet.create({
      data: {
        name: 'شوكولاتة كيت كات',
        price: 25.50,
        old_price: 30.00,
        category: 'شوكولاتة',
        image: '/images/kitkat.jpg',
        stock: 100
      }
    });
    console.log('✅ تم إضافة الحلوى:', sweet.name);

    // 2. اختبار إضافة صندوق جديد
    console.log('\n2. إضافة صندوق جديد...');
    const box = await prisma.box.create({
      data: {
        name: 'صندوق هدايا فاخر',
        description: 'صندوق أنيق للهدايا الخاصة',
        price: 45.00,
        image: '/images/luxury-box.jpg',
        stock: 50,
        dimensions: '25x20x15 سم'
      }
    });
    console.log('✅ تم إضافة الصندوق:', box.name);

    // 3. اختبار إضافة شنطة جديدة
    console.log('\n3. إضافة شنطة جديدة...');
    const bag = await prisma.bag.create({
      data: {
        name: 'شنطة هدايا قماشية',
        description: 'شنطة قماشية صديقة للبيئة',
        price: 20.00,
        image: '/images/canvas-bag.jpg',
        stock: 30
      }
    });
    console.log('✅ تم إضافة الشنطة:', bag.name);

    // 4. اختبار إضافة زينة جديدة
    console.log('\n4. إضافة زينة جديدة...');
    const decoration = await prisma.decoration.create({
      data: {
        name: 'شريط ساتان ذهبي',
        price: 15.00,
        image: '/images/gold-ribbon.jpg',
        stock: 200
      }
    });
    console.log('✅ تم إضافة الزينة:', decoration.name);

    // 5. اختبار إنشاء إلهام جديد مع العناصر
    console.log('\n5. إنشاء إلهام جديد...');
    const inspiration = await prisma.inspiration.create({
      data: {
        name: 'هدية عيد ميلاد رومانسية',
        description: 'تشكيلة رومانسية مثالية لعيد الميلاد',
        image: '/images/romantic-gift.jpg',
        rating: 4.8,
        price: 120.00,
        oldPrice: 150.00,
        category: 'رومانسية'
      }
    });
    console.log('✅ تم إنشاء الإلهام:', inspiration.name);

    // 6. ربط الإلهام بالعناصر
    console.log('\n6. ربط الإلهام بالعناصر...');
    
    // ربط بالحلوى
    await prisma.inspirationSweet.create({
      data: {
        inspirationId: inspiration.id,
        sweetId: sweet.id,
        quantity: 2
      }
    });
    console.log('✅ تم ربط الحلوى بالإلهام');

    // ربط بالصندوق
    await prisma.inspirationBoxRelation.create({
      data: {
        inspirationId: inspiration.id,
        boxId: box.id
      }
    });
    console.log('✅ تم ربط الصندوق بالإلهام');

    // ربط بالزينة
    await prisma.inspirationDecorationRelation.create({
      data: {
        inspirationId: inspiration.id,
        decorationId: decoration.id,
        quantity: 3
      }
    });
    console.log('✅ تم ربط الزينة بالإلهام');

    // 7. اختبار استرجاع الإلهام مع جميع العناصر
    console.log('\n7. استرجاع الإلهام مع جميع العناصر...');
    const fullInspiration = await prisma.inspiration.findUnique({
      where: { id: inspiration.id },
      include: {
        sweets: {
          include: {
            sweet: true
          }
        },
        box: {
          include: {
            box: true
          }
        },
        decorations: {
          include: {
            decoration: true
          }
        }
      }
    });

    console.log('\n📋 تفاصيل الإلهام الكاملة:');
    console.log(`اسم الإلهام: ${fullInspiration.name}`);
    console.log(`السعر: ${fullInspiration.price} جنيه`);
    console.log(`الحلويات: ${fullInspiration.sweets.length} عنصر`);
    fullInspiration.sweets.forEach(item => {
      console.log(`  - ${item.sweet.name} (الكمية: ${item.quantity})`);
    });
    if (fullInspiration.box) {
      console.log(`الصندوق: ${fullInspiration.box.box.name}`);
    }
    console.log(`الزينة: ${fullInspiration.decorations.length} عنصر`);
    fullInspiration.decorations.forEach(item => {
      console.log(`  - ${item.decoration.name} (الكمية: ${item.quantity})`);
    });

    console.log('\n🎉 تم اختبار جميع النماذج الجديدة بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewSchema();
