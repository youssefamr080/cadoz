/**
 * خدمة التخزين المؤقت المتقدمة باستخدام IndexedDB
 * تستخدم لتخزين نتائج البحث والفلاتر والمنتجات المشاهدة مؤخرًا
 */

import { Product } from "@/types/product";

const DB_NAME = 'cadoz-cache';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const SEARCH_RESULTS_STORE = 'search-results';
const FILTERS_STORE = 'filters';
const RECENTLY_VIEWED_STORE = 'recently-viewed';

export type SearchParams = {
  category?: string;
  subCategory?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  limit?: number;
  page?: number;
  color?: string;
  size?: string;
  inStock?: boolean;
  searchQuery?: string;
};

export type CachedSearch = {
  params: SearchParams;
  results: Product[];
  total: number;
  timestamp: number;
};

export type SavedFilter = {
  id: string;
  name: string;
  params: SearchParams;
  timestamp: number;
  userId?: string;
};

// مدة صلاحية التخزين المؤقت - 30 دقيقة
const CACHE_EXPIRATION = 30 * 60 * 1000;

/**
 * فتح اتصال بقاعدة البيانات
 */
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject('متصفحك لا يدعم IndexedDB');
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(`فشل في فتح قاعدة البيانات: ${(event.target as IDBRequest).error}`);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;

      // إنشاء مخازن البيانات إذا لم تكن موجودة
      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        const productStore = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
        productStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(SEARCH_RESULTS_STORE)) {
        const searchStore = db.createObjectStore(SEARCH_RESULTS_STORE, { keyPath: 'searchKey' });
        searchStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(FILTERS_STORE)) {
        const filtersStore = db.createObjectStore(FILTERS_STORE, { keyPath: 'id' });
        filtersStore.createIndex('userId', 'userId', { unique: false });
        filtersStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(RECENTLY_VIEWED_STORE)) {
        const recentlyViewedStore = db.createObjectStore(RECENTLY_VIEWED_STORE, { keyPath: 'id' });
        recentlyViewedStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBRequest).result as IDBDatabase;
      resolve(db);
    };
  });
};

/**
 * توليد مفتاح فريد للبحث بناءً على المعلمات
 */
const generateSearchKey = (params: SearchParams): string => {
  return JSON.stringify(params);
};

/**
 * تخزين نتائج البحث في التخزين المؤقت
 */
export const cacheSearchResults = async (params: SearchParams, results: Product[], total: number): Promise<void> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(SEARCH_RESULTS_STORE, 'readwrite');
    const store = tx.objectStore(SEARCH_RESULTS_STORE);

    const searchKey = generateSearchKey(params);
    const cachedSearch: CachedSearch = {
      params,
      results,
      total,
      timestamp: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put({ searchKey, ...cachedSearch });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('تم تخزين نتائج البحث في التخزين المؤقت', searchKey);
  } catch (error) {
    console.error('فشل في تخزين نتائج البحث:', error);
  }
};

/**
 * الحصول على نتائج البحث من التخزين المؤقت
 */
