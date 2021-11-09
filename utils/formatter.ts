export function formatAddress(value: string, headLength = 10, tailLength = 8) {
  return value?.length > headLength + tailLength
    ? `${value.substring(0, headLength)}......${value.substring(value.length - tailLength)}`
    : value;
}

export function formatCurrency(value: number | string, symbol = '$', maximumFractionDigits = 2) {
  try {
    let num = Number(value);
    if (num === 0 && !symbol) return `0`;
    const formatted = Number.isInteger(num)
      ? num.toLocaleString(undefined, {})
      : num.toLocaleString(undefined, { maximumFractionDigits, minimumFractionDigits: 2 });
    return `${symbol} ${formatted === 'NaN' ? '0' : formatted}`.trim();
  } catch (error) {
    return '0';
  }
}
