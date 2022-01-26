import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Image, ListRenderItemInfo, NativeSyntheticEvent, Text, TouchableOpacity } from 'react-native';

import { Bookmark } from '../../../viewmodels/customs/Bookmarks';
import CachedImage from 'react-native-expo-cached-image';
import React from 'react';
import i18n from '../../../i18n';
import { thirdFontColor } from '../../../constants/styles';

const DefaultIcon = require('../../../assets/default-icon.png');

const { t } = i18n;

interface Props extends ListRenderItemInfo<Bookmark> {
  onPress?: (item: Bookmark) => void;
  iconSize: number;
}

export const renderBookmarkItem = ({ item, onPress, iconSize }: Props) => {
  return (
    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => onPress?.(item)}>
      {item.icon ? (
        <CachedImage source={{ uri: item.icon }} style={{ width: iconSize, height: iconSize, borderRadius: 7 }} />
      ) : (
        <Image source={DefaultIcon} style={{ width: iconSize, height: iconSize, borderRadius: 7 }} />
      )}

      <Text numberOfLines={1} style={{ maxWidth: iconSize + 8, marginTop: 4, fontSize: 9, color: thirdFontColor }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

interface UserBookmarkProps extends Props {
  onRemove?: (item: Bookmark) => void;
}

export const renderUserBookmarkItem = (props: UserBookmarkProps) => {
  const { onRemove, item, iconSize, onPress } = props;
  const actions = [{ title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' }];

  const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;

    switch (index) {
      case 0:
        onRemove?.(item);
        break;
    }
  };

  return (
    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => onPress?.(item)}>
      <ContextMenu actions={actions} onPress={onActionPress}>
        {item.icon ? (
          <CachedImage source={{ uri: item.icon }} style={{ width: iconSize, height: iconSize, borderRadius: 7 }} />
        ) : (
          <Image source={DefaultIcon} style={{ width: iconSize, height: iconSize, borderRadius: 7 }} />
        )}
      </ContextMenu>

      <Text numberOfLines={1} style={{ maxWidth: iconSize + 8, marginTop: 4, fontSize: 9, color: thirdFontColor }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};
