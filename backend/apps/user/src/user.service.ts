import { Injectable } from '@nestjs/common';
import { AuthService } from '@auth/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService
  ) {}



  async validateUser(username: string, password: string): Promise<any> {
    const result = await this.authService.validateUser(username,password);
    
      return result;
    
  }

}
