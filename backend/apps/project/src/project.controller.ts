import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Response } from '@utils/response';
import { JwtAuthGuard } from '@auth/auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './project.dto';
import { UserPayload } from '@auth/auth/auth.decorator';
import { EventPattern } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

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
      if (project) {
        return Response.success(project, 201);
      } else {
        return Response.error('Failed to create project', 400);
      }
    } catch (error) {
      return Response.error('An error occurred while creating the project', 500);
    }
  }

  @Post(':id/assign/:role')
  @ApiOperation({ summary: 'Assign a user to a project' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiBody({ schema: { type: 'object', properties: { username: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'The user has been successfully assigned to the project.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Project or User not found.' })
  @UseGuards(JwtAuthGuard)
  async assignUserToProject(
    @Param('id') projectId: string,
    @Param('role') role: string,
    @Body('username') username: string
  ): Promise<Response> {
    try {
      const result = await this.projectService.assignUserToProjectWithRole(username, projectId,role);
      return result;
    } catch (error) {
      return Response.error('An error occurred while assigning the user to the project', 500);
    }
  }



  @EventPattern(rabbitmqConfig.routingKeys.projectRouting)
  async handleProjectMessages(data: any) {
    console.log('Received project message:', data);
    if (data.action === 'CREATE_DEFAULT_PROJECT') {
      const projectWithCreator = {
        name: 'Todo List',
        description: 'This is a your first  todolist ',
        createdBy: data.userId
      };
      const project = await this.projectService.createProjectAndAssignRole(projectWithCreator);
    }
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)

  @ApiOperation({ summary: 'Get projects by user ID' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully.', type: [ProjectResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async getProjectsByUserId(@UserPayload() user: any): Promise<Response> {
    try {
      const projects = await this.projectService.getProjectsByUserId(user.userId);
      return Response.success(projects, 200);
    } catch (error) {
      return Response.error('An error occurred while retrieving the projects', 500);
    }
  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'The project has been successfully retrieved.', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)

  async getProject(@Param('id') id: string): Promise<Response> {
    return this.projectService.getProject(id);
  }

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
    return this.projectService.updateProject(id, updateProjectDto);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get users for a project' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Users for the project retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  async getUsersForProject(@Param('id') projectId: string): Promise<Response> {
    return this.projectService.getUsersForProject(projectId);
  }


  
}


