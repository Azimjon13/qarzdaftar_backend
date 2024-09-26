import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Determines whether the user has the required scope(s) to access the resource.
 * @param context The execution context.
 * @returns A boolean indicating whether the user has the required scope(s).
 * @throws ForbiddenException if the user does not have the required scope(s).
 */
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines whether the user has the required scope(s) to access the resource.
   * @param context The execution context.
   * @returns A boolean indicating whether the user has the required scope(s) to access the resource.
   * @throws ForbiddenException if the user does not have the required scope(s).
   */
  canActivate(context: ExecutionContext): boolean {
    const needleScope = this.reflector.get<string[]>(
      'scope',
      context.getHandler(),
    );

    if (!needleScope) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userScopes: string = request.user?.role;

    if (!userScopes) throw new ForbiddenException('Scopes not found');
    return matchScopes(needleScope, userScopes);
  }
}

/**
 * Checks if the user has the required scope(s) to access a resource.
 * @param needleScopes The required scope(s) to access the resource.
 * @param userScopes The scopes of the user trying to access the resource.
 * @returns True if the user has the required scope(s), false otherwise.
 */
function matchScopes(
  needleScopes: string | string[],
  userScopes: string,
): boolean {
  return typeof needleScopes === 'string'
    ? userScopes.includes(needleScopes)
    : needleScopes.some((needleScope) => userScopes.includes(needleScope));
}
