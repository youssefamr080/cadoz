import { motion } from "framer-motion";
import Image from "next/image";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="relative w-32 h-32 mb-8"
      >
        <Image
          src="/images/logo.png"
          alt="Cadoz Logo"
          fill
          className="object-contain"
        />
      </motion.div>

      <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-24 h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-gray-600 text-sm"
      >
        جاري تحميل المتجر...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
