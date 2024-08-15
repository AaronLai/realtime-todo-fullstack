import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Response } from '@utils/response';
import { ProjectGateway } from './project.gateway';

describe('ProjectController', () => {
  let projectController: ProjectController;
  let projectService: ProjectService;
  let projectGateway: ProjectGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            createProjectAndAssignRole: jest.fn(),
            getProject: jest.fn(),
            updateProject: jest.fn(),
            assignUserToProjectWithRole: jest.fn(),
            getProjectsByUserId: jest.fn(),
            getUsersForProject: jest.fn(),
          },
        },
        {
          provide: ProjectGateway,
          useValue: {
            sendTaskUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    projectController = module.get<ProjectController>(ProjectController);
    projectService = module.get<ProjectService>(ProjectService);
    projectGateway = module.get<ProjectGateway>(ProjectGateway);
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const user = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'This is a test project',
        createdBy: user.userId,
      };
      const expectedProject = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        ...createProjectDto,
        createdBy: user.userId,
      };

      const expectedResponse = Response.success({ id: '123e4567-e89b-12d3-a456-426614174001', ...createProjectDto, createdBy: user.userId }, 201);

      jest.spyOn(projectService, 'createProjectAndAssignRole').mockResolvedValue(expectedProject);

      const result = await projectController.createProject(user, createProjectDto);
      expect(result).toEqual(expectedResponse);
      expect(projectService.createProjectAndAssignRole).toHaveBeenCalledWith({
        ...createProjectDto,
        createdBy: user.userId,
      });
    });

    it('should handle errors when creating a project', async () => {
      const user = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'This is a test project',
        createdBy: user.userId
      };
      const expectedResponse = Response.error('An error occurred while creating the project', 500);

      jest.spyOn(projectService, 'createProjectAndAssignRole').mockRejectedValue(new Error('Database error'));

      const result = await projectController.createProject(user, createProjectDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('handleProjectMessages', () => {
    it('should handle CREATE_DEFAULT_PROJECT message', async () => {
      const messageData = {
        action: 'CREATE_DEFAULT_PROJECT',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };
      const expectedProject = {
        name: 'Todo List',
        description: 'This is a your first todolist',
        createdBy: messageData.userId,
      };
      const expectedResponse = Response.success(expectedProject);
  
      jest.spyOn(projectService, 'createProjectAndAssignRole').mockResolvedValue(expectedResponse);
  
      await projectController.handleProjectMessages(messageData);
      expect(projectService.createProjectAndAssignRole).toHaveBeenCalledWith(expectedProject);
    });
  });

  describe('getProject', () => {
    it('should get a project by id', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001';
      const expectedResponse = Response.success({
        id: projectId,
        name: 'Test Project',
        description: 'This is a test project',
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
      });

      jest.spyOn(projectService, 'getProject').mockResolvedValue(expectedResponse);

      const result = await projectController.getProject(projectId);
      expect(result).toEqual(expectedResponse);
      expect(projectService.getProject).toHaveBeenCalledWith(projectId);
    });

    it('should return not found for non-existent project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174999';
      const expectedResponse = Response.notFound('Project not found');

      jest.spyOn(projectService, 'getProject').mockResolvedValue(expectedResponse);

      const result = await projectController.getProject(projectId);
      expect(result).toEqual(expectedResponse);
      expect(projectService.getProject).toHaveBeenCalledWith(projectId);
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'This is an updated project',
      };
      const expectedResponse = Response.success({ id: projectId, ...updateProjectDto });

      jest.spyOn(projectService, 'updateProject').mockResolvedValue(expectedResponse);

      const result = await projectController.updateProject(projectId, updateProjectDto);
      expect(result).toEqual(expectedResponse);
      expect(projectService.updateProject).toHaveBeenCalledWith(projectId, updateProjectDto);
    });

    it('should handle errors when updating a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'This is an updated project',
      };
      const expectedResponse = Response.error('Failed to update project');

      jest.spyOn(projectService, 'updateProject').mockResolvedValue(expectedResponse);

      const result = await projectController.updateProject(projectId, updateProjectDto);
      expect(result).toEqual(expectedResponse);
      expect(projectService.updateProject).toHaveBeenCalledWith(projectId, updateProjectDto);
    });
  });

  describe('assignUserToProject', () => {
    it('should assign a user to a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001';
      const role = 'developer';
      const username = 'testuser';
      const expectedResponse = Response.success({ message: 'User assigned successfully' });

      jest.spyOn(projectService, 'assignUserToProjectWithRole').mockResolvedValue(expectedResponse);

      const result = await projectController.assignUserToProject(projectId, role, username);
      expect(result).toEqual(expectedResponse);
      expect(projectService.assignUserToProjectWithRole).toHaveBeenCalledWith(username, projectId, role);
    });

    it('should handle errors when assigning a user to a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001';
      const role = 'developer';
      const username = 'testuser';
      const expectedResponse = Response.error('An error occurred while assigning the user to the project', 500);

      jest.spyOn(projectService, 'assignUserToProjectWithRole').mockRejectedValue(new Error('Assignment error'));

      const result = await projectController.assignUserToProject(projectId, role, username);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getProjectsByUserId', () => {
    it('should get projects for a user', async () => {
      const user = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const expectedProjects = [
        { id: '1', name: 'Project 1' },
        { id: '2', name: 'Project 2' },
      ];
      const expectedResponse = Response.success(expectedProjects);

      jest.spyOn(projectService, 'getProjectsByUserId').mockResolvedValue(expectedResponse);

      const result = await projectController.getProjectsByUserId(user);
      expect(result).toEqual(expectedResponse);
      expect(projectService.getProjectsByUserId).toHaveBeenCalledWith(user.userId);
    });

    it('should handle errors when getting projects for a user', async () => {
      const user = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const expectedResponse = Response.error('An error occurred while retrieving the projects', 500);

      jest.spyOn(projectService, 'getProjectsByUserId').mockRejectedValue(new Error('Database error'));

      const result = await projectController.getProjectsByUserId(user);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUsersForProject', () => {
    it('should get users for a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001';
      const expectedUsers = [
        { id: '1', username: 'user1' },
        { id: '2', username: 'user2' },
      ];
      const expectedResponse = Response.success(expectedUsers);

      jest.spyOn(projectService, 'getUsersForProject').mockResolvedValue(expectedResponse);

      const result = await projectController.getUsersForProject(projectId);
      expect(result).toEqual(expectedResponse);
      expect(projectService.getUsersForProject).toHaveBeenCalledWith(projectId);
    });
  });

  describe('handleTaskMessages', () => {
    it('should handle TASK_UPDATED message', async () => {
      const messageData = {
        action: 'TASK_UPDATED',
        taskId: '123',
        update: { status: 'completed' },
        projectId: '456',
      };

      await projectController.handleTaskMessages(messageData);
      expect(projectGateway.sendTaskUpdate).toHaveBeenCalledWith(messageData.projectId, messageData.taskId, messageData.update);
    });
  });
});