import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { UserProjectRole } from './user-project-role.entity';
import { Task } from './task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @Column()
  createdById: string;

  @ManyToOne(() => User, user => user.createdProjects)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => UserProjectRole, userProjectRole => userProjectRole.project)
  userProjectRoles: UserProjectRole[];

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];
}
