import * as Animatable from 'react-native-animatable';

import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Directions, FlatList, Gesture, GestureDetector } from 'react-native-gesture-handler';
import { NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import Bookmarks from '../../../viewmodels/customs/Bookmarks';
import { NullableImage } from '../../../components';
import React from 'react';
import Theme from '../../../viewmodels/settings/Theme';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { runOnJS } from 'react-native-reanimated';
import { startLayoutAnimation } from '../../../utils/animations';

interface Props {
  onItemPress?: (url: string) => void;
  tabCount?: number;
  onTabsPress?: () => void;
  disableContextMenu?: boolean;
  onRemoveAllTabs?: () => void;
}

export default observer(({ onItemPress, tabCount, onTabsPress, disableContextMenu, onRemoveAllTabs }: Props) => {
  const { backgroundColor, borderColor, systemBorderColor, foregroundColor, isLightMode, mode, tintColor } = Theme;
  const { t } = i18n;
  const { recentSites } = Bookmarks;
  const actions = [{ title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' }];

  function callRemoveAllTabs() {
    'worklet';
    if (!onRemoveAllTabs) return;
    runOnJS(onRemoveAllTabs!)();
  }

  const flingGesture = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd(() => callRemoveAllTabs());

  return (
    <Animatable.View animation={'fadeInUp'}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderTopWidth: 0.333,
          borderColor: systemBorderColor,
          paddingVertical: 4.3333,
        }}
      >
        {(tabCount || 0) > 1 && (
          <GestureDetector gesture={flingGesture}>
            <View
              style={{
                paddingTop: 2.5,
                height: '100%',
                borderEndWidth: 0.333,
                borderEndColor: systemBorderColor,
              }}
            >
              <TouchableOpacity style={{ paddingStart: 12, paddingEnd: 10 }} onPress={onTabsPress}>
                <View
                  style={{
                    borderColor: tintColor,
                    borderWidth: 1.5,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 4,
                    height: 29,
                    width: 37,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: tintColor }}>{tabCount}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </GestureDetector>
        )}

        <FlatList
          data={recentSites}
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 5 }}
          keyExtractor={(item) => item.origin}
          renderItem={({ item, index }) => {
            const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
              const { index } = e.nativeEvent;

              switch (index) {
                case 0:
                  startLayoutAnimation();
                  Bookmarks.removeRecentSite(item);
                  break;
              }
            };

            return (
              <ContextMenu
                key={item.origin}
                actions={disableContextMenu ? [] : actions}
                onPress={onActionPress}
                previewBackgroundColor={backgroundColor}
              >
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
      </View>
    </Animatable.View>
  );
});
