import FastImage, { FastImageProps } from 'react-native-fast-image';
import { Image, ImageSourcePropType, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import Networks from '../viewmodels/core/Networks';
import SvgImage from 'react-native-remote-svg';
import icons from '../assets/icons/crypto';
import { observer } from 'mobx-react-lite';
import { utils } from 'ethers';

// @ts-ignore
interface CoinProps extends FastImageProps {
  symbol?: string;
  address: string;
  chainId: number;
  iconUrl?: string;
  forceRefresh?: boolean;
  size?: number;
  source?: ImageSourcePropType;
  borderRadius?: number;
}

export default observer((props: CoinProps) => {
  const [network] = useState(Networks.find(props.chainId));
  const [logoUrl] = props.forceRefresh
    ? [
        `https://github.com/trustwallet/assets/raw/master/blockchains/${
          (network?.github_dir || network?.network)?.toLowerCase() ?? 'ethereum'
        }/assets/${props.address.length === 42 ? utils.getAddress(props.address) : props.address}/logo.png`,
      ]
    : useState(
        `https://github.com/trustwallet/assets/raw/master/blockchains/${
          (network?.github_dir || network?.network)?.toLowerCase() ?? 'ethereum'
        }/assets/${props.address.length === 42 ? utils.getAddress(props.address) : props.address}/logo.png`
      );

  let symbol = props.symbol?.toLowerCase() || (props.address ? '' : network?.symbol.toLowerCase() || 'eth');
  symbol = symbol.endsWith('.e') ? symbol.substring(0, symbol.length - 2) : symbol; // Avax

  const [source] = props.forceRefresh
    ? [props.iconUrl && !icons[symbol] ? { uri: props.iconUrl } : icons[symbol] || { uri: logoUrl }]
    : useState(props.iconUrl && !icons[symbol] ? { uri: props.iconUrl } : icons[symbol] || { uri: logoUrl });

  const [failedSource, setFailedSource] = useState(
    source?.uri?.startsWith?.('data:image/svg+xml') || source?.uri?.endsWith?.('.svg') ? icons['_coin'] : undefined
  );

  const size = props.size || (props.style as any)?.width || 22;
  const style = {
    width: size,
    height: size,
    ...((props.style as any) || {}),
    borderRadius: props.iconUrl ? size / 2 : props.borderRadius || 0,
  };

  useEffect(() => {
    setFailedSource(undefined);
  }, [props.address]);

  return failedSource ? (
    // @ts-ignore
    <Image {...props} source={icons['_coin']} style={style} />
  ) : source.uri ? (
    <FastImage {...props} source={source} onError={() => setFailedSource(icons['_coin'])} style={style} />
  ) : (
    // @ts-ignore
    <Image
      {...props}
      source={source}
      defaultSource={icons['_coin']}
      style={style}
      onError={() => setFailedSource(icons['_coin'])}
    />
  );
});
