"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Trash2, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { removeSavedItemThunk, clearSavedItemsThunk } from "@/lib/redux/slices/giftSlice"
import type { RootState } from "@/lib/redux/store"
import type { SavedItem } from "@/types/database"

export default function SavedItems() {
  const dispatch = useDispatch()
  const savedItems = useSelector((state: RootState) => state.gift.savedItems)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleRemoveSavedItem = async (itemId: string) => {
    try {
      setIsLoading(true)
      dispatch(removeSavedItemThunk(itemId) as never)
      setError(null)
    } catch (err) {
      console.error("Error removing saved item:", err)
      setError("حدث خطأ أثناء حذف العنصر. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSavedItems = async () => {
    try {
      setIsLoading(true)
      dispatch(clearSavedItemsThunk() as never)
      setShowConfirmDialog(false)
      setError(null)
    } catch (err) {
      console.error("Error clearing saved items:", err)
      setError("حدث خطأ أثناء حذف جميع العناصر. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  const displayedItems = savedItems.slice(0, 3)

  return (
    <div className="mt-4 bg-white rounded-lg border p-4">      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900">المحفوظة مؤخراً</h3>        {savedItems.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowConfirmDialog(true)} 
            className="text-xs"
            disabled={isLoading}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            مسح الكل
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : (        <div className="space-y-3">
          <AnimatePresence>
            {displayedItems.map((item: SavedItem) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center bg-gray-50 rounded-lg p-2"
              >
                <div className="relative w-12 h-12 rounded overflow-hidden bg-white">
                  <Image 
                    src={item.image || "/placeholder.svg"} 
                    alt={item.name} 
                    fill 
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover p-1" 
                  />
                </div>
                <div className="mr-3 flex-grow">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-xs text-gray-500">{item.price} جنيه</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSavedItem(item.id)}
                    className="h-7 w-7"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ShoppingCart className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>{savedItems.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">لا توجد عناصر محفوظة</p>
          )}

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>مسح جميع العناصر المحفوظة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في مسح جميع العناصر المحفوظة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearSavedItems} disabled={isLoading}>
              {isLoading ? "جاري الحذف..." : "مسح الكل"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
