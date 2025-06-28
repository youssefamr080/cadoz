const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function showRelationData() {
  try {
    await prisma.$connect();
    
    console.log('🔍 بيانات فعلية من Relation Collections:');
    console.log('================================================\n');
    
    // عرض بيانات InspirationBagRelation
    console.log('📋 InspirationBagRelation:');
    const bagRelations = await prisma.inspirationBagRelation.findMany({
      include: {
        inspiration: { select: { name: true } },
        bag: { select: { name: true, price: true } }
      }
    });
    
    if (bagRelations.length > 0) {
      bagRelations.forEach(relation => {
        console.log(`  ├─ الهدية: "${relation.inspiration.name}"`);
        console.log(`  ├─ الشنطة: "${relation.bag.name}" (${relation.bag.price} ج)`);
        console.log(`  └─ ID العلاقة: ${relation.id}\n`);
      });
    } else {
      console.log('  └─ لا توجد بيانات\n');
    }
    
    // عرض بيانات InspirationProduct
    console.log('📋 InspirationProduct:');
    const productRelations = await prisma.inspirationProduct.findMany({
      include: {
        inspiration: { select: { name: true } },
        product: { select: { name: true, price: true } }
      }
    });
    
    if (productRelations.length > 0) {
      productRelations.forEach(relation => {
        console.log(`  ├─ الهدية: "${relation.inspiration.name}"`);
        console.log(`  ├─ المنتج: "${relation.product.name}" (${relation.product.price} ج)`);
        console.log(`  ├─ الكمية: ${relation.quantity}`);
        console.log(`  └─ ID العلاقة: ${relation.id}\n`);
      });
    } else {
      console.log('  └─ لا توجد بيانات\n');
    }
    
    // عرض بيانات InspirationSweet
    console.log('📋 InspirationSweet:');
    const sweetRelations = await prisma.inspirationSweet.findMany({
      include: {
        inspiration: { select: { name: true } },
        sweet: { select: { name: true, price: true } }
      }
    });
    
    if (sweetRelations.length > 0) {
      sweetRelations.forEach(relation => {
        console.log(`  ├─ الهدية: "${relation.inspiration.name}"`);
        console.log(`  ├─ الحلوى: "${relation.sweet.name}" (${relation.sweet.price} ج)`);
        console.log(`  ├─ الكمية: ${relation.quantity}`);
        console.log(`  └─ ID العلاقة: ${relation.id}\n`);
      });
    } else {
      console.log('  └─ لا توجد بيانات\n');
    }
    
    console.log('💡 لماذا Collections منفصلة؟');
    console.log('================================');
    console.log('✅ 1. حفظ بيانات إضافية (الكمية، التخصيص...)');
    console.log('✅ 2. علاقات Many-to-Many بشكل صحيح');
    console.log('✅ 3. فهرسة وبحث أفضل');
    console.log('✅ 4. مرونة في إضافة معلومات مستقبلاً');
    console.log('✅ 5. الامتثال لمعايير قواعد البيانات');
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showRelationData();
