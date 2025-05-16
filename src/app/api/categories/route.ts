import { NextResponse } from 'next/server';

// Define the category structure
interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon?: string;
  image?: string;
  description?: string;
  slug: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

// Main product categories with Arabic names
const categories: Category[] = [
  {
    id: 'gifts',
    name: 'Gifts',
    nameAr: 'هدايا',
    slug: 'gifts',
    description: 'هدايا مميزة لجميع المناسبات',
    image: '/images/categories/gifts.jpg',
    icon: 'Gift',
    productCount: 120
  },
  {
    id: 'boxes',
    name: 'Gift Boxes',
    nameAr: 'صناديق الهدايا',
    slug: 'boxes',
    description: 'صناديق هدايا فاخرة بتصاميم مختلفة',
    image: '/images/categories/boxes.jpg',
    icon: 'Package',
    productCount: 45
  },
  {
    id: 'bags',
    name: 'Gift Bags',
    nameAr: 'أكياس الهدايا',
    slug: 'bags',
    description: 'أكياس هدايا أنيقة لمختلف المناسبات',
    image: '/images/categories/bags.jpg',
    icon: 'ShoppingBag',
    productCount: 30
  },
  {
    id: 'chocolates',
    name: 'Chocolates',
    nameAr: 'شوكولاتة',
    slug: 'chocolates',
    description: 'تشكيلة متنوعة من الشوكولاتة الفاخرة',
    image: '/images/categories/chocolates.jpg',
    icon: 'Candy',
    productCount: 75
  },
  {
    id: 'flowers',
    name: 'Flowers',
    nameAr: 'زهور',
    slug: 'flowers',
    description: 'باقات زهور طبيعية وصناعية',
    image: '/images/categories/flowers.jpg',
    icon: 'Flower',
    productCount: 50
  },
  {
    id: 'perfumes',
    name: 'Perfumes',
    nameAr: 'عطور',
    slug: 'perfumes',
    description: 'عطور فاخرة للرجال والنساء',
    image: '/images/categories/perfumes.jpg',
    icon: 'Droplets',
    productCount: 60
  },
  {
    id: 'accessories',
    name: 'Accessories',
    nameAr: 'إكسسوارات',
    slug: 'accessories',
    description: 'إكسسوارات متنوعة للرجال والنساء',
    image: '/images/categories/accessories.jpg',
    icon: 'Watch',
    productCount: 90
  },
  {
    id: 'home',
    name: 'Home & Decor',
    nameAr: 'منزل وديكور',
    slug: 'home-decor',
    description: 'منتجات للمنزل وديكورات داخلية',
    image: '/images/categories/home.jpg',
    icon: 'Home',
    productCount: 65
  },
  {
    id: 'electronics',
    name: 'Electronics',
    nameAr: 'إلكترونيات',
    slug: 'electronics',
    description: 'أجهزة إلكترونية وإكسسوارات تقنية',
    image: '/images/categories/electronics.jpg',
    icon: 'Smartphone',
    productCount: 40
  },
  {
    id: 'occasions',
    name: 'Occasions',
    nameAr: 'مناسبات',
    slug: 'occasions',
    description: 'هدايا مخصصة للمناسبات المختلفة',
    image: '/images/categories/occasions.jpg',
    icon: 'Calendar',
    productCount: 0,
    children: [
      {
        id: 'birthday',
        name: 'Birthday',
        nameAr: 'أعياد الميلاد',
        slug: 'birthday',
        parentId: 'occasions',
        image: '/images/categories/birthday.jpg',
        icon: 'Cake',
        productCount: 85
      },
      {
        id: 'wedding',
        name: 'Wedding',
        nameAr: 'زفاف',
        slug: 'wedding',
        parentId: 'occasions',
        image: '/images/categories/wedding.jpg',
        icon: 'HeartHandshake',
        productCount: 60
      },
      {
        id: 'graduation',
        name: 'Graduation',
        nameAr: 'تخرج',
        slug: 'graduation',
        parentId: 'occasions',
        image: '/images/categories/graduation.jpg',
        icon: 'GraduationCap',
        productCount: 45
      },
      {
        id: 'newborn',
        name: 'Newborn',
        nameAr: 'مولود جديد',
        slug: 'newborn',
        parentId: 'occasions',
        image: '/images/categories/newborn.jpg',
        icon: 'Baby',
        productCount: 50
      },
      {
        id: 'anniversary',
        name: 'Anniversary',
        nameAr: 'ذكرى سنوية',
        slug: 'anniversary',
        parentId: 'occasions',
        image: '/images/categories/anniversary.jpg',
        icon: 'Calendar',
        productCount: 40
      }
    ]
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const includeChildren = searchParams.get('includeChildren') === 'true';
    const parentId = searchParams.get('parentId');
    
    let filteredCategories = [...categories];
    
    // Filter by parent ID if specified
    if (parentId) {
      if (parentId === 'root') {
        // Return only root categories (no parent)
        filteredCategories = filteredCategories.filter(cat => !cat.parentId);
      } else {
        // Find children of specific parent
        const parent = categories.find(cat => cat.id === parentId);
        filteredCategories = parent?.children || [];
      }
    }
    
    // Filter by search query if specified
    if (query) {
      const queryLower = query.toLowerCase();
      filteredCategories = filteredCategories.filter(
        cat => 
          cat.name.toLowerCase().includes(queryLower) || 
          cat.nameAr.includes(queryLower) ||
          (cat.description && cat.description.toLowerCase().includes(queryLower))
      );
    }
    
    // Remove children if not requested
    if (!includeChildren) {
      filteredCategories = filteredCategories.map(cat => ({
        ...cat,
        children: undefined
      }));
    }
    
    // Calculate total product count
    const totalProducts = filteredCategories.reduce((sum, cat) => {
      const childrenCount = cat.children 
        ? cat.children.reduce((sum, child) => sum + (child.productCount || 0), 0)
        : 0;
      return sum + (cat.productCount || 0) + childrenCount;
    }, 0);
    
    return NextResponse.json({
      success: true,
      data: filteredCategories,
      total: filteredCategories.length,
      totalProducts
    });
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الفئات',
      },
      { status: 500 }
    );
  }
}
