import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ProjectModule } from './project.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingMiddleware } from "@utils/logging.middleware";
import { rabbitmqConfig } from '@shared';
import { DataService } from '@data/data.service';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(ProjectModule);
  const configService = app.get(ConfigService);
  const PORT = process.env.PORT || 4002;
  const HOST = process.env.HOST || '0.0.0.0';
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

  app.useWebSocketAdapter(new IoAdapter(app));

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
 
  // Seed roles
  const dataService = app.get(DataService);
  await dataService.seedRoles();

  await app.startAllMicroservices();
  await app.listen(PORT, HOST);

  console.log(`Application is running on: http://${HOST}:${PORT} with environment: ${environment}`);
  console.log(`RabbitMQ Microservice is listening`);
}

bootstrap();