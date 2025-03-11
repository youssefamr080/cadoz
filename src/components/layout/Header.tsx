import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Heart, Home } from "lucide-react";
import Navbar from "./Navbar";
import WishlistDrawer from "./WishlistDrawer";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SearchBar from "../search/SearchBar";

const Header = () => {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      {/* سطح المكتب (صف واحد) */}
      <div className="hidden md:flex items-center justify-between container mx-auto px-6 h-20">
        {/* الأيقونات على اليسار */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="relative p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Home">
            <Home className="h-7 w-7 text-blue-600" />
          </Link>

          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Wishlist"
          >
            <Heart className="h-7 w-7 text-red-600" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Cart">
            <ShoppingBag className="h-7 w-7 text-yellow-500" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>
        </div>

        {/* البحث والقائمة في المنتصف */}
        <div className="flex-1 flex justify-center items-center space-x-6 px-4">
          <SearchBar />
          <Navbar />
        </div>

        {/* اللوجو على اليمين */}
        <Link href="/" className="transition-transform duration-300 hover:scale-105" aria-label="Go to Homepage">
          <Image src="/logo.png" alt="Cadoz Logo" width={140} height={50} priority />
        </Link>
      </div>

      {/* الهاتف (تم التحديث) */}
      <div className="md:hidden px-4 py-3">
        <div className="flex items-center justify-between">
          {/* الأيقونات على اليسار */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="relative p-2 hover:bg-gray-50 rounded-full transition" aria-label="Home">
              <Home className="h-8 w-8 text-blue-600" /> {/* Increased size */}
            </Link>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 hover:bg-gray-50 rounded-full transition"
              aria-label="Wishlist"
            >
              <Heart className="h-8 w-8 text-red-600" /> {/* Increased size */}
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition" aria-label="Cart">
              <ShoppingBag className="h-8 w-8 text-yellow-500" /> {/* Increased size */}
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>

          {/* اللوجو على اليمين */}
          <Link href="/" className="transition-transform duration-300 hover:scale-105" aria-label="Go to Homepage">
            <Image src="/logo.png" alt="Cadoz Logo" width={120} height={40} priority />
          </Link>
        </div>

        <div className="mt-3 bg-gray-50 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <SearchBar />
            <Navbar />
          </div>
        </div>
      </div>

      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </header>
  );
};

export default Header;