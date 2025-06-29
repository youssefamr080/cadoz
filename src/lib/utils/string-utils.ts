/**
 * String utility functions for text processing, search, and matching
 */
import MiniSearch from 'minisearch';

// Define types for MiniSearch to avoid TypeScript errors
interface MiniSearchResult<T> {
  item: T;
  id: string | number;
  score: number;
  match?: Record<string, string[]>;
  terms?: string[];
}

interface MiniSearchOptions {
  fields?: string[];
  storeFields?: string[];
  tokenize?: (text: string) => string[];
  processTerm?: (term: string) => string;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 * @param a First string
 * @param b Second string
 * @returns The Levenshtein distance between the two strings
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Enhanced Levenshtein distance calculation optimized for Arabic text
 * This is an improved version that better handles Arabic character substitutions
 * @param a First string
 * @param b Second string
 * @returns The Levenshtein distance between the strings
 */
export const enhancedLevenshteinForArabic = (a: string, b: string): number => {
  // Normalize both strings for fair comparison
  const s1 = normalizeArabicText(a);
  const s2 = normalizeArabicText(b);
  
  // Character substitution costs (lower cost for similar characters)
  const getSubstitutionCost = (char1: string, char2: string): number => {
    // Define groups of similar characters in Arabic
    const similarGroups = [
      ['ا', 'أ', 'إ', 'آ', 'ء'],  // Alef forms and hamza
      ['ي', 'ى', 'ئ'],           // Yaa forms
      ['و', 'ؤ'],                // Waw forms
      ['ه', 'ة'],                // Haa and taa marbuta
      ['ت', 'ث', 'ط'],           // Taa, thaa, and taa (emphatic)
      ['د', 'ذ', 'ض'],           // Dal, thal, and dad
      ['س', 'ص'],               // Seen and sad
      ['ز', 'ظ', 'ذ']            // Zay, zaa, and thal
    ];
    
    // Check if characters are in the same similarity group
    for (const group of similarGroups) {
      if (group.includes(char1) && group.includes(char2)) {
        return 0.5; // Lower cost for similar characters
      }
    }
    
    return 1; // Default cost for different characters
  };
  
  // Create distance matrix
  const matrix: number[][] = [];
  
  // Initialize the matrix
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i-1] === s2[j-1]) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        const substitutionCost = getSubstitutionCost(s1[i-1], s2[j-1]);
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1, // deletion
          matrix[i][j-1] + 1, // insertion
          matrix[i-1][j-1] + substitutionCost // substitution
        );
      }
    }
  }
  
  return matrix[s1.length][s2.length];
};

/**
 * Check if two Arabic strings are similar, accounting for common variations and errors
 * @param str1 First string
 * @param str2 Second string
 * @returns True if the strings are similar enough
 */
export const areArabicStringsSimilar = (str1: string, str2: string): boolean => {
  // Normalize both strings
  const s1 = normalizeArabicText(str1);
  const s2 = normalizeArabicText(str2);
  
  // For very short strings, be more strict
  if (s1.length < 3 || s2.length < 3) {
    return s1 === s2;
  }
  
  // Calculate enhanced Levenshtein distance
  const distance = enhancedLevenshteinForArabic(s1, s2);
  
  // Adaptive threshold based on string length
  const threshold = Math.max(2, Math.floor(Math.max(s1.length, s2.length) / 3));
  
  return distance <= threshold;
};

/**
 * Create a MiniSearch instance for powerful fuzzy searching
 * @param items Array of items to search
 * @param fields Object fields to search in
 * @param options Additional MiniSearch options
 * @returns Configured MiniSearch instance
 */
export const createMiniSearchInstance = <T extends Record<string, unknown>>(
  items: T[], 
  fields: string[], 
  options?: Partial<MiniSearchOptions>
) => {
  const miniSearchOptions = {
    fields,
    storeFields: Object.keys(items[0] || {}),
    tokenize: (text: string) => {
      return normalizeArabicText(text).split(/\s+/).filter(word => word.length > 1);
    },
    processTerm: (term: string) => normalizeArabicText(term),
    ...options
  };
  
  const miniSearch = new MiniSearch(miniSearchOptions);
  
  // إضافة المستندات مع ID فريد
  const documentsWithId = items.map((item, index) => ({
    id: index,
    ...item
  }));
  
  miniSearch.addAll(documentsWithId);
  return miniSearch;
};

