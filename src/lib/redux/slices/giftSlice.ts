import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Box, GiftProduct, Decoration, Bag, SavedItem, PersonalMessage } from "../../../types/database"
import { convertInspirationBagToBag } from "../../../types/database"
import { getAllBoxes, getBoxesByCategory } from "@/lib/actions/box-actions"
import { getAllProducts, getProductsByCategory, searchProducts, filterProducts } from "@/lib/actions/product-actions"
import { getAllDecorations, getAvailableDecorations } from "@/lib/actions/decoration-actions"
import { getAllBags, getAvailableBags } from "@/lib/actions/bag-actions"
import {
  getSavedItems,
  addSavedItem,
  removeSavedItem as removeServerSavedItem,
  clearSavedItems as clearServerSavedItems,
} from "@/lib/actions/saved-item-actions"

// Definir el estado inicial
interface GiftState {
  // Datos seleccionados por el usuario
  selectedBox: Box | null
  selectedProducts: GiftProduct[]
  selectedDecorations: Decoration[]
  selectedBag: Bag | null
  personalMessage: PersonalMessage | null
  savedItems: SavedItem[]

  // Datos cargados de la base de datos
  boxes: {
    data: Box[]
    byCategory: Record<string, Box[]>
    status: "idle" | "loading" | "succeeded" | "failed"
    error: string | null
  }
  products: {
    data: GiftProduct[]
    byCategory: Record<string, GiftProduct[]>
    filtered: GiftProduct[]
    status: "idle" | "loading" | "succeeded" | "failed"
    error: string | null
  }
  decorations: {
    data: Decoration[]
    available: Decoration[]
    status: "idle" | "loading" | "succeeded" | "failed"
    error: string | null
  }
  bags: {
    data: Bag[]
    available: Bag[]
    status: "idle" | "loading" | "succeeded" | "failed"
    error: string | null
  }
  savedItemsStatus: {
    loading: boolean
    error: string | null
  }
}

const initialState: GiftState = {
  // Datos seleccionados por el usuario
  selectedBox: null,
  selectedProducts: [],
  selectedDecorations: [],
  selectedBag: null,
  personalMessage: null,
  savedItems: [],

  // Datos cargados de la base de datos
  boxes: {
    data: [],
    byCategory: {},
    status: "idle",
    error: null,
  },
  products: {
    data: [],
    byCategory: {},
    filtered: [],
    status: "idle",
    error: null,
  },
  decorations: {
    data: [],
    available: [],
    status: "idle",
    error: null,
  },
  bags: {
    data: [],
    available: [],
    status: "idle",
    error: null,
  },
  savedItemsStatus: {
    loading: false,
    error: null,
  },
}

// Thunks para operaciones asíncronas

