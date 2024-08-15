import { Injectable, Inject } from '@nestjs/common';
import { DataService } from '@data/data.service';
import { Response } from '@utils/response';
import { Task } from '@data/entities/task.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TaskService {
  constructor(private dataService: DataService,  
     @Inject('PROJECT_SERVICE') private readonly client: ClientProxy
) {}

  async createTask(taskData: Partial<Task>): Promise<Response> {
    console.log('TaskService -> createTask -> taskData', taskData);
    try {
      const task = await this.dataService.createTask(taskData);

      this.client.emit('task_updated', { 
        action :'TASK_ADDED' ,
        taskId: task.id, 
        update: task,
        projectId: task.projectId // Assuming task has a projectId field
      });



      return Response.success(task, 201);
    } catch (error) {
      console.log('TaskService -> createTask -> error', error);

      return Response.error(error, 500);
    }
  }

  async getTask(id: string): Promise<Response> {
    try {
      const task = await this.dataService.findTask(id);
      if (!task) {
        return Response.notFound('Task not found');
      }
      return Response.success(task);
    } catch (error) {
      return Response.error('Failed to fetch task', 500);
    }
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Response> {
    try {
      const updatedTask = await this.dataService.updateTask(id, taskData);
      if (!updatedTask) {
        return Response.notFound('Task not found');
      }
           // Emit an event to RabbitMQ
           this.client.emit('task_updated', { 
            action :'TASK_UPDATED' ,
            taskId: id, 
            update: updatedTask,
            projectId: updatedTask.projectId // Assuming task has a projectId field
          });


      return Response.success(updatedTask);
    } catch (error) {
      return Response.error('Failed to update task', 500);
    }
  }

  async deleteTask(id: string): Promise<Response> {
    try {
      const task = await this.dataService.findTask(id);
      await this.dataService.deleteTask(id);

          // Emit an event to RabbitMQ
          this.client.emit('task_updated', { 
            action :'TASK_DELETED' ,
            taskId: id, 
            update:task,
            projectId: task.projectId // Assuming task has a projectId field
          });
      return Response.success('Task deleted successfully');
    } catch (error) {
      return Response.error('Failed to delete task', 500);
    }
  }

  async getTasksByProject(projectId: string): Promise<Response> {
    try {
      const tasks = await this.dataService.findTasksByProject(projectId);
      return Response.success(tasks);
    } catch (error) {
      return Response.error('Failed to fetch tasks by project', 500);
    }
  }

  async getTasksByAssignedUser(userId: string): Promise<Response> {
    try {
      const tasks = await this.dataService.findTasksByAssignedUser(userId);
      return Response.success(tasks);
    } catch (error) {
      return Response.error('Failed to fetch tasks by assigned user', 500);
    }
  }

  async getTasksByCreatedUser(userId: string): Promise<Response> {
    try {
      const tasks = await this.dataService.findTasksByCreatedUser(userId);
      return Response.success(tasks);
    } catch (error) {
      return Response.error('Failed to fetch tasks by created user', 500);
    }
  }
}
