import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signin')
  async signin(@Body() credentials: { username: string; password: string }) {
    return this.userService.validateUser(credentials.username, credentials.password);
  }
}
