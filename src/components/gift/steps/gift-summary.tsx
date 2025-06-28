"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShoppingCart, Package, Gift, Check, Sparkles, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import type { RootState } from "@/lib/redux/store"
import { resetGift } from "@/lib/redux/slices/giftSlice"
import { addItem, removeItem, updateItemQuantity } from "@/lib/redux/slices/cartSlice"
import type { CartItem, GiftData } from "@/lib/redux/slices/cartSlice"

export default function GiftSummary() {
  const selectedBox = useSelector((state: RootState) => state.gift.selectedBox)
  const selectedProducts = useSelector((state: RootState) => state.gift.selectedProducts) || []
  const selectedSweets = useSelector((state: RootState) => state.gift.selectedSweets) || []
  const selectedBag = useSelector((state: RootState) => state.gift.selectedBag)
  const cartItems = useSelector((state: RootState) => state.cart.cart) || []
  const dispatch = useDispatch()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const calculateSubtotal = (items: { quantity?: number; price: number }[]) => {
    return items.reduce((total, item) => {
      const quantity = item.quantity || 1
      return total + item.price * quantity
    }, 0)
  }

  const boxSubtotal = selectedBox ? selectedBox.price : 0
  const productsSubtotal = calculateSubtotal(selectedProducts)
  const sweetsSubtotal = calculateSubtotal(selectedSweets)
  const bagSubtotal = selectedBag ? selectedBag.price : 0

  const total = boxSubtotal + productsSubtotal + sweetsSubtotal + bagSubtotal

  // دالة إضافة الهدية للسلة
  const handleAddToCart = async () => {
    if (selectedProducts.length === 0) {
      setError("يرجى إضافة منتج واحد على الأقل للهدية")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // إنشاء بيانات الهدية
      const giftData: GiftData = {
        items: [
          ...selectedProducts.map(product => ({
            name: product.name,
            quantity: product.quantity || 1,
            image: product.image || "/placeholder.svg",
            price: product.price
          })),
          ...selectedSweets.map(sweet => ({
            name: sweet.name,
            quantity: 1,
            image: sweet.image || "/placeholder.svg",
            price: sweet.price
          }))
        ],
        box: selectedBox ? {
          name: selectedBox.name,
          image: selectedBox.image || "/placeholder.svg",
          price: selectedBox.price
        } : null,
        wrap: selectedBag ? {
          name: selectedBag.name,
          image: selectedBag.image || "/placeholder.svg",
          price: selectedBag.price
        } : null,
        totalPrice: total,
        createdAt: new Date().toISOString()
      }

      // إنشاء عنصر السلة
      const giftDescription = `هدية مخصصة تحتوي على ${selectedProducts.length} منتج${selectedProducts.length > 1 ? 'ات' : ''}${selectedSweets.length > 0 ? ` و ${selectedSweets.length} حلويات` : ''}`
      
      const cartItem: CartItem = {
        id: `gift-${Date.now()}`,
        name: `هدية مخصصة - ${selectedBox?.name || 'صندوق هدايا'}`,
        image: selectedBox?.image || "/placeholder.svg",
        price: total,
        quantity: 1,
        category: "هدايا",
        giftData: giftData,
        giftDetails: giftDescription
      }

      // إضافة الهدية للسلة
      dispatch(addItem({ item: cartItem }))

      // حذف المنتجات الأصلية من السلة التي تم إضافتها للهدية
      let removedCount = 0
      let updatedCount = 0
      
      selectedProducts.forEach(product => {
        const cartItem = cartItems.find(item => item.id === product.id)
        if (cartItem) {
          const giftQuantity = product.quantity || 1
          const currentCartQuantity = cartItem.quantity
          const newQuantity = currentCartQuantity - giftQuantity
          
          if (newQuantity <= 0) {
            dispatch(removeItem({ id: product.id }))
            removedCount++
          } else {
            dispatch(updateItemQuantity({ id: product.id, quantity: newQuantity }))
            updatedCount++
          }
        }
      })

      const cartUpdateMessage = removedCount > 0 || updatedCount > 0 
        ? `تمت إضافة الهدية إلى السلة وتحديث السلة: ${removedCount} منتج محذوف، ${updatedCount} منتج محدث الكمية!`
        : `تمت إضافة الهدية إلى السلة!`

      toast.success(cartUpdateMessage, {
        position: "top-center",
        autoClose: 3000
      })

      dispatch(resetGift())
      setOrderComplete(true)
      setTimeout(() => {
        router.push("/cart")
      }, 1500)
    } catch (err) {
      console.error("Error adding gift to cart:", err)
      setError("حدث خطأ أثناء إضافة الهدية إلى السلة. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsSubmitting(false)
      setShowConfirmDialog(false)
    }
  }

  if (orderComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="text-center py-16"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-6 shadow-xl">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
          تم إنشاء هديتك بنجاح!
        </h2>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto leading-relaxed">
          تمت إضافة هديتك المخصصة إلى السلة بنجاح، جاري توجيهك لإتمام الطلب...
        </p>
        <div className="flex items-center justify-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-8">
      {/* العنوان والوصف */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mb-4 shadow-lg">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
          ملخص هديتك المخصصة
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          مراجعة نهائية لجميع محتويات هديتك الرائعة قبل إضافتها للسلة
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Box Summary */}
        {selectedBox && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-blue-800">
                صندوق الهدية
              </h3>
            </div>
            <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={selectedBox.image || "/placeholder.svg"}
                  alt={selectedBox.name}
                  fill
                  className="object-cover p-2"
                />
              </div>
              <div className="mr-4 flex-grow">
                <h4 className="font-bold text-gray-900">{selectedBox.name}</h4>
                <p className="text-sm text-blue-600 font-medium">{selectedBox.dimensions}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedBox.price}
                </p>
                <p className="text-sm text-gray-500">جنيه</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Summary */}
        {selectedProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-green-800">
                المنتجات ({selectedProducts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {selectedProducts.map((product, index) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover p-2"
                    />
                  </div>
                  <div className="mr-4 flex-grow">
                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                    <p className="text-sm text-green-600 font-medium">الكمية: {product.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {product.price * (product.quantity || 1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.price} × {product.quantity || 1}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div className="pt-3 border-t-2 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-800">المجموع الفرعي:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {productsSubtotal} جنيه
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sweets Summary */}
        {selectedSweets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-pink-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-pink-800">
                الحلويات ({selectedSweets.length})
              </h3>
            </div>
            <div className="space-y-3">
              {selectedSweets.map((sweet, index) => (
                <motion.div 
                  key={sweet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={sweet.image || "/placeholder.svg"}
                      alt={sweet.name}
                      fill
                      className="object-cover p-2"
                    />
                  </div>
                  <div className="mr-4 flex-grow">
                    <h4 className="font-bold text-gray-900">{sweet.name}</h4>
                    <p className="text-sm text-pink-600 font-medium">الكمية: {sweet.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                      {sweet.price * sweet.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sweet.price} × {sweet.quantity}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div className="pt-3 border-t-2 border-pink-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-pink-800">المجموع الفرعي:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                    {sweetsSubtotal} جنيه
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bag Summary */}
        {selectedBag && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-purple-800">
                شنطة التغليف
              </h3>
            </div>
            <div className="flex items-center bg-white rounded-xl p-4 shadow-sm">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                <Image
                  src={selectedBag.image || "/placeholder.svg"}
                  alt={selectedBag.name}
                  fill
                  className="object-cover p-2"
                />
              </div>
              <div className="mr-4 flex-grow">
                <h4 className="font-bold text-gray-900">{selectedBag.name}</h4>
                <p className="text-sm text-purple-600 font-medium">{selectedBag.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {selectedBag.price}
                </p>
                <p className="text-sm text-gray-500">جنيه</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Total Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">إجمالي الهدية</h3>
              <p className="text-gray-300">جميع المكونات المحددة</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {total}
              </p>
              <p className="text-gray-300">جنيه مصري</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
              {error}
            </div>
          )}
          
          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={selectedProducts.length === 0 || isSubmitting}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            {isSubmitting ? "جاري الإضافة..." : "إضافة الهدية للسلة"}
          </Button>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">تأكيد إضافة الهدية</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              هل أنت متأكد من إضافة هذه الهدية إلى السلة بإجمالي {total} جنيه؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-4">
            <AlertDialogCancel className="flex-1">إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAddToCart}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {isSubmitting ? "جاري الإضافة..." : "تأكيد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