/**
 * Normalize Arabic text by removing diacritics and normalizing letter forms
 * @param text Input text
 * @returns Normalized text
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return '';
  
  // Convert to string if not already
  const str = String(text);
  
  // Remove diacritics (tashkeel)
  const withoutDiacritics = str.normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '') // Arabic diacritics
    .replace(/[\u0300-\u036f]/g, '');       // Latin diacritics
  
  // Normalize Arabic letters for better matching
  // This handles different forms of letters and common substitutions in colloquial Arabic
  return withoutDiacritics
    // Normalize alef forms
    .replace(/[أإآا]/g, 'ا')
    // Normalize yaa forms
    .replace(/[ىيئ]/g, 'ي')
    // Normalize waw forms
    .replace(/[ؤو]/g, 'و')
    // Normalize taa marbuta and haa
    .replace(/[ةه]/g, 'ه')
    // Normalize hamza forms
    .replace(/[ءئؤ]/g, 'ء')
    // Normalize taa and thaa (common mistake in Egyptian dialect)
    .replace(/ث/g, 'ت')
    // Normalize dhaal and zaal (common mistake)
    .replace(/ذ/g, 'ز')
    // Normalize saad and seen (common mistake)
    .replace(/ص/g, 'س')
    // Normalize daad and daal (common mistake)
    .replace(/ض/g, 'د')
    // Normalize taa and taa marbuta (common mistake)
    .replace(/ط/g, 'ت')
    // Normalize dhaa and zaa (common mistake)
    .replace(/ظ/g, 'ز')
    // Convert to lowercase for case-insensitive matching
    .toLowerCase();
};

/**
 * Remove diacritics (tashkeel) from Arabic text
 * @param str Input string
 * @returns String without diacritics
 */
export const removeDiacritics = (str: string): string => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, "");
};

/**
 * Calculate similarity score between two strings (0-1)
 * Higher score means more similar
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score between 0 and 1
 */
export const stringSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  // Normalize both strings (lowercase, remove diacritics)
  const s1 = normalizeArabicText(str1);
  const s2 = normalizeArabicText(str2);
  
  // Exact match gets highest score
  if (s1 === s2) return 1;
  
  // Check if one string contains the other
  if (s1.includes(s2)) return 0.9;
  if (s2.includes(s1)) return 0.8;
  
  // Check for common Egyptian dialect variations
  // For example, "نضارة" (nadara) and "نظارة" (nazara) are the same word
  if (areArabicStringsSimilar(s1, s2)) return 0.85;
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0; // Both strings are empty
  
  // Calculate normalized Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  return 1 - (distance / maxLen);
};

/**
 * Generate alternative spellings for Arabic words based on common mistakes
 * @param word The original word
 * @returns Array of alternative spellings
 */
export const generateArabicAlternatives = (word: string): string[] => {
  if (!word || word.length < 2) return [word];
  
  const normalized = normalizeArabicText(word);
  const alternatives: string[] = [word, normalized];
  
  // Specific word mappings for common products (dictionary approach)
  const specificMappings: Record<string, string[]> = {
    'نضارة': ['نظارة', 'نظاره', 'نضاره'],
    'نظارة': ['نضارة', 'نظاره', 'نضاره'],
    'شنطة': ['شنطه', 'حقيبة', 'حقيبه'],
    'حقيبة': ['حقيبه', 'شنطة', 'شنطه'],
    'موبايل': ['موبيل', 'جوال', 'تليفون', 'هاتف', 'فون'],
    'جوال': ['موبايل', 'موبيل', 'تليفون', 'هاتف', 'فون'],
    'ساعة': ['ساعه', 'ووتش'],
    'عطر': ['برفان', 'بارفان', 'بيرفيوم'],
    'نظارات': ['نضارات'],
    'نضارات': ['نظارات']
  };
  
  // Check for specific word mappings first
  for (const [key, values] of Object.entries(specificMappings)) {
    if (normalized === key || normalized === normalizeArabicText(key)) {
      alternatives.push(...values);
      // For exact matches, return immediately to prioritize dictionary approach
      return [...new Set(alternatives)];
    }
  }
  
  // Common letter substitutions in Egyptian dialect - only for words not in the dictionary
  const substitutions: Record<string, string[]> = {
    'ظ': ['ز'],       // ظ -> ز
    'ض': ['د'],       // ض -> د
    'ص': ['س'],       // ص -> س
    'ث': ['ت', 'س'],  // ث -> ت or س
    'ذ': ['د', 'ز'],  // ذ -> د or ز
    'ة': ['ه'],       // ة -> ه
    'ى': ['ي'],       // ى -> ي
  };
  
  // Generate alternatives by substituting letters - limit to only one substitution per word
  // to avoid too many irrelevant variations
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const possibleSubstitutions = substitutions[char];
    
    if (possibleSubstitutions) {
      for (const sub of possibleSubstitutions) {
        const alternative = normalized.substring(0, i) + sub + normalized.substring(i + 1);
        alternatives.push(alternative);
      }
    }
  }
  
  // Add/remove common endings
  if (normalized.endsWith('ة')) { // ة
    alternatives.push(normalized.substring(0, normalized.length - 1) + 'ه'); // ه
  } else if (normalized.endsWith('ه')) { // ه
    alternatives.push(normalized.substring(0, normalized.length - 1) + 'ة'); // ة
  }
  
  // Return unique alternatives
  return [...new Set(alternatives)];
};

