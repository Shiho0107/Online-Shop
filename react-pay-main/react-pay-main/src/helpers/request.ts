import axios from 'axios';

import { setupInterceptorsTo, setupAxios } from './Interceptors';

setupAxios(axios);
setupInterceptorsTo(axios);

const URL =
  import.meta.env.VITE_REACT_APP_IS_DEV == 'true'
    ? import.meta.env.VITE_REACT_APP_BE_API_URL_DEV
    : import.meta.env.VITE_REACT_APP_BE_API_URL_PRODUCT;

const login = async (loginValue: { email: string; password: string }) => {
  try {
    const res = await axios.post(`${URL}`, loginValue);
    console.log('res', res);
  } catch (error) {}
};

const checkAdminRole = async () => {
  try {
    const response = await axios.get(`${URL}auth/profile`);
    return response.data?.user?.role === 'admin';
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

const getData = async (url: string) => {
  try {
    const response = await axios.get(`${URL}${url}`);
    return response?.data ?? null;
  } catch (error: any) {
    console.error(`getData error for ${url}:`, error?.response?.status, error?.response?.data || error.message);
    if (error?.response?.status === 401 && url === 'carts') {
      return {
        status: error?.response?.status,
        message: error?.response?.data?.message,
      };
    }
    return null;
  }
};

const postPay = async (data: any) => {
  try {
    const response = await axios.post(`${URL}pays/create-payment`, data);
    return response?.data ?? null;
  } catch (error) {
    console.error('postPay error', error);
    return null;
  }
};

const updateData = async (url: string, data: any) => {
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };
  try {
    const response = await axios.put(`${URL}${url}`, data, config);
    return response?.data ?? null;
  } catch (error) {
    return null;
  }
};

const updateDataAdmin = async (
  url: string,
  data: any,
  type: 'post' | 'put' | 'patch'
) => {
  // const config = {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // };
  try {
    const response = await axios[`${type}`](`${url}`, data);
    return response?.data ?? null;
  } catch (error) {
    return null;
  }
};

const updateDataAdmin2 = async (
  url: string,
  data: any,
  type: 'post' | 'put'
) => {
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' },
  };
  try {
    const response = await axios[`${type}`](`${url}`, data, config);
    return response?.data ?? null;
  } catch (error) {
    return null;
  }
};

const deleteData = async (url: string) => {
  try {
    const response = await axios.delete(`${URL}${url}`);
    return response?.data ?? null;
  } catch (error) {
    return null;
  }
};

const putData = async (url: string, data: any) => {
  try {
    const response = await axios.put(`${URL}${url}`, data);
    return response?.data ?? null;
  } catch (error) {
    console.error('putData error', error);
    return null;
  }
};

export {
  login,
  getData,
  updateData,
  deleteData,
  updateDataAdmin,
  putData,
  postPay,
  checkAdminRole,
  updateDataAdmin2,
};
