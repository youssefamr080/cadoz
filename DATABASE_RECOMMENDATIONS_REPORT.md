# تقرير نظام حفظ التوصيات في قاعدة البيانات

## نظرة عامة

تم تطوير نظام التوصيات الذكية ليحفظ التوصيات المقترحة للعميل في قاعدة البيانات، مما يضمن أن العميل يرى نفس التوصيات حتى لو فتح حسابه من جهاز مختلف.

## الميزات الجديدة

### 1. حفظ التوصيات في قاعدة البيانات
- **الجدول المستخدم**: `RecommendationHistory`
- **البيانات المحفوظة**:
  - التوصيات المقترحة (كـ JSON)
  - نوع التوصية (personalized, similar, trending, etc.)
  - السياق (المنتج الحالي، الفئة، إلخ)
  - معلومات الأداء (shown, clicked, purchased)
  - تاريخ الإنشاء

### 2. نظام التخزين المؤقت متعدد المستويات
```
المستوى 1: ذاكرة الخادم (5 دقائق)
    ↓
المستوى 2: قاعدة البيانات (ساعة واحدة)
    ↓
المستوى 3: توليد جديد
```

### 3. مصادر التوصيات
- **`memory`**: من ذاكرة الخادم (الأسرع)
- **`database`**: من قاعدة البيانات (محفوظة)
- **`generated`**: مولدة حديثاً

## كيفية عمل النظام

### 1. عند طلب التوصيات:

```typescript
// 1. فحص الذاكرة المؤقتة أولاً
const cached = recommendationsCache.get(cacheKey)
if (cached && !expired) {
  return cached.data // مصدر: memory
}

// 2. فحص قاعدة البيانات
const dbRecommendations = await prisma.recommendationHistory.findFirst({
  where: { 
    customerId: customer.id,
    createdAt: { gte: lastHour }
  }
})
if (dbRecommendations) {
  return dbRecommendations.recommendedItems // مصدر: database
}

// 3. توليد توصيات جديدة
const newRecommendations = generateRecommendations()
await saveToDatabase(newRecommendations) // حفظ في قاعدة البيانات
return newRecommendations // مصدر: generated
```

### 2. عند حفظ التوصيات:

```typescript
await prisma.recommendationHistory.create({
  data: {
    customerId: customer.id,
    recommendationType: type,
    recommendedItems: recommendations, // التوصيات كـ JSON
    context: {
      currentProductId,
      currentCategory,
      behaviorScore,
      viewedProductsCount,
      searchesCount
    },
    shown: true
  }
})
```

### 3. استخدام سلوك العميل:

```typescript
// جلب السلوك المحفوظ
const behaviorData = customer.behavior
const favoriteCategories = behaviorData?.favoriteCategories || {}
const favoriteBrands = behaviorData?.favoriteBrands || {}

// تقييم المنتجات بناءً على السلوك
if (favoriteCategories[product.category]) {
  relevanceScore += favoriteCategories[product.category] * 20
  recommendationType = 'personalized'
  reason = 'بناءً على اهتماماتك'
}
```

## الفوائد

### 1. الاستمرارية عبر الأجهزة
- العميل يرى نفس التوصيات من أي جهاز
- التوصيات محفوظة في قاعدة البيانات وليس فقط في الذاكرة المحلية

### 2. تحسين الأداء
- تخزين مؤقت متعدد المستويات
- تقليل عدد الاستعلامات لقاعدة البيانات
- استجابة سريعة للمستخدم

### 3. الذكاء والتخصيص
- التوصيات تعتمد على سلوك العميل المحفوظ
- تحديث مستمر للتفضيلات
- تحسين جودة التوصيات مع الوقت

### 4. تتبع الأداء
- حفظ معلومات النقرات والمشتريات
- قياس فعالية التوصيات
- تحسين الخوارزمية بناءً على النتائج

## التطبيق في الواجهة

### مؤشرات المصدر
```tsx
// عرض مصدر التوصيات للمطور
{source && (
  <div className="flex items-center gap-1">
    {source === 'memory' && <Zap className="text-blue-500" />}
    {source === 'database' && <Database className="text-green-500" />}
    {source === 'generated' && <RefreshCw className="text-orange-500" />}
    <span>{getSourceLabel(source)}</span>
  </div>
)}
```

### زر التحديث
```tsx
<Button onClick={() => fetchRecommendations(true)}>
  <RefreshCw className={loading ? 'animate-spin' : ''} />
  تحديث
</Button>
```

## الجداول المستخدمة

### 1. RecommendationHistory
```prisma
model RecommendationHistory {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  customerId        String   @db.ObjectId
  recommendationType String
  recommendedItems   Json     // التوصيات المحفوظة
  context           Json     // السياق
  shown             Boolean  @default(false)
  clicked           String[] // المنتجات المنقورة
  purchased         String[] // المنتجات المشتراة
  effectiveness     Float?   // فعالية التوصية
  createdAt         DateTime @default(now())
}
```

### 2. CustomerBehavior
```prisma
model CustomerBehavior {
  id                String @id @default(auto()) @map("_id") @db.ObjectId
  customerId        String @unique @db.ObjectId
  favoriteCategories Json  @default("{}") // الفئات المفضلة
  favoriteBrands    Json  @default("{}") // العلامات التجارية
  // ... المزيد من حقول السلوك
}
```

## الخلاصة

✅ **التوصيات الآن تُحفظ في قاعدة البيانات**
✅ **العميل يرى نفس التوصيات من أي جهاز**
✅ **التوصيات تتحدث مع كل استخدام جديد**
✅ **نظام تخزين مؤقت متقدم للأداء**
✅ **تتبع شامل لسلوك العميل**
✅ **واجهة مستخدم محسنة مع مؤشرات المصدر**

النظام الآن يضمن استمرارية التجربة الشخصية للعميل عبر جميع أجهزته مع الحفاظ على الأداء العالي والتحديث المستمر للتوصيات.
