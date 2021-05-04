
export const CALENDAR_TYPES = {
  ARABIC: 'Arabic',
  HEBREW: 'Hebrew',
  ISO_8601: 'ISO 8601',
  US: 'US'
};

export const date2datestr = (date: Date): string => {
  return date.toDateString();
}

export function isValidDate(d: any) {
  // @ts-ignore
  return d instanceof Date && !isNaN(d)
}

export const getEmptyPriceList = () => { return Array(14).fill('') }
