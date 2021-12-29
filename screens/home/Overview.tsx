import { Feather, Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { numericFontFamily, themeColor } from '../../constants/styles';

import AnimateNumber from 'react-native-animate-number';
import CopyableText from '../../components/CopyableText';
import Image from 'react-native-expo-cached-image';
import Logos from '../../assets/icons/networks/white';
import React from 'react';
import Ripple from 'react-native-material-ripple';
import { formatCurrency } from '../../utils/formatter';
import i18n from '../../i18n';
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
  disabled?: boolean;
  onSendPress?: () => void;
  onRequestPress?: () => void;
}

export default observer(
  ({
    style,
    address,
    balance,
    network,
    avatar,
    chainId,
    connectedApps,
    currency,
    onSendPress,
    onRequestPress,
    disabled,
  }: Props) => {
    const { t } = i18n;

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

        <View style={{ height: 36, backgroundColor: 'transparent' }} />

        <View style={{ justifyContent: 'space-between', marginBottom: 8, backgroundColor: 'transparent', height: 31 }}>
          <AnimateNumber
            value={balance || 0}
            style={styles.headline}
            numberOfLines={1}
            formatter={(v) => formatCurrency(v, currency)}
          />

          {Logos[chainId]}
        </View>

        <View style={{ height: 1, backgroundColor: '#ffffff50', marginTop: 2, marginHorizontal: -12 }} />

        <View style={styles.buttonsContainer}>
          <Ripple style={styles.button} onPress={(_) => (disabled ? undefined : onSendPress?.())}>
            <Ionicons name="md-arrow-up-circle-outline" size={18} color="white" />
            <Text style={styles.buttonText}>{t('button-send')}</Text>
          </Ripple>

          <View style={{ width: 1, backgroundColor: '#ffffff50' }}></View>
          <Ripple style={styles.button} onPress={(_) => (disabled ? undefined : onRequestPress?.())}>
            <Ionicons name="md-arrow-down-circle-outline" size={18} color="white" />
            <Text style={styles.buttonText}>{t('button-request')}</Text>
          </Ripple>
        </View>
      </View>
    );
  }
);

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
    lineHeight: 39,
    fontFamily: numericFontFamily,
  },

  buttonsContainer: {
    flexDirection: 'row',
    marginHorizontal: -12,
    position: 'relative',
  },

  button: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    marginStart: 6,
    fontSize: 16,
    fontWeight: '500',
  },
});
