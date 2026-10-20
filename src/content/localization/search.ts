/** Query-only normalization; never rewrites displayed Arabic, identifiers or stored content. */
export function normalizeSearch(value: string) {
  return value
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/[\u064b-\u065f\u0670\u0640]/gu, '')
    .replace(/[أإآ]/gu, 'ا')
    .replace(/[٠-٩]/gu, (digit) => String(digit.charCodeAt(0) - 0x660))
    .trim();
}
