import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { LoggingMiddleware } from "@utils/logging.middleware";
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { rabbitmqConfig } from '@shared';

async function bootstrap() {
  const app = await NestFactory.create(TaskModule);
  const configService = app.get(ConfigService);
  const PORT = process.env.PORT || 4003;
  const HOST = process.env.HOST || '0.0.0.0';
  const environment = process.env.NODE_ENV || 'development';

  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: rabbitmqConfig.queues.taskQueue,
      queueOptions: {
        durable: false,
      },
    },
  });

  // Enable logging for local and development environments
  if (environment === 'development' || environment === 'local') {
    app.use(new LoggingMiddleware().use);
  }

  const config = new DocumentBuilder()
    .setTitle('Task API')
    .setDescription('The Task API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Task')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(PORT, HOST);

  console.log(`Application is running on: http://${HOST}:${PORT} with environment: ${environment}`);
  console.log(`RabbitMQ Microservice is listening`);
}

bootstrap();
