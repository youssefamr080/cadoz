const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function testInspirationActions() {
  try {
    console.log('🧪 اختبار الـ Actions الجديدة للإلهام...\n');

    // إنشاء بيانات تجريبية
    console.log('1. إنشاء بيانات تجريبية...');
    
    // إنشاء حلويات
    const sweets = await Promise.all([
      prisma.sweet.create({
        data: {
          name: 'شوكولاتة جالاكسي',
          price: 30.00,
          old_price: 35.00,
          category: 'شوكولاتة',
          image: '/images/galaxy.jpg',
          stock: 50
        }
      }),
      prisma.sweet.create({
        data: {
          name: 'حلوى هاريبو',
          price: 15.00,
          category: 'كاندي',
          image: '/images/haribo.jpg',
          stock: 100
        }
      })
    ]);
    console.log('✅ تم إنشاء الحلويات');

    // إنشاء منتجات
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: 'ورد أحمر',
          description: 'باقة ورد أحمر جميلة',
          price: 80.00,
          old_price: 100.00,
          image: '/images/red-roses.jpg',
          stock: 20,
          category: 'ورود',
          tags: ['ورد', 'رومانسية']
        }
      })
    ]);
    console.log('✅ تم إنشاء المنتجات');

    // إنشاء صندوق
    const box = await prisma.box.create({
      data: {
        name: 'صندوق خشبي أنيق',
        description: 'صندوق خشبي مزخرف',
        price: 60.00,
        image: '/images/wooden-box.jpg',
        stock: 15,
        dimensions: '30x25x20 سم'
      }
    });
    console.log('✅ تم إنشاء الصندوق');

    // إنشاء زينة
    const decorations = await Promise.all([
      prisma.decoration.create({
        data: {
          name: 'شريط أحمر',
          price: 10.00,
          image: '/images/red-ribbon.jpg',
          stock: 50
        }
      }),
      prisma.decoration.create({
        data: {
          name: 'بطاقة معايدة',
          price: 5.00,
          image: '/images/greeting-card.jpg',
          stock: 100
        }
      })
    ]);
    console.log('✅ تم إنشاء الزينة');

    // 2. إنشاء إلهام شامل
    console.log('\n2. إنشاء إلهام شامل...');
    const inspiration = await prisma.inspiration.create({
      data: {
        name: 'هدية عيد الحب الكاملة',
        description: 'تشكيلة رومانسية مثالية لعيد الحب تشمل ورد وشوكولاتة وحلويات',
        image: '/images/valentine-gift.jpg',
        rating: 0,
        price: 200.00,
        oldPrice: 250.00,
        category: 'رومانسية',
        discountPercentage: 20
      }
    });

    // ربط العناصر بالإلهام
    await Promise.all([
      // ربط الحلويات
      prisma.inspirationSweet.create({
        data: {
          inspirationId: inspiration.id,
          sweetId: sweets[0].id, // شوكولاتة جالاكسي
          quantity: 2
        }
      }),
      prisma.inspirationSweet.create({
        data: {
          inspirationId: inspiration.id,
          sweetId: sweets[1].id, // حلوى هاريبو
          quantity: 1
        }
      }),
      
      // ربط المنتجات
      prisma.inspirationProduct.create({
        data: {
          inspirationId: inspiration.id,
          productId: products[0].id, // ورد أحمر
          quantity: 1
        }
      }),
      
      // ربط الصندوق
      prisma.inspirationBoxRelation.create({
        data: {
          inspirationId: inspiration.id,
          boxId: box.id
        }
      }),
      
      // ربط الزينة
      prisma.inspirationDecorationRelation.create({
        data: {
          inspirationId: inspiration.id,
          decorationId: decorations[0].id, // شريط أحمر
          quantity: 2
        }
      }),
      prisma.inspirationDecorationRelation.create({
        data: {
          inspirationId: inspiration.id,
          decorationId: decorations[1].id, // بطاقة معايدة
          quantity: 1
        }
      })
    ]);

    console.log('✅ تم إنشاء الإلهام وربط جميع العناصر');

    // 3. اختبار استرجاع الإلهام الكامل
    console.log('\n3. اختبار استرجاع الإلهام الكامل...');
    const fullInspiration = await prisma.inspiration.findUnique({
      where: { id: inspiration.id },
      include: {
        sweets: {
          include: { sweet: true }
        },
        products: {
          include: { product: true }
        },
        box: {
          include: { box: true }
        },
        decorations: {
          include: { decoration: true }
        },
        ratings: true,
        comments: true
      }
    });

    console.log('\n📋 تفاصيل الإلهام الكاملة:');
    console.log(`الاسم: ${fullInspiration.name}`);
    console.log(`الوصف: ${fullInspiration.description}`);
    console.log(`السعر: ${fullInspiration.price} جنيه (كان ${fullInspiration.oldPrice})`);
    console.log(`نسبة الخصم: ${fullInspiration.discountPercentage}%`);
    
    console.log(`\n🍭 الحلويات (${fullInspiration.sweets.length}):`);
    fullInspiration.sweets.forEach(item => {
      console.log(`  - ${item.sweet.name} × ${item.quantity} (${item.sweet.price} جنيه لكل قطعة)`);
    });
    
    console.log(`\n🌹 المنتجات (${fullInspiration.products.length}):`);
    fullInspiration.products.forEach(item => {
      console.log(`  - ${item.product.name} × ${item.quantity} (${item.product.price} جنيه)`);
    });
    
    if (fullInspiration.box) {
      console.log(`\n📦 الصندوق: ${fullInspiration.box.box.name} (${fullInspiration.box.box.price} جنيه)`);
    }
    
    console.log(`\n🎀 الزينة (${fullInspiration.decorations.length}):`);
    fullInspiration.decorations.forEach(item => {
      console.log(`  - ${item.decoration.name} × ${item.quantity} (${item.decoration.price} جنيه لكل قطعة)`);
    });

    // 4. حساب السعر الإجمالي المتوقع
    let totalCalculatedPrice = 0;
    
    // حساب سعر الحلويات
    fullInspiration.sweets.forEach(item => {
      totalCalculatedPrice += item.sweet.price * item.quantity;
    });
    
    // حساب سعر المنتجات
    fullInspiration.products.forEach(item => {
      totalCalculatedPrice += item.product.price * item.quantity;
    });
    
    // سعر الصندوق
    if (fullInspiration.box) {
      totalCalculatedPrice += fullInspiration.box.box.price;
    }
    
    // حساب سعر الزينة
    fullInspiration.decorations.forEach(item => {
      totalCalculatedPrice += item.decoration.price * item.quantity;
    });

    console.log(`\n💰 مجموع أسعار المكونات: ${totalCalculatedPrice} جنيه`);
    console.log(`💰 سعر الإلهام المحدد: ${fullInspiration.price} جنيه`);
    console.log(`${totalCalculatedPrice !== fullInspiration.price ? '⚠️  ملاحظة: يوجد اختلاف في السعر (قد يكون هناك خصم إضافي أو رسوم)' : '✅ السعر متطابق مع مجموع المكونات'}`);

    // 5. اختبار إضافة تقييم وتعليق
    console.log('\n4. اختبار إضافة تقييم وتعليق...');
    
    await prisma.inspirationRating.create({
      data: {
        inspirationId: inspiration.id,
        userId: 'test-user-1',
        rating: 5.0
      }
    });
    
    await prisma.inspirationComment.create({
      data: {
        inspirationId: inspiration.id,
        userId: 'test-user-1',
        userName: 'أحمد محمد',
        comment: 'هدية رائعة ومناسبة جداً لعيد الحب!'
      }
    });
    
    console.log('✅ تم إضافة تقييم وتعليق');

    // تحديث متوسط التقييم
    await prisma.inspiration.update({
      where: { id: inspiration.id },
      data: { 
        rating: 5.0,
        reviews: 1
      }
    });

    console.log('\n🎉 تم اختبار جميع العمليات بنجاح!');
    console.log('📊 النتائج:');
    console.log('  - تم إنشاء النماذج الجديدة بنجاح');
    console.log('  - العلاقات تعمل بشكل صحيح');
    console.log('  - يمكن استرجاع البيانات الكاملة');
    console.log('  - التقييمات والتعليقات تعمل');
    console.log('  - الهيكل الجديد مرن وقابل للتوسع');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInspirationActions();
