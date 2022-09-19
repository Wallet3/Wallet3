import * as Animatable from 'react-native-animatable';

import FastImage, { FastImageProps } from 'react-native-fast-image';
import { ImageSourcePropType, View } from 'react-native';
import React, { useState } from 'react';

import { BreathAnimation } from '../utils/animations';
import { Feather } from '@expo/vector-icons';
import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import SvgImage from 'react-native-remote-svg';
import Video from 'react-native-video';
import { getMemorySize } from '../utils/device';

// @ts-ignore
interface Props extends FastImageProps {
  source?: ImageSourcePropType;
  uriSources: (string | undefined)[];
  sourceTypes: (string | undefined)[];
  controls?: boolean;
  paused?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
  loadingIconSize?: number;
  onColorParsed?: (colors: ImageColorsResult) => void;
}

export default (props: Props) => {
  const { uriSources, onColorParsed, sourceTypes, controls, paused, backgroundColor, borderRadius } = props;
  const [index, setIndex] = useState(uriSources.findIndex((i) => i));
  const [imageLoaded, setImageLoaded] = useState(false);

  const parseColor = async (url: string) => {
    if (!url) return;
    if (!onColorParsed) return;
    if ((await getMemorySize()) < 3072) return;

    try {
      const result = await ImageColors.getColors(url, { cache: true });
      onColorParsed(result);
    } catch (error) {}
  };

  return (
    <View style={{ backgroundColor, borderRadius, overflow: 'hidden' }}>
      {uriSources[index]?.endsWith('mp4') || sourceTypes[index]?.endsWith('mp4') ? (
        <Video
          source={{ uri: uriSources[index] }}
          style={props.style}
          controls={controls}
          paused={paused}
          onLoad={() => setImageLoaded(true)}
        />
      ) : uriSources[index]?.endsWith('.svg') ||
        sourceTypes[index]?.endsWith('svg+xml') ||
        sourceTypes[index]?.endsWith('svg') ? (
        <SvgImage source={{ uri: uriSources[index] }} style={props.style} onLoadEnd={() => setImageLoaded(true)} />
      ) : (
        <FastImage
          {...props}
          source={{ uri: uriSources[index] }}
          onError={() => setIndex((pre) => Math.min(uriSources.length - 1, pre + 1))}
          style={props.style}
          onLoad={() => {
            parseColor(uriSources[index]!);
            setImageLoaded(true);
          }}
        />
      )}

      {!imageLoaded && (
        <Animatable.View
          animation={BreathAnimation}
          iterationCount="infinite"
          useNativeDriver
          duration={3000}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <Feather name="hexagon" size={props.loadingIconSize ?? 64} color="#55555555" />
        </Animatable.View>
      )}
    </View>
  );
};
