import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { categoryType } from '../helpers/type';

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [] as categoryType[],
  },
  reducers: {
    setCategories: (state, action: PayloadAction<categoryType[]>) => {
      state.categories = action.payload;
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (category) => category._id !== action.payload
      );
    },
    editCategory: (state, action: PayloadAction<categoryType>) => {
      state.categories = state.categories.map((category) =>
        category._id === action.payload._id ? action.payload : category
      );
    },
    addCategory: (state, action: PayloadAction<categoryType>) => {
      state.categories = [...state.categories, action.payload];
    },
    updateCategory: (state, action: PayloadAction<categoryType>) => {
      state.categories = state.categories.map((category) =>
        category._id === action.payload._id ? action.payload : category
      );
    },
  },
});

export const { setCategories, deleteCategory, editCategory, addCategory } =
  categorySlice.actions;
export default categorySlice.reducer;
