/**
 * سكريبت اختبار نظام البحث الذكي
 * يختبر المرادفات، التصحيح الإملائي، والبحث الذكي
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// إنشاء بيانات تجريبية للاختبار
async function createTestData() {
  console.log('🔄 إنشاء بيانات تجريبية...');

  const testProducts = [
    {
      name: 'ساعة روليكس ذهبية رجالي',
      description: 'ساعة روليكس فاخرة مصنوعة من الذهب الأصلي للرجال',
      price: 50000,
      category: 'ساعات',
      subCategory: 'ساعات رجالي',
      brand: 'روليكس',
      tags: ['ساعة', 'روليكس', 'ذهبي', 'رجالي', 'فاخر'],
      inStock: true,
      trending: true
    },
    {
      name: 'Apple Watch Series 9',
      description: 'ساعة أبل الذكية الجديدة مع ميزات متقدمة',
      price: 1500,
      category: 'ساعات',
      subCategory: 'ساعات ذكية',
      brand: 'أبل',
      tags: ['ساعة', 'أبل', 'ذكية', 'تقنية'],
      inStock: true,
      rating: 4.8
    },
    {
      name: 'محفظة جلد طبيعي رجالي',
      description: 'محفظة أنيقة من الجلد الطبيعي للرجال',
      price: 200,
      category: 'محافظ',
      subCategory: 'محافظ رجالي',
      brand: 'كوتش',
      tags: ['محفظة', 'جلد', 'رجالي', 'أنيق'],
      inStock: true
    },
    {
      name: 'نظارة شمسية Ray-Ban',
      description: 'نظارة شمسية كلاسيكية من راي بان',
      price: 300,
      category: 'نظارات',
      subCategory: 'نظارات شمسية',
      brand: 'راي بان',
      tags: ['نظارة', 'شمسية', 'كلاسيك'],
      inStock: true
    },
    {
      name: 'عطر شانيل نسائي',
      description: 'عطر شانيل الأصلي للنساء',
      price: 800,
      category: 'عطور',
      subCategory: 'عطور نسائي',
      brand: 'شانيل',
      tags: ['عطر', 'شانيل', 'نسائي', 'أصلي'],
      inStock: true
    }
  ];

  try {
    for (const product of testProducts) {
      await prisma.product.create({
        data: product
      });
    }
    console.log('✅ تم إنشاء بيانات الاختبار بنجاح');
  } catch (error) {
    console.log('⚠️ البيانات موجودة مسبقاً أو حدث خطأ:', error.message);
  }
}

// اختبار البحث الذكي
async function testSmartSearch() {
  console.log('\n🧪 اختبار نظام البحث الذكي...\n');

  const testQueries = [
    {
      query: 'ساعه روليكس',
      description: 'اختبار تصحيح الإملاء + البحث العادي'
    },
    {
      query: 'watch apple',
      description: 'اختبار المرادفات الإنجليزية'
    },
    {
      query: 'محفضة رجالي',
      description: 'اختبار تصحيح الإملاء العربي'
    },
    {
      query: 'glasses',
      description: 'اختبار المرادفات (نظارات)'
    },
    {
      query: 'عضر نسائي',
      description: 'اختبار تصحيح أخطاء شائعة'
    },
    {
      query: 'rolex',
      description: 'اختبار البحث بالعلامة التجارية'
    },
    {
      query: 'ذهبي',
      description: 'اختبار البحث بالألوان'
    }
  ];

  for (const test of testQueries) {
    console.log(`\n🔍 ${test.description}`);
    console.log(`📝 البحث عن: "${test.query}"`);
    
    try {
      const response = await fetch(`http://localhost:3000/api/products/search?q=${encodeURIComponent(test.query)}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ وُجد ${data.data.length} منتج`);
        data.data.slice(0, 2).forEach(product => {
          console.log(`   - ${product.name} (${product.brand})`);
        });
      } else {
        console.log('❌ فشل البحث:', data.error);
      }
    } catch (error) {
      console.log('❌ خطأ في الاتصال:', error.message);
    }
  }
}

// اختبار الاقتراحات
async function testSuggestions() {
  console.log('\n\n💡 اختبار الاقتراحات التلقائية...\n');

  const testQueries = ['سا', 'watch', 'محف', 'نظا'];

  for (const query of testQueries) {
    console.log(`\n🔍 اقتراحات لـ: "${query}"`);
    
    try {
      const response = await fetch(`http://localhost:3000/api/products/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success && data.suggestions.length > 0) {
        console.log(`✅ ${data.suggestions.length} اقتراح:`);
        data.suggestions.forEach(suggestion => {
          console.log(`   - ${suggestion}`);
        });
      } else {
        console.log('ℹ️ لا توجد اقتراحات');
      }
    } catch (error) {
      console.log('❌ خطأ في جلب الاقتراحات:', error.message);
    }
  }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء اختبار نظام البحث الذكي');
  console.log('=====================================');

  await createTestData();
  
  // انتظار قليل للتأكد من حفظ البيانات
  setTimeout(async () => {
    await testSmartSearch();
    await testSuggestions();
    
    console.log('\n\n🎉 انتهى الاختبار!');
    console.log('===========================');
    console.log('📊 لاختبار النظام يدوياً:');
    console.log('   1. افتح http://localhost:3000');
    console.log('   2. جرب البحث عن: "ساعه روليكس"');
    console.log('   3. جرب البحث عن: "watch apple"');
    console.log('   4. جرب كتابة "سا" وانتظر الاقتراحات');
    
    await prisma.$disconnect();
  }, 2000);
}

// تشغيل الاختبارات
runAllTests().catch(console.error);
