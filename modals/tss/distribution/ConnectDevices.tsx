import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeOut, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { AntDesign, Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { secureColor, thirdFontColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import Device from '../../../components/Device';
import { KeyDistribution } from '../../../viewmodels/tss/KeyDistribution';
import { KeyReceiver } from '../../../viewmodels/tss/KeyReceiver';
import { Passpad } from '../../views';
import { ReactiveScreen } from '../../../utils/device';
import Swiper from 'react-native-swiper';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { getScreenCornerRadius } from '../../../utils/ios';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text } = Animated;

export default observer(({ vm }: { vm: KeyDistribution }) => {
  const { t } = i18n;
  const { textColor, secondaryTextColor, backgroundColor, borderColor } = Theme;
  const { pendingClients, pendingCount, approvedCount } = vm;
  const [marginHorizontal] = useState((getScreenCornerRadius() - 20) / 4 + 16);
  const [verifying, setVerifying] = useState<{ client: TCPClient; attempts: number }>();

  useEffect(() => {
    vm.start();
  }, []);

  const verifyClient = async (code: string) => {
    const verified = code === verifying!.client.verificationCode;
    const maxFailedAttempts = 3;

    verified && vm.approveClient(verifying!.client);
    verifying!.attempts >= maxFailedAttempts && vm.rejectClient(verifying!.client);

    verifying!.attempts >= maxFailedAttempts
      ? setTimeout(() => setVerifying(undefined), 500)
      : setVerifying(verified ? undefined : { client: verifying!.client, attempts: verifying!.attempts + 1 });

    return verified;
  };

  const renderClient = ({ item }: { item: TCPClient }) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Device deviceId={item.remoteInfo!.device} os={item.remoteInfo!.rn_os} style={{ width: 32, height: 42 }} />
        <View style={{ marginStart: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={{ color: textColor, fontSize: 22, fontWeight: '600', marginBottom: 2 }}>
              {`${item.remoteInfo?.name}`}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 0,
              borderBottomColor: borderColor,
            }}
          >
            <Text style={{ color: secondaryTextColor }}>{`${item.remoteInfo?.os} ${item.remoteInfo?.osVersion}`}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPendingItem = ({ item }: { item: TCPClient }) => {
    return (
      <View
        entering={FadeInDown.delay(50).springify()}
        exiting={FadeOutUp.springify()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: marginHorizontal,
          paddingVertical: 8,
          position: 'relative',
        }}
      >
        {renderClient({ item })}
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: -8 }}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => vm.rejectClient(item)}>
            <Ionicons name="close-circle-outline" size={32} color={warningColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton} onPress={() => setVerifying({ client: item, attempts: 0 })}>
            <Ionicons name="checkmark-circle-outline" size={32} color={secureColor} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{ flex: 1, position: 'relative' }}
      entering={FadeInRight.delay(500).springify()}
      exiting={FadeOutLeft.springify()}
    >
      {pendingCount || approvedCount ? (
        <View style={{ flex: 1 }}>
          <FlatList data={pendingClients} renderItem={renderPendingItem} />
        </View>
      ) : (
        <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }} exiting={FadeOutUp.springify()}>
          <ActivityIndicator />
          <Text style={{ alignSelf: 'center', marginTop: 52, lineHeight: 27, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sign-connect-tip')}
          </Text>
        </View>
      )}

      <Button title={t('button-next')} disabled={vm.approvedCount === 0} />

      {verifying && (
        <View
          entering={FadeInDown.delay(0)}
          exiting={FadeOutDown.springify()}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor, alignItems: 'center' }}
        >
          <Text style={{ marginTop: 12, color: secondaryTextColor }}>{t('multi-sign-connect-enter-pairing-code')}:</Text>

          <Passpad
            disableCancelButton
            passLength={4}
            failedAttempts={verifying.attempts}
            style={{ paddingBottom: 12, paddingTop: 0 }}
            onCodeEntered={verifyClient}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  confirmButton: {
    padding: 4,
    paddingHorizontal: 8,
  },
});
