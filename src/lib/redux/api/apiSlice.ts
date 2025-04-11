import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Product } from "../../../types/product"
import type { Box, GiftProduct, Decoration, Bag, Inspiration, CustomGift } from "@/types/database"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Products", "Boxes", "GiftProducts", "Decorations", "Bags", "Inspirations", "CustomGifts"],
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
      query: (params) => {
        const queryParams = new URLSearchParams()

        // Add all params to query string
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString())
          }
        })

        return {
          url: `/products?${queryParams.toString()}`,
        }
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: "Products" as const, id })), { type: "Products", id: "LIST" }]
          : [{ type: "Products", id: "LIST" }],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/products?id=${id}`,
      transformResponse: (response: { data: Product[] }) => response.data[0],
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    getProductsByIds: builder.query<Product[], number[]>({
      query: (ids) => `/products?ids=${ids.join(",")}`,
      transformResponse: (response: { data: Product[] }) => response.data,
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
      },
      {
        category?: string
        tags?: string
        excludeIds?: number[]
        limit?: number
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams()

        // Add all params to query string
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === "excludeIds" && Array.isArray(value)) {
              queryParams.append("excludeIds", value.join(","))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })

        return {
          url: `/products/recommendations?${queryParams.toString()}`,
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
      query: () => "/gift/boxes",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Boxes" as const, id })), { type: "Boxes", id: "LIST" }]
          : [{ type: "Boxes", id: "LIST" }],
    }),

    getBoxesByCategory: builder.query<Box[], string>({
      query: (category) => `/gift/boxes?category=${category}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Boxes" as const, id })), { type: "Boxes", id: "LIST" }]
          : [{ type: "Boxes", id: "LIST" }],
    }),

    getBoxById: builder.query<Box, string>({
      query: (id) => `/gift/boxes/${id}`,
      providesTags: (result, error, id) => [{ type: "Boxes", id }],
    }),

    // Gift Products
    getGiftProducts: builder.query<GiftProduct[], void>({
      query: () => "/gift/products",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "GiftProducts" as const, id })), { type: "GiftProducts", id: "LIST" }]
          : [{ type: "GiftProducts", id: "LIST" }],
    }),

    getGiftProductsByCategory: builder.query<GiftProduct[], string>({
      query: (category) => `/gift/products?category=${category}`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "GiftProducts" as const, id })), { type: "GiftProducts", id: "LIST" }]
          : [{ type: "GiftProducts", id: "LIST" }],
    }),

    getGiftProductById: builder.query<GiftProduct, string>({
      query: (id) => `/gift/products/${id}`,
      providesTags: (result, error, id) => [{ type: "GiftProducts", id }],
    }),

    searchGiftProducts: builder.query<GiftProduct[], string>({
      query: (searchTerm) => `/gift/products/search?term=${searchTerm}`,
      providesTags: [{ type: "GiftProducts", id: "SEARCH" }],
    }),

    // Decorations
    getDecorations: builder.query<Decoration[], void>({
      query: () => "/gift/decorations",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Decorations" as const, id })), { type: "Decorations", id: "LIST" }]
          : [{ type: "Decorations", id: "LIST" }],
    }),

    getAvailableDecorations: builder.query<Decoration[], void>({
      query: () => "/gift/decorations/available",
      providesTags: [{ type: "Decorations", id: "AVAILABLE" }],
    }),

    getDecorationById: builder.query<Decoration, string>({
      query: (id) => `/gift/decorations/${id}`,
      providesTags: (result, error, id) => [{ type: "Decorations", id }],
    }),

    // Bags
    getBags: builder.query<Bag[], void>({
      query: () => "/gift/bags",
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
      query: (id) => `/gift/bags/${id}`,
      providesTags: (result, error, id) => [{ type: "Bags", id }],
    }),

    // Inspirations
    getInspirations: builder.query<Inspiration[], void>({
      query: () => "/gift/inspirations",
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
      query: (id) => `/gift/inspirations/${id}`,
      providesTags: (result, error, id) => [{ type: "Inspirations", id }],
    }),

    // Custom Gifts
    getCustomGifts: builder.query<CustomGift[], void>({
      query: () => "/gift/custom",
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
      query: (id) => `/gift/custom/${id}`,
      providesTags: (result, error, id) => [{ type: "CustomGifts", id }],
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
} = apiSlice
