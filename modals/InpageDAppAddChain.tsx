import React, { useState } from 'react';

import AddChain from './dapp/AddChain';
import { InpageDAppAddEthereumChain } from '../screens/browser/controller/InpageDAppController';
import Networks from '../viewmodels/core/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer((props: InpageDAppAddEthereumChain & { close: Function }) => {
  const [themeColor] = useState(Networks.current.color);
  const { backgroundColor } = Theme;

  const onApprove = () => {
    props.approve();
    props.close();
  };

  const onReject = () => {
    props.reject();
    props.close();
  };

  return (
    <SafeAreaProvider style={{ ...styles.safeArea, backgroundColor }}>
      <AddChain {...props} themeColor={themeColor} approve={onApprove} reject={onReject} />
    </SafeAreaProvider>
  );
});
