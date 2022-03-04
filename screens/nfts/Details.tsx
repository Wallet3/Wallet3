import * as Animatable from 'react-native-animatable';

import { Animated, Image, Text, TouchableOpacity, View } from 'react-native';
import { EvilIcons, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';

import { BlurView } from 'expo-blur';
// import Image from 'react-native-expo-cached-image';
import ImageColors from 'react-native-image-colors';
import LINQ from 'linq';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Nft } from '../../common/apis/Rarible.types';
import { ReactiveScreen } from '../../utils/device';
import { ScrollView } from 'react-native-gesture-handler';
import { SharedElement } from 'react-navigation-shared-element';
import { StatusBar } from 'expo-status-bar';
import Theme from '../../viewmodels/settings/Theme';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ navigation, route }: NativeStackScreenProps<any, any>) => {
  const { item } = route.params as { item: Nft };
  const { top } = useSafeAreaInsets();
  const { backgroundColor, shadow, foregroundColor } = Theme;
  const [dominantColor, setDominantColor] = useState(backgroundColor);
  const [primaryColor, setPrimaryColor] = useState(foregroundColor);
  const [detailColor, setDetailColor] = useState(foregroundColor);

  const url = item.meta?.image?.url?.PREVIEW || item.meta?.image?.url?.ORIGINAL;

  useEffect(() => {
    if (!url) return;

    ImageColors.getColors(url, { cache: true })
      .then((result) => {
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
      })
      .catch(console.log);
  });

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
          }}
        >
          <Image source={{ uri: url }} style={{ width: '100%', height: '100%', borderRadius: 15, backgroundColor }} />
        </View>
        {/* <SharedElement id={`nft.${item.id}.photo`}></SharedElement> */}

        {item.meta?.description ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Description</Text>
            <Text style={{ color: primaryColor }}>{item.meta?.description}</Text>
          </View>
        ) : undefined}

        {item.meta?.attributes ? (
          <View style={{ padding: 16, paddingTop: 0 }}>
            <Text style={{ color: detailColor, fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Attributes</Text>
            {LINQ.from(item.meta?.attributes).select((attr, index) => {
              return (
                <View key={`${attr.key}-${index}`} style={{ flexDirection: 'row' }}>
                  <Text>{attr.key}</Text>
                  <Text>{attr.value}</Text>
                </View>
              );
            })}
          </View>
        ) : undefined}
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
