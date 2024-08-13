import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto , TaskStatus, TaskPriority } from './task.dto';
import { Response } from '@utils/response';

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
        status: TaskStatus.TODO,
        dueDate: new Date(),
        priority: TaskPriority.MEDIUM,
        projectId: 'test-project-id',
        createdById: 'test-user-id',
        tags: ['test', 'task'],  // Optional, but included for completeness
        assignedToId: 'test-assigned-id'  // Optional, but included for completeness
      };  const user = { userId: 'test-user-id' };
      const expectedResponse = Response.success({ ...taskData, id: 'test-task-id' }, 201);

      jest.spyOn(taskService, 'createTask').mockResolvedValue(expectedResponse);

      const result = await taskController.createTask(user, taskData);

      expect(result).toEqual(expectedResponse);
      expect(taskService.createTask).toHaveBeenCalledWith({ ...taskData, createdById: user.userId });
    });
  });

  describe('getTask', () => {
    it('should get a task by id', async () => {
      const taskId = 'test-task-id';
      const expectedResponse = Response.success({ id: taskId, name: 'Test Task' });

      jest.spyOn(taskService, 'getTask').mockResolvedValue(expectedResponse);

      const result = await taskController.getTask(taskId);

      expect(result).toEqual(expectedResponse);
      expect(taskService.getTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = 'test-task-id';
      const taskData: UpdateTaskDto = { name: 'Updated Task' };
      const expectedResponse = Response.success({ id: taskId, ...taskData });

      jest.spyOn(taskService, 'updateTask').mockResolvedValue(expectedResponse);

      const result = await taskController.updateTask(taskId, taskData);

      expect(result).toEqual(expectedResponse);
      expect(taskService.updateTask).toHaveBeenCalledWith(taskId, taskData);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = 'test-task-id';
      const expectedResponse = Response.success(null, 200);

      jest.spyOn(taskService, 'deleteTask').mockResolvedValue(expectedResponse);

      const result = await taskController.deleteTask(taskId);

      expect(result).toEqual(expectedResponse);
      expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe('getTasksByProject', () => {
    it('should get tasks by project', async () => {
      const projectId = 'test-project-id';
      const expectedResponse = Response.success([{ id: 'task-1' }, { id: 'task-2' }]);

      jest.spyOn(taskService, 'getTasksByProject').mockResolvedValue(expectedResponse);

      const result = await taskController.getTasksByProject(projectId);

      expect(result).toEqual(expectedResponse); expect(taskService.getTasksByProject).toHaveBeenCalledWith(projectId); }); });

      describe('error handling', () => { it('should handle not found error', async () => { const taskId = 'non-existent-id'; const expectedResponse = Response.notFound('Task not found'); jest.spyOn(taskService, 'getTask').mockResolvedValue(expectedResponse);
      
        const result = await taskController.getTask(taskId);
      
        expect(result).toEqual(expectedResponse);
        expect(taskService.getTask).toHaveBeenCalledWith(taskId);
      });
      
      it('should handle bad request error', async () => {
        const invalidTaskData: CreateTaskDto = {} as CreateTaskDto;
        const user = { userId: 'test-user-id' };
        const expectedResponse = Response.badRequest('Invalid task data');
      
        jest.spyOn(taskService, 'createTask').mockResolvedValue(expectedResponse);
      
        const result = await taskController.createTask(user, invalidTaskData);
      
        expect(result).toEqual(expectedResponse);
        expect(taskService.createTask).toHaveBeenCalledWith({ ...invalidTaskData, createdById: user.userId });
      });
      
      it('should handle internal server error', async () => {
        const taskId = 'test-task-id';
        const expectedResponse = Response.internalServerError();
      
        jest.spyOn(taskService, 'deleteTask').mockRejectedValue(new Error('Database error'));
      
        const result = await taskController.deleteTask(taskId);
      
        expect(result).toEqual(expectedResponse);
        expect(taskService.deleteTask).toHaveBeenCalledWith(taskId);
      });
      }); });
