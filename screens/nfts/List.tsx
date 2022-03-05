import { FlatList, Image, ListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';

import App from '../../viewmodels/App';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import MultiSourceImage from '../../components/MultiSourceImage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { ReactiveScreen } from '../../utils/device';
import { SharedElement } from 'react-navigation-shared-element';
import { TextInput } from 'react-native-gesture-handler';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation }: NativeStackScreenProps<any, any>) => {
  const { currentAccount } = App;
  const { current } = Networks;
  const { top } = useSafeAreaInsets();
  const { backgroundColor, shadow, mode, foregroundColor, borderColor } = Theme;
  const imageHeight = ReactiveScreen.width - 16 * 2;
  const [activeSearch, setActiveSearch] = useState(false);

  if (!currentAccount) return null;

  const renderItem = ({ item }: ListRenderItemInfo<Nft>) => {
    const images = [item.meta?.image?.url?.BIG, item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.PREVIEW];
    const type = item.meta?.image?.meta?.ORIGINAL?.type;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.75}
        style={{ marginBottom: 16, ...shadow }}
        onPress={() => navigation.push('NFTDetails', { item })}
      >
        <SharedElement id={`nft.${item.id}.photo`}>
          <MultiSourceImage
            uriSources={images}
            type={type}
            style={{ width: '100%', height: imageHeight, backgroundColor, borderRadius: 10 }}
            paused
          />
        </SharedElement>

        <View
          style={{
            position: 'absolute',
            bottom: 12,
            left: '15%',
            right: '15%',
            ...shadow,
            shadowOffset: { height: 1, width: 0 },
            shadowOpacity: 0.2,
          }}
        >
          <View
            style={{
              borderRadius: 25,
              overflow: 'hidden',
            }}
          >
            <BlurView
              tint={mode}
              intensity={25}
              style={{
                padding: 16,
                paddingStart: 20,
                paddingVertical: 15,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                backgroundColor: `${backgroundColor}20`,
              }}
            >
              <Text style={{ color: foregroundColor, fontWeight: '500', fontSize: 17, maxWidth: '80%' }} numberOfLines={1}>
                {item.meta?.name}
              </Text>
              {generateNetworkIcon({ ...current, hideEVMTitle: true, width: 22, style: { marginStart: 8 } })}
            </BlurView>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const headerHeight = 44;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <FlatList
        data={currentAccount.nfts.nfts}
        renderItem={renderItem}
        initialNumToRender={5}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        contentContainerStyle={{ marginHorizontal: 16, paddingTop: top }}
      />
      {/* <BlurView
        tint={mode}
        intensity={45}
        style={{
          height: headerHeight + top + 6,
          width: '100%',
          paddingTop: top + 4,
          ...shadow,
          shadowOpacity: 0.2,
          paddingHorizontal: 16,
          paddingBottom: 2,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: activeSearch ? `${foregroundColor}7a` : `${foregroundColor}10`,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            paddingVertical: 8,
          }}
        >
          <Ionicons
            name="ios-search-outline"
            size={18}
            color={activeSearch ? `${foregroundColor}7a` : `${foregroundColor}10`}
            style={{ marginBottom: -1 }}
          />
          <TextInput
            onBlur={() => setActiveSearch(false)}
            onFocus={() => setActiveSearch(true)}
            style={{ fontSize: 17, color: foregroundColor, flex: 1, marginStart: 8 }}
          />
        </View>
      </BlurView> */}
    </View>
  );
});
