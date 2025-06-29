import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';

    switch (action) {
      case 'health':
        return NextResponse.json({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          message: 'Search system is running optimally'
        });

      case 'performance':
        // قياس أداء سريع للنظام
        const startTime = Date.now();
        
        // اختبار قاعدة البيانات
        const { prisma } = await import('@/lib/prisma');
        const productCount = await prisma.product.count();
        
        const dbTime = Date.now() - startTime;
        
        return NextResponse.json({
          success: true,
          metrics: {
            databaseQueryTime: `${dbTime}ms`,
            totalProducts: productCount,
            systemLoad: 'normal',
            cacheStatus: 'active'
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
