import { Injectable, Inject } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Response } from '@utils/response';
import { Project } from '@data/entities/project.entity';
import { User } from '@data/entities/user.entity';
import { Role } from '@data/entities/role.entity';
import { UserProjectRole } from '@data/entities/user-project-role.entity';
import { DataService } from '@data/data.service';
import { CreateProjectDto } from './project.dto';
import { ClientProxy } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';

@Injectable()
export class ProjectService {
  constructor(
    private entityManager: EntityManager,
    private configService: ConfigService,
    private dataService: DataService,
    @Inject('PROJECT_SERVICE') private readonly client: ClientProxy,

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
        userProjectRole.createdAt = new Date();
        userProjectRole.updatedAt = new Date();
        userProjectRole.createdById = user.id;

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


  async assignUserToProjectWithRole(userId:string,  username: string, projectId: string, role: string): Promise<Response> {
    return await this.entityManager.transaction(async transactionalEntityManager => {
      try {
        // Fetch user
        const user = await transactionalEntityManager.findOne(User, { where: { username: username } });
        if (!user) {
          return Response.notFound('User not found');
        }
  
        // Fetch project
        const project = await transactionalEntityManager.findOne(Project, { where: { id: projectId } });
        if (!project) {
          return Response.notFound('Project not found');
        }
  
        // Check if user is already assigned to the project
        const existingAssignment = await transactionalEntityManager.findOne(UserProjectRole, {
          where: { user: { username: username }, project: { id: projectId } }
        });
        if (existingAssignment) {
          return Response.error('User is already assigned to this project', 400);
        }
  
        // Find the specified role
        const specifiedRole = await transactionalEntityManager.findOne(Role, { where: { name: role } });
        if (!specifiedRole) {
          return Response.error(`Role "${role}" not found`, 400);
        }
  
        // Create UserProjectRole
        const userProjectRole = new UserProjectRole();
        userProjectRole.user = user;
        userProjectRole.project = project;
        userProjectRole.role = specifiedRole;
        userProjectRole.createdAt = new Date();
        userProjectRole.updatedAt = new Date();
        userProjectRole.createdById = userId;
  
        await transactionalEntityManager.save(UserProjectRole, userProjectRole);
        this.client.emit(rabbitmqConfig.routingKeys.projectRouting, { action :"PROJECT_ASSIGNED",projectId: projectId , userId: user.id  });

        return Response.success(`User successfully assigned to project with role "${role}"`);
      } catch (error) {
        console.error('Error in assignUserToProject:', error);
        return Response.error('Failed to assign user to project', 500);
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
      
      // Emit event to RabbitMQ
      this.client.emit('project_updated', { projectId: id, update: updatedProject });

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
  async getUsersForProject(projectId: string): Promise<Response> {
    try {
      const project = await this.entityManager.findOne(Project, { where: { id: projectId } });
      
      if (!project) {
        return Response.notFound('Project not found');
      }
  
      const userProjectRoles = await this.entityManager.find(UserProjectRole, {
        where: { project: { id: projectId } },
        relations: ['user', 'role'],
        order: { user: { username: 'ASC' } }
      });
  
      const users = userProjectRoles.map(upr => ({
        id: upr.user.id,
        username: upr.user.username,
        role: upr.role.name
      }));
  
      return Response.success(users);
    } catch (error) {
      console.error('Error in getUsersForProject:', error);
      return Response.error('Failed to fetch users for the project', 500);
    }
  }
  
  
}