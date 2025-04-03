"use client"

import type React from "react"
import { motion } from "framer-motion"

interface SectionTitleProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  accentColor: string
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, subtitle, accentColor }) => {
  return (
    <div className="flex flex-col items-center mb-6 sm:mb-10">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${accentColor} text-white mb-3 sm:mb-4 shadow-lg`}
      >
        {icon}
      </motion.div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 mb-1 sm:mb-2">{title}</h2>
      <div className={`w-16 sm:w-20 h-1 bg-gradient-to-r ${accentColor} rounded-full mb-2 sm:mb-3`}></div>
      <p className="text-sm md:text-base text-center text-gray-600 max-w-2xl">{subtitle}</p>
    </div>
  )
}

export default SectionTitle

