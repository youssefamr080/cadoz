"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Gift, Send, Heart, Star, ShoppingBag } from "lucide-react";

interface WhatsappHelperProps {
  phoneNumber: string;
  storeName?: string;
}

type Step = 'start' | 'purpose' | 'recipient' | 'relationship' | 'occasion' | 'budget' | 'age' | 'summary';

interface MessageType {
  id: string;
  content: string | React.ReactNode;
  sender: 'bot' | 'user';
  options?: Option[];
}

interface Option {
  id: string;
  text: string;
  value: string;
  icon?: React.ReactNode;
}

interface GiftPurpose { id: string; text: string; icon: React.ReactNode; }
interface Recipient { id: string; text: string; icon: React.ReactNode; }
interface Relationship { id: string; text: string; }
interface Occasion { id: string; text: string; }
interface Budget { id: string; range: string; text: string; }
interface AgeGroup { id: string; text: string; }

const WhatsappHelper: React.FC<WhatsappHelperProps> = ({ phoneNumber, storeName = "cadoz" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('start');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [preferences, setPreferences] = useState({
    purpose: '',
    recipient: '',
    relationship: '',
    occasion: '',
    budget: '',
    age: '',
  });
  const [isNewSession, setIsNewSession] = useState(true);
  const [showPopupNotification, setShowPopupNotification] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messageCounter = useRef(0); // عداد لضمان الـ id الفريد

  // بيانات الاختيارات (نفس القوائم اللي كانت موجودة)
  const giftPurposes: GiftPurpose[] = [
    { id: 'gift', text: 'هدية', icon: <Gift className="w-4 h-4" /> },
    { id: 'personal', text: 'لنفسي', icon: <Heart className="w-4 h-4" /> },
    { id: 'special_occasion', text: 'مناسبة خاصة', icon: <Star className="w-4 h-4" /> },
    { id: 'corporate', text: 'هدية شركات', icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  const recipients: Recipient[] = [
    { id: 'male', text: 'رجل', icon: <span className="text-lg">👨</span> },
    { id: 'female', text: 'امرأة', icon: <span className="text-lg">👩</span> },
    { id: 'boy', text: 'صبي', icon: <span className="text-lg">👦</span> },
    { id: 'girl', text: 'فتاة', icon: <span className="text-lg">👧</span> },
  ];

  const relationships: Relationship[] = [
    { id: 'partner', text: 'شريك/ة حياة' },
    { id: 'friend', text: 'صديق/ة' },
    { id: 'parent', text: 'والد/ة' },
    { id: 'sibling', text: 'أخ/أخت' },
    { id: 'relative', text: 'قريب/ة' },
    { id: 'colleague', text: 'زميل/ة عمل' },
    { id: 'boss', text: 'مدير/ة' },
    { id: 'neighbor', text: 'جار/جارة' },
    { id: 'teacher', text: 'معلم/معلمة' },
    { id: 'doctor', text: 'دكتور/دكتورة' },
    { id: 'other', text: 'آخر' },
  ];

  const occasions: Occasion[] = [
    { id: 'birthday', text: 'عيد ميلاد' },
    { id: 'wedding', text: 'زفاف' },
    { id: 'anniversary', text: 'ذكرى سنوية' },
    { id: 'graduation', text: 'تخرج' },
    { id: 'eid', text: 'عيد' },
    { id: 'promotion', text: 'ترقية' },
    { id: 'housewarming', text: 'منزل جديد' },
    { id: 'mothers_day', text: 'عيد الأم' },
    { id: 'fathers_day', text: 'عيد الأب' },
    { id: 'ramadan', text: 'رمضان' },
    { id: 'eid_al_fitr', text: 'عيد الفطر' },
    { id: 'eid_al_adha', text: 'عيد الأضحى' },
    { id: 'other', text: 'مناسبة أخرى' },
  ];

  const budgets: Budget[] = [
    { id: 'budget_1', range: '50-200', text: '50 - 200 جنية' },
    { id: 'budget_2', range: '200-500', text: '200 - 500 جنية' },
    { id: 'budget_3', range: '500-1000', text: '500 - 1000 جنية' },
    { id: 'budget_4', range: '1000+', text: 'أكثر من 1000 جنية' },
  ];

  const ageGroups: AgeGroup[] = [
    { id: 'age_0_12', text: '0 - 12 سنة' },
    { id: 'age_13_18', text: '13 - 18 سنة' },
    { id: 'age_19_30', text: '19 - 30 سنة' },
    { id: 'age_31_50', text: '31 - 50 سنة' },
    { id: 'age_50_plus', text: '50+ سنة' },
  ];

  // تأثيرات الحركة (نفس اللي كان موجود)
  const buttonVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } },
    minimized: { opacity: 1, y: 0, scale: 0.9, height: "60px", overflow: "hidden" }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const optionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.3 } 
    }),
    hover: { 
      scale: 1.03, 
      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "rgba(25, 180, 25, 0.1)",
    }
  };

  const popupNotificationVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.2 } }
  };

  // إعادة تعيين المحادثة
  const resetChat = () => {
    setMessages([]);
    setCurrentStep('start');
    setPreferences({
      purpose: '',
      recipient: '',
      relationship: '',
      occasion: '',
      budget: '',
      age: '',
    });
    setIsNewSession(true);
    messageCounter.current = 0; // إعادة تعيين العداد
  };

  // إضافة رسالة جديدة مع id فريد
  const addMessage = (content: string | React.ReactNode, sender: 'bot' | 'user', options?: Option[]) => {
    messageCounter.current += 1; // زيادة العداد
    const uniqueId = `${Date.now()}-${messageCounter.current}`; // id فريد باستخدام الوقت والعداد
    
    const newMessage: MessageType = {
      id: uniqueId,
      content,
      sender,
      options,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    if (sender === 'bot' && !isOpen) {
      setUnreadCount(prev => prev + 1);
      setShowPopupNotification(true);
      setTimeout(() => setShowPopupNotification(false), 5000);
    }
  };

  // تحديث تفضيلات المستخدم
  const updatePreference = (key: keyof typeof preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // بقية الكود (handleOptionSelect, handleNextStep, handleSendToWhatsapp, etc.) 
  // يمكنك نسخه من الكود السابق لأنه لم يتغير، فقط التغيير في addMessage وإضافة messageCounter
  const handleOptionSelect = (step: Step, optionValue: string, optionText: string) => {
    addMessage(optionText, 'user');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      
      switch (step) {
        case 'start':
          updatePreference('purpose', optionValue);
          setCurrentStep('recipient');
          if (optionValue === 'personal') {
            addMessage('أحسنت! تستاهل تدلع نفسك شوية. 😉', 'bot');
          }
          handleNextStep('recipient');
          break;
        
        case 'recipient':
          updatePreference('recipient', optionValue);
          setCurrentStep('relationship');
          handleNextStep('relationship');
          break;
        
        case 'relationship':
          updatePreference('relationship', optionValue);
          setCurrentStep('occasion');
          handleNextStep('occasion');
          break;
        
        case 'occasion':
          updatePreference('occasion', optionValue);
          setCurrentStep('budget');
          handleNextStep('budget');
          break;
        
        case 'budget':
          updatePreference('budget', optionValue);
          setCurrentStep('age');
          if (optionValue === '1000+') {
            addMessage('واو، ميزانية حلوة! هنقدر نجيب حاجة فخمة. 😎', 'bot');
          }
          handleNextStep('age');
          break;
        
        case 'age':
          updatePreference('age', optionValue);
          setCurrentStep('summary');
          handleNextStep('summary');
          break;
        
        case 'summary':
          if (optionValue === 'send') {
            handleSendToWhatsapp();
          } else if (optionValue === 'restart') {
            resetChat();
            startNewChat();
          }
          break;
      }
    }, 800);
  };

  const handleNextStep = (step: Step) => {
    switch (step) {
      case 'start':
        addMessage(
          <div>
            <p>أهلاً وسهلاً! 👋</p>
            <p>أنا هنا عشان أساعدك تختار أحلى هدية. عايز إيه النهاردة؟</p>
          </div>,
          'bot',
          giftPurposes.map(purpose => ({
            id: purpose.id,
            text: purpose.text,
            value: purpose.id,
            icon: purpose.icon
          }))
        );
        break;
      
      case 'recipient':
        addMessage(
          'تمام! الهدية دي لمين؟',
          'bot',
          recipients.map(recipient => ({
            id: recipient.id,
            text: recipient.text,
            value: recipient.id,
            icon: recipient.icon
          }))
        );
        break;
      
      case 'relationship':
        addMessage(
          'إيه علاقتك بالشخص اللي هتديله الهدية؟',
          'bot',
          relationships.map(relation => ({
            id: relation.id,
            text: relation.text,
            value: relation.id
          }))
        );
        break;
      
      case 'occasion':
        addMessage(
          'الهدية دي بمناسبة إيه؟',
          'bot',
          occasions.map(occasion => ({
            id: occasion.id,
            text: occasion.text,
            value: occasion.id
          }))
        );
        break;
      
      case 'budget':
        addMessage(
          'ميزانيتك كام تقريبًا للهدية؟',
          'bot',
          budgets.map(budget => ({
            id: budget.id,
            text: budget.text,
            value: budget.range
          }))
        );
        break;
      
      case 'age':
        addMessage(
          'الشخص ده في أنهي فئة عمرية؟',
          'bot',
          ageGroups.map(age => ({
            id: age.id,
            text: age.text,
            value: age.id
          }))
        );
        break;
      
      case 'summary':
        const getTextById = (id: string, array: Array<{ id: string; text: string }>) => {
          const item = array.find(item => item.id === id);
          return item ? item.text : id;
        };

        const purposeText = getTextById(preferences.purpose, giftPurposes);
        const recipientText = getTextById(preferences.recipient, recipients);
        const relationshipText = getTextById(preferences.relationship, relationships);
        const occasionText = getTextById(preferences.occasion, occasions);
        const ageText = getTextById(preferences.age, ageGroups);

        const summaryMessage = (
          <div className="space-y-2">
            <p className="font-medium text-green-600">✓ خلاصة طلبك:</p>
            <ul className="text-sm space-y-1.5">
              <li><span className="font-semibold">الغرض:</span> {purposeText}</li>
              <li><span className="font-semibold">لـ:</span> {recipientText}</li>
              <li><span className="font-semibold">العلاقة:</span> {relationshipText}</li>
              <li><span className="font-semibold">المناسبة:</span> {occasionText}</li>
              <li><span className="font-semibold">الميزانية:</span> {preferences.budget} جنية</li>
              <li><span className="font-semibold">العمر:</span> {ageText}</li>
            </ul>
            <p className="text-sm mt-2">عايز ترسل التفاصيل دي لفريق خدمة العملاء عشان يساعدوك تختار هدية زي الفل؟</p>
          </div>
        );

        addMessage(
          summaryMessage,
          'bot',
          [
            {
              id: 'send',
              text: 'تأكيد وإرسال',
              value: 'send',
              icon: <Send className="w-4 h-4" />
            },
            {
              id: 'restart',
              text: 'إعادة المحادثة',
              value: 'restart',
              icon: <MessageCircle className="w-4 h-4" />
            }
          ]
        );
        break;
    }
  };

  const handleSendToWhatsapp = () => {
    const getTextById = (id: string, array: Array<{ id: string; text: string }>) => {
      const item = array.find(item => item.id === id);
      return item ? item.text : id;
    };

    const purposeText = getTextById(preferences.purpose, giftPurposes);
    const recipientText = getTextById(preferences.recipient, recipients);
    const relationshipText = getTextById(preferences.relationship, relationships);
    const occasionText = getTextById(preferences.occasion, occasions);
    const ageText = getTextById(preferences.age, ageGroups);

    const messageText = `السلام عليكم،
محتاج مساعدة في اختيار هدية:

🎁 الغرض: ${purposeText}
👤 لـ: ${recipientText}
👥 العلاقة: ${relationshipText}
🎉 المناسبة: ${occasionText}
💰 الميزانية: ${preferences.budget} جنية
⏳ العمر: ${ageText}

ممكن تساعدوني أختار هدية مناسبة؟ شكرًا!`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    addMessage(
      <div>
        <p className="text-green-600 font-medium">تم إعداد رسالتك بنجاح! ✅</p>
        <p className="text-sm mt-1">هنوجهك دلوقتي للواتساب عشان تكلم فريق خدمة العملاء.</p>
      </div>,
      'bot'
    );

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      
      setTimeout(() => {
        addMessage(
          <div>
            <p>عايز تبدأ من الأول عشان تختار هدية تانية؟</p>
          </div>,
          'bot',
          [
            {
              id: 'restart',
              text: 'أيوة، ابدأ من جديد',
              value: 'restart',
              icon: <MessageCircle className="w-4 h-4" />
            }
          ]
        );
      }, 1500);
    }, 1000);
  };

  const startNewChat = () => {
    handleNextStep('start');
    setIsNewSession(false);
  };

  useEffect(() => {
    if (isOpen && isNewSession) {
      startNewChat();
    }
    if (isOpen) {
      setUnreadCount(0);
      setShowPopupNotification(false);
    }
  }, [isOpen, isNewSession]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" dir="rtl">
      <motion.button
        variants={buttonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="relative bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        aria-label="فتح محادثة المساعدة"
      >
        <MessageCircle className="w-6 h-6" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showPopupNotification && !isOpen && (
          <motion.div
            variants={popupNotificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-20 right-0 bg-white rounded-lg shadow-lg p-3 w-64"
          >
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-800">رسالة جديدة من {storeName}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  جاهزين نساعدك تختار أحلى هدية!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate={isMinimized ? "minimized" : "visible"}
            exit="exit"
            className="absolute bottom-20 right-0 bg-white rounded-xl shadow-xl w-80 md:w-96 overflow-hidden"
            style={{ maxHeight: "80vh" }}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-3">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">مساعد اختيار الهدايا</h3>
                  <p className="text-xs text-green-100">هنساعدك تجيب أجمد هدية!</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white focus:outline-none transition-colors p-1"
                  aria-label={isMinimized ? "توسيع" : "تصغير"}
                >
                  <span className="block w-4 h-0.5 bg-white"></span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white focus:outline-none transition-colors p-1"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="max-h-96 overflow-y-auto p-4 bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      className={`mb-4 ${message.sender === 'bot' ? '' : 'flex justify-end'}`}
                    >
                      {message.sender === 'bot' ? (
                        <div className="flex items-start max-w-[85%]">
                          <div className="bg-green-100 p-1.5 rounded-full mr-2 mt-1">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-800">{message.content}</div>
                            {message.options && (
                              <div className="mt-3 space-y-2">
                                {message.options.map((option, i) => (
                                  <motion.button
                                    key={option.id}
                                    id={`option-${option.id}`}
                                    variants={optionVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={i}
                                    whileHover="hover"
                                    onClick={() => handleOptionSelect(currentStep, option.value, option.text)}
                                    className="flex items-center justify-between w-full bg-gray-50 hover:bg-green-50 text-gray-700 text-sm py-2 px-3 rounded-md shadow-sm transition-colors duration-200"
                                  >
                                    <span className="flex items-center">
                                      {option.icon && <span className="ml-2">{option.icon}</span>}
                                      {option.text}
                                    </span>
                                  </motion.button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-500 text-white p-3 rounded-lg shadow-sm max-w-[85%]">
                          <div className="text-sm">{message.content}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <div className="mb-4">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-1.5 rounded-full mr-2 mt-1">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-800">بكتبلك حالا...</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsappHelper;