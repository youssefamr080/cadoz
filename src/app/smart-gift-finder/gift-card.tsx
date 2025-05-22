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
      <div className="relative h-48 w-full">
        <Image
          src={gift.image || "/placeholder.svg?height=192&width=384"}
          alt={gift.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge variant="outline" className="bg-white/80 text-gray-800">
            {totalItems} قطعة
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        {/* Price and Rating Row */}
        <div className="flex justify-between items-center mb-2">
          {/* Rating Badge */}
          <div className="bg-white rounded-full px-2 py-1 flex items-center shadow-sm">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium ml-1">{gift.rating || 0}</span>
          </div>

          {/* Price Badge */}
          <div className="bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            {gift.oldPrice && gift.price && gift.price < gift.oldPrice && (
              <span className="text-xs line-through text-gray-400">{gift.oldPrice} ج.م</span>
            )}
            <span className="text-xs font-medium text-green-600">{gift.price || 0} ج.م</span>
            {gift.discount_percentage && (
              <span className="text-xs font-medium text-red-500">-{gift.discount_percentage}%</span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 text-right">{gift.name}</h3>

        <div className="flex flex-wrap gap-1 mb-3 justify-end">
          {gift.occasions?.slice(0, 2).map((occasion: string, index: number) => (
            <Badge key={index} variant="outline" className="bg-pink-100 text-pink-800 border-pink-200">
              {occasion}
            </Badge>
          ))}
          {gift.category && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              {gift.category === "men" ? "رجالي" : gift.category === "women" ? "نسائي" : "أطفال"}
            </Badge>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-right">{gift.description}</p>

        <Accordion type="single" collapsible className="w-full mb-4">
          <AccordionItem value="contents">
            <AccordionTrigger className="text-sm font-medium text-right py-2">
              محتويات الهدية ({totalItems})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-right">
                {/* Box Details */}
                {gift.boxDetails && (
                  <>
                    <p className="font-medium text-pink-600">الصندوق:</p>
                    <div className="flex items-center justify-end gap-2 pr-4">
                      <div>
                        <p>{gift.boxDetails.name}</p>
                        {gift.boxDetails.price && <p className="text-xs text-gray-500">{gift.boxDetails.price} ج.م</p>}
                      </div>
                      <Package className="h-4 w-4 text-gray-500" />
                    </div>
                  </>
                )}

                {/* Bag Details */}
                {gift.bagDetails && (
                  <>
                    <p className="font-medium text-pink-600">الحقيبة:</p>
                    <div className="flex items-center justify-end gap-2 pr-4">
                      <div>
                        <p>{gift.bagDetails.name}</p>
                        {gift.bagDetails.price && <p className="text-xs text-gray-500">{gift.bagDetails.price} ج.م</p>}
                      </div>
                      <ShoppingBag className="h-4 w-4 text-gray-500" />
                    </div>
                  </>
                )}

                {/* Main Products */}
                {gift.mainProducts && gift.mainProducts.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">المنتجات الرئيسية:</p>
                    {gift.mainProducts.map((product: Product, index: number) => (
                      <div key={index} className="flex items-center justify-end gap-2 pr-4">
                        <div>
                          <p>{product.name}</p>
                          {product.price && <p className="text-xs text-gray-500">{product.price} ج.م</p>}
                        </div>
                        <Gift className="h-4 w-4 text-gray-500" />
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
                        <div key={index} className="flex items-center justify-end gap-2 pr-4">
                          <div>
                            <p>{product.name} × {quantity}</p>
                            {product.price && <p className="text-xs text-gray-500">{product.price} ج.م</p>}
                          </div>
                          <Gift className="h-4 w-4 text-gray-500" />
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
                      <div key={index} className="flex items-center justify-end gap-2 pr-4">
                        <div>
                          <p>{decoration.name}</p>
                          {decoration.price && <p className="text-xs text-gray-500">{decoration.price} ج.م</p>}
                        </div>
                        <Sparkles className="h-4 w-4 text-gray-500" />
                      </div>
                    ))}
                  </>
                )}

                {/* Total Price */}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>{gift.price ? `${gift.price.toFixed(2)} ج.م` : "سعر متغير"}</span>
                    <span>السعر الإجمالي:</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-between items-center mt-4 gap-2">
          <Link href={`/inspiration/${gift._id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </Button>
          </Link>
          <AddToCartButton inspiration={inspirationData} />
        </div>
      </CardContent>
    </Card>
  )
}
