import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type DateRangePreset = 'this_month' | 'last_month' | 'this_quarter' | 'fy_2025_2026' | 'all'

interface UIState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  dateRange: DateRangePreset
  activeWarehouseId: string
  refreshCount: number // Trigger to re-render local storage subscribers
}

const initialState: UIState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  dateRange: 'this_quarter',
  activeWarehouseId: 'wh-khatunganj',
  refreshCount: 0,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload
    },
    setDateRange: (state, action: PayloadAction<DateRangePreset>) => {
      state.dateRange = action.payload
    },
    triggerDataRefresh: (state) => {
      state.refreshCount += 1
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  setDateRange,
  triggerDataRefresh,
} = uiSlice.actions

export default uiSlice.reducer
