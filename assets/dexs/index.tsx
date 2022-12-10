import FastImage, { FastImageProps, ImageStyle } from 'react-native-fast-image';

import { StyleProp } from 'react-native';

const psm = require('./psm.png');
const curve = require('./curve.png');
const balancer = require('./balancer.png');
const dodo = require('./dodo.png');
const kyberswap = require('./kyberswap.png');
const paraswap = require('./paraswap.png');
const quickswap = require('./quickswap.png');
const sushiswap = require('./sushiswap.png');
const uniswap = require('./uniswap.png');
const honeyswap = require('./honeyswap.png');
const polydex = require('./polydex.png');

const keywords = [
  { key: 'psm', img: psm },
  { key: 'curve', img: curve },
  { key: 'balancer', img: balancer },
  { key: 'dodo', img: dodo },
  { key: 'keyber', img: kyberswap },
  { key: 'paraswap', img: paraswap },
  { key: 'quickswap', img: quickswap },
  { key: 'sushi', img: sushiswap },
  { key: 'uniswap', img: uniswap },
  { key: 'honeyswap', img: honeyswap },
  { key: 'polydex', img: polydex },
];

export function generateDexLogo(keyword: string, style: StyleProp<ImageStyle>) {
  const lower = keyword.toLowerCase();
  const tuple = keywords.find(({ key }) => lower.includes(key));
  if (!tuple) return;

  return <FastImage source={tuple.img} style={style} />;
}
