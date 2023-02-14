import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOutDown, FadeOutLeft, FadeOutUp } from 'react-native-reanimated';
import { Ionicons, Octicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { secureColor, warningColor } from '../../../constants/styles';

import Button from '../components/Button';
import { ClientInfo } from '../../../common/p2p/Constants';
import Device from '../../../components/Device';
import DeviceInfo from '../components/DeviceInfo';
import { Passpad } from '../../views';
import { ShardsDistributor } from '../../../viewmodels/tss/ShardsDistributor';
import { TCPClient } from '../../../common/p2p/TCPClient';
import Theme from '../../../viewmodels/settings/Theme';
import { calcHorizontalPadding } from '../components/Utils';
import { getScreenCornerRadius } from '../../../utils/hardware';
import i18n from '../../../i18n';
import { observer } from 'mobx-react-lite';

const { View, Text } = Animated;

export default observer(({ vm, onNext }: { vm: ShardsDistributor; onNext: () => void }) => {
  const { t } = i18n;
  const { textColor, secondaryTextColor, backgroundColor, borderColor } = Theme;
  const { pendingClients, approvedClients, pendingCount, approvedCount } = vm;
  const [marginHorizontal] = useState(calcHorizontalPadding());
  const [verifying, setVerifying] = useState<{ client: TCPClient; attempts: number }>();

  useEffect(() => {
    vm.start();
  }, []);

  const verifyClient = async (code: string) => {
    if (!verifying) return false;

    const verified = code === verifying.client.verificationCode;
    const maxFailedAttempts = 3;

    verified && vm.approveClient(verifying.client, code);

    verifying.attempts >= maxFailedAttempts
      ? setTimeout(() => setVerifying(undefined), 500) && vm.rejectClient(verifying.client)
      : setVerifying(verified ? undefined : { client: verifying.client, attempts: verifying.attempts + 1 });

    return verified;
  };

  const renderConnectedItem = ({ item }: { item: TCPClient }) => {
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
        <DeviceInfo info={item.remoteInfo!} verified />
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
        <DeviceInfo info={item.remoteInfo!} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: -8, marginStart: 36 }}>
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
        <View style={{ flex: 1, paddingBottom: 16 }}>
          {approvedCount > 0 && (
            <Text
              entering={FadeInDown.delay(0)}
              exiting={FadeOutUp.delay(0)}
              style={{ ...styles.listTitle, color: secondaryTextColor, marginHorizontal }}
            >
              {t('multi-sign-connect-approved-clients')}
            </Text>
          )}

          <FlatList
            style={styles.flatList}
            data={approvedClients}
            renderItem={renderConnectedItem}
            keyExtractor={(item) => item.remoteId}
          />

          {pendingCount > 0 && (
            <Text
              entering={FadeInDown.delay(0)}
              exiting={FadeOutUp.delay(0)}
              style={{ ...styles.listTitle, color: secondaryTextColor, marginHorizontal }}
            >
              {t('multi-sign-connect-pending-clients')}
            </Text>
          )}

          <FlatList
            style={styles.flatList}
            data={pendingClients}
            renderItem={renderPendingItem}
            keyExtractor={(item) => item.remoteId}
          />
        </View>
      ) : (
        <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }} exiting={FadeOutUp.springify()}>
          <ActivityIndicator />
          <Text style={{ alignSelf: 'center', marginTop: 52, lineHeight: 27, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sign-connect-tip')}
          </Text>
        </View>
      )}

      <Button title={t('button-next')} disabled={approvedCount === 0} onPress={onNext} />

      {verifying && (
        <View
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.springify()}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor, alignItems: 'center' }}
        >
          <Text style={{ marginTop: 12, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sign-connect-enter-pairing-code')}:
          </Text>

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
  listTitle: {
    marginHorizontal: 18,
    fontWeight: '500',
    opacity: 0.75,
    textTransform: 'capitalize',
  },
  flatList: {
    flexGrow: 0,
  },
  confirmButton: {
    padding: 4,
    paddingHorizontal: 8,
  },
});
