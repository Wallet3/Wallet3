import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { getDeviceModel, getScreenCornerRadius } from '../../../utils/ios';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import LanDiscovery from '../../../viewmodels/tss/LanDiscovery';
import LottieView from 'lottie-react-native';
import { Passpad } from '../../views';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import deviceInfoModule from 'react-native-device-info';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text, FlatList } = Animated;

export default observer(({ vm }: { vm: ShardReceiver }) => {
  const { t } = i18n;
  const { secondaryTextColor, textColor } = Theme;

  const devTxtStyle: any = { color: secondaryTextColor, fontSize: 16, maxWidth: '90%', fontWeight: '500' };

  return (
    <View
      style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 0 }}
      entering={FadeInRight.delay(500).springify()}
      exiting={FadeOutLeft.springify()}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {!vm.pairingCodeVerified && (
          <View style={{ alignItems: 'center', marginTop: -12 }} exiting={FadeOutUp.springify()}>
            <Text
              style={{
                color: secondaryTextColor,
                marginBottom: 8,
                fontSize: 12.5,
                fontWeight: '500',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              {`${t('multi-sign-txt-pairing-code')}`}
            </Text>
            <Text style={{ color: textColor, fontSize: 42, fontWeight: '800' }}>{vm.verificationCode}</Text>
          </View>
        )}

        {vm.pairingCodeVerified && !vm.shardSaved && (
          <View
            entering={FadeInDown.springify()}
            exiting={FadeOutUp.springify()}
            style={{ position: 'relative', width: 250, height: 250, justifyContent: 'center', alignItems: 'center' }}
          >
            <LottieView
              style={{ width: 250, height: 250, position: 'absolute' }}
              duration={5000}
              source={require('../../../assets/animations/ripple.json')}
              autoPlay
            />

            <Device deviceId={vm.remoteInfo!.device} os={vm.remoteInfo!.rn_os} style={{ width: 48, height: 52 }} />
          </View>
        )}
      </View>

      {/* <View style={{ flexDirection: 'row', marginBottom: 32, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginHorizontal: 12, color: secondaryTextColor }}>Waiting for secret distribution</Text>
        <ActivityIndicator size="small" />
      </View> */}

      <View style={{ flexDirection: 'row' }}>
        <Device os={'ios'} deviceId={deviceInfoModule.getDeviceId()} style={{ width: 48, height: 81 }} />
        <View
          style={{
            marginStart: 4,
            padding: 8,
            paddingVertical: 4,
            overflow: 'hidden',
            justifyContent: 'space-around',
            flex: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={devTxtStyle} numberOfLines={1}>
              {`Name: ${deviceInfoModule.getDeviceNameSync()}`}
            </Text>

            <View
              style={{
                borderRadius: 5,
                backgroundColor: vm.closed ? warningColor : secureColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginStart: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginVertical: -3,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500', textTransform: 'capitalize' }}>
                {vm.closed ? t('msg-disconnected') : t('msg-connected')}
              </Text>
            </View>
          </View>
          <Text style={devTxtStyle} numberOfLines={1}>{`Model: ${getDeviceModel()}`}</Text>
          <Text style={devTxtStyle} numberOfLines={1}>
            {`OS: ${deviceInfoModule.getSystemName()} ${deviceInfoModule.getSystemVersion()}`}
          </Text>
        </View>
      </View>
    </View>
  );
});
