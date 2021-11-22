import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { formatAddress, formatCurrency } from '../../utils/formatter';
import { numericFontFamily, themeColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import CopyableText from '../../components/CopyableText';
import { Feather } from '@expo/vector-icons';
import Image from 'react-native-expo-cached-image';
import Logos from '../../assets/icons/networks/white';
import { observer } from 'mobx-react-lite';
import { setString } from 'expo-clipboard';

interface Props {
  style?: StyleProp<ViewStyle>;
  balance?: number;
  currency?: string;
  network?: string;
  connectedApps?: number;
  address?: string;
  ens?: string;
  avatar?: string;
  chainId: number;
}

export default observer(({ style, address, balance, network, avatar, chainId, connectedApps }: Props) => {
  const addressView = useRef<Animatable.Text>(null);

  const writeAddressToClipboard = () => {
    setString(address || '');
    addressView.current?.flash?.();
  };

  return (
    <View style={{ ...styles.container, ...((style as any) || {}) }}>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 4,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...styles.text, fontSize: 16 }}>{network}</Text>

          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 16,
                height: 16,
                borderRadius: 100,
                marginHorizontal: 8,
                borderWidth: 1,
                borderColor: '#ffffff90',
              }}
            />
          ) : undefined}
          {/* {ens ? <Text style={{ fontSize: 12, color: '#fff', marginHorizontal: 0 }}>{ens}</Text> : undefined} */}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', opacity: connectedApps || 0 }}>
          <Text style={{ ...styles.text, fontSize: 14, marginEnd: 5 }}>{connectedApps}</Text>
          <Feather name="layers" size={14} color="#fff" />
        </View>
      </View>

      <CopyableText
        txt={address || ''}
        format
        iconSize={10}
        iconColor="#fff"
        iconStyle={{ marginHorizontal: 5 }}
        txtStyle={{ ...styles.text, fontSize: 12 }}
      />

      <View style={{ height: 54 }} />

      <View style={{ justifyContent: 'space-between' }}>
        <AnimateNumber value={balance || 0} style={styles.headline} numberOfLines={1} formatter={formatCurrency} />

        {Logos[chainId]}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 16,
    height: 142,
    backgroundColor: themeColor,
    overflow: 'hidden',
  },

  text: { color: 'white', fontWeight: '500' },

  headline: {
    color: 'white',
    fontWeight: '600',
    maxWidth: '85%',
    fontSize: 29,
    fontFamily: numericFontFamily,
  },
});
