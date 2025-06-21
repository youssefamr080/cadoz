import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Product } from "../../../types/product"
import type { Box, GiftProduct, Decoration, Bag, Inspiration, CustomGift, Category, Notification, Order } from "@/types/database"

// نوع الاستجابة لإنشاء الطلب
export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Products", "Boxes", "GiftProducts", "Decorations", "Bags", "Inspirations", "CustomGifts", "SearchResults", "SearchSuggestions", "Orders", "GiftInspirations", "GiftBoxes", "ProductReviews", "Customers", "UserPreferences", "Notifications", "Recommendations", "Categories"],
  endpoints: (builder) => ({
    // Endpoints existentes
    getProducts: builder.query<
      {
        success: boolean
        data: Product[]
        pagination: {
          total: number
          page: number
          limit: number
          pages: number
        }
        fromCache?: boolean
      },
      {
        category?: string
        subCategory?: string
        brand?: string
        limit?: number
        page?: number
        sort?: string
        minPrice?: number
        maxPrice?: number
        inStock?: boolean
        search?: string
        trending?: boolean
        sale?: boolean
        best_seller?: boolean
        new_arrival?: boolean
        discount?: boolean
        tags?: string
        colors?: string
        isGift?: boolean
        season?: string
      }
    >({
      // ربط الكاش مع الاستعلام
      async queryFn(params) {
        try {
          // جرب الكاش أولاً
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cached = await CacheService.getCachedSearchResults(params);
          if (cached && Array.isArray(cached.results) && cached.results.length > 0) {
            return {
              data: {
                success: true,
                data: cached.results,
                pagination: {
                  total: cached.total,
                  page: 1,
                  limit: cached.results.length,
                  pages: 1,
                },
                fromCache: true,
              },
            };
          }

          // إذا لم توجد بيانات، fetch من الـ API
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/products?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            // خزّن النتيجة في الكاش
            await CacheService.cacheSearchResults(params, data.data, data.pagination?.total || data.data.length);
            return { data: { ...data, fromCache: false } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "Products" as const, id })), { type: "Products", id: "LIST" }]
          : [{ type: "Products", id: "LIST" }],
    }),

    getProductById: builder.query<Product, number>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `product_${id}`;
          const cached = await CacheService.getItem<Product>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          // إذا لم توجد بيانات، fetch من الـ API
          const response = await fetch(`/api/products?id=${id}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data) && data.data[0]) {
            await CacheService.setItem(cacheKey, data.data[0], 1440); // يوم كامل
            return { data: data.data[0] };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    getProductsByIds: builder.query<Product[], number[]>({
      async queryFn(ids) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          // جلب المنتجات من الكاش إن وجدت
          const cachedProducts: Product[] = [];
          const missingIds: number[] = [];
          for (const id of ids) {
            const cacheKey = `product_${id}`;
            const cached = await CacheService.getItem<Product>(cacheKey);
            if (cached) {
              cachedProducts.push(cached);
            } else {
              missingIds.push(id);
            }
          }
          let fetchedProducts: Product[] = [];
          if (missingIds.length > 0) {
            // جلب المنتجات غير الموجودة بالكاش من الـ API
            const response = await fetch(`/api/products?ids=${missingIds.join(",")}`);
            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
              fetchedProducts = data.data;
              // خزّن كل منتج في الكاش
              for (const product of fetchedProducts) {
                await CacheService.setItem(`product_${product.id}`, product, 1440);
              }
            } else {
              return { error: { status: response.status, data } };
            }
          }
          // دمج النتائج وإرجاعها
          const allProducts = [...cachedProducts, ...fetchedProducts];
          return { data: allProducts };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Products" as const, id })), { type: "Products", id: "LIST" }]
          : [{ type: "Products", id: "LIST" }],
    }),

    getRecommendedProducts: builder.query<
      {
        success: boolean
        data: Product[]
        pagination: {
          total: number
          page: number
          limit: number
          pages: number
        }
        fromCache?: boolean
      },
      {
        category?: string
        tags?: string
        excludeIds?: number[]
        limit?: number
      }
    >({
      async queryFn(params) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          // استخدم المعلمات كمفتاح للكاش
          const cacheKey = `recommended_${JSON.stringify(params)}`;
          const cached = await CacheService.getItem<{ data: Product[]; fromCache?: boolean }>(cacheKey);
          if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
            return { data: { ...cached, fromCache: true } };
          }
          // إذا لم توجد بيانات، fetch من الـ API
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              if (key === 'excludeIds' && Array.isArray(value)) {
                queryParams.append('excludeIds', value.join(','));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });
          const response = await fetch(`/api/products/recommendations?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data: { ...data, fromCache: false } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Products" as const, id })),
              { type: "Products", id: "RECOMMENDATIONS" },
            ]
          : [{ type: "Products", id: "RECOMMENDATIONS" }],
    }),

    // Nuevos endpoints para el sistema de regalos

    // Boxes
    getBoxes: builder.query<Box[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_boxes_all`;
          const cached = await CacheService.getItem<Box[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/boxes`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Boxes" as const, id })), { type: "Boxes", id: "LIST" }]
          : [{ type: "Boxes", id: "LIST" }],
    }),

    getBoxesByCategory: builder.query<Box[], string>({
      async queryFn(category) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_boxes_category_${category}`;
          const cached = await CacheService.getItem<Box[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/boxes?category=${category}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Boxes" as const, id })), { type: "Boxes", id: "LIST" }]
          : [{ type: "Boxes", id: "LIST" }],
    }),

    getBoxById: builder.query<Box, string>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_box_${id}`;
          const cached = await CacheService.getItem<Box>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/boxes/${id}`);
          const data = await response.json();
          if (data && typeof data === 'object') {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "Boxes", id }],
    }),

    // Gift Products
    getGiftProducts: builder.query<GiftProduct[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_products_all`;
          const cached = await CacheService.getItem<GiftProduct[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/products`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "GiftProducts" as const, id })), { type: "GiftProducts", id: "LIST" }]
          : [{ type: "GiftProducts", id: "LIST" }],
    }),

    getGiftProductsByCategory: builder.query<GiftProduct[], string>({
      async queryFn(category) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_products_category_${category}`;
          const cached = await CacheService.getItem<GiftProduct[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/products?category=${category}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "GiftProducts" as const, id })), { type: "GiftProducts", id: "LIST" }]
          : [{ type: "GiftProducts", id: "LIST" }],
    }),

    getGiftProductById: builder.query<GiftProduct, string>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_product_${id}`;
          const cached = await CacheService.getItem<GiftProduct>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/products/${id}`);
          const data = await response.json();
          if (data && typeof data === 'object') {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "GiftProducts", id }],
    }),

    searchGiftProducts: builder.query<GiftProduct[], string>({
      async queryFn(searchTerm) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `gift_products_search_${searchTerm}`;
          const cached = await CacheService.getItem<GiftProduct[]>(cacheKey);
          if (cached && Array.isArray(cached)) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/products/search?term=${encodeURIComponent(searchTerm)}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: [{ type: "GiftProducts", id: "SEARCH" }],
    }),

    // Decorations
    getDecorations: builder.query<Decoration[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `decorations_all`;
          const cached = await CacheService.getItem<Decoration[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/decorations`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Decorations" as const, id })), { type: "Decorations", id: "LIST" }]
          : [{ type: "Decorations", id: "LIST" }],
    }),

    getAvailableDecorations: builder.query<Decoration[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `decorations_available`;
          const cached = await CacheService.getItem<Decoration[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/decorations/available`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: [{ type: "Decorations", id: "AVAILABLE" }],
    }),

    getDecorationById: builder.query<Decoration, string>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `decoration_${id}`;
          const cached = await CacheService.getItem<Decoration>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/decorations/${id}`);
          const data = await response.json();
          if (data && typeof data === 'object') {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "Decorations", id }],
    }),

    // Bags
    getBags: builder.query<Bag[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `bags_all`;
          const cached = await CacheService.getItem<Bag[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/bags`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Bags" as const, id })), { type: "Bags", id: "LIST" }]
          : [{ type: "Bags", id: "LIST" }],
    }),

    getAvailableBags: builder.query<Bag[], void>({
      query: () => "/gift/bags/available",
      providesTags: [{ type: "Bags", id: "AVAILABLE" }],
    }),

    getBagById: builder.query<Bag, string>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `bag_${id}`;
          const cached = await CacheService.getItem<Bag>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/bags/${id}`);
          const data = await response.json();
          if (data && typeof data === 'object') {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "Bags", id }],
    }),

    // Inspirations
    getInspirations: builder.query<Inspiration[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `inspirations_all`;
          const cached = await CacheService.getItem<Inspiration[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/inspirations`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Inspirations" as const, id })), { type: "Inspirations", id: "LIST" }]
          : [{ type: "Inspirations", id: "LIST" }],
    }),

    getPopularInspirations: builder.query<Inspiration[], number | void>({
      query: (limit = 4) => `/gift/inspirations/popular?limit=${limit}`,
      providesTags: [{ type: "Inspirations", id: "POPULAR" }],
    }),

    getInspirationById: builder.query<Inspiration, string>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `inspiration_${id}`;
          const cached = await CacheService.getItem<Inspiration>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/inspirations/${id}`);
          const data = await response.json();
          if (data && typeof data === 'object') {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "Inspirations", id }],
    }),

    getInspirationsBatch: builder.mutation<unknown, { ids: string[] }>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/inspiration/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (Array.isArray(data)) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: [{ type: 'Inspirations', id: 'LIST' }],
    }),

    // Custom Gifts
    getCustomGifts: builder.query<CustomGift[], void>({
      async queryFn() {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `custom_gifts_all`;
          const cached = await CacheService.getItem<CustomGift[]>(cacheKey);
          if (cached && Array.isArray(cached) && cached.length > 0) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/custom`);
          const data = await response.json();
          if (Array.isArray(data)) {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "CustomGifts" as const, id })), { type: "CustomGifts", id: "LIST" }]
          : [{ type: "CustomGifts", id: "LIST" }],
    }),

    getCustomGiftsByCategory: builder.query<CustomGift[], string>({
      query: (category) => `/gift/custom?category=${category}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "CustomGifts" as const, id })), { type: "CustomGifts", id: "LIST" }]
          : [{ type: "CustomGifts", id: "LIST" }],
    }),

    getCustomGiftById: builder.query<CustomGift, string>({
      async queryFn(id) {
        try {
          const CacheService = (await import('@/lib/services/cache-service')).default;
          const cacheKey = `custom_gift_${id}`;
          const cached = await CacheService.getItem<CustomGift>(cacheKey);
          if (cached) {
            return { data: cached };
          }
          const response = await fetch(`/api/gift/custom/${id}`);
          const data = await response.json();
          if (data && typeof data === 'object') {
            await CacheService.setItem(cacheKey, data, 1440);
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: "CustomGifts", id }],
    }),

    search: builder.query<{ data: unknown[] }, {
      query: string;
      type?: string;
      limit?: number;
      category?: string;
      priceRange?: string;
      sortBy?: string;
    }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/search?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            return { data: { data: data.data } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((item: unknown) => ({ type: "SearchResults" as const, id: (item as { id: string }).id })),
              { type: "SearchResults", id: "LIST" },
            ]
          : [{ type: "SearchResults", id: "LIST" }],
    }),

    searchSuggestions: builder.query<{ suggestions: string[] }, { q: string }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/search/suggestions?${queryParams.toString()}`);
          const data = await response.json();
          if (data.suggestions && Array.isArray(data.suggestions)) {
            return { data: { suggestions: data.suggestions } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.suggestions)
          ? [{ type: "SearchSuggestions", id: "LIST" }]
          : [{ type: "SearchSuggestions", id: "LIST" }],
    }),

    getCategories: builder.query<Category[], { query?: string; parentId?: string; includeChildren?: boolean }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              if (typeof value === 'boolean') {
                queryParams.append(key, value ? 'true' : 'false');
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });
          const response = await fetch(`/api/categories?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            return { data: data.data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((cat) => ({ type: "Categories" as const, id: cat.id })),
              { type: "Categories", id: "LIST" },
            ]
          : [{ type: "Categories", id: "LIST" }],
    }),

    createOrder: builder.mutation<CreateOrderResponse, Record<string, unknown>>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),

    getOrders: builder.query<Order[], { customerId: string; limit?: number }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/orders?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.orders)) {
            return { data: data.orders };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((order) => ({ type: "Orders" as const, id: order.id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    getOrderById: builder.query<Order, string>({
      async queryFn(orderId) {
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          const data = await response.json();
          if (data.success && data.order) {
            return { data: data.order };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    updateOrderStatus: builder.mutation<unknown, { orderId: string; status: string }>({
      async queryFn({ orderId, status }) {
        try {
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Orders', id: orderId },
        { type: 'Orders', id: 'LIST' },
      ],
    }),

    getGiftInspirations: builder.query<{ data: Inspiration[] }, {
      category?: string;
      query?: string;
      rating?: number;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
      sort?: string;
      all?: boolean;
    }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              if (typeof value === 'boolean') {
                queryParams.append(key, value ? 'true' : 'false');
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });
          const response = await fetch(`/api/gift/inspirations?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            return { data: { data: data.data } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((item) => ({ type: "GiftInspirations" as const, id: item.id })),
              { type: "GiftInspirations", id: "LIST" },
            ]
          : [{ type: "GiftInspirations", id: "LIST" }],
    }),

    getGiftBoxes: builder.query<{ data: Box[] }, { category?: string; id?: string }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/gift/boxes?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            return { data: { data: data.data } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((item) => ({ type: "GiftBoxes" as const, id: item.id })),
              { type: "GiftBoxes", id: "LIST" },
            ]
          : [{ type: "GiftBoxes", id: "LIST" }],
    }),

    getGiftBoxById: builder.query<unknown, string>({
      async queryFn(id) {
        try {
          const response = await fetch(`/api/gift/boxes/${id}`);
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'GiftBoxes', id }],
    }),

    getGiftInspirationById: builder.query<unknown, string>({
      async queryFn(id) {
        try {
          const response = await fetch(`/api/gift/inspirations/${id}`);
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'GiftInspirations', id }],
    }),

    validatePromoCode: builder.mutation<unknown, { code: string; userId: string }>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/promo-codes/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: [],
    }),

    getProductReviews: builder.query<{ data: { reviews: unknown[] } }, { productId: number; userId?: string }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/reviews?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data.reviews)) {
            return { data: { data: { reviews: data.data.reviews } } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && result.data && Array.isArray(result.data.reviews)
          ? [
              ...result.data.reviews.map((review: unknown) => ({ type: "ProductReviews" as const, id: (review as { _id: string })._id })),
              { type: "ProductReviews", id: "LIST" },
            ]
          : [{ type: "ProductReviews", id: "LIST" }],
    }),

    addOrUpdateReview: builder.mutation<unknown, { productId: number; userId: string; userName?: string; rating: number; comment?: string }>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: [{ type: 'ProductReviews', id: 'LIST' }],
    }),

    getCustomer: builder.query<unknown, { phone?: string; email?: string; id?: string }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/customers?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, params) => [{ type: 'Customers', id: params?.id || params?.phone || params?.email || 'LIST' }],
    }),

    updateCustomer: builder.mutation<unknown, { id: string; name?: string; phone?: string; email?: string; password?: string; image?: string }>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/customers/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, body) => [{ type: 'Customers', id: body.id }],
    }),

    getUserPreferences: builder.query<unknown, { userId: string }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/user-preferences?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result, error, params) => [{ type: 'UserPreferences', id: params.userId }],
    }),

    updateUserPreferences: builder.mutation<unknown, { userId: string; preferences: unknown }>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/user-preferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: (result, error, body) => [{ type: 'UserPreferences', id: body.userId }],
    }),

    getNotifications: builder.query<{ data: Notification[] }, { userId?: string; productId?: number; status?: string }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              queryParams.append(key, value.toString());
            }
          });
          const response = await fetch(`/api/notifications?${queryParams.toString()}`);
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            return { data: { data: data.data } };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((item) => ({ type: "Notifications" as const, id: item._id })),
              { type: "Notifications", id: "LIST" },
            ]
          : [{ type: "Notifications", id: "LIST" }],
    }),

    createOrUpdateNotification: builder.mutation<unknown, unknown>({
      async queryFn(body) {
        try {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (data.success) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),

    getRecommendations: builder.query<unknown, {
      excludeIds?: number[];
      category?: string;
      tags?: string[];
      userId?: string;
      limit?: number;
      personalized?: boolean;
      priceRange?: string;
      sessionId?: string;
    }>({
      async queryFn(params) {
        try {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
              if (Array.isArray(value)) {
                queryParams.append(key, value.join(","));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });
          const response = await fetch(`/api/recommendations?${queryParams.toString()}`);
          const data = await response.json();
          if (data) {
            return { data };
          }
          return { error: { status: response.status, data } };
        } catch (error) {
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: [{ type: 'Recommendations', id: 'LIST' }],
    }),
  }),
})

