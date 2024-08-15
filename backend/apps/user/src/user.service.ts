import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthService } from '@auth/auth/auth.service';
import { ErrorCodes } from '@utils/error-codes';
import { rabbitmqConfig } from '@shared';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    @Inject('PROJECT_SERVICE') private projectClient: ClientProxy
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const result = await this.authService.validateUser(username, password);
    if ('error' in result) {
      throw new Error(result.error);
    }
    return result;
  }

  async registerUser(username: string, password: string): Promise<any> {
    const result = await this.authService.registerUser(username, password);
    if ('error' in result) {
      if (result.errorCode === ErrorCodes.USER_EXISTS) {
        throw new Error(result.error);
      }
      throw new Error(result.error);
    }

    await this.sendNewUserProjectMessage(result.id);
    return result;
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