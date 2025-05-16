/**
 * مكتبة متخصصة لمعالجة النصوص العربية
 * وتحسين عمليات البحث ومطابقة النصوص
 */

// مجموعة من الحروف المتشابهة في العربية للمساعدة في تصحيح الأخطاء الإملائية
const similarArabicCharacters = {
  'ا': ['أ', 'إ', 'آ', 'ء', 'ى', 'ؤ', 'ئ'],
  'أ': ['ا', 'إ', 'آ', 'ء'],
  'إ': ['ا', 'أ', 'آ', 'ء'],
  'آ': ['ا', 'أ', 'إ', 'ء'],
  'ء': ['ا', 'أ', 'إ', 'آ'],
  'ى': ['ا', 'ي'],
  'ي': ['ى', 'ئ'],
  'ئ': ['ي', 'ء'],
  'و': ['ؤ'],
  'ؤ': ['و', 'ء'],
  'ة': ['ه', 'ت'],
  'ه': ['ة'],
  'ت': ['ة', 'ط'],
  'ط': ['ت', 'ظ'],
  'د': ['ض', 'ذ'],
  'ض': ['د'],
  'ذ': ['د', 'ز', 'ظ'],
  'ظ': ['ط', 'ذ', 'ز'],
  'س': ['ص'],
  'ص': ['س'],
  'ز': ['ذ', 'ظ'],
};

// أزواج من الكلمات المتشابهة التي تستخدم بالتبادل
const commonWordPairs = [
  ['هدية', 'هدايا'],
  ['مجوهرات', 'ذهب'],
  ['ذهب', 'دهب'],
  ['فضة', 'فضه'],
  ['عطور', 'عطر', 'بارفان', 'برفان'],
  ['ملابس', 'لبس', 'ثياب'],
  ['اكسسوار', 'اكسسوارات', 'إكسسوار', 'إكسسوارات'],
  ['مكياج', 'ميكب', 'ميكاب'],
  ['شنطة', 'حقيبة', 'شنط', 'حقائب'],
  ['ساعة', 'ساعات', 'واتش', 'ووتش'],
  ['خاتم', 'خواتم', 'دبلة', 'دبل'],
  ['هدية زواج', 'هدايا زواج'],
  ['هدية خطوبة', 'هدايا خطوبة'],
  ['هدية عيد ميلاد', 'هدايا عيد ميلاد', 'هدية ميلاد', 'هدايا ميلاد'],
  ['رجالي', 'رجالية', 'للرجال'],
  ['نسائي', 'نسائية', 'للنساء'],
  ['أطفال', 'طفل', 'للأطفال'],
  ['ألعاب', 'لعبة', 'لعب'],
  ['هديه', 'هدية'],
  ['تخرج', 'جراديوشن', 'قراديوشن'],
];

/**
 * إزالة التشكيل (الحركات) من النص العربي
 * @param text النص المراد معالجته
 * @returns النص بدون تشكيل
 */
export const removeDiacritics = (text: string): string => {
  if (!text) return '';
  
  // حذف جميع علامات التشكيل والمدود
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
};

/**
 * توحيد أشكال الألف المختلفة
 * @param text النص المراد معالجته
 * @returns النص بعد توحيد الألفات
 */
export const normalizeAlef = (text: string): string => {
  if (!text) return '';
  
  // تحويل أ إ آ إلى ا
  return text.replace(/[أإآ]/g, 'ا');
};

/**
 * توحيد أشكال الياء والتاء المربوطة
 * @param text النص المراد معالجته
 * @returns النص بعد التوحيد
 */
export const normalizeLetterForms = (text: string): string => {
  if (!text) return '';
  
  // تحويل ى إلى ي وة إلى ه
  return text.replace(/ى/g, 'ي').replace(/ة/g, 'ه');
};

/**
 * تطبيع النص العربي بإزالة التشكيل وتوحيد أشكال الحروف
 * @param text النص المراد تطبيعه
 * @returns النص بعد التطبيع
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return '';
  
  // تحويل إلى أحرف صغيرة للحروف اللاتينية المحتملة
  let normalized = text.toLowerCase();
  
  // إزالة التشكيل
  normalized = removeDiacritics(normalized);
  
  // توحيد أشكال الألف
  normalized = normalizeAlef(normalized);
  
  // توحيد الياء والتاء المربوطة
  normalized = normalizeLetterForms(normalized);
  
  // إزالة المسافات الزائدة
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * توليد كلمات بديلة للكلمة العربية بناءً على الأخطاء الشائعة
 * @param word الكلمة المراد توليد بدائل لها
 * @returns مصفوفة تحتوي على الكلمة الأصلية والبدائل المحتملة
 */
