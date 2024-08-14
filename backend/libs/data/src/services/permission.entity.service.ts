import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "../entities/permission.entity";

@Injectable()
export class PermissionEntityService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findPermission(id: number): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { id } });
  }

  async createPermission(permission: Partial<Permission>): Promise<Permission> {
    return this.permissionRepository.save(permission);
  }

  async updatePermission(id: number, permissionData: Partial<Permission>): Promise<Permission> {
    await this.permissionRepository.update(id, permissionData);
    return this.findPermission(id);
  }

  async deletePermission(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async getPermissionWithRelations(id: number): Promise<Permission> {
    return this.permissionRepository.findOne({
      where: { id },
      relations: ['rolePermissions'],
    });
  }

  async getPermissionByName(name: string): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { name } });
  }
}
