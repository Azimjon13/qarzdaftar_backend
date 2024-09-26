import { createHash, randomBytes } from 'node:crypto';

/**
 * Calculates the MD5 hash of the given content.
 * @param content The content to hash.
 * @returns The MD5 hash of the content.
 */
export function md5(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

/**
 *
 * @param length it creates 6 by default, but you can add length yourself
 * @returns
 */
export function generatePassword(length: number = 6): string {
  const buffer = randomBytes(Math.ceil(length / 2));

  const password = buffer.toString('hex').slice(0, length);

  return password;
}
