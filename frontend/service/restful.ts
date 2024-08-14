import axios, { AxiosResponse } from 'axios';
import { setCookie, getCookie } from 'cookies-next';
import { ApiResponse, Task } from '../types'; 

const API_BASE_URL = 'http://localhost:4001/users';
const PROJECT_API_BASE_URL = 'http://localhost:4002/projects';
const TASK_API_BASE_URL = 'http://localhost:4003/tasks';


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

async function apiCall<T>(
  endpoint: string, 
  method: string, 
  body?: any, 
  useAuth: boolean = false,
  additionalConfig: any = {}
): Promise<ApiResponse<T>> {
  try {
    const config: any = {
      url: endpoint,
      method,
      data: body,
      ...additionalConfig,
    };

    if (useAuth) {
      const token = getCookie('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    const response: AxiosResponse<ApiResponse<T>> = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponse<T>;
    }
    throw error;
  }
}

const setAuthToken = (token: string) => {
  setCookie('authToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
  });
};

export const api = {
  signin: async (username: string, password: string) => {
    const response = await apiCall<{ user: any; token: string }>('/signin', 'POST', { username, password });
    if (response.status === 200 && response.data.token) {
      console.log('Signin done response:', response.status, response.data);
      setAuthToken(response.data.token);
    }
    return response;
  },

  getProjects: async () => {
    return apiCall<{ status: number; data: any[]; error: string | null }>(
      '/mine',
      'GET',
      undefined,
      true,
      { baseURL: PROJECT_API_BASE_URL }
    );
  },

  signup: async (username: string, password: string) => {
    const response = await apiCall<{ user: any; token: string }>('/register', 'POST', { username, password });
    if (response.status === 200 && response.data.token) {
      console.log('Signup done response:', response.status, response.data);
      setAuthToken(response.data.token);
    }
    return response;
  },
  createTask: async (taskData: {
    name: string;
    description: string;
    dueDate: string;
    tags: string[];
    priority: string;
    projectId?: string;
    assignedToId?: string;
  }): Promise<ApiResponse<Task>> => {
    return apiCall<Task>(
      '/',
      'POST',
      taskData,
      true,
      { baseURL: TASK_API_BASE_URL }
    );
  },

  getTasksByProjectId: async (projectId: string): Promise<ApiResponse<Task[]>> => {
    return apiCall<Task[]>(
      `/project/${projectId}`,
      'GET',
      undefined,
      true,
      { baseURL: TASK_API_BASE_URL }
    );
  },
  updateTask: async (taskId: string, updateData: Partial<Task>): Promise<ApiResponse<Task>> => {
    return apiCall<Task>(
      `/${taskId}`,
      'PUT',
      updateData,
      true,
      { baseURL: TASK_API_BASE_URL }
    );
  },
  deleteTask: async (taskId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(
      `/${taskId}`,
      'DELETE',
      undefined,
      true,
      { baseURL: TASK_API_BASE_URL }
    );
  },createProject: async (projectData: { name: string; description: string }): Promise<ApiResponse<any>> => {
    return apiCall<any>(
      '/',
      'POST',
      projectData,
      true,
      { baseURL: PROJECT_API_BASE_URL }
    );
  },

  // Add other API calls here as needed
};
