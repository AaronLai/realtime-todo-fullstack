import { Injectable } from '@nestjs/common';
import { DataService } from '@data/data/data.service';

@Injectable()
export class AuthService {
  constructor(
    private dataService: DataService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.dataService.findUser(username);
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

//   async login(user: any) {
//     const payload = { username: user.username, sub: user.userId };
//     return {
//       access_token: this.jwtService.sign(payload),
//     };
//   }
}