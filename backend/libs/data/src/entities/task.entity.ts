import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
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

  @Column('text', { array: true })
  status: string[];

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

  @Column()
  projectId: string;

  @ManyToOne(() => Project, project => project.tasks)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column({ nullable: true })
  assignedToId: string | null;

  @ManyToOne(() => User, user => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User | null;

  @Column()
  createdById: string;

  @ManyToOne(() => User, user => user.createdTasks)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
}
