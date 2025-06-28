const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function testCompleteSystem() {
  try {
    console.log('🚀 اختبار النظام الجديد بالكامل...\n');

    // تنظيف البيانات السابقة للاختبار
    console.log('🧹 تنظيف البيانات السابقة...');
    try {
      await prisma.customer.deleteMany({
        where: { phone: '01234567891' }
      });
    } catch (e) {
      // تجاهل الخطأ إذا لم توجد البيانات
    }

    // 1. إنشاء بيانات تجريبية
    console.log('1. إنشاء بيانات تجريبية...');
    
    // إنشاء عميل
    const customer = await prisma.customer.create({
      data: {
        name: 'أحمد محمد',
        phone: '01234567891', // رقم مختلف
        email: 'ahmed.test@example.com',
        password: 'hashed_password_here'
      }
    });
    console.log('✅ تم إنشاء العميل');    // إنشاء منتجات
    const product = await prisma.product.create({
      data: {
        name: 'ساعة ذكية',
        description: 'ساعة ذكية عالية الجودة',
        price: 1500.00,
        old_price: 1800.00,
        image: '/images/smart-watch.jpg',
        images: [],
        stock: 10,
        category: 'إلكترونيات',
        tags: ['ساعة', 'ذكية', 'تقنية'],
        occasion: [],
        colors: []
      }
    });

    // إنشاء حلويات
    const sweet = await prisma.sweet.create({
      data: {
        name: 'شوكولاتة لينت',
        price: 45.00,
        old_price: 55.00,
        category: 'شوكولاتة',
        image: '/images/lindt.jpg',
        stock: 50
      }
    });

    // إنشاء صندوق
    const box = await prisma.box.create({
      data: {
        name: 'صندوق ملكي ذهبي',
        description: 'صندوق فاخر بتصميم ملكي',
        price: 120.00,
        image: '/images/royal-box.jpg',
        stock: 15,
        dimensions: '35x30x25 سم'
      }
    });

    // إنشاء شنطة
    const bag = await prisma.bag.create({
      data: {
        name: 'شنطة ساتان فضية',
        description: 'شنطة أنيقة من الساتان',
        price: 35.00,
        image: '/images/satin-bag.jpg',
        stock: 25
      }
    });

    // إنشاء زينة
    const decoration = await prisma.decoration.create({
      data: {
        name: 'وردة حمراء صناعية',
        price: 15.00,
        image: '/images/red-rose.jpg',
        stock: 100
      }
    });

    console.log('✅ تم إنشاء جميع العناصر الأساسية');

    // 2. إنشاء هدية جاهزة (Inspiration)
    console.log('\n2. إنشاء هدية جاهزة...');
    const inspiration = await prisma.inspiration.create({
      data: {
        name: 'هدية الخطوبة الكاملة',
        description: 'تشكيلة فاخرة للخطوبة تشمل ساعة وحلويات مع تغليف ملكي',
        image: '/images/engagement-gift.jpg',
        rating: 0,
        price: 1800.00,
        oldPrice: 2200.00,
        discountPercentage: 18,
        category: 'خطوبة'
      }
    });

    // ربط العناصر بالهدية الجاهزة
    await Promise.all([
      // ربط المنتج
      prisma.inspirationProduct.create({
        data: {
          inspirationId: inspiration.id,
          productId: product.id,
          quantity: 1
        }
      }),
      // ربط الحلوى
      prisma.inspirationSweet.create({
        data: {
          inspirationId: inspiration.id,
          sweetId: sweet.id,
          quantity: 3
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
          decorationId: decoration.id,
          quantity: 5
        }
      })
    ]);

    console.log('✅ تم إنشاء الهدية الجاهزة وربط العناصر');

    // 3. حفظ عناصر في المفضلة
    console.log('\n3. حفظ عناصر في المفضلة...');
    await Promise.all([
      // حفظ منتج
      prisma.savedItem.create({
        data: {
          userId: customer.id,
          itemType: 'product',
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        }
      }),
      // حفظ هدية جاهزة
      prisma.savedItem.create({
        data: {
          userId: customer.id,
          itemType: 'inspiration',
          inspirationId: inspiration.id,
          name: inspiration.name,
          price: inspiration.price,
          image: inspiration.image
        }
      }),
      // حفظ حلوى
      prisma.savedItem.create({
        data: {
          userId: customer.id,
          itemType: 'sweet',
          sweetId: sweet.id,
          name: sweet.name,
          price: sweet.price,
          image: sweet.image
        }
      })
    ]);

    console.log('✅ تم حفظ العناصر في المفضلة');

    // 4. إنشاء طلب مختلط
    console.log('\n4. إنشاء طلب مختلط...');
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        status: 'PENDING',
        source: 'WEBSITE'
      }
    });

    // إضافة عناصر مختلفة للطلب
    await Promise.all([
      // 1. منتج عادي
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1,
          itemType: 'product',
          productId: product.id
        }
      }),
      // 2. هدية جاهزة
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          name: inspiration.name,
          image: inspiration.image,
          price: inspiration.price,
          quantity: 1,
          itemType: 'inspiration',
          inspirationId: inspiration.id,
          giftMessage: 'مبروك الخطوبة يا غالي',
          giftRecipient: 'العريس الجديد'
        }
      }),
      // 3. هدية مخصصة
      prisma.orderItem.create({
        data: {
          orderId: order.id,
          name: 'هدية مخصصة للأم',
          image: '/images/custom-mother-gift.jpg',
          price: 280.00,
          quantity: 1,
          itemType: 'custom_gift',
          customGiftData: {
            sweets: [
              { id: sweet.id, name: sweet.name, quantity: 2, price: sweet.price }
            ],
            bag: {
              id: bag.id, name: bag.name, price: bag.price
            },
            decorations: [
              { id: decoration.id, name: decoration.name, quantity: 3, price: decoration.price }
            ]
          },
          giftMessage: 'أحبك أمي الغالية',
          giftRecipient: 'أمي الحبيبة'
        }
      })
    ]);

    // إضافة معلومات الشحن
    await prisma.shippingInfo.create({
      data: {
        order: { connect: { id: order.id } },
        governorate: 'القاهرة',
        address: 'شارع التحرير، وسط البلد',
        phone: customer.phone,
        notes: 'يرجى الاتصال قبل التسليم'
      }
    });

    // إضافة معلومات الدفع
    await prisma.paymentInfo.create({
      data: {
        order: { connect: { id: order.id } },
        method: 'CASH_ON_DELIVERY',
        status: 'PENDING'
      }
    });

    // حساب الإجماليات
    const subtotal = 1500 + 1800 + 280; // مجموع أسعار العناصر
    const shippingFees = 50;
    const total = subtotal + shippingFees;

    await prisma.orderTotals.create({
      data: {
        order: { connect: { id: order.id } },
        subtotal,
        shippingFees,
        discount: 0,
        tax: 0,
        total
      }
    });

    console.log('✅ تم إنشاء الطلب المختلط بنجاح');

    // 5. اختبار استرجاع البيانات
    console.log('\n5. اختبار استرجاع البيانات...');

    // استرجاع الهدية الجاهزة مع جميع العلاقات
    const fullInspiration = await prisma.inspiration.findUnique({
      where: { id: inspiration.id },
      include: {
        products: { include: { product: true } },
        sweets: { include: { sweet: true } },
        box: { include: { box: true } },
        decorations: { include: { decoration: true } }
      }
    });

    // استرجاع الطلب مع جميع التفاصيل
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {        items: true,
        shipping: true,
        payment: true,
        totals: true,
        customer: true
      }
    });

    console.log('✅ تم استرجاع جميع البيانات بنجاح');

    // 6. عرض النتائج
    console.log('\n📊 نتائج الاختبار:');
    console.log('==========================================');
    
    console.log(`\n🎁 الهدية الجاهزة: ${fullInspiration.name}`);
    console.log(`السعر: ${fullInspiration.price} جنيه`);
    console.log(`المنتجات: ${fullInspiration.products.length}`);
    console.log(`الحلويات: ${fullInspiration.sweets.length}`);
    console.log(`الصندوق: ${fullInspiration.box ? 'موجود' : 'غير موجود'}`);
    console.log(`الزينة: ${fullInspiration.decorations.length}`);

    console.log(`\n🛒 الطلب رقم: ${fullOrder.id}`);
    console.log(`العميل: ${fullOrder.customer.name}`);
    console.log(`عدد العناصر: ${fullOrder.items.length}`);
    console.log(`الإجمالي: ${fullOrder.totals.total} جنيه`);
    console.log(`حالة الطلب: ${fullOrder.status}`);
    console.log(`طريقة الدفع: ${fullOrder.payment.method}`);

    console.log('\n🎉 تم اختبار النظام بالكامل بنجاح!');
    console.log('==========================================');
    console.log('✅ نظام الطلبات المختلطة يعمل');
    console.log('✅ الهدايا الجاهزة تعمل');
    console.log('✅ الهدايا المخصصة تعمل');
    console.log('✅ العناصر المحفوظة تعمل');
    console.log('✅ جميع العلاقات سليمة');

  } catch (error) {
    console.error('❌ خطأ في النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteSystem();
