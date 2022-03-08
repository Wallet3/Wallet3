import { Entypo, Ionicons } from '@expo/vector-icons';
import { Etherscan, Opensea, Rarible } from '../../assets/3rd';
import React, { useEffect, useState } from 'react';
import { Share, Text, TouchableOpacity, View } from 'react-native';

import Avatar from '../../components/Avatar';
import { BlurView } from 'expo-blur';
import { Button } from '../../components';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import LINQ from 'linq';
import { Modalize } from 'react-native-modalize';
import MultiSourceImage from '../../components/MultiSourceImage';
import { NFTTransferring } from '../../viewmodels/transferring/NonFungibleTokenTransferring';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import { ScrollView } from 'react-native-gesture-handler';
import SendNFT from '../../modals/SendNFT';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { lightOrDark } from '../../utils/color';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation, route }: NativeStackScreenProps<any, any>) => {
  const { item, colorResult } = route.params as { item: Nft; colorResult?: ImageColorsResult };
  const { t } = i18n;
  const { top, bottom } = useSafeAreaInsets();
  const { current } = Networks;
  const { backgroundColor, shadow, foregroundColor, statusBarStyle } = Theme;
  const [dominantColor, setDominantColor] = useState(backgroundColor);
  const [primaryColor, setPrimaryColor] = useState(foregroundColor);
  const [detailColor, setDetailColor] = useState(foregroundColor);
  const [mode, setMode] = useState<'light' | 'dark'>(statusBarStyle);

  const images = [item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.BIG, item.meta?.image?.url?.PREVIEW];
  const types = [
    item.meta?.image?.meta?.ORIGINAL?.type,
    item.meta?.image?.meta?.BIG?.type,
    item.meta?.image?.meta?.PREVIEW?.type,
  ];

  const [vm] = useState<NFTTransferring | undefined>(
    new NFTTransferring({
      network: current,
      nft: { ...item, images, types, title: item.meta?.name },
    })
  );

  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();

  const open = () => {
    setTimeout(() => openSendModal(), 10);
  };

  const parseColor = async (result: ImageColorsResult) => {
    switch (result.platform) {
      case 'android':
        setDominantColor(result.dominant || backgroundColor);
        setPrimaryColor(result.average || foregroundColor);
        setDetailColor(result.vibrant || foregroundColor);
        break;
      case 'ios':
        setDominantColor(result.background || backgroundColor);
        setPrimaryColor(result.primary || foregroundColor);
        setDetailColor(result.detail || foregroundColor);
        break;
    }
  };

  useEffect(() => {
    if (!colorResult) return;
    parseColor(colorResult);
  }, [colorResult]);

  useEffect(() => {
    if (types.find((t) => t?.endsWith('mp4'))) return;
    setMode(lightOrDark(dominantColor) === 'light' ? 'dark' : 'light');
  }, [dominantColor]);

  useEffect(() => {
    return () => {
      vm?.dispose();
    };
  }, []);

  return (
    <BlurView intensity={10} style={{ flex: 1, backgroundColor: dominantColor }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 57, paddingBottom: bottom }}>
        <View
          style={{
            ...shadow,
            shadowRadius: 16,
            shadowOpacity: 0.8,
            width: '90%',
            height: ReactiveScreen.width * 0.9,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        >
          <MultiSourceImage
            uriSources={images}
            style={{ width: '100%', height: '100%', borderRadius: 15 }}
            backgroundColor={backgroundColor}
            borderRadius={15}
            onColorParsed={parseColor}
            sourceTypes={types}
            controls
          />

          {/* <SharedElement id={`nft.${item.id}.photo`}></SharedElement> */}
        </View>

        <Button
          title={t('nft-button-transfer')}
          txtStyle={{ color: dominantColor }}
          themeColor={primaryColor}
          icon={() => <Entypo name="paper-plane" color={dominantColor} size={16} />}
          onPress={open}
          style={{
            marginHorizontal: 16,
            borderRadius: 25,
            marginVertical: 16,
            ...shadow,
            shadowOffset: { height: 0, width: 0 },
            shadowRadius: 12,
            shadowOpacity: 0.9,
          }}
        />

        {vm?.nftType ? (
          <View style={{ padding: 16, paddingTop: 8 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
              {t('nft-txt-ownership')}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: primaryColor, fontWeight: '500', textTransform: 'capitalize' }}>{t('nft-txt-owner')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', maxWidth: '80%' }}>
                <Avatar
                  uri={vm.account.avatar}
                  size={15}
                  emoji={vm.account.emojiAvatar}
                  backgroundColor={vm.account.emojiColor}
                  emojiSize={6}
                  emojiMarginTop={0}
                  emojiMarginStart={0}
                  style={{ marginEnd: 6 }}
                />

                <Text style={{ fontSize: 14, color: primaryColor, fontWeight: '500' }} numberOfLines={1}>
                  {vm.account.displayName}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: primaryColor, fontWeight: '500' }}>{t('nft-txt-nft-type')}</Text>
              <View style={{ backgroundColor: primaryColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 12, color: dominantColor, fontWeight: '600', textTransform: 'uppercase' }}>
                  {vm.nftType}
                </Text>
              </View>
            </View>
          </View>
        ) : undefined}

        {item.meta?.description ? (
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
              {t('nft-txt-description')}
            </Text>
            <Text style={{ color: primaryColor }}>{item.meta?.description}</Text>
          </View>
        ) : undefined}

        {item.meta?.attributes && item.meta.attributes.filter((a) => a.value).length > 0 ? (
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
              {t('nft-txt-attributes')}
            </Text>
            {LINQ.from(item.meta?.attributes.filter((a) => a.value)).select((attr, index) => {
              return (
                <View
                  key={`${attr.key}-${index}`}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
                >
                  <Text style={{ color: primaryColor, fontWeight: '500' }}>
                    {attr.key[0]?.toUpperCase() + attr.key.slice(1)}
                  </Text>
                  <Text style={{ color: primaryColor, fontWeight: '500', textTransform: 'capitalize' }}>{attr.value}</Text>
                </View>
              );
            })}
          </View>
        ) : undefined}

        <View style={{ padding: 16, paddingTop: 0, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ paddingEnd: 16 }}
            onPress={() => openBrowserAsync(`${current.explorer}/nft/${item.contract}/${item.tokenId}`, {})}
          >
            <Etherscan width={22} height={22} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingEnd: 16 }}
            onPress={() =>
              openBrowserAsync(
                current.chainId === 1
                  ? `https://opensea.io/assets/${item.contract}/${item.tokenId}`
                  : `https://opensea.io/assets/${current.symbol.toLowerCase()}/${item.contract}/${item.tokenId}`,
                {}
              )
            }
          >
            <Opensea width={22} height={22} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingEnd: 16 }}
            onPress={() =>
              openBrowserAsync(
                current.chainId === 1
                  ? `https://rarible.com/token/${item.contract}:${item.tokenId}`
                  : `https://rarible.com/token/${current.network.toLowerCase()}/${item.contract}:${item.tokenId}`
              )
            }
          >
            <Rarible width={22} height={22} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View
        style={{
          marginTop: top,
          flexDirection: 'row',
          position: 'absolute',
          padding: 16,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons name="arrow-back-outline" size={20} color={primaryColor} />
        </TouchableOpacity>

        <Text
          numberOfLines={1}
          style={{
            color: primaryColor,
            alignSelf: 'center',
            fontSize: 19,
            marginStart: 12,
            fontWeight: '600',
            marginBottom: -1,
            maxWidth: '75%',
          }}
        >
          {item.meta?.name}
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={{ marginBottom: -1 }}
          onPress={() => Share.share({ message: item.meta?.name || '', url: images.find((i) => i) })}
        >
          <Ionicons name="share-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <BlurView
        intensity={10}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: top, backgroundColor: `${dominantColor}20` }}
      />

      <StatusBar style={mode} />

      <Portal>
        <Modalize
          ref={sendRef}
          onClosed={() => vm?.setTo('')}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          {vm ? <SendNFT vm={vm} onClose={closeSendModal} /> : undefined}
        </Modalize>
      </Portal>
    </BlurView>
  );
});
