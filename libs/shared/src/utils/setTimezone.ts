/**
 * Converts the given date to a string representation in the 'Asia/Tashkent' timezone.
 * @param date - The date to convert.
 * @returns A string representation of the given date in the 'Asia/Tashkent' timezone.
 */
export function setTimezone(date: Date) {
  const d = new Date(date);
  return d.toLocaleString('en-US', { timeZone: 'Asia/Tashkent' });
}
