import ContextMenu, { ContextMenuOnPressNativeEvent } from 'react-native-context-menu-view';
import { Image, ListRenderItemInfo, NativeSyntheticEvent, Share, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { Bookmark } from '../../../viewmodels/customs/Bookmarks';
import CachedImage from 'react-native-fast-image';
import { NullableImage } from '../../../components';
import React from 'react';
import i18n from '../../../i18n';
import { thirdFontColor } from '../../../constants/styles';

const { t } = i18n;

interface Props extends ListRenderItemInfo<Bookmark> {
  onPress?: (item: Bookmark) => void;
  iconSize: number;
  imageBackgroundColor: string;
}

export const renderBookmarkItem = ({ item, onPress, iconSize, imageBackgroundColor }: Props) => {
  return (
    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => onPress?.(item)}>
      <NullableImage
        uri={item.icon}
        size={iconSize}
        text={item.title}
        imageRadius={7}
        fontSize={15}
        imageBackgroundColor={imageBackgroundColor}
      />
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
  const { onRemove, item, iconSize, onPress, imageBackgroundColor } = props;
  const actions = [
    { title: t('button-share'), systemIcon: 'square.and.arrow.up' },
    { title: t('button-remove'), destructive: true, systemIcon: 'trash.slash' },
  ];

  const onActionPress = (e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>) => {
    const { index } = e.nativeEvent;

    switch (index) {
      case 0:
        Share.share({ title: item.title, url: item.url });
        break;
      case 1:
        onRemove?.(item);
        break;
    }
  };

  return (
    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => onPress?.(item)}>
      <ContextMenu actions={actions} onPress={onActionPress}>
        <NullableImage
          uri={item.icon}
          size={iconSize}
          text={item.title}
          imageRadius={7}
          fontSize={18}
          imageBackgroundColor={imageBackgroundColor}
        />
      </ContextMenu>

      <Text numberOfLines={1} style={{ maxWidth: iconSize, marginTop: 4, fontSize: 9, color: thirdFontColor }}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};
