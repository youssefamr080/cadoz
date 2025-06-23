# Cadoz - متجر إلكتروني متكامل

## 🚀 المميزات الرئيسية

- نظام تقييمات ذكي مع دعم للصور والتعليقات
- نظام توصيات ذكي يعتمد على:
  - المنتجات المشابهة
  - المنتجات التي اشتراها المشترون
  - المنتجات التي تمت مشاهدتها مؤخراً
- واجهة مستخدم عربية متجاوبة
- دعم كامل للغة العربية (RTL)
- نظام بحث متقدم
- سلة مشتريات ذكية
- نظام إدارة المخزون
- نظام إدارة الطلبات
- لوحة تحكم للمشرفين

## 🛠️ التقنيات المستخدمة

- Next.js 13+ (App Router)
- TypeScript
- MongoDB
- Prisma ORM
- Tailwind CSS
- Swiper.js
- React Icons
- React Toastify

## 📦 المتطلبات

- Node.js 16+
- MongoDB Atlas
- npm أو yarn

## 🔧 التثبيت

1. استنساخ المشروع:
```bash
git clone https://github.com/yourusername/cadoz.git
cd cadoz
```

2. تثبيت الاعتمادات:
```bash
npm install
# أو
yarn install
```

3. إنشاء ملف البيئة:
```bash
cp .env.example .env.local
```

4. تحديث متغيرات البيئة في ملف `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

5. تشغيل المشروع:
```bash
npm run dev
# أو
yarn dev
```

## 📝 هيكل المشروع

```
src/
├── app/
│   ├── api/
│   │   ├── products/
│   │   ├── ratings/
│   │   └── recommendations/
│   ├── product/
│   │   └── [productId]/
│   └── ...
├── components/
│   ├── layout/
│   ├── product/
│   └── ui/
├── lib/
│   └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   └── generated/
└── ...
```

## 🔒 الأمان

- حماية نقاط النهاية API
- التحقق من صحة المدخلات
- معالجة الأخطاء
- حماية البيانات الحساسة

## 📱 التوافق

- متوافق مع جميع المتصفحات الحديثة
- تصميم متجاوب يعمل على جميع الأجهزة
- دعم كامل للغة العربية (RTL)

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add some amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للمزيد من التفاصيل.

## 👥 الفريق

- [اسمك](https://github.com/yourusername) - المطور الرئيسي

## 🙏 الشكر

- شكر خاص لجميع المساهمين
- شكر لـ [Next.js](https://nextjs.org/)
- شكر لـ [MongoDB](https://www.mongodb.com/)
- شكر لـ [Tailwind CSS](https://tailwindcss.com/)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.