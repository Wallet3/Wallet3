import React, { useState } from 'react';

import Authentication from '../viewmodels/Authentication';
import { InpageDAppSignRequest } from '../viewmodels/hubs/InpageMetamaskDAppHub';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sign from './compositions/Sign';
import Success from './views/Success';
import { observer } from 'mobx-react-lite';
import styles from './styles';

interface Props extends InpageDAppSignRequest {
  close: () => void;
}

export default observer(({ msg, type, chainId, typedData, approve, reject, close, account }: Props) => {
  const [verified, setVerified] = useState(false);
  const [themeColor] = useState(Networks.find(chainId)?.color ?? Networks.Ethereum.color);

  const onReject = () => {
    reject();
    close();
  };

  const onApprove = async (pin?: string) => {
    const result = await approve(pin);
    setVerified(result);
    if (result) setTimeout(() => close(), 1750);
    return result;
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {verified ? (
        <Success />
      ) : (
        <Sign
          msg={msg}
          type={type}
          themeColor={themeColor}
          onReject={onReject}
          onSign={() => onApprove()}
          sign={(p) => onApprove(p)}
          typedData={typedData}
          biometricEnabled={Authentication.biometricEnabled}
          account={account}
        />
      )}
    </SafeAreaProvider>
  );
});
