import axios, { AxiosResponse } from 'axios';
import { setCookie, getCookie } from 'cookies-next';
import { ApiResponse, Task, Project } from '../types';

// Base URLs for different API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';
const PROJECT_API_BASE_URL = process.env.NEXT_PUBLIC_PROJECT_API_BASE_URL || 'http://localhost:4002';
const TASK_API_BASE_URL = process.env.NEXT_PUBLIC_TASK_API_BASE_URL || 'http://localhost:4003';

// Specific endpoints for different services
const userEndpoint = `${API_BASE_URL}/users`;
const projectEndpoint = `${PROJECT_API_BASE_URL}/projects`;
const taskEndpoint = `${TASK_API_BASE_URL}/tasks`;

// Type definitions for API responses
type SigninResponse = {
  user: any;
  token: string;
};

type SignupResponse = {
  data: any;
};

/**
 * Generic function to make API calls
 * @param endpoint - The API endpoint
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param body - Request body (optional)
 * @param useAuth - Whether to use authentication token (default: false)
 * @param additionalConfig - Additional axios config (optional)
 * @returns Promise with API response
 */
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

    // Add authentication token if required
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

/**
 * Set authentication token in cookies
 * @param token - Authentication token
 */
const setAuthToken = (token: string) => {
  setCookie('authToken', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
  });
};

// API object containing all API functions
export const api = {
  /**
   * User sign in
   * @param username - User's username
   * @param password - User's password
   * @returns Promise with sign in response
   */
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

  /**
   * User sign up
   * @param username - New user's username
   * @param password - New user's password
   * @returns Promise with sign up response
   */
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

  /**
   * Get user's projects
   * @returns Promise with array of user's projects
   */
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    return apiCall<Project[]>(
      '/mine',
      'GET',
      undefined,
      true,
      { baseURL: projectEndpoint }
    );
  },

  /**
   * Create a new task
   * @param taskData - Object containing task details
   * @returns Promise with created task data
   */
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

  /**
   * Get tasks for a specific project
   * @param projectId - ID of the project
   * @returns Promise with array of tasks
   */
  getTasksByProjectId: async (projectId: string): Promise<ApiResponse<Task[]>> => {
    return apiCall<Task[]>(
      `/project/${projectId}`,
      'GET',
      undefined,
      true,
      { baseURL: taskEndpoint }
    );
  },

  /**
   * Update an existing task
   * @param taskId - ID of the task to update
   * @param updateData - Object containing fields to update
   * @returns Promise with updated task data
   */
  updateTask: async (taskId: string, updateData: Partial<Task>): Promise<ApiResponse<Task>> => {
    return apiCall<Task>(
      `/${taskId}`,
      'PUT',
      updateData,
      true,
      { baseURL: taskEndpoint }
    );
  },

  /**
   * Delete a task
   * @param taskId - ID of the task to delete
   * @returns Promise with void response
   */
  deleteTask: async (taskId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(
      `/${taskId}`,
      'DELETE',
      undefined,
      true,
      { baseURL: taskEndpoint }
    );
  },

  /**
   * Create a new project
   * @param projectData - Object containing project name and description
   * @returns Promise with created project data
   */
  createProject: async (projectData: { name: string; description: string }): Promise<ApiResponse<any>> => {
    return apiCall<any>(
      '/',
      'POST',
      projectData,
      true,
      { baseURL: projectEndpoint }
    );
  },

  /**
   * Assign a role to a user in a project
   * @param projectId - ID of the project
   * @param role - Role to assign
   * @param username - Username of the user to assign the role
   * @returns Promise with assignment response
   */
  assignRoleToUser: async (projectId: string, role: string, username: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(
      `/${projectId}/assign/${role}`,
      'POST',
      { username },
      true,
      { baseURL: projectEndpoint }
    );
  },

  /**
   * Get users associated with a project
   * @param projectId - ID of the project
   * @returns Promise with array of project users
   */
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