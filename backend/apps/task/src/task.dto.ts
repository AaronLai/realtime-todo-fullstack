// backend/apps/task/src/dto/task.dto.ts

import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsArray } from 'class-validator';

// backend/apps/task/src/enums/task-enums.ts

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED'
  }
  
  export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
  }
  
export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsDateString()
  dueDate: Date;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsUUID()
  createdById: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}

export class TaskResponseDto {
    @IsUUID()
    id: string;
  
    @IsString()
    name: string;
  
    @IsString()
    description: string;
  
    @IsEnum(TaskStatus)
    status: TaskStatus;
  
    @IsDateString()
    dueDate: Date;
  
    @IsArray()
    tags: string[];
  
    @IsEnum(TaskPriority)
    priority: TaskPriority;
  
    @IsUUID()
    projectId: string;
  
    @IsUUID()
    assignedToId: string | null;
  
    @IsUUID()
    createdById: string;
  
    @IsDateString()
    createdAt: Date;
  
    @IsDateString()
    updatedAt: Date;
  }