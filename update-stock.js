const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function updateStock() {
  try {
    console.log('🔄 تحديث المخزون للصناديق والشنط...\n');
    
    // تحديث مخزون الصناديق
    const boxesUpdate = await prisma.box.updateMany({
      where: { stock: 0 },
      data: { stock: 15 } // إضافة 15 قطعة لكل صندوق
    });
    
    console.log(`✅ تم تحديث ${boxesUpdate.count} صندوق`);
    
    // تحديث مخزون الشنط
    const bagsUpdate = await prisma.bag.updateMany({
      where: { stock: 0 },
      data: { stock: 20 } // إضافة 20 قطعة لكل شنطة
    });
    
    console.log(`✅ تم تحديث ${bagsUpdate.count} شنطة`);
    
    console.log('\n📊 المخزون الجديد:');
    
    // عرض المخزون المحدث
    const boxes = await prisma.box.findMany();
    console.log('\n📦 الصناديق:');
    boxes.forEach((box, index) => {
      console.log(`   ${index + 1}. ${box.name} - المخزون: ${box.stock}`);
    });
    
    const bags = await prisma.bag.findMany();
    console.log('\n👜 الشنط:');
    bags.forEach((bag, index) => {
      console.log(`   ${index + 1}. ${bag.name} - المخزون: ${bag.stock}`);
    });
    
    console.log('\n🎉 تم تحديث المخزون بنجاح! الآن ستظهر جميع البوكسات والشنط في خطوات إعداد الهدية.');
    
  } catch (error) {
    console.error('❌ خطأ في تحديث المخزون:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStock();
