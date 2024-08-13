import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { DataService } from '@data/data.service';
import { Response } from '@utils/response';
import { Project } from '@data/entities/project.entity';
import { rabbitmqConfig } from '@shared';
import { User } from '@data/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(private dataService: DataService) { }



  async createProject(projectData: Partial<Project>): Promise<Response> {
    try {
      const project = await this.dataService.createProject(projectData);
      return Response.success(project, 201);
    } catch (error) {
      return Response.error('Failed to create project', 500);
    }
  }

  async getProject(id: string): Promise<Response> {
    try {
      const project = await this.dataService.findProject(id);
      if (!project) {
        return Response.notFound('Project not found');
      }
      return Response.success(project);
    } catch (error) {
      return Response.error('Failed to fetch project', 500);
    }
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Response> {
    try {
      const updatedProject = await this.dataService.updateProject(id, projectData);
      if (!updatedProject) {
        return Response.notFound('Project not found');
      }
      return Response.success(updatedProject);
    } catch (error) {
      return Response.error('Failed to update project', 500);
    }
  }

  async deleteProject(id: string): Promise<Response> {
    try {
      await this.dataService.deleteProject(id);
      return Response.success('Project deleted successfully');
    } catch (error) {
      return Response.error('Failed to delete project', 500);
    }
  }

  async getAllProjects(): Promise<Response> {
    try {
      const projects = await this.dataService.getAllProjects();
      return Response.success(projects);
    } catch (error) {
      return Response.error('Failed to fetch projects', 500);
    }
  }
}
