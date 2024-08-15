import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@data/data.module';
import { AuthModule } from '@auth/auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';
import { ProjectGateway } from './project.gateway';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketAuthGuard } from '@auth/auth/websocket-auth.guard';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'PROJECT_SERVICE', // Change this to PROJECT_SERVICE
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: rabbitmqConfig.queues.projectQueue, // Change this to projectQueue
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'TASK_SERVICE', // Change this to TASK_SERVICE
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: rabbitmqConfig.queues.taskQueue, // Change this to projectQueue
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
  providers: [ProjectService,ProjectGateway,WebsocketAuthGuard],
})
export class ProjectModule {}
