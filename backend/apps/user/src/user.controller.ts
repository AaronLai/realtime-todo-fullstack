import { Controller, Post, Body, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, RegisterDto } from './user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from '@utils/response';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'User sign in' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Successful sign in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signin(@Body() credentials: SignInDto): Promise<Response> {
    try {
      const result = await this.userService.validateUser(credentials.username, credentials.password);
      return Response.success(result);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
  
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() userData: RegisterDto): Promise<Response> {
    try {
      const result = await this.userService.registerUser(userData.username, userData.password);
      return Response.success(result, 201);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}