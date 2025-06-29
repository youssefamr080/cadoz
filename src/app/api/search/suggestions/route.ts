import { NextResponse } from 'next/server'

// Temporary mock data while fixing Prisma connection
const mockData = {
  products: [
    { id: '1', name: 'ساعة ذكية', category: 'إلكترونيات', image: '/images/watch.jpg' },
    { id: '2', name: 'عطر رجالي', category: 'عطور', image: '/images/perfume.jpg' },
    { id: '3', name: 'محفظة جلدية', category: 'إكسسوارات', image: '/images/wallet.jpg' },
    { id: '4', name: 'هدية عيد ميلاد', category: 'هدايا', image: '/images/gift.jpg' },
    { id: '5', name: 'شنطة يد', category: 'حقائب', image: '/images/bag.jpg' }
  ],
  categories: [
    { id: '1', name: 'إلكترونيات', image: '/images/electronics.jpg' },
    { id: '2', name: 'عطور', image: '/images/perfumes.jpg' },
    { id: '3', name: 'إكسسوارات', image: '/images/accessories.jpg' }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ suggestions: [] })
    }

    // Use mock data for now (replace with Prisma when ready)
    const products = mockData.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    const categories = mockData.categories.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);

    // إنشاء قائمة اقتراحات نصية
    const textSuggestions = [
      ...products.map(p => p.name),
      ...categories.map(c => c.name),
      // إضافة اقتراحات شائعة
      'هدية عيد ميلاد',
      'هدايا رجالية',
      'هدايا نسائية', 
      'ساعات',
      'عطور',
      'إكسسوارات'
    ].filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    return NextResponse.json({
      suggestions: textSuggestions,
      detailed: {
        products,
        categories
      }
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 