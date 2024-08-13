// auth.service.ts
import { Injectable } from '@nestjs/common';
import { DataService } from '@data/data.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UserData, ValidatedUser } from './auth.interfaces';
import { ErrorCodes } from '@utils/error-codes';

@Injectable()
export class AuthService {
  constructor(
    private dataService: DataService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<ValidatedUser | { error: string, errorCode: string }> {
    const user = await this.dataService.findUser(username);
    if (user && await argon2.verify(user.password, password)) {
      const { password, ...userData } = user;
      const token = this.generateToken(userData as UserData);
      return { user: userData as UserData, token };
    }
    return {
      error: 'Invalid credentials',
      errorCode: ErrorCodes.INVALID_CREDENTIALS
    };
  }

  async registerUser(username: string, password: string): Promise<UserData | { error: string, errorCode: string }> {
    const existingUser = await this.dataService.findUser(username);
    if (existingUser) {
      return {
        error: 'Username already exists',
        errorCode: ErrorCodes.USER_EXISTS
      };
    }

    const hashedPassword = await argon2.hash(password);
    const newUser = await this.dataService.createUser({
      username,
      password: hashedPassword,
    });

    const { password: _, ...userData } = newUser;
    return userData as UserData;
  }

  private generateToken(user: UserData): string {
    const payload = {  userId: user.id , username: user.username , sub :{}};
    return this.jwtService.sign(payload);
  }
}
