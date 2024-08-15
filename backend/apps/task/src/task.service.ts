import { Injectable, Inject } from '@nestjs/common';
import { DataService } from '@data/data.service';
import { Task } from '@data/entities/task.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TaskService {
  constructor(
    private dataService: DataService,  
    @Inject('PROJECT_SERVICE') private readonly client: ClientProxy
  ) {}

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const task = await this.dataService.createTask(taskData);
    this.client.emit('task_updated', { 
      action: 'TASK_ADDED',
      taskId: task.id, 
      update: task,
      projectId: task.projectId
    });
    return task;
  }

  async getTask(id: string): Promise<Task> {
    const task = await this.dataService.findTask(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const updatedTask = await this.dataService.updateTask(id, taskData);
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    this.client.emit('task_updated', { 
      action: 'TASK_UPDATED',
      taskId: id, 
      update: updatedTask,
      projectId: updatedTask.projectId
    });
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.dataService.findTask(id);
    if (!task) {
      throw new Error('Task not found');
    }
    await this.dataService.deleteTask(id);
    this.client.emit('task_updated', { 
      action: 'TASK_DELETED',
      taskId: id, 
      update: task,
      projectId: task.projectId
    });
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    return this.dataService.findTasksByProject(projectId);
  }

  async getTasksByAssignedUser(userId: string): Promise<Task[]> {
    return this.dataService.findTasksByAssignedUser(userId);
  }

  async getTasksByCreatedUser(userId: string): Promise<Task[]> {
    return this.dataService.findTasksByCreatedUser(userId);
  }
}