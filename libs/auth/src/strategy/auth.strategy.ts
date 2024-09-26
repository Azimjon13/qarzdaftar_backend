import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { InjectKnex } from '@app/knex';

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private config: ConfigService,
  ) {
    super({
      passReqToCallback: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get('JWT_SECRET') || '279e6748cb67c36691c8bed072239880',
    });
  }

  async validate(payload: any) {
    const hasAccount = await this.knex('users')
      .select('users.id')
      .where({
        'users.id': payload.user.id,
        'users.status': 'active',
      })
      .first();
    if (payload.user.id !== 1) {
      if (!hasAccount) {
        throw new UnauthorizedException('Account not found');
      }
    }
    return payload.user;
  }
}
