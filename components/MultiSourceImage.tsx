import FastImage, { FastImageProps } from 'react-native-fast-image';
import { ImageSourcePropType, Text, View } from 'react-native';
import React, { useState } from 'react';

import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import { SvgUri } from 'react-native-svg';
import Video from 'react-native-video';

// @ts-ignore
interface Props extends FastImageProps {
  source?: ImageSourcePropType;
  uriSources: (string | undefined)[];
  sourceTypes: (string | undefined)[];
  controls?: boolean;
  paused?: boolean;
  onColorParsed?: (colors: ImageColorsResult) => void;
}

export default (props: Props) => {
  const { uriSources, onColorParsed, sourceTypes, controls, paused } = props;
  const [index, setIndex] = useState(uriSources.findIndex((i) => i));

  const parseColor = async (url: string) => {
    if (!url) return;
    if (!onColorParsed) return;

    try {
      const result = await ImageColors.getColors(url, { cache: true });
      onColorParsed(result);
    } catch (error) {}
  };

  return sourceTypes[index]?.endsWith('mp4') ? (
    <Video source={{ uri: uriSources[index] }} style={props.style} controls={controls} paused={paused} />
  ) : sourceTypes[index]?.endsWith('svg+xml') || sourceTypes[index]?.endsWith('svg') ? (
    // <SvgUri
    //   uri={uriSources[index] || null}
    //   style={props.style}
    //   width={(props.style as any)?.width}
    //   height={(props.style as any).height}
    // /> app will crash if you pass invalid svg+xml
    <View style={{ ...(props.style || ({} as any)), justifyContent: 'center', alignItems: 'center' }}>
      <Text>SVG not supported yet</Text>
    </View>
  ) : (
    <FastImage
      {...props}
      source={{ uri: uriSources[index] }}
      onError={() => setIndex((pre) => Math.min(uriSources.length - 1, pre + 1))}
      onLoad={() => parseColor(uriSources[index]!)}
    />
  );
};
