import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Box, GiftProduct, Bag, Sweet, PersonalMessage } from "../../../types/database"
import { getAllBoxes, getBoxesByCategory } from "@/lib/actions/box-actions"
import { getAllProducts, getProductsByCategory, searchProducts, filterProducts } from "@/lib/actions/product-actions"
import { getAllBags, getAvailableBags } from "@/lib/actions/bag-actions"
import { getAllSweets, getAvailableSweets } from "@/lib/actions/sweet-actions"

// تعريف الحالة الأولية للنظام
interface GiftState {
  // البيانات المختارة من قبل المستخدم
  selectedBox: Box | null
  selectedProducts: GiftProduct[]
  selectedSweets: Sweet[]
  selectedBag: Bag | null
  personalMessage: PersonalMessage | null

  // البيانات المحملة من قاعدة البيانات
  boxes: {
    data: Box[]
    byCategory: Record<string, Box[]>
    available: Box[]
    selectedCategory: string
    isLoading: boolean
    error: string | null
  }
  
  products: {
    data: GiftProduct[]
    byCategory: Record<string, GiftProduct[]>
    search: {
      results: GiftProduct[]
      query: string
      isLoading: boolean
    }
    filters: {
      category: string[]
      priceRange: [number, number]
      inStock: boolean
    }
    pagination: {
      currentPage: number
      totalPages: number
      itemsPerPage: number
    }
    isLoading: boolean
    error: string | null
  }

  bags: {
    data: Bag[]
    available: Bag[]
    isLoading: boolean
    error: string | null
  }

  sweets: {
    data: Sweet[]
    available: Sweet[]
    isLoading: boolean
    error: string | null
  }

  // حالة الواجهة
  ui: {
    currentStep: number
    showPreview: boolean
    isProcessing: boolean
  }
}

// الحالة الأولية
const initialState: GiftState = {
  selectedBox: null,
  selectedProducts: [],
  selectedSweets: [],
  selectedBag: null,
  personalMessage: null,

  boxes: {
    data: [],
    byCategory: {},
    available: [],
    selectedCategory: "all",
    isLoading: false,
    error: null,
  },

  products: {
    data: [],
    byCategory: {},
    search: {
      results: [],
      query: "",
      isLoading: false,
    },
    filters: {
      category: [],
      priceRange: [0, 1000],
      inStock: true,
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 12,
    },
    isLoading: false,
    error: null,
  },

  bags: {
    data: [],
    available: [],
    isLoading: false,
    error: null,
  },

  sweets: {
    data: [],
    available: [],
    isLoading: false,
    error: null,
  },

  ui: {
    currentStep: 1,
    showPreview: false,
    isProcessing: false,
  },
}

// Async Thunks للتعامل مع قاعدة البيانات

// جلب جميع الصناديق
export const fetchBoxes = createAsyncThunk("gift/fetchBoxes", async (_, { rejectWithValue }) => {
  try {
    return await getAllBoxes()
  } catch {
    return rejectWithValue("فشل في جلب الصناديق")
  }
})

// جلب الصناديق حسب الفئة
export const fetchBoxesByCategory = createAsyncThunk(
  "gift/fetchBoxesByCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      return await getBoxesByCategory()
    } catch {
      return rejectWithValue("فشل في جلب الصناديق حسب الفئة")
    }
  }
)

// جلب جميع المنتجات
export const fetchProducts = createAsyncThunk("gift/fetchProducts", async (_, { rejectWithValue }) => {
  try {
    return await getAllProducts()
  } catch {
    return rejectWithValue("فشل في جلب المنتجات")
  }
})

// جلب المنتجات حسب الفئة
export const fetchProductsByCategory = createAsyncThunk(
  "gift/fetchProductsByCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      return await getProductsByCategory(category)
    } catch {
      return rejectWithValue("فشل في جلب المنتجات حسب الفئة")
    }
  }
)

// البحث في المنتجات
export const searchGiftProducts = createAsyncThunk(
  "gift/searchProducts",
  async (query: string, { rejectWithValue }) => {
    try {
      return await searchProducts(query)
    } catch {
      return rejectWithValue("فشل في البحث عن المنتجات")
    }
  }
)

