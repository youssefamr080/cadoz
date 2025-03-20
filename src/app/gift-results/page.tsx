"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Heart,
    ShoppingCart,
    Star,
    Search,
    ChevronDown,
    X,
    Clock,
    Truck,
    Bookmark,
    Share2,
    Filter,
    SlidersHorizontal,
    Check,
} from "lucide-react";
import Image from "next/image";
import { Product, products } from "../../data/products";  // IMPORT products
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import Link from "next/link";

interface FilterOptions {
    gender: string;
    occasion: string;
    priceRange: [number, number];
}

const GiftResultsPage: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [giftItems, setGiftItems] = useState<Product[]>([]);
    const [filteredItems, setFilteredItems] = useState<Product[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        gender: "all",
        occasion: "all",
        priceRange: [200, 10000]
    });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("recommended");
    const [showFilters, setShowFilters] = useState(true);
    const [selectedGift, setSelectedGift] = useState<Product | null>(null);
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

    // Function to load filter options from local storage
    const loadFilterOptions = (): FilterOptions => {
        try {
            const storedOptions = localStorage.getItem("giftFilterOptions");
            return storedOptions ? JSON.parse(storedOptions) : {
                gender: "all",
                occasion: "all",
                priceRange: [200, 10000]
            };
        } catch (error) {
            console.error("Failed to load filter options from local storage:", error);
            return {
                gender: "all",
                occasion: "all",
                priceRange: [200, 10000]
            };
        }
    };

    // Function to save filter options to local storage
    const saveFilterOptions = (options: FilterOptions) => {
        try {
            localStorage.setItem("giftFilterOptions", JSON.stringify(options));
        } catch (error) {
            console.error("Failed to save filter options to local storage:", error);
        }
    };

    //Use Effect to update filterOptions state and update localStorage
    useEffect(() => {
        const storedOptions = loadFilterOptions();
        setFilterOptions(storedOptions);

        // Simulate API request with imported products array
        setTimeout(() => {
            const initialProducts = products.filter(product => product.isGift === true);
            setGiftItems(initialProducts);
            setFilteredItems(initialProducts);
            setLoading(false);
        }, 1000); // Reduced loading time for better UX
    }, []);

    //Use Effect to persist and filter
    useEffect(() => {
        saveFilterOptions(filterOptions);

        let filtered = [...giftItems];

        // Apply gender filter
        if (filterOptions.gender !== "all") {
            filtered = filtered.filter(product => product.category === filterOptions.gender);
        }
        
        //Apply occasion filter
        if (filterOptions.occasion !== "all") {
            filtered = filtered.filter(product => product.occasion?.includes(filterOptions.occasion));
        }

        filtered = filtered.filter(item => item.price >= filterOptions.priceRange[0] && item.price <= filterOptions.priceRange[1]);

        // Apply search 
        if (searchQuery) {
            const searchTerms = searchQuery.toLowerCase();
            filtered = filtered.filter(
                item =>
                    item.name.toLowerCase().includes(searchTerms) ||
                    item.description.toLowerCase().includes(searchTerms) ||
                    item.tags.some(tag => tag.toLowerCase().includes(searchTerms))
            );
        }
        
        // Sort the products:
        if (sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); 
        } else if (sortBy === "newest") {
            // Assuming there's a date field, otherwise fallback to id
            filtered.sort((a, b) => b.id - a.id);
        }
        
        setFilteredItems(filtered);
    }, [filterOptions, giftItems, searchQuery, sortBy]);

    // Event handlers
    const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterOptions(prev => ({ ...prev, gender: e.target.value }));
    };

    const handleOccasionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterOptions(prev => ({ ...prev, occasion: e.target.value }));
    };

    const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterOptions(prev => ({ ...prev, priceRange: [200, parseInt(e.target.value)] }));
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const isFavorite = (productId: number) => {
        return wishlist.some((item) => item.id === productId);
    };

    const handleToggleWishlist = (product: Product) => {
        if (isFavorite(product.id)) {
            removeFromWishlist(product.id);
            toast.info("تمت الإزالة من المفضلة!");
        } else {
            addToWishlist({ id: product.id, name: product.name, image: product.image, price: product.price});
            toast.success("تمت الإضافة إلى المفضلة!");
        }
    };

    const handleAddToCart = (product: Product) => {
        addToCart({ id: product.id, name: product.name, image: product.image, price: product.price, quantity: 1 });
        toast.success(
            <div>
                ✅ تمت الإضافة!
                <Link href="/cart" className="text-blue-600 underline mr-2">
                    عرض السلة 🛒
                </Link>
            </div>,
            { position: "bottom-right", autoClose: 3000 }
        );
    };

    const resetFilters = () => {
        setFilterOptions({
            gender: "all",
            occasion: "all",
            priceRange: [200, 10000]
        });
        setSearchQuery("");
        setSortBy("recommended");
    };

    const occasionsList = useMemo(() => {
        return [
            "الكل", "رمضان", "عيد الحب", "عيد الأم", "عيد الفطر", 
            "رأس السنة", "عيد زواج", "عيد ميلاد"
        ];
    }, []);

    // تأثيرات الرسوم المتحركة
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen py-4 md:py-8 font-tajawal" dir="rtl">
                <Header />
                <div className="container mx-auto px-3 md:px-4">
                    {/* Search and Filter Toggle */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-md p-4 mb-4 sticky top-0 z-10"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="ابحث عن هدايا..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="relative md:w-40">
                                    <select
                                        className="appearance-none w-full bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        value={sortBy}
                                        onChange={handleSortChange}
                                    >
                                        <option value="recommended">الأكثر شيوعاً</option>
                                        <option value="price-asc">السعر: من الأقل للأعلى</option>
                                        <option value="price-desc">السعر: من الأعلى للأقل</option>
                                        <option value="rating">التقييم</option>
                                        <option value="newest">الأحدث</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-600">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-purple-100 text-purple-700 p-2 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <SlidersHorizontal size={20} />
                                </motion.button>
                            </div>
                        </div>
                        
                        {/* Expanded Filter Options */}
                        {showFilters && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-gray-100"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Gender Filter */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">الجنس:</label>
                                        <div className="relative">
                                            <select
                                                className="appearance-none block w-full bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                value={filterOptions.gender}
                                                onChange={handleGenderChange}
                                            >
                                                <option value="all">الكل</option>
                                                <option value="men">رجالي</option>
                                                <option value="women">نسائي</option>
                                                <option value="kids">أطفال</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-600">
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Occasion Filter */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">المناسبة:</label>
                                        <div className="relative">
                                            <select
                                                className="appearance-none block w-full bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                value={filterOptions.occasion}
                                                onChange={handleOccasionChange}
                                            >
                                                {occasionsList.map((occasion, index) => (
                                                    <option key={index} value={index === 0 ? "all" : occasion}>
                                                        {occasion}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-600">
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            نطاق السعر: <span className="font-normal">{filterOptions.priceRange[1]} جنيه</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="200"
                                            max="10000"
                                            step="100"
                                            value={filterOptions.priceRange[1]}
                                            onChange={handlePriceRangeChange}
                                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="flex justify-between text-gray-500 text-xs mt-1">
                                            <span>200</span>
                                            <span>10000</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end mt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-purple-600 text-sm font-medium hover:underline flex items-center"
                                        onClick={resetFilters}
                                    >
                                        <X size={16} className="ml-1" />
                                        إعادة ضبط الفلاتر
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6"
                    >
                        {/* Results Stats */}
                        {!loading && (
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                                    {filteredItems.length > 0 
                                        ? `${filteredItems.length} هدية متاحة` 
                                        : "لا توجد هدايا متاحة"}
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {filterOptions.gender !== "all" || filterOptions.occasion !== "all" || searchQuery ? (
                                        <span className="flex items-center">
                                            <Filter size={14} className="ml-1" />
                                            تم تطبيق الفلاتر
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {/* Display Active Filters */}
                        {(filterOptions.gender !== "all" || filterOptions.occasion !== "all") && !loading && (
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
                                
                                {filterOptions.gender !== "all" && (
                                    <div className="bg-purple-100 text-purple-700 text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>
                                            {filterOptions.gender === "men" ? "رجالي" : 
                                             filterOptions.gender === "women" ? "نسائي" : "أطفال"}
                                        </span>
                                        <button 
                                            onClick={() => setFilterOptions(prev => ({ ...prev, gender: "all" }))}
                                            className="ml-1 hover:text-purple-900"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                
                                {filterOptions.occasion !== "all" && (
                                    <div className="bg-purple-100 text-purple-700 text-sm rounded-full px-3 py-1 flex items-center">
                                        <span>{filterOptions.occasion}</span>
                                        <button 
                                            onClick={() => setFilterOptions(prev => ({ ...prev, occasion: "all" }))}
                                            className="ml-1 hover:text-purple-900"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Display Results */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 border-4 border-gray-100 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600 font-medium">جاري البحث عن أفضل الهدايا...</p>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                            >
                                {filteredItems.map((gift) => (
                                    <motion.div
                                        key={gift.id}
                                        variants={itemVariants}
                                        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                                    >
                                        <div className="relative">
                                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                <Image
                                                    src={gift.image}
                                                    alt={gift.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    style={{ objectFit: "cover" }}
                                                    className="transition-transform duration-300 hover:scale-105"
                                                />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${isFavorite(gift.id) ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"
                                                    }`}
                                                onClick={() => handleToggleWishlist(gift)}
                                            >
                                                <Heart size={16} fill={isFavorite(gift.id) ? "#fff" : "none"} />
                                            </motion.button>
                                            <div className="absolute bottom-3 right-3 bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded-lg shadow-sm">
                                                {gift.price} جنيه
                                            </div>
                                            
                                            {gift.stock && gift.stock < 10 && (
                                                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">
                                                    {gift.stock <= 3 ? "الكمية محدودة!" : `متبقي ${gift.stock} فقط`}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-gray-800 line-clamp-1">{gift.name}</h3>
                                                <div className="flex items-center text-amber-500">
                                                    <Star size={14} fill="#F59E0B" />
                                                    <span className="text-xs font-medium text-gray-700 mr-1">{gift.rating}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{gift.description}</p>

                                            <div className="flex items-center text-xs text-gray-500 mb-3">
                                                <div className="flex items-center ml-3">
                                                    <Clock size={12} className="ml-1" />
                                                    <span>توصيل سريع</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Truck size={12} className="ml-1" />
                                                    <span>{gift.brand || "متجرنا"}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-purple-600 text-sm font-medium hover:underline"
                                                    onClick={() => setSelectedGift(gift)}
                                                >
                                                    التفاصيل
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center shadow-sm"
                                                    onClick={() => handleAddToCart(gift)}
                                                >
                                                    <ShoppingCart size={14} className="ml-1" />
                                                    إضافة للسلة
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-6 text-center my-8">
                                <div className="flex justify-center mb-4">
                                    <Search size={48} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">لم نعثر على نتائج مطابقة</h3>
                                <p className="text-gray-600 mb-4">
                                    يرجى تجربة مصطلحات بحث مختلفة أو تغيير خيارات التصفية.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center"
                                    onClick={resetFilters}
                                >
                                    <X size={16} className="ml-1" />
                                    إعادة ضبط الفلاتر
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Seasonal Offers Banner */}
                    {!loading && filteredItems.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg overflow-hidden relative"
                        >
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                            
                            <div className="relative z-10">
                                <h3 className="text-xl md:text-2xl font-bold mb-2">عروض مميزة على هدايا {filterOptions.occasion !== "all" ? filterOptions.occasion : "المناسبات الخاصة"}</h3>
                                <p className="text-white/80 mb-4">اكتشف تشكيلة واسعة من الهدايا المميزة لجميع المناسبات بأسعار تنافسية</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                                >
                                    اكتشف العروض
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Footer CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="mt-8 bg-white rounded-xl p-6 text-center shadow-md"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لم تجد ما تبحث عنه؟</h3>
                        <p className="text-gray-600 mb-4 max-w-lg mx-auto">
                            يمكنك الحصول على المزيد من الاقتراحات عن طريق التواصل مع مستشار الهدايا لدينا للحصول على توصيات مخصصة
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm"
                                onClick={() => router.push('/')}
                            >
                                العودة للبداية
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                            >
                                التواصل مع مستشار
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Gift Detail Modal */}
                {selectedGift && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedGift(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{selectedGift.name}</h3>
                                <button 
                                    onClick={() => setSelectedGift(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
                                    <Image
                                        src={selectedGift.image}
                                        alt={selectedGift.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                                
                                <div className="flex flex-col">
                                    <div className="flex items-center mb-4">
                                        <div className="flex items-center text-amber-500 mr-4">
                                            <Star size={18} fill="#F59E0B" />
                                            <span className="font-bold ml-1">{selectedGift.rating}</span>
                                            <span className="text-gray-500 text-sm mr-1">(120)</span>
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            ماركة: {selectedGift.brand || "متجرنا"}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-2 w-fit">
                                        {selectedGift.category === "men" ? "هدية رجالية" : 
                                         selectedGift.category === "women" ? "هدية نسائية" : "هدية للأطفال"}
                                    </div>
                                    
                                    <div className="text-2xl font-bold text-purple-600 mb-4">
                                        {selectedGift.price} جنيه
                                    </div>
                                    
                                    <p className="text-gray-700 mb-4">{selectedGift.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Clock className="ml-2" size={16} />
                                            <span>توصيل سريع خلال يومين</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Truck className="ml-2" size={16} />
                                            <span>شحن مجاني (القاهرة)</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Check className="ml-2" size={16} />
                                            <span>ضمان جودة المنتج</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <Bookmark className="ml-2" size={16} />
                                            <span>تغليف هدايا مجاني</span>
                                        </div>
                                    </div>
                                    
                                    {selectedGift.tags && selectedGift.tags.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-bold text-gray-700 mb-2">المميزات:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedGift.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="bg-purple-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm flex-grow flex items-center justify-center"
                                            onClick={() => {
                                                handleAddToCart(selectedGift);
                                                setSelectedGift(null);
                                            }}
                                        >
                                            <ShoppingCart size={18} className="ml-2" />
                                            إضافة للسلة
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`border py-2 px-4 rounded-lg font-bold transition-colors flex items-center justify-center ${
                                                isFavorite(selectedGift.id) 
                                                    ? "bg-red-50 text-red-600 border-red-200" 
                                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                            }`}
                                            onClick={() => handleToggleWishlist(selectedGift)}
                                        >
                                            <Heart 
                                                size={18} 
                                                className="ml-2" 
                                                fill={isFavorite(selectedGift.id) ? "currentColor" : "none"} 
                                            />
                                            {isFavorite(selectedGift.id) ? "إزالة من المفضلة" : "أضف للمفضلة"}
                                        </motion.button>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                                        >
                                            <Share2 size={16} className="ml-1" />
                                            مشاركة
                                        </motion.button>
                                        
                                        <div className="text-sm text-gray-500">
                                            {selectedGift.stock ? (
                                                selectedGift.stock < 10 ? (
                                                    <span className="text-red-500">متبقي {selectedGift.stock} فقط!</span>
                                                ) : (
                                                    <span className="text-green-600">متوفر</span>
                                                )
                                            ) : (
                                                <span className="text-red-500">غير متوفر حالياً</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                
                <ToastContainer 
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={true}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <Footer />
            </div>
        </>
    );
};

export default GiftResultsPage;