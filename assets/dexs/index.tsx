import FastImage, { FastImageProps, ImageStyle } from 'react-native-fast-image';

import { StyleProp } from 'react-native';

const psm = require('./psm.png');
const curve = require('./curve.png');
const balancer = require('./balancer.png');
const dodo = require('./dodo.png');
const kyberswap = require('./kyberswap.png');
const paraswap = require('./paraswap.jpg');
const quickswap = require('./quickswap.png');
const sushiswap = require('./sushiswap.png');
const uniswap = require('./uniswap.png');
const honeyswap = require('./honeyswap.png');
const polydex = require('./polydex.png');
const velodrome = require('./velodrome.png');
const gmx = require('./gmx.png');
const pancake = require('./cake.png');
const mdex = require('./mdex.png');
const one_inch = require('./1inch.png');
const nomiswap = require('./nomiswap.png');
const biswap = require('./biswap.png');
const wombat = require('./wombat.png');
const rose = require('./rose.jpg');
const kokonut = require('./kokonut.jpg');
const auroraswap = require('./auroraswap.png');
const wannaswap = require('./wannaswap.png');
const nearpad = require('./nearpad.png');
const trisolaris = require('./trisolaris.png');
const beets = require('./beets.png');
const spookyswap = require('./spookyswap.png');
const spiritswap = require('./spiritswap.png');
const woofi = require('./woofi.png');
const protofi = require('./protofi.png');
const klayswap = require('./klayswap.png');
const pangea = require('./pangea.png');
const camelot = require('./camelot.png');

const keywords = [
  { key: 'psm', img: psm },
  { key: 'curve', img: curve },
  { key: 'balancer', img: balancer },
  { key: 'dodo', img: dodo },
  { key: 'kyberswap', img: kyberswap },
  { key: 'paraswap', img: paraswap },
  { key: 'quickswap', img: quickswap },
  { key: 'sushi', img: sushiswap },
  { key: 'uniswap', img: uniswap },
  { key: 'honeyswap', img: honeyswap },
  { key: 'polydex', img: polydex },
  { key: 'velodrome', img: velodrome },
  { key: 'gmx', img: gmx },
  { key: 'pancake', img: pancake },
  { key: 'mdex', img: mdex },
  { key: 'one_inch', img: one_inch },
  { key: 'nomiswap', img: nomiswap },
  { key: 'bi_swap', img: biswap },
  { key: 'wombat', img: wombat },
  { key: 'rose', img: rose },
  { key: 'auroraswap', img: auroraswap },
  { key: 'wannaswap', img: wannaswap },
  { key: 'nearpad', img: nearpad },
  { key: 'trisolaris', img: trisolaris },
  { key: 'beets', img: beets },
  { key: 'spookyswap', img: spookyswap },
  { key: 'spiritswap', img: spiritswap },
  { key: 'woofi', img: woofi },
  { key: 'protofi', img: protofi },
  { key: 'klayswap', img: klayswap },
  { key: 'pangea', img: pangea },
  { key: 'kokonut', img: kokonut },
  { key: 'camelot', img: camelot },
];

export function generateDexLogo(protocol: string, style: StyleProp<ImageStyle>) {
  const lower = protocol.toLowerCase();
  const tuple = keywords.find(({ key }) => lower.includes(key));

  if (__DEV__ && !tuple) return;

  return <FastImage source={tuple?.img || one_inch} style={style} />;
}

export function hasLogo(protocol: string) {
  const lower = protocol.toLowerCase();
  return keywords.find(({ key }) => lower.includes(key)) ? true : false;
}
