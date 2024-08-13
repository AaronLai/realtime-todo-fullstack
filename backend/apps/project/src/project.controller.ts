import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Response } from '@utils/response';
import { JwtAuthGuard } from '@auth/auth/jwt-auth.guard';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from './project.dto';
import { UserPayload } from '@auth/auth/auth.decorator';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'The project has been successfully created.', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createProject(@UserPayload() user: any, @Body() createProjectDto: CreateProjectDto): Promise<Response> {
    const projectWithCreator = {
      ...createProjectDto,
      createdBy: user.userId
    };
    return this.projectService.createProject(projectWithCreator);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'The project has been successfully retrieved.', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  async updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Response> {
    return this.projectService.updateProject(id, updateProjectDto);
  }
}
