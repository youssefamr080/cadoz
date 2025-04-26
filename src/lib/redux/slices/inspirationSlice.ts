import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { Inspiration } from "@/types/inspiration"
import { getAllInspirations, getInspirationById, getPopularInspirations } from "@/lib/actions/inspiration-actions"

interface InspirationState {
  inspirations: Inspiration[]
  popularInspirations: Inspiration[]
  selectedInspiration: Inspiration | null
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: InspirationState = {
  inspirations: [],
  popularInspirations: [],
  selectedInspiration: null,
  status: "idle",
  error: null,
}

// Thunks
export const fetchAllInspirations = createAsyncThunk(
  "inspiration/fetchAllInspirations",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllInspirations()
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const fetchPopularInspirations = createAsyncThunk(
    "inspiration/fetchPopularInspirations",
    async ({ limit = 4 }: { limit?: number }, { rejectWithValue }) => {
      try {
        return await getPopularInspirations(limit)
      } catch (error) {
        return rejectWithValue((error as Error).message)
      }
    },
  )
  

export const fetchInspirationById = createAsyncThunk(
  "inspiration/fetchInspirationById",
  async (id: string, { rejectWithValue }) => {
    try {
      const inspiration = await getInspirationById(id)
      if (!inspiration) {
        return rejectWithValue("Inspiration not found")
      }
      return inspiration
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const inspirationSlice = createSlice({
  name: "inspiration",
  initialState,
  reducers: {
    clearSelectedInspiration: (state) => {
      state.selectedInspiration = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllInspirations.pending, (state) => {
        state.status = "loading"
      })
      .addCase(fetchAllInspirations.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.inspirations = action.payload
      })
      .addCase(fetchAllInspirations.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchPopularInspirations.fulfilled, (state, action) => {
        state.popularInspirations = action.payload
      })
      .addCase(fetchInspirationById.fulfilled, (state, action) => {
        state.selectedInspiration = action.payload
      })
  },
})

export const { clearSelectedInspiration } = inspirationSlice.actions

export default inspirationSlice.reducer
