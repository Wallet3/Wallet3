import FastImage, { FastImageProps } from 'react-native-fast-image';
import { Image, ImageProps } from 'react-native';
import React, { useEffect, useState } from 'react';

import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import { makeCancelable } from '../utils/promise';

export default (
  props: FastImageProps & { uriSources: (string | undefined)[]; onColorParsed?: (colors: ImageColorsResult) => void }
) => {
  const { uriSources, onColorParsed } = props;
  const [imageUrl, setImageUrl] = useState(uriSources[0]);
  const [index, setIndex] = useState(0);

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

  return (
    <FastImage
      {...props}
      source={{ uri: imageUrl }}
      onError={() => setIndex((pre) => Math.min(uriSources.length - 1, pre + 1))}
      onLoad={() => parseColor(imageUrl!)}
    />
  );
};