// تصفية المنتجات
export const filterGiftProducts = createAsyncThunk(
  "gift/filterProducts",
  async (filters: Record<string, unknown>, { rejectWithValue }) => {
    try {
      return await filterProducts(filters)
    } catch {
      return rejectWithValue("فشل في تصفية المنتجات")
    }
  }
)

// جلب جميع الأكياس
export const fetchBags = createAsyncThunk("gift/fetchBags", async (_, { rejectWithValue }) => {
  try {
    return await getAllBags()
  } catch {
    return rejectWithValue("فشل في جلب الأكياس")
  }
})

// جلب الأكياس المتاحة
export const fetchAvailableBags = createAsyncThunk("gift/fetchAvailableBags", async (_, { rejectWithValue }) => {
  try {
    return await getAvailableBags()
  } catch {
    return rejectWithValue("فشل في جلب الأكياس المتاحة")
  }
})

// جلب جميع الحلويات
export const fetchSweets = createAsyncThunk("gift/fetchSweets", async (_, { rejectWithValue }) => {
  try {
    return await getAllSweets()
  } catch {
    return rejectWithValue("فشل في جلب الحلويات")
  }
})

// جلب الحلويات المتاحة
export const fetchAvailableSweets = createAsyncThunk("gift/fetchAvailableSweets", async (_, { rejectWithValue }) => {
  try {
    return await getAvailableSweets()
  } catch {
    return rejectWithValue("فشل في جلب الحلويات المتاحة")
  }
})

