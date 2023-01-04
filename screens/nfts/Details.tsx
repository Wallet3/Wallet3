import { Etherscan, Opensea, Polygon, Rarible } from '../../assets/3rd';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import { NFTMetadata, NFTTransferring } from '../../viewmodels/transferring/NonFungibleTokenTransferring';
import { Platform, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import Avatar from '../../components/Avatar';
import { BlurView } from 'expo-blur';
import { Button } from '../../components';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import { InappBrowserModal } from '../Modalize';
import LINQ from 'linq';
import { Modalize } from 'react-native-modalize';
import MultiSourceImage from '../../components/MultiSourceImage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/core/Networks';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import SendNFT from '../../modals/SendNFT';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { lightOrDark } from '../../utils/color';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import { openInappBrowser } from '../../modals/InappBrowser';
import styles from '../../modals/styles';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation, route }: NativeStackScreenProps<any, any>) => {
  const { item, colorResult } = route.params as { item: NFTMetadata; colorResult?: ImageColorsResult };
  const { t } = i18n;
  const { top, bottom } = useSafeAreaInsets();
  const { current } = Networks;
  const { backgroundColor, shadow, foregroundColor, statusBarStyle } = Theme;
  const [dominantColor, setDominantColor] = useState(backgroundColor);
  const [primaryColor, setPrimaryColor] = useState(foregroundColor);
  const [detailColor, setDetailColor] = useState(foregroundColor);
  const [mode, setMode] = useState<'light' | 'dark'>(statusBarStyle);
  const { images, types } = item;

  const [vm] = useState<NFTTransferring | undefined>(
    new NFTTransferring({
      network: current,
      nft: item,
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

  const openBrowser = (url?: string) => {
    const web = 'https://wallet3.io';
    // Platform.OS === 'ios' ? openBrowserAsync(url || web) :
    openInappBrowser(url || web, 'nfts');
  };

  return (
    <BlurView intensity={10} style={{ flex: 1, backgroundColor: dominantColor }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 57, paddingBottom: bottom }} showsVerticalScrollIndicator={false}>
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

        {vm?.nftStandard && (
          <Button
            title={t('nft-button-transfer')}
            txtStyle={{ color: dominantColor, textTransform: 'none' }}
            themeColor={primaryColor}
            onPress={open}
            icon={() => (
              <EvilIcons name="sc-telegram" color={dominantColor} size={22} style={{ marginEnd: 2, marginTop: -1.25 }} />
            )}
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
        )}

        {vm?.nftStandard ? (
          <View style={{ padding: 16, paddingTop: 10, paddingBottom: 6 }}>
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
              <Text style={{ color: primaryColor, fontWeight: '500' }}>{t('nft-txt-nft-standard')}</Text>
              <View style={{ backgroundColor: primaryColor, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 12, color: dominantColor, fontWeight: '600', textTransform: 'uppercase' }}>
                  {vm.nftStandard}
                </Text>
              </View>
            </View>
          </View>
        ) : undefined}

        {item.description ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
              {t('nft-txt-description')}
            </Text>
            <Text style={{ color: primaryColor }}>{item.description}</Text>
          </View>
        ) : undefined}

        {item.attributes && item.attributes.filter((a) => a.value).length > 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
              {t('nft-txt-attributes')}
            </Text>
            {LINQ.from(item.attributes.filter((a) => a.value)).select((attr, index) => {
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

        {[1, 137].includes(current.chainId) && (
          <View style={{ padding: 16 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>{t('nft-txt-web3')}</Text>

            <View style={{ paddingTop: 4, flexDirection: 'row', alignItems: 'center' }}>
              {[1].includes(current.chainId) && (
                <TouchableOpacity
                  style={{ paddingEnd: 20 }}
                  onPress={() => openBrowser(`${current.explorer}/nft/${item.contract}/${item.tokenId}`)}
                >
                  <Etherscan width={24} height={24} />
                </TouchableOpacity>
              )}
              {[137].includes(current.chainId) && (
                <TouchableOpacity
                  style={{ paddingEnd: 20 }}
                  onPress={() => openBrowser(`${current.explorer}/token/${item.contract}?a=${item.tokenId}`)}
                >
                  <Polygon width={23} height={24} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={{ paddingEnd: 20 }} onPress={() => openBrowser(vm?.openseaLink)}>
                <Opensea width={24} height={24} />
              </TouchableOpacity>

              <TouchableOpacity style={{ paddingEnd: 20 }} onPress={() => openBrowser(vm?.raribleLink)}>
                <Rarible width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
          <Ionicons
            name="arrow-back-outline"
            size={20}
            color={primaryColor}
            style={{ shadowColor: dominantColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 3, shadowOpacity: 0.5 }}
          />
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
            maxWidth: '65%',
            textShadowColor: dominantColor || '#585858',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 3,
          }}
        >
          {item.title}
        </Text>

        <View style={{ flex: 1 }} />

        {/* <TouchableOpacity style={{ paddingHorizontal: 8, marginEnd: 8, marginTop: -1 }} onPress={open}>
          <EvilIcons
            name="sc-telegram"
            size={31}
            color={primaryColor}
            style={{ shadowColor: dominantColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 3, shadowOpacity: 0.5 }}
          />
        </TouchableOpacity> */}

        <TouchableOpacity
          style={{ marginBottom: -1 }}
          onPress={() => Share.share({ message: item.title || '', url: images.find((i) => i) })}
        >
          <Ionicons
            name="share-outline"
            size={24}
            color={primaryColor}
            style={{ shadowColor: dominantColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 3, shadowOpacity: 0.5 }}
          />
        </TouchableOpacity>
      </View>

      <StatusBar style={mode} />

      <Portal>
        <Modalize
          ref={sendRef}
          onClosed={() => vm?.setTo('')}
          adjustToContentHeight
          disableScrollIfPossible
          modalStyle={styles.containerTopBorderRadius}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          {vm ? <SendNFT vm={vm} onClose={closeSendModal} /> : undefined}
        </Modalize>

        <InappBrowserModal pageKey="nfts" />
      </Portal>
    </BlurView>
  );
});
