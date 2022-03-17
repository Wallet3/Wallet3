import { utils } from 'ethers';

function isASCII(str: string, extended?: boolean) {
  return (extended ? /^[\x00-\xFF]*$/ : /^[\x00-\x7F]*$/).test(str);
}

export function parseSignParams(params: string[], eth_sign = false) {
  let data = params[0];
  let from = params[1];

  if (!utils.isAddress(from)) {
    data = params[1];
    from = params[0];
  }

  if ((data.length === 66 || data.length === 64) && utils.isBytesLike(data) && eth_sign) {
    return { data: utils.arrayify(data), from, isLegacy: true };
  }

  const msg = utils.isBytesLike(data) ? Buffer.from(utils.arrayify(data)).toString('utf-8') : '';

  data = utils.isBytesLike(data) ? (data.length === 66 && utils.isBytesLike(data) ? (isASCII(msg) ? msg : data) : msg) : data;

  return { data, from, isLegacy: false };
}

//   const msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
//   const isAscii = /^[\x00-\x7F]*$/.test(msg);
