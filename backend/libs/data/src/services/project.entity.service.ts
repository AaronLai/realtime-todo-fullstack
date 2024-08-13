import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Project } from "../entities/project.entity";

@Injectable()
export class ProjectEntityService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findProject(id: string): Promise<Project> {
    return this.projectRepository.findOne({ where: { id } });
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    return this.projectRepository.save(project);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    await this.projectRepository.update(id, projectData);
    return this.findProject(id);
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  // Add other project-related methods as needed...
}