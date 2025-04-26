"use client"

import { Fragment, useRef } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X, ShoppingBag, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useWishlist, type WishlistItem } from "../../context/WishlistContext"
import { useCart } from "../../context/CartContext"
import { Button } from "../../components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const closeButtonRef = useRef(null)

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    })
    toast.success("تمت الإضافة إلى السلة")
  }

  const handleRemoveItem = (id: number) => {
    removeFromWishlist(id)
    toast.info("تمت الإزالة من المفضلة")
  }

  const handleClearWishlist = () => {
    clearWishlist()
    toast.info("تم مسح المفضلة")
  }

  // تأثيرات الحركة
  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={closeButtonRef} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">المفضلة</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            ref={closeButtonRef}
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">إغلاق</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {wishlist.length > 0 ? (
                            <>
                              <div className="flex justify-end mb-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleClearWishlist}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 ml-2" />
                                  مسح الكل
                                </Button>
                              </div>
                              <ul className="-my-6 divide-y divide-gray-200">
                                <AnimatePresence initial={false}>
                                  {wishlist.map((item) => (
                                    <motion.li
                                      key={item.id}
                                      className="flex py-6"
                                      variants={itemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      layout
                                    >
                                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <Image
                                          src={item.image || "/placeholder.svg"}
                                          alt={item.name}
                                          width={96}
                                          height={96}
                                          className="h-full w-full object-cover object-center"
                                        />
                                      </div>

                                      <div className="ml-4 flex flex-1 flex-col">
                                        <div>
                                          <div className="flex justify-between text-base font-medium text-gray-900">
                                            <h3>
                                              <Link href={`/product/${item.productId}`} onClick={onClose}>
                                                {item.name}
                                              </Link>
                                            </h3>
                                            <p className="ml-4">{item.price} ج.م</p>
                                          </div>
                                          {item.type && <p className="mt-1 text-sm text-gray-500">{item.type}</p>}
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                          <div className="flex">
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveItem(item.id)}
                                              className="font-medium text-red-600 hover:text-red-500"
                                            >
                                              إزالة
                                            </button>
                                          </div>
                                          <Button
                                            onClick={() => handleAddToCart(item)}
                                            size="sm"
                                            className="bg-amber-500 hover:bg-amber-600"
                                          >
                                            <ShoppingBag className="h-4 w-4 ml-2" />
                                            إضافة للسلة
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.li>
                                  ))}
                                </AnimatePresence>
                              </ul>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <svg
                                  className="h-12 w-12 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 mb-1">المفضلة فارغة</h3>
                              <p className="text-gray-500 text-center mb-6">
                                أضف المنتجات التي تعجبك إلى المفضلة للعودة إليها لاحقًا
                              </p>
                              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
                                تصفح المنتجات
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default WishlistDrawer
