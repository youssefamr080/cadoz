// مثال على كيفية استخدام OrderItem الجديد للأنواع المختلفة

// 1. منتج عادي
const regularProduct = {
  name: "ساعة رولكس",
  image: "/images/rolex.jpg", 
  price: 5000.00,
  quantity: 1,
  itemType: "product",
  productId: "product_id_123",
  inspirationId: null,
  customGiftData: null,
  giftMessage: null,
  giftRecipient: null
}

// 2. هدية جاهزة (Inspiration)
const readyMadeGift = {
  name: "هدية عيد الحب الكاملة",
  image: "/images/valentine-gift.jpg",
  price: 200.00,
  quantity: 1,
  itemType: "inspiration", 
  productId: null,
  inspirationId: "inspiration_id_456",
  customGiftData: null,
  giftMessage: "كل عام وأنتِ بخير حبيبتي",
  giftRecipient: "فاطمة أحمد"
}

// 3. هدية مخصصة (Custom Gift)
const customGift = {
  name: "هدية مخصصة لأمي",
  image: "/images/custom-gift-preview.jpg",
  price: 350.00,
  quantity: 1,
  itemType: "custom_gift",
  productId: null,
  inspirationId: null,
  customGiftData: {
    products: [
      { id: "product_1", name: "عطر شانيل", quantity: 1, price: 150.00 }
    ],
    sweets: [
      { id: "sweet_1", name: "شوكولاتة جالاكسي", quantity: 3, price: 30.00 },
      { id: "sweet_2", name: "حلوى هاريبو", quantity: 2, price: 15.00 }
    ],
    box: {
      id: "box_1", name: "صندوق خشبي أنيق", price: 60.00
    },
    bag: null,
    decorations: [
      { id: "decoration_1", name: "شريط أحمر", quantity: 2, price: 10.00 },
      { id: "decoration_2", name: "بطاقة معايدة", quantity: 1, price: 5.00 }
    ]
  },
  giftMessage: "أحبك أمي الغالية",
  giftRecipient: "أمي الحبيبة"
}

// 4. طلب مختلط (منتجات + هدايا جاهزة + هدايا مخصصة)
const mixedOrder = {
  customerId: "customer_123",
  items: [
    regularProduct,      // منتج عادي
    readyMadeGift,      // هدية جاهزة  
    customGift,         // هدية مخصصة
    {
      // منتج آخر عادي
      name: "محفظة لويس فيتون",
      image: "/images/lv-wallet.jpg",
      price: 800.00,
      quantity: 1,
      itemType: "product",
      productId: "product_id_789"
    }
  ],
  status: "PENDING",
  source: "WEBSITE"
}

console.log("✅ نظام الطلبات يدعم جميع الأنواع:");
console.log("1. ✅ منتجات عادية");
console.log("2. ✅ هدايا جاهزة (Inspiration)");  
console.log("3. ✅ هدايا مخصصة (Custom Gift)");
console.log("4. ✅ خليط من جميع الأنواع في طلب واحد");
