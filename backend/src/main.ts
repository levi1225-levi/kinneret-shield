import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from '@/common/filters';
import { LoggingInterceptor } from '@/common/filters/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('KinneretShield');

  const app = await NestFactory.create(AppModule);

  // Global configuration
  app.setGlobal = true;

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Exception filters
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new ClassSerializerInterceptor(app.get('REFLECTOR')));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Kinneret Shield API')
    .setDescription(
      'Wall-mounted NFC check-in system for school room-level attendance at TanenbaumCHAT',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('rooms', 'Room management')
    .addTag('devices', 'NFC device management')
    .addTag('attendance', 'Attendance tracking')
    .addTag('alerts', 'Alert system')
    .addTag('invites', 'Invite code management')
    .addTag('health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = parseInt(process.env.PORT || '3000', 10);

  await app.listen(port, '0.0.0.0');

  logger.log(`Kinneret Shield Backend running on port ${port}`);
  logger.log(`API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Bootstrap error:', error);
  process.exit(1);
});
