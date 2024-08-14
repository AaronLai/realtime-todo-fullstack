import { Injectable } from '@nestjs/common';
import { RoleEntityService } from '../services/role.entity.service';

@Injectable()
export class RoleSeeder {
  constructor(private readonly roleEntityService: RoleEntityService) {}

  async seed() {
    const roles = [
      { name: 'Admin', description: 'Administrator with full access for the project' },
      { name: 'Member', description: 'Participates in projects and completes assigned tasks' },
      { name: 'Viewer', description: 'Can only view project information' },
    ];

    for (const role of roles) {
      const existingRole = await this.roleEntityService.getRoleByName(role.name);
      if (!existingRole) {
        await this.roleEntityService.createRole(role);
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }
  }
}