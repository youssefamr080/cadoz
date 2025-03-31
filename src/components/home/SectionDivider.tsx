"use client"

import type React from "react"

import { motion } from "framer-motion"

interface SectionDividerProps {
  color?: string
  withDots?: boolean
}

const SectionDivider: React.FC<SectionDividerProps> = ({ color = "slate", withDots = true }) => {
  const colorClasses = {
    slate: "from-slate-200 to-slate-300",
    blue: "from-blue-200 to-blue-300",
    amber: "from-amber-200 to-amber-300",
    rose: "from-rose-200 to-rose-300",
    emerald: "from-emerald-200 to-emerald-300",
    violet: "from-violet-200 to-violet-300",
  }

  const gradientClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.slate

  return (
    <div className="py-6 flex justify-center">
      <div className="relative w-full max-w-sm flex items-center justify-center">
        <div className={`h-px w-full bg-gradient-to-r ${gradientClass}`}></div>

        {withDots && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="flex items-center gap-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1, 0.8] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientClass}`}
                ></motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SectionDivider

