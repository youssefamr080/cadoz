import { useEffect, useRef } from "react";

/**
 * Hook: useProductInterestTracker
 * يسجل المنتج في localStorage ضمن قائمة "interestedProducts" إذا قضى المستخدم عليه مدة معينة (مثلاً 15 ثانية)
 * @param product المنتج الحالي (يجب أن يحتوي على id)
 * @param thresholdMs الحد الأدنى للزمن بالمللي ثانية (افتراضي 15 ثانية)
 */

// نوع المنتج (يمكنك تعديله حسب تعريف Product عندك)
import type { Product } from "@/types/product";

/**
 * Hook: useProductInterestTracker
 * يسجل المنتج في localStorage ضمن قائمة "interestedProducts" إذا قضى المستخدم عليه مدة معينة (مثلاً 15 ثانية)
 * @param product المنتج الحالي (يجب أن يحتوي على id)
 * @param thresholdMs الحد الأدنى للزمن بالمللي ثانية (افتراضي 15 ثانية)
 */
export default function useProductInterestTracker(product: Product | undefined, thresholdMs = 15000) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!product || !product.id) return;

    timerRef.current = setTimeout(() => {
      try {
        const prev: Product[] = JSON.parse(localStorage.getItem("interestedProducts") || "[]");
        // لا تكرر نفس المنتج
        if (!prev.some((p) => p.id === product.id)) {
          localStorage.setItem("interestedProducts", JSON.stringify([...prev, product]));
        }
      } catch {}
    }, thresholdMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);
}

