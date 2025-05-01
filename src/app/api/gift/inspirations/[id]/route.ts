import { NextResponse } from 'next/server';
import { getInspirationById } from '@/lib/actions/inspiration-actions';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'معرف الإلهام مطلوب',
        },
        { status: 400 }
      );
    }

    const inspiration = await getInspirationById(id);
    
    if (!inspiration) {
      return NextResponse.json(
        {
          success: false,
          error: 'الإلهام غير موجود',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...inspiration,
    });
  } catch (error) {
    console.error('Error fetching inspiration by ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الإلهام',
      },
      { status: 500 }
    );
  }
}
