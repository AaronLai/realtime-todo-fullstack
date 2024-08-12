import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataService } from './data.service';
import { UserEntityService } from './services/user.entity.services';
import { ProjectEntityService } from './services/project.entity.service';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { Project } from './entities/project.entity';
import { UserProjectRole } from './entities/user-project-role.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // or your preferred database type
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Task, Project, UserProjectRole, Role, RolePermission, Permission],
        synchronize: configService.get('DB_SYNC'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Task, Project, UserProjectRole, Role, RolePermission, Permission]),
  ],
  providers: [Repository, DataService, UserEntityService,ProjectEntityService],
  exports: [TypeOrmModule, DataService,],
})
export class DatabaseModule { }
