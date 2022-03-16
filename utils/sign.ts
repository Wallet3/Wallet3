import { utils } from 'ethers';

export function parseSignParams(params: string[]) {
  let data = params[0];
  let from = params[1];

  if (!utils.isAddress(from)) {
    data = params[1];
    from = params[0];
  }

  if ((data.length === 66 || data.length === 64) && utils.isBytesLike(data)) {
    return { data: utils.arrayify(data), from, isLegacy: true };
  }

  data = utils.isBytesLike(data) ? Buffer.from(utils.arrayify(data)).toString('utf8') : data;
  return { data, from, isLegacy: false };
}

//   const msg = Buffer.from(utils.arrayify(params[0])).toString('utf8');
//   const isAscii = /^[\x00-\x7F]*$/.test(msg);
