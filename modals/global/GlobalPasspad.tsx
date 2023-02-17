import { DefaultCornerRadius, useOptimizedCornerRadius, useScreenCornerRadius } from '../../utils/hardware';
import React, { useEffect, useState } from 'react';

import { ModalMarginScreen } from '../styles';
import { Passpad } from '../views';
import RootContainer from '../core/RootContainer';
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
  const { bottom } = useSafeAreaInsets();
  const optimizedRadius = useOptimizedCornerRadius();

  const onCodeEntered = async (code: string) => {
    const success = await onPinEntered(code);
    success && close();
    success ? setFailedAttempts(0) : setFailedAttempts((prev) => prev + 1);

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
    <RootContainer>
      <Passpad
        disableCancelButton
        passLength={passLength ?? 6}
        failedAttempts={failedAttempts}
        style={{ padding: 0, paddingBottom: bottom - 16 - ModalMarginScreen }}
        numPadStyle={{ borderRadius: Math.max(optimizedRadius, 12) }}
        onCodeEntered={onCodeEntered}
      />
    </RootContainer>
  );
});
