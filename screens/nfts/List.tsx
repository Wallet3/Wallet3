import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import App from '../../viewmodels/core/App';
import { BlurView } from 'expo-blur';
import { INetwork } from '../../common/Networks';
import { Ionicons } from '@expo/vector-icons';
import MultiSourceImage from '../../components/MultiSourceImage';
import { NFTMetadata } from '../../viewmodels/transferring/NonFungibleTokenTransferring';
import Networks from '../../viewmodels/core/Networks';
import { ReactiveScreen } from '../../utils/device';
import { SharedElement } from 'react-navigation-shared-element';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { isAndroid } from '../../utils/platform';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TitleView = isAndroid ? View : BlurView;

const NFTItem = ({
  nft,
  navigation,
  imageHeight,
  mode,
  shadow,
  backgroundColor,
  foregroundColor,
  network,
}: {
  navigation: NativeStackNavigationProp<any, any>;
  imageHeight: number;
  mode: 'light' | 'dark';
  shadow: any;
  backgroundColor: string;
  foregroundColor: string;
  network: INetwork;
  nft: NFTMetadata;
}) => {
  const [titleColor] = useState(foregroundColor);
  const { previews, previewTypes } = nft;
  const { borderColor } = Theme;

  return (
    <TouchableOpacity
      key={nft.id}
      activeOpacity={0.75}
      style={{ marginBottom: 16, backgroundColor, ...shadow, borderWidth: isAndroid ? 1 : 0, borderColor, borderRadius: 12 }}
      onPress={() => navigation.push('NFTDetails', { item: nft })}
    >
      <SharedElement id={`nft.${nft.id}.photo`}>
        <MultiSourceImage
          uriSources={previews}
          sourceTypes={previewTypes}
          backgroundColor={backgroundColor}
          borderRadius={12}
          style={{ width: '100%', height: imageHeight }}
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
          <TitleView
            tint={mode}
            intensity={10}
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
            <Text
              style={{
                color: titleColor,
                fontWeight: '500',
                fontSize: 17,
                maxWidth: '80%',
                paddingStart: 2,
                textShadowColor: '#585858',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
              numberOfLines={1}
            >
              {nft.title}
            </Text>
            {generateNetworkIcon({ ...network, hideEVMTitle: true, width: 22, style: { marginStart: 8 } })}
          </TitleView>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default observer(({ navigation }: NativeStackScreenProps<any, any>) => {
  const { currentAccount } = App;
  const { current } = Networks;
  const { top } = useSafeAreaInsets();
  const { backgroundColor, shadow, mode, foregroundColor, secondaryTextColor } = Theme;
  const imageHeight = ReactiveScreen.width - 16 * 2;
  const [activeSearch, setActiveSearch] = useState(false);

  if (!currentAccount) return null;

  const headerHeight = 44;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {currentAccount.nfts.nfts.length === 0 && (
        <View
          style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', position: 'absolute', top: '50%' }}
        >
          <Ionicons name="server-outline" size={32} color={secondaryTextColor} />
          <Text style={{ marginTop: 12, color: secondaryTextColor }}>No NFTs Yet</Text>
        </View>
      )}

      <FlatList
        data={currentAccount.nfts.nfts}
        initialNumToRender={5}
        contentContainerStyle={{ marginHorizontal: 16, paddingTop: top }}
        renderItem={({ item }) => (
          <NFTItem
            nft={item}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            imageHeight={imageHeight}
            mode={mode}
            navigation={navigation}
            network={current}
            shadow={shadow}
          />
        )}
      />

      {/* <BlurView
        tint={mode}
        intensity={25}
        style={{
          height: top,
          position: 'absolute',
          width: '100%',
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
