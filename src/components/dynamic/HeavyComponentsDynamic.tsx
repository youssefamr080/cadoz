"use client"

import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Dynamic import for ProductSwiper (uses Swiper + framer-motion)
const ProductSwiper = dynamic(
  () => import('@/components/home/ProductSwiper'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner message="جاري تحميل المنتجات..." />
      </div>
    ),
    ssr: false,
  }
)

// Dynamic import for CategoryInspirationGallery (uses Swiper + framer-motion)
const CategoryInspirationGallery = dynamic(
  () => import('@/components/category/CategoryInspirationGallery'),
  {
    loading: () => (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner message="جاري تحميل المعرض..." />
      </div>
    ),
    ssr: false,
  }
)

// Dynamic import for SubCategorySwiper (uses Swiper + framer-motion)
const SubCategorySwiper = dynamic(
  () => import('@/components/category/SubCategorySwiper'),
  {
    loading: () => (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner message="جاري تحميل الفئات..." />
      </div>
    ),
    ssr: false,
  }
)

// Dynamic import for CountdownTimer (uses framer-motion)
const CountdownTimer = dynamic(
  () => import('@/components/home/CountdownTimer'),
  {
    loading: () => (
      <div className="w-full h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">00:00:00</div>
          <div className="text-sm text-gray-600">جاري التحميل...</div>
        </div>
      </div>
    ),
    ssr: false,
  }
)

// Dynamic import for GiftExperience (uses framer-motion)
const GiftExperience = dynamic(
  () => import('@/components/gift/gift-experience'),
  {
    loading: () => (
      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner message="جاري تحميل تجربة الهدية..." />
      </div>
    ),
    ssr: false,
  }
)

// Dynamic import for LoadingScreen (uses framer-motion)
const LoadingScreen = dynamic(
  () => import('@/components/ui/loading-screen'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
        <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse mb-8"></div>
        <div className="w-48 h-2 bg-gray-200 rounded-full animate-pulse"></div>
        <p className="mt-4 text-gray-600 text-sm">جاري تحميل المتجر...</p>
      </div>
    ),
    ssr: false,
  }
)

export {
  ProductSwiper,
  CategoryInspirationGallery,
  SubCategorySwiper,
  CountdownTimer,
  GiftExperience,
  LoadingScreen,
} 