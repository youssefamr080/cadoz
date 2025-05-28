"use client";

import { motion } from "framer-motion";

export default function BotTypingAnimation() {
  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-2 h-2 bg-purple-600 rounded-full"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "loop",
            delay: dot * 0.1,
          }}
        />
      ))}
    </div>
  );
}
