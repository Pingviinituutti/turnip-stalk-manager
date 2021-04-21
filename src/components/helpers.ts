
export const date2datestr = (date: Date): string => {
  return date.toDateString();
}

export function isValidDate(d) {
  // @ts-ignore
  return d instanceof Date && !isNaN(d)
}

export const getEmptyPriceList = () => { return Array(14).fill('') }