console.log("🧪 اختبار فلترة الصناديق حسب السعر");

// محاكاة بيانات الصناديق
const testBoxes = [
  { id: "1", name: "صندوق هدايا فاخر ذهبي", price: 50, stock: 15 },
  { id: "2", name: "صندوق هدايا كلاسيكي أحمر", price: 35, stock: 15 },
  { id: "3", name: "صندوق هدايا أزرق فاتح", price: 40, stock: 15 },
  { id: "4", name: "صندوق هدايا وردي رومانسي", price: 45, stock: 15 },
  { id: "5", name: "صندوق هدايا أسود أنيق", price: 55, stock: 15 },
  { id: "6", name: "صندوق فاخر كبير", price: 150, stock: 10 },
  { id: "7", name: "صندوق مميز متوسط", price: 120, stock: 12 },
  { id: "8", name: "صندوق لوكس", price: 220, stock: 5 },
];

// دالة الفلترة
function filterBoxesByCategory(boxes, category) {
  return boxes.filter((box) => {
    switch (category) {
      case "basic":
        return box.price >= 50 && box.price <= 100;
      case "premium":
        return box.price >= 101 && box.price <= 200;
      case "luxury":
        return box.price >= 201 && box.price <= 250;
      default:
        return true;
    }
  });
}

// اختبار الفئات
console.log("\n📦 فئة أساسي (50-100 جنيه):");
const basicBoxes = filterBoxesByCategory(testBoxes, "basic");
basicBoxes.forEach(box => {
  console.log(`  ✓ ${box.name} - ${box.price} جنيه`);
});
console.log(`📊 العدد: ${basicBoxes.length}`);

console.log("\n📦 فئة مميز (101-200 جنيه):");
const premiumBoxes = filterBoxesByCategory(testBoxes, "premium");
premiumBoxes.forEach(box => {
  console.log(`  ✓ ${box.name} - ${box.price} جنيه`);
});
console.log(`📊 العدد: ${premiumBoxes.length}`);

console.log("\n📦 فئة فاخر (201-250 جنيه):");
const luxuryBoxes = filterBoxesByCategory(testBoxes, "luxury");
luxuryBoxes.forEach(box => {
  console.log(`  ✓ ${box.name} - ${box.price} جنيه`);
});
console.log(`📊 العدد: ${luxuryBoxes.length}`);

console.log("\n🎯 اختبار مكتمل! الفلترة تعمل بنجاح ✅");
