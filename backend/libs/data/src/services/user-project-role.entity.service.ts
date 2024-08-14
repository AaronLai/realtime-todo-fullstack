import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserProjectRole } from "../entities/user-project-role.entity";
import { User } from "../entities/user.entity";
import { Project } from "../entities/project.entity";
import { Role } from "../entities/role.entity";

@Injectable()
export class UserProjectRoleEntityService {
  constructor(
    @InjectRepository(UserProjectRole)
    private userProjectRoleRepository: Repository<UserProjectRole>,
  ) {}

  async findUserProjectRole(id: string): Promise<UserProjectRole> {
    return this.userProjectRoleRepository.findOne({ where: { id } });
  }

  async createUserProjectRole(userProjectRole: Partial<UserProjectRole>): Promise<UserProjectRole> {
    return this.userProjectRoleRepository.save(userProjectRole);
  }

  async updateUserProjectRole(id: string, userProjectRoleData: Partial<UserProjectRole>): Promise<UserProjectRole> {
    await this.userProjectRoleRepository.update(id, userProjectRoleData);
    return this.findUserProjectRole(id);
  }

  async deleteUserProjectRole(id: number): Promise<void> {
    await this.userProjectRoleRepository.delete(id);
  }

  async getAllUserProjectRoles(): Promise<UserProjectRole[]> {
    return this.userProjectRoleRepository.find();
  }

  async getUserProjectRoleWithRelations(id: string): Promise<UserProjectRole> {
    return this.userProjectRoleRepository.findOne({
      where: { id },
      relations: ['user', 'project', 'role'],
    });
  }

  async getUserProjectRolesByUser(userId: string): Promise<UserProjectRole[]> {
    return this.userProjectRoleRepository.find({
      where: { user: { id: userId } },
      relations: ['project', 'role'],
    });
  }

  async getUserProjectRolesByProject(projectId: string): Promise<UserProjectRole[]> {
    return this.userProjectRoleRepository.find({
      where: { project: { id: projectId } },
      relations: ['user', 'role'],
    });
  }

  async getUserProjectRolesByRole(roleId: string): Promise<UserProjectRole[]> {
    return this.userProjectRoleRepository.find({
      where: { role: { id: roleId } },
      relations: ['user', 'project'],
    });
  }

  async assignUserToProjectWithRole(user: User, project: Project, role: Role): Promise<UserProjectRole> {
    const userProjectRole = new UserProjectRole();
    userProjectRole.user = user;
    userProjectRole.project = project;
    userProjectRole.role = role;
    return this.userProjectRoleRepository.save(userProjectRole);
  }
}
