"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {Eye, Package, Sparkles, Gift, ShoppingBag } from "lucide-react"
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
  // Calculate total price from all components
  const calculateTotalPrice = () => {
    let total = 0

    // Add main products prices
    if (gift.mainProducts && gift.mainProducts.length > 0) {
      gift.mainProducts.forEach((product: Product) => {
        if (product.price) {
          total += product.price
        }
      })
    }

    // Add product details prices with quantities
    if (gift.productDetails && gift.productDetails.length > 0) {
      gift.productDetails.forEach((product: Product, index: number) => {
        const quantity =
          gift.productQuantities && gift.productQuantities[index]?.quantity ? gift.productQuantities[index].quantity : 1

        if (product.price) {
          total += product.price * quantity
        }
      })
    }

    // Add box price if available
    if (gift.boxDetails && gift.boxDetails.price) {
      total += gift.boxDetails.price
    }

    // Add bag price if available
    if (gift.bagDetails && gift.bagDetails.price) {
      total += gift.bagDetails.price
    }

    // Add decoration prices
    if (gift.decorationDetails && gift.decorationDetails.length > 0) {
      gift.decorationDetails.forEach((decoration: Decoration) => {
        if (decoration.price) {
          total += decoration.price
        }
      })
    }

    return total
  }

  const totalPrice = calculateTotalPrice()

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
          <Badge className="bg-pink-500 hover:bg-pink-600">
            {totalPrice > 0 ? `${totalPrice.toFixed(2)} ج.م` : "سعر متغير"}
          </Badge>
          <Badge variant="outline" className="bg-white/80 text-gray-800">
            {totalItems} قطعة
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
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
              <div className="space-y-3 text-right text-sm">
                {/* Box */}
                {gift.boxDetails && (
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      <p className="font-medium">{gift.boxDetails.name || "صندوق هدية"}</p>
                      {gift.boxDetails.price && <p className="text-xs text-gray-500">{gift.boxDetails.price} ج.م</p>}
                    </div>
                    <Package className="h-4 w-4 text-gray-500" />
                  </div>
                )}

                {/* Bag */}
                {gift.bagDetails && (
                  <div className="flex items-center justify-end gap-2">
                    <div>
                      <p className="font-medium">{gift.bagDetails.name || "شنطة هدية"}</p>
                      {gift.bagDetails.price && <p className="text-xs text-gray-500">{gift.bagDetails.price} ج.م</p>}
                    </div>
                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                  </div>
                )}

                {/* Main Products */}
                {gift.mainProducts && gift.mainProducts.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">المنتجات الرئيسية:</p>
                    {gift.mainProducts.map((product: Product, index: number) => (
                      <div key={index} className="flex items-center justify-end gap-2 pr-4">
                        <div>
                          <p>{product.name || "منتج رئيسي"}</p>
                          {product.price && <p className="text-xs text-gray-500">{product.price} ج.م</p>}
                        </div>
                        <Gift className="h-4 w-4 text-gray-500" />
                      </div>
                    ))}
                  </>
                )}

                {/* Products */}
                {gift.productDetails && gift.productDetails.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">المنتجات:</p>
                    {gift.productDetails.map((product: Product, index: number) => {
                      const quantity =
                        gift.productQuantities && gift.productQuantities[index]?.quantity
                          ? gift.productQuantities[index].quantity
                          : 1

                      return (
                        <div key={index} className="flex items-center justify-end gap-2 pr-4">
                          <div>
                            <p>
                              {product.name || "منتج"} ({quantity})
                            </p>
                            {product.price && (
                              <p className="text-xs text-gray-500">
                                {product.price} × {quantity} = {product.price * quantity} ج.م
                              </p>
                            )}
                          </div>
                          <Gift className="h-4 w-4 text-gray-500" />
                        </div>
                      )
                    })}
                  </>
                )}

                {/* Decorations */}
                {gift.decorationDetails && gift.decorationDetails.length > 0 && (
                  <>
                    <p className="font-medium text-pink-600">الزينة:</p>
                    {gift.decorationDetails.map((decoration: Decoration, index: number) => (
                      <div key={index} className="flex items-center justify-end gap-2 pr-4">
                        <div>
                          <p>{decoration.name || "زينة"}</p>
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
                    <span>{totalPrice.toFixed(2)} ج.م</span>
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
