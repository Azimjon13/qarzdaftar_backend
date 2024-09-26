import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AccountsRepository } from '@app/accounts/repository/accounts.repository';
import { VerificationsRepository } from './repositories/verification.repository';
import { SharedModule, SmsService } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtStrategy } from './strategy/auth.strategy';

@Module({
  imports: [
    SharedModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '6h',
          },
          secret:
            configService.get('JWT_SECRET') ||
            '279e6748cb67c36691c8bed072239880',
        };
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    AccountsRepository,
    VerificationsRepository,
    SmsService,
    AuthJwtStrategy,
  ],
  exports: [
    AuthService,
    JwtService,
    AccountsRepository,
    VerificationsRepository,
    SmsService,
  ],
})
export class AuthModule {}
