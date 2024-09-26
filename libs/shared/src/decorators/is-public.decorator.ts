import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IsPublic';
/**
 * Decorator that sets metadata indicating that a route is public and does not require authentication.
 * @returns A function that sets the metadata key/value pair.
 */
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
