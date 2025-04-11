"use client"

import { useEffect } from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useGift } from "@/context/gift-context"
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
import { ShoppingCart, Package, Gift, Check } from "lucide-react"
import Image from "next/image"
import PersonalMessage from "@/components/gift/personal-message"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { addGiftToCart } from "@/lib/redux/slices/cartSlice"
import { clearGift } from "@/lib/redux/slices/giftSlice"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function GiftSummary() {
  const { selectedBox, selectedProducts, selectedDecorations, selectedBag, personalMessage } = useGift()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const isSubmitting = useAppSelector((state) => state.cart.isLoading)
  const cartError = useAppSelector((state) => state.cart.error)

  const router = useRouter()

  interface Item {
    quantity?: number;
    price: number;
  }
  
    const calculateSubtotal = (items: Item[]) => {
      return items.reduce((total, item) => {
        const quantity = item.quantity || 1
        return total + item.price * quantity
      }, 0)
  }

  const boxSubtotal = selectedBox ? selectedBox.price : 0
  const productsSubtotal = calculateSubtotal(selectedProducts)
  const decorationsSubtotal = calculateSubtotal(selectedDecorations)
  const bagSubtotal = selectedBag ? selectedBag.price : 0

  const total = boxSubtotal + productsSubtotal + decorationsSubtotal + bagSubtotal

  // Función para agregar la regalo al carrito
  const handleAddToCart = async () => {
    if (selectedProducts.length === 0) {
      setError("يرجى إضافة منتج واحد على الأقل للهدية")
      return
    }

    try {
      setError(null)

      // Usar el thunk de Redux para agregar al carrito
      const resultAction = await dispatch(
        addGiftToCart({
          selectedBox,
          selectedProducts,
          selectedDecorations,
          selectedBag,
          personalMessage: personalMessage || undefined,
        }),
      )

      if (addGiftToCart.fulfilled.match(resultAction)) {
        // Mostrar mensaje de éxito
        toast.success("تمت إضافة الهدية إلى السلة بنجاح!", {
          position: "top-center",
          autoClose: 1500,
        })

        setOrderComplete(true)

        // Limpiar la regalo después de agregarها al carrito
        setTimeout(() => {
          dispatch(clearGift())
          // التوجيه إلى صفحة السلة الحالية
          router.push("/cart-page") // تأكد من تغيير هذا إلى المسار الصحيح لصفحة السلة الحالية
        }, 1500)
      } else if (addGiftToCart.rejected.match(resultAction)) {
        setError((resultAction.payload as string) || "حدث خطأ أثناء إضافة الهدية إلى السلة")
      }
    } catch (err) {
      console.error("Error adding gift to cart:", err)
      setError("حدث خطأ أثناء إضافة الهدية إلى السلة. يرجى المحاولة مرة أخرى.")
    } finally {
      setShowConfirmDialog(false)
    }
  }

  // Mostrar mensaje de error de Redux si existe
  useEffect(() => {
    if (cartError) {
      setError(cartError)
    }
  }, [cartError])

  if (orderComplete) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تمت إضافة الهدية إلى السلة بنجاح!</h2>
        <p className="text-gray-600 mb-6">جاري توجيهك إلى صفحة السلة...</p>
      </motion.div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">ملخص الهدية</h2>
        <p className="text-gray-600">مراجعة اختياراتك وإضافة الهدية إلى السلة</p>
      </div>

      {/* Add Personal Message Component */}
      <PersonalMessage />

      <div className="space-y-6">
        {/* Box Summary */}
        {selectedBox && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-rose-500" />
              الصندوق
            </h3>
            <div className="flex items-center">
              <div className="relative w-16 h-16 rounded overflow-hidden bg-white">
                <Image
                  src={selectedBox.image || "/placeholder.svg"}
                  alt={selectedBox.name}
                  fill
                  className="object-cover p-2"
                />
              </div>
              <div className="mr-4 flex-grow">
                <h4 className="font-medium">{selectedBox.name}</h4>
                <p className="text-sm text-gray-500">{selectedBox.dimensions}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-600">{selectedBox.price} جنيه</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Summary */}
        {selectedProducts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-rose-500" />
              المنتجات
            </h3>
            <div className="space-y-3">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-white">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover p-2"
                    />
                  </div>
                  <div className="mr-4 flex-grow">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-gray-500">الكمية: {product.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">{product.price * (product.quantity || 1)} جنيه</p>
                    <p className="text-xs text-gray-500">
                      {product.price} × {product.quantity || 1}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">المجموع الفرعي:</span>
                  <span className="font-bold">{productsSubtotal} جنيه</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decorations Summary */}
        {selectedDecorations.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">الزينة</h3>
            <div className="space-y-3">
              {selectedDecorations.map((decoration) => (
                <div key={decoration.id} className="flex items-center">
                  <div className="relative w-16 h-16 rounded overflow-hidden bg-white">
                    <Image
                      src={decoration.image || "/placeholder.svg"}
                      alt={decoration.name}
                      fill
                      className="object-cover p-2"
                    />
                  </div>
                  <div className="mr-4 flex-grow">
                    <h4 className="font-medium">{decoration.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">{decoration.price} جنيه</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="font-medium">المجموع الفرعي:</span>
                  <span className="font-bold">{decorationsSubtotal} جنيه</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bag Summary */}
        {selectedBag && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">التغليف</h3>
            <div className="flex items-center">
              <div className="relative w-16 h-16 rounded overflow-hidden bg-white">
                <Image
                  src={selectedBag.image || "/placeholder.svg"}
                  alt={selectedBag.name}
                  fill
                  className="object-cover p-2"
                />
              </div>
              <div className="mr-4 flex-grow">
                <h4 className="font-medium">{selectedBag.name}</h4>
                <p className="text-sm text-gray-500">{selectedBag.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-600">{selectedBag.price} جنيه</p>
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">الإجمالي:</h3>
            <span className="text-xl font-bold text-purple-600">{total} جنيه</span>
          </div>
        </div>

        {/* Error message */}
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-center">{error}</div>}

        {/* Add the share gift button to the summary */}
        <div className="flex justify-end mt-6 gap-4">
          
          <Button
            size="lg"
            onClick={() => setShowConfirmDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting || selectedProducts.length === 0}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                جاري الإضافة...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                إضافة الهدية إلى السلة
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إضافة الهدية إلى السلة</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من رغبتك في إضافة هذه الهدية إلى السلة؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddToCart} disabled={isSubmitting}>
              {isSubmitting ? "جاري الإضافة..." : "إضافة إلى السلة"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