// إنشاء slice للهدايا
const giftSlice = createSlice({
  name: "gift",
  initialState,
  reducers: {
    // اختيار الصندوق
    selectBox: (state, action: PayloadAction<Box>) => {
      state.selectedBox = action.payload
    },

    // إضافة منتج مختار
    addSelectedProduct: (state, action: PayloadAction<GiftProduct>) => {
      // التأكد من أن selectedProducts مصفوفة
      if (!state.selectedProducts) {
        state.selectedProducts = []
      }
      
      const existingProduct = state.selectedProducts.find(p => p.id === action.payload.id)
      if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 1) + 1
      } else {
        state.selectedProducts.push({ ...action.payload, quantity: 1 })
      }
    },

    // إزالة منتج مختار
    removeSelectedProduct: (state, action: PayloadAction<string>) => {
      // التأكد من أن selectedProducts مصفوفة
      if (!state.selectedProducts) {
        state.selectedProducts = []
        return
      }
      state.selectedProducts = state.selectedProducts.filter(p => p.id !== action.payload)
    },

    // تحديث كمية منتج مختار
    updateSelectedProductQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      // التأكد من أن selectedProducts مصفوفة
      if (!state.selectedProducts) {
        state.selectedProducts = []
        return
      }
      
      const product = state.selectedProducts.find(p => p.id === action.payload.id)
      if (product) {
        product.quantity = action.payload.quantity
      }
    },

    // اختيار الكيس
    selectBag: (state, action: PayloadAction<Bag>) => {
      state.selectedBag = action.payload
    },

    // إضافة حلوى مختارة
    addSelectedSweet: (state, action: PayloadAction<Sweet>) => {
      // التأكد من أن selectedSweets مصفوفة
      if (!state.selectedSweets) {
        state.selectedSweets = []
      }
      
      const existingSweet = state.selectedSweets.find(s => s.id === action.payload.id)
      if (existingSweet) {
        // إذا كانت موجودة، نزيد الكمية (إذا كان لديها quantity property)
        if ('quantity' in existingSweet && typeof existingSweet.quantity === 'number') {
          existingSweet.quantity += 1
        }
      } else {
        state.selectedSweets.push({ ...action.payload, quantity: 1 })
      }
    },

    // إزالة حلوى مختارة
    removeSelectedSweet: (state, action: PayloadAction<string>) => {
      // التأكد من أن selectedSweets مصفوفة
      if (!state.selectedSweets) {
        state.selectedSweets = []
        return
      }
      state.selectedSweets = state.selectedSweets.filter(s => s.id !== action.payload)
    },

    // تحديث كمية حلوى مختارة
    updateSelectedSweetQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      // التأكد من أن selectedSweets مصفوفة
      if (!state.selectedSweets) {
        state.selectedSweets = []
        return
      }
      
      const sweet = state.selectedSweets.find(s => s.id === action.payload.id)
      if (sweet && 'quantity' in sweet) {
        sweet.quantity = action.payload.quantity
      }
    },

    // تعيين الرسالة الشخصية
    setPersonalMessage: (state, action: PayloadAction<PersonalMessage>) => {
      state.personalMessage = action.payload
    },

    // تغيير الخطوة الحالية
    setCurrentStep: (state, action: PayloadAction<number>) => {
      // التأكد من وجود ui object
      if (!state.ui) {
        state.ui = {
          currentStep: action.payload,
          showPreview: false,
          isProcessing: false,
        }
      } else {
        state.ui.currentStep = action.payload
      }
    },

    // تبديل عرض المعاينة
    togglePreview: (state) => {
      // التأكد من وجود ui object
      if (!state.ui) {
        state.ui = {
          currentStep: 1,
          showPreview: true,
          isProcessing: false,
        }
      } else {
        state.ui.showPreview = !state.ui.showPreview
      }
    },

    // تعيين حالة المعالجة
    setProcessing: (state, action: PayloadAction<boolean>) => {
      // التأكد من وجود ui object
      if (!state.ui) {
        state.ui = {
          currentStep: 1,
          showPreview: false,
          isProcessing: action.payload,
        }
      } else {
        state.ui.isProcessing = action.payload
      }
    },

    // إعادة تعيين الهدية
    resetGift: (state) => {
      state.selectedBox = null
      state.selectedProducts = []
      state.selectedSweets = []
      state.selectedBag = null
      state.personalMessage = null
      
      // التأكد من وجود ui object
      if (!state.ui) {
        state.ui = {
          currentStep: 1,
          showPreview: false,
          isProcessing: false,
        }
      } else {
        state.ui.currentStep = 1
        state.ui.showPreview = false
        state.ui.isProcessing = false
      }
    },

    // تحديث فئة الصناديق المختارة
    setBoxCategory: (state, action: PayloadAction<string>) => {
      state.boxes.selectedCategory = action.payload
    },

    // تحديث فلاتر المنتجات
    updateProductFilters: (state, action: PayloadAction<Partial<GiftState['products']['filters']>>) => {
      state.products.filters = { ...state.products.filters, ...action.payload }
    },

    // تحديث صفحة المنتجات
    setProductPage: (state, action: PayloadAction<number>) => {
      state.products.pagination.currentPage = action.payload
    },

    // تحديث استعلام البحث
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.products.search.query = action.payload
    },

    // إضافة منتج للبيانات
    addProduct: (state, action: PayloadAction<GiftProduct>) => {
      state.products.data.push(action.payload)
    },

    // إضافة صندوق للبيانات
    addBox: (state, action: PayloadAction<Box>) => {
      state.boxes.data.push(action.payload)
    },

    // إضافة كيس للبيانات
    addBag: (state, action: PayloadAction<Bag>) => {
      state.bags.data.push(action.payload)
    },

    // إضافة حلوى للبيانات
    addSweet: (state, action: PayloadAction<Sweet>) => {
      state.sweets.data.push(action.payload)
    },
  },

  extraReducers: (builder) => {
    // معالجة الصناديق
    builder
      .addCase(fetchBoxes.pending, (state) => {
        state.boxes.isLoading = true
        state.boxes.error = null
      })
      .addCase(fetchBoxes.fulfilled, (state, action) => {
        state.boxes.isLoading = false
        state.boxes.data = action.payload
        state.boxes.available = action.payload.filter(box => box.stock > 0)
      })
      .addCase(fetchBoxes.rejected, (state, action) => {
        state.boxes.isLoading = false
        state.boxes.error = action.payload as string
      })

    // معالجة الصناديق حسب الفئة
    builder
      .addCase(fetchBoxesByCategory.pending, (state) => {
        state.boxes.isLoading = true
        state.boxes.error = null
      })
      .addCase(fetchBoxesByCategory.fulfilled, (state, action) => {
        state.boxes.isLoading = false
        const category = state.boxes.selectedCategory
        state.boxes.byCategory[category] = action.payload
      })
      .addCase(fetchBoxesByCategory.rejected, (state, action) => {
        state.boxes.isLoading = false
        state.boxes.error = action.payload as string
      })

    // معالجة المنتجات
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.products.isLoading = true
        state.products.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.isLoading = false
        state.products.data = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.isLoading = false
        state.products.error = action.payload as string
      })

    // معالجة المنتجات حسب الفئة
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.products.isLoading = true
        state.products.error = null
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.products.isLoading = false
        // تحديد الفئة بناءً على الحالة الحالية أو استخدام "all" كقيمة افتراضية
        const category = state.products.filters.category.length > 0 ? state.products.filters.category[0] : "all"
        state.products.byCategory[category] = action.payload
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.products.isLoading = false
        state.products.error = action.payload as string
      })

    // معالجة البحث في المنتجات
    builder
      .addCase(searchGiftProducts.pending, (state) => {
        state.products.search.isLoading = true
      })
      .addCase(searchGiftProducts.fulfilled, (state, action) => {
        state.products.search.isLoading = false
        state.products.search.results = action.payload
      })
      .addCase(searchGiftProducts.rejected, (state, action) => {
        state.products.search.isLoading = false
        state.products.error = action.payload as string
      })

    // معالجة تصفية المنتجات
    builder
      .addCase(filterGiftProducts.pending, (state) => {
        state.products.isLoading = true
        state.products.error = null
      })
      .addCase(filterGiftProducts.fulfilled, (state, action) => {
        state.products.isLoading = false
        state.products.data = action.payload
      })
      .addCase(filterGiftProducts.rejected, (state, action) => {
        state.products.isLoading = false
        state.products.error = action.payload as string
      })

    // معالجة الأكياس
    builder
      .addCase(fetchBags.pending, (state) => {
        state.bags.isLoading = true
        state.bags.error = null
      })
      .addCase(fetchBags.fulfilled, (state, action) => {
        state.bags.isLoading = false
        state.bags.data = action.payload
      })
      .addCase(fetchBags.rejected, (state, action) => {
        state.bags.isLoading = false
        state.bags.error = action.payload as string
      })

    // معالجة الأكياس المتاحة
    builder
      .addCase(fetchAvailableBags.pending, (state) => {
        state.bags.isLoading = true
        state.bags.error = null
      })
      .addCase(fetchAvailableBags.fulfilled, (state, action) => {
        state.bags.isLoading = false
        state.bags.available = action.payload
      })
      .addCase(fetchAvailableBags.rejected, (state, action) => {
        state.bags.isLoading = false
        state.bags.error = action.payload as string
      })

    // معالجة الحلويات
    builder
      .addCase(fetchSweets.pending, (state) => {
        state.sweets.isLoading = true
        state.sweets.error = null
      })
      .addCase(fetchSweets.fulfilled, (state, action) => {
        state.sweets.isLoading = false
        state.sweets.data = action.payload
      })
      .addCase(fetchSweets.rejected, (state, action) => {
        state.sweets.isLoading = false
        state.sweets.error = action.payload as string
      })

    // معالجة الحلويات المتاحة
    builder
      .addCase(fetchAvailableSweets.pending, (state) => {
        state.sweets.isLoading = true
        state.sweets.error = null
      })
      .addCase(fetchAvailableSweets.fulfilled, (state, action) => {
        state.sweets.isLoading = false
        state.sweets.available = action.payload
      })
      .addCase(fetchAvailableSweets.rejected, (state, action) => {
        state.sweets.isLoading = false
        state.sweets.error = action.payload as string
      })
  },
})

// تصدير الإجراءات
export const {
  selectBox,
  addSelectedProduct,
  removeSelectedProduct,
  updateSelectedProductQuantity,
  addSelectedSweet,
  removeSelectedSweet,
  updateSelectedSweetQuantity,
  selectBag,
  setPersonalMessage,
  setCurrentStep,
  togglePreview,
  setProcessing,
  resetGift,
  setBoxCategory,
  updateProductFilters,
  setProductPage,
  setSearchQuery,
  addProduct,
  addBox,
  addBag,
  addSweet,
} = giftSlice.actions

// تصدير المحولات
export default giftSlice.reducer
