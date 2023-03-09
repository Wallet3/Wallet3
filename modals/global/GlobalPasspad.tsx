import {
  DefaultCornerRadius,
  useOptimizedCornerRadius,
  useOptimizedSafeBottom,
  useScreenCornerRadius,
} from '../../utils/hardware';
import { FadeInDownView, FadeInUpView } from '../../components/animations';
import React, { useEffect, useState } from 'react';

import { ModalMarginScreen } from '../styles';
import ModalRootContainer from '../core/ModalRootContainer';
import { Passpad } from '../views';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  passLength?: number;
  maxFailedAttempts?: number;
  onAutoAuthRequest?: () => Promise<boolean>;
  onPinEntered: (pin: string) => Promise<boolean>;
  close: () => void;
}

export default observer(({ passLength, onAutoAuthRequest, onPinEntered, close, maxFailedAttempts }: Props) => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const optimizedRadius = useOptimizedCornerRadius();
  const safeBottomPadding = useOptimizedSafeBottom();

  const onCodeEntered = async (code: string) => {
    const success = await onPinEntered(code);
    success ? setTimeout(() => close(), 0) : setFailedAttempts((prev) => prev + 1);

    if (!success && failedAttempts > (maxFailedAttempts ?? 3)) {
      close();
      return false;
    }

    return success;
  };

  useEffect(() => {
    onAutoAuthRequest?.().then((v) => v && close());
  }, []);

  return (
    <ModalRootContainer>
      <FadeInDownView style={{ flex: 1 }} delay={200}>
        <Passpad
          disableCancelButton
          passLength={passLength ?? 6}
          failedAttempts={failedAttempts}
          style={{ padding: 0, paddingBottom: safeBottomPadding }}
          numPadStyle={{ borderRadius: Math.max(optimizedRadius, 12) }}
          onCodeEntered={onCodeEntered}
        />
      </FadeInDownView>
    </ModalRootContainer>
  );
});
