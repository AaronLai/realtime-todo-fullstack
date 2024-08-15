import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SignInDto, RegisterDto } from './user.dto';
import { ValidationPipe } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            validateUser: jest.fn(),
            registerUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('signin', () => {
    it('should call userService.validateUser with correct credentials', async () => {
      const credentials: SignInDto = { username: 'testuser', password: 'testpass' };
      await userController.signin(credentials);
      expect(userService.validateUser).toHaveBeenCalledWith(credentials.username, credentials.password);
    });

  });

  describe('register', () => {
    it('should call userService.registerUser with correct user data', async () => {
      const userData: RegisterDto = { username: 'newuser', password: 'newpass' };
      await userController.register(userData);
      expect(userService.registerUser).toHaveBeenCalledWith(userData.username, userData.password);
    });


  });
});