export const generateAlternativeSpellings = (word: string): string[] => {
  if (!word || word.length < 2) return [word];
  
  const normalizedWord = normalizeArabicText(word);
  const alternatives = new Set<string>([normalizedWord]);
  
  // توليد بدائل باستبدال الحروف المتشابهة
  for (let i = 0; i < normalizedWord.length; i++) {
    const char = normalizedWord[i];
    const similarChars = similarArabicCharacters[char];
    
    if (similarChars) {
      for (const similarChar of similarChars) {
        const alternative = normalizedWord.substring(0, i) + similarChar + normalizedWord.substring(i + 1);
        alternatives.add(alternative);
      }
    }
  }
  
  // إضافة بدائل من قائمة الكلمات المتشابهة
  for (const wordGroup of commonWordPairs) {
    if (wordGroup.includes(normalizedWord)) {
      wordGroup.forEach(w => alternatives.add(normalizeArabicText(w)));
    }
  }
  
  return Array.from(alternatives);
};

/**
 * توليد اقتراحات لإكمال كلمة جزئية
 * @param partial الكلمة الجزئية
 * @param dictionary قاموس الكلمات المحتملة
 * @param maxSuggestions العدد الأقصى للاقتراحات
 * @returns مصفوفة من الاقتراحات المرتبة حسب الأهمية
 */
