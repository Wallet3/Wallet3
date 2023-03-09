import { ButtonV2, Placeholder, SafeViewContainer } from '../../components';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import KeySecurity, { SecurityLevel } from '../../viewmodels/tss/management/KeySecurity';
import React, { useEffect, useState } from 'react';
import { openGlobalPasspad, openShardsAggregator } from '../../common/Modals';
import { secureColor, verifiedColor, warningColor } from '../../constants/styles';

import AddDevices from './modals/AddDevices';
import { DAY } from '../../utils/time';
import DeviceInfo from '../../modals/tss/components/DeviceInfo';
import { FadeInDownView } from '../../components/animations';
import IllustrationSafe from '../../assets/illustrations/misc/safe.svg';
import ModalizeContainer from '../../modals/core/ModalizeContainer';
import { MultiSigKeyDeviceInfo } from '../../models/entities/MultiSigKey';
import { MultiSigWallet } from '../../viewmodels/wallet/MultiSigWallet';
import { Portal } from 'react-native-portalize';
import Redistribution from './modals/Redistribution';
import { ShardsAggregator } from '../../viewmodels/tss/ShardsAggregator';
import Theme from '../../viewmodels/settings/Theme';
import TrustedDevice from './modals/TrustedDevice';
import i18n from '../../i18n';
import { observer } from 'mobx-react-lite';
import { sleep } from '../../utils/async';
import { startLayoutAnimation } from '../../utils/animations';
import { useModalize } from 'react-native-modalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Colors = new Map([
  [SecurityLevel.high, secureColor],
  [SecurityLevel.medium, 'orange'],
  [SecurityLevel.low, warningColor],
]);

export default observer(({ wallet }: { wallet: MultiSigWallet }) => {
  const { t } = i18n;
  const { appColor, secondaryTextColor, textColor } = Theme;
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>();
  const { bottom } = useSafeAreaInsets();
  const { trustedDevices, trustedDeviceCount } = wallet;
  const [selectedDevice, setSelectedDevice] = useState<MultiSigKeyDeviceInfo>();
  const { ref: trustedDevicesModal, close: closeTrustedDeviceModal, open: openTrustedDeviceModal } = useModalize();
  const { ref: addDevicesModal, close: closeAddDevices, open: openAddDevices } = useModalize();
  const { ref: redistributionModal, close: closeRedistribution, open: openRedistribution } = useModalize();
  const [addDevicesCritical, setAddDevicesCritical] = useState(false);
  const [redistributionCritical, setRedistributionCritical] = useState(false);
  const [_, setForceUpdate] = useState<any>();

  useEffect(() => {
    if (!wallet) return;
    setSecurityLevel(KeySecurity.checkSecurityLevel(wallet.key));
  }, [wallet]);

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
              <Text style={{ color: textColor, ...styles.btnTxt }}>{t('multi-sig-screen-title-security')}</Text>
              <Text style={{ color: Colors.get(securityLevel!), ...styles.btnTxt }}>
                {securityLevel && t(`multi-sig-screen-security-level-${securityLevel}`)}
              </Text>
            </View>

            <Text style={{ color: secondaryTextColor, ...styles.subtitle }}>
              {t('multi-sig-screen-tip-security-overview', { m: wallet.threshold, n: wallet.trustedDeviceCount })}
            </Text>
          </View>

          <TouchableOpacity style={styles.itemContainer} onPress={() => openRedistribution()}>
            <View style={styles.titleContainer}>
              <Text style={{ color: textColor, ...styles.btnTxt }}>{t('multi-sig-screen-title-confirmation-threshold')}</Text>
              <Text style={{ color: wallet.thresholdTooHigh ? warningColor : verifiedColor, ...styles.btnTxt }}>
                {`${wallet.threshold} of ${wallet.trustedDeviceCount}`}
              </Text>
            </View>

            <Text style={{ color: wallet.thresholdTooHigh ? warningColor : secondaryTextColor, ...styles.subtitle }}>
              {wallet.thresholdTooHigh
                ? t('multi-sig-modal-msg-threshold-too-high')
                : t('multi-sig-screen-tip-modify-threshold')}
            </Text>
          </TouchableOpacity>

          {wallet.secretsCached && (
            <FadeInDownView>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => {
                  wallet.setSecretsCache();
                  startLayoutAnimation();
                  setForceUpdate(Date.now());
                }}
              >
                <View style={styles.titleContainer}>
                  <Text style={{ color: textColor, ...styles.btnTxt }}>{t('multi-sig-screen-title-clear-secrets-cache')}</Text>
                  <Text style={{ color: verifiedColor, ...styles.btnTxt }}>{}</Text>
                </View>

                <Text style={{ color: secondaryTextColor, ...styles.subtitle }}>
                  {t('multi-sig-screen-tip-clear-secrets-cache')}
                </Text>
              </TouchableOpacity>
            </FadeInDownView>
          )}

          <View style={styles.itemContainer}>
            <View style={{ marginBottom: 4, ...styles.titleContainer }}>
              <Text style={{ color: textColor, ...styles.btnTxt }}>{t('multi-sig-screen-title-trusted-devices')}</Text>
              <Placeholder />
            </View>

            {trustedDevices.map((device, i) => {
              return (
                <FadeInDownView key={device.globalId} delay={i * 50}>
                  <TouchableOpacity
                    style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      setSelectedDevice(device);
                      openTrustedDeviceModal();
                    }}
                  >
                    <DeviceInfo info={device} light />
                    {device.lastUsedAt < Date.now() - KeySecurity.inactiveDAYS && (
                      <Ionicons name="warning" size={15} color={warningColor} />
                    )}
                  </TouchableOpacity>
                </FadeInDownView>
              );
            })}
          </View>
        </View>

        <ButtonV2
          title={t('button-add-devices')}
          onPress={openAddDevices}
          themeColor={secureColor}
          icon={() => <Ionicons name="add-circle-outline" color="#fff" size={20} />}
          disabled={!wallet.canDistributeMore}
        />
      </ScrollView>

      <Portal>
        <ModalizeContainer ref={trustedDevicesModal} withHandle={false}>
          {selectedDevice && (
            <TrustedDevice
              close={closeTrustedDeviceModal}
              device={selectedDevice}
              onDeleteDevice={(d) => wallet.removeTrustedDevice(d)}
              disableRemove={trustedDeviceCount <= wallet.threshold}
              onDeviceNameChanged={async () => {
                await wallet.save();
                setForceUpdate(Date.now());
              }}
            />
          )}
        </ModalizeContainer>

        <ModalizeContainer ref={addDevicesModal} closeOnOverlayTap={!addDevicesCritical} withHandle={false}>
          <AddDevices wallet={wallet} close={closeAddDevices} onCritical={setAddDevicesCritical} />
        </ModalizeContainer>

        <ModalizeContainer
          ref={redistributionModal}
          closeOnOverlayTap={!redistributionCritical}
          withHandle={false}
          onClosed={() => setForceUpdate(Date.now())}
        >
          <Redistribution wallet={wallet} close={closeRedistribution} onCritical={setRedistributionCritical} />
        </ModalizeContainer>
      </Portal>
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
