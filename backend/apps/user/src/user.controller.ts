import { Controller, Post, Body, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, RegisterDto } from './user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from '@utils/response';

// Swagger API tag for grouping user-related endpoints
@ApiTags('User')
// Define the base route for user-related endpoints
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Endpoint for user sign in
  @Post('signin')
  // Use ValidationPipe to validate and sanitize input
  @UsePipes(new ValidationPipe({ whitelist: true }))
  // Swagger decorators for API documentation
  @ApiOperation({ summary: 'User sign in' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Successful sign in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signin(@Body() credentials: SignInDto): Promise<Response> {
    try {
      // Attempt to validate user credentials
      const result = await this.userService.validateUser(credentials.username, credentials.password);
      // Return success response if validation succeeds
      return Response.success(result);
    } catch (error) {
      // Throw unauthorized exception if validation fails
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
  
  // Endpoint for user registration
  @Post('register')
  // Use ValidationPipe to validate and sanitize input
  @UsePipes(new ValidationPipe({ whitelist: true }))
  // Swagger decorators for API documentation
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() userData: RegisterDto): Promise<Response> {
    try {
      // Attempt to register a new user
      const result = await this.userService.registerUser(userData.username, userData.password);
      // Return success response with 201 status if registration succeeds
      return Response.success(result, 201);
    } catch (error) {
      // Throw bad request exception if registration fails
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
