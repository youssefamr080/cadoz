'use client';
import React, { useState, useCallback, useEffect } from 'react';
import GiftStepChocolates from './GiftStepChocolates';
import GiftStepCandies from './GiftStepCandies';
import GiftStepBox from './GiftStepBox';
import GiftStepDecorations from './GiftStepDecorations';
import GiftStepWrap from './GiftStepWrap';
import GiftSummary from './GiftSummary';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useGift } from '../../context/GiftContext';

type GiftStep = 'chocolates' | 'candies' | 'box' | 'decorations' | 'wrap' | 'summary';

const stepsConfig = [
  {
    id: 'chocolates',
    title: 'الشوكولاتة',
    fullTitle: 'اختيار الشوكولاتة',
    icon: '🍫',
    color: 'rose',
  },
  {
    id: 'candies',
    title: 'الحلويات',
    fullTitle: 'اختيار الحلويات',
    icon: '🍬',
    color: 'emerald',
  },
  {
    id: 'box',
    title: 'الصندوق',
    fullTitle: 'اختيار الصندوق',
    icon: '🎁',
    color: 'blue',
  },
  {
    id: 'decorations',
    title: 'الزينة',
    fullTitle: 'اختيار الزينة',
    icon: '✨',
    color: 'purple',
  },
  {
    id: 'wrap',
    title: 'التغليف',
    fullTitle: 'اختيار التغليف',
    icon: '🎀',
    color: 'pink',
  },
  {
    id: 'summary',
    title: 'الملخص',
    fullTitle: 'ملخص الهدية',
    icon: '✅',
    color: 'indigo',
  },
];

const stepVariants = {
  hidden: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? '100%' : '-100%',
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
  exit: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? '-100%' : '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  }),
};

