/**
 * خدمة تتبع سلوك العملاء المتقدمة
 * تتتبع جميع تفاعلات العميل وتحلل سلوكه لتقديم توصيات مخصصة
 */

import { prisma } from '@/lib/prisma';

export interface UserSession {
  customerId?: string;
  sessionId: string;
  startTime: Date;
  isLoggedIn: boolean;
}

export interface TrackingEvent {
  customerId?: string;
  sessionId: string;
  eventType: string;
  productId?: string;
  searchTerm?: string;
  category?: string;
  value?: number;
  context?: Record<string, unknown>;
  source?: string;
}

export class BehaviorTracker {
  private static instance: BehaviorTracker;
  
  public static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  /**
   * تتبع البحث
   */
  async trackSearch(data: {
    customerId?: string;
    sessionId: string;
    searchTerm: string;
    category?: string;
    resultsCount: number;
    source?: string;
  }) {
    try {
      // إذا كان العميل مسجل دخول، احفظ في تاريخ البحث
      if (data.customerId) {
        await prisma.searchHistory.create({
          data: {
            customerId: data.customerId,
            searchTerm: data.searchTerm,
            category: data.category,
            resultsCount: data.resultsCount,
            sessionId: data.sessionId,
            source: data.source || 'search_bar',
          },
        });

        // تحديث إحصائيات السلوك
        await this.updateBehaviorStats(data.customerId, 'search', {
          searchTerm: data.searchTerm,
          category: data.category,
        });
      }

      // تتبع عام للجلسة (حتى لو لم يكن مسجل دخول)
      await this.trackEvent({
        customerId: data.customerId,
        sessionId: data.sessionId,
        eventType: 'search',
        searchTerm: data.searchTerm,
        category: data.category,
        value: data.resultsCount,
        source: data.source,
      });

    } catch (error) {
      console.error('خطأ في تتبع البحث:', error);
    }
  }

  /**
   * تتبع مشاهدة المنتج
   */
  async trackProductView(data: {
    customerId?: string;
    sessionId: string;
    productId: string;
    duration?: number;
    source?: string;
    context?: Record<string, unknown>;
  }) {
    try {
      if (data.customerId) {
        // حفظ مشاهدة المنتج
        await prisma.productView.create({
          data: {
            userId: data.customerId,
            productId: data.productId,
            sessionId: data.sessionId,
            duration: data.duration || 0,
            source: data.source || 'direct',
            device: JSON.parse(JSON.stringify(data.context?.device || {})),
            interactions: JSON.parse(JSON.stringify(data.context?.interactions || {})),
          },
        });

        // تسجيل تفاعل
        await prisma.productInteraction.create({
          data: {
            customerId: data.customerId,
            productId: data.productId,
            interactionType: 'view',
            value: data.duration,
            context: JSON.parse(JSON.stringify(data.context || {})),
            sessionId: data.sessionId,
            source: data.source,
          },
        });

        // تحديث إحصائيات السلوك
        await this.updateBehaviorStats(data.customerId, 'product_view', {
          productId: data.productId,
          duration: data.duration,
        });
      }

      // زيادة عداد مشاهدات المنتج
      await prisma.product.update({
        where: { id: data.productId },
        data: { views: { increment: 1 } },
      });

    } catch (error) {
      console.error('خطأ في تتبع مشاهدة المنتج:', error);
    }
  }

  /**
   * تتبع إضافة للسلة
   */
  async trackAddToCart(data: {
    customerId?: string;
    sessionId: string;
    productId: string;
    quantity: number;
    price: number;
    source?: string;
  }) {
    try {
      if (data.customerId) {
        await prisma.productInteraction.create({
          data: {
            customerId: data.customerId,
            productId: data.productId,
            interactionType: 'add_to_cart',
            value: data.price * data.quantity,
            context: {
              quantity: data.quantity,
              price: data.price,
            },
            sessionId: data.sessionId,
            source: data.source,
          },
        });

        await this.updateBehaviorStats(data.customerId, 'add_to_cart', {
          productId: data.productId,
          value: data.price * data.quantity,
        });
      }
    } catch (error) {
      console.error('خطأ في تتبع إضافة للسلة:', error);
    }
  }

