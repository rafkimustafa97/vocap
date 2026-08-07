export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length < 3) return new Date();
  const [y, m, d] = parts.map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysDifference(date1Str: string, date2Str: string): number {
  const d1 = parseLocalDate(date1Str);
  const d2 = parseLocalDate(date2Str);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