const GiftStepSwitcher = () => {
  const [currentStep, setCurrentStep] = useState<GiftStep>('chocolates');
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const { state } = useGift();
  
  // Used for client-side rendering only
  const [selectedItemsCount, setSelectedItemsCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  // Run only on client side after hydration
  useEffect(() => {
    setIsMounted(true);
    
    // Calculate selected items count
    let count = 0;
    if (state.selectedBox) count++;
    if (state.selectedWrap) count++;
    count += state.cart.length;
    setSelectedItemsCount(count);
  }, [state.selectedBox, state.selectedWrap, state.cart]);
  
  // تحديد اللون النشط بناءً على الخطوة الحالية
  const getActiveColor = () => {
    const step = stepsConfig.find(s => s.id === currentStep);
    return step?.color || 'rose';
  };
  
  // تحديد لون الخلفية الفاتح بناءً على اللون النشط
  const getActiveBgColor = () => {
    const colorMap = {
      rose: 'bg-rose-50',
      emerald: 'bg-emerald-50',
      blue: 'bg-blue-50',
      purple: 'bg-purple-50',
      pink: 'bg-pink-50',
      indigo: 'bg-indigo-50',
    };
    return colorMap[getActiveColor()];
  };
  
  // تحديد لون النص بناءً على اللون النشط
  const getActiveTextColor = () => {
    const colorMap = {
      rose: 'text-rose-600',
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
      indigo: 'text-indigo-600',
    };
    return colorMap[getActiveColor()];
  };
  
  // تحديد لون الحدود بناءً على اللون النشط
  const getActiveBorderColor = () => {
    const colorMap = {
      rose: 'border-rose-600',
      emerald: 'border-emerald-600',
      blue: 'border-blue-600',
      purple: 'border-purple-600',
      pink: 'border-pink-600',
      indigo: 'border-indigo-600',
    };
    return colorMap[getActiveColor()];
  };
  
  // تحديد لون الخلفية الداكن بناءً على اللون النشط
  const getActiveBgDarkColor = () => {
    const colorMap = {
      rose: 'bg-rose-600',
      emerald: 'bg-emerald-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      pink: 'bg-pink-600',
      indigo: 'bg-indigo-600',
    };
    return colorMap[getActiveColor()];
  };
  
  // تحديد لون التمرير بناءً على اللون النشط
  const getActiveHoverColor = () => {
    const colorMap = {
      rose: 'hover:bg-rose-700',
      emerald: 'hover:bg-emerald-700',
      blue: 'hover:bg-blue-700',
      purple: 'hover:bg-purple-700',
      pink: 'hover:bg-pink-700',
      indigo: 'hover:bg-indigo-700',
    };
    return colorMap[getActiveColor()];
  };

  // تحديد لون الخلفية الخفيف للأزرار غير النشطة
  const getLightBgColor = () => {
    const colorMap = {
      rose: 'bg-rose-100',
      emerald: 'bg-emerald-100',
      blue: 'bg-blue-100',
      purple: 'bg-purple-100',
      pink: 'bg-pink-100',
      indigo: 'bg-indigo-100',
    };
    return colorMap[getActiveColor()];
  };
  
  // تتبع مؤشر التاب النشط
  useEffect(() => {
    const index = stepsConfig.findIndex(s => s.id === currentStep);
    setActiveTabIndex(index);
  }, [currentStep]);
  
  // التنقل بين الخطوات
  const navigate = useCallback((dir: 'next' | 'prev') => {
    const currentIndex = stepsConfig.findIndex(s => s.id === currentStep);
    let newIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= stepsConfig.length) {
      newIndex = stepsConfig.length - 1;
    }
    
    setDirection(dir === 'next' ? 'left' : 'right');
    setCurrentStep(stepsConfig[newIndex].id as GiftStep);
  }, [currentStep]);
  
  // معالجة اختيار التاب
  const handleTabSelect = (index: number) => {
    const newStep = stepsConfig[index].id as GiftStep;
    const oldIndex = stepsConfig.findIndex(s => s.id === currentStep);
    
    setDirection(index > oldIndex ? 'left' : 'right');
    setCurrentStep(newStep);
  };

  // معالجة حدث اللمس للسحب
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // التحقق من وجود سحب أفقي مهم (أكثر من 50 بيكسل) والتأكد من أن حركة الأفقية أكبر من الرأسية
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // سحب لليمين -> الخطوة السابقة
        navigate('prev');
      } else {
        // سحب لليسار -> الخطوة التالية
        navigate('next');
      }
    }
  };
  
  // عرض الخطوة الحالية
  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 'chocolates':
        return <GiftStepChocolates />;
      case 'candies':
        return <GiftStepCandies />;
      case 'box':
        return <GiftStepBox />;
      case 'decorations':
        return <GiftStepDecorations />;
      case 'wrap':
        return <GiftStepWrap />;
      case 'summary':
        return <GiftSummary />;
      default:
        return <div>خطوة غير معروفة</div>;
    }
  }, [currentStep]);

  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full border-t-4 transition-colors duration-300 ${getActiveBorderColor()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* عناوين الخطوات - صيغة الهاتف المحمول (مختصرة مع أيقونات واضحة) */}
      <div className="overflow-x-auto scrollbar-hide md:hidden">
        <div className="flex px-1 py-2 border-b relative">
          {stepsConfig.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleTabSelect(index)}
              className={`relative flex flex-col items-center justify-center px-2 py-1 mx-1 rounded-lg font-medium transition-all duration-300 flex-1 min-w-0 ${
                currentStep === step.id
                  ? `${getActiveTextColor()} ${getActiveBgColor()}`
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{step.icon}</span>
              <span className="text-xs truncate w-full text-center">{step.title}</span>
              {currentStep === step.id && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 w-full rounded-lg ${getActiveBgDarkColor()}`}
                  layoutId="mobileIndicator"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* عناوين الخطوات - صيغة الحاسوب (كاملة) */}
      <div className="hidden md:block overflow-x-auto scrollbar-hide">
        <div className="flex px-1 py-2 border-b relative min-w-max">
          {stepsConfig.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleTabSelect(index)}
              className={`flex items-center justify-center px-3 py-2 mx-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                currentStep === step.id
                  ? `${getActiveTextColor()} ${getActiveBgColor()}`
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{step.icon}</span>
              {step.fullTitle}
            </button>
          ))}
          
          {/* مؤشر التاب النشط (المتحرك) */}
          <motion.div
            className={`absolute bottom-0 h-1 rounded-t-lg transition-colors ${getActiveBgDarkColor()}`}
            layoutId="desktopIndicator"
            initial={false}
            animate={{
              left: `calc(${activeTabIndex * (100 / stepsConfig.length)}% + ${activeTabIndex * 2}px)`,
              width: `calc(${100 / stepsConfig.length}% - 4px)`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* معلومات الخطوة الحالية */}
      <div className={`px-4 py-2 flex justify-between items-center border-b ${getActiveBgColor()}`}>
        <h3 className={`flex items-center text-base md:text-lg font-bold ${getActiveTextColor()}`}>
          <span className="text-xl mr-2">{stepsConfig.find(s => s.id === currentStep)?.icon}</span>
          {stepsConfig.find(s => s.id === currentStep)?.fullTitle}
        </h3>
        
        <div className="flex items-center">
          <div className={`${getLightBgColor()} px-2 py-1 rounded-full text-xs font-medium shadow-sm flex items-center`}>
            <span className={`font-bold ${getActiveTextColor()}`}>
              {isMounted ? selectedItemsCount : 0}
            </span>
            <span className="text-gray-500 mr-1 whitespace-nowrap">عناصر</span>
          </div>
        </div>
      </div>

      {/* محتوى الخطوة مع التمرير السلس */}
      <div 
        className="flex-grow overflow-y-auto overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-2 md:p-4"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* شريط تقدم مبسط */}
      <div className="px-4 pt-2 pb-1">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-full ${getActiveBgDarkColor()}`}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((activeTabIndex + 1) / stepsConfig.length) * 100}%` 
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500 px-1">
          <span>البداية</span>
          <span>النهاية</span>
        </div>
      </div>

      {/* أزرار التنقل للهاتف المحمول */}
      <div className="p-3 flex border-t sticky bottom-0 bg-white shadow-inner">
        <button
          onClick={() => navigate('prev')}
          disabled={activeTabIndex === 0}
          className={`flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mr-2 w-1/2 ${activeTabIndex === 0 ? 'invisible' : 'visible'}`}
        >
          <ChevronLeftIcon className="w-5 h-5 ml-1" />
          <span>السابق</span>
        </button>

        <button
          onClick={() => navigate('next')}
          disabled={activeTabIndex === stepsConfig.length - 1}
          className={`flex items-center justify-center ${getActiveBgDarkColor()} ${getActiveHoverColor()} text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm flex-1 ml-2`}
        >
          <span>{activeTabIndex === stepsConfig.length - 1 ? 'إنهاء' : 'التالي'}</span>
          <ChevronRightIcon className="w-5 h-5 mr-1" />
        </button>
      </div>

      {/* إضافة كود CSS لإخفاء شريط التمرير وتحسين التجربة على الهاتف */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 640px) {
          body {
            overscroll-behavior-y: contain;
            touch-action: pan-y;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default GiftStepSwitcher;