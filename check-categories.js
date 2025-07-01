const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 فحص الفئات الحالية في قاعدة البيانات...\n');
    
    // فحص المنتجات
    const products = await prisma.product.findMany({
      select: { category: true, subCategory: true },
      take: 10
    });
    
    console.log('📦 عينة من فئات المنتجات:');
    const productCategories = new Set();
    const productSubCategories = new Set();
    
    products.forEach(p => {
      if (p.category) productCategories.add(p.category);
      if (p.subCategory) productSubCategories.add(p.subCategory);
    });
    
    console.log('الفئات الرئيسية:', Array.from(productCategories));
    console.log('الفئات الفرعية:', Array.from(productSubCategories));
    
    // فحص الحلويات
    const sweets = await prisma.sweet.findMany({
      select: { category: true },
      take: 10
    });
    
    console.log('\n🍬 عينة من فئات الحلويات:');
    const sweetCategories = new Set();
    
    sweets.forEach(s => {
      if (s.category) sweetCategories.add(s.category);
    });
    
    console.log('فئات الحلويات:', Array.from(sweetCategories));
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
