
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:4001';

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
  signin: (username: string, password: string) => 
    apiCall<{ user: any; token: string }>('/signin', 'POST', { username, password }),
  // Add other API calls here as needed
};
