import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getInspirationById } from "@/lib/actions/inspiration-actions";
import { getGiftProductsByIds } from "@/lib/actions/product-actions";
import { getBoxById } from "@/lib/actions/box-actions";
import { getBagById } from "@/lib/actions/bag-actions";
import { getDecorationsByIds } from "@/lib/actions/decoration-actions";
import { getMainProductsByIds } from "@/lib/actions/main-product-actions";
import type { Inspiration } from "@/types/inspiration";
import InspirationClient from "./InspirationClient";
import UseInspirationButton from "./UseInspirationButton";
import { BoxIcon, GiftIcon, SparklesIcon } from "lucide-react"; // Example icons
import { Metadata } from 'next'

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

// Helper component for consistent item display
const ItemCard = ({
	name,
	price,
	image,
	alt,
	size = "medium",
}: {
	name: string;
	price?: number;
	image: string;
	alt: string;
	size?: "small" | "medium" | "large";
}) => {
	const imageSize =
		size === "large"
			? "w-40 h-40"
			: size === "medium"
			  ? "w-24 h-24"
			  : "w-16 h-16";
	const textSize = size === "small" ? "text-xs" : "text-sm";

	return (
		<div className="flex flex-col items-center text-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-3 border border-gray-100">
			<div className={`relative ${imageSize} mb-2`}>
				<Image
					src={image || "/placeholder-image.png"} // Add a default placeholder
					alt={alt}
					fill // Use fill for better responsiveness within the container
					className="object-contain rounded" // Use contain or cover based on desired look
					sizes={
						size === "large"
							? "(max-width: 768px) 50vw, 160px"
							: size === "medium"
							  ? "(max-width: 768px) 33vw, 96px"
							  : "64px"
					} // Provide sizes prop for optimization
				/>
			</div>
			<span className={`font-semibold ${textSize} text-gray-800`}>{name}</span>
			{price !== undefined && ( // Only show price if available
				<span
					className={`text-xs font-bold text-indigo-600 mt-1`}
				>
					{price.toLocaleString()} ج.م
				</span>
			)}
		</div>
	);
};

export default async function InspirationPage({ params }: Props) {
  // Await params before accessing its properties
  const { id } = await params;
  const inspiration: Inspiration | null = await getInspirationById(id)

  if (!inspiration) {
    notFound()
  }

  // Fetch related items concurrently for potential performance improvement
  const [productsData, boxData, bagData, decorationsData, mainProductsData] = await Promise.all([
    inspiration.products && inspiration.products.length > 0
      ? getGiftProductsByIds(inspiration.products)
      : Promise.resolve([]),
    inspiration.box ? getBoxById(inspiration.box) : Promise.resolve(null),
    inspiration.bag ? getBagById(inspiration.bag) : Promise.resolve(null),
    inspiration.decorations && inspiration.decorations.length > 0
      ? getDecorationsByIds(inspiration.decorations)
      : Promise.resolve([]),
    inspiration.Mainproducts && inspiration.Mainproducts.length > 0
      ? getMainProductsByIds(inspiration.Mainproducts)
      : Promise.resolve([]),
  ]);

  const products = productsData || [];
  const box = boxData;
  const bag = bagData;
  const decorations = decorationsData || [];
  const mainProducts = mainProductsData || [];

  // Calculate total price
  const totalPrice =
    products.reduce((sum, p) => sum + (p?.price || 0), 0) +
    (box?.price || 0) +
    (bag?.price || 0) +
    decorations.reduce((sum, d) => sum + (d?.price || 0), 0) +
    mainProducts.reduce((sum, mp) => sum + (mp?.price || 0), 0);

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Column 1: Main Image & Interactive Client */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6">
            {" "}
            {/* Make image sticky on large screens */}
            <div className="aspect-square relative rounded-xl overflow-hidden shadow-xl border border-gray-200">
              <Image
                src={inspiration.image || "/placeholder-gift-large.png"} // Use a potentially larger placeholder
                alt={`صورة لهدية ${inspiration.name}`}
                fill
                className="object-cover"
                priority // Prioritize loading the main image
                sizes="(max-width: 1024px) 90vw, 33vw"
              />
            </div>
            <UseInspirationButton inspiration={inspiration} />
            {/* Interactive Section */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-center text-gray-700">
                تفاعل مع الهدية
              </h3>
              <InspirationClient inspiration={inspiration} />
            </div>
          </div>
        </div>

        {/* Column 2: Details & Components */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-indigo-800 text-center lg:text-right">
              {inspiration.name}
            </h1>
            <p className="text-lg text-gray-600 mb-5 text-center lg:text-right">
              {inspiration.description ||
                "وصف تفصيلي لهذه المجموعة الرائعة."}
            </p>
            <div className="text-3xl font-bold text-emerald-600 text-center lg:text-right mb-4">
              الإجمالي: {totalPrice.toLocaleString()} ج.م
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
              <SectionWrapper title="المنتجات الأساسية" icon={<GiftIcon className="w-5 h-5 mr-2 text-green-600" />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mainProducts.map((mainProduct) =>
                    mainProduct ? (
                      <ItemCard
                        key={mainProduct.id}
                        name={mainProduct.name}
                        price={mainProduct.price}
                        image={mainProduct.image}
                        alt={mainProduct.name}
                        size="medium"
                      />
                    ) : null
                  )}
                </div>
              </SectionWrapper>
            )}

            {products.length > 0 && (
               <SectionWrapper title="محتويات الهدية" icon={<GiftIcon className="w-5 h-5 mr-2 text-indigo-600" />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {products.map((product) =>
                    product ? ( // Check if product exists after fetch
                      <ItemCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        alt={product.name}
                        size="medium"
                      />
                    ) : null
                  )}
                </div>
              </SectionWrapper>
            )}

            {decorations.length > 0 && (
                 <SectionWrapper title="الديكورات واللمسات الإضافية" icon={<SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {decorations.map((decoration) =>
                    decoration ? ( // Check if decoration exists
                      <ItemCard
                        key={decoration.id}
                        name={decoration.name}
                        price={decoration.price}
                        image={decoration.image}
                        alt={decoration.name}
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

// Optional: Helper for section structure
function SectionWrapper({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
    return (
         <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 flex items-center border-b pb-2 border-gray-200">
                {icon}
                {title}
            </h2>
            {children}
        </div>
    )
}

// Optional: Placeholder for empty items
function EmptyItemPlaceholder({ text }: { text: string }) {
    return (
        <div className="flex items-center justify-center text-center bg-gray-100 rounded-lg shadow-inner p-3 border border-gray-200 h-full min-h-[150px]">
            <span className="text-sm font-medium text-gray-500">{text}</span>
        </div>
    )
}