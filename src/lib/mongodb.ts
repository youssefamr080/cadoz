import { MongoClient, type Db } from "mongodb"

// تعريف نوع البيانات للمتغير العام
declare global {
  // نستخدم var هنا لأننا نتعامل مع متغير عام في TypeScript
  // We use var here because we're dealing with a global variable in TypeScript
  // eslint-disable-next-line no-var
  var mongoConnection: MongoConnection | undefined
}

/**
 * متغيرات البيئة للاتصال بقاعدة البيانات
 * يجب تعيين MONGODB_URI في ملف .env.local أو في إعدادات Vercel
 */
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || "cadoz"

// التحقق من وجود رابط الاتصال
if (!MONGODB_URI) {
  throw new Error("يرجى تعيين متغير البيئة MONGODB_URI في ملف .env.local أو في إعدادات Vercel")
}

/**
 * كائن عام لتخزين حالة الاتصال
 * يسمح بإعادة استخدام الاتصال بين الطلبات المختلفة
 */
interface MongoConnection {
  client: MongoClient | null
  db: Db | null
  promise: Promise<{ client: MongoClient; db: Db }> | null
}

// تهيئة كائن الاتصال العام
const cached: MongoConnection = global.mongoConnection || {
  client: null,
  db: null,
  promise: null,
}

// تخزين الاتصال في المتغير العام للاستخدام بين الطلبات
if (!global.mongoConnection) {
  global.mongoConnection = cached
}

/**
 * دالة الاتصال بقاعدة البيانات
 * تعيد كائناً يحتوي على client و db
 */
export async function connectToDatabase(): Promise<{
  client: MongoClient
  db: Db
}> {
  // إذا كان الاتصال موجوداً بالفعل، نعيده مباشرة
  if (cached.client && cached.db) {
    console.log("✅ استخدام اتصال MongoDB المخزن مسبقاً")
    return { client: cached.client, db: cached.db }
  }

  // إذا كان هناك وعد اتصال قيد التنفيذ، ننتظر اكتماله
  if (!cached.promise) {
    console.log("🔌 إنشاء اتصال جديد بـ MongoDB...")
    console.log(`🔍 قاعدة البيانات المستهدفة: ${MONGODB_DB}`)

    // خيارات الاتصال
    const opts = {
      maxPoolSize: 10, // الحد الأقصى لعدد الاتصالات في المجمع
      serverSelectionTimeoutMS: 10000, // مهلة اختيار الخادم
      socketTimeoutMS: 45000, // مهلة انتهاء الاتصال
    }

    // إنشاء وعد الاتصال
    cached.promise = new Promise(async (resolve, reject) => {
      try {
        // إنشاء عميل MongoDB جديد
        const client = new MongoClient(MONGODB_URI as string, opts)

        // الاتصال بالخادم
        await client.connect()
        console.log("✅ تم الاتصال بنجاح بخادم MongoDB")

        // الحصول على قاعدة البيانات
        const db = client.db(MONGODB_DB)

        // تخزين الاتصال في الذاكرة المؤقتة
        cached.client = client
        cached.db = db

        // التحقق من الاتصال عن طريق استعلام بسيط
        await db.command({ ping: 1 })
        console.log("✅ تم التحقق من الاتصال بنجاح (ping)")

        // إرجاع كائن الاتصال
        resolve({ client, db })
      } catch (error) {
        // معالجة أخطاء الاتصال
        console.error("❌ فشل الاتصال بقاعدة البيانات MongoDB:", error)
        reject(error)
      }
    })
  } else {
    console.log("⏳ انتظار اكتمال اتصال MongoDB الحالي...")
  }

  try {
    // انتظار اكتمال وعد الاتصال
    const connection = await cached.promise
    return connection
  } catch (error) {
    // إعادة تعيين الوعد في حالة الفشل للسماح بمحاولات مستقبلية
    cached.promise = null
    throw error
  }
}

/**
 * دالة لإغلاق الاتصال بقاعدة البيانات
 * مفيدة عند إيقاف التطبيق أو إعادة تشغيله
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.client) {
    console.log("🔌 إغلاق اتصال MongoDB...")
    await cached.client.close()
    cached.client = null
    cached.db = null
    cached.promise = null
    console.log("✅ تم إغلاق اتصال MongoDB بنجاح")
  }
}

/**
 * دالة مساعدة للتحقق من حالة الاتصال
 * تعيد معلومات عن حالة الاتصال الحالية
 */
export function getConnectionStatus() {
  return {
    isConnected: !!cached.client,
    hasDatabase: !!cached.db,
    databaseName: cached.db?.databaseName || null,
    hasPendingConnection: !!cached.promise,
  }
}

// تصدير الدالة الرئيسية كافتراضية
export default connectToDatabase
