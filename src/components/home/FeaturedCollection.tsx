import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductCollection from "./ProductCollection";
import { ShoppingBag } from 'lucide-react';

// Import the Product type
interface Product {
  id: number;
  name: string;
  brand: string;
  category: "men" | "women" | "kids";
  subCategory: string;
  price: number;
  old_price?: number;
  stock: number;
  best_seller?: boolean;
  new_arrival?: boolean;
  rating?: number;
  image: string;
  images: string[];
  tags: string[];
  description: string;
  colors: string[];
  trending?: boolean;
  sale?: boolean;
}

interface FeaturedCollectionProps {
  title: string;
  description?: string;
  products: Product[];
  backgroundImage?: string;
  theme?: "light" | "dark";
  buttonLink: string;
  buttonText: string;
  layout?: "grid" | "slider";
}

const FeaturedCollection = ({
  title,
  products,
  backgroundImage,
  theme = "dark",
  buttonLink,
  buttonText
}: FeaturedCollectionProps) => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  };

  const buttonStyle = theme === "dark"
    ? "bg-white text-gray-800 hover:bg-gray-100"
    : "bg-red-500 text-white hover:bg-red-600";

  return (
    <section className="relative py-8">
      {/* Background */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover opacity-25"
          />
          <div className={`absolute inset-0 ${
            theme === "dark" 
              ? "bg-gray-900 bg-opacity-70" 
              : "bg-white bg-opacity-70"
          }`} />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          {/* Products */}
          <ProductCollection products={products} />
          
          {/* Action button */}
          <div className="text-center mt-10">
            <Link href={buttonLink}>
              <motion.button 
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all ${buttonStyle}`}
              >
                <ShoppingBag className="w-5 h-5" />
                {buttonText}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
