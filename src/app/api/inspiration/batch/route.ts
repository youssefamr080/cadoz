import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'يجب توفير مصفوفة من معرفات الهدايا' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Convert string IDs to ObjectId where possible
    const objectIds = ids.map(id => {
      try {
        return new ObjectId(id);
      } catch {
        return id; // Keep as string if not a valid ObjectId
      }
    });

    // Query inspirations by either _id or id
    const inspirations = await db.collection('inspirations').find({
      $or: [
        { _id: { $in: objectIds } },
       
      ]
    }).toArray();

    // Map the inspirations to ensure consistent ID format
    const formattedInspirations = inspirations.map(inspiration => ({
      ...inspiration,
      id: inspiration.id || inspiration._id.toString()
    }));

    return NextResponse.json(formattedInspirations);
  } catch (error) {
    console.error('Error fetching inspirations batch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الهدايا' },
      { status: 500 }
    );
  }
}
