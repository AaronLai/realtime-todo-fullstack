import { Injectable, Inject } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Project } from '@data/entities/project.entity';
import { User } from '@data/entities/user.entity';
import { Role } from '@data/entities/role.entity';
import { UserProjectRole } from '@data/entities/user-project-role.entity';
import { DataService } from '@data/data.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
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

  /**
   * Creates a new project and assigns the default role to the creator
   * @param createProjectDto - DTO containing project creation data
   * @returns The created project
   */
  async createProjectAndAssignRole(createProjectDto: CreateProjectDto): Promise<Project> {
    return this.entityManager.transaction(async transactionalEntityManager => {
      // Find the user creating the project
      const user = await transactionalEntityManager.findOne(User, { where: { id: createProjectDto.createdBy } });
      if (!user) throw new Error('User not found');

      // Create and save the new project
      const project = new Project();
      project.name = createProjectDto.name;
      project.description = createProjectDto.description;
      project.createdBy = user;
      const savedProject = await transactionalEntityManager.save(Project, project);

      // Get the default project role from configuration
      const defaultRoleName = this.configService.get<string>('DEFAULT_PROJECT_ROLE');
      if (!defaultRoleName) throw new Error('Default project role not configured');

      // Find the default role
      const role = await transactionalEntityManager.findOne(Role, { where: { name: defaultRoleName } });
      if (!role) throw new Error(`Default role '${defaultRoleName}' not found`);

      // Create and save the user-project-role relationship
      const userProjectRole = new UserProjectRole();
      userProjectRole.user = user;
      userProjectRole.project = savedProject;
      userProjectRole.role = role;
      userProjectRole.createdAt = userProjectRole.updatedAt = new Date();
      userProjectRole.createdById = user.id;
      await transactionalEntityManager.save(UserProjectRole, userProjectRole);

      // Clean up the project object before returning
      savedProject.createdById = user.id;
      delete savedProject.createdBy;
      return savedProject;
    });
  }

  /**
   * Assigns a user to a project with a specific role
   * @param userId - ID of the user performing the action
   * @param username - Username of the user to be assigned
   * @param projectId - ID of the project
   * @param role - Name of the role to be assigned
   */
  async assignUserToProjectWithRole(userId: string, username: string, projectId: string, role: string): Promise<void> {
    await this.entityManager.transaction(async transactionalEntityManager => {
      // Find the user to be assigned
      const user = await transactionalEntityManager.findOne(User, { where: { username } });
      if (!user) throw new Error('User not found');

      // Find the project
      const project = await transactionalEntityManager.findOne(Project, { where: { id: projectId } });
      if (!project) throw new Error('Project not found');

      // Check if the user is already assigned to the project
      const existingAssignment = await transactionalEntityManager.findOne(UserProjectRole, {
        where: { user: { username }, project: { id: projectId } }
      });
      if (existingAssignment) throw new Error('User is already assigned to this project');

      // Find the specified role
      const specifiedRole = await transactionalEntityManager.findOne(Role, { where: { name: role } });
      if (!specifiedRole) throw new Error(`Role "${role}" not found`);

      // Create and save the new user-project-role relationship
      const userProjectRole = new UserProjectRole();
      userProjectRole.user = user;
      userProjectRole.project = project;
      userProjectRole.role = specifiedRole;
      userProjectRole.createdAt = userProjectRole.updatedAt = new Date();
      userProjectRole.createdById = userId;
      await transactionalEntityManager.save(UserProjectRole, userProjectRole);

      // Emit an event for project assignment
      this.client.emit(rabbitmqConfig.routingKeys.projectRouting, { action: "PROJECT_ASSIGNED", projectId, userId: user.id });
    });
  }

  /**
   * Retrieves a project by its ID
   * @param id - Project ID
   * @returns The found project
   */
  async getProject(id: string): Promise<Project> {
    const project = await this.dataService.findProject(id);
    if (!project) throw new Error('Project not found');
    return project;
  }

  /**
   * Updates a project
   * @param id - Project ID
   * @param projectData - Partial project data to update
   * @returns The updated project
   */
  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const updatedProject = await this.dataService.updateProject(id, projectData);
    if (!updatedProject) throw new Error('Project not found');
    
    // Emit an event for project update
    this.client.emit('project_updated', { projectId: id, update: updatedProject });
    return updatedProject;
  }

  /**
   * Deletes a project
   * @param id - Project ID
   */
  async deleteProject(id: string): Promise<void> {
    await this.dataService.deleteProject(id);
  }

  /**
   * Retrieves all projects for a given user
   * @param userId - User ID
   * @returns Array of projects with roles
   */
  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const user = await this.entityManager.findOne(User, { where: { id: userId } });
    if (!user) throw new Error('User not found');

    const userProjectRoles = await this.entityManager.find(UserProjectRole, {
      where: { user: { id: userId } },
      relations: ['project', 'role'],
      order: { project: { createdAt: 'ASC' } } 
    });

    return userProjectRoles.map(upr => ({
      ...upr.project,
      role: upr.role.name
    }));
  }

  /**
   * Retrieves all users for a given project
   * @param projectId - Project ID
   * @returns Array of users with their roles in the project
   */
  async getUsersForProject(projectId: string): Promise<{ id: string; username: string; role: string }[]> {
    const project = await this.entityManager.findOne(Project, { where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    const userProjectRoles = await this.entityManager.find(UserProjectRole, {
      where: { project: { id: projectId } },
      relations: ['user', 'role'],
      order: { user: { username: 'ASC' } }
    });

    return userProjectRoles.map(upr => ({
      id: upr.user.id,
      username: upr.user.username,
      role: upr.role.name
    }));
  }
}