  /**
   * تتبع الشراء
   */
  async trackPurchase(data: {
    customerId: string;
    sessionId: string;
    orderId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  }) {
    try {
      // تسجيل تفاعلات الشراء لكل منتج
      for (const item of data.items) {
        await prisma.productInteraction.create({
          data: {
            customerId: data.customerId,
            productId: item.productId,
            interactionType: 'purchase',
            value: item.price * item.quantity,
            context: {
              orderId: data.orderId,
              quantity: item.quantity,
              price: item.price,
            },
            sessionId: data.sessionId,
            source: 'checkout',
          },
        });
      }

      // تحديث إحصائيات السلوك العامة
      await this.updateBehaviorStats(data.customerId, 'purchase', {
        orderId: data.orderId,
        totalAmount: data.totalAmount,
        itemsCount: data.items.length,
      });

    } catch (error) {
      console.error('خطأ في تتبع الشراء:', error);
    }
  }

  /**
   * تحديث إحصائيات السلوك
   */
  private async updateBehaviorStats(
    customerId: string,
    eventType: string,
    data: Record<string, unknown>
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const behavior = await prisma.customerBehavior.upsert({
        where: { customerId },
        create: {
          customerId,
          totalSessions: 1,
          totalTimeSpent: 0,
          totalSearches: eventType === 'search' ? 1 : 0,
          topSearchTerms: eventType === 'search' ? [data.searchTerm as string] : [],
          viewedProductsCount: eventType === 'product_view' ? 1 : 0,
          purchasedProductsCount: eventType === 'purchase' ? (data.itemsCount as number || 0) : 0,
        },
        update: {
          totalSearches: eventType === 'search' ? { increment: 1 } : undefined,
          viewedProductsCount: eventType === 'product_view' ? { increment: 1 } : undefined,
          purchasedProductsCount: eventType === 'purchase' ? { increment: data.itemsCount as number || 0 } : undefined,
          lastUpdated: new Date(),
        },
      });

      // تحديث مصطلحات البحث الأكثر شيوعاً
      if (eventType === 'search' && data.searchTerm) {
        await this.updateTopSearchTerms(customerId, data.searchTerm as string);
      }

      // تحديث الفئات المفضلة
      if (data.category) {
        await this.updateFavoriteCategories(customerId, data.category as string);
      }

    } catch (error) {
      console.error('خطأ في تحديث إحصائيات السلوك:', error);
    }
  }

  /**
   * تتبع الأحداث العامة
   */
  async trackEvent(event: TrackingEvent) {
    try {
      if (event.customerId) {
        await prisma.customerEvent.create({
          data: {
            userId: event.customerId,
            eventType: event.eventType,
            context: JSON.parse(JSON.stringify(event.context || {})),
            data: {
              sessionId: event.sessionId,
              productId: event.productId,
              searchTerm: event.searchTerm,
              category: event.category,
              value: event.value,
              source: event.source,
            },
          },
        });
      }
    } catch (error) {
      console.error('خطأ في تتبع الحدث:', error);
    }
  }

  /**
   * تحديث مصطلحات البحث الأكثر شيوعاً
   */
  private async updateTopSearchTerms(customerId: string, searchTerm: string) {
    try {
      const behavior = await prisma.customerBehavior.findUnique({
        where: { customerId },
      });

      if (behavior) {
        const currentTerms = behavior.topSearchTerms || [];
        const updatedTerms = [...currentTerms, searchTerm];
        
        // الاحتفاظ بآخر 50 مصطلح بحث
        const recentTerms = updatedTerms.slice(-50);

        await prisma.customerBehavior.update({
          where: { customerId },
          data: { topSearchTerms: recentTerms },
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث مصطلحات البحث:', error);
    }
  }

  /**
   * تحديث الفئات المفضلة
   */
  private async updateFavoriteCategories(customerId: string, category: string) {
    try {
      const behavior = await prisma.customerBehavior.findUnique({
        where: { customerId },
      });

      if (behavior) {
        const currentCategories = (behavior.favoriteCategories as Record<string, number>) || {};
        currentCategories[category] = (currentCategories[category] || 0) + 1;

        await prisma.customerBehavior.update({
          where: { customerId },
          data: { favoriteCategories: currentCategories },
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث الفئات المفضلة:', error);
    }
  }

  /**
   * الحصول على ملخص سلوك العميل
   */
  async getCustomerBehaviorSummary(customerId: string) {
    try {
      const behavior = await prisma.customerBehavior.findUnique({
        where: { customerId },
      });

      const recentSearches = await prisma.searchHistory.findMany({
        where: { customerId },
        orderBy: { searchedAt: 'desc' },
        take: 10,
      });

      const recentViews = await prisma.productView.findMany({
        where: { userId: customerId },
        orderBy: { viewedAt: 'desc' },
        take: 10,
        include: { product: true },
      });

      return {
        behavior,
        recentSearches,
        recentViews,
      };
    } catch (error) {
      console.error('خطأ في جلب ملخص السلوك:', error);
      return null;
    }
  }
}

export const behaviorTracker = BehaviorTracker.getInstance();
