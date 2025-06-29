/**
 * نظام التوصيات الذكي المتقدم
 * يحلل سلوك العملاء ويقدم توصيات مخصصة بناءً على:
 * - تاريخ البحث والمشاهدات
 * - التفضيلات الشخصية
 * - السلوك الشرائي
 * - التشابه مع عملاء آخرين
 */

import { prisma } from '@/lib/prisma';

export interface RecommendationOptions {
  customerId: string;
  limit?: number;
  type?: 'personalized' | 'similar' | 'trending' | 'category_based' | 'mixed';
  excludeIds?: string[];
  context?: {
    currentProductId?: string;
    currentCategory?: string;
    priceRange?: [number, number];
  };
}

export interface RecommendationResult {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  recommendationType: string;
  relevanceScore: number;
  reason: string;
}

export class SmartRecommendationEngine {
  private static instance: SmartRecommendationEngine;
  
  public static getInstance(): SmartRecommendationEngine {
    if (!SmartRecommendationEngine.instance) {
      SmartRecommendationEngine.instance = new SmartRecommendationEngine();
    }
    return SmartRecommendationEngine.instance;
  }

  /**
   * الدالة الرئيسية للحصول على التوصيات
   */
  async getRecommendations(options: RecommendationOptions): Promise<RecommendationResult[]> {
    try {
      // التحقق من تسجيل الدخول
      if (!options.customerId) {
        throw new Error('Customer must be logged in to get personalized recommendations');
      }

      const limit = options.limit || 12;
      let recommendations: RecommendationResult[] = [];

      // جلب بيانات العميل وسلوكه
      const customerData = await this.getCustomerInsights(options.customerId);
      
      if (!customerData.behavior) {
        // عميل جديد - توصيات عامة
        recommendations = await this.getNewCustomerRecommendations(options);
      } else {
        // عميل له تاريخ - توصيات مخصصة
        switch (options.type) {
          case 'personalized':
            recommendations = await this.getPersonalizedRecommendations(options, customerData);
            break;
          case 'similar':
            recommendations = await this.getSimilarProductRecommendations(options, customerData);
            break;
          case 'trending':
            recommendations = await this.getTrendingRecommendations(options);
            break;
          case 'category_based':
            recommendations = await this.getCategoryBasedRecommendations(options, customerData);
            break;
          default:
            recommendations = await this.getMixedRecommendations(options, customerData);
        }
      }

      // تسجيل التوصيات في التاريخ
      await this.logRecommendations(options.customerId, recommendations, options.type || 'mixed');

      return recommendations.slice(0, limit);

    } catch (error) {
      console.error('خطأ في نظام التوصيات:', error);
      return [];
    }
  }

