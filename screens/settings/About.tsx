import { Image, StyleSheet, Text, View } from 'react-native';
import { secondaryFontColor, themeColor, thirdFontColor } from '../../constants/styles';

import { Feather } from '@expo/vector-icons';
import React from 'react';
import { SafeViewContainer } from '../../components';

export function About() {
  return (
    <SafeViewContainer paddingHeader style={{ backgroundColor: '#fff' }}>
      <Text style={{ fontWeight: '500', color: thirdFontColor, fontSize: 16 }}>A Secure Wallet for Web3 Era.</Text>

      <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: thirdFontColor }}>Features</Text>

      <View style={styles.item}>
        <Feather name="box" size={16} color={thirdFontColor} />
        <Text style={styles.txt}>Manage all your Ethereum assets in one place.</Text>
      </View>

      <View style={styles.item}>
        <Feather name="link-2" size={16} color={thirdFontColor} />
        <Text style={styles.txt}>Connect DApps with WalletConnect.</Text>
      </View>

      <View style={styles.item}>
        <Feather name="cpu" size={16} color={thirdFontColor} />
        <Text style={styles.txt}>Support Layer2 and EVM-compatible chains.</Text>
      </View>

      <View style={styles.item}>
        <Feather name="shield" size={16} color={thirdFontColor} />
        <Text style={styles.txt}>Built for Security.</Text>
      </View>

      <Text style={{ marginTop: 24, marginBottom: 4, fontWeight: '500', fontSize: 19, color: thirdFontColor }}>
        Data Providers
      </Text>

      <View style={{ ...styles.item, height: 40 }}>
        <Image
          source={require('../../assets/3rd/debank-logo.png')}
          style={{ width: 190, resizeMode: 'contain', marginStart: -30 }}
        />
        <Image
          source={require('../../assets/3rd/coingecko.png')}
          style={{ width: 150, resizeMode: 'contain', marginStart: 0 }}
        />
      </View>

      <Text style={{ marginTop: 24, color: thirdFontColor, fontSize: 12 }}>Copyright ©️ 2021 ChainBow Co., Ltd.</Text>
    </SafeViewContainer>
  );
}

const styles = StyleSheet.create({
  txt: {
    color: thirdFontColor,
    marginStart: 8,
    fontSize: 16,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
});
