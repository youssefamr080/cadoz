"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {Eye, Package, Sparkles, Gift, ShoppingBag, Star } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { GiftWithDetails } from "@/lib/types"
import AddToCartButton from "@/app/inspiration/[id]/AddToCartButton"
import type { Inspiration } from "@/types/inspiration"

interface GiftCardProps {
  gift: GiftWithDetails
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Decoration {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function GiftCard({ gift }: GiftCardProps) {
  // Count total items
  const countTotalItems = () => {
    let count = 0

    // Count main products
    if (gift.mainProducts) {
      count += gift.mainProducts.length
    }

    // Count products with quantities
    if (gift.productDetails) {
      gift.productDetails.forEach((product: Product, index: number) => {
        const quantity =
          gift.productQuantities && gift.productQuantities[index]?.quantity ? gift.productQuantities[index].quantity : 1
        count += quantity
      })
    }

    // Count box if available
    if (gift.boxDetails) {
      count += 1
    }

    // Count bag if available
    if (gift.bagDetails) {
      count += 1
    }

    // Count decorations
    if (gift.decorationDetails) {
      count += gift.decorationDetails.length
    }

    return count
  }

  const totalItems = countTotalItems()

  // Calculate discount percentage dynamically
  const discountPercentage = (gift.price && gift.oldPrice && gift.oldPrice > gift.price)
    ? Math.floor(((gift.oldPrice - gift.price) / gift.oldPrice) * 100)
    : 0;

  // Transform GiftWithDetails to Inspiration format
  const inspirationData: Inspiration = {
    id: gift._id,
    _id: { $oid: gift._id },
    name: gift.name,
    description: gift.description,
    image: gift.image,
    rating: gift.rating,
    reviews: gift.reviews,
    box: gift.box,
    products: gift.productDetails.map((product, index) => ({
      id: product._id,
      quantity: gift.productQuantities[index]?.quantity || 1
    })),
    decorations: gift.decorationDetails.map(d => d._id),
    bag: gift.bag,
    Mainproducts: gift.mainProducts.map(p => p._id),
    category: gift.category,
    occasions: gift.occasions,
    tags: gift.tags,
    price: gift.price,
    oldPrice: gift.oldPrice,
    discount_percentage: gift.discount_percentage,
    updatedAt: gift.updatedAt ? 
      (typeof gift.updatedAt === 'string' ? 
        gift.updatedAt : 
        { $date: { $numberLong: new Date(gift.updatedAt).getTime().toString() } }
      ) : 
      undefined,
    likes: gift.likes,
    dislikes: gift.dislikes,
    likedBy: gift.likedBy,
    dislikedBy: gift.dislikedBy
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-32 w-full">
        <Image
          src={gift.image || "/placeholder.svg?height=128&width=256"}
          alt={gift.name}
          fill
          className="object-cover"
        />
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md z-10">
            -{discountPercentage}%
          </div>
        )}
        {/* Item Count Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="outline" className="bg-white/80 text-gray-800 text-xs">
            {totalItems} قطعة
          </Badge>
        </div>
      </div>
      <CardContent className="p-3">
        {/* Price and Rating Row */}
        <div className="flex justify-between items-center mb-1.5">
          {/* Rating Badge */}
          <div className="bg-white rounded-full px-1.5 py-0.5 flex items-center shadow-sm">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium ml-0.5">{gift.rating || 0}</span>
          </div>

          {/* Price and Discount Display */}
          {gift.price && ( /* Only show price section if price is available */
            <div className="flex flex-col items-end">
              {discountPercentage > 0 && gift.oldPrice && ( /* Show old price and discount if applicable */
                <div className="flex items-center gap-1 text-sm mb-0.5">
                   <span className="text-gray-500 line-through text-xs">{Math.floor(gift.oldPrice).toLocaleString()} ج.م</span>
                   <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discountPercentage}%</span>
                </div>
              )}
              {/* Current Price */}
              <div className="text-base font-bold text-green-600">
                {Math.floor(gift.price).toLocaleString()} ج.م
              </div>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-base mb-1.5 text-right line-clamp-1">{gift.name}</h3>

        <div className="flex flex-wrap gap-1 mb-2 justify-end">
          {gift.occasions?.slice(0, 2).map((occasion: string, index: number) => (
            <Badge key={index} variant="outline" className="bg-pink-100 text-pink-800 border-pink-200 text-xs">
              {occasion}
            </Badge>
          ))}
          {gift.category && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
              {gift.category === "men" ? "رجالي" : gift.category === "women" ? "نسائي" : "أطفال"}
            </Badge>
          )}
        </div>

        <p className="text-gray-600 text-xs mb-2 line-clamp-2 text-right">{gift.description}</p>

        <Accordion type="single" collapsible className="w-full mb-2">
          <AccordionItem value="contents" className="border-none">
            <AccordionTrigger className="text-xs font-medium text-right py-1 hover:no-underline">
              محتويات الهدية ({totalItems})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-right text-xs">
                {/* Box Details */}
                {gift.boxDetails && (
                  <>
                    <p className="font-medium text-pink-600">الصندوق:</p>
                    <div className="flex items-center justify-end gap-1.5 pr-3">
                      <div>
                        <p>{gift.boxDetails.name}</p>
                        {gift.boxDetails.price && <p className="text-gray-500">{gift.boxDetails.price} ج.م</p>}
                      </div>
                      <Package className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                  </>
                )}

                {/* Bag Details */}
                {gift.bagDetails && (
                  <>
                    <p className="font-medium text-pink-600">الحقيبة:</p>
                    <div className="flex items-center justify-end gap-1.5 pr-3">
                      <div>
                        <p>{gift.bagDetails.name}</p>
                        {gift.bagDetails.price && <p className="text-gray-500">{gift.bagDetails.price} ج.م</p>}
                      </div>
                      <ShoppingBag className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                  </>
                )}

                {/* Main Products */}
                {gift.mainProducts && gift.mainProducts.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">المنتجات الرئيسية:</p>
                    {gift.mainProducts.map((product: Product, index: number) => (
                      <div key={index} className="flex items-center justify-end gap-1.5 pr-3">
                        <div>
                          <p>{product.name}</p>
                          {product.price && <p className="text-gray-500">{product.price} ج.م</p>}
                        </div>
                        <Gift className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    ))}
                  </>
                )}