  /**
   * جلب رؤى العميل
   */
  private async getCustomerInsights(customerId: string) {
    const [behavior, preferences, recentInteractions, segments] = await Promise.all([
      prisma.customerBehavior.findUnique({ where: { customerId } }),
      prisma.customerPreferenceProfile.findUnique({ where: { customerId } }),
      prisma.productInteraction.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { product: true },
      }),
      prisma.customerSegment.findMany({ where: { customerId } }),
    ]);

    return { behavior, preferences, recentInteractions, segments };
  }

  /**
   * توصيات للعملاء الجدد
   */
  private async getNewCustomerRecommendations(options: RecommendationOptions): Promise<RecommendationResult[]> {
    const products = await prisma.product.findMany({
      where: {
        id: { notIn: options.excludeIds || [] },
        inStock: true,
      },
      orderBy: [
        { trending: 'desc' },
        { best_seller: 'desc' },
        { rating: 'desc' },
        { views: 'desc' },
      ],
      take: options.limit || 12,
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      category: product.category || '',
      rating: product.rating,
      recommendationType: 'trending',
      relevanceScore: this.calculateTrendingScore(product),
      reason: 'منتج رائج ومُختار خصيصاً للعملاء الجدد',
    }));
  }

  /**
   * التوصيات الشخصية المتقدمة
   */
  private async getPersonalizedRecommendations(
    options: RecommendationOptions,
    customerData: Record<string, unknown>
  ): Promise<RecommendationResult[]> {
    const { behavior, recentInteractions } = customerData;
    
    // تحليل الفئات المفضلة
    const behaviorData = behavior as Record<string, unknown> | undefined;
    const favoriteCategories = (behaviorData?.favoriteCategories as Record<string, number>) || {};
    const topCategories = Object.entries(favoriteCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // تحليل المنتجات المُشاهدة مؤخراً
    const recentInteractionsArray = recentInteractions as Array<Record<string, unknown>> | undefined;
    const recentlyViewedProductIds = recentInteractionsArray
      ?.filter(i => i.interactionType === 'view')
      .slice(0, 10)
      .map(i => i.productId as string)
      .filter(id => typeof id === 'string') || [];

    // البحث عن منتجات مشابهة
    const recommendations = await prisma.product.findMany({
      where: {
        AND: [
          { id: { notIn: [...(options.excludeIds || []), ...recentlyViewedProductIds] } },
          { inStock: true },
          {
            OR: [
              { category: { in: topCategories } },
              { tags: { hasSome: this.extractTagsFromBehavior(behaviorData || {}) } },
            ],
          },
        ],
      },
      orderBy: [
        { rating: 'desc' },
        { views: 'desc' },
      ],
      take: (options.limit || 12) * 2, // جلب ضعف العدد للفلترة
    });

    // حساب نقاط الصلة
    return recommendations
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        category: product.category || '',
        rating: product.rating,
        recommendationType: 'personalized',
        relevanceScore: this.calculatePersonalizedScore(product, customerData),
        reason: this.generateRecommendationReason(product, customerData),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, options.limit || 12);
  }

  /**
   * توصيات المنتجات المشابهة
   */
  private async getSimilarProductRecommendations(
    options: RecommendationOptions,
    customerData: Record<string, unknown>
  ): Promise<RecommendationResult[]> {
    const currentProductId = options.context?.currentProductId;
    
    if (!currentProductId) {
      return this.getPersonalizedRecommendations(options, customerData);
    }

    const currentProduct = await prisma.product.findUnique({
      where: { id: currentProductId },
    });

    if (!currentProduct) {
      return [];
    }

    // البحث عن منتجات مشابهة بناءً على الفئة والعلامات
    const similarProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: currentProductId } },
          { id: { notIn: options.excludeIds || [] } },
          { inStock: true },
          {
            OR: [
              { category: currentProduct.category },
              { brand: currentProduct.brand },
              { tags: { hasSome: currentProduct.tags } },
            ],
          },
        ],
      },
      orderBy: [
        { rating: 'desc' },
        { views: 'desc' },
      ],
      take: options.limit || 12,
    });

    return similarProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      category: product.category || '',
      rating: product.rating,
      recommendationType: 'similar',
      relevanceScore: this.calculateSimilarityScore(currentProduct, product),
      reason: `مشابه لـ ${currentProduct.name}`,
    }));
  }

  /**
   * التوصيات الرائجة
   */
  private async getTrendingRecommendations(options: RecommendationOptions): Promise<RecommendationResult[]> {
    const trendingProducts = await prisma.product.findMany({
      where: {
        id: { notIn: options.excludeIds || [] },
        inStock: true,
        OR: [
          { trending: true },
          { best_seller: true },
          { views: { gte: 100 } },
        ],
      },
      orderBy: [
        { trending: 'desc' },
        { views: 'desc' },
        { rating: 'desc' },
      ],
      take: options.limit || 12,
    });

    return trendingProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      category: product.category || '',
      rating: product.rating,
      recommendationType: 'trending',
      relevanceScore: this.calculateTrendingScore(product),
      reason: 'منتج رائج ومطلوب بكثرة',
    }));
  }

  /**
   * توصيات مبنية على الفئة
   */
  private async getCategoryBasedRecommendations(
    options: RecommendationOptions,
    customerData: Record<string, unknown>
  ): Promise<RecommendationResult[]> {
    const { behavior } = customerData;
    const behaviorData = behavior as Record<string, unknown> | undefined;
    const favoriteCategories = (behaviorData?.favoriteCategories as Record<string, number>) || {};
    const currentCategory = options.context?.currentCategory;
    
    const targetCategory = currentCategory || Object.keys(favoriteCategories)[0];
    
    if (!targetCategory) {
      return this.getTrendingRecommendations(options);
    }

    const categoryProducts = await prisma.product.findMany({
      where: {
        id: { notIn: options.excludeIds || [] },
        inStock: true,
        category: targetCategory,
      },
      orderBy: [
        { rating: 'desc' },
        { views: 'desc' },
      ],
      take: options.limit || 12,
    });

    return categoryProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      category: product.category || '',
      rating: product.rating,
      recommendationType: 'category_based',
      relevanceScore: this.calculateCategoryScore(product),
      reason: `من فئة ${targetCategory} المفضلة لديك`,
    }));
  }

  /**
   * توصيات مختلطة (الأفضل)
   */
  private async getMixedRecommendations(
    options: RecommendationOptions,
    customerData: Record<string, unknown>
  ): Promise<RecommendationResult[]> {
    const limit = options.limit || 12;
    
    // تقسيم التوصيات
    const personalizedCount = Math.ceil(limit * 0.4); // 40%
    const similarCount = Math.ceil(limit * 0.3); // 30%
    const trendingCount = limit - personalizedCount - similarCount; // 30%

    const [personalized, similar, trending] = await Promise.all([
      this.getPersonalizedRecommendations({ ...options, limit: personalizedCount }, customerData),
      this.getSimilarProductRecommendations({ ...options, limit: similarCount }, customerData),
      this.getTrendingRecommendations({ ...options, limit: trendingCount }),
    ]);

    // دمج وترتيب النتائج
    const allRecommendations = [...personalized, ...similar, ...trending];
    const uniqueRecommendations = this.removeDuplicates(allRecommendations);
    
    return uniqueRecommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * حساب نقاط مختلفة للترتيب
   */
  private calculatePersonalizedScore(product: Record<string, unknown>, customerData: Record<string, unknown>): number {
    let score = 0;
    
    // نقاط الفئة المفضلة
    const behaviorData = customerData.behavior as Record<string, unknown> | undefined;
    const favoriteCategories = (behaviorData?.favoriteCategories as Record<string, number>) || {};
    if (product.category && typeof product.category === 'string' && favoriteCategories[product.category]) {
      score += favoriteCategories[product.category] * 10;
    }
    
    // نقاط التقييم
    if (product.rating && typeof product.rating === 'number') {
      score += product.rating * 20;
    }
    
    // نقاط الرواج
    if (product.trending) score += 30;
    if (product.best_seller) score += 25;
    
    // نقاط المشاهدات
    if (product.views && typeof product.views === 'number') {
      score += Math.min(product.views / 10, 20);
    }
    
    return score;
  }

  private calculateSimilarityScore(originalProduct: Record<string, unknown>, compareProduct: Record<string, unknown>): number {
    let score = 0;
    
    if (originalProduct.category === compareProduct.category) score += 40;
    if (originalProduct.brand === compareProduct.brand) score += 30;
    
    // مقارنة العلامات
    const originalTags = originalProduct.tags as string[] | undefined;
    const compareTags = compareProduct.tags as string[] | undefined;
    if (originalTags && compareTags) {
      const commonTags = originalTags.filter((tag: string) => 
        compareTags.includes(tag)
      );
      score += commonTags.length * 10;
    }
    
    // مقارنة السعر
    const originalPrice = originalProduct.price as number;
    const comparePrice = compareProduct.price as number;
    if (typeof originalPrice === 'number' && typeof comparePrice === 'number') {
      const priceDiff = Math.abs(originalPrice - comparePrice);
      const priceScore = Math.max(0, 20 - (priceDiff / originalPrice) * 100);
      score += priceScore;
    }
    
    return score;
  }

  private calculateTrendingScore(product: Record<string, unknown>): number {
    let score = 0;
    
    if (product.trending) score += 50;
    if (product.best_seller) score += 40;
    if (product.new_arrival) score += 30;
    if (product.rating && typeof product.rating === 'number') score += product.rating * 10;
    
    if (product.views && typeof product.views === 'number') {
      score += Math.min(product.views / 20, 30);
    }
    
    return score;
  }

  private calculateCategoryScore(product: Record<string, unknown>): number {
    let score = 50; // نقاط أساسية للفئة
    
    if (product.rating && typeof product.rating === 'number') score += product.rating * 15;
    if (product.trending) score += 25;
    if (product.best_seller) score += 20;
    
    return score;
  }

  /**
   * دوال مساعدة
   */
  private extractTagsFromBehavior(behavior: Record<string, unknown>): string[] {
    // استخراج العلامات من سلوك العميل
    const topSearchTerms = behavior?.topSearchTerms as string[] | undefined;
    return topSearchTerms?.slice(0, 10) || [];
  }

  private generateRecommendationReason(product: Record<string, unknown>, customerData: Record<string, unknown>): string {
    const behaviorData = customerData.behavior as Record<string, unknown> | undefined;
    const favoriteCategories = (behaviorData?.favoriteCategories as Record<string, number>) || {};
    
    if (product.category && typeof product.category === 'string' && favoriteCategories[product.category]) {
      return `مقترح من فئة ${product.category} المفضلة لديك`;
    }
    
    if (product.rating && typeof product.rating === 'number' && product.rating > 4) {
      return `منتج عالي التقييم (${product.rating}/5)`;
    }
    
    if (product.trending) {
      return 'منتج رائج حالياً';
    }
    
    return 'مقترح خصيصاً لك';
  }

  private removeDuplicates(recommendations: RecommendationResult[]): RecommendationResult[] {
    const seen = new Set();
    return recommendations.filter(rec => {
      if (seen.has(rec.id)) {
        return false;
      }
      seen.add(rec.id);
      return true;
    });
  }

  /**
   * تسجيل التوصيات في السجل
   */
  private async logRecommendations(
    customerId: string,
    recommendations: RecommendationResult[],
    type: string
  ) {
    try {
      await prisma.recommendationHistory.create({
        data: {
          customerId,
          recommendationType: type,
          recommendedItems: {
            products: recommendations.map(r => ({
              id: r.id,
              name: r.name,
              relevanceScore: r.relevanceScore,
              reason: r.reason,
            })),
          },
          context: {
            timestamp: new Date(),
            count: recommendations.length,
          },
          shown: true,
        },
      });
    } catch (error) {
      console.error('خطأ في تسجيل التوصيات:', error);
    }
  }

  /**
   * تحديث فعالية التوصيات (عند النقر أو الشراء)
   */
  async updateRecommendationEffectiveness(
    customerId: string,
    productId: string,
    action: 'click' | 'purchase'
  ) {
    try {
      // البحث عن آخر توصيات للعميل
      const recentRecommendation = await prisma.recommendationHistory.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

      if (recentRecommendation) {
        const updatedClicked = action === 'click' 
          ? [...(recentRecommendation.clicked || []), productId]
          : recentRecommendation.clicked;
          
        const updatedPurchased = action === 'purchase'
          ? [...(recentRecommendation.purchased || []), productId]
          : recentRecommendation.purchased;

        await prisma.recommendationHistory.update({
          where: { id: recentRecommendation.id },
          data: {
            clicked: updatedClicked,
            purchased: updatedPurchased,
          },
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث فعالية التوصيات:', error);
    }
  }
}

export const smartRecommendationEngine = SmartRecommendationEngine.getInstance();
