import numeral from 'numeral';

export function formatAddress(value: string, headLength = 10, tailLength = 8) {
  return value?.length > headLength + tailLength
    ? `${value.substring(0, headLength)}......${value.substring(value.length - tailLength)}`
    : value;
}

export function formatCurrency(value: number | string, symbol = '$') {
  if (Number(value) === 0 && !symbol) return `0`;
  const formatted = numeral(value || 0).format('0,0.00');
  return `${symbol} ${formatted === 'NaN' ? '0.00' : formatted}`.trim();
}
