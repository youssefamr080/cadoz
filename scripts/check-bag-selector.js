const fs = require('fs')
const path = require('path')

// قراءة ملف bag-selector.tsx للتحقق من التحديثات
const bagSelectorPath = path.join(__dirname, '..', 'src', 'components', 'gift', 'steps', 'bag-selector.tsx')

try {
  const content = fs.readFileSync(bagSelectorPath, 'utf8')
  
  console.log('🔍 فحص ملف bag-selector.tsx...\n')
  
  // فحص وجود المكونات المطلوبة
  const checks = [
    { name: 'استيراد Tabs', regex: /import.*Tabs.*TabsList.*TabsTrigger.*from.*@\/components\/ui\/tabs/, present: false },
    { name: 'فئات الأحجام', regex: /bagCategories.*=.*صغير.*متوسط.*كبير/, present: false },
    { name: 'دالة getFilteredBags', regex: /getFilteredBags.*=.*category.*===.*small/, present: false },
    { name: 'دالة getBagCountForCategory', regex: /getBagCountForCategory.*=.*categoryId/, present: false },
    { name: 'استخدام Tabs', regex: /<Tabs.*value={category}.*onValueChange={setCategory}/, present: false },
    { name: 'عداد النتائج في Tabs', regex: /getBagCountForCategory\(cat\.id\)/, present: false },
    { name: 'مؤشر النتائج', regex: /مؤشر النتائج/, present: false },
    { name: 'AnimatePresence', regex: /<AnimatePresence.*mode="wait"/, present: false }
  ]
  
  checks.forEach(check => {
    check.present = check.regex.test(content)
  })
  
  console.log('✅ المكونات الموجودة:')
  checks.filter(c => c.present).forEach(check => {
    console.log(`   ✓ ${check.name}`)
  })
  
  if (checks.some(c => !c.present)) {
    console.log('\n❌ المكونات المفقودة:')
    checks.filter(c => !c.present).forEach(check => {
      console.log(`   ✗ ${check.name}`)
    })
  }
  
  // إحصائيات سريعة
  const linesCount = content.split('\n').length
  const hasErrorHandling = /error.*setError/.test(content)
  const hasLoadingStates = /isLoading.*setIsLoading/.test(content)
  
  console.log(`\n📊 إحصائيات الملف:`)
  console.log(`   عدد الأسطر: ${linesCount}`)
  console.log(`   معالجة الأخطاء: ${hasErrorHandling ? '✓' : '✗'}`)
  console.log(`   حالات التحميل: ${hasLoadingStates ? '✓' : '✗'}`)
  
  // فحص التوافق مع box-selector
  const boxSelectorPath = path.join(__dirname, '..', 'src', 'components', 'gift', 'steps', 'box-selector.tsx')
  if (fs.existsSync(boxSelectorPath)) {
    const boxContent = fs.readFileSync(boxSelectorPath, 'utf8')
    const bagHasTabs = /<Tabs.*value={category}/.test(content)
    const boxHasTabs = /<Tabs.*value={category}/.test(boxContent)
    
    console.log(`\n🔄 التوافق مع box-selector:`)
    console.log(`   كلاهما يستخدم Tabs: ${bagHasTabs && boxHasTabs ? '✓' : '✗'}`)
    console.log(`   bag-selector يستخدم Tabs: ${bagHasTabs ? '✓' : '✗'}`)
    console.log(`   box-selector يستخدم Tabs: ${boxHasTabs ? '✓' : '✗'}`)
  }
  
  const allChecksPass = checks.every(c => c.present)
  console.log(`\n🎯 الحالة العامة: ${allChecksPass ? '✅ ممتاز - جميع المكونات موجودة' : '⚠️ يحتاج تحديثات'}`)
  
} catch (error) {
  console.error('❌ خطأ في قراءة الملف:', error.message)
}
