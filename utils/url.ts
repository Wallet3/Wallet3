import V from 'validator';
// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const pattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

export function isURL(str: string) {
  return V.isURL(str);
}
