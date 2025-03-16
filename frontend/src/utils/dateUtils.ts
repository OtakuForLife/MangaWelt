/**
 * Parses a date string in dd.mm.yyyy format into a Date object
 * @param dateStr - Date string in dd.mm.yyyy format
 * @returns Date object, or earliest possible date (1/1/1970) if dateStr is undefined
 */
export function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) {
    return new Date(0); // Return earliest possible date for undefined dates
  }
  // Parse date from dd.mm.yyyy format
  const [day, month, year] = dateStr.split('.');
  return new Date(Number(year), Number(month) - 1, Number(day));
}