import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Role } from './role.entity';

@Entity('user_project_roles')
export class UserProjectRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.userProjectRoles)
  user: User;

  @ManyToOne(() => Project, project => project.userProjectRoles)
  project: Project;

  @ManyToOne(() => Role, role => role.userProjectRoles)
  role: Role;
}
