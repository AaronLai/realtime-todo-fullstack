// user.dto.ts
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username',
    minLength: 4,
    maxLength: 20
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
    maxLength: 20
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username',
    minLength: 4,
    maxLength: 20
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
    maxLength: 20
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
