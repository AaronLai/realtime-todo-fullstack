import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@data/data.module';
import { AuthModule } from '@auth/auth/auth.module';
@Module({
  imports: [AuthModule,DatabaseModule,ConfigModule.forRoot({
    envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    isGlobal: true,
  })],  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}




