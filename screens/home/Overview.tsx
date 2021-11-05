import * as Animatable from 'react-native-animatable';

import React, { useRef } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { formatAddress, formatCurrency } from '../../utils/formatter';
import { numericFontFamily, themeColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import { Feather } from '@expo/vector-icons';
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
}

export default observer(({ style, address, balance, network }: Props) => {
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
        <Text style={{ ...styles.text, fontSize: 15 }}>{network}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...styles.text, fontSize: 14, marginEnd: 5 }}>3</Text>
          <Feather name="layers" size={14} color="#fff" />
        </View>
      </View>

      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => writeAddressToClipboard()}>
        <Animatable.Text ref={addressView as any} style={{ ...styles.text, fontSize: 12 }}>
          {formatAddress(address ?? '', 7, 5)}
        </Animatable.Text>
        <Feather name="copy" size={10} color="#fff" style={{ marginStart: 5 }} />
      </TouchableOpacity>

      <View style={{ height: 54 }} />

      <View style={{ justifyContent: 'space-between' }}>
        <AnimateNumber value={balance || 0} style={styles.headline} numberOfLines={1} formatter={formatCurrency} />

        {Logos[network || 'Ethereum']}
        {/* <Ethereum
          width={64}
          height={64}
          style={{
            marginTop: -60,
            marginEnd: -19,
            alignSelf: 'flex-end',
            opacity: 0.72,
          }}
        /> */}
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
