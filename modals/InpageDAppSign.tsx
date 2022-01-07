import React, { useState } from 'react';

import { InpageDAppSignRequest } from '../viewmodels/hubs/InpageDAppHub';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sign from './compositions/Sign';
import Success from './views/Success';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer(({ msg, type, chainId, typedData, approve, reject }: InpageDAppSignRequest) => {
  const [verified, setVerified] = useState(false);
  const [themeColor] = useState(Networks.find(chainId)?.color ?? Networks.Ethereum.color);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      {verified ? (
        <Success />
      ) : (
        <Sign
          msg={msg}
          type={type}
          themeColor={themeColor}
          onReject={reject}
          onSignPress={approve}
          sign={approve}
          typedData={typedData}
        />
      )}
    </SafeAreaProvider>
  );
});
