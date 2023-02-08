import V from 'validator';
// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
const pattern = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

export function isURL(str: string) {
  return V.isURL(str);
}

export const convertIPFSProtocols = (items: (string | undefined)[]) => {
  return items
    .map((i) => (i?.startsWith('ipfs://') ? i.replace('ipfs://', 'https://ipfs.io/ipfs/') : i))
    .filter((i) => i) as string[];
};

export const convertIPFSProtocol = (item: string | undefined) => {
  return convertIPFSProtocols([item])[0];
};
