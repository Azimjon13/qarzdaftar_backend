import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ZodValidationPipe } from 'nestjs-zod';
import { JWTOptions } from './options/jwt.options';
import { ThrottleOptions } from './options/throttler.options';
import { DevicesInterceptor } from './interceptors/auth-devices';
import { JwtAuthGuard } from './guards/auth.guard';
import { ScopeGuard } from './guards/scope.guard';
import { SmsService } from './services/sms.service';
import { KnexModule } from '@app/knex';
import { TransactionsService } from '@app/shared/services/transactions.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      useClass: JWTOptions,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ThrottlerModule.forRootAsync({
      useClass: ThrottleOptions,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USER'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          client: configService.get<string>('DB_CLIENT'),
          connection: {
            host: configService.get<string>('DB_HOST'),
            user: configService.get<string>('DB_USER'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_NAME'),
            port: configService.get<number>('DB_PORT'),
          },
        },
        pool: {
          min: 0,
          map: 100,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DevicesInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopeGuard,
    },
    SmsService,
    TransactionsService,
  ],
  exports: [SmsService, TransactionsService],
})
export class SharedModule {}
