import { createSlice } from '@reduxjs/toolkit';

const getLocalAuth = () => {
  try {
    const auth = localStorage.getItem('AUTH');
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    console.error('Lỗi đọc dữ liệu AUTH từ localStorage:', error);
    return null;
  }
};

const localAuthData = getLocalAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localAuthData?.user || null,
    isLoggedIn: !!localAuthData, // Sử dụng toán tử !! để ép nhanh về kiểu boolean
    accessToken: localAuthData?.access || null,
    error: false,
    message: '',
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.access;
      state.isLoggedIn = true;
      state.error = false;
      state.message = '';
      try {
        const userLocalStorage = {
          user: action.payload.user,
          access: action.payload.access,
        };
        localStorage.setItem('AUTH', JSON.stringify(userLocalStorage));
      } catch (e) {
        console.error('Không thể lưu AUTH vào localStorage', e);
      }
    },
    loginError: (state, action) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      state.error = true;
      state.message = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload.data;
      try {
        const userLocalStorage = {
          user: action.payload.data,
          access: state.accessToken,
        };
        localStorage.setItem('AUTH', JSON.stringify(userLocalStorage));
      } catch (e) {
        console.error('Không thể lưu AUTH vào localStorage', e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isLoggedIn = false;
      try {
        localStorage.removeItem('AUTH');
      } catch (e) {
        console.error('Không thể xóa AUTH từ localStorage', e);
      }
    },
  },
});

export const { loginSuccess, loginError, logout, updateUser } =
  authSlice.actions;
export default authSlice.reducer;
