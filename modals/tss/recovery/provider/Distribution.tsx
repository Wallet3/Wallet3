import Animated, { FadeInUp } from 'react-native-reanimated';
import { FadeInDownView, ZoomInView } from '../../../../components/animations';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { getScreenCornerRadius, useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../../utils/hardware';

import Aggregation from '../../aggregator/Aggregation';
import BackableScrollTitles from '../../../components/BackableScrollTitles';
import Button from '../../components/Button';
import DeviceInfo from '../../components/DeviceInfo';
import IllustrationSecureFiles from '../../../../assets/illustrations/misc/secure_files.svg';
import { KeyRecoveryProvider } from '../../../../viewmodels/tss/KeyRecoveryProvider';
import { KeyRecoveryRequestor } from '../../../../viewmodels/tss/KeyRecoveryRequestor';
import LottieView from 'lottie-react-native';
import ModalRootContainer from '../../../core/ModalRootContainer';
import { PairedDevice } from '../../../../viewmodels/tss/management/PairedDevice';
import PairedDevices from '../../../../viewmodels/tss/management/PairedDevices';
import { Passpad } from '../../../views';
import Preparations from '../requestor/Preparations';
import { ReactiveScreen } from '../../../../utils/device';
import RecoveryAggregation from '../requestor/RecoveryAggregation';
import { SafeViewContainer } from '../../../../components';
import ScrollTitles from '../../../components/ScrollTitles';
import { Service } from 'react-native-zeroconf';
import { ShardReceiver } from '../../../../viewmodels/tss/ShardReceiver';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../../../common/Modals';
import { secureColor } from '../../../../constants/styles';
import { useHorizontalPadding } from '../../components/Utils';

interface Props {
  vm: KeyRecoveryProvider;
  close: () => void;
  onCritical?: (critical: boolean) => void;
}

export default observer(({ vm, close, onCritical }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;

  const cornerRadius = useOptimizedCornerRadius();
  const marginHorizontal = useHorizontalPadding();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [busy, setBusy] = useState(false);
  const { verified, distributed } = vm;

  useEffect(() => onCritical?.(busy), [busy]);

  const send = async () => {
    setBusy(true);
    await openGlobalPasspad({ onAutoAuthRequest: vm.send, onPinEntered: vm.send, fast: true, closeOnOverlayTap: true });
    setBusy(false);
  };

  const verifyPairingCode = async (code: string) => {
    const success = await vm.verifyPairingCode(code);
    setFailedAttempts((p) => p + (success ? 0 : 1));
    return success;
  };

  return (
    <View style={{ flex: 1, width: ReactiveScreen.width - 12, marginHorizontal: -16 }}>
      {verified ? (
        <FadeInDownView style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {distributed ? (
              <ZoomInView>
                <LottieView
                  autoPlay
                  loop={false}
                  style={{ width: 250, height: 250 }}
                  source={require('../../../../assets/animations/check-verde.json')}
                />
              </ZoomInView>
            ) : (
              <IllustrationSecureFiles width={200} height={200} />
            )}
          </View>

          <Button
            disabled={busy}
            themeColor={secureColor}
            onPress={distributed ? close : send}
            title={distributed ? t('button-done') : t('button-shards-distribute')}
          />
        </FadeInDownView>
      ) : (
        <FadeInDownView
          style={{
            flex: 1,
            paddingBottom: useOptimizedSafeBottom(),
            paddingHorizontal: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ marginTop: 12, color: secondaryTextColor, fontWeight: '500' }}>
            {t('multi-sig-modal-connect-enter-pairing-code')}:
          </Text>

          <Passpad
            disableCancelButton
            passLength={4}
            failedAttempts={failedAttempts}
            style={{ padding: 0 }}
            numPadStyle={{ borderRadius: Math.max(cornerRadius, 12) }}
            onCodeEntered={verifyPairingCode}
          />
        </FadeInDownView>
      )}
    </View>
  );
});
