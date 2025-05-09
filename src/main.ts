import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { FileUploadFilter } from './filter/file-upload.filter';

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle('Healthcare API')
    .setDescription('Patient and appointment management system')
    .setVersion('1.0')
    .build();

  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new FileUploadFilter());
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
