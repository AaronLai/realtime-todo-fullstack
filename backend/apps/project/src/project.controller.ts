import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Response } from '@utils/response';
import { JwtAuthGuard } from '@auth/auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './project.dto';
import { UserPayload } from '@auth/auth/auth.decorator';
import { EventPattern } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';
import { ProjectGateway } from './project.gateway';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectGateway: ProjectGateway
  ) {}

  // Create a new project
  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'The project has been successfully created.', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async createProject(@UserPayload() user: any, @Body() createProjectDto: CreateProjectDto): Promise<Response> {
    try {
      const projectWithCreator = {
        ...createProjectDto,
        createdBy: user.userId
      };
      const project = await this.projectService.createProjectAndAssignRole(projectWithCreator);
      return Response.success(project, 201);
    } catch (error) {
      return Response.error(error.message, 400);
    }
  }

  // Assign a user to a project with a specific role
  @Post(':id/assign/:role')
  @ApiOperation({ summary: 'Assign a user to a project' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiParam({ name: 'role', type: 'string', description: 'Role name' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'The user has been successfully assigned to the project.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Project or User not found.' })
  @UseGuards(JwtAuthGuard)
  async assignUserToProject(
    @UserPayload() user: any,
    @Param('id') projectId: string,
    @Param('role') role: string,
    @Body('username') username: string
  ): Promise<Response> {
    try {
      await this.projectService.assignUserToProjectWithRole(user.userId, username, projectId, role);
      return Response.success('User successfully assigned to project');
    } catch (error) {
      return Response.error(error.message, 400);
    }
  }

  // Get projects for the authenticated user
  @Get('mine')
  @ApiOperation({ summary: 'Get projects by user ID' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully.', type: [ProjectResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async getProjectsByUserId(@UserPayload() user: any): Promise<Response> {
    try {
      const projects = await this.projectService.getProjectsByUserId(user.userId);
      return Response.success(projects);
    } catch (error) {
      return Response.error(error.message, 400);
    }
  }

  // Update a project
  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'The project has been successfully updated.', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Response> {
    try {
      const updatedProject = await this.projectService.updateProject(id, updateProjectDto);
      return Response.success(updatedProject);
    } catch (error) {
      return Response.error(error.message, 404);
    }
  }

  // Get users for a specific project
  @Get(':id/users')
  @ApiOperation({ summary: 'Get users for a project' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Users for the project retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async getUsersForProject(@Param('id') projectId: string): Promise<Response> {
    try {
      const users = await this.projectService.getUsersForProject(projectId);
      return Response.success(users);
    } catch (error) {
      return Response.error(error.message, 404);
    }
  }

  // Handle project-related messages from RabbitMQ
  @EventPattern(rabbitmqConfig.routingKeys.projectRouting)
  async handleProjectMessages(data: any) {
    console.log('Received project message:', data);
    if (data.action === 'CREATE_DEFAULT_PROJECT') {
      try {
        const projectWithCreator = {
          name: 'Todo List',
          description: 'This is your first todolist',
          createdBy: data.userId
        };
        await this.projectService.createProjectAndAssignRole(projectWithCreator);
      } catch (error) {
        console.error('Failed to create default project:', error.message);
      }
    } else if (data.action === 'PROJECT_ASSIGNED') {
      const { projectId, userId } = data;
      this.projectGateway.sendProjectAssignedUpdate(projectId, userId);
    }
  }

  // Handle task update events
  @EventPattern('task_updated')
  async handleTaskUpdateEvent(data: any) {
    console.log('Received task message:', data);
    switch (data.action) {
      case 'TASK_UPDATED':
        this.projectGateway.sendTaskUpdate(data.projectId, data.taskId, data.update);
        break;
      case 'TASK_DELETED':
        this.projectGateway.sendTaskDelete(data.projectId, data.taskId, data.update);
        break;
      case 'TASK_ADDED':
        this.projectGateway.sendTaskAdded(data.projectId, data.taskId, data.update);
        break;
      default:
        console.warn('Unknown task action:', data.action);
    }
  }
}