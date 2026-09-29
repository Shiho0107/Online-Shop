import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice.ts';
import cartReducer from './cartSlice.ts';
// Import category reducer slice
import serieReducer from './serieSlice.ts';
import categoryReducer from './categorySlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer, // Quản lý nhánh state.auth
    cart: cartReducer, // Quản lý nhánh state.cart
    serie: serieReducer, // Quản lý nhánh state.serie
    category: categoryReducer, // Quản lý nhánh state.category
  },
});
