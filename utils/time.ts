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
