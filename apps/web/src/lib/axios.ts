import axios from 'axios';
import { env } from '../config/env';
import { toast } from '../hooks/use-toast';

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL ? `${env.VITE_API_URL}/api/v1` : '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = env.VITE_API_URL
          ? `${env.VITE_API_URL}/api/v1/auth/refresh`
          : '/api/v1/auth/refresh';
        const { data } = await axios.post(refreshUrl, {}, { withCredentials: true });

        const newAccessToken = data.data.accessToken;
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || error.message || 'An unexpected error occurred';

      // Keep the UI calm: skip noisy auth/permission/not-found toasts.
      // Pages already show empty/error states for those.
      if (status >= 500) {
        toast({
          title: 'Something went wrong',
          description: message,
          variant: 'destructive',
        });
      } else if (status === 400 || status === 422) {
        toast({
          title: 'Check your input',
          description: message,
          variant: 'destructive',
        });
      }
    } else if (error.request) {
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server.',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);
