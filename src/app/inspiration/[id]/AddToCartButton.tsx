"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";
import { getBoxesByIds } from "@/lib/actions/box-actions";
import { getBagsByIds } from "@/lib/actions/bag-actions";
import { getGiftProductsByIds } from "@/lib/actions/product-actions";
import { getDecorationsByIds } from "@/lib/actions/decoration-actions";
import { getMainProductsByIds } from "@/lib/actions/main-product-actions";
import type { LegacyInspiration } from "@/types/inspiration";
import { useDispatch } from "react-redux";
import { addItem } from "@/lib/redux/slices/cartSlice";
import type { CartItem } from "@/lib/redux/slices/cartSlice";

interface AddToCartButtonProps {
  inspiration: LegacyInspiration;
}

export default function AddToCartButton({ inspiration }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      // Validate at least one product
      const productsArray = Array.isArray(inspiration.products) ? inspiration.products : [];
      if (productsArray.length === 0) {
        toast.error("لا يمكن إضافة هدية بدون منتجات");
        return;
      }
      
      // Extract product IDs from the products array
      let productIds: string[] = [];
      let productQuantities: Record<string, number> = {};
      
      if (productsArray && productsArray.length > 0) {
        // Check if products are objects or just string IDs
        if (typeof productsArray[0] === 'string') {
          // Old format: array of IDs
          productIds = productsArray as string[];
          // Use quantities from productQuantities if available
          productQuantities = inspiration.productQuantities || {};
        } else {
          // New format: array of objects with id and quantity
          const productsWithQuantity = productsArray as { id: string; quantity: number | { $numberInt: string } }[];
          
          productIds = productsWithQuantity.map(p => {
            const id = p.id;
            // Handle quantity whether it's a number or an object
            const quantity = typeof p.quantity === 'number' 
              ? p.quantity 
              : parseInt((p.quantity as { $numberInt: string }).$numberInt || '1', 10);
              
            productQuantities[id] = quantity;
            return id;
          });
        }
      }
      
      // Fetch all related items by IDs
      const [boxArr, bagArr, productsArr, decorationsArr, mainProductsArr] = await Promise.all([
        inspiration.box ? getBoxesByIds([inspiration.box]) : [],
        inspiration.bag ? getBagsByIds([inspiration.bag]) : [],
        productIds.length > 0 ? getGiftProductsByIds(productIds) : [],
        inspiration.decorations && inspiration.decorations.length > 0 ? getDecorationsByIds(inspiration.decorations) : [],
        inspiration.Mainproducts && inspiration.Mainproducts.length > 0 ? getMainProductsByIds(inspiration.Mainproducts) : [],
      ]);
      
      // Extract the fetched objects
      const box = boxArr && boxArr.length > 0 ? boxArr[0] : null;
      const bag = bagArr && bagArr.length > 0 ? bagArr[0] : null;
      
      // Ensure all products have price and quantity
      const productsWithQuantities = productsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: productQuantities[product.id] || 1
      }));
      
      // Ensure all main products have price and quantity
      const mainProductsWithQuantities = mainProductsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: productQuantities[product.id] || 1
      }));

      // Process decorations
      const decorationsWithPrices = decorationsArr.map(decoration => ({
        ...decoration,
        price: typeof decoration.price === 'number' ? decoration.price : 0
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
      const decorationsPrice = decorationsWithPrices.reduce(
        (sum, decoration) => sum + decoration.price,
        0
      );
      
      const totalPrice = productsTotal + mainProductsTotal + boxPrice + bagPrice + decorationsPrice;
      
      // Create a cart item with complete gift data
      const cartItem: CartItem = {
        id: inspiration.id,
        name: inspiration.name || "هدية مخصصة",
        image: inspiration.image || box?.image || "/images/box.png",
        price: totalPrice,
        quantity: 1,
        category: "هدايا",
        variant: "مخصص",
        stock: 1,
        giftDetails: inspiration.description || "هدية مخصصة",
        giftData: {
          items: [
            ...productsWithQuantities.map(p => ({
              name: p.name,
              quantity: p.quantity || 1,
              image: p.image,
              price: p.price
            })),
            ...mainProductsWithQuantities.map(p => ({
              name: p.name,
              quantity: p.quantity || 1,
              image: p.image,
              price: p.price
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
          decorations: decorationsWithPrices.map(d => ({
            name: d.name,
            image: d.image,
            price: d.price
          })),
          totalPrice: totalPrice,
          createdAt: new Date().toISOString()
        }
      };
      
      // Add item to Redux store instead of localStorage
      dispatch(addItem({ item: cartItem, quantity: 1 }));
      
      toast.success(`تمت إضافة هدية "${inspiration.name}" إلى السلة بنجاح!`, {
        position: "top-center",
        autoClose: 1500
      });
    } catch (err) {
      console.error("خطأ في إضافة الهدية إلى السلة:", err);
      toast.error("حدث خطأ أثناء إضافة الهدية إلى السلة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full py-1.5 rounded-[1rem] transition-all duration-300 flex items-center justify-center gap-1.5 group hover:scale-[0.98] active:scale-[0.97]"
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="w-3 h-3 border-[1.5px] border-white/90 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <ShoppingCart className="w-3 h-3 stroke-[2.5px] group-hover:scale-110 transition-transform duration-300" />
          <span className="font-medium tracking-wide">إضافة للسلة</span>
        </>
      )}
    </Button>
  );
}
