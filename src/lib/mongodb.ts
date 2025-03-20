// lib/mongodb.ts

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cadoz';
const MONGODB_DB = process.env.MONGODB_DB || 'cadoz';

// كائن لتخزين اتصال قاعدة البيانات بين الطلبات
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  // إذا كان الاتصال مخزنًا، نعيده مباشرة
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // إنشاء اتصال جديد
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  // تخزين الاتصال للاستخدام المستقبلي
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default connectToDatabase;