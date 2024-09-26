import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Knex } from 'knex';

export class DevicesInterceptor implements NestInterceptor {
  constructor(private readonly knex: Knex) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;
    const path = req.path;
    const mobileDevices: string[] = [
      'x-device-type',
      'x-device-build-id',
      'x-device-os-version',
      'x-device-os',
      'x-device-name',
      'x-device-version',
      'x-device-cpu-arch',
    ];
    if (path.includes('mobile')) {
      if (
        !mobileDevices.every(
          (res: string) =>
            Object.keys(headers).includes(res) &&
            headers[res] !== null &&
            headers[res] !== 'null' &&
            headers[res],
        )
      ) {
        throw new UnauthorizedException(
          'Invalid credentials device check you header',
        );
      }
    }
    return next.handle();
  }
}
