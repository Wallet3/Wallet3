import React, { useState } from 'react';
import { Text, View } from 'react-native';

import Authentication from '../../../viewmodels/auth/Authentication';
import BackableScrollTitles from '../../../modals/components/BackableScrollTitles';
import { ButtonV2 } from '../../../components';
import DeleteConfirmationView from './views/DeleteConfirmationView';
import { DeviceOverview } from './views/DeviceOverview';
import { FadeInDownView } from '../../../components/animations';
import { Ionicons } from '@expo/vector-icons';
import ModalRootContainer from '../../../modals/core/ModalRootContainer';
import { PairedDevice } from '../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../viewmodels/tss/management/PairedDevices';
import { PlainSecretItem } from '../../../viewmodels/tss/KeyRecovery';
import QRCode from 'react-native-qrcode-svg';
import Theme from '../../../viewmodels/settings/Theme';
import { getDeviceInfo } from '../../../common/p2p/Utils';
import i18n from '../../../i18n';
import { openGlobalPasspad } from '../../../common/Modals';
import { sleep } from '../../../utils/async';
import { startLayoutAnimation } from '../../../utils/animations';
import { useOptimizedSafeBottom } from '../../../utils/hardware';
import { warningColor } from '../../../constants/styles';

interface Props {
  distributionId: string;
  root: string;
  bip32: string;
  device: PairedDevice;
  onNext: () => void;
}

export const SecretView = ({ root, bip32, device, onNext, distributionId }: Props) => {
  const safeBottom = useOptimizedSafeBottom();
  const { secondaryTextColor, textColor, appColor } = Theme;
  const { t } = i18n;
  const [value] = useState(
    JSON.stringify({
      root,
      bip32,
      distributionId,
      device: getDeviceInfo(),
      secretsInfo: device.shard.secretsInfo,
    } as PlainSecretItem)
  );

  return (
    <FadeInDownView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <QRCode
          value={value}
          size={170}
          color={textColor}
          enableLinearGradient
          linearGradient={['rgb(134, 65, 244)', 'rgb(66, 194, 244)']}
          backgroundColor="transparent"
        />

        <Text style={{ color: appColor, marginVertical: 16, fontWeight: '500' }}>
          {`${t('multi-sig-modal-txt-threshold')}: ${device.threshold} of n`}
        </Text>

        <Text style={{ maxWidth: 200, textAlign: 'center', color: secondaryTextColor, fontWeight: '500' }}>
          {t('multi-sig-modal-msg-restore-from-shard-qr-code')}
        </Text>
      </View>

      <FadeInDownView delay={200}>
        <ButtonV2
          style={{ marginBottom: safeBottom }}
          themeColor={warningColor}
          title={t('button-remove')}
          onPress={onNext}
          icon={() => <Ionicons name="trash" color={'#fff'} size={16} />}
        />
      </FadeInDownView>
    </FadeInDownView>
  );
};

export default ({ device, close }: { device: PairedDevice; close: () => void }) => {
  const { t } = i18n;
  const [step, setStep] = useState(0);
  const { textColor } = Theme;
  const [root, setRoot] = useState('');
  const [bip32, setBip32] = useState('');

  const goTo = async (step: number, delay = 0) => {
    if (delay) await sleep(delay);
    setStep(step);
  };

  const authAndNext = async () => {
    let success = false;

    const autoAuth = async (pin?: string) => {
      try {
        const [root, bip32] =
          (await Authentication.decryptForever([device.shard.secrets.rootShard, device.shard.secrets.bip32Shard], pin)) || [];

        success = root && bip32 ? true : false;

        if (success) {
          setRoot(root);
          setBip32(bip32);
        }

        return success;
      } catch (error) {
        return false;
      }
    };

    await openGlobalPasspad({ fast: true, onAutoAuthRequest: autoAuth, onPinEntered: autoAuth });

    if (success) goTo(1);
  };

  const doDelete = () => {
    PairedDevices.removeDevice(device);
    close();
  };

  return (
    <ModalRootContainer>
      <BackableScrollTitles
        currentIndex={step}
        showBack={step > 0}
        onBackPress={() => goTo(step - 1)}
        iconColor={textColor}
        titles={[
          t('multi-sig-screen-paired-device'),
          t('multi-sig-modal-title-secret-key'),
          t('multi-sig-modal-title-delete-secret-key'),
        ]}
      />

      {step === 0 && (
        <DeviceOverview
          buttonTitle={t('button-view-secret')}
          deviceInfo={device.deviceInfo}
          createdAt={device.createdAt}
          onNext={authAndNext}
          expired={device.expired}
        />
      )}

      {step === 1 && (
        <SecretView distributionId={device.distributionId} device={device} bip32={bip32} root={root} onNext={() => goTo(2)} />
      )}

      {step === 2 && <DeleteConfirmationView message={t('multi-sig-modal-msg-delete-device')} onDone={doDelete} />}
    </ModalRootContainer>
  );
};
