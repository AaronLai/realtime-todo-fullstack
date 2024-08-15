import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@data/data.module';
import { AuthModule } from '@auth/auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
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
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
