import axios, { AxiosResponse } from 'axios';
import { setCookie, getCookie } from 'cookies-next';
import { ApiResponse, Task , Project} from '../types'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
const PROJECT_API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL || 'http://localhost:4002';
const TASK_API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_BASE_URL || 'http://localhost:4003';

// For user-related API calls
const userEndpoint = `${API_BASE_URL}/users`;

// For project-related API calls
const projectEndpoint = `${PROJECT_API_BASE_URL}/projects`;

// For task-related API calls
const taskEndpoint = `${TASK_API_BASE_URL}/tasks`;


const axiosInstance = axios.create({
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
  signin: async (username: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> => {
    const response = await apiCall<{ user: any; token: string }>(
      '/signin',
      'POST',
      { username, password },
      false,
      { baseURL: userEndpoint } // Assuming you have an authEndpoint defined
    );
    
    if (response.status === 200 && response.data.token) {
      console.log('Signin done response:', response.status, response.data);
      setAuthToken(response.data.token);
    }
    
    return response;
  },
  

  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    return apiCall<Project[]>(
      '/mine',
      'GET',
      undefined,
      true,
      { baseURL: projectEndpoint }
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
      { baseURL: taskEndpoint }
    );
  },

  getTasksByProjectId: async (projectId: string): Promise<ApiResponse<Task[]>> => {
    return apiCall<Task[]>(
      `/project/${projectId}`,
      'GET',
      undefined,
      true,
      { baseURL: taskEndpoint }
    );
  },
  updateTask: async (taskId: string, updateData: Partial<Task>): Promise<ApiResponse<Task>> => {
    return apiCall<Task>(
      `/${taskId}`,
      'PUT',
      updateData,
      true,
      { baseURL: taskEndpoint }
    );
  },
  deleteTask: async (taskId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(
      `/${taskId}`,
      'DELETE',
      undefined,
      true,
      { baseURL: taskEndpoint }
    );
  },createProject: async (projectData: { name: string; description: string }): Promise<ApiResponse<any>> => {
    return apiCall<any>(
      '/',
      'POST',
      projectData,
      true,
      { baseURL: projectEndpoint }
    );
  },
  assignRoleToUser: async (projectId: string, role: string, username: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(
      `/${projectId}/assign/${role}`,
      'POST',
      { username },
      true,
      { baseURL: projectEndpoint }
    );
  },
  getProjectUsers: async (projectId: string): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>(
      `/${projectId}/users`,
      'GET',
      undefined,
      true,
      { baseURL: projectEndpoint }
    );
  },
  // Add other API calls here as needed
};
