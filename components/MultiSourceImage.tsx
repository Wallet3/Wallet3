import * as Animatable from 'react-native-animatable';

import FastImage, { FastImageProps } from 'react-native-fast-image';
import { ImageSourcePropType, Text, View } from 'react-native';
import React, { useState } from 'react';

import { Feather } from '@expo/vector-icons';
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
  backgroundColor?: string;
  borderRadius?: number;
  onColorParsed?: (colors: ImageColorsResult) => void;
}

export default (props: Props) => {
  const { uriSources, onColorParsed, sourceTypes, controls, paused, backgroundColor, borderRadius } = props;
  const [index, setIndex] = useState(uriSources.findIndex((i) => i));
  const [imageLoaded, setImageLoaded] = useState(false);

  const parseColor = async (url: string) => {
    if (!url) return;
    if (!onColorParsed) return;

    try {
      const result = await ImageColors.getColors(url, { cache: true });
      onColorParsed(result);
    } catch (error) {}
  };

  return (
    <View style={{ backgroundColor, borderRadius, overflow: 'hidden' }}>
      {!imageLoaded && (
        <Animatable.View
          animation={'fadeIn'}
          iterationCount="infinite"
          useNativeDriver
          duration={3000}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Feather name="hexagon" size={64} color="#55555555" />
        </Animatable.View>
      )}

      {sourceTypes[index]?.endsWith('mp4') ? (
        <Video
          source={{ uri: uriSources[index] }}
          style={props.style}
          controls={controls}
          paused={paused}
          onLoad={() => setImageLoaded(true)}
        />
      ) : sourceTypes[index]?.endsWith('svg+xml') || sourceTypes[index]?.endsWith('svg') ? (
        // <SvgUri
        //   uri={uriSources[index] || null}
        //   style={props.style}
        //   width={(props.style as any)?.width}
        //   height={(props.style as any).height}
        // /> app will crash if you pass invalid svg+xml
        <View style={{ ...(props.style || ({} as any)), justifyContent: 'center', alignItems: 'center', backgroundColor }}>
          <Text>SVG not supported yet</Text>
        </View>
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
    </View>
  );
};
