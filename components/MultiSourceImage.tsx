import FastImage, { FastImageProps } from 'react-native-fast-image';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';
import React, { useEffect, useState } from 'react';

import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import Video from 'react-native-video';
import { makeCancelable } from '../utils/promise';

// @ts-ignore
interface Props extends FastImageProps {
  source?: ImageSourcePropType;
  uriSources: (string | undefined)[];
  onColorParsed?: (colors: ImageColorsResult) => void;
  type?: string;
  controls?: boolean;
  paused?: boolean;
}

export default (props: Props) => {
  const { uriSources, onColorParsed, type, controls, paused } = props;
  const [imageUrl, setImageUrl] = useState(uriSources.find((i) => i));
  const [index, setIndex] = useState(uriSources.findIndex((i) => i));

  const parseColor = async (url: string) => {
    try {
      const result = await ImageColors.getColors(url, { cache: true });
      onColorParsed?.(result);
    } catch (error) {}
  };

  useEffect(() => {
    const url = uriSources[index];
    if (!url) return;

    setImageUrl(url);
  }, [index]);

  return type?.endsWith('mp4') ? (
    <Video source={{ uri: imageUrl }} style={props.style} controls={controls} paused={paused} />
  ) : (
    <FastImage
      {...props}
      source={{ uri: imageUrl }}
      onError={() => setIndex((pre) => Math.min(uriSources.length - 1, pre + 1))}
      onLoad={() => parseColor(imageUrl!)}
    />
  );
};
