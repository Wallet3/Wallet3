import * as Animatable from 'react-native-animatable';

import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { FlatList, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity } from 'react-native';

import Bookmarks from '../../../viewmodels/customs/Bookmarks';
import { NullableImage } from '../../../components';
import { PageMetadata } from '../Web3View';
import React from 'react';
import Theme from '../../../viewmodels/settings/Theme';
import { borderColor } from '../../../constants/styles';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

interface Props {
  onItemPress?: (url: string) => void;
}

export default observer(({ onItemPress }: Props) => {
  const { backgroundColor, borderColor, systemBorderColor } = Theme;
  const { t } = i18n;
  const actions = [{ title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' }];
  const { recentSites } = Bookmarks;

  return (
    <Animatable.View animation={'fadeInUp'} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} />

      <FlatList
        style={{ maxHeight: 52, backgroundColor, borderTopWidth: 0.333, borderColor: systemBorderColor }}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 8 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={recentSites}
        keyExtractor={(item, index) => `${item?.origin}-${index}`}
        renderItem={({ item, index }) => {
          const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
            const { index } = e.nativeEvent;

            switch (index) {
              case 0:
                Bookmarks.removeRecentSite(item);
                break;
            }
          };

          return (
            <ContextMenu actions={actions} onPress={onActionPress} previewBackgroundColor={backgroundColor}>
              <TouchableOpacity
                onPress={() => onItemPress?.(item.origin)}
                key={`tab-${index}`}
                style={{
                  padding: 8,
                  borderRadius: 12,
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
                  imageBackgroundColor={backgroundColor}
                />
                <Text style={{ color: item.themeColor || '#999', maxWidth: 150, marginBottom: -1 }} numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            </ContextMenu>
          );
        }}
      />
    </Animatable.View>
  );
});
