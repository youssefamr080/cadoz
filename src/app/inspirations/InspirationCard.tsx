"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, Eye, ChevronDown, Heart, ShoppingCart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGift } from "@/context/gift-context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getBoxesByIds } from "@/lib/actions/box-actions";
import { getBagsByIds } from "@/lib/actions/bag-actions";
import { getGiftProductsByIds } from "@/lib/actions/product-actions";
import { getDecorationsByIds } from "@/lib/actions/decoration-actions";
import { getMainProductsByIds } from "@/lib/actions/main-product-actions";
import type { Inspiration } from "@/types/inspiration";

interface InspirationCardProps {
  gift: Inspiration;
  getCategoryArabicName?: (category: string) => string;
}

export default function InspirationCard({ gift, getCategoryArabicName }: InspirationCardProps) {
  const router = useRouter();
  const { loadInspiration } = useGift();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

  // Toggle description visibility for a gift
  const toggleDescription = (giftId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }));
  };

  // Toggle like state for a gift
  const toggleLike = (giftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({
      ...prev,
      [giftId]: !prev[giftId]
    }));
  };

  // Handle using the inspiration (customize)
  const handleUseInspiration = (gift: Inspiration) => {
    loadInspiration(gift);
    router.push(`/gift`);
  };

  // Add gift directly to cart
  const handleAddToCart = async (gift: Inspiration, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Set loading state for this gift
    setAddingToCart(prev => ({
      ...prev,
      [gift.id]: true
    }));
    
    try {
      // Validate at least one product
      if (gift.products.length === 0) {
        toast.error("لا يمكن إضافة هدية بدون منتجات");
        return;
      }
      
      // Fetch all related items by IDs
      const [boxArr, bagArr, productsArr, decorationsArr, mainProductsArr] = await Promise.all([
        gift.box ? getBoxesByIds([gift.box]) : [],
        gift.bag ? getBagsByIds([gift.bag]) : [],
        gift.products && gift.products.length > 0 ? getGiftProductsByIds(gift.products) : [],
        gift.decorations && gift.decorations.length > 0 ? getDecorationsByIds(gift.decorations) : [],
        gift.Mainproducts && gift.Mainproducts.length > 0 ? getMainProductsByIds(gift.Mainproducts) : [],
      ]);
      
      // Extract the fetched objects
      const box = boxArr && boxArr.length > 0 ? boxArr[0] : null;
      const bag = bagArr && bagArr.length > 0 ? bagArr[0] : null;
      
      // Ensure all products have price and quantity
      const productsWithQuantities = productsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: gift.productQuantities?.[product.id] || 1
      }));
      
      // Ensure all main products have price and quantity
      const mainProductsWithQuantities = mainProductsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: gift.productQuantities?.[product.id] || 1 // Use same productQuantities for main products
      }));
      
      // Calculate total price
      const productsTotal = productsWithQuantities.reduce(
        (sum, item) => sum + (item.price * (item.quantity || 1)), 
        0
      );
      
      const mainProductsTotal = mainProductsWithQuantities.reduce(
        (sum, item) => sum + (item.price * (item.quantity || 1)), 
        0
      );
      
      const boxPrice = box && typeof box.price === 'number' ? box.price : 0;
      const bagPrice = bag && typeof bag.price === 'number' ? bag.price : 0;
      
      // Calculate decorations price
      let decorationsPrice = 0;
      for (const decoration of decorationsArr) {
        decorationsPrice += typeof decoration.price === 'number' ? decoration.price : 0;
      }
      
      const totalPrice = productsTotal + mainProductsTotal + boxPrice + bagPrice + decorationsPrice;
      
      // Create a cart item
      const cartItem = {
        id: Date.now(), // Use timestamp as ID
        name: gift.name || "هدية مخصصة",
        image: gift.image || box?.image || "/images/box.png",
        price: totalPrice,
        quantity: 1,
        category: "هدايا",
        variant: "مخصص",
        stock: 1,
        giftDetails: gift.description || "هدية مخصصة",
        giftData: {
          items: [
            ...productsWithQuantities.map(p => ({
              id: p.id,
              name: p.name,
              image: p.image,
              price: p.price,
              quantity: p.quantity || 1,
              type: 'gift'
            })),
            ...mainProductsWithQuantities.map(p => ({
              id: p.id,
              name: p.name,
              image: p.image,
              price: p.price,
              quantity: p.quantity || 1,
              type: 'main'
            })),
          ],
          box: box ? {
            name: box.name,
            image: box.image,
            price: boxPrice
          } : null,
          wrap: bag ? {
            name: bag.name,
            image: bag.image,
            price: bagPrice
          } : null,
          totalPrice: totalPrice,
          createdAt: new Date().toISOString()
        }
      };
      
      // Get existing cart and add new item
      const existingCart = localStorage.getItem("cadoz-cart");
      const cart = existingCart ? JSON.parse(existingCart) : [];
      cart.push(cartItem);
      
      // Update localStorage
      localStorage.setItem("cadoz-cart", JSON.stringify(cart));
      
      // Dispatch a custom event to notify cart context
      const cartUpdateEvent = new CustomEvent("cartUpdated", { detail: cart });
      window.dispatchEvent(cartUpdateEvent);
      
      toast.success(`تمت إضافة هدية "${gift.name}" إلى السلة بنجاح!`, {
        position: "top-center",
        autoClose: 1500
      });
    } catch (err) {
      console.error("خطأ في إضافة الهدية إلى السلة:", err);
      toast.error("حدث خطأ أثناء إضافة الهدية إلى السلة");
    } finally {
      // Clear loading state
      setAddingToCart(prev => ({
        ...prev,
        [gift.id]: false
      }));
    }
  };

  // Format category name if function provided
  const categoryName = gift.category && getCategoryArabicName 
    ? getCategoryArabicName(gift.category) 
    : gift.category;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-md h-full hover:shadow-xl transition-shadow duration-300"
    >
      {/* Image with improved aspect ratio */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden group">
        <Image 
          src={gift.image || "/placeholder.svg"} 
          alt={gift.name} 
          fill 
          sizes="(max-width: 480px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 hover:scale-110" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Like Button */}
        <button 
          onClick={(e) => toggleLike(gift.id, e)}
          className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md z-10 transition-transform duration-300 hover:scale-110"
        >
          <Heart 
            className={`w-3.5 h-3.5 ${likedItems[gift.id] ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
        
        {/* Category Badge */}
        {gift.category && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full z-10">
            {categoryName}
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center shadow-sm z-10">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium ml-1">{gift.rating}</span>
        </div>
        
        {/* Quick action button - Edit Gift */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => handleUseInspiration(gift)}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <Edit className="w-3 h-3" />
          تخصيص الهدية
        </motion.button>
      </div>

      <div className="p-3">
        {/* Name with expandable arrow */}
        <div 
          className="flex justify-between items-center cursor-pointer py-1"
          onClick={() => toggleDescription(gift.id)}
        >
          <h3 className="font-medium text-gray-900 truncate text-sm">{gift.name}</h3>
          <motion.div
            animate={{ rotate: expandedItems[gift.id] ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expandedItems[gift.id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-gray-600 my-2 line-clamp-3">{gift.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex justify-between mt-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs flex-1 h-8 rounded-xl"
          >
            <Link href={`/inspiration/${gift.id}`}>
              <Eye className="w-3 h-3 mr-1" />
              عرض
            </Link>
          </Button>

          <Button
            size="sm"
            className="text-xs bg-purple-600 hover:bg-purple-700 flex-1 h-8 rounded-xl"
            onClick={(e) => handleAddToCart(gift, e)}
            disabled={addingToCart[gift.id]}
          >
            {addingToCart[gift.id] ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : (
              <ShoppingCart className="w-3 h-3 mr-1" />
            )}
            اضافة للسلة
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
