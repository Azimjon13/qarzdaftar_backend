import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('IsPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    const getRequest = context.switchToHttp().getRequest();
    const userAgent = getRequest.headers['user-agent'];
    if (!userAgent) {
      throw new UnauthorizedException();
    }
    const headers = getRequest.headers;
    if (isPublic) {
      return true;
    } else if (!headers.authorization) {
      throw new UnauthorizedException();
    }
    const accessDecode = this.jwtService.decode(
      headers.authorization.split(' ')[1],
      {
        json: true,
      },
    );
    if (!accessDecode) {
      return false;
    }

    if (getRequest.path === '/v1/mobile/auth/refresh-token') {
      const currentTime = new Date(Date.now());
      const expirationTimeAccessToken = accessDecode['exp']; // Check if 'exp' claim exists
      if (
        expirationTimeAccessToken &&
        currentTime > new Date(expirationTimeAccessToken * 1000)
      ) {
        if (headers['x-refresh-token']) {
          const refreshToken = this.jwtService.decode(
            headers['x-refresh-token'],
            { json: true },
          );
          if (refreshToken !== null) {
            const expirationTimeRefresh = refreshToken['exp'];
            if (
              expirationTimeRefresh &&
              currentTime < new Date(expirationTimeRefresh * 1000) &&
              refreshToken['sub'] === accessDecode['user']['id']
            ) {
              return true;
            } else {
              throw new UnauthorizedException('Refresh token expired');
            }
          }
          throw new UnauthorizedException('Refresh token cannot decode');
        }
        throw new UnauthorizedException('Refresh token not found');
      }
    }

    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
