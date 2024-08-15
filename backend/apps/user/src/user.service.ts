// Importing necessary dependencies and services
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

  // Method to validate user credentials
  async validateUser(username: string, password: string): Promise<any> {
    const result = await this.authService.validateUser(username, password);
    if ('error' in result) {
      throw new Error(result.error);
    }
    return result;
  }

  // Method to register a new user
  async registerUser(username: string, password: string): Promise<any> {
    const result = await this.authService.registerUser(username, password);
    if ('error' in result) {
      // Check if the error is due to an existing user
      if (result.errorCode === ErrorCodes.USER_EXISTS) {
        throw new Error(result.error);
      }
      throw new Error(result.error);
    }

    // Send a message to create a default project for the new user
    await this.sendNewUserProjectMessage(result.id);
    return result;
  }

  // Private method to send a message for creating a default project
  private async sendNewUserProjectMessage(userId: string): Promise<void> {
    const message = {
      userId,
      action: 'CREATE_DEFAULT_PROJECT'
    };

    // Emit the message to the project service using RabbitMQ
    this.projectClient.emit(
      rabbitmqConfig.routingKeys.projectRouting,
      message
    );
  }
}
