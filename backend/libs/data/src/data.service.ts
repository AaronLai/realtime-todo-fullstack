import { Injectable } from '@nestjs/common';
import { ProjectEntityService } from './services/project.entity.service';
import { UserEntityService } from './services/user.entity.service';
import { TaskEntityService } from './services/task.entity.service';

import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { User } from './entities/user.entity';

@Injectable()
export class DataService {
  constructor(
    private projectEntityService: ProjectEntityService,
    private taskEntityService: TaskEntityService,
    private userEntityService: UserEntityService,
  ) {}
// User-related methods
async findUser(username: string): Promise<User> {
    return this.userEntityService.findUser(username);
}

async createUser(userData: Partial<User>): Promise<User> {
    return this.userEntityService.createUser(userData);
}

  // Project methods
  async createProject(projectData: Partial<Project>): Promise<Project> {
    return this.projectEntityService.createProject(projectData);
  }

  async findProject(id: string): Promise<Project> {
    return this.projectEntityService.findProject(id);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    return this.projectEntityService.updateProject(id, projectData);
  }

  async deleteProject(id: string): Promise<void> {
    return this.projectEntityService.deleteProject(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectEntityService.getAllProjects();
  }

  // Task methods
  async createTask(taskData: Partial<Task>): Promise<Task> {
    return this.taskEntityService.createTask(taskData);
  }

  async findTask(id: string): Promise<Task> {
    return this.taskEntityService.findTask(id);
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    return this.taskEntityService.updateTask(id, taskData);
  }

  async deleteTask(id: string): Promise<void> {
    return this.taskEntityService.deleteTask(id);
  }

  async findTasksByProject(projectId: string): Promise<Task[]> {
    return this.taskEntityService.findTasksByProject(projectId);
  }

  async findTasksByAssignedUser(userId: string): Promise<Task[]> {
    return this.taskEntityService.findTasksByAssignedUser(userId);
  }

  async findTasksByCreatedUser(userId: string): Promise<Task[]> {
    return this.taskEntityService.findTasksByCreatedUser(userId);
  }
}
