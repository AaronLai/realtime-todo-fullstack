import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../entities/role.entity";

@Injectable()
export class RoleEntityService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findRole(id: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { id } });
  }

  async createRole(role: Partial<Role>): Promise<Role> {
    return this.roleRepository.save(role);
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    await this.roleRepository.update(id, roleData);
    return this.findRole(id);
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async getRoleWithRelations(id: string): Promise<Role> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['userProjectRoles', 'rolePermissions'],
    });
  }

  async getRoleByName(name: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { name } });
  }
}