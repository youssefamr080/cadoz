"use client";
import React from "react";
import { useCart } from "../../context/CartContext";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiShoppingBag, FiGift, FiArrowLeft, FiTrash2, FiPlus, FiMinus, FiTag } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CartPage = () => {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    shipping,
    updateShipping,
    availableGovernorates,
    promoCode,
    setPromoCode,
    applyPromoCode,
    getCartTotals,
    isCartEmpty,
    itemCount,
  } = useCart();

  const [isSending, setIsSending] = React.useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = React.useState(false);
  const { subtotal, shippingFees, discount, tax, total } = getCartTotals();

  const sendInvoiceWhatsApp = () => {
    if (isCartEmpty) {
      toast.error("السلة فارغة!");
      return;
    }

    if (!shipping.governorate) {
      toast.error("الرجاء اختيار المحافظة أولاً");
      return;
    }

    setIsSending(true);
    try {
      const message = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/201026972523?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");

      setTimeout(() => {
        clearCart();
        toast.success("تم إرسال الطلب بنجاح!");
      }, 2000);
    } finally {
      setIsSending(false);
    }
  };

  const generateWhatsAppMessage = () => {
    let message = `🛒 *فاتورة طلب من CADOZ* 🛍️\n\n`;
    message += `📍 المحافظة: ${shipping.governorate}\n`;
    if (shipping.address) message += `📍 العنوان: ${shipping.address}\n`;
    if (shipping.phone) message += `📞 رقم الهاتف: ${shipping.phone}\n`;
    message += `----------------------------------------\n`;
    message += `📋 *تفاصيل الطلب:*\n\n`;
  
    cart.forEach((item, index) => {
      message += `📌 *${index + 1}.* ${item.name} (ID: ${item.id})\n`;
      message += `   ✨ السعر: ${item.price.toFixed(2)} ج.م × ${item.quantity} = ${(
        item.price * item.quantity
      ).toFixed(2)} ج.م\n`;
      
      // Handle gift items with detailed breakdown
      if (item.giftData) {
        message += `   🎁 *تفاصيل الهدية:*\n`;
        
        // Add gift items
        if (item.giftData.items && item.giftData.items.length > 0) {
          message += `      📦 *المنتجات:*\n`;
          item.giftData.items.forEach((giftItem) => {
            message += `         - ${giftItem.name} × ${giftItem.quantity} (${giftItem.price.toFixed(2)} ج.م للقطعة)\n`;
          });
        }
        
        // Add gift box if selected
        if (item.giftData.box) {
          message += `      📦 *صندوق:* ${item.giftData.box.name} (${item.giftData.box.price.toFixed(2)} ج.م)\n`;
        }
        
        // Add gift wrap if selected
        if (item.giftData.wrap) {
          message += `      🎀 *تغليف:* ${item.giftData.wrap.name} (${item.giftData.wrap.price.toFixed(2)} ج.م)\n`;
        }
        
        // Add recipient and message if provided
        if (item.giftData.recipient) {
          message += `      👤 *المستلم:* ${item.giftData.recipient}\n`;
        }
        
        if (item.giftData.message) {
          message += `      💌 *رسالة:* "${item.giftData.message}"\n`;
        }
      } else if (item.giftDetails) {
        message += `   🎁 *محتويات الهدية:* ${item.giftDetails}\n`;
      }
      
      message += `\n`;
    });
  
    message += `----------------------------------------\n`;
    message += `💵 المجموع الفرعي: ${subtotal.toFixed(2)} ج.م\n`;
    message += `🚚 رسوم التوصيل: ${shippingFees.toFixed(2)} ج.م\n`;
    if (discount > 0) message += `🎟️ الخصم: ${discount.toFixed(2)} ج.م\n`;
    if (tax > 0) message += `💰 الضريبة: ${tax.toFixed(2)} ج.م\n`;
    message += `💰 الإجمالي: ${total.toFixed(2)} ج.م\n\n`;
    if (promoCode.isValid) message += `🏷️ كود الخصم المستخدم: ${promoCode.code}\n\n`;
    message += `🔗 شكراً لتسوقك معنا! ❤️`;
  
    return message;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.code) {
      toast.error("الرجاء إدخال كود الخصم");
      return;
    }
    
    setIsApplyingPromo(true);
    try {
      const success = await applyPromoCode();
      if (!success) {
        // Toast already shown inside applyPromoCode
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleQuantityChange = (id: number, change: number) => {
    if (change > 0) {
      incrementQuantity(id);
    } else {
      decrementQuantity(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      <Header />

      <div className="container mx-auto px-2 sm:px-4 py-6 max-w-4xl">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-lg shadow-sm mr-2 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold flex items-center">
            <FiShoppingBag className="mr-2 text-purple-600" />
            سلة التسوق ({itemCount})
          </h1>
        </div>

        <AnimatePresence>
          {isCartEmpty ? (
            <EmptyCart />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="divide-y divide-gray-100">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {item.giftData ? (
                        <GiftCartItem
                          item={item}
                          onQuantityChange={handleQuantityChange}
                          onRemove={removeFromCart}
                        />
                      ) : (
                        <CartItem
                          item={item}
                          onQuantityChange={handleQuantityChange}
                          onRemove={removeFromCart}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="space-y-3 mb-4">
                  <div className="flex flex-col gap-2">
                    <select
                      value={shipping.governorate}
                      onChange={(e) => updateShipping({ governorate: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">اختر المحافظة</option>
                      {availableGovernorates.map((governorate) => (
                        <option key={governorate} value={governorate}>
                          {governorate}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="كود الخصم"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        value={promoCode.code}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <button
                        onClick={handleApplyPromoCode}
                        disabled={isApplyingPromo}
                        className={`px-4 py-2 flex items-center gap-1 rounded-lg transition-colors ${
                          isApplyingPromo
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                        }`}
                      >
                        <FiTag className="w-4 h-4" />
                        <span>{isApplyingPromo ? "جاري..." : "تطبيق"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي</span>
                      <span>{subtotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رسوم التوصيل</span>
                      <span>{shippingFees.toFixed(2)} ج.م</span>
                    </div>
                    {promoCode.isValid && (
                      <div className="flex justify-between text-green-600">
                        <span>الخصم</span>
                        <span>-{discount.toFixed(2)} ج.م</span>
                      </div>
                    )}
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span>الضريبة (14%)</span>
                        <span>{tax.toFixed(2)} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>الإجمالي</span>
                      <span className="text-purple-600">{total.toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/gift')}
                    className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiGift className="text-xl" />
                    <span>تجهيز كهدية</span>
                  </button>

                  <button
                    onClick={sendInvoiceWhatsApp}
                    disabled={isSending || !shipping.governorate}
                    className={`bg-green-500 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                      ${(isSending || !shipping.governorate) ? 'opacity-75 cursor-not-allowed' : 'hover:bg-green-600 hover:shadow-md'}`}
                  >
                    <FaWhatsapp className="text-xl" />
                    <span>إرسال الطلب عبر واتساب</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

const EmptyCart = () => (
  <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow duration-300">
    <div className="max-w-md mx-auto">
      <div className="mb-6 flex justify-center">
        <div className="text-6xl text-purple-500"></div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-3 font-[Tajawal]">
        سلتك فارغة!
      </h3>
      <p className="text-gray-600 mb-8 text-lg">
        ابدأ رحلة التسوق لاكتشاف عالم الهدايا الساحر
      </p>

      <div className="grid gap-4">
        <button
          onClick={() => window.location.href = '/gift'}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-xl 
          flex items-center justify-center gap-2 text-lg font-semibold shadow-lg hover:shadow-purple-200"
        >
          <FiGift className="w-6 h-6" />
          <span> شراء ملحقات الهدية</span>
        </button>

        <button
          onClick={() => window.location.href = '/'}
          className="border-2 border-purple-500 text-purple-600 px-8 py-4 rounded-xl 
          flex items-center justify-center gap-2 text-lg font-medium hover:bg-purple-50"
        >
          <FiShoppingBag className="w-6 h-6" />
          <span>تصفح المتجر</span>
        </button>
      </div>
    </div>
  </div>
);

interface CartItemProps {
  item: {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
    stock?: number;
    category?: string;
    variant?: string;
    discount?: number;
    originalPrice?: number;
  };
  onQuantityChange: (id: number, change: number) => void;
  onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  // Calculate the actual price considering discounts
  const displayPrice = item.discount && item.originalPrice 
    ? item.originalPrice - (item.originalPrice * item.discount)
    : item.price;
  
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
          <Image
            src={item.image}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            quality={85}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-medium line-clamp-1">{item.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-purple-600 font-bold">{displayPrice.toFixed(2)} ج.م</p>
            {item.discount && item.originalPrice && (
              <p className="text-gray-500 text-sm line-through">{item.originalPrice.toFixed(2)} ج.م</p>
            )}
          </div>
          {item.variant && (
            <p className="text-gray-500 text-sm">{item.variant}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-gray-100 rounded-lg border">
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            aria-label="تقليل الكمية"
            className="p-1 px-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="px-2 min-w-[30px] text-center">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            aria-label="زيادة الكمية"
            disabled={item.stock !== undefined && item.quantity >= item.stock}
            className={`p-1 px-2 transition-colors ${
              item.stock !== undefined && item.quantity >= item.stock
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          aria-label="حذف من السلة"
          className="text-red-500 p-2 hover:text-red-600 transition-colors"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// New component specifically for gift items
interface GiftCartItemProps {
  item: {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
    stock?: number;
    category?: string;
    variant?: string;
    giftDetails?: string;
    giftData?: {
      items: Array<{
        name: string;
        quantity: number;
        image: string;
        price: number;
      }>;
      box: {
        name: string;
        image: string;
        price: number;
      } | null;
      wrap: {
        name: string;
        image: string;
        price: number;
      } | null;
      message?: string;
      recipient?: string;
    };
  };
  onQuantityChange: (id: number, change: number) => void;
  onRemove: (id: number) => void;
}

const GiftCartItem: React.FC<GiftCartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className="hover:bg-gray-50 transition-colors divide-y divide-gray-100">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-gradient-to-br from-purple-50 to-pink-50">
            <Image
              src={item.image}
              alt={item.name}
              layout="fill"
              objectFit="cover"
              quality={85}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiGift className="text-2xl text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium line-clamp-1">{item.name}</h3>
              <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">هدية</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-purple-600 font-bold">{item.price.toFixed(2)} ج.م</p>
            </div>
            <button 
              onClick={toggleExpand}
              className="text-xs text-purple-600 mt-1 flex items-center gap-1 hover:underline"
            >
              {expanded ? "إخفاء التفاصيل" : "عرض تفاصيل الهدية"}
              <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg border">
            <button
              onClick={() => onQuantityChange(item.id, -1)}
              aria-label="تقليل الكمية"
              className="p-1 px-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <span className="px-2 min-w-[30px] text-center">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.id, 1)}
              aria-label="زيادة الكمية"
              disabled={item.stock !== undefined && item.quantity >= item.stock}
              className={`p-1 px-2 transition-colors ${
                item.stock !== undefined && item.quantity >= item.stock
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-purple-600"
              }`}
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            aria-label="حذف من السلة"
            className="text-red-500 p-2 hover:text-red-600 transition-colors"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {expanded && item.giftData && (
        <div className="bg-gray-50 p-3 space-y-3 text-sm">
          {/* Gift recipient and message */}
          {(item.giftData.recipient || item.giftData.message) && (
            <div className="bg-white p-2 rounded-lg border border-purple-100">
              {item.giftData.recipient && (
                <div className="mb-1">
                  <span className="font-medium">المستلم:</span> {item.giftData.recipient}
                </div>
              )}
              {item.giftData.message && (
                <div>
                  <span className="font-medium">الرسالة:</span> 
                  <p className="italic mt-1 text-gray-600 border-r-2 border-purple-300 pr-2">&quot;{item.giftData.message}&quot;</p>
                </div>
              )}
            </div>
          )}
          
          {/* Gift items */}
          {item.giftData.items && item.giftData.items.length > 0 && (
            <div>
              <div className="font-medium mb-2 text-purple-700">منتجات الهدية:</div>
              <div className="space-y-2">
                {item.giftData.items.map((giftItem, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                    <div className="relative w-8 h-8 rounded overflow-hidden border">
                      <Image
                        src={giftItem.image}
                        alt={giftItem.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-xs">{giftItem.name}</div>
                      <div className="text-xs text-gray-500">{giftItem.price.toFixed(2)} ج.م × {giftItem.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Gift box and wrap */}
          <div className="flex gap-2 flex-wrap">
            {item.giftData.box && (
              <div className="bg-white p-2 rounded-lg border flex-1 min-w-[45%]">
                <div className="font-medium text-amber-700 mb-1">صندوق الهدية:</div>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded overflow-hidden border">
                    <Image
                      src={item.giftData.box.image}
                      alt={item.giftData.box.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs">{item.giftData.box.name}</div>
                    <div className="text-xs text-gray-500">{item.giftData.box.price.toFixed(2)} ج.م</div>
                  </div>
                </div>
              </div>
            )}
            
            {item.giftData.wrap && (
              <div className="bg-white p-2 rounded-lg border flex-1 min-w-[45%]">
                <div className="font-medium text-pink-700 mb-1">تغليف الهدية:</div>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded overflow-hidden border">
                    <Image
                      src={item.giftData.wrap.image}
                      alt={item.giftData.wrap.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs">{item.giftData.wrap.name}</div>
                    <div className="text-xs text-gray-500">{item.giftData.wrap.price.toFixed(2)} ج.م</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;