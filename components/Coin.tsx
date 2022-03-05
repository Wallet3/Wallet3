import CachedImage, { FastImageProps } from 'react-native-fast-image';
import { Image, ImageResizeMode, ImageSourcePropType, ImageStyle, ImageURISource, StyleProp } from 'react-native';
import React, { useState } from 'react';

import Networks from '../viewmodels/Networks';
import icons from '../assets/icons/crypto';
import { observer } from 'mobx-react-lite';

// @ts-ignore
interface CoinProps extends FastImageProps {
  symbol?: string;
  address: string;
  chainId: number;
  iconUrl?: string;
  forceRefresh?: boolean;
  size?: number;
  source?: ImageSourcePropType;
}

export default observer((props: CoinProps) => {
  const [network] = useState(Networks.find(props.chainId));
  const [logoUrl] = useState(
    `https://github.com/trustwallet/assets/raw/master/blockchains/${
      (network?.github_dir || network?.network)?.toLowerCase() ?? 'ethereum'
    }/assets/${props.address}/logo.png`
  );

  let symbol = props.symbol?.toLowerCase() ?? '';
  symbol = symbol.endsWith('.e') ? symbol.substring(0, symbol.length - 2) : symbol; // Avax

  const [source] = props.forceRefresh
    ? [props.iconUrl && !icons[symbol] ? { uri: props.iconUrl } : icons[symbol] || { uri: logoUrl }]
    : useState(props.iconUrl && !icons[symbol] ? { uri: props.iconUrl } : icons[symbol] || { uri: logoUrl });

  const [failedSource, setFailedSource] = useState();

  const size = props.size || (props.style as any)?.width || 22;

  return source.uri && !failedSource ? (
    <CachedImage
      {...props}
      onError={() => setFailedSource(icons['_coin'])}
      source={source}
      style={{
        width: size,
        height: size,
        ...((props.style as any) || {}),
        borderRadius: props.iconUrl ? size / 2 : 0,
      }}
    />
  ) : (
    // @ts-ignore
    <Image
      {...props}
      source={failedSource || source}
      onError={() => setFailedSource(icons['_coin'])}
      style={{
        width: size,
        height: size,
        ...((props.style as any) || {}),
        borderRadius: props.iconUrl ? size / 2 : 0,
      }}
    />
  );
});
