export const emojis = [
  'ð­',
  'ðđ',
  'ð°',
  'ðķ',
  'ðĶ',
  'ðŊ',
  'ðĶ',
  'ðŪ',
  'ð·',
  'ð―',
  'ðŧ',
  'ðž',
  'ðļ',
  'ðē',
  'ðĶ',
  'ðĩ',
  'ð',
  'ð',
  'ð',
  'ðą',
  'ðļ',
  'ðđ',
  'ðš',
  'ðž',
  'ðŧ',
  'ð―',
  'ð',
  'ðĻ',
  'ðĶ',
  'ðĶ',
  'ð',
  'ð',
  'ðŋ',
  'ðĶ',
  'ðĶ',
  'ðĶ',
  'ð',
  'ðĶĐ',
  'ð§',
  'ðĶ',
  'ðĶĒ',
  'ðĶ',
  'ð',
  'ð',
  'ðĢ',
  'ðĪ',
  'ðĨ',
  'ð',
  'ðģ',
  'ðŽ',
  'ðĶ',
  'ð',
  'ð ',
  'ð',
  'ðĶ',
  'ðĶ',
  'ðĶ',
  'ð',
  'ð',
  'ðĶ',
  'ðĶŠ',
  'ðĒ',
  'ð',
  'ðļ',
  'ð·',
  'ðđ',
  'ðš',
  'ðŧ',
  'ðž',
  'ðĩ',
  'ðī',
  'ð',
  'ð',
  'ðē',
  'ðģ',
  'ðĶ',

  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ðĪĢ',
  'ðĨē',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ðĨ°',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ðĪŠ',
  'ðĪ',
  'ð',
  'ðĨļ',
  'ðĪĐ',
  'ðĨģ',
  'ð',
  'ðĪ',
  'ðĪŊ',
  'ðģ',
  'ðĨĩ',
  'ðĨķ',
  'ðĪ',
  'ðī',
  'ðĪĪ',
  'ðŠ',
  'ðĨī',
  'ðĪ',
  'ðĪ ',
  'ð',
  'ðĪ',
  'ð',
  'ð',
  'ð',

  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ð',
  'ðŦ',
  'ð',
  'ð',
  'ð',
  'ðĨ­',
  'ð',
  'ðĨĨ',
  'ðĨ',
  'ð',
  'ð',
  'ðĨ',
  'ðĨĶ',
  'ðĨŽ',
  'ðĨ',
  'ðķ',
  'ðŦ',
  'ð―',
  'ðĨ',
];

const count = emojis.length;

export function genEmoji() {
  const index = Math.floor(Math.random() * count);
  return emojis[index];
}

export function genColor() {
  return 'hsl(' + 360 * Math.random() + ',' + (25 + 70 * Math.random()) + '%,' + (85 + 10 * Math.random()) + '%)';
}
