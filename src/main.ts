import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { corsOptions } from '@app/shared/options/cors.options';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.use(cookieParser());
  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
      frameguard: false,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });
  app.enableCors(corsOptions);

  app.use(
    json({
      limit: '5mb',
    }),
  );
  app
    .getHttpAdapter()
    .getInstance()
    .set('env', configService.get<string>('NODE_ENV'))
    .set('etag', 'strong')
    .set('trust proxy', true)
    .disable('x-powered-by');
  await app.listen(Number(configService.get<string>('PORT') || 3000));
}

bootstrap();
