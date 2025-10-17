import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light'
};

const customizationSlice = createSlice({
  name: 'customization',
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    }
  }
});

export const { toggleMode } = customizationSlice.actions;
export default customizationSlice.reducer;
