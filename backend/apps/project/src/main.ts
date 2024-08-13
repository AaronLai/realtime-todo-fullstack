

import { NestFactory } from '@nestjs/core';
import { ProjectModule } from './project.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import {  LoggingMiddleware } from "@utils/logging.middleware"; // Import the middleware

async function bootstrap() {
  const app = await NestFactory.create(ProjectModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PROJECT_SERVICE_PORT');
  const environment = process.env.NODE_ENV || 'development';

  app.enableCors();

  // Enable logging for local and development environments
  if (environment === 'development' || environment === 'local') {
    app.use(new LoggingMiddleware().use);
  }
  const config = new DocumentBuilder()
    .setTitle('Project API')
    .setDescription('The User API description')
    .setVersion('1.0')
    .addBearerAuth() 

    .addTag('Project')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port || 4002);
  console.log(`Application is running on: ${await app.getUrl()} with environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