export const getCachedSearchResults = async (params: SearchParams): Promise<CachedSearch | null> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(SEARCH_RESULTS_STORE, 'readonly');
    const store = tx.objectStore(SEARCH_RESULTS_STORE);

    const searchKey = generateSearchKey(params);
    const result = await new Promise<CachedSearch | null>((resolve, reject) => {
      const request = store.get(searchKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (result && (Date.now() - result.timestamp) < CACHE_EXPIRATION) {
      console.log('تم استرجاع نتائج البحث من التخزين المؤقت', searchKey);
      return result;
    } else if (result) {
      console.log('نتائج البحث منتهية الصلاحية', searchKey);
      // حذف النتائج منتهية الصلاحية
      clearExpiredCache();
    }

    return null;
  } catch (error) {
    console.error('فشل في الحصول على نتائج البحث المخزنة:', error);
    return null;
  }
};

/**
 * تخزين منتج مشاهد مؤخرًا
 */
export const addToRecentlyViewed = async (product: Product): Promise<void> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(RECENTLY_VIEWED_STORE, 'readwrite');
    const store = tx.objectStore(RECENTLY_VIEWED_STORE);

    const recentlyViewedItem = {
      ...product,
      timestamp: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(recentlyViewedItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // الحصول على جميع المنتجات المشاهدة مؤخرًا والاحتفاظ بأحدث 20 فقط
    await trimRecentlyViewed(20);
  } catch (error) {
    console.error('فشل في إضافة منتج إلى المشاهد مؤخرًا:', error);
  }
};

/**
 * الحصول على المنتجات المشاهدة مؤخرًا
 */
export const getRecentlyViewedProducts = async (limit = 10): Promise<Product[]> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(RECENTLY_VIEWED_STORE, 'readonly');
    const store = tx.objectStore(RECENTLY_VIEWED_STORE);
    const index = store.index('timestamp');

    const result = await new Promise<Product[]>((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const products: Product[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor && products.length < limit) {
          products.push(cursor.value);
          cursor.continue();
        } else {
          resolve(products);
        }
      };

      request.onerror = () => reject(request.error);
    });

    return result;
  } catch (error) {
    console.error('فشل في الحصول على المنتجات المشاهدة مؤخرًا:', error);
    return [];
  }
};

/**
 * تقليص قائمة المنتجات المشاهدة مؤخرًا للاحتفاظ بالعدد المحدد فقط
 */
const trimRecentlyViewed = async (limit: number): Promise<void> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(RECENTLY_VIEWED_STORE, 'readwrite');
    const store = tx.objectStore(RECENTLY_VIEWED_STORE);
    const index = store.index('timestamp');

    const result = await new Promise<Product[]>((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const products: Product[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          products.push(cursor.value);
          cursor.continue();
        } else {
          resolve(products);
        }
      };

      request.onerror = () => reject(request.error);
    });

    // حذف المنتجات الزائدة عن الحد
    if (result.length > limit) {
      const productsToRemove = result.slice(limit);
      for (const product of productsToRemove) {
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(product.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  } catch (error) {
    console.error('فشل في تقليص قائمة المنتجات المشاهدة مؤخرًا:', error);
  }
};

/**
 * حفظ تفضيلات الفلتر للمستخدم
 */
export const saveFilterPreference = async (filter: Omit<SavedFilter, 'timestamp'>): Promise<void> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(FILTERS_STORE, 'readwrite');
    const store = tx.objectStore(FILTERS_STORE);

    const savedFilter: SavedFilter = {
      ...filter,
      timestamp: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(savedFilter);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('فشل في حفظ تفضيلات الفلتر:', error);
  }
};

/**
 * الحصول على تفضيلات الفلتر المحفوظة للمستخدم
 */
export const getSavedFilters = async (userId?: string): Promise<SavedFilter[]> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(FILTERS_STORE, 'readonly');
    const store = tx.objectStore(FILTERS_STORE);

    // إذا كان هناك معرف مستخدم، استخدم الفهرس للحصول على الفلاتر الخاصة بالمستخدم فقط
    if (userId) {
      const index = store.index('userId');
      const result = await new Promise<SavedFilter[]>((resolve, reject) => {
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      return result;
    }

    // إذا لم يكن هناك معرف مستخدم، احصل على جميع الفلاتر غير المرتبطة بمستخدم
    const result = await new Promise<SavedFilter[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const filters = request.result || [];
        resolve(filters.filter(filter => !filter.userId));
      };
      request.onerror = () => reject(request.error);
    });

    return result;
  } catch (error) {
    console.error('فشل في الحصول على تفضيلات الفلتر المحفوظة:', error);
    return [];
  }
};

/**
 * حذف تفضيل فلتر محفوظ
 */
