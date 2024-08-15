import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectGateway } from './project.gateway';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Response } from '@utils/response';
import { Project } from '@data/entities/project.entity';
import { User } from '@data/entities/user.entity';
function createMockProject(partial: Partial<Project> = {}): Project {
  return {
    id: '1',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: '1',
    createdBy: { id: '1', username: 'testuser' } as User,
    userProjectRoles: [],
    tasks: [],
    ...partial
  };
}

function createMockUserWithRole(partial: Partial<{ id: string; username: string; role: string }> = {}): { id: string; username: string; role: string } {
  return {
    id: '1',
    username: 'testuser',
    role: 'MEMBER',
    ...partial
  };
}

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectService: jest.Mocked<ProjectService>;
  let projectGateway: jest.Mocked<ProjectGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            createProjectAndAssignRole: jest.fn(),
            assignUserToProjectWithRole: jest.fn(),
            getProjectsByUserId: jest.fn(),
            updateProject: jest.fn(),
            getUsersForProject: jest.fn(),
          },
        },
        {
          provide: ProjectGateway,
          useValue: {
            sendProjectAssignedUpdate: jest.fn(),
            sendTaskUpdate: jest.fn(),
            sendTaskDelete: jest.fn(),
            sendTaskAdded: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    projectService = module.get(ProjectService) as jest.Mocked<ProjectService>;
    projectGateway = module.get(ProjectGateway) as jest.Mocked<ProjectGateway>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProject', () => {
    it('should create a project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        createdBy: '1',
      };
      const user = { userId: '1' };
      const mockUser = { id: '1', username: 'testuser' } as User;
      const createdProject: Project = {
        id: '1',
        name: 'Test Project',
        description: 'Test Description',
        createdBy: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: '1',
        userProjectRoles: [],
        tasks: [],
      };

      projectService.createProjectAndAssignRole.mockResolvedValue(createdProject);

      const result = await controller.createProject(user, createProjectDto);

      expect(result).toEqual(Response.success(createdProject, 201));
      expect(projectService.createProjectAndAssignRole).toHaveBeenCalledWith({
        ...createProjectDto,
        createdBy: user.userId,
      });
    });

    it('should handle errors when creating a project', async () => {
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
        createdBy: '1',
      };
      const user = { userId: '1' };

      projectService.createProjectAndAssignRole.mockRejectedValue(new Error('Failed to create project'));

      const result = await controller.createProject(user, createProjectDto);

      expect(result).toEqual(Response.error('Failed to create project', 400));
    });
  });

  describe('assignUserToProject', () => {
    it('should assign a user to a project', async () => {
      const user = { userId: '1' };
      const projectId = '1';
      const role = 'MEMBER';
      const username = 'testuser';

      projectService.assignUserToProjectWithRole.mockResolvedValue();

      const result = await controller.assignUserToProject(user, projectId, role, username);

      expect(result).toEqual(Response.success('User successfully assigned to project'));
      expect(projectService.assignUserToProjectWithRole).toHaveBeenCalledWith(user.userId, username, projectId, role);
    });

    it('should handle errors when assigning a user to a project', async () => {
      const user = { userId: '1' };
      const projectId = '1';
      const role = 'MEMBER';
      const username = 'testuser';

      projectService.assignUserToProjectWithRole.mockRejectedValue(new Error('User assignment failed'));

      const result = await controller.assignUserToProject(user, projectId, role, username);

      expect(result).toEqual(Response.error('User assignment failed', 400));
    });
  });

  describe('getProjectsByUserId', () => {
    it('should get projects for a user', async () => {
      const user = { userId: '1' };
      const mockUser = { id: '1', username: 'testuser' } as User;
      const projects: Project[] = [
        {
          id: '1',
          name: 'Project 1',
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: '1',
          createdBy: mockUser,
          userProjectRoles: [],
          tasks: [],
        },
        {
          id: '2',
          name: 'Project 2',
          description: 'Description 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: '1',
          createdBy: mockUser,
          userProjectRoles: [],
          tasks: [],
        },
      ];

      projectService.getProjectsByUserId.mockResolvedValue(projects);

      const result = await controller.getProjectsByUserId(user);

      expect(result).toEqual(Response.success(projects));
      expect(projectService.getProjectsByUserId).toHaveBeenCalledWith(user.userId);
    });

    it('should handle errors when getting projects', async () => {
      const user = { userId: '1' };
      const error = new Error('Failed to fetch projects');

      projectService.getProjectsByUserId.mockRejectedValue(error);

      const result = await controller.getProjectsByUserId(user);

      expect(result).toEqual(Response.error('Failed to fetch projects', 400));
    });
  });
  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = '1';
      const updateProjectDto: UpdateProjectDto = { name: 'Updated Project' };
      const updatedProject = createMockProject({ name: 'Updated Project' });
  
      projectService.updateProject.mockResolvedValue(updatedProject);
  
      const result = await controller.updateProject(projectId, updateProjectDto);
  
      expect(result).toEqual(Response.success(updatedProject));
      expect(projectService.updateProject).toHaveBeenCalledWith(projectId, updateProjectDto);
    });
  
    it('should handle errors when updating a project', async () => {
      const projectId = '1';
      const updateProjectDto: UpdateProjectDto = { name: 'Updated Project' };
  
      projectService.updateProject.mockRejectedValue(new Error('Project not found'));
  
      const result = await controller.updateProject(projectId, updateProjectDto);
  
      expect(result).toEqual(Response.error('Project not found', 404));
    });
  });
  describe('getUsersForProject', () => {
    it('should get users for a project', async () => {
      const projectId = '1';
      const users = [
        createMockUserWithRole({ id: '1', username: 'user1', role: 'ADMIN' }),
        createMockUserWithRole({ id: '2', username: 'user2', role: 'MEMBER' })
      ];
  
      projectService.getUsersForProject.mockResolvedValue(users);
  
      const result = await controller.getUsersForProject(projectId);
  
      expect(result).toEqual(Response.success(users));
      expect(projectService.getUsersForProject).toHaveBeenCalledWith(projectId);
    });
  
    it('should handle errors when getting users for a project', async () => {
      const projectId = '1';
  
      projectService.getUsersForProject.mockRejectedValue(new Error('Project not found'));
  
      const result = await controller.getUsersForProject(projectId);
  
      expect(result).toEqual(Response.error('Project not found', 404));
    });
  });

  describe('handleProjectMessages', () => {
    it('should handle CREATE_DEFAULT_PROJECT message', async () => {
      const data = { action: 'CREATE_DEFAULT_PROJECT', userId: '1' };
      const mockUser = { id: '1', username: 'testuser' } as User;
      const createdProject: Project = {
        id: '1',
        name: 'Todo List',
        description: 'This is your first todolist',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: '1',
        createdBy: mockUser,
        userProjectRoles: [],
        tasks: [],
      };

      projectService.createProjectAndAssignRole.mockResolvedValue(createdProject);

      await controller.handleProjectMessages(data);

      expect(projectService.createProjectAndAssignRole).toHaveBeenCalledWith({
        name: 'Todo List',
        description: 'This is your first todolist',
        createdBy: '1',
      });
    });

    it('should handle PROJECT_ASSIGNED message', async () => {
      const data = { action: 'PROJECT_ASSIGNED', projectId: '1', userId: '1' };

      await controller.handleProjectMessages(data);

      expect(projectGateway.sendProjectAssignedUpdate).toHaveBeenCalledWith('1', '1');
    });
  });

  describe('handleTaskUpdateEvent', () => {
    it('should handle TASK_UPDATED message', async () => {
      const data = { action: 'TASK_UPDATED', taskId: '1', update: {}, projectId: '1' };

      await controller.handleTaskUpdateEvent(data);

      expect(projectGateway.sendTaskUpdate).toHaveBeenCalledWith('1', '1', {});
    });

    it('should handle TASK_DELETED message', async () => {
      const data = { action: 'TASK_DELETED', taskId: '1', update: {}, projectId: '1' };

      await controller.handleTaskUpdateEvent(data);

      expect(projectGateway.sendTaskDelete).toHaveBeenCalledWith('1', '1', {});
    });

    it('should handle TASK_ADDED message', async () => {
      const data = { action: 'TASK_ADDED', taskId: '1', update: {}, projectId: '1' };

      await controller.handleTaskUpdateEvent(data);

      expect(projectGateway.sendTaskAdded).toHaveBeenCalledWith('1', '1', {});
    });
  });
});