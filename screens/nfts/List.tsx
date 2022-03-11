import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';

import App from '../../viewmodels/App';
import { BlurView } from 'expo-blur';
import { INetwork } from '../../common/Networks';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import MultiSourceImage from '../../components/MultiSourceImage';
import Networks from '../../viewmodels/Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { ReactiveScreen } from '../../utils/device';
import { SharedElement } from 'react-navigation-shared-element';
import Theme from '../../viewmodels/settings/Theme';
import { generateNetworkIcon } from '../../assets/icons/networks/color';
import { lightOrDark } from '../../utils/color';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  nft: Nft;
}) => {
  const [colorResult, setColorResult] = useState<ImageColorsResult>();
  const [nftBackgroundColor, setNftBackgroundColor] = useState<string>();
  const [titleColor, setTitleColor] = useState(foregroundColor);

  const images = [nft.meta?.image?.url?.BIG, nft.meta?.image?.url?.ORIGINAL, nft.meta?.image?.url?.PREVIEW];
  const types = [
    nft.meta?.image?.meta?.BIG?.type,
    nft.meta?.image?.meta?.ORIGINAL?.type,
    nft.meta?.image?.meta?.PREVIEW?.type,
  ];

  useEffect(() => {
    if (!nftBackgroundColor) return;
    setTitleColor(lightOrDark(nftBackgroundColor) === 'light' ? '#222' : '#ffffffee');
  }, [nftBackgroundColor]);

  return (
    <TouchableOpacity
      key={nft.id}
      activeOpacity={0.75}
      style={{ marginBottom: 16, ...shadow }}
      onPress={() => navigation.push('NFTDetails', { item: nft, colorResult })}
    >
      <SharedElement id={`nft.${nft.id}.photo`}>
        <MultiSourceImage
          uriSources={images}
          sourceTypes={types}
          backgroundColor={backgroundColor}
          borderRadius={10}
          style={{ width: '100%', height: imageHeight }}
          paused
          onColorParsed={(result) => {
            setColorResult(result);
            setNftBackgroundColor(result['background'] || result['dominant']);
          }}
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
                textShadowColor: nftBackgroundColor || '#585858',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 4,
              }}
              numberOfLines={1}
            >
              {nft.meta?.name}
            </Text>
            {generateNetworkIcon({ ...network, hideEVMTitle: true, width: 22, style: { marginStart: 8 } })}
          </BlurView>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default observer(({ navigation }: NativeStackScreenProps<any, any>) => {
  const { currentAccount } = App;
  const { current } = Networks;
  const { top } = useSafeAreaInsets();
  const { backgroundColor, shadow, mode, foregroundColor } = Theme;
  const imageHeight = ReactiveScreen.width - 16 * 2;
  const [activeSearch, setActiveSearch] = useState(false);

  if (!currentAccount) return null;

  const headerHeight = 44;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <FlatList
        data={currentAccount.nfts.nfts}
        initialNumToRender={5}
        contentContainerStyle={{ marginHorizontal: 16, paddingTop: top + 4 }}
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
