import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Product } from "../../../types/product"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
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
  }),
})

export const { useGetProductsQuery, useGetProductByIdQuery, useGetProductsByIdsQuery, useGetRecommendedProductsQuery } =
  apiSlice

