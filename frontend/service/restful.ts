import axios, { AxiosResponse } from 'axios';
import { setCookie } from 'cookies-next';

const API_BASE_URL = 'http://localhost:4001/users';

interface ApiResponse<T> {
  status: number;
  data: T;
  error: string | null;
}

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

async function apiCall<T>(endpoint: string, method: string, body?: any): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await axiosInstance({
      url: endpoint,
      method,
      data: body,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
    throw error;
  }
}

export const api = {
  signin: async (username: string, password: string) => {
    const response = await apiCall<{ user: any; token: string }>('/signin', 'POST', { username, password });
    if (response.status === 200 && response.data.token) {
      console.log('Signin done response:', response.status , response.data);

      setCookie('authToken', response.data.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
      });
    }
    
    return response;
  },
  
  signup: async (username: string, password: string) => {
    const response = await apiCall<{ user: any; token: string }>('/register', 'POST', { username, password });
    if (response.status === 200 && response.data.token) {
      console.log('Signup done response:', response.status, response.data);

      setCookie('authToken', response.data.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
      });
    }
    
    return response;
  },
  // Add other API calls here as needed
};
