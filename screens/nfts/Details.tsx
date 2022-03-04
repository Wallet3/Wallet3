import * as Animatable from 'react-native-animatable';

import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';

import { BlurView } from 'expo-blur';
import Etherscan from '../../assets/3rd/etherscan-logo-circle.svg';
// import Image from 'react-native-expo-cached-image';
import ImageColors from 'react-native-image-colors';
import LINQ from 'linq';
import MultiSourceImage from '../../components/MultiSourceImage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Networks from '../../viewmodels/Networks';
import { Nft } from '../../common/apis/Rarible.types';
import { ReactiveScreen } from '../../utils/device';
import { ScrollView } from 'react-native-gesture-handler';
import { SharedElement } from 'react-navigation-shared-element';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { openURL } from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation, route }: NativeStackScreenProps<any, any>) => {
  const { item } = route.params as { item: Nft };
  const { top } = useSafeAreaInsets();
  const { current } = Networks;
  const { backgroundColor, shadow, foregroundColor } = Theme;
  const [dominantColor, setDominantColor] = useState(backgroundColor);
  const [primaryColor, setPrimaryColor] = useState(foregroundColor);
  const [detailColor, setDetailColor] = useState(foregroundColor);
  const [imageUrl, setImageUrl] = useState(item.meta?.image?.url?.ORIGINAL);
  const images = [item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.BIG, item.meta?.image?.url?.PREVIEW].filter(
    (i) => i
  ) as string[];

  const parseColor = async () => {
    const images = [item.meta?.image?.url?.ORIGINAL, item.meta?.image?.url?.BIG, item.meta?.image?.url?.PREVIEW];

    for (let url of images) {
      if (!url) continue;

      try {
        const result = await ImageColors.getColors(url, { cache: true });
        switch (result.platform) {
          case 'android':
            setDominantColor(result.dominant || backgroundColor);
            break;
          case 'ios':
            setDominantColor(result.background || backgroundColor);
            setPrimaryColor(result.primary || foregroundColor);
            setDetailColor(result.detail || foregroundColor);
            break;
        }

        setImageUrl(url);
        break;
      } catch (error) {}
    }
  };

  useEffect(() => {
    parseColor();
  }, []);

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
            source={{ uri: '' }}
            uriSources={images}
            style={{ width: '100%', height: '100%', borderRadius: 15, backgroundColor }}
          />
        </View>
        {/* <SharedElement id={`nft.${item.id}.photo`}></SharedElement> */}

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

        <View style={{ padding: 16, paddingTop: 0 }}>
          <TouchableOpacity
            style={{ paddingVertical: 8 }}
            onPress={() => openURL(`${current.explorer}/nft/${item.id.split(':')[0]}/${item.id.split(':')[1]}`)}
          >
            <Etherscan width={24} height={24} />
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
          style={{
            color: primaryColor,
            alignSelf: 'center',
            fontSize: 19,
            marginStart: 12,
            fontWeight: '600',
            marginBottom: -1,
            maxWidth: '75%',
          }}
          numberOfLines={1}
        >
          {item.meta?.name}
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity style={{ marginBottom: -1 }}>
          <Ionicons name="share-outline" size={24} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />
    </BlurView>
  );
});
