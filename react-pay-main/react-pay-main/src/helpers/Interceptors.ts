import {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const onRequest = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  //   console.info(`[request] [${JSON.stringify(config)}]`)
  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error] [${JSON.stringify(error)}]`);
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  // console.info(`[response] [${JSON.stringify(response)}]`)
  return response;
};

const onResponseError = (error: AxiosError) => {
  const originalRequest = error.config;

  // console.log("originalRequest", originalRequest);

  if (typeof error.response === 'undefined') {
    return {
      status: 400,
      data: [],
    };
  }
  if (
    error.status === 400 &&
    (originalRequest?.url === 'auth/register/' ||
      originalRequest?.url === 'auth/user/1/' ||
      originalRequest?.url?.includes('/top-movies/'))
  ) {
    return {
      status: 400,
      data: error?.response?.data,
    };
  }

  if (error.status === 401 && originalRequest?.url === 'auth/login/') {
    return {
      status: 401,
    };
  }

  if (error.status === 404) {
    return {
      status: 404,
    };
  }

  if (error.status === 500) {
    return {
      status: 500,
    };
  }

  // specific error handling done elsewhere
  return Promise.reject(error);
};

export function setupInterceptorsTo(
  axiosInstance: AxiosInstance
): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance;
}

export const getLocalAuth = () => {
  try {
    const auth = localStorage.getItem('AUTH');
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    console.error('Lỗi đọc dữ liệu AUTH từ localStorage:', error);
    return null;
  }
};

export function setupAxios(axiosInstance: AxiosInstance) {
  axiosInstance.defaults.baseURL =
    import.meta.env.VITE_REACT_APP_IS_DEV == 'true'
      ? import.meta.env.VITE_REACT_APP_BE_API_URL_DEV
      : import.meta.env.VITE_REACT_APP_BE_API_URL_PRODUCT;
  axiosInstance.defaults.headers.Accept = 'application/json';

  axiosInstance?.interceptors?.request.use(
    (config) => {
      const localAuthData = getLocalAuth();
      if (localAuthData?.user && localAuthData?.access) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${localAuthData?.access}`;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );
}
