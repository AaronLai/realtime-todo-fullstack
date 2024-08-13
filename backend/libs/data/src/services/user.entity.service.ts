import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

// user.service.ts
@Injectable()
export class UserEntityService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findUser(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createUser(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  // Add other user-related methods...
}