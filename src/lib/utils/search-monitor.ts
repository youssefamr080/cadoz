// مراقب أخطاء وتحذيرات وحدة التحكم للبحث
class SearchConsoleMonitor {
  private static instance: SearchConsoleMonitor;
  private errorCount = 0;
  private warningCount = 0;
  private performanceIssues: string[] = [];

  private constructor() {
    this.setupConsoleMonitoring();
  }

  static getInstance(): SearchConsoleMonitor {
    if (!SearchConsoleMonitor.instance) {
      SearchConsoleMonitor.instance = new SearchConsoleMonitor();
    }
    return SearchConsoleMonitor.instance;
  }

  private setupConsoleMonitoring() {
    // مراقبة الأخطاء العامة
    const originalError = console.error;
    console.error = (...args) => {
      this.errorCount++;
      
      // تتبع أخطاء معينة
      const errorMessage = args.join(' ');
      if (errorMessage.includes('DOM Node') || errorMessage.includes('hydration')) {
        this.performanceIssues.push(`Hydration Issue: ${errorMessage}`);
      }
      
      originalError.apply(console, args);
    };

    // مراقبة التحذيرات
    const originalWarn = console.warn;
    console.warn = (...args) => {
      this.warningCount++;
      
      const warningMessage = args.join(' ');
      if (warningMessage.includes('handler took') || warningMessage.includes('Violation')) {
        this.performanceIssues.push(`Performance Warning: ${warningMessage}`);
      }
      
      originalWarn.apply(console, args);
    };
  }

  // تسجيل مشكلة أداء
  reportPerformanceIssue(issue: string) {
    this.performanceIssues.push(`Custom Issue: ${issue}`);
    console.warn('🚨 مشكلة أداء:', issue);
  }

  // الحصول على تقرير الأخطاء
  getReport() {
    return {
      errors: this.errorCount,
      warnings: this.warningCount,
      performanceIssues: this.performanceIssues.slice(-10), // آخر 10 مشاكل
      timestamp: new Date().toISOString()
    };
  }

  // طباعة التقرير
  printReport() {
    const report = this.getReport();
    console.log('🔍 تقرير مراقبة البحث:', report);
  }

  // مسح التقرير
  reset() {
    this.errorCount = 0;
    this.warningCount = 0;
    this.performanceIssues = [];
  }
}

// تصدير الكلاس والدوال المساعدة
export const searchMonitor = SearchConsoleMonitor.getInstance();

export const reportSearchIssue = (issue: string) => {
  searchMonitor.reportPerformanceIssue(issue);
};

export const getSearchReport = () => {
  return searchMonitor.getReport();
};

export const printSearchReport = () => {
  searchMonitor.printReport();
};
