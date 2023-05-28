import * as Animatable from 'react-native-animatable';

import FastImage, { FastImageProps } from 'react-native-fast-image';
import { ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';
import React, { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BreathAnimation } from '../utils/animations';
import { Feather } from '@expo/vector-icons';
import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import SvgImage from 'react-native-remote-svg';
import Video from 'react-native-video';
import { convertIPFSProtocol } from '../utils/url';
import { getMemorySize } from '../utils/device';
import { md5 } from '../utils/cipher';

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
  loadingIconStyle?: StyleProp<ViewStyle>;
  onColorParsed?: (colors: ImageColorsResult) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export default (props: Props) => {
  const { uriSources, onColorParsed, sourceTypes, controls, paused, backgroundColor, borderRadius, containerStyle } = props;
  const [index, setIndex] = useState(uriSources.findIndex((i) => i));
  const [source, setSource] = useState(convertIPFSProtocol(uriSources[index]));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [trySvg, setTrySvg] = useState(false);

  const parseColor = async (url: string) => {
    if (!url) return;
    if (!onColorParsed) return;
    if ((await getMemorySize()) < 3072) return;

    const itemKey = `image-colors-${await md5(url)}`;
    const cache = await AsyncStorage.getItem(itemKey);

    if (typeof cache === 'string') {
      if (cache === '') return;

      onColorParsed(JSON.parse(cache));
      return;
    }

    try {
      const result = await ImageColors.getColors(url, { cache: true });
      if (!result) {
        AsyncStorage.setItem(itemKey, '');
        return;
      }

      AsyncStorage.setItem(itemKey, JSON.stringify(result));
      onColorParsed(result);
    } catch (error) {
      AsyncStorage.setItem(itemKey, '');
    }
  };

  useEffect(() => setSource(convertIPFSProtocol(uriSources[index])), [index]);

  return (
    <View style={{ backgroundColor, borderRadius, overflow: 'hidden', ...(containerStyle || ({} as any)) }}>
      {source?.endsWith('mp4') || sourceTypes[index]?.endsWith('mp4') ? (
        <Video
          source={{ uri: source }}
          style={props.style}
          controls={controls}
          paused={paused}
          onLoad={() => setImageLoaded(true)}
        />
      ) : source?.endsWith('.svg') ||
        source?.startsWith('data:image/svg+xml;') ||
        sourceTypes[index]?.endsWith('svg+xml') ||
        sourceTypes[index]?.endsWith('svg') ||
        trySvg ? (
        <SvgImage source={{ uri: source }} style={props.style} onLoadEnd={() => setImageLoaded(true)} />
      ) : (
        <FastImage
          {...props}
          source={{ uri: source }}
          onError={() => {
            index === uriSources.length - 1 ? setTrySvg(true) : setIndex((pre) => Math.min(uriSources.length - 1, pre + 1));
          }}
          style={props.style}
          onLoad={() => {
            parseColor(source!);
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
          <Feather
            name="hexagon"
            size={props.loadingIconSize || Number((props.style as any)?.width) || 64}
            color="#55555555"
            style={props.loadingIconStyle}
          />
        </Animatable.View>
      )}
    </View>
  );
};
