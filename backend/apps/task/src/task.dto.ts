// backend/apps/task/src/dto/task.dto.ts

import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsArray } from 'class-validator';

// backend/apps/task/src/enums/task-enums.ts

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In_Progress',
  DONE = 'Done'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}
  
export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(TaskStatus, { each: true })
  status: TaskStatus[];


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
  status?: TaskStatus[];

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
  
    @IsEnum(TaskStatus, { each: true })
    status: TaskStatus[];
  
  
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