// Exportar los hooks existentes
export const { useGetProductsQuery, useGetProductByIdQuery, useGetProductsByIdsQuery, useGetRecommendedProductsQuery } =
  apiSlice

// Exportar los nuevos hooks para el sistema de regalos
export const {
  // Boxes
  useGetBoxesQuery,
  useGetBoxesByCategoryQuery,
  useGetBoxByIdQuery,

  // Gift Products
  useGetGiftProductsQuery,
  useGetGiftProductsByCategoryQuery,
  useGetGiftProductByIdQuery,
  useSearchGiftProductsQuery,

  // Decorations
  useGetDecorationsQuery,
  useGetAvailableDecorationsQuery,
  useGetDecorationByIdQuery,

  // Bags
  useGetBagsQuery,
  useGetAvailableBagsQuery,
  useGetBagByIdQuery,

  // Inspirations
  useGetInspirationsQuery,
  useGetPopularInspirationsQuery,
  useGetInspirationByIdQuery,

  // Custom Gifts
  useGetCustomGiftsQuery,
  useGetCustomGiftsByCategoryQuery,
  useGetCustomGiftByIdQuery,

  // Orders
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,

  // New Gift Inspirations
  useGetGiftInspirationsQuery,

  // New Gift Boxes
  useGetGiftBoxesQuery,
  useGetGiftBoxByIdQuery,

  // New Gift Inspiration
  useGetGiftInspirationByIdQuery,

  // New Promo Code
  useValidatePromoCodeMutation,

  // New Product Reviews
  useGetProductReviewsQuery,
  useAddOrUpdateReviewMutation,

  // New Customer
  useGetCustomerQuery,
  useUpdateCustomerMutation,

  // New User Preferences
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,

  // New Notifications
  useGetNotificationsQuery,
  useCreateOrUpdateNotificationMutation,

  // New Recommendations
  useGetRecommendationsQuery,
} = apiSlice
