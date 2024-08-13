import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthService } from '@auth/auth/auth.service';
import { Response } from '@utils/response';
import { ErrorCodes } from '@utils/error-codes';
import { rabbitmqConfig } from '@shared';
import { EventPattern } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy  ) {}

   
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

    // If registration is successful, send a message to the project queue
    await this.sendNewUserProjectMessage(result.id);

    return Response.success(result, 200);
  }

  private async sendNewUserProjectMessage(userId: string): Promise<void> {
    const message = {
      userId,
      action: 'CREATE_DEFAULT_PROJECT'
    };

    this.projectClient.emit(
      rabbitmqConfig.routingKeys.projectRouting,
      message
    );
  }
}
