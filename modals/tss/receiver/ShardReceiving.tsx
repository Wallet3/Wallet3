import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { FadeInLeftView, FadeInRightView, FadeInUpView, ZoomInView } from '../../../components/animations';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ShardPersistentStatus, ShardReceiver } from '../../../viewmodels/tss/ShardReceiver';
import { getDeviceModel, getScreenCornerRadius } from '../../../utils/hardware';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import LanDiscovery from '../../../viewmodels/tss/LanDiscovery';
import LottieView from 'lottie-react-native';
import { Passpad } from '../../views';
import { Service } from 'react-native-zeroconf';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { Skeleton } from '../../../components';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import deviceInfoModule from 'react-native-device-info';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';
import { startLayoutAnimation } from '../../../utils/animations';

const { View, Text, FlatList } = Animated;

export default observer(({ vm }: { vm: ShardReceiver }) => {
  const { t } = i18n;
  const { secondaryTextColor, textColor, borderColor } = Theme;
  const { pairingCodeVerified, secretStatus } = vm;
  const [dataVerified, setDataVerified] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    vm.once('dataVerified' as any, () => setDataVerified(true));
    vm.once('dataVerifyFailed' as any, () => setDataVerified(false));
  }, []);

  const devTxtStyle: any = { color: secondaryTextColor, fontSize: 16, maxWidth: '90%', fontWeight: '500' };

  interface ICompletedBarProps {
    txt: string;
    tintColor?: string;
    delay?: number;
    succeed: boolean;
  }

  const renderCompletedBar = ({ txt, tintColor, delay, succeed }: ICompletedBarProps) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
        <ZoomInView duration={200} delay={delay} style={{ width: 32, alignItems: 'center' }}>
          <Ionicons
            name={succeed ? 'checkmark-circle' : 'warning'}
            color={tintColor ?? borderColor}
            size={succeed ? 32 : 30}
          />
        </ZoomInView>
        <FadeInLeftView
          delay={300 + (delay ?? 0)}
          style={{
            borderRadius: 20,
            height: 28,
            marginStart: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: tintColor ?? secondaryTextColor }}>{txt}</Text>
        </FadeInLeftView>
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 0 }}
      entering={FadeInRight.delay(300).springify()}
      exiting={FadeOutLeft.springify()}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {!pairingCodeVerified && (
          <View style={{ alignItems: 'center', marginTop: -24 }} exiting={FadeOutUp.springify()}>
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
            <Text style={{ color: textColor, fontSize: 42, fontWeight: '800' }}>{vm.pairingCode}</Text>
          </View>
        )}

        {pairingCodeVerified && secretStatus === ShardPersistentStatus.waiting && (
          <ZoomInView
            style={{ position: 'relative', width: 250, height: 250, justifyContent: 'center', alignItems: 'center' }}
          >
            <LottieView
              style={{ width: 250, height: 250, position: 'absolute' }}
              duration={5000}
              source={require('../../../assets/animations/ripple.json')}
              autoPlay
            />

            <Device deviceId={vm.remoteInfo!.device} os={vm.remoteInfo!.rn_os} style={{ width: 48, height: 52 }} />
          </ZoomInView>
        )}

        {pairingCodeVerified && secretStatus !== ShardPersistentStatus.waiting && (
          <FadeInUpView delay={200} style={{ position: 'relative', minWidth: 160 }}>
            {secretStatus === ShardPersistentStatus.verifying &&
              dataVerified === undefined &&
              renderCompletedBar({ delay: 300, txt: t('multi-sign-txt-data-verifying'), succeed: true })}

            {dataVerified &&
              renderCompletedBar({ tintColor: secureColor, txt: t('multi-sign-txt-data-verified'), succeed: true })}
            {dataVerified === false &&
              renderCompletedBar({ tintColor: warningColor, txt: t('multi-sign-txt-data-verifying-failed'), succeed: false })}

            {secretStatus === ShardPersistentStatus.saved &&
              renderCompletedBar({ txt: t('multi-sign-txt-data-saved'), tintColor: secureColor, succeed: true })}
            {secretStatus === ShardPersistentStatus.saveFailed &&
              renderCompletedBar({ txt: t('multi-sign-txt-data-saving-failed'), tintColor: warningColor, succeed: false })}
          </FadeInUpView>
        )}
      </View>

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
