import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { numericFontFamily, themeColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import CopyableText from '../../components/CopyableText';
import { Currency } from '../../viewmodels/Currency';
import { Feather } from '@expo/vector-icons';
import Image from 'react-native-expo-cached-image';
import Logos from '../../assets/icons/networks/white';
import React from 'react';
import { formatCurrency } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';

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

export default observer(({ style, address, balance, network, avatar, chainId, connectedApps, currency }: Props) => {
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

      <View style={{ height: 54, backgroundColor: 'transparent' }} />

      <View style={{ justifyContent: 'space-between', marginBottom: 7, backgroundColor: 'transparent', height: 31 }}>
        <AnimateNumber
          value={balance || 0}
          style={styles.headline}
          numberOfLines={1}
          formatter={(v) => formatCurrency(v, currency)}
        />

        {Logos[chainId]}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingBottom: 0,
    paddingHorizontal: 12,
    backgroundColor: themeColor,
    overflow: 'hidden',
  },

  text: { color: 'white', fontWeight: '500' },

  headline: {
    color: 'white',
    fontWeight: '600',
    maxWidth: '85%',
    fontSize: 29,
    lineHeight: 37,
    fontFamily: numericFontFamily,
  },
});