export const getSuggestions = (
  partial: string,
  dictionary: string[],
  maxSuggestions = 5
): string[] => {
  if (!partial || partial.length < 2 || !dictionary.length) {
    return [];
  }
  
  const normalizedPartial = normalizeArabicText(partial);
  
  // ترتيب الكلمات في القاموس حسب درجة التطابق
  const matches = dictionary
    .filter(word => {
      const normalizedWord = normalizeArabicText(word);
      return normalizedWord.includes(normalizedPartial) || 
             normalizedPartial.includes(normalizedWord);
    })
    .map(word => {
      const normalizedWord = normalizeArabicText(word);
      let score = 0;
      
      // زيادة الأهمية إذا كانت الكلمة تبدأ بالجزء الجزئي
      if (normalizedWord.startsWith(normalizedPartial)) {
        score += 2;
      }
      
      // زيادة الأهمية إذا كانت الكلمة قريبة من حيث الطول
      const lengthDiff = Math.abs(normalizedWord.length - normalizedPartial.length);
      score += 1 / (lengthDiff + 1);
      
      return { word, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(match => match.word);
  
  return matches;
};

/**
 * حساب مدى التشابه بين نصين عربيين بنسبة مئوية
 * @param str1 النص الأول
 * @param str2 النص الثاني 
 * @returns درجة التشابه من 0 إلى 1
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const s1 = normalizeArabicText(str1);
  const s2 = normalizeArabicText(str2);
  
  // إذا كان أحد النصين يحتوي على الآخر
  if (s1.includes(s2) || s2.includes(s1)) {
    const lengthRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
    return 0.7 + (lengthRatio * 0.3); // إعطاء درجة عالية مع مراعاة الفرق في الطول
  }
  
  // حساب مسافة التحرير (عدد التغييرات اللازمة لتحويل نص إلى آخر)
  const matrix: number[][] = [];
  
  // تهيئة المصفوفة
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  // حساب مسافة التحرير
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i-1] === s2[j-1]) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        // تكلفة أقل للحروف المتشابهة
        const substitutionCost = isCharSimilar(s1[i-1], s2[j-1]) ? 0.5 : 1;
        
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1, // حذف
          matrix[i][j-1] + 1, // إضافة
          matrix[i-1][j-1] + substitutionCost // استبدال
        );
      }
    }
  }
  
  // حساب نسبة التشابه (1 - مسافة_التحرير/الطول_الأقصى)
  const editDistance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);
  
  return 1 - (editDistance / maxLength);
};

/**
 * التحقق ما إذا كان حرفان متشابهين في العربية
 * @param char1 الحرف الأول
 * @param char2 الحرف الثاني
 * @returns حقيقي إذا كان الحرفان متشابهين
 */
const isCharSimilar = (char1: string, char2: string): boolean => {
  if (char1 === char2) return true;
  
  for (const [base, alternatives] of Object.entries(similarArabicCharacters)) {
    if ((char1 === base || alternatives.includes(char1)) && 
        (char2 === base || alternatives.includes(char2))) {
      return true;
    }
  }
  
  return false;
};

/**
 * تسليط الضوء على أجزاء النص المطابقة للكلمة المفتاحية
 * @param text النص الكامل
 * @param keyword الكلمة المفتاحية للبحث
 * @returns مصفوفة من الأجزاء مع علامة لكل جزء يشير إلى كونه مطابقاً أم لا
 */
export const highlightMatches = (
  text: string,
  keyword: string
): Array<{text: string, isMatch: boolean}> => {
  if (!text || !keyword) {
    return [{text, isMatch: false}];
  }
  
  const normalizedText = normalizeArabicText(text);
  const normalizedKeyword = normalizeArabicText(keyword);
  
  // إذا لم يكن هناك تطابق
  if (!normalizedText.includes(normalizedKeyword)) {
    return [{text, isMatch: false}];
  }
  
  const result: Array<{text: string, isMatch: boolean}> = [];
  let lastIndex = 0;
  let index = normalizedText.indexOf(normalizedKeyword);
  
  while (index !== -1) {
    // إضافة النص قبل التطابق
    if (index > lastIndex) {
      result.push({
        text: text.substring(lastIndex, index),
        isMatch: false
      });
    }
    
    // إضافة النص المطابق
    result.push({
      text: text.substring(index, index + keyword.length),
      isMatch: true
    });
    
    lastIndex = index + keyword.length;
    index = normalizedText.indexOf(normalizedKeyword, lastIndex);
  }
  
  // إضافة باقي النص
  if (lastIndex < text.length) {
    result.push({
      text: text.substring(lastIndex),
      isMatch: false
    });
  }
  
  return result;
};

/**
 * تصحيح الأخطاء الإملائية في النص العربي
 * @param text النص المراد تصحيحه
 * @param dictionary قاموس الكلمات الصحيحة
 * @returns النص بعد التصحيح
 */
export const correctSpelling = (text: string, dictionary: string[]): string => {
  if (!text || !dictionary.length) return text;
  
  const words = text.split(/\s+/);
  const correctedWords = words.map(word => {
    // تجاهل الكلمات القصيرة جداً
    if (word.length < 2) return word;
    
    const normalizedWord = normalizeArabicText(word);
    
    // إذا كانت الكلمة موجودة في القاموس، لا داعي للتصحيح
    if (dictionary.some(dictWord => normalizeArabicText(dictWord) === normalizedWord)) {
      return word;
    }
    
    // البحث عن أفضل تصحيح
    let bestMatch = null;
    let highestSimilarity = 0;
    
    for (const dictWord of dictionary) {
      const similarity = calculateSimilarity(normalizedWord, dictWord);
      
      if (similarity > highestSimilarity && similarity > 0.7) {
        highestSimilarity = similarity;
        bestMatch = dictWord;
      }
    }
    
    return bestMatch || word;
  });
  
  return correctedWords.join(' ');
};

/**
 * تقسيم النص إلى كلمات مع استخراج الكلمات المفتاحية
 * @param text النص المراد تحليله
 * @returns مصفوفة من الكلمات المفتاحية المميزة
 */
export const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  // قائمة بالكلمات التي يجب تجاهلها (حروف الجر وغيرها)
  const stopWords = [
    'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'تلك', 'ذلك',
    'الى', 'الذي', 'التي', 'و', 'أو', 'ثم', 'لكن', 'كان', 'كانت', 'هو', 'هي',
    'أنا', 'نحن', 'أنت', 'أنتم', 'هم', 'هن', 'كل', 'بعض', 'غير'
  ];
  
  // تقسيم النص إلى كلمات
  const normalized = normalizeArabicText(text);
  const words = normalized.split(/\s+/).filter(word => word.length > 1);
  
  // استبعاد الكلمات الشائعة
  return words.filter(word => !stopWords.includes(word));
};
