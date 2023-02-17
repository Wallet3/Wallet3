import React, { useEffect, useState } from 'react';

import { Passpad } from '../views';
import RootContainer from '../components/RootContainer';
import { observer } from 'mobx-react-lite';

interface Props {
  passLength?: number;
  maxFailedAttempts?: number;
  onAutoAuthRequest?: () => Promise<boolean>;
  onPinEntered: (pin: string) => Promise<boolean>;
  close: () => void;
}

export default observer(({ passLength, onAutoAuthRequest, onPinEntered, close, maxFailedAttempts }: Props) => {
  const [failedAttempts, setFailedAttempts] = useState(0);

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
        style={{ paddingBottom: 12, paddingTop: 0 }}
        onCodeEntered={onCodeEntered}
      />
    </RootContainer>
  );
});
