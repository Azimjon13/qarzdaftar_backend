import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

/**
 * A decorator that extracts the user object from the request object.
 * @param field - Optional field to extract from the user object.
 * @param context - The execution context.
 * @returns The user object or the specified field from the user object.
 * @throws NotFoundException if the user object is not found in the request.
 * @throws BaseExceptionFilter if an error occurs while extracting the specified field from the user object.
 */
export const User = createParamDecorator(
  (field: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    let user = req.user;
    try {
      if (field) {
        const fields = field.split('.');

        fields.forEach((e) => {
          user = user[e];
        });
      }

      return user;
    } catch (e) {
      throw new BaseExceptionFilter();
    }
  },
);
