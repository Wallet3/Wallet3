//@ts-nocheck

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function toMilliseconds({
  days,
  hours,
  minutes,
  seconds,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}) {
  return (days || 0) * DAY + (hours || 0) * HOUR + (minutes || 0) * MINUTE + (seconds || 0) * SECOND;
}

export function parseMilliseconds(milliseconds: number) {
  const days = Math.max(0, Number.parseInt(milliseconds / DAY));
  const hours = Math.max(0, Number.parseInt((milliseconds - days * DAY) / HOUR));
  const minutes = Math.max(0, Number.parseInt((milliseconds - days * DAY - hours * HOUR) / MINUTE));
  const seconds = Math.max(0, Number.parseInt((milliseconds - days * DAY - hours * HOUR - minutes * MINUTE) / SECOND));

  return { days, hours, minutes, seconds };
}
