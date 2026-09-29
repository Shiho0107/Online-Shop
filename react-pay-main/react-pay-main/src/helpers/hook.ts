import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';

import { loginError, loginSuccess, logout } from '../store/authSlice.ts';
import { setCartItems } from '../store/cartSlice.ts';
import { getData, putData } from './request.ts';
import type { typeInitState } from './type.ts';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 1. Định nghĩa cấu trúc dữ liệu gửi lên Backend
interface authVariables {
  value: {
    email: string;
    password: string;
  };

  url: string;
}

// Định nghĩa cấu trúc dữ liệu Backend trả về (Ví dụ)
interface LoginResponse {
  user: { id: string; name: string; email: string };
  token: string;
}

interface BackendErrorResponse {
  message: string;
  status?: number;
}

const useAuthMutation = () => {
  const dispatch = useDispatch();
  const URL =
    import.meta.env.VITE_REACT_APP_IS_DEV == 'true'
      ? import.meta.env.VITE_REACT_APP_BE_API_URL_DEV
      : import.meta.env.VITE_REACT_APP_BE_API_URL_PRODUCT;

  return useMutation<
    LoginResponse,
    AxiosError<BackendErrorResponse>,
    authVariables
  >({
    mutationFn: async (credentials) => {
      const response = await axios.post(
        `${URL}auth/${credentials.url}`,
        credentials.value
      );
      dispatch(loginSuccess(response.data));
      return response.data;
    },
    onSuccess: (_data) => {
      console.log('Đăng nhập thành công!');
    },
    onError: (error) => {
      if (
        (error.response?.status === 400 || error.response?.status === 401) &&
        error.response.config.url?.includes('login')
      ) {
        console.log('error.response', error.response);
        dispatch(loginError(error.response.data?.message));
      } else if (
        error.response?.status === 400 &&
        error.response.config.url?.includes('register')
      ) {
        console.log('error.response', error.response);
        // dispatch(loginError(error.response.data?.message));
      } else {
        // Trường hợp lỗi mạng, sập server không có phản hồi
        console.log(
          'Lỗi không có phản hồi từ server (lỗi kết nối):',
          error.message
        );
      }
    },
  });
};

export type UseImagePreviewProps = {
  defaultPreview?: {
    path: string;
    file: File | null;
  };
};

const useImagePreview = ({
  defaultPreview = {
    path: '',
    file: null,
  },
}: UseImagePreviewProps = {}) => {
  const [imagePreview, setImagePreview] = useState<{
    path: string;
    file: File | null;
  }>(defaultPreview);

  // Cập nhật lại imagePreview khi defaultPreview thay đổi
  useEffect(() => {
    setImagePreview(defaultPreview);
  }, [defaultPreview.path, defaultPreview.file]);

  const handleImageChange = (
    event?: React.ChangeEvent<HTMLInputElement> | File | null
  ) => {
    let file: File | null = null;

    if (!event) {
      setImagePreview(defaultPreview);
      return;
    }

    if (event instanceof File) {
      file = event;
    } else {
      const input = event.target as HTMLInputElement | null;
      file = input?.files && input.files.length > 0 ? input.files[0] : null;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview({
          file,
          path: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(defaultPreview);
    }
  };

  return {
    imagePreview,
    handleImageChange,
  };
};

const useCartSync = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: typeInitState) => state.cart.items);
  const isLoggedIn = useSelector(
    (state: typeInitState) => state.auth.isLoggedIn
  );

  // 1. Fetch backend cart when user logs in and merge with local cart
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCart = async () => {
      try {
        const response = await getData('carts');
        if (response?.status === 401) {
          dispatch(logout());
        }
        if (response && response.success && response.data?.items) {
          const dbItems = response.data.items.map((item: any) => ({
            _id: item.product?._id || item.product,
            variantId: item.productVariant?._id || item.productVariant,
            sku: item.productVariant?.sku || '',
            name: item.product?.name || '',
            price: Number(item.productVariant?.price || 0),
            mainImage: item.product?.mainImage || '',
            quantity: item.quantity,
            storage: item.productVariant?.storage || '',
            color: item.productVariant?.color || '',
            condition: item.productVariant?.condition || '',
          }));

          // Merge local guest cart items with DB items
          const merged = [...dbItems];
          for (const localItem of cartItems) {
            const exists = merged.find(
              (item) => item.variantId === localItem.variantId
            );
            if (!exists) {
              merged.push(localItem);
            } else {
              // Keep the higher quantity or combine them
              exists.quantity = Math.max(exists.quantity, localItem.quantity);
            }
          }

          dispatch(setCartItems(merged));

          // Immediately save the merged result back to DB
          if (cartItems.length > 0) {
            const payload = {
              items: merged.map((item) => ({
                product: item._id,
                productVariant: item.variantId,
                quantity: item.quantity,
              })),
            };
            await putData('carts', payload);
          }
        }
      } catch (error) {
        console.error('Failed to sync cart from DB:', error);
      }
    };

    fetchCart();
  }, [isLoggedIn, dispatch]);

  // 2. Sync local cart changes to backend database (debounced)
  useEffect(() => {
    if (!isLoggedIn) return;

    const timer = setTimeout(async () => {
      try {
        const payload = {
          items: cartItems.map((item) => ({
            product: item._id,
            productVariant: item.variantId,
            quantity: item.quantity,
          })),
        };
        await putData('carts', payload);
      } catch (error) {
        console.error('Failed to sync cart to DB:', error);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [cartItems, isLoggedIn]);
};

export { useAuthMutation, useDebounce, useImagePreview, useCartSync };
