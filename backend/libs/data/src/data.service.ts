import { Injectable } from '@nestjs/common';
import { UserEntityService } from './services/userEntity.services';
import { User } from './entities/user.entity';

@Injectable()
export class DataService {
    constructor(
      private userService: UserEntityService,
     
    ) {}


  // User methods
  async findUser(username: string): Promise<User> {
    return this.userService.findUser(username);
  }



}