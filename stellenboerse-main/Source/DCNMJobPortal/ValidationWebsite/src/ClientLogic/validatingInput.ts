/**
 * Validates and formats a date string into a `Date` object.
 *
 * This function accepts a date string in either the German "dd.mm.yyyy" format or
 * a standard ISO date string. If the input matches the German format, it will be
 * parsed and converted to a `Date` object. If it is a valid ISO date string, it will
 * also be converted to a `Date` object. Invalid date strings will return `null`.
 *
 * @param dateStr The date string to validate and format.
 * @returns A `Date` object if the input is valid, or `null` if the input is invalid.
 */
export function validateAndFormatDate(dateStr: string): Date | null {
  const GERMAN_DATE_REGEX: RegExp = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const MATCH: RegExpMatchArray | null = dateStr.match(GERMAN_DATE_REGEX);
  if (MATCH) {
    const [, DAY, MONTH, YEAR]: RegExpMatchArray = MATCH;

    return new Date(Date.UTC(Number(YEAR), Number(MONTH) - 1, Number(DAY)));
  }

  const DATE: Date = new Date(dateStr);
  return isNaN(DATE.getTime())
    ? null
    : new Date(Date.UTC(DATE.getFullYear(), DATE.getMonth(), DATE.getDate()));
}
