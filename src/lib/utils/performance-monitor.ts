/**
 * Performance monitoring utility for dynamic imports
 * أداة مراقبة الأداء للاستيرادات الديناميكية
 */

interface PerformanceMetrics {
  componentName: string
  loadTime: number
  bundleSize?: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private isEnabled: boolean = process.env.NODE_ENV === 'development'

  /**
   * Track component load time
   * تتبع وقت تحميل المكون
   */
  trackComponentLoad(componentName: string, startTime: number) {
    if (!this.isEnabled) return

    const loadTime = performance.now() - startTime
    const metric: PerformanceMetrics = {
      componentName,
      loadTime,
      timestamp: Date.now(),
    }

    this.metrics.push(metric)
    this.logMetric(metric)
  }

  /**
   * Track bundle size reduction
   * تتبع تقليل حجم الحزمة
   */
  trackBundleReduction(componentName: string, originalSize: number, reducedSize: number) {
    if (!this.isEnabled) return

    const reduction = originalSize - reducedSize
    const reductionPercentage = ((reduction / originalSize) * 100).toFixed(2)

    console.log(`📦 Bundle Reduction for ${componentName}:`)
    console.log(`   Original: ${originalSize}KB`)
    console.log(`   Reduced: ${reducedSize}KB`)
    console.log(`   Saved: ${reduction}KB (${reductionPercentage}%)`)
  }

  /**
   * Get performance summary
   * الحصول على ملخص الأداء
   */
  getPerformanceSummary() {
    if (this.metrics.length === 0) {
      return { message: 'No metrics recorded', arabic: 'لا توجد مقاييس مسجلة' }
    }

    const totalLoadTime = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0)
    const averageLoadTime = totalLoadTime / this.metrics.length
    const slowestComponent = this.metrics.reduce((slowest, current) => 
      current.loadTime > slowest.loadTime ? current : slowest
    )

    return {
      totalComponents: this.metrics.length,
      averageLoadTime: averageLoadTime.toFixed(2),
      slowestComponent: slowestComponent.componentName,
      slowestLoadTime: slowestComponent.loadTime.toFixed(2),
      message: `Loaded ${this.metrics.length} components with average load time of ${averageLoadTime.toFixed(2)}ms`,
      arabic: `تم تحميل ${this.metrics.length} مكونات بمتوسط وقت تحميل ${averageLoadTime.toFixed(2)} مللي ثانية`
    }
  }

  /**
   * Clear metrics
   * مسح المقاييس
   */
  clearMetrics() {
    this.metrics = []
  }

  /**
   * Enable/disable monitoring
   * تفعيل/تعطيل المراقبة
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  private logMetric(metric: PerformanceMetrics) {
    const status = metric.loadTime < 1000 ? '✅' : metric.loadTime < 3000 ? '⚠️' : '❌'
    console.log(`${status} ${metric.componentName}: ${metric.loadTime.toFixed(2)}ms`)
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// Export utility functions
export const trackComponentLoad = (componentName: string) => {
  const startTime = performance.now()
  return () => performanceMonitor.trackComponentLoad(componentName, startTime)
}

export const trackBundleReduction = (componentName: string, originalSize: number, reducedSize: number) => {
  performanceMonitor.trackBundleReduction(componentName, originalSize, reducedSize)
}

export const getPerformanceSummary = () => performanceMonitor.getPerformanceSummary()
export const clearMetrics = () => performanceMonitor.clearMetrics()
export const setMonitoringEnabled = (enabled: boolean) => performanceMonitor.setEnabled(enabled)

export default performanceMonitor 