import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { Response } from '@utils/response';

describe('ProjectController', () => {
  let projectController: ProjectController;
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            createProject: jest.fn(),
            getProject: jest.fn(),
            updateProject: jest.fn(),
          },
        },
      ],
    }).compile();

    projectController = module.get<ProjectController>(ProjectController);
    projectService = module.get<ProjectService>(ProjectService);
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const user = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'This is a test project',
        createdBy: null
      };
      const expectedResponse = Response.success({ id: '123e4567-e89b-12d3-a456-426614174001', ...createProjectDto, createdBy: user.userId }, 201);

      jest.spyOn(projectService, 'createProject').mockResolvedValue(expectedResponse);

      const result = await projectController.createProject(user, createProjectDto);
      expect(result).toEqual(expectedResponse);
      expect(projectService.createProject).toHaveBeenCalledWith({
        ...createProjectDto,
        createdBy: user.userId,
      });
    });

    it('should handle errors when creating a project', async () => {
      const user = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'This is a test project',
        createdBy: null
      };
      const expectedResponse = Response.error('Failed to create project');

      jest.spyOn(projectService, 'createProject').mockRejectedValue(new Error('Database error'));

      const result = await projectController.createProject(user, createProjectDto);
      expect(result).toEqual(expectedResponse);
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
      expect(result).toEqual(expectedResponse); expect(projectService.getProject).toHaveBeenCalledWith(projectId);
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = '123e4567-e89b-12d3-a456-426614174001'; const updateProjectDto: UpdateProjectDto = { name: 'Updated Project', description: 'This is an updated project', }; const expectedResponse = Response.success({ id: projectId, ...updateProjectDto });
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

      jest.spyOn(projectService, 'updateProject').mockRejectedValue(new Error('Database error'));

      const result = await projectController.updateProject(projectId, updateProjectDto);
      expect(result).toEqual(expectedResponse);
    });
  });
});