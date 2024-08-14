import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserProjectRole } from './user-project-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @OneToMany(() => UserProjectRole, userProjectRole => userProjectRole.role)
  userProjectRoles: UserProjectRole[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];
}
