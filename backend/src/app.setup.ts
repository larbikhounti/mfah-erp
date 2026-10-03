import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

/**
 * Global HTTP setup shared by main.ts and the e2e tests, so the tests
 * exercise the same prefix/versioning/validation as production.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');

  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
