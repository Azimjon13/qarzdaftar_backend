import { SetMetadata } from '@nestjs/common';

/**
 * A decorator function that sets the metadata for the scope of a given resource.
 * @param args - A string or an array of strings representing the scope of the resource.
 */
export const Scope = (args: string | string[]) => SetMetadata('scope', args);
