import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import {CreateDateColumn, UpdateDateColumn } from 'typeorm';

import { User } from './user.entity';
import { UserProjectRole } from './user-project-role.entity';
import { Task } from './task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  

  @ManyToOne(() => User, user => user.createdProjects)
  createdBy: User;

  @OneToMany(() => UserProjectRole, userProjectRole => userProjectRole.project)
  userProjectRoles: UserProjectRole[];

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];
}