/**
 * Perform a fuzzy search on a collection using MiniSearch
 * @param collection Collection to search in
 * @param query Search query
 * @param fields Object fields to search in
 * @param options Additional search options
 * @returns Search results with scores
 */
export const performFuzzySearch = <T extends Record<string, unknown>>(
  collection: T[],
  query: string,
  fields: string[],
  options?: unknown
): MiniSearchResult<T>[] => {
  if (!query || query.length < 2 || !collection.length) return [];
  
  // Normalize query for better Arabic text matching
  const normalizedQuery = normalizeArabicText(query);
  
  // Create MiniSearch instance
  const miniSearch = createMiniSearchInstance(collection, fields, options);
  
  // Try with the original query first with precise settings
  const results = miniSearch.search(query, {
    fuzzy: 0.2,
    prefix: true,
    combineWith: 'OR'
  });
  
  // If we have good results, return them
  if (results.length > 0 && results[0].score > 0.5) {
    return results.map(result => ({
      item: result as unknown as T,
      id: result.id,
      score: result.score,
      match: result.match,
      terms: result.terms
    }));
  }
  
  // Try with normalized query with more relaxed settings
  const normalizedResults = miniSearch.search(normalizedQuery, {
    fuzzy: 0.3,
    prefix: true,
    combineWith: 'OR'
  });
  
  if (normalizedResults.length > 0) {
    return normalizedResults.map(result => ({
      item: result as unknown as T,
      id: result.id,
      score: result.score,
      match: result.match,
      terms: result.terms
    }));
  }
  
  // Try with alternative spellings for Arabic text
  if (query.length >= 3) {
    const alternatives = generateArabicAlternatives(query);
    
    for (const alt of alternatives) {
      if (alt !== query && alt !== normalizedQuery) {
        const altResults = miniSearch.search(alt, {
          fuzzy: 0.4,
          prefix: true,
          combineWith: 'OR'
        });
        
        if (altResults.length > 0) {
          return altResults.map(result => ({
            item: result as unknown as T,
            id: result.id,
            score: result.score * 0.8, // تقليل النقاط للبدائل الإملائية
            match: result.match,
            terms: result.terms
          }));
        }
      }
    }
  }
  
  return [];
};

/**
 * Highlight matching parts of a string based on search term
 * @param text The text to highlight
 * @param searchTerm The search term that was matched
 * @returns Array of segments with isMatch flag
 */
