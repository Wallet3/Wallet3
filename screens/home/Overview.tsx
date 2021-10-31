import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { numericFontFamily, themeColor } from '../../constants/styles';

import Ethereum from '../../assets/icons/networks/white/ethereum.svg';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { formatAddress } from '../../utils/formatter';
import { observer } from 'mobx-react-lite';

interface Props {
  style?: StyleProp<ViewStyle>;
  balance?: string;
  network?: string;
  connectedApps?: number;
  address?: string;
}

export default observer(({ style, address, balance }: Props) => {
  return (
    <View style={{ ...styles.container, ...((style as any) || {}) }}>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 4,
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ ...styles.text, fontSize: 15 }}>Ethereum</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ ...styles.text, fontSize: 14, marginEnd: 5 }}>3</Text>
          <Feather name="layers" size={14} color="#fff" />
        </View>
      </View>

      <Text style={{ ...styles.text, marginBottom: 42, fontSize: 12 }}>{formatAddress(address ?? '', 7, 5)}</Text>

      <Text style={styles.headline} numberOfLines={1}>
        {balance}
      </Text>

      <Ethereum
        width={64}
        height={64}
        style={{
          marginTop: -60,
          marginEnd: -19,
          alignSelf: 'flex-end',
          opacity: 0.72,
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: themeColor,
  },

  text: { color: 'white', fontWeight: '500' },

  headline: {
    color: 'white',
    fontWeight: '600',
    maxWidth: '85%',
    fontSize: 27,
    fontFamily: numericFontFamily,
  },
});
