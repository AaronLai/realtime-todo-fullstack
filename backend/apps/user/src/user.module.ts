import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@auth/auth/auth.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';
import { DatabaseModule } from '@data/data.module';

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
        name: 'USER_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: rabbitmqConfig.queues.userQueue,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
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
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
