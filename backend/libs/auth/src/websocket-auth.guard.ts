import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

interface TokenValidationResult {
  isValid: boolean;
  payload?: any;
}

@Injectable()
export class WebsocketAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth.token;
    const { isValid, payload } = this.validateToken(token);

    if (isValid && payload) {
      // Attach the payload to the client object for later use
      (client as any).user = payload;
    }

    return isValid;
  }

  private validateToken(token: string): TokenValidationResult {
    if (!token) {
      return { isValid: false };
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }

      const payload = jwt.verify(token, secret);
      return { isValid: true, payload };
    } catch (error) {
      console.error('Token validation error:', error.message);
      return { isValid: false };
    }
  }
}
