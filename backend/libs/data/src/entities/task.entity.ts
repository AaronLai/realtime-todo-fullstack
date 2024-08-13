import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column()
  priority: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.tasks)
  project: Project;

  @ManyToOne(() => User, user => user.assignedTasks)
  assignedTo: User;

  @ManyToOne(() => User, user => user.createdTasks)
  createdBy: User;
}
