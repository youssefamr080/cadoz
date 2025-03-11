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
    season: string;
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
        season: "all",
        priceRange: [200, 10000]
    });
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy] = useState<string>("recommended");
    const [] = useState(false);
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
                season: "all",
                priceRange: [200, 10000]
            };
        } catch (error) {
            console.error("Failed to load filter options from local storage:", error);
            return {
                gender: "all",
                occasion: "all",
                season: "all",
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
        }, 1500);
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

        //Apply season filter
        if (filterOptions.season !== "all") {
            filtered = filtered.filter(product => product.season?.includes(filterOptions.season));
        }

        filtered = filtered.filter(item => item.price >= filterOptions.priceRange[0] && item.price <= filterOptions.priceRange[1]);

        // Apply search 
        if (searchQuery) {
            filtered = filtered.filter(
                item =>
                    item.name.includes(searchQuery) ||
                    item.description.includes(searchQuery) ||
                    item.tags.some(tag => tag.includes(searchQuery))
            );
        }
        // Sort the products:
        if (sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Handle undefined ratings
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

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterOptions(prev => ({ ...prev, season: e.target.value }));
    };

    const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterOptions(prev => ({ ...prev, priceRange: [200, parseInt(e.target.value)] }));
    };

    const isFavorite = (productId: number) => {
        return wishlist.some((item) => item.id === productId);
    };

    const handleToggleWishlist = (product: Product) => {
        if (isFavorite(product.id)) {
            removeFromWishlist(product.id);
            toast.info("تمت الإزالة من المفضلة!");
        } else {
            addToWishlist({ id: product.id, name: product.name, image: product.image, price: product.price, stock: product.stock || 0 });
            toast.success("تمت الإضافة إلى المفضلة!");
        }
    };

    const handleAddToCart = (product: Product) => {
        addToCart({ id: product.id, name: product.name, image: product.image, price: product.price, quantity: 1 });
        toast.success(
            <div>
                ✅ تمت الإضافة!
                <Link href="/cart" className="text-blue-600 underline ml-2">
                    عرض السلة 🛒
                </Link>
            </div>,
            { position: "bottom-right", autoClose: 4000 }
        );
    };

    const occasionsList = useMemo(() => {
        return [
            "all", "عيد ميلاد", "عيد زواج", "تخرج", "زيارة", "عيد الأم",
            "عيد الأب", "يوم المعلم", "مولود جديد", "نجاح", "ترقية", "شفاء", "سلامة الوصول",
            "العودة للمنزل", "ذكرى صداقة", "تأسيس شركة", "عيد الأضحى", "عيد الفطر", "عيد الميلاد",
            "رأس السنة الهجرية", "رأس السنة الميلادية", "عيد العمال", "عيد الاستقلال", "يوم الشهيد",
            "يوم الأم", "يوم الأب", "يوم الطفل", "يوم المرأة العالمي"
        ];
    }, []);

    const seasonsList = useMemo(() => {
        return [
            "all", "رمضان", "عيد الحب", "عيد الأم", "الشتاء", "الصيف", "الربيع", "الخريف",
            "العودة إلى المدارس", "الجمعة البيضاء", "نهاية العام", "بداية العام", "العطلة الصيفية",
        ];
    }, []);

    // عرض تفاصيل الهدية

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
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen py-8 font-tajawal" dir="rtl">
                <Header />
                <div className="container mx-auto px-4">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
                    >
                        {/* Filtering Section */}
                        <motion.div className="mb-6 p-4 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">خيارات التصفية</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Gender Dropdown */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">الجنس:</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                            value={filterOptions.gender}
                                            onChange={handleGenderChange}
                                        >
                                            <option value="all">الكل</option>
                                            <option value="men">رجالي</option>
                                            <option value="women">نسائي</option>
                                            <option value="kids">أطفال</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Occasion Dropdown */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">المناسبة:</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                            value={filterOptions.occasion}
                                            onChange={handleOccasionChange}
                                        >
                                            <option value="all">الكل</option>
                                            {occasionsList.map((occasion) => (
                                                <option key={occasion} value={occasion}>{occasion}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Season Dropdown */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">الموسم:</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                                            value={filterOptions.season}
                                            onChange={handleSeasonChange}
                                        >
                                            <option value="all">الكل</option>
                                            {seasonsList.map((season) => (
                                                <option key={season} value={season}>{season}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Price Range Slider */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">نطاق السعر:</label>
                                    <input
                                        type="range"
                                        min="200"
                                        max="10000"
                                        step="100"
                                        value={filterOptions.priceRange[1]}
                                        onChange={handlePriceRangeChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>200</span>
                                        <span>{filterOptions.priceRange[1]}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Display Results */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-600 font-medium">جاري البحث عن أفضل الهدايا...</p>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredItems.map((gift) => (
                                    <motion.div
                                        key={gift.id}
                                        variants={itemVariants}
                                        className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div className="relative">
                                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                                <Image
                                                    src={gift.image}
                                                    alt={gift.name}
                                                    fill
                                                    style={{ objectFit: "cover" }}
                                                    className="transition-transform duration-300 hover:scale-110"
                                                />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${isFavorite(gift.id) ? "bg-red-500 text-white" : "bg-white/70 text-gray-600"
                                                    }`}
                                                onClick={() => handleToggleWishlist(gift)}
                                            >
                                                <Heart size={16} fill={isFavorite(gift.id) ? "#fff" : "none"} />
                                            </motion.button>
                                            <div className="absolute bottom-3 right-3 bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded-lg">
                                                {gift.price} جنيه
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-800">{gift.name}</h3>
                                                <div className="flex items-center text-amber-500">
                                                    <Star size={16} fill="#F59E0B" />
                                                    <span className="text-sm font-medium text-gray-700 mr-1">{gift.rating}</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gift.description}</p>

                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <div className="flex items-center ml-4">
                                                    <Clock size={14} className="ml-1" />
                                                    <span>{"توصيل سريع"}</span> {/* Fallback */}
                                                </div>
                                                <div className="flex items-center">
                                                    <Truck size={14} className="ml-1" />
                                                    <span>{gift.brand || "متجرنا"}</span> {/* Fallback */}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="text-purple-600 font-medium text-sm hover:underline"
                                                    onClick={() => setSelectedGift(gift)}
                                                >
                                                    عرض التفاصيل
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center"
                                                    onClick={() => handleAddToCart(gift)}
                                                >
                                                    <ShoppingCart size={14} className="ml-1" />
                                                    شراء الآن
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="bg-white rounded-xl p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <Search size={40} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج مطابقة</h3>
                                <p className="text-gray-600 mb-4">
                                    لم نتمكن من العثور على هدايا تطابق معايير البحث. يرجى تغيير المعايير أو إعادة ضبط خيارات التصفية.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-purple-600 font-medium hover:underline"
                                    onClick={() => {
                                      setFilterOptions({
                                        gender: "all",
                                        occasion: "all",
                                        season: "all",
                                        priceRange: [200, 10000]
                                    });
                                    setSearchQuery("");
                                }}
                                >
                                    إعادة ضبط خيارات التصفية
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Footer Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="mt-12 bg-white rounded-xl p-6 text-center"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لم تجد ما تبحث عنه؟</h3>
                        <p className="text-gray-600 mb-4">
                            يمكنك الحصول على المزيد من الاقتراحات عن طريق تعديل اختياراتك أو الاتصال بمستشار الهدايا لدينا
                        </p>
                        <div className="flex justify-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
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
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedGift(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-lg max-w-2xl w-full overflow-hidden"
                        >
                            <div className="relative">
                                <div className="h-80 bg-gray-200 relative overflow-hidden">
                                    <Image
                                        src={selectedGift.image}
                                        alt={selectedGift.name}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        className="transition-transform duration-300 hover:scale-110"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute top-3 left-3 bg-white/70 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center"
                                    onClick={() => setSelectedGift(null)}
                                >
                                    <X size={20} />
                                </motion.button>
                                <div className="absolute bottom-3 right-3 bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded-lg">
                                    {selectedGift.price} جنيه
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-gray-800">{selectedGift.name}</h3>
                                    <div className="flex items-center text-amber-500">
                                        <Star size={18} fill="#F59E0B" />
                                        <span className="text-sm font-medium text-gray-700 mr-1">{selectedGift.rating}</span>
                                    </div>
                                </div>

                                <p className="text-gray-700 text-base mb-6">{selectedGift.description}</p>

                                <div className="flex items-center text-sm text-gray-500 mb-6">
                                    <div className="flex items-center ml-6">
                                        <Clock size={16} className="ml-1" />
                                        <span>{"توصيل سريع"}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Truck size={16} className="ml-1" />
                                        <span>{selectedGift.brand || "متجرنا"}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                                        >
                                            <Share2 size={16} className="ml-1" />
                                            شارك
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors mr-4"
                                        >
                                            <Bookmark size={16} className="ml-1" />
                                            حفظ
                                        </motion.button>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center"
                                        onClick={() => handleAddToCart(selectedGift)}
                                    >
                                        <ShoppingCart size={16} className="ml-1" />
                                        شراء الآن
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                <ToastContainer />
                <Footer />
            </div>
        </>
    );
};

export default GiftResultsPage;