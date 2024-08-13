import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
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
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