export const highlightSearchMatches = (
  text: string, 
  searchTerm?: string
): Array<{text: string, isMatch: boolean}> => {
  if (!text || !searchTerm) {
    return [{text, isMatch: false}];
  }
  
  // Find all occurrences of the search term
  const searchTermLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();
  const indices: Array<[number, number]> = [];
  
  let startIndex = 0;
  while (true) {
    const index = textLower.indexOf(searchTermLower, startIndex);
    if (index === -1) break;
    indices.push([index, index + searchTerm.length - 1]);
    startIndex = index + 1;
  }
  
  // If no matches found, return the original text
  if (indices.length === 0) {
    return [{ text, isMatch: false }];
  }
  
  // If no valid indices found, return the original text
  if (indices.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Create segments based on matches
  const result: Array<{text: string, isMatch: boolean}> = [];
  let lastEnd = 0;
  
  indices.forEach(([start, end]) => {
    if (start > lastEnd) {
      // Add non-matching segment
      result.push({
        text: text.substring(lastEnd, start),
        isMatch: false
      });
    }
    
    // Add matching segment
    result.push({
      text: text.substring(start, end + 1),
      isMatch: true
    });
    
    lastEnd = end + 1;
  });
  
  // Add final non-matching segment if needed
  if (lastEnd < text.length) {
    result.push({
      text: text.substring(lastEnd),
      isMatch: false
    });
  }
  
  return result.length ? result : [{text, isMatch: false}];
};

/**
 * Highlight matching parts of a string based on search terms
 * @param text The text to highlight
 * @param searchTerms Array of search terms
 * @returns Array of segments with isMatch flag
 */
export const highlightMatches = (text: string, searchTerms: string[]): Array<{text: string, isMatch: boolean}> => {
  if (!text || !searchTerms.length) {
    return [{text, isMatch: false}];
  }

  // Normalize text and search terms
  const normalizedText = normalizeArabicText(text);
  const normalizedTerms = searchTerms.map(term => normalizeArabicText(term));
  
  // Find all matches with their positions
  const matches: Array<{start: number, end: number, term: string}> = [];
  
  normalizedTerms.forEach(term => {
    if (term.length < 2) return; // Skip very short terms
    
    let pos = 0;
    while ((pos = normalizedText.indexOf(term, pos)) !== -1) {
      matches.push({
        start: pos,
        end: pos + term.length,
        term
      });
      pos += 1; // Move past this match
    }
  });
  
  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);
  
  // Merge overlapping matches
  const mergedMatches: Array<{start: number, end: number}> = [];
  
  matches.forEach(match => {
    const lastMatch = mergedMatches[mergedMatches.length - 1];
    
    if (lastMatch && match.start <= lastMatch.end) {
      // Overlapping match, extend the previous one
      lastMatch.end = Math.max(lastMatch.end, match.end);
    } else {
      // New non-overlapping match
      mergedMatches.push({
        start: match.start,
        end: match.end
      });
    }
  });
  
  // Create segments based on matches
  const result: Array<{text: string, isMatch: boolean}> = [];
  let lastEnd = 0;
  
  mergedMatches.forEach(match => {
    if (match.start > lastEnd) {
      // Add non-matching segment
      result.push({
        text: text.substring(lastEnd, match.start),
        isMatch: false
      });
    }
    
    // Add matching segment
    result.push({
      text: text.substring(match.start, match.end),
      isMatch: true
    });
    
    lastEnd = match.end;
  });
  
  // Add final non-matching segment if needed
  if (lastEnd < text.length) {
    result.push({
      text: text.substring(lastEnd),
      isMatch: false
    });
  }
  
  return result.length ? result : [{text, isMatch: false}];
};

/**
 * Find the best correction for a misspelled word using MiniSearch
 * @param word Potentially misspelled word
 * @param dictionary Array of correct words
 * @param threshold Similarity threshold (0-1)
 * @returns The best correction or null if no good match
 */
export const findBestCorrection = (
  word: string, 
  dictionary: string[], 
  threshold = 0.3
): string | null => {
  if (!word || !dictionary.length) return null;
  
  const normalizedWord = normalizeArabicText(word);
  
  // Exact match in dictionary
  const exactMatch = dictionary.find(
    dictWord => normalizeArabicText(dictWord) === normalizedWord
  );
  if (exactMatch) return exactMatch;
  
  // Use MiniSearch for fuzzy matching
  const miniSearch = createMiniSearchInstance(
    dictionary.map(word => ({ word })), 
    ['word']
  );
  const results = miniSearch.search(normalizedWord, {
    fuzzy: 0.3,
    prefix: true
  });
  
  // Return best match if score is good enough
  if (results.length > 0 && results[0].score > (1 - threshold)) {
    return results[0].word;
  }
  
  return null;
};

/**
 * Get autocomplete suggestions for a partial query
 * @param input Partial input text
 * @param dictionary Array of possible completions
 * @param limit Maximum number of suggestions to return
 * @returns Array of suggestions sorted by relevance
 */
export const getAutocompleteSuggestions = (
  input: string,
  dictionary: string[],
  limit = 5
): string[] => {
  if (!input || input.length < 2 || !dictionary.length) return [];
  
  const normalizedInput = normalizeArabicText(input);
  
  // Create MiniSearch instance optimized for autocomplete
  const miniSearch = createMiniSearchInstance(
    dictionary.map(word => ({ word })),
    ['word']
  );
  
  // Search and extract results
  const results = miniSearch.search(normalizedInput, {
    fuzzy: 0.2,
    prefix: true,
    combineWith: 'OR'
  })
    .slice(0, limit)
    .map(result => result.word);
    
  return results;
};
