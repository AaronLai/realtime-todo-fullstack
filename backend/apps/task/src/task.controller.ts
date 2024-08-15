import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { Response } from '@utils/response';
import { JwtAuthGuard } from '@auth/auth/jwt-auth.guard';
import { UserPayload } from '@auth/auth/auth.decorator';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto, TaskStatus } from './task.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'The task has been successfully created.', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createTask(@UserPayload() user: any, @Body() taskData: CreateTaskDto): Promise<Response> {
    try {
      const taskWithCreator = {
        ...taskData,
        status: TaskStatus.TODO,
        createdById: user.userId,
      };
      const task = await this.taskService.createTask(taskWithCreator);
      return Response.success(task, 201);
    } catch (error) {
      return Response.error(error.message, 400);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'The task has been successfully retrieved.', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTask(@Param('id') id: string): Promise<Response> {
    try {
      const task = await this.taskService.getTask(id);
      return Response.success(task);
    } catch (error) {
      return Response.error(error.message, 404);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'The task has been successfully updated.', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateTask(@Param('id') id: string, @Body() taskData: UpdateTaskDto): Promise<Response> {
    try {
      const updatedTask = await this.taskService.updateTask(id, taskData);
      return Response.success(updatedTask);
    } catch (error) {
      return Response.error(error.message, 404);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: 'string', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'The task has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteTask(@Param('id') id: string): Promise<Response> {
    try {
      await this.taskService.deleteTask(id);
      return Response.success('Task deleted successfully');
    } catch (error) {
      return Response.error(error.message, 404);
    }
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get tasks by project' })
  @ApiParam({ name: 'projectId', type: 'string', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'The tasks have been successfully retrieved.', type: [TaskResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTasksByProject(@Param('projectId') projectId: string): Promise<Response> {
    try {
      const tasks = await this.taskService.getTasksByProject(projectId);
      return Response.success(tasks);
    } catch (error) {
      return Response.error(error.message, 400);
    }
  }
}