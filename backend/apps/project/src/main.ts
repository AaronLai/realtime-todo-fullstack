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
  // Create the NestJS application instance
  const app = await NestFactory.create(ProjectModule);
  const configService = app.get(ConfigService);

  // Set up environment variables with defaults
  const PORT = process.env.PORT || 4002;
  const HOST = process.env.HOST || '0.0.0.0';
  const environment = process.env.NODE_ENV || 'development';

  // Configure RabbitMQ Microservice Connection
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: rabbitmqConfig.queues.projectQueue,
      queueOptions: { durable: false },
    },
  });

  // Enable WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS for all origins
  app.enableCors();

  // Enable logging middleware for development and local environments
  if (['development', 'local'].includes(environment)) {
    app.use(new LoggingMiddleware().use);
  }

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Project API')
    .setDescription('The Project API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Project')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
 
  // Seed roles in the database
  const dataService = app.get(DataService);
  await dataService.seedRoles();

  // Start all microservices and the main application
  await app.startAllMicroservices();
  await app.listen(PORT, HOST);

  // Log application start information
  console.log(`Application is running on: http://${HOST}:${PORT} with environment: ${environment}`);
  console.log(`RabbitMQ Microservice is listening`);
}

// Execute the bootstrap function
bootstrap();