export const deleteFilterPreference = async (filterId: string): Promise<void> => {
  try {
    const db = await openDatabase();
    const tx = db.transaction(FILTERS_STORE, 'readwrite');
    const store = tx.objectStore(FILTERS_STORE);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(filterId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('فشل في حذف تفضيل الفلتر:', error);
  }
};

/**
 * مسح البيانات منتهية الصلاحية من جميع مخازن التخزين المؤقت
 */
export const clearExpiredCache = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    const timestamp = Date.now() - CACHE_EXPIRATION;

    // مسح نتائج البحث منتهية الصلاحية
    await clearExpiredItems(db, SEARCH_RESULTS_STORE, timestamp);

    console.log('تم مسح البيانات منتهية الصلاحية من التخزين المؤقت');
  } catch (error) {
    console.error('فشل في مسح البيانات منتهية الصلاحية:', error);
  }
};

/**
 * مسح العناصر منتهية الصلاحية من مخزن معين
 */
const clearExpiredItems = async (db: IDBDatabase, storeName: string, timestamp: number): Promise<void> => {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const index = store.index('timestamp');

  await new Promise<void>((resolve, reject) => {
    const range = IDBKeyRange.upperBound(timestamp);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
};

/**
 * مسح كامل التخزين المؤقت
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    
    // مسح جميع المخازن
    await Promise.all([
      clearStore(db, PRODUCTS_STORE),
      clearStore(db, SEARCH_RESULTS_STORE),
      clearStore(db, RECENTLY_VIEWED_STORE),
    ]);

    console.log('تم مسح جميع بيانات التخزين المؤقت');
  } catch (error) {
    console.error('فشل في مسح التخزين المؤقت:', error);
  }
};

/**
 * مسح كامل مخزن معين
 */
const clearStore = async (db: IDBDatabase, storeName: string): Promise<void> => {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);

  await new Promise<void>((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// تصدير كائن يحتوي على جميع الوظائف
const CacheService = {
  cacheSearchResults,
  getCachedSearchResults,
  addToRecentlyViewed,
  getRecentlyViewedProducts,
  saveFilterPreference,
  getSavedFilters,
  deleteFilterPreference,
  clearExpiredCache,
  clearAllCache,
  
  // وظائف التخزين المؤقت العامة
  setItem: async <T>(key: string, value: T, expirationMinutes = 60): Promise<void> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(SEARCH_RESULTS_STORE, 'readwrite');
      const store = tx.objectStore(SEARCH_RESULTS_STORE);
      
      const item = {
        searchKey: key,
        value,
        timestamp: Date.now(),
        expiration: Date.now() + (expirationMinutes * 60 * 1000)
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log(`تم تخزين البيانات بمفتاح "${key}" في التخزين المؤقت`);
    } catch (error) {
      console.error('فشل في تخزين البيانات في التخزين المؤقت:', error);
    }
  },
  
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(SEARCH_RESULTS_STORE, 'readonly');
      const store = tx.objectStore(SEARCH_RESULTS_STORE);
      
      const result = await new Promise<unknown>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // التحقق من صلاحية البيانات المسترجعة
      if (
        typeof result === 'object' &&
        result !== null &&
        'expiration' in result &&
        typeof (result as { expiration?: number }).expiration === 'number' &&
        (result as { expiration: number }).expiration > Date.now()
      ) {
        console.log(`تم استرجاع البيانات بمفتاح "${key}" من التخزين المؤقت`);
        if ('value' in result) {
          return (result as { value: T }).value as T;
        }
      } else if (typeof result === 'object' && result !== null) {
        // إذا كانت البيانات منتهية الصلاحية، قم بحذفها
        console.log(`البيانات بمفتاح "${key}" منتهية الصلاحية، جاري الحذف...`);
        await CacheService.removeItem(key);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('فشل في استرجاع البيانات من التخزين المؤقت:', error);
      return null;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(SEARCH_RESULTS_STORE, 'readwrite');
      const store = tx.objectStore(SEARCH_RESULTS_STORE);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      console.log(`تم حذف البيانات بمفتاح "${key}" من التخزين المؤقت`);
    } catch (error) {
      console.error('فشل في حذف البيانات من التخزين المؤقت:', error);
    }
  }
};

export default CacheService;
