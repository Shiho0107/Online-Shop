import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. Định nghĩa cấu trúc dữ liệu cho một sản phẩm trong giỏ hàng
export interface CartItem {
  _id: string;         // Product ID
  variantId: string;   // Variant ID
  sku: string;
  name: string;
  price: number;
  mainImage: string;
  quantity: number;
  storage: string;
  color: string;
  condition: string;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  originalPrice?: number;
  flashSaleStock?: number;
}

// 2. Định nghĩa kiểu dữ liệu cho State ban đầu
interface CartState {
  items: CartItem[];
}

// Helper to get cart from localStorage
const getSavedCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

// Helper to save cart to localStorage
const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

// 3. Khai báo giá trị ban đầu kèm kiểu dữ liệu rõ ràng
const initialState: CartState = {
  items: getSavedCart(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.variantId === action.payload.variantId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      // action.payload is variantId
      state.items = state.items.filter((item) => item.variantId !== action.payload);
      saveCart(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.variantId === action.payload.variantId);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
