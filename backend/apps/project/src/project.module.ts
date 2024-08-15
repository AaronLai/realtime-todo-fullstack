import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from '@auth/auth/auth.module';
import { DatabaseModule } from '@data/data.module';
import { WebsocketAuthGuard } from '@auth/auth/websocket-auth.guard';
import { rabbitmqConfig } from '@shared';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectGateway } from './project.gateway';

@Module({
  imports: [
    // Import required modules
    AuthModule,
    DatabaseModule,

    // Configure JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    // Load environment variables
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),

    // Configure microservices
    ClientsModule.registerAsync([
      {
        name: 'PROJECT_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: rabbitmqConfig.queues.projectQueue,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'TASK_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: rabbitmqConfig.queues.taskQueue,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectGateway, WebsocketAuthGuard],
})
export class ProjectModule {}