// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('يرجى إضافة رابط اتصال MongoDB في ملف .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // في بيئة التطوير، استخدم متغير عام لتخزين الاتصال
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // في بيئة الإنتاج، إنشاء اتصال جديد
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;