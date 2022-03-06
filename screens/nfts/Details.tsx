import { Entypo, Ionicons } from '@expo/vector-icons';
import { Etherscan, Opensea, Rarible } from '../../assets/3rd';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { BlurView } from 'expo-blur';
import { Button } from '../../components';
import { ImageColorsResult } from 'react-native-image-colors/lib/typescript/types';
import LINQ from 'linq';
import { Modalize } from 'react-native-modalize';
import MultiSourceImage from '../../components/MultiSourceImage';
import { NFTTransferring } from '../../viewmodels/transferring/NFTTransferring';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { Portal } from 'react-native-portalize';
import { ReactiveScreen } from '../../utils/device';
import { ScrollView } from 'react-native-gesture-handler';
import SendNFT from '../../modals/SendNFT';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import { TokenTransferring } from '../../viewmodels/transferring/TokenTransferring';
import { observer } from 'mobx-react-lite';
import { openBrowserAsync } from 'expo-web-browser';
import { useModalize } from 'react-native-modalize/lib/utils/use-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation, route }: NativeStackScreenProps<any, any>) => {
  const { item, colorResult } = route.params as { item: Nft; colorResult?: ImageColorsResult };
  const { top } = useSafeAreaInsets();
  const { current } = Networks;
  const { backgroundColor, shadow, foregroundColor } = Theme;
  const [dominantColor, setDominantColor] = useState(backgroundColor);
  const [primaryColor, setPrimaryColor] = useState(foregroundColor);
  const [detailColor, setDetailColor] = useState(foregroundColor);
  const images = [item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.BIG, item.meta?.image?.url?.PREVIEW];
  const [vm, setVM] = useState<NFTTransferring>();

  const { ref: sendRef, open: openSendModal, close: closeSendModal } = useModalize();

  const open = () => {
    setVM(
      new NFTTransferring({
        network: current,
        nft: { ...item, images, title: item.meta?.name, type: item.meta?.image?.meta?.ORIGINAL?.type },
      })
    );
    setTimeout(() => openSendModal(), 10);
  };

  const cleanVM = () => {
    vm?.dispose();
    setVM(undefined);
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

  return (
    <BlurView intensity={10} style={{ flex: 1, backgroundColor: dominantColor }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 57 }}>
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
            style={{ width: '100%', height: '100%', borderRadius: 15, backgroundColor }}
            onColorParsed={parseColor}
            type={item.meta?.image?.meta?.ORIGINAL?.type}
            controls
          />

          {/* <SharedElement id={`nft.${item.id}.photo`}></SharedElement> */}
        </View>

        <Button
          title="Transfer"
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

        {item.meta?.description ? (
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Description</Text>
            <Text style={{ color: primaryColor }}>{item.meta?.description}</Text>
          </View>
        ) : undefined}

        {item.meta?.attributes && item.meta.attributes.length > 0 ? (
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Attributes</Text>
            {LINQ.from(item.meta?.attributes).select((attr, index) => {
              return (
                <View
                  key={`${attr.key}-${index}`}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <Text style={{ color: primaryColor, fontWeight: '500', textTransform: 'capitalize' }}>{attr.key}</Text>
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
            onPress={() => openBrowserAsync(`https://opensea.io/assets/${item.contract}/${item.tokenId}`, {})}
          >
            <Opensea width={22} height={22} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingEnd: 16 }}
            onPress={() => openBrowserAsync(`https://rarible.com/token/${item.contract}:${item.tokenId}?tab=details`, {})}
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

        <TouchableOpacity style={{ marginBottom: -1 }}>
          <Ionicons name="share-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />

      <Portal>
        <Modalize
          ref={sendRef}
          adjustToContentHeight
          disableScrollIfPossible
          onClosed={cleanVM}
          modalStyle={{ borderTopStartRadius: 7, borderTopEndRadius: 7 }}
          scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false }}
        >
          {vm ? <SendNFT vm={vm} /> : undefined}
        </Modalize>
      </Portal>
    </BlurView>
  );
});
