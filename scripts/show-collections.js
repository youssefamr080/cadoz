const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function showCollections() {
  try {
    await prisma.$connect();
    console.log('🗂️  Collections موجودة في قاعدة البيانات:');
    console.log('==========================================');
    
    const result = await prisma.$runCommandRaw({ listCollections: 1 });
    
    result.cursor.firstBatch.forEach(col => {
      if (col.name.includes('Relation') || col.name.includes('Inspiration')) {
        console.log(`📋 ${col.name} (Relation)`);
      } else {
        console.log(`📊 ${col.name}`);
      }
    });
    
    console.log('\n🔍 شرح Relation Collections:');
    console.log('==========================================');
    console.log('InspirationProduct → ربط الهدايا بالمنتجات (مع الكمية)');
    console.log('InspirationSweet → ربط الهدايا بالحلويات (مع الكمية)');
    console.log('InspirationBoxRelation → ربط الهدايا بالصناديق');
    console.log('InspirationBagRelation → ربط الهدايا بالشنط');
    console.log('InspirationDecorationRelation → ربط الهدايا بالزينة (مع الكمية)');
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showCollections();
