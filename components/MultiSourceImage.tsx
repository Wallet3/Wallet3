import FastImage, { FastImageProps } from 'react-native-fast-image';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';
import React, { useEffect, useState } from 'react';

import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import { SvgUri } from 'react-native-svg';
import Video from 'react-native-video';
import { makeCancelable } from '../utils/promise';

// @ts-ignore
interface Props extends FastImageProps {
  source?: ImageSourcePropType;
  uriSources: (string | undefined)[];
  types: (string | undefined)[];
  controls?: boolean;
  paused?: boolean;
  onColorParsed?: (colors: ImageColorsResult) => void;
}

export default (props: Props) => {
  const { uriSources, onColorParsed, types, controls, paused } = props;
  // const [imageUrl, setImageUrl] = useState(uriSources.find((i) => i));
  const [index, setIndex] = useState(uriSources.findIndex((i) => i));

  const parseColor = async (url: string) => {
    if (!url) return;
    if (!onColorParsed) return;

    try {
      const result = await ImageColors.getColors(url, { cache: true });
      onColorParsed(result);
    } catch (error) {}
  };

  // useEffect(() => {
  //   const url = uriSources[index];
  //   if (!url) return;

  //   setImageUrl(url);
  // }, [index]);

  return types[index]?.endsWith('mp4') ? (
    <Video source={{ uri: uriSources[index] }} style={props.style} controls={controls} paused={paused} />
  ) : types[index]?.endsWith('svg') ? (
    <SvgUri uri={uriSources[index] || null} style={props.style} />
  ) : (
    <FastImage
      {...props}
      source={{ uri: uriSources[index] }}
      onError={() => setIndex((pre) => Math.min(uriSources.length - 1, pre + 1))}
      onLoad={() => parseColor(uriSources[index]!)}
    />
  );
};
