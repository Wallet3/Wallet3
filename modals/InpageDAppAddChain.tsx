import React, { useState } from 'react';

import AddChain from './dapp/AddChain';
import { InpageDAppAddEthereumChain } from '../viewmodels/hubs/InpageDAppHub';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer((props: InpageDAppAddEthereumChain & { close: Function }) => {
  const [themeColor] = useState(Networks.current.color);

  const onApprove = () => {
    props.approve();
    props.close();
  };

  const onReject = () => {
    props.reject();
    props.close();
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <AddChain {...props} themeColor={themeColor} approve={onApprove} reject={onReject} />
    </SafeAreaProvider>
  );
});
