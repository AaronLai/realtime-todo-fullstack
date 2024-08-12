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
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'This is a test project',
      };
      const expectedResponse = Response.success({ id: 1, ...createProjectDto }, 201);

      jest.spyOn(projectService, 'createProject').mockResolvedValue(expectedResponse);

      const result = await projectController.createProject(createProjectDto);
      expect(result).toEqual(expectedResponse);
      expect(projectService.createProject).toHaveBeenCalledWith(createProjectDto);
    });
  });

  describe('getProject', () => {
    it('should get a project by id', async () => {
      const projectId = 1;
      const expectedResponse = Response.success({ 
        id: projectId, 
        name: 'Test Project', 
        description: 'This is a test project' 
      });

      jest.spyOn(projectService, 'getProject').mockResolvedValue(expectedResponse);

      const result = await projectController.getProject(projectId);
      expect(result).toEqual(expectedResponse);
      expect(projectService.getProject).toHaveBeenCalledWith(projectId);
    });

    it('should return not found for non-existent project', async () => {
      const projectId = 999;
      const expectedResponse = Response.notFound('Project not found');

      jest.spyOn(projectService, 'getProject').mockResolvedValue(expectedResponse);

      const result = await projectController.getProject(projectId);
      expect(result).toEqual(expectedResponse);
      expect(projectService.getProject).toHaveBeenCalledWith(projectId);
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = 1;
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

    it('should return not found for non-existent project', async () => {
      const projectId = 999;
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project',
        description: 'This is an updated project',
      };
      const expectedResponse = Response.notFound('Project not found');

      jest.spyOn(projectService, 'updateProject').mockResolvedValue(expectedResponse);

      const result = await projectController.updateProject(projectId, updateProjectDto);
      expect(result).toEqual(expectedResponse);
      expect(projectService.updateProject).toHaveBeenCalledWith(projectId, updateProjectDto); }); }); });


