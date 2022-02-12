import { Image, Text, TouchableOpacity, View } from 'react-native';

import { FlatGrid } from 'react-native-super-grid';
import { Ionicons } from '@expo/vector-icons';
import { NullableImage } from '../../../components';
import React from 'react';
import { StateViewModel } from '../MultiTabIndex';
import Theme from '../../../viewmodels/settings/Theme';

const WebTab = ({
  pageId,
  globalState,
  onRemovePress,
  listIndex,
  onPress,
}: {
  globalState: StateViewModel;
  pageId: number;
  listIndex: number;
  onPress?: (listIndex: number) => void;
  onRemovePress?: (pageId: number) => void;
}) => {
  const meta = globalState.pageMetas.get(pageId);
  const themeColor = '#000';
  const snapshot = globalState.pageSnapshots.get(pageId);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(listIndex)}
      style={{
        width: 170,
        borderRadius: 7,
        backgroundColor: '#fff',
        shadowColor: `#00000060`,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 3.14,
        shadowOpacity: 0.5,
        elevation: 5,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingStart: 10,
          backgroundColor: themeColor,
          borderColor: themeColor,
          borderWidth: 1,
          borderTopEndRadius: 10,
          borderTopStartRadius: 10,

          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {meta && (
            <NullableImage
              imageBackgroundColor={themeColor}
              uri={meta?.icon}
              size={12}
              containerStyle={{ marginEnd: 8 }}
              imageRadius={2}
            />
          )}

          <Text style={{ color: 'white', fontWeight: '500', fontSize: 12, maxWidth: 100 }} numberOfLines={1}>
            {meta?.title ?? 'Blank Page'}
          </Text>
        </View>

        <TouchableOpacity
          style={{ paddingTop: 7, paddingBottom: 5, paddingHorizontal: 12, paddingStart: 16, opacity: 0 }}
          //   onPress={() => onRemovePress?.(pageId)}
        >
          <Ionicons name="ios-close" color="#fff" size={15} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          borderWidth: snapshot ? 0 : 1,
          height: 170,
          borderColor: themeColor,
          borderBottomEndRadius: 5,
          borderBottomStartRadius: 5,
        }}
      >
        {snapshot ? (
          <Image
            source={{ uri: snapshot }}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',

              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
            }}
          />
        ) : undefined}
      </View>
    </TouchableOpacity>
  );
};

export const WebTabs = ({
  globalState,
  onJumpToPage,
  onRemovePage,
}: {
  globalState: StateViewModel;
  onJumpToPage: (listIndex: number) => void;
  onRemovePage: (pageId: number) => void;
}) => {
  const { backgroundColor } = Theme;

  return (
    <View style={{ maxHeight: 600, minHeight: 430, backgroundColor, borderTopEndRadius: 6, borderTopStartRadius: 6 }}>
      <FlatGrid
        data={Array.from(globalState.pageMetas.keys())}
        keyExtractor={(i) => `Tab-${i}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 37 }}
        itemDimension={170}
        spacing={16}
        renderItem={({ item, index }) => (
          <WebTab
            globalState={globalState}
            pageId={item}
            listIndex={index}
            onPress={onJumpToPage}
            onRemovePress={onRemovePage}
          />
        )}
      />
    </View>
  );
};
