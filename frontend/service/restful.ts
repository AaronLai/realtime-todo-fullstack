import axios, { AxiosResponse } from 'axios';
import { setCookie, getCookie } from 'cookies-next';
import { ApiResponse, Task, Project } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
const PROJECT_API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL || 'http://localhost:4002';
const TASK_API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_BASE_URL || 'http://localhost:4003';

const userEndpoint = `${API_BASE_URL}/users`;
const projectEndpoint = `${PROJECT_API_BASE_URL}/projects`;
const taskEndpoint = `${TASK_API_BASE_URL}/tasks`;

type SigninResponse = {
  user: any;
  token: string;
};

type SignupResponse = {
  data: any;
};

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
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
      ...additionalConfig,
    };

    if (body) {
      config.data = body;
    }

    if (useAuth) {
      const token = getCookie('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response: AxiosResponse<ApiResponse<T>> = await axios(config);
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
  signin: async (username: string, password: string): Promise<ApiResponse<SigninResponse>> => {
    const response = await apiCall<SigninResponse>(
      '/signin',
      'POST',
      { username, password },
      false,
      { baseURL: userEndpoint }
    );
    
    if (response.status === 200 && response.data?.token) {
      console.log('Signin done response:', response.status, response.data);
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  signup: async (username: string, password: string): Promise<ApiResponse<SignupResponse>> => {
    console.log('signup', username, password);
    const response = await apiCall<SignupResponse>(
      '/register',
      'POST',
      { username, password },
      false,
      { baseURL: userEndpoint }
    );
    
    console.log('Signup response:', response.status);
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
  },

  createProject: async (projectData: { name: string; description: string }): Promise<ApiResponse<any>> => {
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
};