// Boxes
export const fetchAllBoxes = createAsyncThunk("gift/fetchAllBoxes", async (_, { rejectWithValue }) => {
  try {
    return await getAllBoxes()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const fetchBoxesByCategory = createAsyncThunk(
  "gift/fetchBoxesByCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      const boxes = await getBoxesByCategory()
      return { category, boxes }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Products
export const fetchAllProducts = createAsyncThunk("gift/fetchAllProducts", async (_, { rejectWithValue }) => {
  try {
    return await getAllProducts()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const fetchProductsByCategory = createAsyncThunk(
  "gift/fetchProductsByCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      const products = await getProductsByCategory(category)
      return { category, products }
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const searchProductsThunk = createAsyncThunk(
  "gift/searchProducts",
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      return await searchProducts(searchTerm)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const filterProductsThunk = createAsyncThunk(
  "gift/filterProducts",
  async (
    filters: {
      category?: string
      flavor?: string[]
      occasion?: string
      inStock?: boolean
    },
    { rejectWithValue },
  ) => {
    try {
      return await filterProducts(filters)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Decorations
export const fetchAllDecorations = createAsyncThunk("gift/fetchAllDecorations", async (_, { rejectWithValue }) => {
  try {
    return await getAllDecorations()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const fetchAvailableDecorations = createAsyncThunk(
  "gift/fetchAvailableDecorations",
  async (_, { rejectWithValue }) => {
    try {
      return await getAvailableDecorations()
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Bags
export const fetchAllBags = createAsyncThunk("gift/fetchAllBags", async (_, { rejectWithValue }) => {
  try {
    return await getAllBags()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const fetchAvailableBags = createAsyncThunk("gift/fetchAvailableBags", async (_, { rejectWithValue }) => {
  try {
    return await getAvailableBags()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

// Saved Items
export const fetchSavedItems = createAsyncThunk("gift/fetchSavedItems", async (_, { rejectWithValue }) => {
  try {
    return await getSavedItems()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const addSavedItemThunk = createAsyncThunk(
  "gift/addSavedItem", 
  async (item: {
    productId: string
    type: string
    name: string
    price: number
    image?: string
  }, { rejectWithValue }) => {
  try {
    const savedItem = await addSavedItem(item)
    return savedItem
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const removeSavedItemThunk = createAsyncThunk(
  "gift/removeSavedItem",
  async (itemId: string, { rejectWithValue }) => {
    try {
      await removeServerSavedItem(itemId)
      return itemId
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const clearSavedItemsThunk = createAsyncThunk("gift/clearSavedItems", async (_, { rejectWithValue }) => {
  try {
    await clearServerSavedItems()
    return true
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

// Crear el slice
const giftSlice = createSlice({
  name: "gift",
  initialState,
  reducers: {
    // Acciones para la selección de elementos
    setSelectedBox: (state, action: PayloadAction<Box>) => {
      state.selectedBox = action.payload
    },
    addProduct: (state, action: PayloadAction<GiftProduct>) => {
      const existingIndex = state.selectedProducts.findIndex((p) => p.id === action.payload.id)
      if (existingIndex >= 0) {
        state.selectedProducts[existingIndex] = action.payload
      } else {
        state.selectedProducts.push(action.payload)
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.selectedProducts = state.selectedProducts.filter((p) => p.id !== action.payload)
    },
    updateProductQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload
      const productIndex = state.selectedProducts.findIndex((p) => p.id === id)
      if (productIndex >= 0) {
        state.selectedProducts[productIndex].quantity = quantity
      }
    },
    addDecoration: (state, action: PayloadAction<Decoration>) => {
      const existingIndex = state.selectedDecorations.findIndex((d) => d.id === action.payload.id)
      if (existingIndex < 0) {
        state.selectedDecorations.push(action.payload)
      }
    },
    removeDecoration: (state, action: PayloadAction<string>) => {
      state.selectedDecorations = state.selectedDecorations.filter((d) => d.id !== action.payload)
    },
    setSelectedBag: (state, action: PayloadAction<Bag>) => {
      state.selectedBag = action.payload
    },
    setPersonalMessage: (state, action: PayloadAction<PersonalMessage>) => {
      state.personalMessage = action.payload
    },
    clearGift: (state) => {
      state.selectedBox = null
      state.selectedProducts = []
      state.selectedDecorations = []
      state.selectedBag = null
      state.personalMessage = null
    },
    // Acción para cargar desde localStorage si es necesario
    loadSavedItemsFromLocalStorage: (state, action: PayloadAction<SavedItem[]>) => {
      if (state.savedItems.length === 0) {
        state.savedItems = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    // Boxes
    builder
      .addCase(fetchAllBoxes.pending, (state) => {
        state.boxes.status = "loading"
      })
      .addCase(fetchAllBoxes.fulfilled, (state, action) => {
        state.boxes.status = "succeeded"
        state.boxes.data = action.payload
      })
      .addCase(fetchAllBoxes.rejected, (state, action) => {
        state.boxes.status = "failed"
        state.boxes.error = action.payload as string
      })
      .addCase(fetchBoxesByCategory.fulfilled, (state, action) => {
        const { category, boxes } = action.payload
        state.boxes.byCategory[category] = boxes
      })

    // Products
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.products.status = "loading"
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.products.status = "succeeded"
        state.products.data = action.payload
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.products.status = "failed"
        state.products.error = action.payload as string
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        const { category, products } = action.payload
        state.products.byCategory[category] = products
      })
      .addCase(searchProductsThunk.fulfilled, (state, action) => {
        state.products.filtered = action.payload
      })
      .addCase(filterProductsThunk.fulfilled, (state, action) => {
        state.products.filtered = action.payload
      })

    // Decorations
    builder
      .addCase(fetchAllDecorations.pending, (state) => {
        state.decorations.status = "loading"
      })
      .addCase(fetchAllDecorations.fulfilled, (state, action) => {
        state.decorations.status = "succeeded"
        state.decorations.data = action.payload
      })
      .addCase(fetchAllDecorations.rejected, (state, action) => {
        state.decorations.status = "failed"
        state.decorations.error = action.payload as string
      })
      .addCase(fetchAvailableDecorations.fulfilled, (state, action) => {
        state.decorations.available = action.payload
      })

    // Bags
    builder
      .addCase(fetchAllBags.pending, (state) => {
        state.bags.status = "loading"
      })      .addCase(fetchAllBags.fulfilled, (state, action) => {
        state.bags.status = "succeeded"
        // تحويل InspirationBag[] إلى Bag[]
        state.bags.data = action.payload.map(convertInspirationBagToBag)
      })
      .addCase(fetchAllBags.rejected, (state, action) => {
        state.bags.status = "failed"
        state.bags.error = action.payload as string
      })      .addCase(fetchAvailableBags.fulfilled, (state, action) => {
        // تحويل InspirationBag[] إلى Bag[]
        state.bags.available = action.payload.map(convertInspirationBagToBag)
      })

    // Saved Items
    builder
      .addCase(fetchSavedItems.pending, (state) => {
        state.savedItemsStatus.loading = true
      })
      .addCase(fetchSavedItems.fulfilled, (state, action) => {
        state.savedItemsStatus.loading = false
        state.savedItems = action.payload
      })
      .addCase(fetchSavedItems.rejected, (state, action) => {
        state.savedItemsStatus.loading = false
        state.savedItemsStatus.error = action.payload as string
      })
      .addCase(addSavedItemThunk.fulfilled, (state, action) => {
        // Verificar si el item ya existe
        const existingIndex = state.savedItems.findIndex((item) => item.id === action.payload.id)
        if (existingIndex < 0) {
          // Agregar al inicio y mantener solo los 3 más recientes
          state.savedItems = [action.payload, ...state.savedItems].slice(0, 3)
        }
      })
      .addCase(removeSavedItemThunk.fulfilled, (state, action) => {
        state.savedItems = state.savedItems.filter((item) => item.id !== action.payload)
      })
      .addCase(clearSavedItemsThunk.fulfilled, (state) => {
        state.savedItems = []
      })
  },
})

// Exportar acciones y reducer
export const {
  setSelectedBox,
  addProduct,
  removeProduct,
  updateProductQuantity,
  addDecoration,
  removeDecoration,
  setSelectedBag,
  setPersonalMessage,
  clearGift,
  loadSavedItemsFromLocalStorage,
} = giftSlice.actions

export default giftSlice.reducer
