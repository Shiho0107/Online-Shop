import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { categoryType } from '../helpers/type';

const serieSlice = createSlice({
  name: 'serie',
  initialState: {
    series: [] as categoryType[],
  },
  reducers: {
    setSeries: (state, action: PayloadAction<categoryType[]>) => {
      state.series = action.payload;
    },
  },
});

export const { setSeries } = serieSlice.actions;
export default serieSlice.reducer;
