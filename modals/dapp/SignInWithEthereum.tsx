import React, { useRef } from 'react';
import { Text, View } from 'react-native';

import { NullableImage } from '../../components';
import { PageMetadata } from '../../screens/browser/Web3View';
import { ParsedMessage } from '../../utils/siwe';
import Swiper from 'react-native-swiper';
import { observer } from 'mobx-react-lite';

interface Props {
  metadata?: PageMetadata;
  siwe: ParsedMessage;
  backgroundColor: string;
}

export default observer(({ metadata, siwe, backgroundColor }: Props) => {
  const swiper = useRef<Swiper>(null);

  return (
    <Swiper showsPagination={false} showsButtons={false} scrollEnabled={false} loop={false}>
      <View>
        <View style={{ flex: 1 }}>
          <NullableImage
            size={72}
            uri={metadata?.icon}
            text={metadata?.title || metadata?.hostname}
            fontSize={36}
            imageRadius={5}
            fontStyle={{ marginTop: 2, marginStart: 2 }}
            containerStyle={{ marginBottom: 20 }}
            imageBackgroundColor={backgroundColor}
          />
        </View>

        <Text>{siwe.statement}</Text>
      </View>
    </Swiper>
  );
});
