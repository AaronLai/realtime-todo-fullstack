import { Injectable } from '@nestjs/common';
import { AuthService } from '@auth/auth/auth.service';
import { Response } from '@utils/response';
import { ErrorCodes } from '@utils/error-codes';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService
  ) {}

  async validateUser(username: string, password: string): Promise<Response> {
    const result = await this.authService.validateUser(username, password);
    if ('error' in result) {
      return Response.error(result.error, 400);
    }
    return Response.success(result);
  }

  async registerUser(username: string, password: string): Promise<Response> {
    const result = await this.authService.registerUser(username, password);
    if ('error' in result) {
      if (result.errorCode === ErrorCodes.USER_EXISTS) {
        return Response.badRequest(result.error);
      }
      return Response.error(result.error);
    }
    return Response.success(result, 200);
  }
}
