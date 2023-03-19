import { FadeInDownView, ZoomInView } from '../../../../components/animations';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useOptimizedCornerRadius, useOptimizedSafeBottom } from '../../../../utils/hardware';

import Button from '../../components/Button';
import IllustrationSecureFiles from '../../../../assets/illustrations/misc/secure_files.svg';
import { KeyRecoveryProvider } from '../../../../viewmodels/tss/KeyRecoveryProvider';
import LottieView from 'lottie-react-native';
import { Passpad } from '../../../views';
import { ReactiveScreen } from '../../../../utils/device';
import Success from '../../../views/Success';
import Theme from '../../../../viewmodels/settings/Theme';
import i18n from '../../../../i18n';
import { observer } from 'mobx-react-lite';
import { openGlobalPasspad } from '../../../../common/Modals';
import { secureColor } from '../../../../constants/styles';

interface Props {
  vm: KeyRecoveryProvider;
  close: () => void;
  onCritical?: (critical: boolean) => void;
}

export default observer(({ vm, close, onCritical }: Props) => {
  const { t } = i18n;
  const { secondaryTextColor, appColor } = Theme;

  const cornerRadius = useOptimizedCornerRadius();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [busy, setBusy] = useState(false);
  const { verified, distributed } = vm;

  useEffect(() => onCritical?.(busy), [busy]);

  useEffect(() => {
    if (!distributed) return;

    const timer = setTimeout(close, 3000);
    return () => clearTimeout(timer);
  }, [distributed]);

  const send = async () => {
    setBusy(true);
    await vm.send();
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
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {distributed ? (
              <Success />
            ) : (
              <FadeInDownView>
                <IllustrationSecureFiles width={200} height={200} />
              </FadeInDownView>
            )}
          </View>

          <FadeInDownView delay={300}>
            <Button
              disabled={busy}
              themeColor={secureColor}
              onPress={distributed ? close : send}
              title={distributed ? t('button-done') : t('button-shards-distribute')}
            />
          </FadeInDownView>
        </View>
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
