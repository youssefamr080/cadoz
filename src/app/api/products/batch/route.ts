import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'يجب توفير مصفوفة من معرفات المنتجات' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Separate IDs into valid ObjectIds and strings
    const validObjectIds: ObjectId[] = [];
    const stringIds: string[] = [];
    
    ids.forEach((_id: string) => {
      try {
        validObjectIds.push(new ObjectId(_id));
      } catch {
        stringIds.push(_id); // Keep as string if not a valid ObjectId
      }
    });

    // Query products by _id only (using $or to handle both ObjectId and string types)
    const query: Record<string, unknown> = {};
    
    if (validObjectIds.length > 0 && stringIds.length > 0) {
      query.$or = [
        { _id: { $in: validObjectIds } },
        { id: { $in: stringIds } }
      ];
    } else if (validObjectIds.length > 0) {
      query._id = { $in: validObjectIds };
    } else if (stringIds.length > 0) {
      query.id = { $in: stringIds };
    } else {
      // No valid IDs, return empty array
      return NextResponse.json([]);
    }
    
    const products = await db.collection('products').find(query).toArray();

    // Map the products to ensure consistent ID format
    const formattedProducts = products.map(product => ({
      ...product,
     _id: product._id.toString()
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products batch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}
