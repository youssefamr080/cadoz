"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Heart, Star } from "lucide-react";

// تعريف التأثيرات المتاحة
const giftEffects = [
  { id: "confetti", name: "كونفيتي", icon: <Star className="w-4 h-4" /> },
  { id: "hearts", name: "قلوب", icon: <Heart className="w-4 h-4" /> },
  { id: "gift", name: "هدايا", icon: <Gift className="w-4 h-4" /> },
];

export default function GiftExperience() {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  // إعدادات الرسوم المتحركة لكل تأثير
  const getAnimationVariants = (effectType: string) => {
    switch (effectType) {
      case "confetti":
        return {
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
          exit: { opacity: 0, y: 50 },
        };
      case "hearts":
        return {
          initial: { opacity: 0, scale: 0 },
          animate: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" } },
          exit: { opacity: 0, scale: 0 },
        };
      case "gift":
        return {
          initial: { opacity: 0, rotate: -180 },
          animate: { opacity: 1, rotate: 0, transition: { duration: 0.7, type: "spring" } },
          exit: { opacity: 0, rotate: 180 },
        };
      default:
        return {};
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">تجربة فتح الهدية</h2>
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">اختر تأثير الهدية</h3>
          <div className="flex gap-3 flex-wrap">
            {giftEffects.map((effect) => (
              <Button
                key={effect.id}
                variant={activeEffect === effect.id ? "default" : "outline"}
                className={activeEffect === effect.id ? "bg-purple-600" : ""}
                onClick={() => setActiveEffect(effect.id)}
              >
                {effect.icon}
                <span className="ml-2">{effect.name}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="relative h-[300px] bg-gray-50 rounded-lg overflow-hidden">
          <AnimatePresence>
            {activeEffect && (
              <motion.div
                variants={getAnimationVariants(activeEffect)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <h3 className="text-xl font-bold text-purple-600 mb-2">تهانينا!</h3>
                  <p className="text-gray-700">تم فتح هديتك بنجاح</p>
                </div>
              </motion.div>
            )}
            {!activeEffect && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">اختر تأثيرًا لمشاهدة تجربة فتح الهدية</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}