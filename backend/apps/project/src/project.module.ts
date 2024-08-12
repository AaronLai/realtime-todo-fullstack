import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@data/data.module';
import { AuthModule } from '@auth/auth/auth.module';

@Module({
  imports: [AuthModule,DatabaseModule,ConfigModule.forRoot({
    envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    isGlobal: true,
  })],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}


