import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../entities/task.entity";

@Injectable()
export class TaskEntityService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async findTask(id: string): Promise<Task> {
    return this.taskRepository.findOne({ where: { id } });
  }

  async createTask(task: Partial<Task>): Promise<Task> {
    return this.taskRepository.save(task);
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    await this.taskRepository.update(id, task);
    return this.findTask(id);
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }

  async findTasksByProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.find({ where: { project: { id: projectId } } });
  }

  async findTasksByAssignedUser(userId: string): Promise<Task[]> {
    return this.taskRepository.find({ where: { assignedTo: { id: userId } } });
  }

  async findTasksByCreatedUser(userId: string): Promise<Task[]> {
    return this.taskRepository.find({ where: { createdBy: { id: userId } } });
  }

}
