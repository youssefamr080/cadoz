"use client";

import React from "react";
import Image from "next/image";
import { FiTrash, FiPlus, FiMinus } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { updateItemQuantity, removeItem } from "@/lib/redux/slices/cartSlice";

interface CartItemProps {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

const CartItem: React.FC<CartItemProps> = ({ id, name, image, price, quantity }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
      {/* ✅ صورة المنتج */}
      <div className="flex items-center space-x-4">
        <Image src={image} alt={name} width={70} height={70} className="rounded-lg" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
          <p className="text-primary font-medium">{price} ج.م</p>
        </div>
      </div>

      {/* ✅ التحكم في الكمية */}
      <div className="flex items-center space-x-4">
        <button onClick={() => dispatch(updateItemQuantity({id, quantity: quantity - 1}))} className="bg-gray-200 p-2 rounded">
          <FiMinus className="text-gray-700" />
        </button>
        <span className="font-semibold text-lg">{quantity}</span>
        <button onClick={() => dispatch(updateItemQuantity({id, quantity: quantity + 1}))} className="bg-gray-200 p-2 rounded">
          <FiPlus className="text-gray-700" />
        </button>
      </div>

      {/* ✅ زر الحذف */}
      <button onClick={() => dispatch(removeItem({id}))} className="text-red-500 p-2">
        <FiTrash size={20} />
      </button>
    </div>
  );
};

export default CartItem;