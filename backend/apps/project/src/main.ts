import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProjectModule } from './project.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { LoggingMiddleware } from "@utils/logging.middleware";
import { rabbitmqConfig } from '@shared';

async function bootstrap() {
  const app = await NestFactory.create(ProjectModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PROJECT_SERVICE_PORT');
  const environment = process.env.NODE_ENV || 'development';

  // RabbitMQ Microservice Connection
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: rabbitmqConfig.queues.projectQueue,
      queueOptions: {
        durable: false,
      },
    },
  });

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [configService.get<string>('RABBITMQ_URL')],
  //     queue: rabbitmqConfig.queues.userQueue,
  //     queueOptions: {
  //       durable: false,
  //     },
  //   },
  // });

  app.enableCors();

  // Enable logging for local and development environments
  if (environment === 'development' || environment === 'local') {
    app.use(new LoggingMiddleware().use);
  }

  const config = new DocumentBuilder()
    .setTitle('Project API')
    .setDescription('The Project API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Project')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(port || 4002);

  console.log(`Application is running on: ${await app.getUrl()} with environment: ${environment}`);
  console.log(`RabbitMQ Microservice is listening`);
}

bootstrap();
