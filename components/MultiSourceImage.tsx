import { Image, ImageProps } from 'react-native';
import React, { useEffect, useState } from 'react';

import ImageColors from 'react-native-image-colors';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';

export default (
  props: ImageProps & { uriSources: (string | undefined)[]; onColorParsed?: (colors: ImageColorsResult) => void }
) => {
  const { uriSources, onColorParsed } = props;
  const [imageUrl, setImageUrl] = useState(uriSources[0]);

  const parseColor = async () => {
    for (let url of uriSources) {
      if (!url) continue;

      try {
        const result = await ImageColors.getColors(url, { cache: true });
        setImageUrl(url);
        onColorParsed?.(result);
        break;
      } catch (error) {}
    }
  };

  useEffect(() => {
    parseColor();
  }, [uriSources]);

  return <Image {...props} source={{ uri: imageUrl }} />;
};