                {/* Product Details */}
                {gift.productDetails && gift.productDetails.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">المنتجات الإضافية:</p>
                    {gift.productDetails.map((product: Product, index: number) => {
                      const quantity = gift.productQuantities?.[index]?.quantity || 1
                      return (
                        <div key={index} className="flex items-center justify-end gap-1.5 pr-3">
                          <div>
                            <p>{product.name} × {quantity}</p>
                            {product.price && <p className="text-gray-500">{product.price} ج.م</p>}
                          </div>
                          <Gift className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                      )
                    })}
                  </>
                )}

                {/* Decoration Details */}
                {gift.decorationDetails && gift.decorationDetails.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">الزينة:</p>
                    {gift.decorationDetails.map((decoration: Decoration, index: number) => (
                      <div key={index} className="flex items-center justify-end gap-1.5 pr-3">
                        <div>
                          <p>{decoration.name}</p>
                          {decoration.price && <p className="text-gray-500">{decoration.price} ج.م</p>}
                        </div>
                        <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                    ))}
                  </>
                )}

                {/* Total Price */}
                <div className="border-t pt-1.5 mt-1.5">
                  <div className="flex justify-between font-medium">
                    <span>{gift.price ? `${Math.floor(gift.price).toLocaleString()} ج.م` : "سعر متغير"}</span>
                    <span>السعر الإجمالي:</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-between items-center gap-1.5">
          <Link href={`/inspiration/${gift._id}`}>
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
              <Eye className="h-3 w-3" />
              عرض التفاصيل
            </Button>
          </Link>
          <AddToCartButton inspiration={inspirationData} />
        </div>
      </CardContent>
    </Card>
  )
}
