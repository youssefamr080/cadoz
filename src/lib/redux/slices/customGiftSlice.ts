import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { CustomGift } from "@/types/database"
import { getAllCustomGifts, getCustomGiftsByCategory, getCustomGiftById } from "@/lib/actions/custom-gift-actions"

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
