import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('USER_SERVICE_PORT');
  
  await app.listen(port || 3001);
  console.log(`Application is running on: ${await app.getUrl()} with environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
