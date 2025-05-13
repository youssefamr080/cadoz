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
import type { Inspiration } from "@/types/inspiration";

interface AddToCartButtonProps {
  inspiration: Inspiration;
}

export default function AddToCartButton({ inspiration }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    
    try {
      // Validate at least one product
      if (inspiration.products.length === 0) {
        toast.error("لا يمكن إضافة هدية بدون منتجات");
        return;
      }
      
      // Fetch all related items by IDs
      const [boxArr, bagArr, productsArr, decorationsArr, mainProductsArr] = await Promise.all([
        inspiration.box ? getBoxesByIds([inspiration.box]) : [],
        inspiration.bag ? getBagsByIds([inspiration.bag]) : [],
        inspiration.products && inspiration.products.length > 0 ? getGiftProductsByIds(inspiration.products) : [],
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
        quantity: inspiration.productQuantities?.[product.id] || 1
      }));
      
      // Ensure all main products have price and quantity
      const mainProductsWithQuantities = mainProductsArr.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : 0,
        quantity: inspiration.productQuantities?.[product.id] || 1 // Use same productQuantities for main products
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
      size="lg"
      variant="outline"
      className="text-sm border-purple-300 hover:bg-purple-50 hover:text-purple-700 w-full"
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
      ) : (
        <ShoppingCart className="w-3 h-3 mr-1" />
      )}
      إضافة للسلة
    </Button>
  );
}
