"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useMemo } from "react"

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export default function BotTypingAnimation() {
  const shouldReduceMotion = useReducedMotion()
  const isSlowDevice = ((navigator as NavigatorWithMemory).deviceMemory ?? 8) < 4 || navigator.hardwareConcurrency < 4

  const animationProps = useMemo(() => {
    if (shouldReduceMotion || isSlowDevice) {
      return {
        animate: { opacity: [0.3, 1, 0.3] },
        transition: {
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop" as const,
        },
      }
    }

    return {
      animate: {
        opacity: [0.3, 1, 0.3],
        y: [0, -8, 0],
        scale: [0.8, 1.2, 0.8],
      },
      transition: {
        duration: 1.2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop" as const,
        ease: "easeInOut",
      },
    }
  }, [shouldReduceMotion, isSlowDevice])

  return (
    <div className="flex items-center space-x-3 rtl:space-x-reverse py-2">
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {[1, 2, 3].map((dot) => (
          <motion.div
            key={dot}
            className="w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm"
            initial={{ opacity: 0.3, y: 0, scale: 0.8 }}
            {...animationProps}
            transition={{
              ...animationProps.transition,
              delay: dot * (isSlowDevice ? 0.2 : 0.15),
            }}
          />
        ))}
      </div>
      <motion.span
        className="text-sm text-purple-600 font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      >
        بدور اهو استني...
      </motion.span>
    </div>
  )
}
