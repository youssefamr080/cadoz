import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getInspirationById } from "@/lib/actions/inspiration-actions";
import InspirationClient from "./InspirationClient";
import UseInspirationButton from "./UseInspirationButton";
import AddToCartButton from "./AddToCartButton";
import { BoxIcon, GiftIcon, SparklesIcon } from "lucide-react"; // Example icons
import { Metadata } from 'next'
import type { LegacyInspiration } from "@/types/inspiration";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params before accessing its properties
  const { id } = await params;
  const inspiration = await getInspirationById(id)
  
  return {
    title: inspiration ? `${inspiration.name} | Cadoz Inspirations` : 'Inspiration | Cadoz',
    description: inspiration?.description || 'View this inspiring gift idea from Cadoz'
  }
}

// Helper component for consistent item display with enhanced mobile support
const ItemCard = ({
	name,
	price,
	image,
	alt,
	size = "medium",
	quantity,
	category,
	stock,
	popular,
}: {
	name: string;
	price?: number;
	image: string;
	alt: string;
	size?: "small" | "medium" | "large";
	quantity?: number;
	category?: string;
	stock?: number;
	popular?: boolean;
}) => {
	const imageSize =
		size === "large"
			? "w-40 h-40 sm:w-44 sm:h-44"
			: size === "medium"
			  ? "w-24 h-24 sm:w-28 sm:h-28"
			  : "w-16 h-16 sm:w-20 sm:h-20";
	const textSize = size === "small" ? "text-xs" : "text-sm";

	// حساب السعر الإجمالي
	const totalPrice = price && quantity ? price * quantity : price;

	return (
		<div className="flex flex-col items-center text-center bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-3 sm:p-4 border border-gray-100 hover:border-indigo-200 group relative overflow-hidden">
			{/* Popular badge */}
			{popular && (
				<div className="absolute top-0 right-0 bg-gradient-to-l from-red-500 to-red-600 text-white text-xs font-bold py-1 px-2 rounded-bl-lg z-10">
					مميز
				</div>
			)}
			
			{/* Quantity badge - more prominent */}
			{quantity && quantity > 1 && (
				<div className="absolute top-0 left-0 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold py-1 px-2 rounded-br-lg z-10 flex items-center">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5">
						<path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
					</svg>
					{quantity}
				</div>
			)}
			
			{/* Product image with hover effect */}
			<div className={`relative ${imageSize} mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-105`}>
				<Image
					src={image || "/placeholder-image.png"}
					alt={alt}
					fill
					className="object-contain rounded-lg"
					sizes={
						size === "large"
							? "(max-width: 640px) 40vw, 176px"
							: size === "medium"
							  ? "(max-width: 640px) 30vw, 112px"
							  : "(max-width: 640px) 20vw, 80px"
					}
				/>
			</div>
			
			<div className="w-full space-y-1">
				{/* Product name */}
				<h3 className={`font-bold ${textSize === 'text-xs' ? 'text-xs' : 'text-sm'} text-gray-800 line-clamp-2 min-h-[2.5rem]`}>
					{name}
				</h3>
				
				<div className="flex flex-col items-center justify-between w-full">
					{/* Category tag */}
					{category && (
						<span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mb-1">
							{category}
						</span>
					)}
					
					{/* Price with quantity indicator */}
					{price !== undefined && (
						<div className="flex flex-col items-center">
							{quantity && quantity > 1 ? (
								<>
									<div className="flex items-center gap-1 text-sm mb-1">
										<span className="text-gray-500">سعر القطعة:</span>
										<span className="font-medium text-indigo-600">{price.toLocaleString()} ج.م</span>
									</div>
									{/* Enhanced quantity display (now showing quantity x price) */}
									<div className="flex items-center justify-center mb-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
										<span>الكمية: </span>
										<span className="font-bold mr-1">{quantity}</span>
										<span className="mr-1">×</span>
										<span className="font-bold mr-1">{price.toLocaleString()}</span>
										<span>ج.م</span>
									</div>
									<div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
										<span>الإجمالي:</span>
										<span>{totalPrice.toLocaleString()} ج.م</span>
									</div>
								</>
							) : (
								<span className="text-sm font-bold text-indigo-600 mt-1">
									{price.toLocaleString()} ج.م
								</span>
							)}
							
							{/* Stock indicator */}
							{stock !== undefined && stock <= 5 && (
								<span className="text-xs text-red-500 mt-1 flex items-center">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-1">
										<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
									</svg>
									متبقي {stock} فقط
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

// Helper function to convert Prisma inspiration to Legacy format
const convertToLegacyInspiration = (inspiration: NonNullable<Awaited<ReturnType<typeof getInspirationById>>>): LegacyInspiration => {
  return {
    ...inspiration,
    box: inspiration.box?.id || "",
    products: inspiration.products?.map(p => p.id) || [],
    decorations: inspiration.decorations?.map(d => d.id) || [],
    bag: inspiration.bag?.id || "",
    productQuantities: inspiration.products?.reduce((acc, p) => ({
      ...acc,
      [p.id]: (p as { quantity?: number }).quantity || 1
    }), {} as Record<string, number>) || {},
    comments: inspiration.comments?.map(c => ({
      _id: c.id,
      userId: c.userId,
      userName: c.userName,
      comment: c.comment,
      createdAt: c.createdAt.toISOString()
    })) || [],
    updatedAt: inspiration.updatedAt?.toISOString()
  };
};

export default async function InspirationPage({ params }: Props) {
  // Await params before accessing its properties
  const { id } = await params;
  const inspiration = await getInspirationById(id)

  if (!inspiration) {
    notFound()
  }
  // Extract product data from the inspiration products relation
  const productsData = inspiration.products || [];
  
  // For backward compatibility, also check mainProducts
  const mainProductsData = inspiration.mainProducts || [];
  
  // Extract decoration data
  const decorationsData = inspiration.decorations || [];
  
  // Get box and bag data
  const boxData = inspiration.box;
  const bagData = inspiration.bag;
  
  // Map products with quantity
  const products = productsData.map(product => ({
    ...product,
    quantity: product.quantity || 1
  }));
  // Map main products with quantity
  const mainProducts = mainProductsData.map(product => ({
    ...product,
    quantity: (product as { quantity?: number }).quantity || 1
  }));
  
  const decorations = decorationsData;
  const box = boxData;
  const bag = bagData;


  // Convert to legacy format for compatibility
  const legacyInspiration = convertToLegacyInspiration(inspiration);

  // Calculate total items count
  const calculateTotalItems = () => {
    const productsCount = products.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const mainProductsCount = mainProducts.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const decorationsCount = decorations.length;
    return productsCount + mainProductsCount + decorationsCount;
  };

  const totalItems = calculateTotalItems();

  // Calculate discount percentage dynamically
  const discountPercentage = (inspiration.price && inspiration.oldPrice && inspiration.oldPrice > inspiration.price)
    ? Math.floor(((inspiration.oldPrice - inspiration.price) / inspiration.oldPrice) * 100)
    : 0;
  
  const priceToDisplay = inspiration.price || 0;
  const oldPriceToDisplay = inspiration.oldPrice || 0;

  return (
    <div className="container mx-auto max-w-6xl py-6 sm:py-10 px-3 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 lg:gap-12">
        {/* Column 1: Main Image & Interactive Client */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6">
            {/* Main Image with enhanced styling */}
            <div className="aspect-square relative rounded-xl overflow-hidden shadow-xl border border-gray-200 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image
                src={inspiration.image || "/placeholder-gift-large.png"}
                alt={`صورة لهدية ${inspiration.name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
                sizes="(max-width: 1024px) 90vw, 33vw"
              />
              
              {/* Likes and Reviews Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex justify-between items-center">
                <div className="flex items-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 rounded-full px-2 py-1 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-red-500 ml-1">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    {inspiration.likes || 0}
                  </div>
                  <div className="bg-white/90 rounded-full px-2 py-1 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-indigo-500 ml-1">
                      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 00-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                    </svg>
                    {inspiration.reviews || 0}
                  </div>
                </div>
              </div>
            </div>
              {/* Enhanced Call to Action Buttons */}            <div className="mt-4 space-y-3">
              <div className="transform hover:-translate-y-1 transition-transform duration-300">
                <UseInspirationButton inspiration={inspiration} />
              </div>
              <div className="transform hover:-translate-y-1 transition-transform duration-1000 w-full">
                <AddToCartButton inspiration={legacyInspiration} />
              </div>
            </div>
            
            {/* Interactive Section with enhanced styling */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold mb-3 text-center text-gray-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2 text-indigo-500">
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                </svg>
                تفاعل مع الهدية
              </h3>
              <InspirationClient inspiration={inspiration} />
            </div>
          </div>
        </div>

        {/* Column 2: Details & Components */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Category Badge */}
            {(inspiration.category || inspiration["category "]) && (
              <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs font-bold py-1 px-3 rounded-br-lg">
                {inspiration.category || inspiration["category "]}
              </div>
            )}
            
            {/* Rating Badge */}
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg flex items-center">
              <span className="ml-1">{inspiration.rating}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-indigo-800 text-center lg:text-right mt-6">
              {inspiration.name}
            </h1>
            
            <p className="text-lg text-gray-600 mb-5 text-center lg:text-right">
              {inspiration.description ||
                "وصف تفصيلي لهذه المجموعة الرائعة."}
            </p>
            
            <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-lg">
              {/* Price and Discount Section (aligned right) */}
              <div className="flex flex-col items-center md:items-end">
                {discountPercentage > 0 && oldPriceToDisplay > 0 ? (
                  <>
                    {/* Original Price */}
                    <div className="text-lg text-gray-600 line-through">
                      {Math.floor(oldPriceToDisplay).toLocaleString()} ج.م
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      {/* Discounted Price */}
                      <div className="text-3xl sm:text-4xl font-bold text-emerald-700">
                        {Math.floor(priceToDisplay).toLocaleString()} ج.م
                      </div>
                      {/* Discount Badge */}
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                        خصم {discountPercentage}%
                      </div>
                    </div>
                    {/* Savings Amount */}
                    <div className="text-sm font-medium text-emerald-700">
                      وفرت {Math.floor(oldPriceToDisplay - priceToDisplay).toLocaleString()} ج.م
                    </div>
                  </>
                ) : (
                  /* Price when no discount or no old price */
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-700">
                    {Math.floor(priceToDisplay).toLocaleString()} ج.م
                  </div>
                )}
              </div>
              
              {/* Item and Decoration Counts (aligned left) */}
              <div className="flex items-center space-x-2 sm:space-x-4 space-x-reverse mt-3 md:mt-0">
                <div className="text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 shadow-sm flex items-center">
                   <span className="font-bold ml-1">{totalItems}</span> قطعة
                </div>
                <div className="text-sm bg-white px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 shadow-sm flex items-center">
                  <span className="font-bold ml-1">{decorations.length}</span> ديكور
                </div>
              </div>
            </div>
          </div>


          {/* Included Items Section */}
          <div className="space-y-6">
            {(box || bag) && (
                 <SectionWrapper title="التغليف" icon={<BoxIcon className="w-5 h-5 mr-2 text-indigo-600" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {box ? (
                    <ItemCard
                      name={box.name}
                      price={box.price}
                      image={box.image}
                      alt={box.name}
                      size="medium"
                    />
                  ) : (
                    <EmptyItemPlaceholder text="لا يوجد صندوق" />
                  )}
                  {bag ? (
                    <ItemCard
                      name={bag.name}
                      price={bag.price}
                      image={bag.image}
                      alt={bag.name}
                      size="medium"
                    />
                  ) : (
                     <EmptyItemPlaceholder text="لا يوجد كيس" />
                  )}
                </div>
              </SectionWrapper>
            )}

            {mainProducts.length > 0 && (
              <SectionWrapper 
                title="المنتجات الأساسية" 
                icon={<GiftIcon className="w-5 h-5 mr-2 text-green-600" />}
                count={mainProducts.length}
              >
                <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800 hidden sm:block">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">إجمالي المنتجات الأساسية:</span>
                    <span className="font-bold">{mainProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 1)), 0).toLocaleString()} ج.م</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
                  {mainProducts.map((mainProduct) =>
                    mainProduct ? (
                      <ItemCard
                        key={mainProduct.id}
                        name={mainProduct.name}
                        price={mainProduct.price}
                        image={mainProduct.image}
                        alt={mainProduct.name}
                        category={mainProduct.category}
                        stock={mainProduct.stock}
                        size="medium"
                        quantity={1}
                        popular={true} // Highlight main products as special
                      />
                    ) : null
                  )}
                </div>
              </SectionWrapper>
            )}

            {products.length > 0 && (
               <SectionWrapper 
                 title="محتويات الهدية" 
                 icon={<GiftIcon className="w-5 h-5 mr-2 text-indigo-600" />}
                 count={products.length}
               >
                <div className="mb-3 p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-600 ml-1">
                        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                      </svg>
                      <span className="text-indigo-800">عدد المنتجات: <span className="font-bold">{products.reduce((sum, p) => sum + (p.quantity || 1), 0)}</span> قطعة</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-600 ml-1">
                        <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" />
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-indigo-800">إجمالي المنتجات: <span className="font-bold">{products.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 1)), 0).toLocaleString()}</span> ج.م</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((product) =>
                    product ? (
                      <ItemCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        alt={product.name}
                        category={product.category}
                        stock={product.stock}
                        popular={product.popular}
                        quantity={product.quantity || 1}
                        size="medium"
                      />
                    ) : null
                  )}
                </div>
              </SectionWrapper>
            )}

            {decorations.length > 0 && (
                 <SectionWrapper 
                   title="الديكورات واللمسات الإضافية" 
                   icon={<SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />}
                   count={decorations.length}
                 >
                <div className="mb-3 p-2 bg-purple-50 rounded-lg border border-purple-100 text-sm hidden sm:block">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-800">إجمالي الديكورات:</span>
                    <span className="font-bold text-purple-800">{decorations.reduce((sum, d) => sum + (d.price || 0), 0).toLocaleString()} ج.م</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                  {decorations.map((decoration) =>
                    decoration ? (
                      <ItemCard
                        key={decoration.id}
                        name={decoration.name}
                        price={decoration.price}
                        image={decoration.image}
                        alt={decoration.name}
                        stock={decoration.stock}
                        size="small"
                      />
                    ) : null
                  )}
                </div>
              </SectionWrapper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for section structure with count support and mobile optimization
function SectionWrapper({ title, icon, children, count }: { title: string; icon?: React.ReactNode; children: React.ReactNode; count?: number }) {
    return (
         <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 sm:pb-3 mb-3 sm:mb-4 border-gray-200">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center mb-2 sm:mb-0">
                    {icon}
                    <span>{title}</span>
                    {count !== undefined && (
                        <span className="mr-2 text-xs sm:text-sm bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full">
                            {count}
                        </span>
                    )}
                </h2>
                <div className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-md self-start sm:self-auto">
                    {count === 1 ? "عنصر واحد" : count === 2 ? "عنصران" : count && count > 10 ? `${count} عنصر` : count ? `${count} عناصر` : ""}
                </div>
            </div>
            {children}
        </div>
    )
}

// Placeholder for empty items with responsive design
function EmptyItemPlaceholder({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center text-center bg-gray-100 rounded-lg shadow-inner p-3 border border-gray-200 h-full min-h-[100px] sm:min-h-[150px]">
            <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-sm font-medium text-gray-500">{text}</span>
            </div>
        </div>
    )
}