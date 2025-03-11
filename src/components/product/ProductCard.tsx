// ./src/components/ProductCard.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
};

type ProductCardProps = {
  product: Product;
  onClick: (category: string) => void;
};

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
      onClick={() => onClick(product.category)}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-64">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
          <p className="text-[#8B4513] font-bold">{product.price} ر.س</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;