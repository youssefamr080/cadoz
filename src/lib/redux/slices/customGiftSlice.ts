import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface CustomGift {
  id: string
  name: string
  description: string
  image: string
  basePrice: number
  category: string
}

// Mock data for custom gifts
const mockCustomGifts: CustomGift[] = [
  {
    id: "1",
    name: "مج مخصص بالاسم",
    description: "مج سيراميك عالي الجودة مع إمكانية طباعة الاسم أو الصورة",
    image: "/images/mug prent.jpg",
    basePrice: 150,
    category: "accessories"
  },
  {
    id: "2",
    name: "محفظة مخصصة",
    description: "محفظة جلدية أنيقة مع إمكانية النقش",
    image: "/images/men wallet.png",
    basePrice: 300,
    category: "accessories"
  },
  {
    id: "3",
    name: "لوحة فنية مخصصة",
    description: "لوحة فنية بالألوان المائية حسب الطلب",
    image: "/images/potrait slider.jpg",
    basePrice: 500,
    category: "art"
  }
]

// Mock functions to replace the deleted actions
const getAllCustomGifts = async (): Promise<CustomGift[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockCustomGifts
}

const getCustomGiftsByCategory = async (category: string): Promise<CustomGift[]> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  if (category === "all") {
    return mockCustomGifts
  }
  return mockCustomGifts.filter(gift => gift.category === category)
}

const getCustomGiftById = async (id: string): Promise<CustomGift | null> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockCustomGifts.find(gift => gift.id === id) || null
}

interface CustomGiftState {
  customGifts: CustomGift[]
  filteredGifts: CustomGift[]
  selectedGift: CustomGift | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: CustomGiftState = {
  customGifts: [],
  filteredGifts: [],
  selectedGift: null,
  status: "idle",
  error: null,
}

// Thunks
export const fetchAllCustomGifts = createAsyncThunk(
  "customGift/fetchAllCustomGifts",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllCustomGifts()
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const fetchCustomGiftsByCategory = createAsyncThunk(
  "customGift/fetchCustomGiftsByCategory",
  async (category: string, { rejectWithValue }) => {
    try {
      return await getCustomGiftsByCategory(category)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const fetchCustomGiftById = createAsyncThunk(
  "customGift/fetchCustomGiftById",
  async (id: string, { rejectWithValue }) => {
    try {
      const gift = await getCustomGiftById(id)
      if (!gift) {
        return rejectWithValue("Custom gift not found")
      }
      return gift
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const customGiftSlice = createSlice({
  name: "customGift",
  initialState,
  reducers: {
    clearSelectedCustomGift: (state) => {
      state.selectedGift = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCustomGifts.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchAllCustomGifts.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.customGifts = action.payload
        state.filteredGifts = action.payload
      })
      .addCase(fetchAllCustomGifts.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchCustomGiftsByCategory.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchCustomGiftsByCategory.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.filteredGifts = action.payload
      })
      .addCase(fetchCustomGiftsByCategory.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchCustomGiftById.fulfilled, (state, action) => {
        state.selectedGift = action.payload
      })
  },
})

export const { clearSelectedCustomGift } = customGiftSlice.actions

export default customGiftSlice.reducer
