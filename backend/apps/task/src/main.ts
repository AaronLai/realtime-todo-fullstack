


import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(TaskModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('TASK_SERVICE_PORT');
  
  const config = new DocumentBuilder()
    .setTitle('Task API')
    .setDescription('The Task API description')
    .setVersion('1.0')
    .addBearerAuth() 

    .addTag('Task')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(port || 4003);
  console.log(`Application is running on: ${await app.getUrl()} with environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
