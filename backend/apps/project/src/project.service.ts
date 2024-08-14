import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Response } from '@utils/response';
import { Project } from '@data/entities/project.entity';
import { User } from '@data/entities/user.entity';
import { Role } from '@data/entities/role.entity';
import { UserProjectRole } from '@data/entities/user-project-role.entity';
import { DataService } from '@data/data.service';
import { CreateProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    private entityManager: EntityManager,
    private configService: ConfigService,
    private dataService: DataService
  ) {}

  async createProjectAndAssignRole(
    createProjectDto: CreateProjectDto
  ): Promise<Project | null> {
    return await this.entityManager.transaction(async transactionalEntityManager => {
      try {


        // Fetch user
        const user = await transactionalEntityManager.findOne(User, { where: { id: createProjectDto.createdBy } });

        if (!user) {
          throw new Error('User not found');
        }

        // Create project
        
        const project = new Project();
        project.name = createProjectDto.name;
        project.description = createProjectDto.description;
        project.createdBy = user;
        // Add other properties as needed
        let savedProject = await transactionalEntityManager.save(Project, project);


        

        // Get default role name from environment
        const defaultRoleName = this.configService.get<string>('DEFAULT_PROJECT_ROLE');
        if (!defaultRoleName) {
          throw new Error('Default project role not configured');
        }

        // Find the role by name
        const role = await transactionalEntityManager.findOne(Role, { where: { name: defaultRoleName } });

        if (!role) {
          throw new Error(`Default role '${defaultRoleName}' not found`);
        }

        // Create UserProjectRole
        const userProjectRole = new UserProjectRole();
        userProjectRole.user = user;
        userProjectRole.project = savedProject;
        userProjectRole.role = role;

        await transactionalEntityManager.save(UserProjectRole, userProjectRole);
      savedProject.createdById = user.id;
      delete savedProject.createdBy;
        return savedProject;
    } catch (error) {
        // If any error occurs, the transaction will be rolled back automatically
        return null;
    }
    });
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


  async getProjectsByUserId(userId: string): Promise<Project[] | Error> {
    try {
      const user = await this.entityManager.findOne(User, { where: { id: userId } });
      
      if (!user) {
        throw new Error('User not found');
      }
  
  
      const userProjectRoles = await this.entityManager.find(UserProjectRole, {
        where: { user: { id: userId } },
        relations: ['project', 'role'],
        order: { project: { createdAt: 'ASC' } } 
      });
  
      const projects = userProjectRoles.map(upr => ({
        ...upr.project,
        role: upr.role.name
      }));
  
      return projects;
    } catch (error) {
      console.error('Error in getProjectsByUserId:', error);
      return error instanceof Error ? error : new Error('An error occurred while fetching projects');
    }
  }
  
  
}