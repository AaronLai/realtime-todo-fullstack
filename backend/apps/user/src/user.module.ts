import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@auth/auth/auth.module';

@Module({
  imports: [AuthModule,ConfigModule.forRoot({
    envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    isGlobal: true,
  }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
