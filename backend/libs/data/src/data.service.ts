
import { Injectable } from '@nestjs/common';
import { UserEntityService } from './services/user.entity.services';
import { ProjectEntityService } from './services/project.entity.service';
import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';

@Injectable()
export class DataService {
    constructor(
      private userService: UserEntityService,
      private projectService: ProjectEntityService,
    ) {}

    // User-related methods
    async findUser(username: string): Promise<User> {
        return this.userService.findUser(username);
    }

    async createUser(userData: Partial<User>): Promise<User> {
        return this.userService.createUser(userData);
    }

    // Project-related methods
    async findProject(id: number): Promise<Project> {
        return this.projectService.findProject(id);
    }

    async createProject(project: Partial<Project>): Promise<Project> {
        return this.projectService.createProject(project);
    }

    async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
        return this.projectService.updateProject(id, projectData);
    }

    async deleteProject(id: number): Promise<void> {
        return this.projectService.deleteProject(id);
    }

    async getAllProjects(): Promise<Project[]> {
        return this.projectService.getAllProjects();
    }
}
