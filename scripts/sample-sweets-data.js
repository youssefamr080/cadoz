// إنشاء بيانات تجريبية للحلويات مع التصنيفات
console.log('=== إنشاء بيانات تجريبية للحلويات ===\n')

const chocolateItems = [
  { name: 'شوكولاتة كيت كات', category: 'شوكولاتة', price: 15 },
  { name: 'شوكولاتة سنيكرز', category: 'شوكولاتة', price: 18 },
  { name: 'شوكولاتة مارس', category: 'شوكولاتة', price: 16 },
  { name: 'شوكولاتة تويكس', category: 'شوكولاتة', price: 17 },
  { name: 'شوكولاتة كادبوري', category: 'شوكولاتة', price: 25 },
  { name: 'شوكولاتة جالاكسي', category: 'شوكولاتة', price: 22 },
]

const candyItems = [
  { name: 'كاندي هاريبو', category: 'كاندي', price: 12 },
  { name: 'حلوى جيلي بيرز', category: 'كاندي', price: 10 },
  { name: 'مصاص ملون', category: 'كاندي', price: 8 },
  { name: 'علكة منتوس', category: 'كاندي', price: 6 },
  { name: 'سكاكر تك تاك', category: 'كاندي', price: 5 },
  { name: 'حلوى قوس قزح', category: 'كاندي', price: 14 },
]

const chipsItems = [
  { name: 'شيبس ليز كلاسيك', category: 'شيبس', price: 20 },
  { name: 'دوريتوس نكهة الجبن', category: 'شيبس', price: 25 },
  { name: 'تشيتوس حار', category: 'شيبس', price: 18 },
  { name: 'برينجلز أصلي', category: 'شيبس', price: 30 },
  { name: 'شيبس بطاطس مشوية', category: 'شيبس', price: 22 },
  { name: 'مقرمشات الذرة', category: 'شيبس', price: 16 },
]

console.log('🍫 شوكولاتة:')
chocolateItems.forEach(item => {
  console.log(`  - ${item.name} | ${item.price} جنيه`)
})

console.log('\n🍭 كاندي:')
candyItems.forEach(item => {
  console.log(`  - ${item.name} | ${item.price} جنيه`)
})

console.log('\n🥨 شيبس:')
chipsItems.forEach(item => {
  console.log(`  - ${item.name} | ${item.price} جنيه`)
})

console.log(`\n📊 الإحصائيات:`)
console.log(`   شوكولاتة: ${chocolateItems.length} منتج`)
console.log(`   كاندي: ${candyItems.length} منتج`)
console.log(`   شيبس: ${chipsItems.length} منتج`)
console.log(`   إجمالي: ${chocolateItems.length + candyItems.length + chipsItems.length} منتج`)

console.log('\n✅ البيانات التجريبية جاهزة!')
console.log('💡 يمكن إضافة هذه البيانات إلى قاعدة البيانات عبر الواجهة الإدارية')
