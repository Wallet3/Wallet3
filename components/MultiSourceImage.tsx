import { Image, ImageProps } from 'react-native';
import React, { useEffect, useState } from 'react';

import ImageColors from 'react-native-image-colors';

export default (props: ImageProps & { uriSources: string[] }) => {
  const { uriSources } = props;
  const [imageUrl, setImageUrl] = useState(uriSources[0]);

  const parseColor = async () => {
    for (let url of uriSources) {
      if (!url) continue;

      try {
        await ImageColors.getColors(url, { cache: true });
        setImageUrl(url);
        console.log(url);
        break;
      } catch (error) {}
    }
  };

  useEffect(() => {
    parseColor();
  }, []);

  return <Image {...props} source={{ uri: imageUrl }} />;
};
