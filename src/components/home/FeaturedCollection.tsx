import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ProductCollection from "./ProductCollection";

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
  description,
  products,
  backgroundImage = "/images/featured-bg.jpg",
  theme = "dark",
  buttonLink,
  buttonText}: FeaturedCollectionProps) => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const descriptionColor = theme === "dark" ? "text-gray-200" : "text-gray-600";
  const buttonStyle = theme === "dark"
    ? "bg-white text-gray-800 hover:bg-gray-100"
    : "bg-primary text-white hover:bg-primary-dark";

  return (
    <section className="relative py-16">
      {/* Background */}
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={backgroundImage}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="opacity-25"
          />
          <div className={`absolute inset-0 ${
            theme === "dark" 
              ? "bg-gray-900 bg-opacity-70" 
              : "bg-white bg-opacity-70"
          }`} />
        </div>
      )}
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className={`text-4xl font-bold mb-4 ${textColor}`}>{title}</h2>
          {description && (
            <p className={`max-w-2xl mx-auto ${descriptionColor}`}>{description}</p>
          )}
        </motion.div>
        
        {/* Products */}
        <ProductCollection products={products} />
        
        {/* Action button */}
        <div className="text-center mt-12">
          <Link href={buttonLink}>
            <button className={`px-8 py-3 rounded-full font-medium transition-colors ${buttonStyle}`}>
              {buttonText}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;