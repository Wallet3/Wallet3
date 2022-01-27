import * as Animatable from 'react-native-animatable';

import { FlatList, ScrollView, Text, TouchableOpacity } from 'react-native';

import { NullableImage } from '../../../components';
import { PageMetadata } from '../Web3View';
import React from 'react';
import { borderColor } from '../../../constants/styles';
import { observer } from 'mobx-react-lite';

interface Props {
  onItemPress?: (url: string) => void;
  recentSites: PageMetadata[];
}

export default observer(({ recentSites, onItemPress }: Props) => {
  return (
    <Animatable.View animation={'fadeInUp'} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} />

      <FlatList
        style={{ maxHeight: 52, backgroundColor: '#fff', borderTopWidth: 1, borderColor }}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={recentSites}
        keyExtractor={(item, index) => `${item?.origin}-${index}`}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              onPress={() => onItemPress?.(item.origin)}
              key={`tab-${index}`}
              style={{
                padding: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: item?.themeColor ?? borderColor,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                marginHorizontal: 4,
              }}
            >
              <NullableImage
                uri={item.icon}
                size={15}
                text={item.title}
                fontSize={10}
                imageRadius={2}
                containerStyle={{ marginEnd: 6 }}
              />
              <Text style={{ color: item.themeColor, maxWidth: 150, marginBottom: -1 }} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </Animatable.View>
  );
});
