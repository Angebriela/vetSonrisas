import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {

  const app = await NestFactory.create(
    AppModule,
  );

  // El frontend se ejecuta como una aplicación independiente y consume esta API.
  // Se habilita CORS para desarrollo local (incluido el origen `null` de file://).
  app.enableCors({
    origin: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(
    process.env.PORT ?? 3000,
  );
}

await bootstrap();

