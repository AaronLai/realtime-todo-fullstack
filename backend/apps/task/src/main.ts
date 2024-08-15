import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TaskModule } from './task.module';
import { LoggingMiddleware } from "@utils/logging.middleware";
import { rabbitmqConfig } from '@shared';

async function bootstrap() {
  // Create the NestJS application instance
  const app = await NestFactory.create(TaskModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Set up environment variables
  const PORT = process.env.PORT || 4003;
  const HOST = process.env.HOST || '0.0.0.0';
  const environment = process.env.NODE_ENV || 'development';

  // Enable CORS for all routes
  app.enableCors();

  // Connect to RabbitMQ microservice
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

  // Enable logging middleware for development and local environments
  if (['development', 'local'].includes(environment)) {
    logger.log('Enabling logging middleware');
    app.use(new LoggingMiddleware().use);
  }

  // Set up Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task API')
    .setDescription('API documentation for the Task microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Task')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocument);

  // Start all microservices
  await app.startAllMicroservices();

  // Start the HTTP server
  await app.listen(PORT, HOST);

  // Log application startup information
  logger.log(`Application is running on: http://${HOST}:${PORT}`);
  logger.log(`Environment: ${environment}`);
  logger.log('RabbitMQ Microservice is listening');
  logger.log('Swagger documentation available at /api');
}

// Run the bootstrap function
bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});