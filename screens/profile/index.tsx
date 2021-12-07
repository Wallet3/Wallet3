import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Opensea, Twitter } from '../../assets/3rd';
import React, { useEffect } from 'react';
import { secondaryFontColor, thirdFontColor } from '../../constants/styles';

import App from '../../viewmodels/App';
import CachedImage from 'react-native-expo-cached-image';
import CopyableText from '../../components/CopyableText';
import { Ionicons } from '@expo/vector-icons';
import Networks from '../../viewmodels/Networks';
import { StatusBar } from 'expo-status-bar';
import { formatAddress } from '../../utils/formatter';
import icons from '../../assets/icons/crypto';
import { observer } from 'mobx-react-lite';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(() => {
  const { top } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { currentWallet } = App;
  const { currentAccount } = currentWallet || {};

  const { current } = Networks;

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <View style={{ backgroundColor: '#fff', flex: 1, paddingHorizontal: 16 }}>
      <View
        style={{
          paddingTop: top + headerHeight,
          backgroundColor: 'dodgerblue',
          position: 'relative',
          marginBottom: 48,
          marginHorizontal: -16,
        }}
      >
        <View
          style={{
            marginHorizontal: 16,
            bottom: -37,
            position: 'absolute',
            borderRadius: 200,
            padding: 0,
            borderWidth: 3,
            borderColor: '#fff',
          }}
        >
          <CachedImage
            source={
              currentWallet?.currentAccount?.avatar
                ? { uri: currentWallet?.currentAccount?.avatar }
                : icons[current.symbol.toLowerCase()]
            }
            style={{
              width: 64,
              height: 64,
              borderRadius: 200,
              backgroundColor: current.color,
            }}
          />
        </View>
      </View>

      <View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ fontSize: 17, fontWeight: '500' }}>nick.eth</Text>
            <Text style={{ marginStart: 8, fontSize: 15, color: secondaryFontColor }}>
              {formatAddress('0x983110309620D911731Ac0932219af06091b6744', 7, 5)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="location" size={15} color="dodgerblue" style={{ marginEnd: 4 }} />
            <Text style={{ fontSize: 14, color: 'dodgerblue' }}>USA</Text>
          </View>
        </View>

        <Text style={{ lineHeight: 19, marginTop: 8, color: thirdFontColor }} numberOfLines={2}>
          "If anyone would come after me, let him deny himself and take up his cross daily and follow me. For whoever would
          save his life will lose it, but whoever loses his life for my sake will save it. For what does it profit a man if he
          gains the whole world and loses or forfeits himself?" - Jesus, Luke 9.23-25
        </Text>
      </View>

      <Text style={{ marginTop: 24, color: secondaryFontColor }}>Accounts</Text>

      <View style={{ flexWrap: 'wrap', alignContent: 'flex-start', flexDirection: 'row' }}>
        <TouchableOpacity style={styles.socialContainer}>
          <Twitter width={20} height={20} />
          <Text style={styles.socialTxt}>@brankly</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialContainer}>
          <Opensea width={20} height={20} />
          <Text style={styles.socialTxt}>brankly.eth</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </View>
  );
});

const styles = StyleSheet.create({
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#efefef',
    borderRadius: 15,
    marginEnd: 16,
  },

  socialTxt: {
    marginStart: 8,
  },
});
