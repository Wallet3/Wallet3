import React, { useState } from 'react';

import AddAsset from './dapp/AddAsset';
import { InpageDAppAddAsset } from '../viewmodels/hubs/InpageMetamaskDAppHub';
import Networks from '../viewmodels/Networks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from '../viewmodels/settings/Theme';
import { observer } from 'mobx-react-lite';
import styles from './styles';

export default observer((props: InpageDAppAddAsset & { close: Function }) => {
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
      <AddAsset {...props} themeColor={themeColor} approve={onApprove} reject={onReject} chainId={Networks.current.chainId} />
    </SafeAreaProvider>
  );
});
