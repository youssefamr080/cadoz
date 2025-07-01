const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function checkGiftData() {
  try {
    console.log('=== فحص بيانات الهدايا ===\n');
    
    // فحص الصناديق
    const boxes = await prisma.box.findMany();
    console.log(`📦 عدد الصناديق: ${boxes.length}`);
    if (boxes.length === 0) {
      console.log('❌ لا توجد صناديق في قاعدة البيانات!');
    } else {
      console.log('✅ الصناديق موجودة');
      boxes.forEach((box, index) => {
        console.log(`   ${index + 1}. ${box.name} - ${box.price} جنيه - المخزون: ${box.stock}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // فحص الحلويات
    const sweets = await prisma.sweet.findMany();
    console.log(`🍭 عدد الحلويات: ${sweets.length}`);
    if (sweets.length === 0) {
      console.log('❌ لا توجد حلويات في قاعدة البيانات!');
    } else {
      console.log('✅ الحلويات موجودة');
      sweets.forEach((sweet, index) => {
        console.log(`   ${index + 1}. ${sweet.name} - ${sweet.price} جنيه - المخزون: ${sweet.stock}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // فحص الشنط
    const bags = await prisma.bag.findMany();
    console.log(`👜 عدد الشنط: ${bags.length}`);
    if (bags.length === 0) {
      console.log('❌ لا توجد شنط في قاعدة البيانات!');
    } else {
      console.log('✅ الشنط موجودة');
      bags.forEach((bag, index) => {
        console.log(`   ${index + 1}. ${bag.name} - ${bag.price} جنيه - المخزون: ${bag.stock}`);
      });
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // التحقق من البيانات المتاحة (stock > 0)
    const availableBoxes = await prisma.box.findMany({ where: { stock: { gt: 0 } } });
    const availableSweets = await prisma.sweet.findMany({ where: { stock: { gt: 0 } } });
    const availableBags = await prisma.bag.findMany({ where: { stock: { gt: 0 } } });
    
    console.log('📊 البيانات المتاحة (في المخزون):');
    console.log(`   صناديق متاحة: ${availableBoxes.length}`);
    console.log(`   حلويات متاحة: ${availableSweets.length}`);
    console.log(`   شنط متاحة: ${availableBags.length}`);
    
    if (availableBoxes.length === 0 && availableSweets.length === 0 && availableBags.length === 0) {
      console.log('\n❌ مشكلة: لا توجد أي عناصر متاحة في المخزون!');
      console.log('💡 الحل: إضافة بيانات جديدة أو تحديث المخزون للعناصر الموجودة');
    }
    
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGiftData();
