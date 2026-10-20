/** Parse recovered Gregorian labels without changing their source date. */
export function arabicDateLabel(value: string) {
  if (!/[A-Za-z]/u.test(value)) return value;
  const timestamp = Date.parse(value.trim() + ' UTC');
  return Number.isNaN(timestamp)
    ? value
    : new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(timestamp);
}
