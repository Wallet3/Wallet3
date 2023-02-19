import { ButtonV2, Placeholder, SafeViewContainer } from '../../components';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { secureColor, verifiedColor } from '../../constants/styles';

import DeviceInfo from '../../modals/tss/components/DeviceInfo';
import { FadeInDownView } from '../../components/animations';
import IllustrationSafe from '../../assets/illustrations/misc/safe.svg';
import { Ionicons } from '@expo/vector-icons';
import MessageKeys from '../../common/MessageKeys';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import { MultiSigWallet } from '../../viewmodels/wallet/MultiSigWallet';
import { PairedDevice } from '../../viewmodels/tss/management/PairedDevice';
import { PairedDeviceModal } from './modals';
import PairedDevices from '../../viewmodels/tss/management/PairedDevices';
import { Portal } from 'react-native-portalize';
import Theme from '../../viewmodels/settings/Theme';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { useModalize } from 'react-native-modalize';
import { useOptimizedSafeBottom } from '../../utils/hardware';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default observer(({ wallet }: { wallet: MultiSigWallet }) => {
  const { t } = i18n;
  const { appColor, secondaryTextColor, textColor } = Theme;
  const { bottom } = useSafeAreaInsets();
  const { trustedDevices } = wallet;

  return (
    <SafeViewContainer style={{ padding: 0, paddingBottom: 0 }} paddingHeader={false}>
      <ScrollView
        bounces={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: bottom || 16, paddingHorizontal: 16 }}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 24, marginBottom: 48 }}>
          <IllustrationSafe width={150} height={150} />
        </View>

        <View style={{ flex: 1, marginBottom: 4 }}>
          <View style={styles.itemContainer}>
            <View style={styles.titleContainer}>
              <Text style={{ color: textColor, ...styles.btnTxt }}>Security</Text>
              <Text style={{ color: secureColor, ...styles.btnTxt }}>Safe</Text>
            </View>

            <Text style={{ color: secondaryTextColor, ...styles.subtitle }}>
              {t('multi-sig-screen-tip-security-overview', { m: wallet.threshold, n: wallet.trustedDeviceCount })}
            </Text>
          </View>

          <View style={styles.itemContainer}>
            <View style={styles.titleContainer}>
              <Text style={{ color: textColor, ...styles.btnTxt }}>Confirmations</Text>
              <Text style={{ color: verifiedColor, ...styles.btnTxt }}>
                {`${wallet.threshold} of ${wallet.trustedDeviceCount}`}
              </Text>
            </View>

            <Text style={{ color: secondaryTextColor, ...styles.subtitle }}>{t('multi-sig-screen-tip-modify-threshold')}</Text>
          </View>

          <View style={styles.itemContainer}>
            <View style={{ marginBottom: 12, ...styles.titleContainer }}>
              <Text style={{ color: textColor, ...styles.btnTxt }}>Trusted Devices</Text>
              <Placeholder />
            </View>

            {trustedDevices.map((device) => {
              return (
                <TouchableOpacity style={{ paddingVertical: 8 }} key={device.globalId}>
                  <DeviceInfo info={device} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <ButtonV2 />
      </ScrollView>
    </SafeViewContainer>
  );
});

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 24,
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  btnTxt: {
    fontSize: 20,
    fontWeight: '500',
  },

  subtitle: {
    marginEnd: 72,
    fontSize: 12.5,
    marginTop: 5,
  },
});