import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserProjectRole } from './user-project-role.entity';
import { Task } from './task.entity';
import { Project } from './project.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => UserProjectRole, userProjectRole => userProjectRole.user)
  userProjectRoles: UserProjectRole[];

  @OneToMany(() => Task, task => task.createdBy)
  createdTasks: Task[];

  @OneToMany(() => Task, task => task.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => Project, project => project.createdBy)
  createdProjects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
