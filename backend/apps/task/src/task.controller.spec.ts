import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from './task.dto';
import { Response } from '@utils/response';
import { Task } from '@data/entities/task.entity';
import { Project } from '@data/entities/project.entity';
import { User } from '@data/entities/user.entity';

const mockTask: Task = {
  id: 'test-task-id',
  name: 'Test Task',
  description: 'Test Description',
  dueDate: new Date(),
  priority: TaskPriority.MEDIUM,
  projectId: 'test-project-id',
  tags: ['test', 'task'],
  assignedToId: 'test-assigned-id',
  status: TaskStatus.TODO,
  createdById: 'test-user-id',
  createdAt: undefined,
  updatedAt: undefined,
  project: new Project,
  assignedTo: new User,
  createdBy: new User
};

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            createTask: jest.fn(),
            getTask: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
            getTasksByProject: jest.fn(),
          },
        },
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData: CreateTaskDto = {
        name: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(),
        priority: TaskPriority.MEDIUM,
        projectId: 'test-project-id',
        tags: ['test', 'task'],
        assignedToId: 'test-assigned-id',
        status: TaskStatus.TODO,
        createdById: ''
      };

      const user = { userId: 'test-user-id' };
      const expectedResponse = Response.success({
        ...mockTask,
        createdById: user.userId,
        dueDate: expect.any(Date) // Use expect.any(Date) to ignore exact timestamp
      }, 201);

      jest.spyOn(taskService, 'createTask').mockResolvedValue(mockTask);

      const result = await taskController.createTask(user, taskData);

      expect(result).toEqual(expectedResponse);
      expect(taskService.createTask).toHaveBeenCalledWith({
        ...taskData,
        status: TaskStatus.TODO,
        createdById: user.userId
      });
    });

    it('should handle errors when creating a task', async () => {
      const taskData: CreateTaskDto = {} as CreateTaskDto;
      const user = { userId: 'test-user-id' };
      const errorMessage = 'Error creating task';

      jest.spyOn(taskService, 'createTask').mockRejectedValue(new Error(errorMessage));

      const result = await taskController.createTask(user, taskData);

      expect(result).toEqual(Response.error(errorMessage, 400));
    });
  });

  describe('getTask', () => {
    it('should get a task by id', async () => {
      const taskId = 'test-task-id';

      jest.spyOn(taskService, 'getTask').mockResolvedValue(mockTask);

      const result = await taskController.getTask(taskId);

      // Update your expectations here
      expect(result).toEqual(Response.success(mockTask));
      expect(taskService.getTask).toHaveBeenCalledWith(taskId);
    });

    it('should handle errors when getting a task', async () => {
      const taskId = 'non-existent-id';
      const errorMessage = 'Task not found';

      jest.spyOn(taskService, 'getTask').mockRejectedValue(new Error(errorMessage));

      const result = await taskController.getTask(taskId);

      expect(result).toEqual(Response.error(errorMessage, 404));
    });
  });
  const mockUpdatedTask: Task = {
    id: 'test-task-id',
    name: 'Updated Test Task',
    description: 'Updated Test Description',
    dueDate: new Date(),
    priority: TaskPriority.HIGH,
    projectId: 'test-project-id',
    tags: ['updated', 'task'],
    assignedToId: 'updated-assigned-id',
    status: TaskStatus.IN_PROGRESS,
    createdById: 'test-user-id',
    createdAt: undefined,
    updatedAt: undefined,
    project: new Project,
    assignedTo: new User,
    createdBy: new User
  };
  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = 'test-task-id';
      const taskData: UpdateTaskDto = { name: 'Updated Task' };

      jest.spyOn(taskService, 'updateTask').mockResolvedValue(mockUpdatedTask);

      const result = await taskController.updateTask(taskId, taskData);

      const expectedResponse = Response.success(mockUpdatedTask);
      expect(result).toEqual(expectedResponse);
      expect(taskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
    });


    it('should handle errors when updating a task', async () => {
      const taskId = 'test-task-id';
      const taskData: UpdateTaskDto = { name: 'Updated Task' };
      const errorMessage = 'Error updating task';

      jest.spyOn(taskService, 'updateTask').mockRejectedValue(new Error(errorMessage));

      const result = await taskController.updateTask(taskId, taskData);

      expect(result).toEqual(Response.error(errorMessage, 404));
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = 'test-task-id'; const expectedResponse = Response.success('Task deleted successfully');

      const deleteTaskId = 'test-task-id';

      jest.spyOn(taskService, 'deleteTask').mockResolvedValue(undefined);

      const result = await taskController.deleteTask(deleteTaskId);

      expect(result).toEqual(Response.success('Task deleted successfully'));
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
    });

    it('should handle errors when deleting a task', async () => {
      const taskId = 'test-task-id';
      const errorMessage = 'Error deleting task';

      jest.spyOn(taskService, 'deleteTask').mockRejectedValue(new Error(errorMessage));

      const result = await taskController.deleteTask(taskId);

      expect(result).toEqual(Response.error(errorMessage, 404));
    });
  });

  describe('getTasksByProject', () => {
    it('should get tasks by project', async () => {

      const mockTasks: Task[] = [
        {
          id: 'task-1',
          name: 'Task 1',
          description: 'Description 1',
          dueDate: new Date(),
          priority: TaskPriority.MEDIUM,
          projectId: 'test-project-id',
          tags: ['tag1'],
          assignedToId: 'user-1',
          status: TaskStatus.TODO,
          createdById: 'creator-1',
          createdAt: undefined,
          updatedAt: undefined,
          project: new Project,
          assignedTo: new User,
          createdBy: new User
        },
        {
          id: 'task-2',
          name: 'Task 2',
          description: 'Description 2',
          dueDate: new Date(),
          priority: TaskPriority.HIGH,
          projectId: 'test-project-id',
          tags: ['tag2'],
          assignedToId: 'user-2',
          status: TaskStatus.IN_PROGRESS,
          createdById: 'creator-2',
          createdAt: undefined,
          updatedAt: undefined,
          project: new Project,
          assignedTo: new User,
          createdBy: new User
        }
      ];
      const targetProjectId = 'test-project-id';

      jest.spyOn(taskService, 'getTasksByProject').mockResolvedValue(mockTasks);

      const result = await taskController.getTasksByProject(targetProjectId);

      // Update your expectations here
      expect(result).toEqual(Response.success(mockTasks));
      expect(taskService.getTasksByProject).toHaveBeenCalledWith(targetProjectId);
    });

    it('should handle errors when getting tasks by project', async () => {
      const projectId = 'test-project-id';
      const errorMessage = 'Error getting tasks';

      jest.spyOn(taskService, 'getTasksByProject').mockRejectedValue(new Error(errorMessage));

      const result = await taskController.getTasksByProject(projectId);

      expect(result).toEqual(Response.error(errorMessage, 400));
    });
  });
});