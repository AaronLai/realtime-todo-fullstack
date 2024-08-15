import axios from 'axios';
import { api } from './restful';
import { setCookie, getCookie } from 'cookies-next';
import { ApiResponse, Task, Project } from '../types';

jest.mock('axios');
jest.mock('cookies-next');

const mockedAxios = axios as jest.MockedFunction<typeof axios>;
const mockedSetCookie = setCookie as jest.MockedFunction<typeof setCookie>;
const mockedGetCookie = getCookie as jest.MockedFunction<typeof getCookie>;

describe('api', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedGetCookie.mockReturnValue('test-token');
  });

  describe('signin', () => {
    it('should sign in successfully and set auth token', async () => {
      const mockResponse: ApiResponse<{ token: string; user: any }> = {
        status: 200,
        data: {
          token: 'test-token',
          user: { id: 1, username: 'testuser' }
        },
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.signin('testuser', 'password');

      expect(response).toEqual(mockResponse);
      expect(mockedSetCookie).toHaveBeenCalledWith('authToken', 'test-token', expect.any(Object));
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/signin',
        method: 'POST',
        data: { username: 'testuser', password: 'password' },
        baseURL: expect.any(String)
      }));
    });

    it('should handle signin failure', async () => {
      const mockResponse: ApiResponse<null> = {
        status: 401,
        data: null,
        error: 'Invalid credentials'
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.signin('wronguser', 'wrongpassword');

      expect(response).toEqual(mockResponse);
      expect(mockedSetCookie).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      mockedAxios.mockRejectedValue(new Error('Network Error'));

      await expect(api.signin('testuser', 'password')).rejects.toThrow('Network Error');
    });
  });

  describe('signup', () => {
    it('should sign up successfully', async () => {
      const mockResponse: ApiResponse<{ id: number; username: string }> = {
        status: 201,
        data: { id: 1, username: 'newuser' },
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.signup('newuser', 'password');

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/register',
        method: 'POST',
        data: { username: 'newuser', password: 'password' },
        baseURL: expect.any(String)
      }));
    });
  });

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects: Project[] = [
        {
            id: '1', name: 'Project 1', description: 'Description 1',
            createdAt: '',
            updatedAt: '',
            createdById: '',
            role: ''
        },
        {
            id: '2', name: 'Project 2', description: 'Description 2',
            createdAt: '',
            updatedAt: '',
            createdById: '',
            role: ''
        }
      ];
      const mockResponse: ApiResponse<Project[]> = {
        status: 200,
        data: mockProjects,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.getProjects();

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/mine',
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        }),
        baseURL: expect.any(String)
      }));
    });

    it('should handle unauthorized access', async () => {
      mockedGetCookie.mockReturnValue(undefined);

      await expect(api.getProjects()).rejects.toThrow('No authentication token found');
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask: Task = {
        id: '1',
        name: 'New Task',
        description: 'Task Description',
        dueDate: '2023-12-31',
        tags: ['important'],
        priority: 'High',
        projectId: 'project-1',
        assignedToId: 'user-1'
      };
      const mockResponse: ApiResponse<Task> = {
        status: 201,
        data: newTask,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.createTask({
        name: 'New Task',
        description: 'Task Description',
        dueDate: '2023-12-31',
        tags: ['important'],
        priority: 'high',
        projectId: 'project-1',
        assignedToId: 'user-1'
      });

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/',
        method: 'POST',
        data: expect.objectContaining({
          name: 'New Task',
          description: 'Task Description',
          dueDate: '2023-12-31',
          tags: ['important'],
          priority: 'high',
          projectId: 'project-1',
          assignedToId: 'user-1'
        }),
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });

  describe('getTasksByProjectId', () => {
    it('should fetch tasks for a project successfully', async () => {
      const mockTasks: Task[] = [
        { id: '1', name: 'Task 1', description: 'Description 1', projectId: 'project-1', dueDate: '2023-12-31', tags: [], priority: 'Medium' },
        { id: '2', name: 'Task 2', description: 'Description 2', projectId: 'project-1', dueDate: '2023-12-31', tags: [], priority: 'High' }
      ];
      const mockResponse: ApiResponse<Task[]> = {
        status: 200,
        data: mockTasks,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.getTasksByProjectId('project-1');

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/project/project-1',
        method: 'GET',
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updatedTask: Task = {
        id: '1',
        name: 'Updated Task',
        description: 'Updated Description',
        dueDate: '2023-12-31',
        tags: ['important', 'urgent'],
        priority: 'High',
        projectId: 'project-1',
        assignedToId: 'user-2'
      };
      const mockResponse: ApiResponse<Task> = {
        status: 200,
        data: updatedTask,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.updateTask('1', {
        name: 'Updated Task',
        description: 'Updated Description',
        tags: ['important', 'urgent'],
        assignedToId: 'user-2'
      });

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/1',
        method: 'PUT',
        data: expect.objectContaining({
          name: 'Updated Task',
          description: 'Updated Description',
          tags: ['important', 'urgent'],
          assignedToId: 'user-2'
        }),
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const mockResponse: ApiResponse<void> = {
        status: 204,
        data: undefined,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.deleteTask('1');

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/1',
        method: 'DELETE',
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const newProject: Project = {
          id: '1',
          name: 'New Project',
          description: 'Project Description',
          createdAt: '',
          updatedAt: '',
          createdById: '',
          role: ''
      };
      const mockResponse: ApiResponse<Project> = {
        status: 201,
        data: newProject,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.createProject({
        name: 'New Project',
        description: 'Project Description'
      });

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/',
        method: 'POST',
        data: {
          name: 'New Project',
          description: 'Project Description'
        },
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign a role to a user successfully', async () => {
      const mockResponse: ApiResponse<any> = {
        status: 200,
        data: { message: 'Role assigned successfully' },
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.assignRoleToUser('project-1', 'admin', 'testuser');

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/project-1/assign/admin',
        method: 'POST',
        data: { username: 'testuser' },
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });

  describe('getProjectUsers', () => {
    it('should fetch project users successfully', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', role: 'admin' },
        { id: '2', username: 'user2', role: 'member' }
      ];
      const mockResponse: ApiResponse<any[]> = {
        status: 200,
        data: mockUsers,
        error: null
      };

      mockedAxios.mockResolvedValue({ data: mockResponse });

      const response = await api.getProjectUsers('project-1');

      expect(response).toEqual(mockResponse);
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: '/project-1/users',
        method: 'GET',
        baseURL: expect.any(String),
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      }));
    });
  });
});