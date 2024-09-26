import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class ResultType {
  success: boolean;
  data: any;
}

@Injectable()
export class WsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async deleteBySocketId(id: string) {
    return id;
  }

  async verifyJwt(authorization: string) {
    return this.jwtService.verify(authorization, {
      secret:
        this.configService.get('JWT_SECRET') ||
        '279e6748cb67c36691c8bed072239880',
    });
  }
}
