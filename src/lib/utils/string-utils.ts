/**
 * String utility functions for text processing, search, and matching
 */
import Fuse from 'fuse.js';

// Define types for Fuse.js to avoid TypeScript errors
interface FuseResultMatch {
  indices: readonly [number, number][];
  key?: string;
  refIndex?: number;
  value?: string;
}

interface FuseResult<T> {
  item: T;
  refIndex?: number;
  score?: number;
  matches?: readonly FuseResultMatch[];
}

interface FuseOptions {
  keys?: string[] | Record<string, { weight: number }>;
  threshold?: number;
  distance?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  shouldSort?: boolean;
  findAllMatches?: boolean;
  useExtendedSearch?: boolean;
  ignoreLocation?: boolean;
  location?: number;
  isCaseSensitive?: boolean;
  [key: string]: unknown;
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
 * Create a Fuse.js instance for powerful fuzzy searching
 * @param items Array of items to search
 * @param keys Object keys to search in
 * @param options Additional Fuse.js options
 * @returns Configured Fuse instance
 */
export const createFuseInstance = <T>(items: T[], keys: Array<string | { name: string; weight: number }>, options?: Partial<FuseOptions>) => {
  const fuseOptions = {
    ...options,
    keys,
    threshold: 0.2,
    distance: 100,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    shouldSort: true,
    findAllMatches: true,
    useExtendedSearch: false,
    ignoreLocation: true,
    isCaseSensitive: false,
    tokenize: true,
    matchAllTokens: true
  };
  return new Fuse(items, fuseOptions);
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
 * Perform a fuzzy search on a collection using Fuse.js
 * @param collection Collection to search in
 * @param query Search query
 * @param keys Object keys to search in
 * @param options Additional Fuse.js options
 * @returns Search results with scores
 */
export const performFuzzySearch = <T>(
  collection: T[],
  query: string,
  keys: string[],
  options?: Partial<FuseOptions>
): FuseResult<T>[] => {
  if (!query || query.length < 2 || !collection.length) return [];
  
  // Normalize query for better Arabic text matching
  const normalizedQuery = normalizeArabicText(query);
  
  // Create a more precise Fuse instance with stricter settings
  const preciseOptions = {
    ...options,
    threshold: 0.2,        // Stricter threshold for exact matching
    matchAllTokens: true,  // Require all tokens to match
    useExtendedSearch: false // Disable extended search for precision
  };
  
  const preciseFuse = createFuseInstance(collection, keys, preciseOptions);
  
  // Try with the original query first with precise settings
  const preciseResults = preciseFuse.search(query);
  
  // If we have precise results, return them
  if (preciseResults.length > 0) {
    return preciseResults;
  }
  
  // Try with normalized query with precise settings
  const preciseNormalizedResults = preciseFuse.search(normalizedQuery);
  
  if (preciseNormalizedResults.length > 0) {
    return preciseNormalizedResults;
  }
  
  // If precise search failed, try with more relaxed settings
  const relaxedOptions = {
    ...options,
    threshold: 0.3,
    matchAllTokens: false
  };
  
  const relaxedFuse = createFuseInstance(collection, keys, relaxedOptions);
  
  // Try with the original and normalized queries
  const relaxedResults = relaxedFuse.search(query);
  const relaxedNormalizedResults = relaxedFuse.search(normalizedQuery);
  
  // If we still don't have good results, try with alternative spellings but with strict relevance checking
  if (relaxedResults.length === 0 && relaxedNormalizedResults.length === 0 && query.length >= 3) {
    // Generate alternative spellings based on common Arabic mistakes
    const alternatives = generateArabicAlternatives(query);
    
    // Search with each alternative using precise settings first
    for (const alt of alternatives) {
      if (alt !== query && alt !== normalizedQuery) {
        const altResults = preciseFuse.search(alt);
        
        if (altResults.length > 0) {
          // Filter results to ensure they're actually relevant
          const relevantResults = altResults.filter(result => {
            // Only include results with good scores
            return result.score && result.score < 0.3;
          });
          
          if (relevantResults.length > 0) {
            return relevantResults;
          }
        }
      }
    }
    
    // If precise alternative search failed, try relaxed but with careful filtering
    for (const alt of alternatives) {
      if (alt !== query && alt !== normalizedQuery) {
        const altResults = relaxedFuse.search(alt);
        
        if (altResults.length > 0) {
          // Apply stricter post-filtering to ensure relevance
          const relevantResults = altResults.filter(result => {
            // Check if the result actually contains the search term or a similar term
            const itemStr = JSON.stringify(result.item).toLowerCase();
            return (
              itemStr.includes(query.toLowerCase()) ||
              itemStr.includes(normalizedQuery.toLowerCase()) ||
              itemStr.includes(alt.toLowerCase()) ||
              (result.score && result.score < 0.25) // Only include very good matches
            );
          });
          
          if (relevantResults.length > 0) {
            return relevantResults;
          }
        }
      }
    }
  }
  
  // Combine and filter results from relaxed search
  const combinedResults = [...relaxedResults, ...relaxedNormalizedResults];
  
  // Remove duplicates and sort by score
  const uniqueResults = combinedResults.filter((result, index, self) => {
    return index === self.findIndex(r => JSON.stringify(r.item) === JSON.stringify(result.item));
  }).sort((a, b) => (a.score || 1) - (b.score || 1));
  
  // Apply post-filtering to ensure relevance
  const relevantResults = uniqueResults.filter(result => {
    // Only include results with good scores or that actually contain the search term
    const itemStr = JSON.stringify(result.item).toLowerCase();
    return (
      itemStr.includes(query.toLowerCase()) ||
      itemStr.includes(normalizedQuery.toLowerCase()) ||
      (result.score && result.score < 0.3)
    );
  });
  
  return relevantResults;
};

/**
 * Highlight matching parts of a string based on Fuse.js matches
 * @param text The text to highlight
 * @param matches Fuse.js match information
 * @returns Array of segments with isMatch flag
 */
export const highlightFuseMatches = (
  text: string, 
  matches?: readonly FuseResultMatch[]
): Array<{text: string, isMatch: boolean}> => {
  if (!text || !matches || matches.length === 0) {
    return [{text, isMatch: false}];
  }
  
  // Get all indices that need highlighting
  const indices: Array<[number, number]> = [];
  
  matches.forEach(match => {
    if (match && match.indices && match.indices.length) {
      indices.push(...match.indices);
    }
  });
  
  // If no valid indices found, return the original text
  if (indices.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Extract all matching indices
  const allIndices: Array<[number, number]> = [];
  
  matches.forEach(match => {
    if (match.indices && match.indices.length > 0) {
      allIndices.push(...match.indices);
    }
  });
  
  // Sort indices by start position
  allIndices.sort((a, b) => a[0] - b[0]);
  
  // Merge overlapping indices
  const mergedIndices: Array<[number, number]> = [];
  
  allIndices.forEach(([start, end]) => {
    const lastMatch = mergedIndices[mergedIndices.length - 1];
    
    if (lastMatch && start <= lastMatch[1] + 1) {
      // Overlapping match, extend the previous one
      lastMatch[1] = Math.max(lastMatch[1], end);
    } else {
      // New non-overlapping match
      mergedIndices.push([start, end]);
    }
  });
  
  // Create segments based on matches
  const result: Array<{text: string, isMatch: boolean}> = [];
  let lastEnd = 0;
  
  mergedIndices.forEach(([start, end]) => {
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
 * Find the best correction for a misspelled word using Fuse.js
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
  
  // Use Fuse.js for fuzzy matching
  const fuse = createFuseInstance(dictionary.map(word => ({ word })), ['word']);
  const results = fuse.search(normalizedWord);
  
  // Return best match if score is good enough (lower is better in Fuse.js)
  if (results.length > 0 && results[0].score && results[0].score < threshold) {
    return results[0].item.word;
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
  
  // Create Fuse instance optimized for autocomplete
  const fuse = createFuseInstance(
    dictionary.map(word => ({ word })),
    ['word'],
    {
      threshold: 0.2,           // Stricter matching for autocomplete
      distance: 100,
      minMatchCharLength: 1
    }
  );
  
  // Search and extract results
  const results = fuse.search(normalizedInput)
    .slice(0, limit)
    .map(result => result.item.word);
    
  return results;
};
